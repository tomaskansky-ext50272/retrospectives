# Deployment — Nasazení na Vercel

Tato dokumentace popisuje, jak nasadit retrospektivní aplikaci na Vercel (hostingová služba).

## Přehled nasazení

```
GitHub (master branch)
        ↓
   Vercel (CI/CD)
        ↓
   Build → Test → Deploy
        ↓
   https://app.vercel.app/
```

## Předpoklady

1. ✅ Lokální testování funguje (viz [SETUP.md](./SETUP.md))
2. ✅ Supabase projekt je vytvořený a DB schéma je spuštěné
3. ✅ Repozitář je na GitHubu
4. ✅ Máš přístup k https://vercel.com (zdarma)

## Krok 1: Přihlášdej se na Vercel

1. Jdi na https://vercel.com
2. Klikni **"Sign Up"**
3. Vyber si přihlášdení přes GitHub (nejjednodušší)
4. Autorizuj Vercel pro přístup k GitHubu

## Krok 2: Importuj projekt

1. Na Vercel dashboaru klikni **"Add New..."** → **"Project"**
2. Hledej **"beran-ci-agentic-onboarding"** repozitář
3. Klikni **"Import"**

## Krok 3: Nastav prostředí (Environment Variables)

Na stránce "Import Project":

1. V sekci **"Environment Variables"** přidej:
   ```
   VITE_SUPABASE_URL = https://xyzabc123.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGc...xyz123...
   ```
   (Stejné hodnoty jako v tvém lokálním `.env`)

2. Klikni **"Add"** pro každou proměnnou

## Krok 4: Nastav build settings

Vercel by měl automaticky detekovat:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Pokud ne, nastav ručně:

1. V sekci **"Build and Output Settings"** zkontroluj:
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

2. Pokud je aplikace v `/retrospectives` podadresáři (což je tvůj případ):
   - Klikni **"Root Directory"** a vyber `./retrospectives`

## Krok 5: Deploy

Klikni **"Deploy"** a čekej 2-5 minut.

Výstup:

```
✓ Deployed to Production
https://beran-retrospectives.vercel.app
```

## Ověření nasazení

1. Jdi na vygenerovaný odkaz (např. https://beran-retrospectives.vercel.app)
2. Měl/a bys vidět aplikaci
3. Ověř, že můžeš:
   - Zadat jméno
   - Přidat body
   - Hlasovat
   - Vidět real-time změny

## Automatic Deployments

Jakmile je projekt na Vercelu, každý push do `master` branche automaticky:

1. Triggeruje build
2. Spustí testy
3. Deployuje novou verzi

Takže stačí pushovat kód a Vercel se postará o zbytek! 🚀

## Custom Domain (volitelně)

Pokud chceš vlastní doménu (místo vercel.app):

1. Klikni na projekt → **Settings**
2. V sekci **"Domains"** klikni **"Add"**
3. Zadej svou doménu (např. `retro.tvafirma.cz`)
4. Vercel ti dá DNS instrukce
5. Nakonfiguruj DNS u svého registrátora

## Rollback (vrácení na starší verzi)

Pokud se nový deploy pokazí:

1. Jdi na projekt → **Deployments**
2. Najdi předchozí deployment (zelená ikona ✓)
3. Klikni **"Promote to Production"**

Hotovo! 🎉

## Troubleshooting

### Build Error: "Cannot find module"
- Zkontroluj, že všechny balíčky jsou v `package.json`
- Zkus lokálně: `npm run build`

### Deployment says "API key unauthorized"
- Zkontroluj environment variables — jsou tam správné?
- Jsou sensitive? Zkusí si v Vercel → **Settings** → **Environment Variables**

### Aplikace se nenačítá
- Zkontroluj v DevTools (F12) → Console pro errory
- Zkontroluj Vercel logs: projekt → **Deployments** → klikni na deployment → **Logs**

### Vercel free tier limits
Vercel free tier je dostačující pro testování. Pokud potřebuješ víc:
- Pays as you go (od $20/měsíc)
- Nebo použij jinou platformu (Railway, Fly.io, atd.)

## Další kroky

- **Monitoring**: Vercel → **Analytics** (zdarma)
- **Custom builds**: Vercel → **Project Settings** → **Build & Development Settings**
- **Secrets management**: Vercel → **Settings** → **Environment Variables**

---

**Máš nasazeno?** Sdílej odkaz! 🎉

Přímý odkaz na aplikaci: `https://tvůj-projekt.vercel.app`
