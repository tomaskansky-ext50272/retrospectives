# Architektura: Retrospektivní aplikace

## 1. Tech stack

| Vrstva            | Technologie                                   | Proč |
|--------------------|-----------------------------------------------|------|
| Frontend           | React + Vite + TypeScript                     | rychlý vývoj, dobrá podpora GitHub Copilotu |
| Styling            | Tailwind CSS                                  | rychlé skládání UI bez psaní vlastního CSS |
| Backend/data       | Supabase (Postgres + Realtime + REST/JS klient) | managed služba, žádný vlastní server, realtime „zdarma" |
| Hosting frontendu  | Vercel                                        | automatický deploy z GitHub repa, veřejná doména zdarma |
| Identita účastníka | `localStorage` (jméno + náhodné `participant_id`) | žádné účty, žádná autentizace |

Celý provoz: **GitHub repo → Vercel (build & hosting) → Supabase (data +
realtime)**. Žádná komponenta neběží na infrastruktuře uživatele ani firmy.

## 2. Datový model (Supabase / Postgres)

```sql
-- Jedna retrospektiva
create table retros (
  id uuid primary key default gen_random_uuid(),
  title text not null,                -- např. "Sprint 24"
  status text not null default 'active', -- active | completed
  current_phase text not null default 'previous_actions',
  -- previous_actions | praise | improve | actions | done
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Odpočet pro aktuální fázi (konfigurovatelná délka, sdílená všem)
create table phase_timers (
  id uuid primary key default gen_random_uuid(),
  retro_id uuid not null references retros(id) on delete cascade,
  phase text not null,
  duration_seconds int not null,
  started_at timestamptz not null default now()
);

-- Body v kategoriích "praise" / "improve" / "action"
create table cards (
  id uuid primary key default gen_random_uuid(),
  retro_id uuid not null references retros(id) on delete cascade,
  category text not null,             -- praise | improve | action
  text text not null,
  author_name text not null,
  merged_into uuid references cards(id), -- null = samostatný/aktivní bod
  created_at timestamptz not null default now()
);

-- Hlasy (dot-voting)
create table votes (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  voter_id text not null,             -- náhodné ID z localStorage, ne osobní údaj
  created_at timestamptz not null default now()
);

-- Akční kroky se sledovaným stavem napříč retry
create table action_items (
  id uuid primary key default gen_random_uuid(),
  retro_id uuid not null references retros(id) on delete cascade,
  source_card_id uuid references cards(id),
  text text not null,
  status text not null default 'open', -- open | done | carried_over
  carried_from_retro_id uuid references retros(id),
  created_at timestamptz not null default now()
);
```

Poznámky:
- **Merge** se řeší přes `merged_into`: UI zobrazuje jen karty, kde je
  `merged_into is null`; hlasy sloučené karty se při zobrazení sečtou
  (`select` s `union`/`in` na všechny karty se stejným cílem).
- **Limit hlasů** (3 na osobu na kategorii) se vynucuje v aplikační
  logice (kontrola počtu řádků ve `votes` pro daný `voter_id` +
  `retro_id` + kategorii karty před vložením nového hlasu). Konstanta
  `MAX_VOTES_PER_CATEGORY = 3` v jednom konfiguračním souboru.
- **Přenos akčních kroků**: při zakládání nového retra se zkopírují
  `action_items` s `status = 'open'` nebo `'carried_over'` z posledního
  `completed` retra jako nové řádky s `carried_from_retro_id` odkazujícím
  na původní retro.
- Row Level Security (RLS) v Supabase: pro první verzi stačí povolit
  `select`/`insert`/`update` všem (žádná autentizace) — je to interní
  nástroj bez citlivých dat. Do poznámky v kódu dát komentář, že jde o
  vědomé zjednodušení.

## 3. Realtime

Supabase Realtime (Postgres logical replication) — frontend se
subscribne na změny v tabulkách `cards`, `votes`, `retros`,
`phase_timers`, `action_items` filtrované podle `retro_id`. Žádný vlastní
WebSocket server není potřeba.

## 4. Struktura frontendového projektu

```
retro-app/
├── .github/
│   └── copilot-instructions.md
├── src/
│   ├── components/
│   │   ├── PhaseHeader.tsx        # název fáze, tlačítko "další fáze"
│   │   ├── Timer.tsx              # nastavení a zobrazení odpočtu
│   │   ├── Board.tsx              # sloupce s kartami pro danou fázi
│   │   ├── Card.tsx               # jedna karta: text, autor, hlasy, merge checkbox
│   │   ├── VoteButton.tsx
│   │   ├── MergeBar.tsx           # panel "sloučit vybrané" při vybrání 2+ karet
│   │   ├── PreviousActionsList.tsx
│   │   └── NameEntryModal.tsx     # vstupní modal se jménem účastníka
│   ├── hooks/
│   │   ├── useRetro.ts            # načtení + realtime subscribe na retro
│   │   ├── useCards.ts
│   │   ├── useVotes.ts
│   │   └── useParticipant.ts      # jméno + participant_id v localStorage
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── types/
│   │   └── index.ts               # TS typy odpovídající tabulkám výše
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/                # SQL migrace se schématem výše
├── .env.example
├── package.json
├── README.md
└── ARCHITECTURE.md                # tento soubor
```

## 5. Nasazení (manuální kroky, které nedělá agent, ale uživatel)

1. Založit projekt na [supabase.com](https://supabase.com) → zkopírovat
   `Project URL` a `anon public key`.
2. Spustit SQL migraci (schéma výše) v Supabase SQL editoru.
3. Vytvořit `.env` podle `.env.example` s `VITE_SUPABASE_URL` a
   `VITE_SUPABASE_ANON_KEY` (lokální vývoj).
4. Založit projekt na [vercel.com](https://vercel.com), propojit s GitHub
   repem, přidat stejné dvě proměnné prostředí v nastavení Vercelu.
5. Každý push do `main` větve automaticky nasadí novou verzi na veřejnou
   Vercel doménu.

## 6. Budoucí rozvoj přes Copilot Chat

Díky tomu, že datový model, struktura komponent i konvence jsou popsané
v `.github/copilot-instructions.md`, může uživatel zadávat další změny
(„přidej export do CSV", „přidej emoji reakce na karty") přímo v GitHub
Copilot Chatu bez nutnosti sám znovu vysvětlovat kontext projektu —
Copilot si instrukční soubor načte automaticky.
