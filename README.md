<div align="center">

<img src="src/renderer/clacoroo.svg" width="120" alt="CLACOROO mascotte" style="image-rendering: pixelated;" />

# CLACOROO

**CLA**ude **CO**de Cont**RO**l **ROO**m

Pannello di controllo visuale per [Claude Code](https://github.com/anthropics/claude-code) — gestisci plugin, marketplace, skill, agent e hook con una UI desktop nativa, senza memorizzare comandi CLI.

[![Electron](https://img.shields.io/badge/Electron-36-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-141413)](#requisiti)
[![License: MIT](https://img.shields.io/badge/License-MIT-d97757.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.07-d97757.svg)](CHANGELOG.md)

</div>

---

## Cos'è CLACOROO

Il nome è un acronimo giocoso: il `CO` si sovrappone tra **Co**de e **Co**ntrol. La mascotte ufficiale è **CLACOROO**, un esserino pixel a 4 zampe ispirato a Clawd di Anthropic ma con un'antenna a LED verde — è lui che gestisce la regia 🎛.

Prima di CLACOROO, l'unico modo per gestire plugin e marketplace di Claude Code era usare i comandi CLI `claude plugins ...` o editare manualmente i JSON in `~/.claude/plugins/`. CLACOROO offre una GUI nativa per fare tutto a colpo di click.

## Cosa fa

| Sezione | Funzionalità |
|---|---|
| 🏠 **Dashboard** | KPI a colpo d'occhio: plugin attivi/disattivati, marketplace, skill e agent totali, token always-on |
| 🧩 **Plugin** | Toggle enable/disable · update · uninstall · ricerca full-text · filtri per stato e marketplace |
| 🏪 **Marketplace** | Card espandibili con i plugin contenuti · aggiornamento · rimozione |
| ⚡ **Skill** | Browser ricercabile su tutte le skill installate globalmente |
| 🤖 **Agent** | Browser ricercabile su tutti gli agent installati globalmente |
| ⚙️ **Impostazioni** | Percorsi rilevati, statistiche, configurazione manuale binario `claude` |

**Auto-refresh**: la UI si aggiorna sola quando i file di configurazione di Claude Code cambiano (`fs.watch`), senza dover riavviare l'app.

## Requisiti

- **Node.js** 18+ e **npm** — [nodejs.org](https://nodejs.org)
- **Claude Code** CLI installato e raggiungibile (`claude` nel `PATH`) — [installazione](https://docs.anthropic.com/claude-code)

## Avvio rapido

```bash
git clone https://github.com/Maxymize/clacoroo.git
cd clacoroo
npm install
npm start
```

## Build distribuibile

```bash
# macOS .dmg (arm64 + x64)
npm run build

# Tutte le piattaforme (richiede toolchain corrispondente)
npm run dist
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
- `cache/` — sorgenti plugin con skill (subdirectory) e agent (file `.md`)

**Scrittura** (mai diretta sui JSON, sempre via CLI):
- `claude plugins enable|disable|uninstall|update <id>`
- `claude plugins marketplace add|remove|update <name>`

Funziona offline dopo l'installazione. Tutti i dati sono locali.

## Architettura

```
src/
├── main.js        ← processo Electron principale: I/O config, IPC, CLI
├── preload.js     ← bridge sicuro contextBridge → window.claudeAPI
└── renderer/
    ├── index.html   ← shell SPA (sidebar + content)
    ├── style.css    ← design system CLACOROO (palette Claude-inspired)
    ├── app.js       ← logica SPA: state → loadData → render
    └── clacoroo.svg ← mascotte pixel-art (solo <rect>)
```

Documento di handoff tecnico completo: [`docs/doc-tecnico_handoff.html`](docs/doc-tecnico_handoff.html).

## Sicurezza

CLACOROO segue le best practice Electron moderne:

- ✅ `contextBridge` con `contextIsolation: true` e `nodeIntegration: false`
- ✅ Tutte le chiamate CLI usano `execFile` con array di argomenti (zero rischio shell injection)
- ✅ ID plugin e nomi marketplace validati con regex prima di qualsiasi chiamata
- ✅ CSP rigida: solo risorse `'self'`, nessun CDN remoto (font, librerie, immagini)
- ✅ Zero dipendenze runtime — solo `electron` e `electron-builder` come devDependencies

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

## Stack

Electron 36 · Vanilla JS · `contextBridge` · `execFile` · `fs.watch` · electron-builder

## Roadmap

Vedi [`TASK.md`](TASK.md) per il piano completo:

- **v1.0.03** — Browse + install plugin da marketplace, form add marketplace, token cost breakdown
- **v1.0.04** — Variant mascotte (blink, wave), app icon `.icns/.ico`, build `.dmg`
- **v1.0.05** — Tray icon, GitHub Releases con auto-update

## Contribuire

Repo privato per ora. PR e issue gestiti direttamente con il manutentore.

Convenzione commit: messaggio prefissato con la versione, es. `v1.0.03 — descrizione`.
Versionamento: solo l'ultima cifra `1.0.xx` (vedi [`CLAUDE.md`](CLAUDE.md) per le regole complete).

## Licenza

MIT © 2026 Maximilian Giurastante — vedi [`LICENSE`](LICENSE).
