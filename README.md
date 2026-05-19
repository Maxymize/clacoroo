# CLACOROO

**CLA**ude **CO**de Cont**RO**l ROom — pannello di controllo visuale desktop per **Claude Code**: gestisci plugin, marketplace, skill, agent e hook con una UI nativa al posto dei comandi CLI.

> Il nome è un acronimo giocoso: il `CO` si sovrappone tra **Co**de e **Co**ntrol. La mascotte ufficiale è CLACOROO, l'esserino pixel a 4 zampe che gestisce la regia 🎛.

## Cosa fa

- **Dashboard** — KPI a colpo d'occhio: plugin attivi, disattivati, marketplace, skill e agent totali, token always-on
- **Plugin** — toggle enable/disable, update, uninstall, ricerca full-text, filtri per stato e marketplace
- **Marketplace** — card espandibili con i plugin contenuti, aggiornamento e rimozione
- **Skill / Agent** — browser ricercabile su tutto ciò che è installato globalmente
- **Auto-refresh** — la UI si aggiorna sola quando i file di configurazione di Claude Code cambiano (`fs.watch`)

## Requisiti

- **Node.js** 18+ e **npm** — [nodejs.org](https://nodejs.org)
- **Claude Code** CLI installato e raggiungibile (`claude` nel `PATH`)

## Avvio

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

# Tutte le piattaforme
npm run dist
```

## Come funziona

Auto-rileva la directory di configurazione di Claude Code:
- **macOS / Linux**: `~/.claude/`
- **Windows**: `%APPDATA%\Claude\`

Legge `installed_plugins.json`, `blocklist.json`, `known_marketplaces.json` e la cache plugin direttamente dal filesystem, e invoca la CLI `claude plugins` per tutte le operazioni di scrittura (enable, disable, install, uninstall, update).

Funziona offline dopo l'installazione. Tutti i dati sono locali.

## Sicurezza

- IPC con `contextBridge` + `contextIsolation: true`
- Tutte le chiamate CLI usano `execFile` con array di argomenti (no shell injection)
- ID plugin e nomi marketplace validati con regex prima di qualsiasi chiamata
- CSP rigida: nessuna risorsa remota (font, librerie, immagini)

## Brand

CLACOROO usa una palette ispirata a Claude (Anthropic) ma differenziata:
- Arancione primario `#d97757` (Claude Orange)
- Dark `#141413`, cream `#faf9f5`
- Mascotte CLACOROO disegnata con sole `<rect>` SVG, mai con path o curve

## Stack

Electron 36 · Vanilla JS · `contextBridge` · `execFile` · `fs.watch` · electron-builder

## Licenza

MIT © 2026 Maximilian Giurastante
