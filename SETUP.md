# Setup — Lokální testování Retrospektivní aplikace

Tato dokumentace ti poradí, jak nastavit aplikaci pro lokální vývoj a testování se Supabase backendou.

## Předpoklady

- **Node.js** 18+ (skontroluj: `node --version`)
- **npm** 9+ (skontroluj: `npm --version`)
- **Git** (skontroluj: `git --version`)
- **Supabase účet** (zdarma na https://supabase.com)

## Krok 1: Klonuj repozitář

```bash
git clone https://github.com/csas-dev/beran-ci-agentic-onboarding.git
cd beran-ci-agentic-onboarding
```

## Krok 2: Vytvoř Supabase projekt

1. Jdi na https://supabase.com
2. Přihlášdej se nebo vytvoř nový účet (zdarma)
3. Klikni **"Create a new project"**
4. Vyplň:
   - **Project name**: `beran-retrospectives` (nebo jakékoli jméno)
   - **Database password**: Zapamatuj si (budeš ji potřebovat)
   - **Region**: Zvol nejbližší (nebo `eu-central-1`)
5. Klikni **"Create new project"** a čekej 2-3 minuty

## Krok 3: Získej Supabase credentials

Jakmile je projekt hotov:

1. Jdi do **Settings → API** (v levém menu)
2. Najdi sekci **"Project API keys"**
3. Zkopíruj:
   - **Project URL** (začíná `https://`)
   - **anon public** (veřejný klíč)

Příklad:
```
URL: https://xyzabc123.supabase.co
Key: eyJhbGc...xyz123...
```

## Krok 4: Nastav `.env` soubor

```bash
cd retrospectives
cp .env.example .env
```

Edituj `.env` (otevři v editoru):

```bash
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xyz123...
```

**⚠️ Pozor:** Soubor `.env` **necommituj** do Gitu! Je už v `.gitignore`.

## Krok 5: Spusť SQL migraci v Supabase

Teď musíš vytvořit databázové tabulky.

1. Otevři Supabase dashboard → **SQL Editor** (v levém menu)
2. Klikni **"New query"**
3. Otevři soubor `supabase/migrations/0001_init_schema.sql` v editoru
4. Zkopíruj **celý obsah**
5. Vlepš do SQL editoru v Supabase
6. Klikni tlačítko **▶️ Run** (nebo `Ctrl+Enter`)

Měl/a bys vidět zprávu "1 migrations executed" nebo podobně.

**Ověření:** V Supabase → **Table Editor** by měl vidět tabulky:
- `retros`
- `cards`
- `votes`
- `phase_timers`
- `action_items`

## Krok 6: Instaluj npm balíčky

```bash
npm install
```

Trvá cca 1-2 minuty (první instalace).

## Krok 7: Spusť dev server

```bash
npm run dev
```

Výstup:

```
  VITE v4.4.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Aplikace se automaticky otevře v prohlížeči na http://localhost:5173

## Krok 8: Testuj aplikaci

1. **Vstup do aplikace**: Zadej své jméno v modalu
2. **Přidej body**: V každé kategorii (Pochvaly / Zlepšení / Akce) si přidej text
3. **Hlasuj**: Klikni na kartu a hlasuj (3 hlasy na kategorii)
4. **Sloučuj**: Vyber 2+ karty, sloučuj je v nový text
5. **Posun fázi**: Klikni tlačítko "Pokračovat →" pro další fázi
6. **Uzavři**: Na poslední fázi uzavři retrospektivu

**Real-time sync**: Pokud otevřeš aplikaci ve 2 oknech najednou, uvidíš data synchronizovat v reálném čase!

## Troubleshooting

### "Cannot connect to Supabase"
- Zkontroluj `.env` — jsou tam správné values?
- Zkontroluj, že jsi v adresáři `retrospectives/` když spouštíš `npm run dev`

### "RLS policy violation"
- SQL migrace nebyla spuštěna správně
- Zkus znovu: SQL Editor → zkopíruj `0001_init_schema.sql` a spusť

### "Port 5173 is already in use"
Někdo jsi už spustil dev server. Buď:
- Zavři první instanci
- Nebo spusť na jiném portu: `npm run dev -- --port 5174`

### "Missing dependencies"
Zkus: `npm install` znovu, nebo `rm -rf node_modules && npm install`

## Další kroky

- **Nasazení na Vercel**: Viz [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vývoj**: Všechny změny se hot-reloadují (nemusíš restartovat)
- **Build pro produkci**: `npm run build`

---

**Máš otázky?** Zeptej se v repozitáři (Issues) nebo na týmovém chanílu. 🚀
