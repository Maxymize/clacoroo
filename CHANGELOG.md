# Changelog

## v1.0.09 — 2026-05-21

### Soft auto-update (notifica via GitHub Releases, no Apple Developer ID)

CLACOROO ora controlla automaticamente la presenza di nuove versioni
interrogando l'API GitHub Releases del repo `Maxymize/clacoroo`. Quando
ne viene rilevata una più recente, appare un banner sticky sotto la topbar
con tre azioni: **Apri pagina download**, **Ricorda più tardi**, **Salta
questa versione**.

**Architettura**
- `src/lib/updater.js` (NEW): `fetchJson()` con `node:https` (no deps esterne,
  timeout 8s), `parseVersion()` + `isNewerVersion()` semver compare numerico
  per-segmento (gestisce correttamente `1.0.10 > 1.0.9`), `checkLatestRelease()`
  che ritorna `{ available, latest, current, url, publishedAt, notes }`
- `main.js` handler IPC `check-updates`:
  - `force: false` (auto) → rispetta cooldown 1h tra check e flag
    `updateCheckDisabled` nello state
  - `force: true` (manuale da Impostazioni) → bypassa cooldown
  - Persiste `lastUpdateCheck` (timestamp) + `lastUpdateResult` (cache) in
    `~/.claude-control-room/state.json`
- `preload.js`: metodo `checkUpdates(force)` esposto

**UI**
- Banner topbar sticky con palette accent CLACOROO, dot pulsante, tre bottoni
- Comparato solo se versione remota != `skippedVersion` salvata in state
- "Ricorda più tardi" chiude il banner per la sessione corrente (riappare
  al prossimo avvio)
- "Salta questa versione" salva `skippedVersion` → niente più banner per
  quella versione specifica
- "Apri pagina download" apre la release URL via `shell.openExternal` (no
  download/install in-app — richiederebbe code signing macOS)

**Sezione Impostazioni "Aggiornamenti"**
- Riga "Controlla aggiornamenti" con timestamp ultimo check + bottone manuale
- Riga "Controllo automatico" con toggle ON/OFF (default ON, cooldown 1h
  tra check automatici per non spammare l'API)

**Frequenza**
- All'avvio dell'app (rispetta cooldown 1h se app riavviata troppo presto)
- Ogni 24h se l'app rimane aperta (`setInterval` nel renderer)

**Caveat repo privato**
- L'API GitHub Releases ritorna 404 per repo privati senza auth
- Per attivare il flow completo: rendere `Maxymize/clacoroo` pubblico
  oppure creare una release pubblica con `gh release create v1.0.10 ...`
- Codice già pronto: appena il repo diventa pubblico + c'è una release
  più recente di `app.getVersion()`, il banner appare automaticamente

## v1.0.08 — 2026-05-21

### Mascotte ridisegnata + brand subtitle + icona app rigenerata

**Mascotte**
- Forma "testa tonda" più chiara: bottom step finale 6px wide per silhouette ovale
- 4 zampette **chiaramente staccate** dal body (riga 12 = bottom testa più stretto,
  righe 13-14 = zampette indipendenti). Niente più effetto "fantasmino Pac-Man"
- Antenna in **grigio caldo** `#a8a299` (Anthropic mid-gray) invece di nero —
  ora visibile sul fondo dark dell'app
- Occhi 3x3 mantenuti con highlight cream top-left
- Animazioni `mascotStep` (passettino ogni 12s) + `mascotBlink` (palpebre ogni 5s) attive
- Dimensione sidebar: 32px → **40px** per migliore leggibilità

**Brand sidebar**
- Aggiunto subtitle "CLAude-code COntrol ROom" sotto il wordmark CLACOROO
- Font 8.5px text-muted, monoriga, allineato sotto il wordmark non sotto la mascotte
- Wrapper `.brand-text` con flex-direction column per stack vertical

**About panel**
- Copyright: "© 2026 MAXYMIZE"
- Subtitle: "CLAude-code COntrol ROom" (versione)
- Credits estesi con etimologia del nome

**Icona app .icns + .png**
- Rigenerati `assets/icon-source.svg`, `assets/icon.icns` (108KB),
  `assets/icon.png` (28KB) con la nuova mascotte
- PNG con alpha trasparente confermato (`sips hasAlpha: yes`)
- Iconset Apple-compliant 10 dimensioni (16→1024 @1x/@2x) rigenerato

**Nota cache macOS**
Se dopo install i bordini bianchi attorno all'icona Dock persistono, è cache
macOS stale. Eseguire `killall Dock; killall Finder` per refresh.

## v1.0.07 — 2026-05-21

### Sicurezza hardening (A) + UX nativa desktop (B)

Realizzati i task v1.0.03 originali (sicurezza Electron + UX nativa) che
erano rimasti pending dopo il riarrangiamento delle priorità sulle 7 idee.

**A — Sicurezza hardening (4 misure)**
- `sandbox: true` esplicito in `BrowserWindow.webPreferences` — il renderer
  process gira in sandbox completa, niente accesso diretto a Node API
- `setWindowOpenHandler` su `webContents` → blocca tutti i popup e
  ridirige le URL `https?:` a `shell.openExternal` (apertura nel browser)
- `webContents.on('will-navigate')` → blocca le navigazioni esterne dalla
  SPA, ridirige link esterni allo stesso modo (l'app non deve mai navigare)
- `app.requestSingleInstanceLock()` + handler `second-instance` → due
  lanci di CLACOROO portano in primo piano la finestra esistente invece
  di duplicare il processo

**B — UX nativa desktop**
- `src/lib/menu.js` (NEW): Application menu nativo macOS/Win con menu
  CLACOROO / File / Modifica / Vista / Finestra / Aiuto. Submenu Vista
  con shortcut Cmd+1..6 per switch sezione, DevTools, fullscreen
- Shortcut: `Cmd+R` ricarica dati · `Cmd+Q` quit · `Cmd+,` Impostazioni ·
  `Cmd+1..6` switch Dashboard/Plugin/Marketplace/Skill/Agent/Settings
- `setupAboutPanel()` con nome, versione, copyright, link repo GitHub
  (mostra il pannello About nativo macOS via menu "CLACOROO" → "About")
- `Notification` nativa su enable / disable / update / uninstall plugin
  (mostrata SOLO se la finestra non è in focus — niente popup duplicati
  quando l'utente sta già guardando l'app)
- Persistenza window bounds (width/height/x/y) + ultima sezione in
  `~/.claude-control-room/state.json`. L'app si riapre nella stessa
  dimensione/posizione/sezione di prima

**Refactor**
- `let mainWindow` spostata in alto perché serve al single-instance lock
- `src/preload.js`: nuovi metodi `onSwitchSection`, `onForceRefresh`,
  `showNotification` esposti
- `src/renderer/app.js`: nuova `switchToSection()` riusata da nav click +
  IPC dal menu, persiste `lastSection` ad ogni switch

## v1.0.06 — 2026-05-21

### Tipografia Anthropic-inspired (self-hosted, cross-platform)

CLACOROO ora usa font self-hosted ispirati alla tipografia ufficiale di
Anthropic per Claude. I font ufficiali (Styrene B + Tiempos) sono
proprietari/commerciali e non ridistribuibili. Le alternative scelte sono
le più vicine open-source disponibili (entrambe SIL OFL 1.1):

- **Inter** (al posto di Styrene B) — UI, sidebar, brand mark, KPI numeri,
  headings markdown, tour, dialog. Stack: Inter → Styrene fallback → system
- **Source Serif 4** (al posto di Tiempos) — body lungo (markdown preview
  SKILL.md/agent.md, tour-body narrative). Stack: Source Serif 4 → Tiempos
  fallback → Source Serif Pro → Lora → Georgia
- **System mono** invariato (SF Mono / Fira Code / Consolas / Monaco) per
  codice e identifier

Modifiche:
- src/renderer/fonts/ (NEW): InterVariable.woff2 + Italic, SourceSerif4Variable
  Roman + Italic (variable fonts ~1.5MB totali). Include licenze SIL OFL e
  NOTICE.md con attribuzione
- src/renderer/style.css: 4 @font-face dichiarazioni con font-display: swap,
  font-feature-settings cv02/cv03/cv04/cv11 per character variants Inter,
  letter-spacing -0.02em sui numeri grandi (KPI, marketplace count)
- src/renderer/index.html: CSP estesa con font-src 'self' esplicito
- package.json: rimosso esclusione `**/*.md` dai files perché la SIL OFL
  richiede la distribuzione dei file LICENSE con il software

Cross-platform compliance:
- Tutti i font sono WOFF2 variable, formato standard supportato da Chromium
  (Electron) identico su macOS / Windows / Linux
- Nessuna dipendenza da font system installati dell'OS
- Nessuna chiamata a CDN remoti (CSP-compliant)

## v1.0.05 — 2026-05-20

### Sette feature locali (goal mode)

Realizzate in sequenza 7 idee approvate dall'utente, ciascuna implementata,
testata via `npm start`, revisionata con skill `simplify` (3 agent paralleli
per reuse/quality/efficiency) e committata separatamente. Tutte le idee
seguono linee guida Karpathy (simplicity first, surgical changes, no
abstractions per single-use code) e CLAUDE.md (zero runtime deps, execFile
con array, textContent/createElement mai innerHTML).

- **Idea #2**: bottoni 📁 "Apri nel Finder" + 📝 "Apri in VS Code" su
  ogni plugin card (riusa `scanCache.path` invece di re-walk FS)
- **Idea #4**: Activity log in `~/.claude-control-room/activity-log.json`
  (max 50 entry), sub-section "Attività recenti" in Dashboard
- **Idea #6** (riformulata): Plugin Validator in Impostazioni che usa
  `claude plugins validate <path>` (il comando link ipotizzato non esiste)
- **Idea #7**: Onboarding tour first-run con 5 step, Esc/frecce keyboard,
  guard double-modal, persistenza `onboardingShown` in state.json, bottone
  "Riavvia tour" in Impostazioni
- **Idea #3**: Health check su SKILL.md / agent.md (frontmatter YAML
  parsabile, name+description presenti, description ≥ 10 char) con badge
  ⚠ nel chip + KPI Dashboard "Health issues"
- **Idea #5**: Export/import snapshot `.clacoroo` (marketplaces + plugin +
  blocklist) con preview diff, apply sequenziale via CLI (no parallel per
  evitare race su known_marketplaces.json)
- **Idea #1**: Visualizzatore SKILL.md / agent.md inline — click chip apre
  modal con parser markdown DOM-based (no innerHTML, solo createElement),
  supporta headings, paragrafi, bold/italic/code, link, code fenced, hr

### Architettura refactor

Estratti helper in moduli `src/lib/`:
- `markdown.js` — parseFrontmatter + checkMarkdownHealth (per idea #3)
- `state.js` — readState/writeState/appendActivity (centralizza state I/O)
- `snapshot.js` — buildSnapshot + diffSnapshot (puro, testabile)

CLAUDE.md: limite `main.js` alzato da 400 a 450 righe (legittimo dopo
aggiunta 8+ IPC handler + lib/ già estratti per logica pura).

## v1.0.04 — 2026-05-20

### Packaging cross-platform (anticipato dalla roadmap, era prevista v1.0.04 originale)

**Asset icone**
- `assets/icon-source.svg` — wrapper SVG quadrato (1024×1024) con mascotte centrata su background squircle Claude Dark `#141413`
- `assets/icon.icns` — 109KB, iconset Apple compliant (10 dimensioni 16→1024 + @2x)
- `assets/icon.png` — 1024×1024 per Linux + fallback Windows
- Pipeline generazione: `qlmanage` (SVG → PNG 1024) → `sips` (resize multi-size) → `iconutil -c icns`

**electron-builder config estesa**
- **macOS**: target `.dmg` + `.zip` per arm64+x64, `hardenedRuntime: true`, `gatekeeperAssess: false`, entitlements `build/entitlements.mac.plist`, `darkModeSupport: true`, DMG con window 540×380 + drag-to-Applications layout
- **Windows**: NSIS `oneClick: false` con scelta cartella + portable target, icon, `requestedExecutionLevel: 'asInvoker'`
- **Linux**: AppImage + .deb + .rpm, desktop entry con category Development/Utility
- File `build/entitlements.mac.plist` con entitlements minime Electron (allow-jit, disable-library-validation, inherit per child process `claude` CLI)
- ASAR archive abilitato + exclude di `docs/`, `*.md`, test files dal package

**Script npm**
- `npm run build` → `electron-builder --mac` (default per uso locale Mac)
- `npm run build:mac/win/linux` per build mirati
- `npm run dist` → `-mwl` (tutte le piattaforme, richiede toolchain)

### Skipped (rimandato a v1.0.05+)
- Code signing macOS (Apple Developer ID $99/anno)
- Notarization Apple
- Windows code signing
- Full auto-update via `electron-updater`

## v1.0.02 — 2026-05-19

### Rebrand → CLACOROO + brand identity Claude-inspired

- **Rename app**: "Claude Control Room" → **CLACOROO** (`CLA`ude `CO`de Cont`RO`l `ROO`m, il `CO` si sovrappone tra Code e Control)
- **Nuova palette CSS**: accent viola `#7c3aed` rimosso, sostituito con arancione Claude `#d97757` + neutri caldi (Claude Dark `#141413`, cream `#faf9f5`, mid `#a8a299`)
- **Nuova mascotte CLACOROO** (`src/renderer/clacoroo.svg`): sprite pixel-art 14×16 disegnata SOLO con `<rect>` (no path / no curve), 4 zampette, antenna con LED verde Anthropic (`#788c5d`) che segnala "online", glint bianco negli occhi
- **Integrazione mascotte**: sostituisce l'icona testuale ◎ nella sidebar brand e lo spinner generico nel loading screen, con animazione `mascotBob` rispettosa di `prefers-reduced-motion`
- **Sidebar brand**: nuovo wordmark "CLA**CO**ROO" con il `CO` evidenziato in arancione
- **Tipografia**: font stack aggiornato per cercare Styrene B (fallback Inter / Geist / system)
- **CSS tokens**: introdotti `--accent-soft`, `--accent-glow`, `--accent3` (pressed); badge `b-skill` ora usa la palette accent invece del viola
- **Toast info**: ora usa l'arancione CLACOROO invece del viola
- **Aggiornata CSP** per consentire `data:` images (preparazione per asset inline futuri)
- **CLAUDE.md**: riscritto da template Python/FastAPI (errato per questo progetto) a template Electron + Vanilla JS specifico, con sezione brand identity completa e bug critici codificati come regole
- **README**: riscritto in italiano con etimologia CLACOROO, sezione brand e regole sicurezza
- **package.json**: `name` → `clacoroo`, `productName` → `CLACOROO`, `appId` → `com.maxymize.clacoroo`, repository → `Maxymize/clacoroo`

### Nessuna regressione comportamentale
- Tutti i bug fix di v1.0.01 sono conservati (formato v2 plugins object, agent come `.md`, source marketplace github/git, `execFile` con array)

## v1.0.01 — 2026-05-19

### Primo rilascio
- Setup progetto Electron con architettura main/preload/renderer
- Auto-rilevamento directory Claude Code (macOS/Linux/Windows)
- Auto-rilevamento binario `claude` dal PATH
- Lettura live di `installed_plugins.json`, `blocklist.json`, `known_marketplaces.json`, cache plugin
- **Dashboard**: KPI (plugin attivi, disattivati, marketplace, skill, agent, token always-on)
- **Plugin**: grid card con toggle enable/disable, update, uninstall, ricerca full-text, filtri per status e marketplace
- **Marketplace**: card espandibili con lista plugin contenuti, aggiornamento, rimozione
- **Skill / Agent**: browser ricercabile di tutte le skill e agent installati
- **Impostazioni**: percorsi, statistiche, configurazione manuale binario claude
- Auto-refresh UI al cambio di file di configurazione
- Toast notification per feedback operazioni
- Sicurezza: `contextIsolation`, `execFile` (no shell injection), validazione ID
- Cross-platform: macOS (arm64/x64), Windows, Linux
- Documento di handoff `docs/doc-tecnico_handoff.html` con architettura, IPC API, bug risolti e roadmap
