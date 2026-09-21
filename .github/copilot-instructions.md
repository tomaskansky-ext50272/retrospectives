# Instrukce pro GitHub Copilot — Retrospektivní aplikace

Tento soubor patří do `.github/copilot-instructions.md` v rootu repozitáře.
Copilot Chat i Copilot Code Review si ho automaticky načítá jako kontext
pro celý projekt — dodržuj ho při každé změně, i v budoucích konverzacích.

## O projektu

Webová aplikace pro kolaborativní vedení agilních sprintových
retrospektiv v reálném čase. Detailní funkční zadání je v `SPEC.md`,
technická architektura a datový model v `ARCHITECTURE.md`. Před
jakoukoli netriviální změnou tyto dva soubory prostuduj a drž se jich;
pokud změna mění datový model nebo architekturu, aktualizuj i tyto
soubory, ne jen kód.

## Stack (nezaváděj alternativy bez domluvy)

- React + Vite + TypeScript
- Tailwind CSS pro styling
- Supabase (Postgres + Realtime) jako jediný backend
- Vercel jako hosting
- Žádný vlastní server, žádný Node/Express backend — veškerá logika buď
  ve frontendu, nebo v Supabase (SQL, RLS policies, případně Supabase
  Edge Functions, pokud je to nezbytné)

## Klíčové principy, které se nesmí porušit

1. **Žádné přihlašování.** Identita účastníka je jen jméno + náhodné
   `participant_id` v `localStorage`. Nezaváděj auth flow, pokud o to
   uživatel výslovně nepožádá.
2. **Realtime na prvním místě.** Každá operace, která mění data (nová
   karta, hlas, merge, změna fáze), musí se okamžitě promítnout všem
   ostatním připojeným klientům přes Supabase Realtime subscription —
   ne přes polling.
3. **Fáze retra jsou lineární a sdílené.** `retros.current_phase` je
   jediný zdroj pravdy o tom, co všichni účastníci právě vidí. Neukládej
   stav fáze jen lokálně na klientovi.
4. **Merge nikdy nemaže data.** Sloučená karta zůstává v tabulce `cards`
   s vyplněným `merged_into` — nikdy karty fyzicky nemaž (kvůli
   historizaci a dohledatelnosti hlasů).
5. **Konfigurovatelné hodnoty patří do konstant, ne natvrdo do JSX.**
   Např. `MAX_VOTES_PER_CATEGORY` v `src/lib/config.ts`. Délka odpočtu se
   naopak vždy zadává za běhu (není to konstanta).
6. **Bez citlivých dat.** Aplikace nesmí nikdy ukládat nic jiného než
   jméno účastníka a text jeho bodů. Nezaváděj sběr e-mailů, ID
   zaměstnance apod.

## Konvence kódu

- Komponenty: funkční React komponenty, TypeScript, žádné class
  komponenty.
- Datové operace (čtení/zápis do Supabase) drž v `src/hooks/`, ne přímo
  v komponentách — komponenty jen renderují a volají hooky.
- Typy v `src/types/index.ts` musí přesně odpovídat schématu v
  `ARCHITECTURE.md` — při změně schématu uprav oboje současně.
- SQL migrace ukládej do `supabase/migrations/` s popisným názvem
  souboru (např. `0001_init_schema.sql`).
- Komentáře a názvy proměnných v kódu piš anglicky (standardní
  konvence), UI texty pro uživatele piš česky.

## Deployment na produkci (Vercel)

**Status:** GitHub integrace není nastavena. Deploy se provádí manuálně.

### Manuální deployment z lokálního buildu (Ověřeno funkční)

Postup, který se osvědčil a používá se opakovatelně:

```bash
# 1. Jdi do adresáře aplikace
cd retrospectives

# 2. Vybuilduj aplikaci (vytvoří dist/)
npm run build

# 3. Deployuj na produkci do Vercelu
vercel deploy --prod --confirm
```

**Co se stane:**
- Vercel vezme obsah `dist/` složky
- Nasadí to do produkce na https://retrospectives-teal.vercel.app
- Vrátí potvrzení s URL (standardně bez dotazů díky `--confirm` flagu)

### Ověření nasazení

Po deploymentu zkontroluj:
```bash
# Aplikace by měla být dostupná
# https://retrospectives-teal.vercel.app
```

Nebo se podívej na Vercel dashboard:
- https://vercel.com/dashboard
- Projekt → `retrospectives-teal` → **Deployments**
- Měl/a bys vidět nový deployment se zelenou ikonou ✓

### Problémy

| Problém | Řešení |
|---------|--------|
| Build error | Spusť lokálně `npm run build` — musí projít bez chyb |
| `vercel` příkaz neznámý | Nainstaluj: `npm install -g vercel` |
| Deployment selhá | Zkontroluj Vercel logs: Deployments → klikni na deployment → **Logs** |
| Aplikace se nenačítá | Zkontroluj DevTools (F12) → Console, nebo zkontroluj `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` v Vercel → Settings → Environment Variables |

### Budoucí nastavení: GitHub integrace (ToDo)

Aby se deployment automatizoval:
1. Jdi na Vercel → projekt → **Settings** → **Git**
2. Klikni **"Connect Git Repository"**
3. Autorizuj a vyber `beran-ci-agentic-onboarding`
4. Production Branch: `master`
5. Ulož

Potom bude každý push do `master` automaticky deployován. Nyní zatím neexistuje.

---

## Jak přistupovat k dalším požadavkům v Copilot Chatu

Když uživatel (Product Owner, ne nutně vývojář) zadá požadavek na novou
funkci:
1. Nejdřív stručně shrň, jak to zapadá do stávající architektury (nebo
   upozorni, pokud to architekturu mění).
2. Navrhni nejmenší možnou změnu, která požadavek splní — nezaváděj
   nové závislosti/knihovny, pokud to není nutné.
3. Pokud změna vyžaduje úpravu databázového schématu, vytvoř novou SQL
   migraci (neuprovuj starou) a aktualizuj `ARCHITECTURE.md`.
4. Po implementaci ověř, že build (`npm run build`) prochází bez chyb.
