# Changelog

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
