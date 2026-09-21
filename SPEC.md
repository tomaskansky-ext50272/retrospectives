# Zadání: Retrospektivní aplikace pro agilní tým

## 1. Kontext a cíl

Product Owner agilně organizovaného týmu (squad) potřebuje webovou aplikaci pro
vedení sprintových retrospektiv. Aplikaci používá celý tým společně, v reálném
čase, přes sdílený odkaz — bez nutnosti registrace nebo přihlašování.

Cílová skupina: 1 tým (řádově 5–12 lidí), retrospektivy probíhají typicky
jednou za sprint (2 týdny).

## 2. Uživatelský model

- **Žádné účty/přihlašování.** Účastník otevře odkaz na retro, zadá své jméno
  (uloží se lokálně v prohlížeči, aby ho nemusel zadávat opakovaně) a připojí
  se.
- **Žádné role s odlišnými právy.** Kdokoli z týmu může:
  - psát body do libovolné kategorie,
  - hlasovat,
  - slučovat (mergovat) duplicitní body,
  - spustit odpočet dané fáze,
  - posunout retro do další fáze,
  - založit nové retro.

## 3. Průběh retrospektivy (fáze)

Retro prochází pevně danými fázemi, viditelnými pro všechny účastníky
současně (žádný „host mode" vs. „participant mode" — všichni vidí totéž):

1. **Akční kroky z minula** — zobrazení akčních kroků z předchozí
   dokončené retrospektivy. U každého lze označit stav: `splněno` /
   `nesplněno` / `přenést dál` (přenesené položky se objeví v seznamu
   akčních kroků nového retra jako výchozí).
2. **Co se povedlo (pochvaly)** — psaní bodů, hlasování, slučování.
3. **Co se nedaří (ke zlepšení)** — psaní bodů, hlasování, slučování.
4. **Akční kroky na další období** — návrhy akcí, hlasování, slučování.
5. **Uzavření retra** — retro se označí jako dokončené a zamkne se pro
   úpravy; zůstává čitelné v historii.

Mezi fázemi 2–4 se opakuje stejný vzorec: **psaní → hlasování/slučování
→ posun dál**. Body jsou viditelné okamžitě, jak vznikají (bez anonymního
skrývání).

### Odpočet (timer)

- Před spuštěním psací části fáze zadá kdokoli z týmu délku odpočtu (v
  minutách, libovolně nastavitelné — žádná pevná výchozí hodnota v kódu).
- Odpočet se zobrazuje synchronně všem účastníkům (velké, dobře čitelné
  číslo).
- Po vypršení odpočtu aplikace jen upozorní (vizuálně/zvukově), ale
  fázi automaticky neuzavírá — přechod do další fáze je vždy ruční akce
  někoho z týmu.

### Hlasování

- Dot-voting: každý účastník má v rámci jedné kategorie (pochvaly /
  zlepšení / akční kroky) k dispozici **3 hlasy**.
- Hlasy lze rozdělit mezi více bodů, nebo dát víc hlasů jednomu bodu.
- Účastník vidí, kolik hlasů mu ještě zbývá, a může svůj hlas kdykoli
  odebrat (do konce dané fáze).
- Počet hlasů na osobu a kategorii by měl být konfigurovatelný konstantou
  v kódu (snadno změnitelný), ne nutně v UI.

### Slučování (merge) bodů

- Kdokoli může vybrat dva nebo více bodů ve stejné kategorii a sloučit je
  do jednoho.
- Sloučený bod: text lze upravit (typicky se ponechá jeden z původních
  nebo se přeformuluje), hlasy z původních bodů se sečtou.
- Původní (sloučené) body zůstávají v datech dohledatelné, ale v UI se
  nezobrazují samostatně — jen jako součást výsledného bodu.

## 4. Historizace

- Každá retrospektiva je samostatný záznam s vlastním datem/označením
  (např. „Sprint 24" nebo datum).
- Po dokončení retra zůstávají všechna data (body, hlasy, akční kroky i
  jejich pozdější stav splnění) trvale dostupná v historii — slouží jako
  podklad pro fázi 1 příštího retra i pro zpětný přehled vývoje týmu.
- Nová retrospektiva se zakládá jedním tlačítkem „Nové retro" — aplikace
  automaticky převezme nesplněné/přenesené akční kroky z posledního
  dokončeného retra.

## 5. Nefunkční požadavky

- **Realtime**: změny (nový bod, hlas, merge, změna fáze) se promítnou
  všem připojeným účastníkům do ~1 sekundy bez nutnosti obnovit stránku.
- **Bez vlastního serveru**: řešení musí být provozovatelné jako statická
  frontend aplikace + spravovaná (managed) backendová služba — žádný
  vlastní server, který by bylo nutné provozovat/aktualizovat.
- **Dostupnost odkudkoli**: aplikace běží na veřejně dostupné doméně,
  přístupná komukoli s odkazem (žádná firemní VPN/interní síť).
- **Bez citlivých dat**: aplikace neobsahuje žádná osobní/klientská data
  banky — pouze interní pracovní feedback týmu (jméno účastníka + text
  bodů). Nepodléhá tedy firemním regulacím na zpracování citlivých dat.
- **Responzivita**: použitelné i na tabletu/mobilu (lidé se občas
  připojují z telefonu).

## 6. Mimo rozsah (explicitně neřešit v první verzi)

- Víc týmů/více souběžných retro místností s odlišnou konfigurací —
  první verze počítá s jedním sdíleným prostorem pro jeden tým.
- Export do PDF/Confluence/Jira — může přijít později.
- Notifikace (e-mail, Slack) o novém retru.
- Sofistikovaná autentizace/autorizace.
