<div align="center">

<img src="assets/logo-readme.png" width="540" alt="CLACOROO — Claude Code Control Room" />

**Pannello di controllo visuale per [Claude Code](https://github.com/anthropics/claude-code)**
Gestisci plugin, marketplace, skill, agent, MCP server, hook, statistiche, quote e API key con una UI desktop nativa — senza memorizzare comandi CLI.

[![Electron](https://img.shields.io/badge/Electron-36-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-141413)](#requisiti)
[![License: AGPL v3+](https://img.shields.io/badge/License-AGPL%20v3+-d97757.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.76-d97757.svg)](CHANGELOG.md)

**💛 Supporta il progetto:**
[![Sponsor su GitHub](https://img.shields.io/badge/Sponsor-GitHub-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/Maxymize)
[![Buy Me a Coffee](https://img.shields.io/badge/Offrimi_un-Caff%C3%A8-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/maxymize)
[![Dona via PayPal](https://img.shields.io/badge/Dona-PayPal-00457C?logo=paypal&logoColor=white)](https://paypal.me/maxymizebusiness)

[🇬🇧](README.md) · 🇮🇹

</div>

---

## Cos'è CLACOROO

**CLA**ude **CO**de **CO**ntrol **ROO**m è una app desktop Electron che mette una UI grafica sopra ogni file di configurazione che Claude Code legge in `~/.claude/`. Il `CO` arancio del wordmark si sovrappone fra **Co**de e **Co**ntrol — un piccolo gioco visivo che racconta l'idea: la cabina di regia per Claude Code, gestita dalla mascotte **CLACOROO**, un esserino pixel-art a 4 zampe con un'antenna LED verde (Anthropic Green) accesa.

Prima di CLACOROO, gestire plugin, marketplace, skill, agent, MCP server, hook e configurazione di Claude Code richiedeva di:
- Memorizzare e digitare comandi CLI `claude plugins enable/disable/install/update ...`
- Editare manualmente JSON sparsi in `~/.claude/`
- Aprire la TUI di Claude Code interattiva per controllare quote, account, usage

CLACOROO fa tutto a colpo di click in una sola app desktop nativa, con osservabilità live, e mantiene la sicurezza completa delle credenziali OAuth originali di Claude Code (mai sovrascritte).

## Caratteristiche principali

### 🏠 Dashboard
Vista a colpo d'occhio di ciò che conta:
- Stima contesto: skills (frontmatter index) · system prompt · agents · memory files · MCP server · spazio libero, su 200K token
- Quote Claude live: barre Session (5h), Weekly (7d), Weekly Sonnet con percentuale e tempo al reset
- 9 KPI installazione (plugin attivi/disattivati, marketplace, skill, agent, MCP connessi, health issues, token always-on)
- 9 KPI utilizzo Claude Code (sessioni, messaggi, token totali, valore API stimato, giorni attivi, streak, ora di punta, modello preferito)

### 🏪 Marketplace
- Lista marketplace registrati con count `X/Y installati` per ognuno
- Card espandibili con modal "Plugin del marketplace" che mostra ogni plugin (anche non installato)
- **Add Marketplace** dal pannello: input source (shorthand GitHub `user/repo` · URL git · path locale)
- **Install Plugin** direttamente dal modal del marketplace con preview costo token
- Aggiornamento/rimozione marketplace · 5 modalità di ordinamento (aggiunti recenti, aggiornati recenti, ecc.)

### 🧩 Plugin
- Toggle enable/disable singolo · update · uninstall
- Ricerca full-text con filtri per stato e marketplace
- Modal "Contenuto plugin": header con id/marketplace/versione, summary numerico (skills/agents/MCP/hook/tok), lista cliccabile di skill e agent, hook event dettagliati (con conteggio matcher/handler), bottoni "Apri nel Finder" e "Apri in editor" (VS Code · Cursor · Antigravity · Sistema)
- Badge scope `globale` (blu) / `locale: nome-progetto` (verde) — supporto multi-progetto

### ⚡ Skill · 🤖 Agent
- Browser ricercabile su tutte le skill e agent (globali + progetti tracciati)
- Click su una skill apre il viewer markdown inline (DOM-based, no innerHTML)
- Badge ⚠ "Health issue" su skill/agent con frontmatter mancante o malformato

### 🛠 MCP Server
- Lista tutti gli MCP server configurati con stato Connected / Needs Auth / Errore
- Card stile marketplace per ogni server con transport (HTTP / stdio / SSE), URL/comando, origine
- Filtri per stato e tipo (claude.ai globale / dai plugin)
- Bottone "Aggiorna stato live" rilancia health-check ufficiale Claude Code
- KPI "MCP connessi" in Dashboard (X/Y connessi)

### 📊 Stats
- Tab Overview: 8 KPI + heatmap stile Claude Desktop (52 settimane × 7 giorni)
- Tab Modelli: barre token per modello (input/output/cache) + istogramma giornaliero con tooltip per-modello
- Tab Per-progetto: lista progetti con sessioni, messaggi, token aggregati + design KPI-style
- Filtri Tutto / 30g / 7g per tutti i KPI (allineati a `claude /stats`)

### ⚙ Config standalone
- Editor visuale di `~/.claude/settings.json`: modello, tema (compreso dark-daltonized/light-ansi), lingua risposte, Always Thinking, Voice (campo nested `voice.enabled`), Effort slider 5 pallini (low → max)
- Aggiornamento istantaneo + live reload settings da filesystem watcher

### 🔐 Account Claude + API key
- Pannello Account con badge piano (Max / Pro / Team), email, organizzazione, ID org, auth method, API provider
- Status badge live: 🟢 Connesso / 🔴 Disconnesso (quando token OAuth scade e refresh fallisce 401/403)
- Bottone **"↗ Login terminale"** appare automaticamente quando auth è broken — apre il terminale integrato CLACOROO ed esegue `claude auth login`
- Quote sessione/settimana cross-platform (macOS Keychain / Linux file fallback / Windows file fallback)
- **API key Claude** dedicato (alternativa a OAuth subscription): input + test connessione + storage cifrato cross-platform (macOS Keychain · Linux libsecret/file 600 · Windows DPAPI) + integrazione ufficiale `apiKeyHelper` di Claude Code via script helper chmod 700 + scrittura `settings.json`

### 📟 Terminale integrato (Pack B v1.0.67+)
- Drawer fisso in basso multi-tab (xterm.js + node-pty)
- Status dot per tab: 🟢 idle / 🟠 busy / 🔴 dead (basato su attività onData)
- Label tab = cwd corto (`~`, `~/Sviluppo`, `~/…/clacoroo`) con live polling 3s (lsof su macOS, `/proc/<pid>/cwd` su Linux)
- Persistenza tab fra riavvii (altezza drawer + lista tab con cwd salvato)
- Shortcut: `Cmd+\`` toggle drawer · `Cmd+T` nuova tab
- Tema CLACOROO: cursor arancio, bg `#0d0c0b`, palette Anthropic per ANSI colors

### ⚡ Soft auto-update
- Check at startup + ogni 24h via GitHub Releases API
- Footer sidebar: pallino 🟢 verde / 🟠 arancio + bottone "UPDATE" inline
- Banner sticky topbar "Nuova versione X.Y.Z disponibile"
- Click → apre pagina release nel browser, niente download/install in-app (richiede Apple Developer ID + notarization per silent updates)

### 🎨 UX polish
- Command palette globale `Cmd+K` (fuzzy search plugin/skill/agent/marketplace/azioni)
- Sidebar "Recenti" con timeline ultime attività
- Pill account sempre visibile in sidebar (badge piano + email)
- Notifiche native macOS su azioni plugin (solo se app non in focus)
- Changelog viewer in-app con badge colorati per categoria (FEATURE/FIX/IMPROVEMENT/SECURITY/REFACTOR/DOCS/CHORE)
- Auto-refresh UI quando file `~/.claude/` cambiano dall'esterno (`fs.watchFile`)

## Auto-refresh
La UI si aggiorna sola quando i file di configurazione di Claude Code cambiano (`fs.watchFile` cross-platform), senza dover riavviare l'app.

## Requisiti

- **Node.js** 18+ e **npm** — [nodejs.org](https://nodejs.org)
- **Claude Code** CLI installato e raggiungibile (`claude` nel `PATH`) — [installazione Claude Code](https://docs.anthropic.com/claude-code)

## Installazione

### Da release pre-built (macOS)

Vai su [Releases](https://github.com/Maxymize/clacoroo/releases) e scarica:
- `CLACOROO-X.Y.Z-arm64.dmg` per Mac Apple Silicon (M1/M2/M3/M4)
- `CLACOROO-X.Y.Z-x64.dmg` per Mac Intel

Apri il `.dmg`, trascina CLACOROO nella cartella Applications.

> **macOS Gatekeeper** — il binario è firmato ad-hoc (senza Apple Developer ID + notarization, vedi Pack E in [TASK.md](TASK.md)). Alla prima apertura macOS chiederà **"Sei sicuro di voler aprire questa app scaricata da Internet?"** → click **Apri**. Nessun comando Terminal richiesto.
>
> Se invece compare **"CLACOROO è danneggiato e non può essere aperto"** (raro, succede se il DMG stesso è stato marcato dal browser), esegui questo comando in Terminale prima di aprire:
> ```bash
> xattr -cr ~/Downloads/CLACOROO-*-arm64.dmg
> ```
> Poi riapri il DMG e procedi normalmente.

### Da sorgenti (tutte le piattaforme)

```bash
git clone https://github.com/Maxymize/clacoroo.git
cd clacoroo
npm install
npm start
```

Per generare i pacchetti distribuibili:

```bash
# macOS .dmg (arm64 + x64) — richiede librsvg via brew + dmgbuild via pip
npm run build

# Windows .exe (NSIS + portable) — richiede toolchain Win o build da Windows
npm run build:win

# Linux .AppImage + .deb + .rpm — richiede build da Linux per node-pty rebuild
npm run build:linux
```

L'output viene generato in `dist/`.

## Come funziona

CLACOROO auto-rileva la directory di configurazione di Claude Code:

| OS | Path |
|---|---|
| macOS / Linux | `~/.claude/` |
| Windows | `%APPDATA%\Claude\` |

**Lettura** (diretta da filesystem):
- `installed_plugins.json` — plugin installati (formato v2 con chiavi `"plugin@marketplace"`)
- `blocklist.json` — plugin disabilitati
- `known_marketplaces.json` — marketplace registrati
- `settings.json` — configurazione (modello, tema, voice, lingua, plugin abilitati)
- `cache/` — sorgenti plugin con skill (subdirectory) e agent (file `.md`)
- `stats-cache.json` — heatmap, token per modello, sessioni totali, streak
- `projects/<proj>/<session>.jsonl` — usage per turn (input/output/cache tokens)

**Scrittura** (mai diretta sui JSON di plugin, sempre via CLI):
- `claude plugins enable|disable|uninstall|update <id>`
- `claude plugins marketplace add|remove|update <name>`
- `claude plugins install <plugin>@<marketplace>`

`settings.json` viene modificato direttamente (operazione safe, atomic write + filesystem watcher per re-sync).

Funziona completamente offline dopo l'installazione. Tutti i dati sono locali. CLACOROO **non sovrascrive mai** il Keychain di Claude Code (legge le credenziali OAuth per le quote, ma non le modifica).

## Architettura

```
src/
├── main.js              ← processo Electron principale: I/O, IPC, CLI, fs.watch
├── preload.js           ← bridge sicuro contextBridge → window.claudeAPI
├── lib/
│   ├── account.js       ← Claude account info via `claude auth status --json`
│   ├── apikey.js        ← API key storage cifrato cross-platform (Keychain/libsecret/DPAPI)
│   ├── changelog.js     ← Parser sintetico con badge category
│   ├── markdown.js      ← Markdown → DOM (no innerHTML)
│   ├── mcp.js           ← MCP server health check
│   ├── menu.js          ← Application menu nativo macOS
│   ├── pricing.js       ← Stima valore API in USD (prezzi pubblici Anthropic)
│   ├── pty.js           ← Manager pseudo-terminale (node-pty)
│   ├── snapshot.js      ← Export/import .clacoroo snapshot
│   ├── state.js         ← Persistenza state.json + activity log
│   ├── stats.js         ← Aggregazione token, heatmap, per-progetto
│   ├── updater.js       ← Soft auto-update GitHub Releases API
│   └── usage.js         ← Quote OAuth + refresh token
└── renderer/
    ├── index.html       ← shell SPA (sidebar + content)
    ├── style.css        ← design system CLACOROO
    ├── app.js           ← logica SPA: state → loadData → render
    ├── clacoroo.svg     ← mascotte pixel-art (solo <rect>)
    ├── clacoroo-blink.svg ← variante blink (animazione)
    ├── fonts/           ← Inter + Source Serif 4 + Press Start 2P (self-hosted)
    ├── lib/
    │   └── term.js      ← Wrapper xterm.js per tab del drawer
    └── vendor/
        └── xterm/       ← xterm.js + 2 addon vendored (no CDN)
```

Documento di handoff tecnico completo: [`docs/doc-tecnico_handoff.html`](docs/doc-tecnico_handoff.html).

## Sicurezza

CLACOROO segue le best practice Electron moderne:

- ✅ `contextBridge` con `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- ✅ Tutte le chiamate CLI usano `execFile` con array di argomenti (zero rischio shell injection)
- ✅ ID plugin, nomi marketplace, source URL validati con regex prima di qualsiasi chiamata
- ✅ DOM construction con `createElement` + `textContent`, mai `innerHTML` con dati dinamici
- ✅ CSP rigida: `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `font-src 'self'`, `img-src 'self' data:` — nessun CDN remoto
- ✅ API key Claude (modalità pay-per-use): storage cifrato cross-platform (macOS Keychain · Linux libsecret · Windows DPAPI), chiave mai loggata né mostrata in chiaro nel renderer, helper script chmod 700, service Keychain dedicato `com.maxymize.clacoroo.apikey` (separato da Claude Code)
- ✅ Soft auto-update: lettura GitHub Releases API, no auto-install (richiede signing per silent updates)
- ✅ Single-instance lock + `setWindowOpenHandler` blocca popup + `will-navigate` blocca navigazione esterna
- ✅ Dipendenze runtime ridotte al minimo: solo `node-pty` (terminale) + `@xterm/xterm` & 2 addon (renderer)

## Brand

CLACOROO usa una palette ispirata a Claude (Anthropic) ma differenziata:

| Token | Hex | Uso |
|---|---|---|
| Claude Orange | `#d97757` | Accent primario, brand mark, CTA |
| Claude Dark | `#141413` | Background principale |
| Surface | `#1e1c1a` | Card, sidebar |
| Cream | `#faf9f5` | Testo principale |
| Anthropic Green | `#788c5d` | LED mascotte, status success |
| Anthropic Blue | `#6a9bcc` | Accent secondario |

La mascotte CLACOROO è disegnata interamente con `<rect>` SVG (zero path / zero curve), pixel-art retro come Clawd ma con un'antenna LED verde "control room online" che la distingue.

Font self-hosted (SIL OFL):
- **Inter** — UI, brand, KPI
- **Source Serif 4** — body markdown
- **Press Start 2P** — wordmark CLACOROO (sidebar + DMG installer)

## Stack tecnico

**Electron 36** · **Vanilla JS** (no framework) · **Node.js 18+** · `contextBridge` + `contextIsolation` · `execFile` (no shell) · `fs.watchFile` per auto-refresh · **node-pty** + **@xterm/xterm** per terminale integrato · **dmgbuild** (Python) per installer DMG · **electron-builder** per packaging

## Roadmap

Vedi [`TASK.md`](TASK.md) per il piano completo.

In sviluppo:
- **Pack B** estensioni — Skill launcher inline (bottone ▶ su ogni skill esegue `claude -p "<skill>"` nel terminale)
- **Pack C** — Insight + analytics (token cost per plugin, top-N chart, dependency tree)
- **Pack D** — Tema light + switch lingua UI
- **Pack E** — Distribuzione full-auto (Apple Developer ID, notarization, electron-updater, CI/CD multi-OS)

## Contribuire

Convenzione commit: messaggio prefissato con la versione, es. `v1.0.72 — descrizione`.
Versionamento: solo l'ultima cifra `1.0.xx` (vedi [`CLAUDE.md`](CLAUDE.md) per le regole complete).

## Licenza

**GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**

Copyright © 2026 **MAXYMIZE** (Maximilian Giurastante &lt;info@maxymizebusiness.com&gt;)

CLACOROO è software libero: puoi ridistribuirlo e/o modificarlo secondo i termini della GNU Affero General Public License come pubblicata dalla Free Software Foundation, versione 3 della licenza o (a tua scelta) qualsiasi versione successiva.

CLACOROO è distribuito nella speranza che sia utile, ma SENZA ALCUNA GARANZIA; senza nemmeno la garanzia implicita di COMMERCIABILITÀ o IDONEITÀ PER UN PARTICOLARE SCOPO. Vedi la GNU Affero General Public License per maggiori dettagli — testo completo in [`LICENSE`](LICENSE) o su [gnu.org/licenses/agpl-3.0](https://www.gnu.org/licenses/agpl-3.0).

### Cosa significa AGPL-3.0 in pratica

- ✅ **Puoi** usarlo, copiarlo, modificarlo e ridistribuirlo gratuitamente
- ✅ **Puoi** usarlo in progetti personali e commerciali interni
- ⚠️ **Devi** rilasciare con la stessa licenza qualsiasi opera derivata che distribuisci
- ⚠️ **Devi** rendere disponibile il codice sorgente se offri CLACOROO (o un derivato) come servizio di rete accessibile a terzi
- ❌ **Non puoi** trasformarlo in un prodotto SaaS chiuso senza ridistribuire il codice modificato

Per usi commerciali che non possono rispettare i termini AGPL, è disponibile una licenza commerciale separata su richiesta: scrivi a `info@maxymizebusiness.com`.

---

## ☕ Supporta il progetto

Se CLACOROO ti torna utile nel tuo workflow quotidiano, considera di supportarne lo sviluppo continuo. Scegli il canale che preferisci — vanno tutti a finanziare lo stesso progetto:

[![Sponsor su GitHub](https://img.shields.io/badge/Sponsor_su-GitHub-EA4AAA?logo=githubsponsors&logoColor=white&style=for-the-badge)](https://github.com/sponsors/Maxymize)
[![Buy Me a Coffee](https://img.shields.io/badge/Offrimi_un-Caff%C3%A8-FFDD00?logo=buymeacoffee&logoColor=black&style=for-the-badge)](https://buymeacoffee.com/maxymize)
[![Dona via PayPal](https://img.shields.io/badge/Dona_via-PayPal-00457C?logo=paypal&logoColor=white&style=for-the-badge)](https://paypal.me/maxymizebusiness)

### Quale canale scegliere?

| Canale | Ideale per | Note |
|---|---|---|
| 💖 **GitHub Sponsors** | Developer attivi su GitHub, supporto ricorrente mensile | 0% commissioni, GitHub raddoppia 1:1 le donazioni nei primi 12 mesi |
| ☕ **Buy Me a Coffee** | Micro-donazioni una tantum, audience creator/community | UX familiare "offrimi un caffè", supporta anche membership ricorrenti |
| 💳 **PayPal** | Utenti tradizionali / italiani, aziende, chiunque abbia già un conto PayPal | Nessun nuovo account da creare, trasferimento immediato |

### A cosa servono le donazioni

- 🍎 Iscrizione Apple Developer Program (binari firmati + versione Mac App Store)
- 🛠 Sviluppo continuo, bug fix e nuove feature
- 📡 Infrastruttura (GitHub Releases, hosting, futuro cloud sync)
- 💛 Tempo dedicato al supporto della community (issue, PR review, Discord)

CLACOROO **è e resterà sempre gratuito e open source** (AGPL-3.0). Le donazioni sono completamente volontarie e non sbloccano alcuna feature aggiuntiva — è il vero spirito del software libero.

---

## Disclaimer

CLACOROO è un **tool indipendente di terze parti** e **non è affiliato, sponsorizzato né approvato da Anthropic, PBC**. È un progetto autonomo sviluppato e mantenuto da **MAXYMIZE** con il solo scopo di rendere più facile l'utilizzo della CLI ufficiale [Claude Code](https://github.com/anthropics/claude-code) attraverso un'interfaccia grafica. "Claude" e "Anthropic" sono marchi registrati di Anthropic, PBC. CLACOROO utilizza i file di configurazione e i comandi CLI di Claude Code senza modificarli.
