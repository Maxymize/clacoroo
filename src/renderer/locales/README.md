# Locales — CLACOROO i18n

Tutte le stringhe UI di CLACOROO sono raccolte qui in tabelle nested per categoria.
Default lingua del progetto: **italiano** (`it.js`). Lingua di fallback per anglofoni e tutto il resto: **inglese** (`en.js`).

## Come è strutturato

Ogni file `<lang>.js` esporta `window.LOCALES.<lang>` con la stessa shape nested.
Categorie principali (namespace): `nav`, `topbar`, `section`, `kpi`, `badge`, `mcp`,
`mcpCard`, `button`, `view`, `sort`, `search`, `empty`, `settings`, `settingsExtra`,
`settingsToast`, `toast`, `filter`, `chip`, `plugin`, `pluginCard`, `hookDep`,
`hooksPage`, `uiErr`, `account`, `apikey`, `tour`, `updateBanner`, `palette`,
`token`, `status`, `stats`, `statsPage`, `confirm`, `modalMkt`, `modalMcp`,
`time`, `counter`, `dash`, `mkt`, `config`.

Lookup runtime: `t('namespace.key', { var: 'value' })` in `app.js`.
Vedi `t()` definito in `src/renderer/app.js` (cerca `function t(key, vars)`).

## Aggiungere una nuova lingua

Esempio: aggiungere il francese (`fr`).

1. **Copia il template**: `cp src/renderer/locales/en.js src/renderer/locales/fr.js`
2. **Cambia il binding**: nel file appena copiato, sostituisci `window.LOCALES.en = {...}` con `window.LOCALES.fr = {...}`
3. **Traduci tutte le stringhe**. Mantieni invariate:
   - Chiavi (nomi `nav`, `topbar`, ecc.)
   - Variabili di interpolazione `{name}`, `{id}`, `{tok}`, ecc. (devono esserci esattamente le stesse)
   - Backtick code spans (es. `` `claude auth login` ``)
   - Markdown / formattazione speciale
4. **Registra il file**: in `src/renderer/index.html` aggiungi `<script src="locales/fr.js"></script>` PRIMA di `app.js`
5. **Aggiungi al dropdown lingua**: in `src/renderer/app.js` cerca `renderSettings()` → la sezione `Aspetto` con `langSel`. Aggiungi una option:
   ```js
   [
     { v: 'it', l: 'Italiano' },
     { v: 'en', l: 'English' },
     { v: 'fr', l: 'Français' },  // <— qui
   ].forEach(o => { ... });
   ```
6. **Estendi il mapping OS-detect**: la funzione `resolveLocale()` mappa già automaticamente qualsiasi locale che esiste in `LOCALES`. Niente da fare.
7. **Verifica shape** con: `npm run audit:locales`. Output atteso: `[OK] fr: N keys (shape matches reference)`.
8. **Smoke test**: `npm start` → Impostazioni → Aspetto → Lingua → seleziona la nuova lingua → naviga ogni sezione.

## Manutenzione

- **Reference locale**: `it.js` è la fonte di verità (lingua originale del progetto).
  Quando aggiungi una nuova chiave, prima va in `it.js`, poi in tutte le altre lingue.
- **Audit pre-commit**: esegui sempre `npm run audit:locales` prima di committare.
  Lo script verifica:
  - Stessa shape (set di chiavi) fra tutti i file
  - Stessi placeholder `{var}` in ogni stringa
- **Fallback**: se una chiave manca in una lingua, `t()` fallback su EN. Se manca anche in EN, restituisce la chiave stessa (es. `nav.dashboard`).
- **Convenzioni naming chiavi**:
  - camelCase (`pluginActive`, non `plugin_active`)
  - nested per categoria semantica (`mcp.status.connected`, non `mcpStatusConnected`)
  - placeholder con `{nome}` parlante (`{tok}`, `{id}`, `{n}` per count, `{name}` per nomi)
- **NON tradurre**: brand names (`CLACOROO`, `Claude`, `Anthropic`), nomi tecnici (`MCP`, `OAuth`, `claude.ai`), command snippets backtickati (`` `claude auth login` ``).

## File correlati

- `src/renderer/app.js` → `t()` helper, `setLocale()`, `initLocale()`, `applyStaticI18n()`, dropdown lingua in `renderSettings()`
- `src/renderer/index.html` → script tags per ogni locale file
- `src/main.js` → IPC `get-system-locale` (Electron `app.getLocale()`)
- `scripts/audit-locales.js` → script di verifica shape
- `CHANGELOG.md` → log IT delle release
- `CHANGELOG.en.md` → log EN delle release (mantenere allineati a ogni release)
