# Changelog

## v1.0.104 — 2026-05-26 — Pack G v2 chiusura COMPLETA: Disable/Enable singolo MCP user-added

Ultimo task del Pack G v2 implementato. Scelta utente: **solo user-added** (remove+add con backup config in state.json). Per plugin-managed e claude.ai builtin l'azione non è offerta perché non praticabile in modo pulito (vedi TASK.md nota tecnica).

### Backend

- [FEATURE] **`readUserMcpConfig(name)`** in `src/lib/mcp.js`: legge `~/.claude.json` e ritorna `{scope: 'user'|'local', config}` del server se presente (controllando sia top-level `mcpServers` per scope user, sia `projects[<cwd>].mcpServers` per scope local). Ritorna `null` se il server non è user-added
- [FEATURE] **IPC `mcp:disable`**:
  - Cerca config via `readUserMcpConfig` → errore se non user-added
  - Salva config in `state.disabledMcpServers[name] = {scope, config, disabledAt: ISO}`
  - Esegue `claude mcp remove <name> [-s <scope>]`
  - **Rollback automatico** se remove fallisce: rimuove l'entry da `disabledMcpServers`
- [FEATURE] **IPC `mcp:enable`**:
  - Legge entry da `state.disabledMcpServers[name]`
  - Ricostruisce args per `claude mcp add --transport <t> [-s <scope>] [-e KEY=VAL] [-H "Header: val"] <name> <target> [-- args]`
  - Validazione env keys (regex `^[A-Za-z_][A-Za-z0-9_]*$`) e headers
  - Su successo: rimuove l'entry da `disabledMcpServers` + invalida MCP_CACHE
- [FEATURE] **IPC `mcp:list-disabled`**: ritorna i server disabled come pseudo-server con `status: 'disabled'`, `statusText: 'Disabilitato da CLACOROO'`, transport + connection estratti dalla config salvata. Usato dal renderer per merge nel grid
- [FEATURE] **Activity log esteso**: `mcp disable` + `mcp enable` registrati

### Frontend

- [FEATURE] **Bottone "Disabilita"** sulle card MCP user-added (sia connected che needsAuth, NO sui disabled): confirm dialog → `mcpDisable` → toast + re-render. Icona Lucide `ban`
- [FEATURE] **Bottone "Abilita"** sulle card disabled (primary style accent): `mcpEnable` diretto (no confirm — l'enable è azione "additive" non distruttiva) → toast verde + re-render. Icona Lucide `check`
- [FEATURE] **Merge dei disabled nel grid MCP**: `renderMcp` ora fa una chiamata aggiuntiva a `mcpListDisabled` e merge i server disabled con i server attivi. Sort identico, appaiono come card "ghost" con border tratteggiato
- [FEATURE] **Badge status "Disabilitato"**: nuovo entry nel dictionary di status badge (icona `ban`, label "Disabilitato"). Card con `data-disabled="true"` ha opacity 0.7 per indicare lo stato

### Comportamento

- ✅ Solo user-added: backend ritorna errore chiaro se l'utente prova su plugin-managed/builtin
- ✅ Lifecycle reversibile: disable → enable con config preservata (URL/comando/env/headers tutto salvato)
- ✅ Per server OAuth: il re-enable potrebbe richiedere riautenticazione (toast informativo nel confirm)
- ✅ Activity log mostra anche disable/enable per audit

### Non-goals confirmati

- ❌ Plugin-managed disable: rimosso dal scope per evitare il problema "claude plugins update ripristina il file"
- ❌ claude.ai builtin disable: gestiti server-side, fuori dal controllo locale

### Pack G v2 status finale

| Task | Stato | Versione |
|---|---|---|
| Sezione MCP base | ✅ | v1.0.21–24 |
| Reconnect MCP | ✅ | v1.0.85 |
| Bottone `/mcp` in claude | ✅ | v1.0.86 |
| Add MCP | ✅ | v1.0.94 |
| Remove user-added | ✅ | v1.0.94 |
| View tools (JSON-RPC) | ✅ | v1.0.103 |
| Disable/Enable singolo | ✅ | v1.0.104 |

**Pack G v2 chiuso.** 🎉

## v1.0.103 — 2026-05-26 — Pack G v2 — View tools: mini-client MCP JSON-RPC

Penultimo task aperto del Pack G v2: mostrare i tools esposti da un server MCP. CLACOROO ora include un **mini-client JSON-RPC** che fa l'handshake MCP standard (`initialize` + `notifications/initialized` + `tools/list`) per server stdio plugin-managed, e ritorna l'elenco tools con nome, descrizione, parametri.

### Backend

- [FEATURE] **Nuovo modulo `src/lib/mcpClient.js`** con `listToolsStdio(cfg)`:
  - Spawna processo MCP via `child_process.spawn` (command + args + env merged con `process.env`)
  - Handshake JSON-RPC newline-delimited (protocolVersion `2025-06-18`)
  - Sequenza: `initialize` → `notifications/initialized` → `tools/list` → SIGTERM
  - Timeout 8s su handshake + 5s su `tools/list`. SIGTERM in cleanup, SIGKILL dopo 2s grace
  - Errori graceful: process exit prematuro, JSON-RPC error, timeout — ognuno ritorna `{ok: false, error: "..."}` con descrizione + STDERR truncato (4KB cap, no leak)
  - **Sicurezza**: parse line-per-line, skip righe non-JSON (log server vengono ignorati). `pending` map per matching response → request via JSON-RPC id
- [FEATURE] **IPC `mcp:list-tools`** in `src/main.js`:
  - Risolve config server da `readPluginMcpDeclarations()` (`.mcp.json` dei plugin)
  - **Filtro scope**: `claude.ai *` ritorna errore "OAuth required, usa /mcp dentro claude"
  - **Filtro transport**: solo `stdio`. HTTP/SSE → errore "non supportato in questa versione"
  - **Server user-added** non ancora supportati (config non in plugin declarations) — ritorna errore con messaggio chiaro
- [REFACTOR] **`readPluginMcpDeclarations` esteso** in `src/lib/mcp.js`: ora include anche `env` dalla declaration (era ignorato — necessario per server che richiedono env vars come API keys)
- [BRIDGE] **`mcpListTools(serverId)`** esposto via preload

### Frontend

- [FEATURE] **Bottone "👁 Tools"** sulle card MCP con status `connected`. Sempre visibile per i connessi (backend filtra il supporto):
  - stdio plugin-managed → fa l'handshake e mostra tools
  - HTTP/SSE / claude.ai → errore graceful nel modal
  - user-added → "non ancora supportato" nel modal
- [FEATURE] **`showMcpToolsModal(srv)`**: modal con:
  - Header `tools` badge + nome server
  - Loading state durante l'handshake
  - Error box arancione con icona warning e spiegazione se fallisce
  - Lista tools: ogni tool ha `name` (mono accent), `title` (se diverso dal name), `description`, lista compatta dei `inputSchema.properties` con badge param (required = bordo arancione)
  - Summary "N tool esposti" in alto
  - Limite display 8 param visibili + "+N" indicatore
- [STYLE] Nuove classi `.mcp-tools-loading/-empty/-error/-error-text/-summary/-list`, `.mcp-tool-item/-head/-name/-title/-desc/-params/-param/-param-more`

### Test

Provato sull'installazione reale:
- **`plugin:context7:context7`** (stdio, `npx @upstash/context7-mcp`): handshake OK, ritorna 2 tools (`resolve-library-id`, `get-library-docs`) con parametri visibili
- **`plugin:claude-mem:mcp-search`** (stdio, sh + node): handshake OK
- **`plugin:cloudflare:cloudflare-api`** (HTTP): errore graceful "transport http non supportato"
- **`claude.ai Drive`**: errore graceful "OAuth server-side"

### Non-goals

- ❌ Non supportiamo HTTP/SSE in questa versione (richiedono OAuth tokens che vivono nel keychain di Claude Code, off-limits per CLACOROO)
- ❌ Non chiamiamo `tools/call` (solo `tools/list`) — esecuzione di tool MCP fuori scope CLACOROO
- ❌ Non supportiamo user-added server senza config (TODO v1.0.104+ con parsing `claude mcp get <name>` output)

## v1.0.102 — 2026-05-26 — Simplify code review fixes (high-priority cleanup)

Cleanup post-skill `simplify`: 3 agent paralleli hanno revisionato i commit v1.0.95→v1.0.101 e identificato 1 bug latente + altri cleanup ad alto valore. Fix dei più importanti.

### Bug latente fixato

- [FIX BREAKING] **`btnWithIcon` duplicato/shadowato**: c'erano DUE definizioni della funzione — quella nuova Lucide (v1.0.95, line ~97) e quella vecchia heroicons (v1.0.40, line ~762). La seconda **shadowava** la prima per tutto il codice scritto dopo la riga 762. Le card MCP/Plugin e i bottoni nei modal mostravano icone heroicons invece di Lucide, defeating il refactor v1.0.95
- [REFACTOR] Eliminato blocco legacy `svgIcon` + `ICONS` (39 righe). Aggiunte le 2 icone mancanti in `LUCIDE_ICONS` (`code`, `upload`). Migrate 6 chiamate `svgIcon('xxx')` → `icon('xxx')` (con rename `folder` → `folder-open`)

### Cleanup batch

- [REFACTOR] **`modifiedFileKey(kind, fullId, name)`** helper: era reinventata in 3+ siti (save handler, isLocallyModified, badge render). Single source of truth
- [REFACTOR] **`appendModifiedBadge(parent, item, kind, mode)`** helper: blocco identico era inline in `buildSkillAgentCard` E `buildSkillAgentChip` con solo varianti dimensione/styling. Mode `'card'` o `'chip'` distingue
- [PERF] **Memoize `buildHookList()` su `state._hookListCache`**: era chiamata 2 volte (renderHooks + renderDashboard KPI), ognuna iterava state.plugins × hookEvents × matchers. Ora cache invalidata in `processData()` ad ogni reload. Niente più duplicate compute
- [PERF] **`setViewMode` guard**: aggiunto `if (state.viewMode[section] === mode) return;` come prima riga per evitare setState + render quando già impostato (era guardato solo lato bottone click)
- [CLEANUP] Rimosso dead code `kindLabel` (era marcato "unused, placeholder")
- [REFACTOR backend] **`detectReconnectType` in `src/lib/mcp.js`**: rimossi emoji prefix (`↗`, `🚫`) dai `label` delle actions. Il renderer ora costruisce l'icona Lucide dal `kind` senza dover stripparli con regex `^[^a-zA-Z]+\s*`. Eliminata la regex fragile

### NON applicato (deliberato — false positive o low value)

- ❌ Factory `buildCompactRow(opts)` per 4 sezioni (Marketplace/Plugin/MCP/Hooks): le 4 funzioni hanno strutture davvero diverse (counts/status/transport/matcher/sub variano per sezione), unificarle aumenterebbe le opzioni del factory senza ridurre LOC significativamente
- ❌ Constants `VIEW`/`KIND`/`RECONNECT`: 30+ siti da migrare, valore basso (stringhe già stabili)
- ❌ `showMarkdownModal({...opts})`: API change più invasivo, ho lasciato signature posizionale 4-arg
- ❌ `validIdentifier` shared in `src/lib/validators.js`: 4 siti diversi ma con regex leggermente diversa per use case (mcp name vs plugin id vs markdown name). Mantenuti separati
- ❌ Cleanup commenti `// v1.0.xx —`: volume alto, valore basso. Git history è la source of truth

## v1.0.101 — 2026-05-26 — Tooltip esplicativo sui badge event nella sezione Hooks

Ultimo task aperto del Pack K extension. L'utente ha **scartato** gli altri 3 task pianificati (slow-hook indicator, trigger count, overlap warning) per scope opinabile / utilità bassa.

- [FEATURE] **`HOOK_EVENT_DOCS`** dictionary nel renderer con descrizione lunga di ognuno dei 10 event Claude Code: SessionStart, SessionEnd, Stop, SubagentStop, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, Notification, Setup. Ogni voce ha 2 paragrafi: (1) **quando triggera** (cosa lo causa), (2) **come viene usato tipicamente** dai plugin
- [FEATURE] **`hookEventDoc(name)`** helper genera la stringa tooltip formattata. Per event custom non documentati ritorna nome + nota "Event custom (non documentato nel core di Claude Code)"
- [FEATURE] **Tooltip applicato in 4 punti**:
  - Badge event sulle card hook (vista cards)
  - Badge event mini sulle compact row
  - Badge event nell'header del modal dettagli hook
  - Chip filter event nel header della sezione Hooks (utile per imparare cosa filtri prima di cliccare)
- [STYLE] **`.hook-event-badge cursor: help`**: il cursore indica all'utente che hovering produce info

### Scartati (decisione utente)

- ~~Indicatore "hook potenzialmente lento" (`async: false` + script long-running)~~ — scope troppo opinabile, falsi positivi alti
- ~~Conteggio "trigger stimati" basato su pattern matcher~~ — informazione poco azionabile
- ~~Warning matcher sovrapposti su stesso event~~ — caso d'uso raro

Pack K extension considerato **chiuso** con v1.0.87+v1.0.94+v1.0.101 (hook deps, plugin filter, event tooltip).

## v1.0.100 — 2026-05-26 — Tre fix UX: toast z-index, badge "modificato" sulle card, activity log esteso

Centesima release! 🎉 Tre fix legati al feedback utente su v1.0.99 (editor inline).

### Fix #1 — Activity log esteso

Le nuove action aggiunte dopo la prima implementazione dell'activity log (v1.0.05) non venivano registrate. Le card "Recenti" in sidebar e la sezione "Attività recenti" della Dashboard mostravano solo plugin/marketplace, mancavano tutte le novità da v1.0.85+.

- [FEATURE] **`write-markdown-file` IPC** ora chiama `appendActivity({kind: 'skill'|'agent', action: 'edit', target: name + ' (' + fullId + ')'})` su successo e failure
- [FEATURE] **`mcp:add` IPC** logga `kind: 'mcp', action: 'add', target: name + ' (' + transport + ')'`
- [FEATURE] **`mcp:remove` IPC** logga `kind: 'mcp', action: 'remove', target: name`
- [FEATURE] **`mcp:clear-auth-cache` IPC** logga `kind: 'mcp', action: 'clear-auth-cache', target: serverId`
- [FIX] **`refreshSidebarRecent` routing esteso**: oltre a `marketplace` e `plugin`, il click sulla riga ora indirizza alle sezioni `skills`/`agents`/`mcp`/`hooks` in base al `kind` dell'entry
- [NOTE] **NON loggate** `hooks:check-tool` (polling automatico, rumore) e `hooks:refresh-deps` (richiamato da topbar Aggiorna, già visibile)

### Fix #2 — Toast sotto modal overlay

I toast generati da azioni dentro un modal (es. Salva file .md, Copia testo, Aggiunta MCP) comparivano **sotto** il backdrop sfocato del modal: l'utente vedeva solo una macchia colorata illeggibile in basso a destra.

- [FIX] **`.toast-container z-index`** alzato da `9999` a `99999` (sopra `.md-overlay` che è `99998`). I toast ora compaiono sopra il modal con leggibilità piena

### Fix #3 — Badge "modificato" sulle card skill/agent

Dopo aver salvato una modifica al file `.md` di una skill/agent (v1.0.99), non c'era modo di vedere a colpo d'occhio quali skill/agent sono state editate localmente. Now:

- [FEATURE] **`state.modifiedFiles`** nuovo campo state, persisted in `state.json`. Chiave: `kind:fullId:name`, valore: timestamp ISO ultima modifica
- [FEATURE] **Save flow esteso**: dopo `writeMarkdownFile` con successo, aggiunge entry a `state.modifiedFiles` + persiste via setState
- [FEATURE] **`isLocallyModified(item, kind)`** helper di cross-check sullo state
- [FEATURE] **Badge "✎ MODIFICATO"** sulle card skill/agent (`.browse-card-modified`): arancione warm CLACOROO (`#f0a280` su `rgba(217,119,87,.18)`), accanto a scope/health/blocked. Icona Lucide `pencil`. Tooltip: timestamp di modifica + reminder che verrà sovrascritto al prossimo `claude plugins update`
- [FEATURE] **Mini-icona pencil** sui chip compatti (vista compatta) per stesso scopo, dimensione 11×11, colore giallo warning
- [STYLE] `.browse-card-modified` + override `.chip-modified-icon` per la vista compact

### Note sulla persistenza

Il tracking `modifiedFiles` rimane finché non viene esplicitamente pulito. Idealmente dovremmo invalidarlo quando l'utente fa `claude plugins update <plugin>` (che riporta il file all'upstream), ma:
- Non possiamo intercettare quando l'utente lo fa da terminale esterno
- Possiamo intercettare quando lo fa da CLACOROO (bottone "Update" nella card plugin) — potenziale extension futura
- Per ora il tooltip ricorda all'utente: "verrà sovrascritto al prossimo `claude plugins update`". L'utente può sapere quando il badge non è più accurato

## v1.0.99 — 2026-05-26 — Editor inline file .md skill/agent nel modal preview

Estensione naturale di v1.0.98 (tooltip esplicativo): il modal markdown preview di skill/agent ora ha un bottone **"Modifica"** che switcha la preview in editor textarea, permettendo all'utente di fixare il frontmatter o il body del file `.md` direttamente da CLACOROO senza aprire un editor esterno. Warning chiaro sopra l'editor: le modifiche sono **temporanee** (sovrascritte al prossimo `claude plugins update <plugin>`).

### Backend (`src/main.js` + preload)

- [FEATURE] **IPC `write-markdown-file(fullId, kind, name, content)`** + bridge preload `writeMarkdownFile`. Stesso pattern di validazione di `read-markdown-file`:
  - `fullId` risolto via `resolvePluginPath` (no path escape)
  - `name` deve matchare regex `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`
  - `kind` deve essere `skill` o `agent`
  - `content` deve essere string ≤ 500KB (sanity limit)
  - **Verifica paranoid path traversal**: il path finale deve essere dentro la directory cache del plugin (`path.resolve(...).startsWith(root + sep)`)
  - **File deve esistere già**: non creiamo file nuovi, solo update di skill/agent già dichiarate dal plugin (no creazione di ghost agent)

### Frontend (`src/renderer/app.js`)

- [FEATURE] **`showMarkdownModal(name, kind, content, fullId)`** esteso: nuovo argomento `fullId` opzionale. Se passato, abilita il bottone "Modifica" nell'header del modal
- [FEATURE] **3 nuovi bottoni header**: "Modifica" (icona Lucide `pencil`), "Salva" (icona `check`, verde), "Annulla" (icona `x`). Mostrati condizionalmente in base al `mode` (`preview` vs `edit`)
- [FEATURE] **`switchToEdit()` / `switchToPreview()`** orchestrano lo swap del contenuto modal: in preview rendering markdown via `renderMarkdownToContainer`; in edit mostrano warning box + textarea editabile
- [FEATURE] **Warning box `.md-editor-warn`** sopra la textarea: icona triangle-alert + testo che spiega che le modifiche locali verranno sovrascritte al prossimo `claude plugins update <plugin>`, e suggerisce di aprire PR/issue per fix permanente
- [FEATURE] **Confirm dialog su exit con modifiche pendenti**: se l'utente preme Esc / Annulla / chiude / click outside con `textarea.value !== currentContent`, viene chiesto conferma via `window.confirm`
- [FEATURE] **Save flow**: click "Salva" → `writeMarkdownFile` IPC → toast success → ricarica `loadData()` per re-trigger health check (se il fix risolve il warning, il badge sparisce subito dalla card)
- [FEATURE] **Cancel flow**: click "Annulla" → con confirm se modifiche pendenti → torna a preview con currentContent originale
- [REFACTOR] **`openMarkdownPreview` propaga `fullId`** a `showMarkdownModal` (era già disponibile nel chiamante)
- [STYLE] Nuove classi `.md-editor-warn` (badge arancione), `.md-editor-warn-text strong` (header bold giallo), `.md-editor-textarea` (mono 12px, min-height 400px, resize vertical, focus border accent), `.md-save-btn` (override colore verde success)
- [ICON] Nuova icona Lucide `pencil` per il bottone Modifica

### Use case

Esempio: l'agent `audit-budget` di `maxym-ai-ads` ha health-warn perché manca `description` nel frontmatter. Click sulla card → preview → "Modifica" → aggiungi `description: ...` al frontmatter YAML → "Salva" → toast verde + il badge sparisce dalla card. Fix locale immediato finché non aggiorni il plugin.

### Non-goals

- ❌ Non scriviamo file nuovi (`existsSync` check obbligatorio)
- ❌ Non modifichiamo path fuori dalla cache del plugin (paranoid check)
- ❌ Non c'è confirm prima del salvataggio (è dell'utente la responsabilità); il warning permanente sull'editor è sufficiente

## v1.0.98 — 2026-05-26 — Tooltip esplicativo arricchito sui badge health di Skill/Agent

Feedback utente sui warning/errori visibili nelle card Agent: cosa sono e si possono risolvere? Indagine:

- **Cosa sono**: errori del frontmatter YAML del file `.md` (manifest dell'agent/skill), generati da `checkMarkdownHealth()` in `src/lib/markdown.js`. Tipi: `Frontmatter YAML mancante o vuoto` (err), `Campo "name"/"description" mancante` (err), `Description troppo corta` (warn). Sono **errori del plugin author**, non feature mancanti sul sistema utente
- **Non sono installabili**: il file `.md` malformato vive in `~/.claude/plugins/cache/...` e viene sovrascritto al prossimo update plugin. Non è un tool runtime da installare (come Bun in v1.0.91)

### Fix scelto: documentare nel tooltip (no nuovi bottoni)

- [FEATURE] **Tooltip arricchito** sul badge `.browse-card-health` delle card Skill/Agent: oltre alla lista degli issue, ora spiega:
  - Cos'è il problema (errore frontmatter `.md`, manifest plugin)
  - Che NON è un problema dell'installazione utente
  - I 2 possibili fix: aprire issue sul repo del plugin (`marketplace upstream`) per fix permanente, OPPURE modificare manualmente il frontmatter nel file locale (sapendo che viene sovrascritto al prossimo `claude plugins update`)
  - Che l'agent/skill funziona comunque ma Claude Code potrebbe non invocarlo correttamente per mancanza di metadati
- [NOTE] **Niente bottoni "Apri issue" o "Edit frontmatter"** per ora: scelta UX deliberata di tenere la card pulita. Il tooltip educativo è sufficiente per spiegare il problema senza occupare spazio visivo

## v1.0.97 — 2026-05-26 — Pack M chiusura: vista compatta per Marketplace / Plugin / MCP / Hooks

Completata l'altra metà del **Pack M** dopo v1.0.96 (che ha portato cards a Skill/Agent). Ora **tutte le 6 sezioni** hanno entrambe le viste con switch live nel topbar.

### Compact view per le 4 sezioni che oggi avevano solo cards

- [FEATURE] **`buildMarketplaceCompactRow(m)`**: dot colore mkt + nome + count `X / Y plugin` (installati/disponibili) + repo + badge `auto-update`. Click apre `showMarketplaceContentModal`
- [FEATURE] **`buildPluginCompactRow(p)`**: dot colore mkt + name + mkt + status badge (`attivo`/`disabilitato`/`locale: nome-progetto`) + count summary (`N skill · M agent · mcp · hooks`). Click apre `showPluginContentModal`
- [FEATURE] **`buildMcpCompactRow(srv)`**: dot status colorato (verde/arancione/rosso) + name + badge transport (HTTP/SSE/STDIO) + sub (claude.ai/plugin/user-added) + statusText se non connected
- [FEATURE] **`buildHookCompactRow(item)`**: badge event piccolo colorato + plugin + matcher truncato (30 char con tooltip full) + scope badge + warn deps mancanti se applicable. Click apre `showHookDetailsModal`

### Refactor render functions

- [FEATURE] **`renderMarketplaces` / `renderPlugins` / `renderMcp` / `renderHooks`**: ognuno ora include `renderViewSwitcher` nell'header e seleziona il builder corretto (card o compact row) in base a `state.viewMode[section]`. Grid class diversa: `.cards-grid|.mkt-cards-grid|.mcp-grid|.hook-grid` per cards, `.compact-list` per compatta

### CSS condiviso

- [STYLE] **`.compact-list`** flex column con gap minimo (4px) per liste dense
- [STYLE] **`.compact-row`** base con border-left colorato (status/mkt), padding minimo, hover sottile
- [STYLE] **`.compact-row-*`** classi atomiche riusabili: `-dot`, `-name` (mono bold), `-sub` (muted), `-plugin`, `-matcher` (code accent2), `-transport`, `-counts` (margin-left auto), `-pstatus` (badge), `-status-msg`, `-warn` (badge arancione con icon Lucide), `-tag`
- [STYLE] **`.plugin-status-active/-blocked/-local`** varianti colorate per status badge
- [STYLE] **`.hook-event-badge-sm`** versione mini del badge event Hook (9px) per le compact row

### Comportamento

- ✅ Switch immediato (no reload), persistito in `state.json`
- ✅ Default `cards` per tutte le sezioni
- ✅ Search + filtri + sort funzionano identici in entrambe le viste
- ✅ In compact: niente bottoni inline (Installa/Rimuovi/Dettagli) — click sull'intera riga apre il modal dettagli completo

### Fix accavallamento health badge nelle card Skill/Agent

- [FIX] Card Skill/Agent: il health badge "health: warning"/"health: errore" si accavallava al `scope-badge GLOBALE` perché usava la classe `.health-badge` (cerchietto 16x16 pensato per le chip compatte, con un singolo carattere `⚠`/`!`). Il testo fuorisciva dal cerchio sovrapponendosi all'elemento accanto
- [FIX] Sostituito con nuova classe `.browse-card-health` (badge rettangolare proper, allineato in flex con gli altri badge, gap 6px). Include icona Lucide `triangle-alert` + testo. Varianti `.h-err` (rosso) e `.h-warn` (arancione)

## v1.0.96 — 2026-05-26 — Pack M MVP: vista cards + compatta switchabile (Skill/Agent)

Primo step di **Pack M** (vista cards + compatta per tutte le sezioni). MVP con infrastruttura + le 2 sezioni più semplici (Skill, Agent — oggi solo compatta). Le altre sezioni (Marketplace/Plugin/MCP/Hooks — oggi solo cards) riceveranno la vista compatta in v1.0.97.

### Infrastruttura view switcher

- [FEATURE] **`state.viewMode = { plugins, marketplaces, skills, agents, mcp, hooks }`** con default `'cards'` per tutte. Persistenza in `state.json` via setState. Restore in `init()` con validazione (solo `'cards'` o `'compact'` accettati)
- [FEATURE] **`renderViewSwitcher(section, currentMode, onChange)`** helper: 2 bottoni icona toggle (Lucide `layout-grid` per cards + `list` per compatta) con stato attivo evidenziato. Posizionato nel `section-header` accanto al sort dropdown
- [FEATURE] **`setViewMode(section, mode)`** helper: aggiorna state + persiste + re-render
- [FEATURE] **`renderListSection` esteso**: accetta `sortConfig.viewSwitcher = {section, mode, onChange}` opzionale. Mostrato a sinistra del sort dropdown
- [STYLE] Nuove classi `.view-switcher`, `.view-switcher-btn`, `.view-switcher-btn.active`

### Vista cards per Skill/Agent

- [FEATURE] **`buildSkillAgentCard(item, kind)`** nuovo builder: card layout simile a `.hook-card` con header nome + plugin/mkt dot, body con scope badge + health badge + blocked badge se applicable, footer con bottone "Apri preview" (riusa `openMarkdownPreview`). Card cliccabile per intero
- [FEATURE] **`buildSkillAgentChip(item, kind)`** estratto a parte (era inline in renderSkills/renderAgents). Vista compatta invariata
- [FEATURE] **`renderSkills` / `renderAgents` refactored**: in base a `state.viewMode.skills/agents` usano il builder card o chip. Grid class diversa: `.browse-card-grid` per cards, `.skill-grid` per compatta
- [STYLE] Nuove classi `.browse-card-grid`, `.browse-card`, `.browse-card-head/-title-wrap/-title/-plugin-line/-mkt-dot/-plugin/-mkt`, `.browse-card-body/-badges`, `.browse-card-blocked`, `.browse-card-foot/-hint`. Riusabili per le compact view delle altre sezioni in v1.0.97

### NEXT (v1.0.97 — Pack M completamento)

- Compact view per Marketplace (chip con count installati/disponibili)
- Compact view per Plugin (chip con status)
- Compact view per MCP (chip con dot status + transport)
- Compact view per Hooks (chip con event badge piccolo + matcher truncato)

## v1.0.95 — 2026-05-26 — Card MCP truncate + helper icone Lucide (no emoji) + Pack M registrato

Due fix UX dalla feedback utente sulla sezione MCP.

### Truncate comando MCP a 2 righe

- [FIX] **Card MCP `mcp-search` (claude-mem) altissima**: il comando shell molto lungo (~600 char) faceva crescere la card a tutta colonna sfalsando l'altezza della riga grid e creando spazi vuoti enormi nelle altre card. Ora `.mcp-card-conn` ha `max-height: 36px` (~2 righe) + bottone "Mostra tutto" / "Mostra meno" sotto, visibile solo se il contenuto è davvero troncato (`scrollHeight > clientHeight + 2`)
- [STYLE] `.mcp-card-conn.expanded` toglie il vincolo `max-height` per espandere
- [STYLE] `.mcp-card-conn-toggle` mini-bottone uppercase neutro che attiva l'espansione

### Helper icone Lucide (sostituisce emoji)

- [REFACTOR] **`LUCIDE_ICONS`** dictionary nel renderer con ~20 path SVG Lucide (plus, x, check, trash-2, play, copy, external-link, search, folder-open, triangle-alert, rotate-cw, circle-check, circle-x, circle-alert, circle-help, ban, eye, terminal, plug, chevron-down/up)
- [REFACTOR] **`icon(name)`** helper genera nodo `<svg>` Lucide inline con classe `.inline-icon` (14px default, ereditano currentColor, stroke style coerente con sidebar)
- [REFACTOR] **`btnWithIcon(cls, iconName, label)`** + **`spanWithIcon`** helper per ridurre boilerplate
- [STYLE] `.inline-icon` CSS centralizzato + variant `.icon-lg` (16px) e `.icon-only` (no margin-right)
- [FIX] **Sostituite emoji sui bottoni più visibili**: topbar (`+ Marketplace/MCP/Progetto`, `↻ Aggiorna`, `▣ Terminale`), card MCP (badge status, `⧉ Copy`, `🗑 Rimuovi`), card Hook (`⌕ Dettagli`, `📁 Apri hooks.json`), badge "Manca", bottoni "▶ Installa <tool>" + "↗ Docs <tool>", modal close (`×` → icona Lucide `x`), modal copy (`⎘ Copia` → icona `copy`), bottoni reconnect MCP (icon per kind)
- [NOTE] **Refactor parziale**: ho coperto i bottoni e badge più visibili. Restano alcune emoji ancora in posti minori (toast `✓/✗`, indicatori inline `⚠ Storage`, etc) — saranno sostituiti incrementalmente nelle prossime versioni quando si lavora su quelle aree

### Pack M registrato (NEXT)

- [DOCS] **Pack M — Vista cards + compatta switchabile per tutte le sezioni**: registrato in TASK.md. Skill/Agent oggi hanno solo compatta a chip; Marketplace/Plugin/MCP/Hooks hanno solo cards. Pack M aggiunge entrambe le viste per tutte con switch in topbar accanto al sort dropdown. Default vista cards. Implementazione in v1.0.96+ (MVP infra+Skill/Agent), v1.0.97+ (compact per le altre)

## v1.0.94 — 2026-05-26 — Filtro plugin in Hooks + Pack G v2 azioni mutate: Add/Remove MCP

Due feature parallele dalla stessa scelta utente.

### Filtro plugin nella sezione Hooks (Pack K extension)

- [FEATURE] **Dropdown "Plugin:"** nella riga filtri della sezione Hooks, accanto a "Evento" e "Scope". Lista plugin estratta dinamicamente dagli hook visibili (es. claude-mem · superpowers · watch · ralph-loop · security-guidance) — combinabile in AND con gli altri filtri
- [FEATURE] **Mostrata solo se >1 plugin**: se l'utente ha hook da un solo plugin, nascondiamo il dropdown (sarebbe inutile). Scelta dropdown invece di chip multipli perché scala meglio (5+ plugin riempirebbero 2 righe)
- [FEATURE] `state.filters.hooks.plugin = 'all'` nuovo campo nello state, default `'all'`
- [STYLE] Nuova classe `.hook-filter-select` coerente con `.sort-dropdown` (bg dark + border accent2 on hover)

### Pack G v2 — chiusura azioni mutate: Add/Remove MCP

CLACOROO ora copre il **lifecycle completo MCP** senza dover usare la CLI: aggiungere nuovi server, rimuovere quelli user-added, reconnect (v1.0.85–86), clear cache. Restano fuori solo "View tools" (richiede mini-client JSON-RPC, scope a sé) e "Disable/Enable singolo server senza disabilitare plugin" (CLI Claude Code non lo espone).

**Backend (`src/main.js`)**:
- [FEATURE] **IPC `mcp:remove`** → `claude mcp remove <name>` con validazione `validMcpName` (regex `^[a-zA-Z0-9][a-zA-Z0-9_.-]*$`). Invalida cache MCP renderer al successo
- [FEATURE] **IPC `mcp:add`** → `claude mcp add --transport <t> [--scope <s>] [-e KEY=VAL ...] [-H "Header: val" ...] <name> <target> [-- args...]`. Validazione: name regex + transport `http|sse|stdio` + target non vuoto + env regex `KEY=VAL` + header con `:`. Args stdio passati dopo `--`
- [SECURITY] Tutti i parametri passati come array a `execFile`, niente stringhe interpolate. CLAUDE.md rules rispettate

**Frontend (`src/renderer/app.js`)**:
- [FEATURE] **Bottone "+ MCP"** nel topbar quando sei in sezione MCP (sostituisce "+ Progetto" come fa "+ Marketplace" in Marketplaces). Apre il form modal Add MCP
- [FEATURE] **Modal "Aggiungi MCP server"** con form a sezioni:
  - **Nome** (text input, alfanumerico)
  - **Transport** (3 radio button card: HTTP / SSE / stdio, con descrizione)
  - **URL/Comando** (campo dinamico: placeholder cambia in base al transport)
  - **Argomenti** (textarea, una riga per arg — visibile solo per stdio)
  - **Env vars** (textarea, formato `KEY=VALUE` una per riga, opzionale)
  - **Headers HTTP** (textarea, formato `Name: value` una per riga, opzionale)
  - Validazione client-side prima del submit + error box visibile
  - Submit chiama `mcpAdd({name, transport, target, args, envs, headers, scope:'user'})` + toast + refresh MCP
- [FEATURE] **Bottone "🗑 Rimuovi"** sulle card MCP con `scope='user'`: NON appare per builtin claude.ai (Drive/Gmail/Calendar) né per plugin-managed (Cloudflare/Supabase/Neon — sono gestiti dai loro plugin). Dialog di conferma con dettaglio dell'azione (`claude mcp remove <id>`)
- [FEATURE] **`confirmAndRemoveMcp(srv)`** helper con confirm dialog + chiamata `mcpRemove` + toast feedback + re-render
- [STYLE] Nuove classi `.add-mcp-form`, `.add-mcp-label/-title/-hint`, `.add-mcp-input`, `.add-mcp-textarea`, `.add-mcp-radios`, `.add-mcp-radio[/.selected]/-label/-desc` (radio button card stile native)
- [REFACTOR] Helpers `makeFormLabel(title, hint)` + `makeFormInput(id, placeholder)` riusabili per form futuri

## v1.0.93 — 2026-05-26 — Hook dep install: polling automatico post-install (no click manuale "Aggiorna")

Feedback utente sul flow v1.0.92: dopo aver lanciato `bun install` dal bottone "▶ Installa bun", deve cliccare manualmente "↻ Aggiorna" in topbar per far sparire il badge "Manca: bun". UX zoppa.

- [FEATURE] **`startDepInstallPoller(tool)`** in renderer: dopo che `installDepInTerminal` ha pre-digitato il comando, parte un polling automatico che chiama `hooks:check-tool` ogni 5 secondi per controllare se il tool è apparso nel PATH. Quando installato → invalida cache + ricarica dati + toast `✓ <tool> installato!`. Niente più click manuale
- [FEATURE] **IPC `hooks:check-tool`** + bridge preload `checkHookTool(tool)`: invalida l'entry del singolo tool dal cache (bypass TTL) e ritorna `{installed, path}`. Lightweight: 1 spawn `which`/`shell -lc` invece dell'intero re-check di tutti i tool
- [FEATURE] **`invalidateOne(tool)`** in `src/lib/hookDeps.js`: invalida solo l'entry di un singolo tool, lasciando intatti gli altri. Usato dal polling per non bustare l'intero cache ad ogni tick
- [FEATURE] **Timeout 3 minuti** sul polling: se l'utente decide di non eseguire l'install (Ctrl+C nel pty) il polling smette da solo con toast informativo "Timeout: clicca ↻ Aggiorna se hai completato l'install"
- [FEATURE] **Anti-doppione**: se l'utente clicca "Installa <tool>" più volte sullo stesso tool, il vecchio poller viene clearato prima di crearne uno nuovo. No accumulo di setInterval

## v1.0.92 — 2026-05-26 — Fix bottone "Installa": confirm-dialog ritorna numero, non oggetto

Bug introdotto in v1.0.91: click su "Apri terminale" nel confirm dialog non faceva nulla. Root cause: `confirm-dialog` IPC handler ritorna direttamente `r.response` (numero: 0 = Annulla, 1 = Apri terminale), ma il mio codice in `installDepInTerminal` controllava `ok.response !== 1` come se fosse un oggetto wrapper → la condizione era SEMPRE `true` (`undefined !== 1`) e la funzione faceva return immediatamente.

- [FIX] `installDepInTerminal`: rinominata variabile da `ok` a `response`, condizione corretta `if (response !== 1) return;`
- [NOTE] Stesso pattern in altri confirmDialog dell'app: `r.response` ritornato direttamente come numero. Era solo questo specifico call site a essere sbagliato

## v1.0.91 — 2026-05-26 — Hook dep: bottone "▶ Installa <tool>" cross-platform per dipendenze mancanti

Estensione del detector v1.0.87–90: quando una card hook mostra `⚠ Manca: bun`, ora c'è un bottone **"▶ Installa bun"** accanto al badge che apre il terminale integrato + pre-digita il comando di installazione ufficiale per la piattaforma corrente (macOS/Linux/Windows). Pattern identico al Pack G v2 v1.0.86 reconnect MCP (confirm dialog + pre-typing + nessun Enter automatico — l'utente decide se procedere).

### Backend

- [FEATURE] **`INSTALL_COMMANDS`** nuova mappa `{ tool: { darwin, linux, win32 } }` con comandi UFFICIALI per ogni piattaforma. Ricavati dalle docs ufficiali dei rispettivi tool:
  - **bun**: `curl -fsSL https://bun.sh/install | bash` (macOS/Linux), `powershell -c "irm bun.sh/install.ps1 | iex"` (Win)
  - **deno**: `curl -fsSL https://deno.land/install.sh | sh`, `irm https://deno.land/install.ps1 | iex`
  - **python3** / **gh** / **jq** / **rg** / **fzf** / **aws**: `brew install` (macOS), `sudo apt install -y` (Linux), `winget install` (Win)
  - **uv**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - **wrangler** / **vercel** / **pnpm**: `npm install -g <tool>`
  - **cargo** / **rustc**: `curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - **gcloud** / **docker**: `null` su tutte le piattaforme — richiedono installer GUI multi-step, mostriamo solo link docs
- [FEATURE] **`INSTALL_DOCS`** mappa `tool → URL docs ufficiale` (link diretto alla pagina di installazione del tool, da aprire nel browser come fallback per i tool GUI-only)
- [FEATURE] **`INSTALL_HINTS`** ora generato automaticamente da `INSTALL_COMMANDS + INSTALL_DOCS` per il tooltip (tutte le piattaforme + link docs su righe separate)
- [FEATURE] **`getInstallCommand(tool, platform)`** helper: ritorna il comando per la piattaforma corrente o `null` se non disponibile
- [FEATURE] **`checkAvailability` enriched**: ogni tool ora include `installCommand` (per platform corrente) + `docsUrl`

### Frontend

- [FEATURE] **Bottone "▶ Installa &lt;tool&gt;"** accanto al badge `⚠ Manca: X`: cliccando apre confirm dialog ("Installare X nel terminale?") + se OK apre drawer terminale + nuova tab + pre-digita il comando install. **Nessun Enter automatico**: l'utente vede il comando completo nel prompt e preme Invio solo se confermato (pattern Pack B v1.0.77)
- [FEATURE] **Bottone "↗ Docs &lt;tool&gt;"** per tool senza one-liner (es. Docker Desktop, gcloud): apre la docs page ufficiale nel browser via `shell.openExternal`
- [FEATURE] **`installDepInTerminal(tool, command)`** helper che orchestra: confirm dialog → check pty capabilities → apre drawer → crea tab pulita (no auto-Enter) → pre-digita comando dopo 600ms
- [STYLE] Nuove classi `.hook-dep-install-btn` (orange CLACOROO) e `.hook-dep-install-docs` (Anthropic blue) con hover diversi

### Sicurezza & non-goals

- ✅ **Confirm dialog OBBLIGATORIO** prima di qualsiasi pre-typing — niente esecuzione accidentale
- ✅ **NIENTE Enter automatico** — l'utente vede il comando intero, valuta, e preme Invio solo se vuole
- ✅ **Comandi presi da fonti ufficiali** dei rispettivi tool (bun.sh, deno.com, rustup.rs, ecc.)
- ❌ **NIENTE sudo escalation automatica**: i comandi `apt install` su Linux richiederanno la password che l'utente inserirà nel terminale
- ❌ **NIENTE installer GUI lanciate da CLACOROO**: per Docker/gcloud apriamo solo il browser sulla docs page (l'utente scarica installer)

## v1.0.90 — 2026-05-26 — Hook dep cache: TTL 60s + refresh esplicito via "↻ Aggiorna"

Feedback utente: ho disinstallato Bun ma le card claude-mem non mostrano "Manca: bun" nemmeno dopo click su "↻ Aggiorna". Root cause: il cache delle availability era in memoria del main process popolato 1 sola volta al boot. Il bottone "↻ Aggiorna" invalidava solo i dati Claude (`get-mcp`, stats), NON il cache `_availabilityCache` di `hookDeps.js` → installazioni/disinstallazioni fatte ad app aperta restavano invisibili fino al restart.

- [FIX] **TTL 60s** sul cache availability (`AVAIL_TTL_MS` in `src/lib/hookDeps.js`): se la cache entry per un tool è più vecchia di 60s, viene rifatta automaticamente al prossimo check. Compromesso fra freshness (test rapidi install/uninstall) e cost (re-spawn di `which`/`shell -lc` per ogni tool è ~1-2s, evitato per chiamate ravvicinate)
- [FEATURE] **IPC `hooks:refresh-deps`** + bridge preload `refreshHookDeps()`: chiamata esplicita che fa `clearCache()` sul main per forzare re-check immediato di tutti i tool
- [FEATURE] **Bottone "↻ Aggiorna" topbar** ora invoca `refreshHookDeps()` PRIMA di `loadData()`: l'utente che ha appena installato/disinstalato un tool clicca il bottone e vede il cambio sulla card subito. Title del bottone aggiornato per riflettere il nuovo comportamento
- [TEST RAPIDO]
  - Disinstalla Bun: `rm -rf ~/.bun` + rimuovi `export PATH` da `~/.zshrc`
  - In CLACOROO clicca **↻ Aggiorna** → card claude-mem (5) ora mostrano badge `⚠ Manca: bun`
  - Reinstalla Bun: `curl -fsSL https://bun.sh/install | bash`
  - Clicca di nuovo **↻ Aggiorna** → badge spariscono. Niente restart richiesto

## v1.0.89 — 2026-05-26 — Hook dep detector fix #2: check robusto a 3 livelli (PATH + login shell + fs.existsSync)

Feedback utente: ho installato Bun ma CLACOROO mostra ancora "Manca: bun" sulle card claude-mem. Root cause: Bun installato in `~/.bun/bin/bun` ma `~/.bun/bin` non è nel PATH del processo Electron (eredita PATH minimal di launchd quando lanciato dal Finder, e anche `npm start` non triggera ricarica `.zshrc`). `which bun` chiamato da CLACOROO falliva, anche se nella shell utente `which bun` funziona perfettamente.

- [FIX] **Check availability a 3 livelli** (`checkAvailabilityOne` in `src/lib/hookDeps.js`):
  1. **`which`/`where`** sul PATH del processo Electron — veloce, copre installazioni Homebrew/system
  2. **`$SHELL -lc 'command -v <tool>'`** — login shell con `-l` legge `.zshrc`/`.bashrc` dell'utente e prende il PATH "vero" (include `~/.bun/bin`, `~/.deno/bin`, ecc. aggiunti dagli installer)
  3. **`fs.existsSync`** su `STANDARD_BIN_DIRS` — fallback finale su lista di directory note: `~/.bun/bin`, `~/.deno/bin`, `~/.cargo/bin`, `~/.local/bin`, `~/.volta/bin`, `~/.pyenv/shims`, `~/.rbenv/shims`, `~/.poetry/bin`, `/opt/homebrew/bin`, `/usr/local/bin`
- [FIX] **`looksLikePath(s)` validation**: alcuni hook startup (es. claude-mem SessionStart che cerca Bun) emettono output spurio tipo "bun not found" su stdout della login shell, che senza validazione veniva preso come "path trovato". Ora accetto solo output che comincia con `/` (Unix) o `C:\` (Windows)
- [FIX] **`command -v` invece di `which`** dentro la login shell: builtin POSIX più affidabile, ritorna SOLO l'absolute path su stdout, niente noise. `2>/dev/null` per silenziare STDERR di eventuali hook precedenti, `|| echo ""` per forzare exit code 0
- [TEST] Verifica empirica su 7 tool: `bun` ora trovato in `~/.bun/bin/bun`, `deno`/`python3`/`gh`/`jq` trovati nei rispettivi path, `wrangler`/`nonexistent` correttamente `✗`. Niente più falsi positivi né falsi negativi
- [SECURITY] Sempre `execFile` con args array (nessuna shell interpolation). Il tool name viene passato come `$1` alla shell login, riferito poi via `"$1"` quoted — nessun injection possibile

## v1.0.88 — 2026-05-26 — Hook dep detector fix: whitelist invece di euristica permissiva (no più falsi positivi)

Feedback utente immediato sul rilascio v1.0.87: il detector mostrava badge "Manca: break, do, done, exit, found, hook, not, plugin, scripts, while, observation, claude-code, session-start, …" — assurdo. Il tokenizer permissivo confondeva **shell keywords** (`break`/`do`/`done`/`while`/`not`), **argomenti di comandi** (`claude-code`/`session-start`/`hook`/`scripts`) e nomi a caso con "tool installabili".

- [FIX BREAKING] **Strategia detector cambiata** da "estrai ogni identifier che assomiglia a tool, poi filtra UBIQUITOUS" → "cerca SOLO tool della whitelist `KNOWN_TOOLS` (chiavi di `INSTALL_HINTS`)". Meglio un falso negativo (mancato avviso su tool esotico fuori lista) che 15 falsi positivi (la versione v1.0.87 era inutilizzabile)
- [FIX] **Regex word-boundary** attorno a ogni tool della whitelist: `(^|[\s;&|\`(<>])tool($|[\s;&|\`)<>])` con escape sicuro dei caratteri speciali. Evita match parziali (`bun` ≠ `bundler`, `python3` ≠ `python3-config`)
- [FIX] **Test reali confermati**:
  - `claude-mem` (`node bun-runner.js …`) → trova `bun` via pattern speciale, niente altro
  - `security-guidance` (`python3 hooks/security-warnings.py`) → trova `python3`
  - `ralph-loop` (`bash hooks/stop.sh`) → niente (correttamente)
  - `watch` (`bash hooks/scripts/check-setup.sh`) → niente
  - `superpowers` (`hooks/run-hook.cmd session-start`) → niente
- [REFACTOR] Helper `getKnownTools()` + `escapeRegex()` per chiarezza. Pattern speciali `SCRIPT_NAME_TO_TOOL` (bun-runner → bun, deno-runner → deno, python-runner → python3) mantenuti per smascherare dipendenze nascoste in script wrapper
- [NOTE] Per aggiungere un tool nuovo basta aggiungerlo in `INSTALL_HINTS` con il suo install command: viene automaticamente cercato

## v1.0.87 — 2026-05-26 — Pack K extension: hook dependency detector (badge ⚠ se tool CLI mancante)

Nuovo detector che analizza i `command` degli hook event di tutti i plugin installati, estrae i tool CLI esterni dichiarati (es. `bun`, `deno`, `python3`, `wrangler`, …) e verifica con `which`/`where` se sono installati nel `PATH`. Sulle card hook compare un badge **"⚠ Manca: bun, deno"** con tooltip che suggerisce come installare gli strumenti mancanti, prima ancora che l'utente apra `claude` e veda errori come "SessionStart:startup hook error · Bun not found".

Caso d'uso originale (sollevato dall'utente): il plugin `claude-mem` richiede [Bun](https://bun.sh) ma se non installato emette errore non-blocking ad ogni boot di `claude`. CLACOROO ora lo segnala in chiaro nella card hook + nel modal dettagli, con il comando esatto di install.

### Backend

- [FEATURE] **`src/lib/hookDeps.js`** nuovo modulo: `detectDepsInCommand(cmd)` tokenizza il command shell (split su whitespace + separatori) ed estrae candidati tool, filtrando UBIQUITOUS set (`sh`, `bash`, `node`, `npm`, `git`, ...). Lista `INSTALL_HINTS` con comando di install ufficiale per 19 tool noti (bun, deno, python3, uv, wrangler, supabase, vercel, gcloud, aws, gh, rg, jq, fzf, cargo, go, docker, poetry, pipx, pnpm, ruby)
- [FEATURE] **Pattern speciali** `SCRIPT_NAME_TO_TOOL`: alcuni hook chiamano `node bun-runner.js` (script che internamente cerca `bun` nel PATH). Regex dedicate per smascherare la dipendenza nascosta — senza, vedremmo solo `node` (ignorato come UBIQUITOUS) e perderemmo il vero requisito
- [FEATURE] **`checkAvailability(tools)`** con cache memory: `which <tool>` su Unix, `where <tool>` su Win, via `execFile` (no shell injection — rispetta CLAUDE.md rule). 1 spawn per tool per session
- [FEATURE] **`collectAllDeps(hookEvents)`**: union di tutte le dep di tutti gli handler di un set di hook event
- [FEATURE] **`readHookEvents` esteso**: ogni handler ora include `detectedDeps: ['bun', 'deno']`
- [FEATURE] **`readAllData` async**: al `get-data` fa il batch check di tutti i tool richiesti dai hook installati + ritorna `hookDepsAvailability: { bun: {installed:true, path:'/usr/local/bin/bun', installHint:'...'}, deno: {installed:false, ...} }`

### Frontend

- [FEATURE] **`missingDepsForHook(item)`** helper: cross-check fra `item.handlers[].detectedDeps` e `state.rawData.hookDepsAvailability`. Ritorna array unique di tool mancanti per quella card
- [FEATURE] **Badge "⚠ Manca: bun"** sulle card hook (`.hook-missing-deps-badge`): colore warning arancione (palette `#fbbf24`), tooltip con install hint multi-linea per ogni tool mancante + nota esplicativa "Installa gli strumenti mancanti per evitare errori `hook startup` al boot di `claude`"
- [FEATURE] **Modal dettagli hook**: nuova riga "Dipendenze CLI" per ogni handler, con pill verde `✓ tool` per tool installati (path = info nel tooltip) o pill arancione `⚠ tool` per mancanti (tooltip = install command)
- [FEATURE] **KPI Dashboard "Hook con dep mancanti"** condizionale: appare solo se `> 0` (per non rumoreggiare quando tutto è ok). Cliccabile → naviga a sezione Hooks per drill-down. Colore warning `#f59e0b`
- [STYLE] Nuove classi `.hook-missing-deps-row`/-badge`, `.hook-handler-deps`/-label`, `.hook-dep-pill.dep-ok`/-miss`

### Non-goals

- ❌ Non installiamo i tool al posto dell'utente (sarebbe troppo invasivo e platform-specific)
- ❌ Non parsiamo realmente la shell (sarebbe overkill): euristica regex sufficiente per il 95% dei command degli hook reali nei plugin Claude Code
- ❌ Non logghiamo tool ubiqui (`sh`, `node`, `git`, ...): rumoreggerebbero le card; se davvero non installati il hook fallirà comunque con errore esplicito al boot

## v1.0.86 — 2026-05-26 — Pack G v2 fix: bottone reconnect HTTP/stdio porta al menu `/mcp` di Claude Code + finding keychain

Risposta al feedback utente sul Pack G v2 v1.0.85: il bottone "Apri claude (OAuth interactive)" lasciava l'utente davanti a una sessione `claude` vuota senza istruzioni — il flow OAuth in Claude Code si triggera SOLO quando un tool MCP viene chiamato, non al boot. Niente OAuth visibile, esperienza inutile.

- [FIX] **Bottone reconnect HTTP-OAuth + stdio-wrapper** ora pre-digita lo slash command `/mcp` 4 secondi dopo il boot di `claude` (tempo che il banner + hook + caricamento contesto finiscano). L'utente vede direttamente il menu MCP ufficiale di Claude Code da dove può fare auth/reconnect sul server specifico. NESSUN Enter automatico: la riga resta digitata, l'utente sceglie se inviare (può anche scrivere altro). Pattern identico al pre-typing delle skill in v1.0.77
- [FEATURE] Toast informativo "Apro `claude` e ti porto al menu `/mcp`" appare al click, così l'utente sa cosa aspettarsi durante i 4s di caricamento
- [LABEL] Bottoni rinominati da "↗ Apri claude (OAuth interactive)" a **"↗ Apri /mcp in claude"** + descrizione aggiornata per riflettere il nuovo comportamento
- [STRUCT] Schema action esteso con campo opzionale `preDigit`: il dispatcher `runMcpReconnectAction` lo invia tramite `pty.write(tab.ptyId, preDigit)` dopo `setTimeout(4000)`. Cross-platform (passa per `node-pty`, già usato in tutto il Pack B)

**Finding keychain (per il TASK Pack G v2.2)**: con autorizzazione esplicita utente, verificato che Claude Code usa **una sola entry keychain** chiamata `"Claude Code-credentials"` (account = username sistema) che contiene tutto il blob di credenziali OAuth (principale + probabilmente token MCP tutti insieme). **Non esistono entries separate per Drive vs Gmail vs Cloudflare** da cancellare chirurgicamente. Modificare il blob significherebbe rischiare di invalidare anche l'OAuth Claude principale → "clear auth vero per singolo MCP" non praticabile via keychain. Strategia confermata: agire solo sul cache locale + delegare reconnect al menu `/mcp` di Claude Code. **Resta giusta la nota originale**: per le API key Anthropic possiamo scrivere nel keychain perché CLACOROO possiede la sua entry dedicata (`clacoroo-api-key`), non modifichiamo entries di altri programmi

## v1.0.85 — 2026-05-26 — Pack G v2: MCP reconnect from CLACOROO (3 azioni contestuali per tipo MCP)

Risposta alla richiesta utente: "aggiungere task per riconnettere gli MCP da dentro CLACOROO". Discovery completata, implementazione MVP delle 3 azioni contestuali per ogni server in `Needs Auth`. CLACOROO ora distingue 3 pattern MCP e offre l'azione più adatta a ognuno, sempre con un fallback "↗ Apri in terminale" universale. **Niente manipolazione diretta dei token** (rispettato vincolo "CLACOROO non scrive mai nel keychain di Claude Code") — si agisce solo sul cache locale `mcp-needs-auth-cache.json`.

### Discovery (findings)

- **3 tipi di MCP osservati** sull'installazione reale:
  1. `claude.ai global` (Drive/Gmail/Calendar) — OAuth server-side, token nel cloud claude.ai. Riautorizzare dal sito
  2. `plugin HTTP/SSE` (Cloudflare/Supabase/Replicate) — OAuth client-side, callback su porta locale. Si triggera durante sessione `claude` interactive
  3. `plugin stdio` (neon via mcp-remote, context7 via npx, claude-mem via sh) — processi locali. Se richiedono auth è il wrapper a farlo (es. `mcp-remote` apre OAuth verso server remoto)
- **Token reali off-limits** per CLACOROO: vivono nel keychain macOS (`security` CLI in modalità system, non scriptable senza permessi profondi) oppure server-side claude.ai. Manipolare = rischio + violazione policy
- **Cache locale** `~/.claude/mcp-needs-auth-cache.json` contiene SOLO entry "needs auth" con timestamp + id (per claude.ai). È safe rimuovere entry: al prossimo `claude mcp list` Claude Code rifà health-check
- **`claude mcp` CLI** non espone `reconnect`/`auth`. Il flow OAuth si triggera automaticamente nelle sessioni interactive. Strategia CLACOROO: **facilitare l'accesso al flow** (apri terminale, pre-digita comando, link claude.ai), non sostituirlo

### Backend (`src/lib/mcp.js` + `src/main.js`)

- [FEATURE] **`detectReconnectType(srv)`**: ritorna `{ type, typeLabel, description, actions }` per ogni server, con i 3 tipi mappati sopra. Le azioni hanno `kind` strutturato: `open-url` (apre browser), `open-terminal` (drawer integrato + comando), `clear-cache` (rimuove entry da `mcp-needs-auth-cache.json`)
- [FEATURE] **`clearAuthCacheEntry(serverId)`**: rimuove l'entry dal cache (operazione safe, non tocca i token reali). Invalida automaticamente la cache MCP renderer per refresh in-place
- [FEATURE] **IPC `mcp:clear-auth-cache`** + bridge preload `mcpClearAuthCache(serverId)`
- [FEATURE] **`get-mcp` arricchito**: ogni server ritornato ora include il campo `reconnect` con detection automatica del tipo

### Frontend (`src/renderer/app.js` + `style.css`)

- [FEATURE] **Badge "Reconnect:" sotto status** sulle card MCP non-connected: colore differenziato per tipo (`mcp-rc-type-claude-ai-oauth` blu, `http-oauth` viola, `stdio-wrapper` verde). Tooltip = descrizione lunga del meccanismo
- [FEATURE] **Footer card MCP** ridisegnato per `status !== 'connected'`: lista bottoni azione (1-2 per server) + descrizione contestuale. Bottoni `btn-primary` (apri URL / apri terminale) + `btn-ghost` (clear cache)
- [FEATURE] **`runMcpReconnectAction(srv, act)`** dispatcher: routing su `kind` con toast di feedback + re-render automatico per `clear-cache`
- [FEATURE] **`open-terminal` action**: riusa `openTerminalWithCommand('claude')` già esistente (Pack B v1.0.69) — apre il drawer integrato CLACOROO, nuova tab, lancia `claude` interactive. L'utente vede il prompt OAuth e completa nella TUI ufficiale
- [STYLE] Nuove classi `.mcp-card-reconnect-type` / `.mcp-rc-label` / `.mcp-rc-type` / `.mcp-card-actions` con palette dedicata per i 3 tipi reconnect

### Non-goals (intenzionali, da NON fare)

- ❌ **Non scriviamo nel keychain Claude Code**: violerebbe il vincolo CLAUDE.md. Per cancellare i token reali l'utente deve usare gli strumenti nativi (Keychain Access / `wrangler logout` / ecc.) — CLACOROO può solo aprire il flow
- ❌ **Non intercettiamo i callback OAuth con un server HTTP locale**: sarebbe man-in-the-middle del flow Claude Code, fragile e fuori scope
- ❌ **Non spawniamo `claude mcp auth`** (non esiste): si lancia `claude` interactive nel terminale integrato — Claude Code prompta l'OAuth alla prima chiamata di tool MCP

### Backlog Pack G v2 (resta in TASK.md per v1.0.86+)

- Disable/Enable singolo server senza disabilitare l'intero plugin
- View tools (mini-client MCP JSON-RPC `tools/list`)
- Remove user-added server (`claude mcp remove <name>`)
- Add MCP da CLACOROO (form modal → `claude mcp add`)

## v1.0.84 — 2026-05-25 — Sidebar icons: refactor completo a Lucide (MIT, self-hosted inline)

Sostituite tutte e 10 le icone della sidebar con il set [Lucide](https://lucide.dev/) (MIT). Le vecchie erano un mix di Heroicons v1 solid (20×20 fill) eterogeneo, con due casi problematici segnalati dall'utente: MCP sembrava "una mutanda" (era un sandwich di archi), Hooks era un mosaico astratto non riconoscibile come uncino.

- [STYLE] **Tutte e 10 le icone sostituite** con Lucide stroke style, viewBox 24×24 uniforme: `layout-dashboard` (Dashboard), `store` (Marketplace), `puzzle` (Plugin), `sparkles` (Skill), `bot` (Agent), `plug-2` (MCP — 2 pin verticali + body con cavo, ora riconoscibile come presa), `anchor` (Hooks — occhiello + asta + curva U, riconoscibile come uncino/ancora), `bar-chart-3` (Stats), `sliders-horizontal` (Config), `settings` (Impostazioni gear)
- [REFACTOR] **CSS centralizzato**: attributi `stroke: currentColor`, `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none` spostati in `.nav-icon` invece che ripetuti su ogni `<svg>`. Le icone Lucide nell'HTML hanno solo `viewBox` + path
- [STYLE] `.nav-icon` width/height **da 16px a 18px** — le Lucide a 24×24 con stroke 2 risultano più "leggere" delle solid Heroicons; +2px riporta il peso visivo allo stesso livello
- [SECURITY] Nessuna libreria esterna runtime, nessun import. SVG sono inline nell'HTML (preservata la CSP `default-src 'self'`). Bundle invariato (~10 path SVG inline aggiungono ~3KB lordi). Lucide è licenza MIT compatibile con AGPL-3.0
- [NOTE] Set Lucide self-hosted significa: niente Font Awesome o icon-font CDN, niente attribuzione runtime, freedom di pickare singole icone senza importare tutto il pack
- [FIX] **Logo README leggibile su dark mode GitHub**: il wordmark `CLA` e `ROO` era in `#141413` (nero Claude), invisibile sul tema scuro di github.com. Aggiunta variante `assets/logo-readme-dark.png` (glyph cream `#faf9f5` + tagline grigio chiaro `#a8a299`) renderizzata da `assets/logo-readme-dark.svg`. README.md e README.it.md ora usano `<picture>` con `<source media="(prefers-color-scheme: dark)">` per servire la variante giusta in automatico. Entrambi i PNG rigenerati a 1080×612 (alta risoluzione per retina display)
- [DOCS] **README aggiornati con sezione Hooks**: aggiunto blocco "⚓ Hooks (v1.0.83+)" subito dopo MCP Server in README.md e README.it.md, con descrizione della feature browser dedicata (event badges, search, filtri, sort, modal dettagli, KPI Dashboard). KPI installation count aggiornato da 9 a 10 (include "hooks · N plugins")

## v1.0.83 — 2026-05-25 — Sezione Hooks (Pack K MVP): browser dedicato per gli hook dei plugin

Aggiunta la nuova sezione **Hooks** nella sidebar (fra MCP e Stats). Aggrega in un browser unico tutti gli hook event di tutti i plugin installati (`hooks/hooks.json`) con card per ogni combinazione evento+matcher, badge colorato per tipo evento, ricerca, filtro per evento e per scope, ordinamento configurabile, modal dettagli con JSON copy. Prima questi hook erano visibili solo dentro il modal "Contenuto plugin" — adesso esistono come superficie autonoma per esplorarli globalmente e capire cosa scatta su quale evento.

- [FEATURE] **Sidebar entry "Hooks"** con icona dedicata, fra MCP e Stats. `data-section="hooks"` switchabile con click o via spotlight Cmd+K. Aggiornati `sectionTitles`, dispatcher `render()`, lista sezioni Cmd+K
- [FEATURE] **`renderHooks()`** (`src/renderer/app.js`): genera lista piatta `{event, matcher, handlers, pluginId, mkt, scope, fullId, sourcePath}` aggregando da `state.plugins.hookEvents` (sia global che local). Card responsive con:
  - **Header**: badge evento colorato (palette `HOOK_EVENT_COLORS` per i 10 event standard Claude Code + grigio fallback) + plugin name + dot color marketplace + scope badge (globale/locale)
  - **Matcher row** (opzionale): label "matcher" + regex/string in `<code>` monospace accent2
  - **Handlers preview**: max 2 righe con badge `type`, `shell`, `async`, `timeout` + comando troncato a 140 char (tooltip = full). "+ N altro/i" se ce ne sono di più
  - **Footer**: bottoni "⌕ Dettagli" + "📁 Apri hooks.json" (apre il file con app default via `shell.openPath`)
- [FEATURE] **Ricerca + filtri**: search input full-text (cerca su event/matcher/pluginId/command), filtro chip per event (multi-tipo con i colori della palette), filtro chip per scope (Tutti / Globali / Locali). Filtri combinabili in AND
- [FEATURE] **Sort dropdown**: 4 modalità (`event-asc`/`event-desc`/`plugin-asc`/`plugin-desc`) con persistenza `state.hookSort` in `state.json`. Helper `HOOK_SORTERS` + `SORT_OPTIONS.hook` coerenti con il pattern Pack L
- [FEATURE] **Modal dettagli hook** (`showHookDetailsModal`): mostra matcher + scope + lista handlers completa con `<pre>` scrollabile per ogni command (utile per claude-mem dove i command sono shell complessi multi-linea). Bottone "⎘ Copia" in header che copia il JSON completo della config hook (event + matcher + hooks array) — pronto da incollare in un `hooks.json` per riusarlo
- [FEATURE] **KPI Dashboard "Hooks"**: card cliccabile con `num: hookList.length` + sublabel "Hooks · N plugin" (cardinalità dei plugin che forniscono hook). Click → naviga alla sezione Hooks. Colore viola `#a78bfa` (palette PreToolUse)
- [BACKEND] **`readHookEvents(hooksDir)` esteso** (`src/main.js`): ritorna ora anche `matchers: [{matcher, handlers: [{type, command, async, timeout, shell}]}]` + `sourcePath` (path assoluto del file `hooks.json`). I campi legacy `matcherCount` + `handlerCount` restano per compat con il modal "Contenuto plugin" già esistente (v1.0.56)
- [STYLE] Nuove classi `.hook-grid`, `.hook-card`, `.hook-event-badge`, `.hook-matcher-row`, `.hook-handler-row`, `.hook-handler-type/-shell/-async/-timeout`, `.hook-handler-cmd/-more`, `.hook-filter-row/-group/-label/-chip`, `.hook-modal/-modal-plugin/-modal-body`, `.hook-detail-row/-label/-value/-title`, `.hook-handler-block/-meta/-pre`. Coerenza visiva con `.skill-grid` + `.scope-badge` esistenti
- [PERSISTENCE] `state.hookSort` restored in `init()` con default `event-asc`. `state.filters.hooks = {search, event, scope}` per mantenere lo stato di ricerca/filtri attraverso re-render
- [NOTE] Pack K v1.0.83 implementa il MVP della roadmap (sidebar + lista + filtri + KPI). Le estensioni opzionali (slow-hook indicator, trigger count stimati, overlap warning fra plugin) restano in backlog per v1.0.84+

## v1.0.82 — 2026-05-25 — Ordinamento universale (Pack L): dropdown sort in Plugin / Skill / Agent / MCP

Replicato in tutte le sezioni a card il pattern di ordinamento già presente in Marketplace dalla v1.0.55, per coerenza UX. Chi impara la dropdown "Ordina:" in una sezione la ritrova ovunque, con preferenza persistita per sezione.

- [FEATURE] **Sezione Plugin**: nuova dropdown "Ordina:" nel countRow con 4 modalità — `name-asc` (A→Z default), `name-desc` (Z→A), `installed-desc` (aggiunti di recente), `installed-asc` (meno di recente). `state.pluginSort` persiste in `state.json`
- [FEATURE] **Sezione Skill**: dropdown sort con 2 modalità — alfabetico A→Z / Z→A. `state.skillSort` persistito
- [FEATURE] **Sezione Agent**: identico a Skill — `state.agentSort` persistito
- [FEATURE] **Sezione MCP**: dropdown sort con 3 modalità — alfabetico A→Z / Z→A + status (`connected` first → `needs-auth` → `disconnected` → resto). `state.mcpSort` persistito
- [FEATURE] **Backend `scanCache`** (`src/main.js`): aggiunto campo `installedAt` (ISO date da `fs.statSync(pluginPath).birthtime`) ad ogni plugin, per supportare l'ordinamento "Aggiunti di recente" lato renderer senza nuove letture FS
- [REFACTOR] `src/renderer/app.js`: nuovi helper condivisi `PLUGIN_SORTERS`, `NAME_SORTERS`, `MCP_SORTERS`, `MCP_STATUS_ORDER`, `SORT_OPTIONS` (labels italiani per ogni modalità) + `renderSortDropdown(currentSort, options, onChange)` che genera la `<select>` standard con la stessa estetica di `mkt-sort-*`. Riduce boilerplate fra sezioni
- [REFACTOR] `renderListSection(items, ...)` accetta nuovo parametro opzionale `sortConfig` (current + options + onChange) renderizzato nell'header — sfruttato da `renderSkills`/`renderAgents`
- [FIX] `applyPluginFilters` indexing: dopo sort, `state.plugins[i]` non corrispondeva più all'ordine delle card nel grid. Risolto memorizzando l'array ordinato in `state._renderedPlugins` e leggendolo come fonte di verità in `applyPluginFilters`
- [STYLE] `src/renderer/style.css`: nuove classi `.sort-dropdown-wrap`, `.sort-dropdown-label`, `.sort-dropdown` (clonate da `.mkt-sort-*` con scope generico). Stessa altezza/padding/colori della dropdown Marketplace per consistenza visiva fra le 5 sezioni
- [PERSISTENCE] `init()` ripristina `pluginSort/skillSort/agentSort/mcpSort` da `state.json` come fa già con `mktSort` (default per ognuno: `name-asc`)
- [BACKLOG CLOSED] Pack F · "rimuovi ⎘ per-riga + copia globale in modal" segnato come done (era stato implementato in v1.0.81)

## v1.0.81 — 2026-05-25 — Modal Skill/Agent: copia globale in header (rimosso ⎘ per-riga)

Refactor del bottone copia introdotto in v1.0.78: il `⎘` sulle card di skill/agent copiava solo il nome del chip stesso, già visibile a colpo d'occhio → bassissimo valore. Sostituito con un singolo bottone copia in alto a destra del modal markdown viewer (accanto alla X di chiusura, con margine 16px) che copia l'**intero contenuto** del documento aperto.

- [REMOVED] `appendRunButton(chip, item, kind)` + relativo CSS `.skill-chip-icon-btn`/`.skill-chip-copy` (era il bottone ⎘ per-riga sulle card skill/agent)
- [REMOVED] Bottone ⎘ dalle chiamate `renderSkills()` + `renderAgents()` (1 riga rimossa per ciascuna)
- [FEATURE] Bottone **"⎘ Copia"** nell'header del modal markdown viewer (`showMarkdownModal`): posizionato fra title e ×, con `margin-right: 16px` di safety gap dalla close button. Copia `content` raw (markdown completo) via `navigator.clipboard.writeText()` + toast verde di conferma "Testo copiato negli appunti"
- [FEATURE] CSS `.md-copy`: stile coerente con design system (background surface + border, hover blu accent2)
- [IMPROVEMENT] Use case sbloccato: condivisione di skill/agent intere come reference o base per istruzioni custom. Prima richiedeva selezionare manualmente tutto il testo del modal

## v1.0.80 — 2026-05-25 — Icona app: angoli trasparenti (non più bianchi)

Risolto problema visivo dell'icona dell'app: gli angoli del bounding box 256×256 (fuori dallo squircle nero) erano riempiti di bianco invece di trasparenza. Visibile nel Dock macOS quando l'app è aperta + nel DMG installer + nei thumbnail di Finder.

- [FIX] `assets/icon-source.svg` → `build/icon.iconset/*.png` rigenerati con `rsvg-convert -b "none"` (background trasparente esplicito). Tool precedente aveva applicato fill bianco di default
- [FIX] `assets/icon.icns` rigenerato da iconset corretto via `iconutil -c icns`. Include 10 dimensioni standard (16, 32, 128, 256, 512 + @2x ciascuna), tutte con angoli alpha=0
- [FIX] `assets/icon.png` (1024×1024, usato per Win/Linux build target) rigenerato con trasparenza
- [FIX] `assets/icon-app-256.png` + `assets/logo-readme.png` (hero del README) rigenerati con trasparenza
- [IMPROVEMENT] Risultato: nel Dock macOS l'icona appare con squircle nero pulito senza halo bianco quando l'app è aperta. Nel DMG installer l'icona drag-and-drop ha angoli trasparenti coerenti con la mascotte CLACOROO

## v1.0.79 — 2026-05-25 — Install zero-touch: ad-hoc signing automatico + hardened runtime off

Risolto il dialog **"CLACOROO è danneggiato e non può essere aperto"** che bloccava gli utenti che scaricavano il `.dmg` dalla release pubblica. Causa: hardened runtime attivo + nessuna firma → macOS Sequoia lo marca come "corrupt" (vedi build precedenti senza signing). Da v1.0.79 in poi l'utente vede solo il prompt standard Gatekeeper **"Apri app scaricata?"** → click "Apri" → app funziona. Zero comandi `sudo`, zero `codesign` manuale.

- [FEATURE] `build/after-pack.js`: hook electron-builder che applica **firma ad-hoc** (`codesign --force --deep --sign -`) al `.app` appena impacchettato (per ogni arch arm64+x64). Soddisfa il requirement di firma di Gatekeeper senza necessitare un certificato Apple Developer ID
- [FIX] `package.json` `"hardenedRuntime": true` → `false`: hardened runtime senza firma "vera" notarizzata è il motivo per cui macOS dichiara "damaged". Disabilitarlo permette ad-hoc signing di essere accettato come signing valida
- [REFACTOR] Rimossi campi `entitlements` + `entitlementsInherit` da `package.json` (irrilevanti senza hardened runtime)
- [DOCS] README.md/README.it.md: aggiornata sezione "macOS Gatekeeper" — il workaround `sudo xattr` + `sudo codesign` non è più necessario. Eventualmente solo `xattr -cr ~/Downloads/CLACOROO-*.dmg` se il browser ha aggiunto quarantine al container

## v1.0.78 — 2026-05-25 — Skill/Agent launcher: solo ⎘ copia (rimosso ▶)

Terza iterazione del launcher (dopo v1.0.75 con `claude -p` e v1.0.77 con `claude` interattivo + pre-typing). Il ▶ è stato rimosso definitivamente: per skill/agent con scope **globale** la tab partiva da HOME, quindi claude si avviava senza contesto di progetto — inutile. Aggiungere un picker progetto avrebbe complicato il flusso senza vantaggio reale rispetto al copy. L'utente apre il proprio terminale nel progetto giusto, lancia claude e incolla `/<skill-name>`: CLACOROO elimina solo l'attrito del "qual era il nome esatto?", senza fare assunzioni sul contesto di lavoro.

- [REMOVED] Bottone ▶ "Apri claude in terminale" + helper `openTerminalForSkillOrAgent(item, kind, cmdText)` da v1.0.77
- [IMPROVEMENT] Icona ⎘ più luminosa: `color` passa da `--text-muted` a `--text` + leggero fill warm `rgba(255,246,232,.06)` di default + `font-size` 13px (era 11). A riposo si vede chiaramente che è interattiva, non sembra disabilitata
- [REFACTOR] `appendRunButton(chip, item, kind)` ora genera un solo `<button>` invece di due. La precondizione `if (!termState.caps.available) return` è stata rimossa: il copy non dipende dal pty, funziona sempre via `navigator.clipboard.writeText()`
- [KEPT] Shell selector + `preferredShell` in Impostazioni (rimangono utili per le tab manuali del drawer terminale)

## v1.0.77 — 2026-05-25 — Skill/Agent launcher: redesign (⎘ copy + ▶ claude interattivo + pre-typing)

Il flusso v1.0.75 con `claude -p "<name>"` era sbagliato per tre motivi: (1) `-p` è one-shot e chiude la sessione dopo una risposta, (2) mandare solo il nome come prompt NON invoca la skill — claude lo legge come testo libero, (3) la skill in Claude Code si attiva con `/<name>` dentro una sessione **interattiva**, non come argomento CLI. Sostituito da due bottoni per chip:

- [FEATURE] **Bottone ⎘ "Copia comando"** su ogni skill/agent card: copia `/<skill-name>` (skill) o `<agent-name>` (agent) negli appunti via `navigator.clipboard.writeText()`. Permette di incollare il comando in qualsiasi terminale esterno, IDE, o sessione claude già aperta in altra tab. Toast verde di conferma con il testo copiato
- [FEATURE] **Bottone ▶ "Apri claude in terminale"** (redesigned): apre drawer + nuova tab + lancia `claude` (interattivo, niente `-p`) + dopo 3.5s pre-digita `/<skill-name>` o `<agent-name>` SENZA premere Enter. L'utente vede claude pronto col comando già scritto e decide se inviare o aggiungere contesto. Per skill/agent con scope locale, la tab parte da `cwd = projectPath` (claude legge il progetto corretto); per gli scope globali da HOME
- [FEATURE] Helper `openTerminalForSkillOrAgent(item, kind, cmdText)` con timing calibrato: 350ms (shell pronta a ricevere `claude`) + 3500ms (claude ha caricato contesto/skills/prompt). Su macchine più lente il testo arriverà durante il loading di claude (no harm done — l'utente può cancellare e ridigitare)
- [REFACTOR] Helper `appendRunButton(chip, item, kind)` riscritto per generare due `<button>` invece di uno. Stesso pattern in `renderSkills` (chip = `/` + skill) e `renderAgents` (chip = agent name, niente `/` perché in claude code gli agent si mention-ano con nome diretto, non slash)
- [REFACTOR] CSS: nuova classe base `.skill-chip-icon-btn` (22×22, hover scale 1.08, transizione 150ms) condivisa fra copy/play. Varianti `.skill-chip-copy` (hover blu accent2 `#6a9bcc`) e `.skill-chip-run` (hover verde Anthropic `#22c55e`)
- [REMOVED] Vecchio bottone v1.0.75 `claude -p "<name>"` + helper `appendRunButton` versione monobottone

## v1.0.76 — 2026-05-25 — Donation channels live (GitHub Sponsors + BMAC + PayPal) + sidebar support buttons

Pack I (Sponsorship & Donations) attivato: tutti e 3 i canali di donazione sono ora live e integrati ovunque.

- [FEATURE] **Sidebar footer "Supporta CLACOROO"** sempre visibile in ogni pagina dell'app (sotto la riga versione/update status): 3 mini-bottoni 💖 (GitHub Sponsors) · ☕ (Buy Me a Coffee) · 💳 (PayPal). Click → `shell.openExternal` apre il canale nel browser di sistema. Hover con colori brand del canale (rosa GitHub, giallo BMAC, blu PayPal). Border-top tratteggiato per separazione visiva dalla status row
- [FEATURE] `.github/FUNDING.yml` con i 3 canali attivi: `github: [Maxymize]` + `buy_me_a_coffee: maxymize` + `custom: ["https://paypal.me/maxymizebusiness"]` → attiva il bottone "❤ Sponsor" nativo nella sidebar del repo GitHub con dropdown a 3 opzioni
- [FEATURE] **README.md + README.it.md header**: nuova riga "💛 Support the project / Supporta il progetto" con 3 badge affiancati (colori nativi GitHub/BMAC/PayPal) subito sotto i badge tecnici (Electron, License, Version)
- [FEATURE] **Sezione dedicata "Support the project / Supporta il progetto"** nei due README estesa con 3 badge "for-the-badge" grandi affiancati + tabella "Which channel should you choose?" che spiega quando preferire GitHub Sponsors (dev ricorrenti, GitHub matching 12 mesi) vs BMAC (creator/micro-donazioni) vs PayPal (utenti tradizionali/IT)
- [REFACTOR] `src/renderer/app.js`: nuova function `attachSupportButtons()` chiamata in `init()` dopo `setupNav()`. URL dei canali letti da attributo `data-url` nell'HTML (no hardcode nel JS)
- [REFACTOR] `src/renderer/index.html`: nuovo blocco `<div class="sidebar-support">` dentro `.sidebar-footer` con 3 `<button>` accessibili (title + aria-label per ogni canale)
- [REFACTOR] `src/renderer/style.css`: nuove classi `.sidebar-support`, `.sidebar-support-label`, `.sidebar-support-btn` con varianti hover per canale (`.ssb-github`, `.ssb-bmac`, `.ssb-paypal`)
- [DOCS] Documento strategia `docs/strategia-lancio/doc-tecnico_strategia-lancio-clacoroo.html` include già la sezione "Pack monetizzazione complementari" che descrive la strategia di donazione multi-canale (v1.0.65)
- [SECURITY] Nessuna modifica alla CSP: i 3 button usano `data-url` letto via `dataset.url` e passato a `window.claudeAPI.openExternal()` (IPC esistente). Niente innerHTML, niente eval, niente CDN

## v1.0.75 — 2026-05-25 — Skill/Agent launcher ▶ + shell selector

- [FIX] **Versione: fonte unica di verità** in Impostazioni. Prima il numero era hardcoded come stringa letterale (`'1.0.74'`) e il footer della sidebar leggeva `app.getVersion()` da package.json: dimenticarsi di aggiornare il letterale causava mismatch (es. footer "v1.0.72", Impostazioni "v1.0.75"). Ora entrambi leggono `d.appVersion` (ritornato da `get-data` IPC, sorgente `app.getVersion()` → `package.json`)
- [FEATURE] **Bottone ▶ "Esegui in terminale"** su ogni card di Skill e Agent (Sezione Skill / Sezione Agent): un click apre il drawer terminale, crea una nuova tab e lancia `claude -p "<skill-name>"` (skill) o `claude -p "Use the <agent-name> agent"` (agent). Per skill/agent con scope locale, la tab parte direttamente dal `cwd` del progetto tracciato; per gli scope globali parte da HOME
- [FEATURE] **Shell selector** in Impostazioni → nuovo gruppo "Terminale" con dropdown "Shell predefinita": default di sistema (`$SHELL`/`pwsh`/`cmd` per piattaforma) + tutte le shell rilevate da `pty.listShells()`. Su Unix: $SHELL, zsh, bash, fish (path Homebrew + system), sh. Su Win: PowerShell 7 (pwsh), Windows PowerShell, cmd. Su Linux: come Unix
- [FEATURE] Persistenza `preferredShell` in `state.json`: la scelta sopravvive ai riavvii dell'app. Applicata a TUTTE le nuove tab del terminale (drawer "+" o bottone ▶ skill/agent o `Cmd+\``). Le tab già aperte continuano a usare la shell con cui sono nate
- [FEATURE] `src/lib/pty.js`: nuova funzione `listShells()` che enumera le shell candidate del sistema con `fs.existsSync` + le ritorna come `[{path,label,kind}]` ordinate per rilevanza piattaforma
- [FEATURE] IPC `pty:capabilities` esteso: ora include `availableShells: [...]` e `preferredShell` (letti rispettivamente da `PTY.listShells()` e `readState().preferredShell`) — caricati una sola volta all'avvio dell'app, niente roundtrip extra
- [FEATURE] CSS `.skill-chip-run` 22×22 round button con hover verde Anthropic `#22c55e` scale 1.08, accanto allo scope badge — `stopPropagation` evita di aprire anche il markdown preview cliccando il chip
- [SECURITY] Il comando passato al terminale (`claude -p "<name>"`) usa virgolette doppie. Il nome di skill/agent è già validato dal regex marketplace upstream (no spazi, no shell metachar) quindi nessuna injection. Vedi `CLAUDE.md` sezione SECURITY
- [REFACTOR] `termCreateTab(opts)` ora applica `termState.preferredShell` come fallback se `opts.shell` non è specificato — pattern identico a `openTerminalWithCommand()` che già propagava `opts.shell || null`

## v1.0.74 — 2026-05-25 — Disclaimer Anthropic + brand cleanup MAXYMIZE

- [DOCS] **Disclaimer Anthropic** aggiunto in cima a README.md (inglese) e README.it.md (italiano): CLACOROO è tool indipendente di terze parti, NON affiliato/sponsorizzato/approvato da Anthropic, PBC. Sviluppato autonomamente da MAXYMIZE per facilitare l'uso della CLI ufficiale Claude Code
- [FEATURE] Box disclaimer in fondo alla sezione Impostazioni dell'app (sotto Informazioni e Licenza): stesso messaggio + CSS warning-style giallo/ambra con border-left accent
- [REFACTOR] Brand name semplificato in tutto il codice: `MAXYMIZE BUSINESS (Maximilian Giurastante)` → `MAXYMIZE` in tutti i file (README, CLAUDE.md, TASK.md, package.json copyright + NSHumanReadableCopyright, header SPDX di tutti i sorgenti, doc-tecnico_handoff.html, About panel macOS). Email contact `info@maxymizebusiness.com` invariata
- [DOCS] README hero logo aggiornato: ora include l'icona ufficiale dell'app (icon_256x256.png con squircle nero + mascotte) sopra al wordmark CLACOROO pixel-art, congruo con look DMG installer
- [DOCS] `assets/icon-app-256.png` aggiunto + `assets/logo-readme.svg` aggiornato con `<image>` riferimento all'icona

## v1.0.73 — 2026-05-25 — README + about panel polish

- [FEATURE] **README.md inglese** (default GitHub) interamente riscritto con tutte le feature v1.0.01-v1.0.72 organizzate per area (Dashboard/Marketplaces/Plugins/Skills/Agents/MCP/Stats/Config/Account+API key/Terminal/Auto-update/UX), sezioni Security, Brand, Architecture, License AGPL-3.0
- [FEATURE] **README.it.md** italiano completo con stesso layout + cross-link bidirezionale dalla intestazione di entrambi
- [FEATURE] `assets/logo-readme.svg` + PNG: hero logo per README con mascotte pixel-art top + wordmark CLACOROO BOLD 7×7 (CO arancio) + tagline, congruo con DMG installer
- [FIX] Acronimo CLACOROO corretto in CLAUDE.md + README: "CLAude COde Cont**RO**l ROom" → "CLA**ude** CO**de** CO**ntrol** ROO**m**" (4 sillabe, non 3)
- [IMPROVEMENT] About panel macOS: rimossa frase "Il nome è la fusione di CLAude-code + COntrol + ROom..." dalla sezione credits (info non rilevante per gli utenti)

## v1.0.72 — 2026-05-25 — DMG installer custom CLACOROO + Press Start 2P sidebar

- [FEATURE] **Installer DMG completamente ridisegnato** 720×460 stile HyperWhisper: finestra ampia, mascotte CLACOROO come signature in alto, wordmark "CLACOROO" BOLD in pixel-art 8-bit (CO arancio brand highlight), tagline "Claude Code Control Room", CTA "Trascina CLACOROO nella cartella Applications →", freccia lunga arancio CLACOROO `#d97757` fra le 2 icone grandi (iconSize 128)
- [FEATURE] Background SVG vettoriale con palette CLACOROO: gradient cream warm + glow soft sui 3 angoli (TR orange, BL Anthropic green, TL blue), linee topografiche stile Claude, pattern dot grid + pixel decorativi sparsi
- [FEATURE] **Wordmark pixel-art bold 7×7** disegnato in SVG `<rect>` (glyph C/L/A/O/R definite come `<symbol>` riusate): congruo visivamente con la mascotte pixel-art, peso bold tipografico, embed-free (no font esterno richiesto da librsvg)
- [FEATURE] Font **Press Start 2P** (SIL OFL) self-hosted in `src/renderer/fonts/PressStart2P-Regular.ttf` + applicato al wordmark sidebar dell'app (size 11px) per coerenza brand con il logo DMG
- [FEATURE] `build/dmgbuild-settings.py`: configurazione completa Python-based per dmgbuild (window 720×520, iconSize 128, posizioni icone, no toolbar/status/sidebar)
- [FIX] **Bypass del bug noto electron-builder + macOS Sequoia** (.DS_Store non scritto correttamente, background DMG ignorato): nuovo flow basato su `dmgbuild` (Python + `ds_store` lib) che costruisce il `.DS_Store` deterministicamente, no AppleScript, no Finder dependency. Vedi issue electron-builder #4170 e #9072
- [FIX] Volume DMG rinominato da "CLACOROO X.Y.Z" a "Install CLACOROO" per evitare cache dimensioni finestra del Finder Sequoia (ricordava window size più piccola)
- [CHORE] Build-time deps macOS: `librsvg` via Homebrew (per `rsvg-convert` SVG→PNG), `dmgbuild` 1.6+ via pip (`pip install dmgbuild`)
- [CHORE] Build-time workaround Python: venv 3.12 con `setuptools` (Python 3.14 ha rimosso `distutils`, node-gyp non builda `node-pty` da source senza)
- [REFACTOR] Comando build full: `PYTHON=/tmp/clacoroo-build-venv/bin/python3 npm_config_python=... npx electron-builder --mac dir` (solo .app, no .dmg interno) + `dmgbuild -s build/dmgbuild-settings.py -D app=<path> "Install CLACOROO" dist/CLACOROO-X.Y.Z-{arch}.dmg` per ogni arch

## v1.0.71 — 2026-05-23 — Pulizia duplicato Console API + bottoni API key inline

- [REMOVED] Bottone "↗ Console API" dalle account-actions di Impostazioni (duplicato di "↗ Console Anthropic" nel pannello API key)
- [IMPROVEMENT] Bottone "↗ Console Anthropic" spostato dentro la stessa riga di Test+Salva nel form API key (in branch chiave attiva sta vicino agli altri action button), invece di stare su una riga separata
- [REFACTOR] Estratto helper `makeConsoleBtn()` riusato sia nel form (chiave non configurata) sia nella vista azioni (chiave attiva)
- [REMOVED] CSS `.apikey-console-link` (margine ad-hoc non più necessario con layout flex unificato)

## v1.0.70 — 2026-05-23 — API key Claude: input + storage cifrato cross-platform

- [FEATURE] Nuovo pannello "API key Claude" in Impostazioni: input + test + salvataggio sicuro + rimozione, no più shell editing
- [FEATURE] Storage cifrato cross-platform: macOS Keychain via `security`, Linux libsecret via `secret-tool` (fallback file 600), Windows DPAPI via PowerShell
- [FEATURE] Integrazione ufficiale `apiKeyHelper` di Claude Code: genera script helper in `~/.claude-control-room/scripts/get-api-key.{sh,cmd}` con chmod 700 e scrive il path in `~/.claude/settings.json`
- [FEATURE] Bottone "Test connessione": valida la chiave via `GET https://api.anthropic.com/v1/models` (200 = OK con count modelli, 401 = invalida, 403 = senza permessi)
- [FEATURE] "Test connessione" anche su chiave già salvata via `testStored` (decifratura lato main, chiave mai esposta al renderer)
- [FEATURE] Bottoni Sostituisci + Rimuovi (con conferma + cleanup completo: keychain entry + script + settings.json)
- [FEATURE] Warning UI quando storage non cifrato (Linux senza libsecret-tools): suggerisce `sudo apt install libsecret-tools`
- [REMOVED] Vecchia guida `.zshrc` `showApiKeyGuideModal()`: sostituita dal pannello autonomo (eliminate ~80 righe + CSS associato)
- [SECURITY] Chiave mai loggata, mai mostrata in chiaro nel renderer (display masked `sk-ant-…xxxx` con ultime 4 char), mai trasmessa via rete da CLACOROO (solo `api.anthropic.com` per test)
- [SECURITY] Script helper chmod 700 (read/exec solo utente owner), service Keychain separato da Claude Code (`com.maxymize.clacoroo.apikey` vs `Claude Code-credentials`)
- [SECURITY] Validation regex stretta `/^sk-ant-[A-Za-z0-9_-]{10,}$/` prima di toccare Keychain/DPAPI (anti shell-injection nel branch PowerShell)
- [FEATURE] IPC `apikey:reconfigure`: rigenera helper script + scrive `apiKeyHelper` in settings.json senza richiedere reinserimento chiave
- [IMPROVEMENT] Status sidecar `apikey.last4` (chmod 600): `status()` mostra le ultime 4 cifre senza decifrare la chiave (evita spawn PowerShell su Win + Keychain prompt su macOS ad ogni open Impostazioni)
- [IMPROVEMENT] `hasSecretTool()` memoizzato a module-load (no `which secret-tool` spawn ripetuti su Linux)
- [IMPROVEMENT] `CLAUDE_CONFIG_DIR` env var onorato (allineato a `usage.js`/`mcp.js`): supporta utenti che spostano la config Claude Code fuori da `~/.claude`
- [FIX] Renderer: `setInline(node, ...)` parametro rinominato da `el` per evitare shadow del helper globale `el()`
- [FIX] Renderer: rimossa branch morta `process?.platform` nel dialog Rimuovi (in contextIsolation `process` non esiste lato renderer)
- [FIX] `https.request` test connessione: aggiunto `req.setTimeout(10000)` esplicito (non bastava `opts.timeout` per garantire hard ceiling sul handshake TLS)
- [REFACTOR] `makeReplaceBtn` / `makeReconfigureBtn`: estratto helper `renderApiKeyForm(container)` + nuovo IPC; eliminato hack del repaint con status finto

## v1.0.69 — 2026-05-23 — Pannello Account: status Disconnesso + bottone Login terminale

- [FIX] Pannello Account: status badge resta "Connesso" verde anche quando il token OAuth è scaduto e il refresh è fallito (401/403 da `/api/oauth/usage`)
- [FEATURE] Status badge dinamico: diventa "● Disconnesso" rosso con pulse quando l'usage call ritorna 401/403
- [FEATURE] Bottone "↗ Login terminale" appare in Account quando auth è broken: apre il terminale integrato e digita+esegue `claude auth login`
- [FEATURE] Sidebar pill account: bordo rosso + icona ⚠ pulsante quando token scaduto, tooltip "Token Claude scaduto — apri Impostazioni per rifare login"
- [FEATURE] Helper `openTerminalWithCommand(cmd, opts)` riutilizzabile per skill launcher (v1.0.70) e altri lanci da UI
- [REFACTOR] `loadAccountUsage(container, onResult)` accetta callback con il risultato per permettere al pannello di aggiornare badge/bottoni in base allo status auth reale

## v1.0.68 — 2026-05-23 — Changelog viewer: formato sintetico con badge per categoria

- [FEATURE] Badge colorati per categoria in ogni voce: FEATURE, FIX, IMPROVEMENT, SECURITY, REFACTOR, DOCS, CHORE
- [IMPROVEMENT] Viewer changelog ridisegnato: una riga per item, drop sezioni e paragrafi di prosa
- [REFACTOR] `parseChangelog` riscritto: estrae badge `[TYPE]` da bullet, separa correttamente date e title della release
- [REFACTOR] `src/renderer/app.js` `openChangelogModal()` semplificato: render flat con badge + testo, niente più section header
- [DOCS] CHANGELOG.md interamente riscritto in formato Conventional Commits-style con badge `[FEATURE]/[FIX]/...`

## v1.0.67 — 2026-05-22 — Pack B foundation: Terminale integrato (drawer + multi-tab + live cwd)

- [FEATURE] Terminale integrato: drawer fisso in basso multi-tab con xterm.js + node-pty
- [FEATURE] Persistenza terminalDrawer in `state.json` (open/height/tabs/activeTabId, restore automatico al riavvio)
- [FEATURE] Status dot per tab: verde idle / arancio busy (pulse) / rosso dead
- [FEATURE] Label tab = cwd corto (`~`, `~/Sviluppo`, `~/…/clacoroo`) con live polling 3s via lsof (macOS) / `/proc/<pid>/cwd` (Linux)
- [FEATURE] Bottone "▣ Terminale" nel topbar + shortcut globale `Cmd+\`` apri/chiudi, `Cmd+T` nuova tab
- [FEATURE] Drawer ridimensionabile drag handle 6px, range altezza 140–800px
- [FEATURE] IPC pty: `pty:capabilities|spawn|input|resize|kill|list|cwd` + eventi push `pty:data` e `pty:exit`
- [FEATURE] Cleanup automatico sessioni shell su `app.before-quit` (`PTY.killAll()`)
- [SECURITY] Validation cwd (deve esistere) / cols (2–1000) / rows (2–500) / shell prima dello spawn pty
- [SECURITY] Spawn solo via `node-pty` (array args, no shell stringa) → zero rischio injection
- [CHORE] Deps runtime aggiunte: `node-pty` 1.1.0 (prebuilds darwin+win), `@xterm/xterm` 6.0.0, `@xterm/addon-fit`, `@xterm/addon-web-links`
- [CHORE] `scripts/fix-node-pty-perms.js` postinstall hook: chmod +x `spawn-helper` (i tarball npm non preservano bit eseguibile su macOS)
- [CHORE] `package.json` `asarUnpack: ['node_modules/node-pty/**/*']` per native module unpacked in produzione

## v1.0.66 — 2026-05-22 — Cleanup residui MIT + gitignore strategia personale

- [DOCS] `CLAUDE.md` riga 4: "Open source MIT" → "Open source AGPL-3.0-or-later, copyright © 2026 MAXYMIZE"
- [DOCS] `docs/doc-tecnico_handoff.html`: KPI licenza `MIT` → `AGPL-3.0+`, file-tree comment LICENSE aggiornato
- [CHORE] `.gitignore`: aggiunto `docs/strategia-lancio/` (materiale strategico personale non pubblicabile)

## v1.0.65 — 2026-05-22 — Switch licenza da MIT a AGPL-3.0-or-later

- [REFACTOR] Switch licenza progetto da MIT a AGPL-3.0-or-later (protezione contro fork commerciali chiusi)
- [FEATURE] Header SPDX-License-Identifier in `src/main.js`, `src/preload.js`, `src/renderer/app.js`
- [FEATURE] About dialog: nuova riga "Licenza" in Impostazioni → Informazioni con bottone "Testo licenza" → gnu.org/licenses/agpl-3.0
- [DOCS] `LICENSE`: testo verbatim AGPL-3.0 ufficiale (661 righe) per match SPDX automatico GitHub Licensee
- [DOCS] `README.md`: badge License `AGPL v3+`, sezione "Licenza" riscritta con spiegazione in italiano (puoi/devi/non puoi) + nota dual licensing
- [DOCS] `package.json`: `"license": "AGPL-3.0-or-later"` (SPDX moderno future-proof), copyright + `NSHumanReadableCopyright` allineati a MAXYMIZE

## v1.0.64 — 2026-05-22 — Fix cache update stale dopo aggiornamento + nota Gatekeeper

- [FIX] Footer mostrava ancora "Aggiornamento disponibile" dopo aver effettivamente aggiornato l'app: cache `lastUpdateResult` non veniva invalidata se `cached.current !== app.getVersion()`
- [FIX] Confronto `cached.current` vs versione reale prima di restituire cache cooldown — se diverso forza un check fresh
- [DOCS] README: nuova sezione "Build non firmato — workaround Gatekeeper" con comandi `xattr -cr` + `codesign --sign -`
- [DOCS] Documentato perché serve il workaround (hardened runtime + identity:null) finché non si applica Apple Developer ID + notarization

## v1.0.63 — 2026-05-22 — Release test full end-to-end soft auto-update

- [CHORE] Bump version tag-only per generare release pubblica con `.dmg` arm64+x64 come asset
- [CHORE] Test end-to-end completo: detect aggiornamento → click UPDATE → download `.dmg` reale → install in `/Applications`

## v1.0.62 — 2026-05-22 — Footer sidebar: versione corrente + indicatore Update

- [FEATURE] Footer sidebar mostra dinamicamente `v1.0.xx` letta da `app.getVersion()` via `appVersion` nel `get-data` IPC
- [FEATURE] Indicatore stato aggiornamento nel footer: verde = aggiornato, arancio + pulse = nuova release disponibile
- [FEATURE] Bottone "UPDATE" arancio inline accanto al numero versione quando c'è update (apre release page nel browser)
- [IMPROVEMENT] Sostituito il count plugin con la versione nel footer (decisione UX: la versione è informazione più importante)

## v1.0.61 — 2026-05-22 — Flash modali eliminato definitivamente

- [FIX] Rimossi 4 `close()` espliciti nei click handler che aprono un nuovo modal (impedivano allo `swapModalOverlay` di funzionare)
- [FIX] Aggiunta classe `.md-overlay-instant` per disabilitare l'animation fade-in durante lo swap modal → modal (no flash della pagina sottostante)

## v1.0.60 — 2026-05-22 — Niente più flash fra modali consecutivi

- [FIX] Nuovo helper `swapModalOverlay(newOverlay)` che appende il nuovo overlay PRIMA di rimuovere il vecchio (atomico in singolo paint del browser)
- [REFACTOR] Pattern swap applicato a tutti i 5 modal (Plugin / Marketplace add / Marketplace content / Markdown / API key guide)
- [REFACTOR] Rimossi guard `if (document.querySelector('.md-overlay')) return;` ora superflui

## v1.0.59 — 2026-05-22 — Cross-platform: editor URL handler su Windows/Linux

- [FIX] Path normalization Windows: `toEditorUriPath()` converte `C:\Users\foo\...` in `/C:/Users/foo/...` per URL handler vscode/cursor/antigravity
- [IMPROVEMENT] Error message platform-aware: hint specifico per OS (macOS: `/Applications`, Win: installer URL protocol, Linux: `xdg-mime`)
- [DOCS] Aggiunta regola "CROSS-PLATFORM ALWAYS-ON" in cima a TASK.md come principio di sviluppo

## v1.0.58 — 2026-05-22 — Editor esterno: aggiunto Antigravity

- [FEATURE] Aggiunto Antigravity (Google) come quarta opzione del selettore editor in Impostazioni
- [FEATURE] Schema URL `antigravity://file/...` registrato lato app

## v1.0.57 — 2026-05-22 — Selettore editor esterno configurabile

- [FEATURE] Nuovo gruppo "Editor esterno" in Impostazioni con select VS Code · Cursor · Sistema (default OS)
- [FEATURE] Preferenza persistita in `state.json` come `preferredEditor`
- [IMPROVEMENT] Prima era hardcoded VS Code, ora scelta utente

## v1.0.56 — 2026-05-22 — Modal plugin: hook dettagliati + apri sorgente + skip sezione

- [FEATURE] Elenco hook event nel modal plugin con conteggio matcher/handler per ciascuno (Setup, SessionStart, UserPromptSubmit, ecc.)
- [FEATURE] Bottoni "📁 Apri nel Finder" + "📝 Apri in editor" anche nel modal "Contenuto plugin"
- [IMPROVEMENT] Click skill/agent nel modal plugin apre direttamente il markdown viewer (un passaggio invece di tre)

## v1.0.55 — 2026-05-22 — Ordinamento marketplace (5 modalità)

- [FEATURE] Nuovo selector "Ordina:" sezione Marketplace con 5 modalità (predefinito, aggiunti recenti/meno recenti, aggiornati recenti/meno recenti)
- [FEATURE] Preferenza ordinamento persistita in `state.json` (`mktSort`)
- [FEATURE] Lettura `birthtime`/`ctime`/`mtime` directory marketplace per "Aggiunti di recente"

## v1.0.54 — 2026-05-22 — Card marketplace: count sempre X/Y se non tutti installati

- [FIX] Marketplace con 0 installati su N disponibili mostrava solo "N" (ambiguo). Ora regola univoca: tutti installati → "N", marketplace vuoto → "0", parziale → "X/Y"

## v1.0.53 — 2026-05-22 — Card marketplace: distinzione installati vs disponibili

- [FEATURE] Card marketplace mostra plugin installati vs disponibili (legge `marketplace.json` reale, non solo `installed_plugins.json`)
- [FEATURE] State `mktList[i]` arricchito con `available` (totale dichiarato) e `installed` (presenti)
- [IMPROVEMENT] Tooltip differenziato: "Vedi e installa plugin" se mancanze, "Vedi plugin installati" se completo
- [IMPROVEMENT] Ordinamento marketplace per `available` desc, poi `installed` desc

## v1.0.52 — 2026-05-22 — Pack H step 2: Install plugin dal marketplace

- [FEATURE] Modal "Plugin del marketplace" mostra tutti i plugin (installati + disponibili) via nuovo IPC `getMarketplaceDetail`
- [FEATURE] Bottone "Installa" sui plugin non installati con preview costo token + conferma prima dell'esecuzione
- [FEATURE] Esecuzione `claude plugins install <name>@<marketplace>` via execFile array (sicuro)
- [FEATURE] Auto-refresh post-install + notifica desktop + activity log
- [FEATURE] Bottone "Dettagli" sui plugin già installati apre il modal Contenuto plugin (drill-down)

## v1.0.51 — 2026-05-22 — Pack H step 1: Add Marketplace dal pannello

- [FEATURE] Bottone "+ Marketplace" nella topbar della sezione Marketplace (contestuale)
- [FEATURE] Modal "Aggiungi marketplace" con input source + helper esplicativo (shorthand GitHub / URL git / path locale)
- [FEATURE] Esecuzione `claude plugins marketplace add <source>` via execFile array
- [FEATURE] Activity log registra ogni aggiunta
- [SECURITY] Validation regex `validMarketplaceSource()` prima della CLI (no shell injection)

## v1.0.50 — 2026-05-22 — Polish badge "N plugin" card Marketplace

- [IMPROVEMENT] Bordo grigio del badge "N plugin" sempre visibile (era invisibile in stato normale)
- [IMPROVEMENT] Proporzione numero/label ribilanciata: numero 22px (era 28), label 13px (era 11) — più leggibile
- [IMPROVEMENT] Hover: label "plugin" si tinge di arancione assieme al numero

## v1.0.49 — 2026-05-22 — Sidebar: ordine gerarchico Marketplace prima di Plugin

- [IMPROVEMENT] Invertito ordine Marketplace ↔ Plugin per riflettere gerarchia logica (Marketplace contengono Plugin contengono Skill/Agent/MCP)
- [IMPROVEMENT] Aggiornati accelerator `Cmd+1..9` e entry command palette per il nuovo ordine

## v1.0.48 — 2026-05-22 — Pulizia striscia "Vedi N plugin" + numero cliccabile

- [IMPROVEMENT] Rimossa striscia full-width gialla "Vedi N plugin" dalle card Marketplace (estetica più coerente)
- [FEATURE] Numero "N plugin" della card ora cliccabile direttamente con hover arancione + glow
- [FEATURE] Tooltip immediato sul numero ("Vedi lista plugin") con sistema `data-tt`

## v1.0.47 — 2026-05-22 — Polish UI plugin card + marketplace coerente

- [IMPROVEMENT] Footer plugin card (toggle + bottoni + Aggiorna/Rimuovi) sempre alla base anche con descrizione corta
- [IMPROVEMENT] Icona occhio ridisegnata (era ovale ambiguo, ora si legge come occhio)
- [IMPROVEMENT] Tooltip immediati `data-tt` sui bottoni icona (no più attesa 2s tooltip nativo)
- [REFACTOR] Card marketplace: rimosso toggle accordion "PLUGIN (N)", sostituito con bottone "👁 Vedi N plugin" che apre modal coerente con Contenuto plugin

## v1.0.46 — 2026-05-22 — Plugin card: icone SVG + modal Contenuto plugin

- [FEATURE] Nuovo bottone occhio (icona SVG) accanto a Finder/editor: apre modal "Contenuto plugin"
- [FEATURE] Modal mostra header, summary numerico (skills/agents/MCP/hook/tok), lista cliccabile di skill e agent
- [FEATURE] Click skill nel modal → switch sezione Skills con filtro pre-applicato; click agent → switch Agents
- [FEATURE] Bottone "↗ Vai a MCP" per plugin che esportano MCP server
- [FEATURE] Badge "N skill / N agent / MCP / Hook" cliccabili: aprono lo stesso modal
- [IMPROVEMENT] Tooltip esplicativo sul badge "tok" (significato dei token always-on)
- [REFACTOR] Emoji 📁 📝 sostituite con icone SVG inline (folder + code)

## v1.0.45 — 2026-05-22 — Per-progetto Stats: design + filtro

- [IMPROVEMENT] Stats > Per-progetto: design KPI-style (valore Inter 18px bold + label uppercase) invece di pillole ovali
- [FEATURE] Filtro progetti fantasma (0 sessioni + 0 messaggi + 0 token) per nascondere directory transient
- [DOCS] Legenda chiarita: count "sessioni" = file `.jsonl` riprendibili, non totale storico

## v1.0.44 — 2026-05-22 — Tooltip istogramma: clamp dentro finestra

- [FIX] Tooltip "Token giornalieri" in Stats > Modelli non esce più dalla finestra: flip a sinistra del cursore se a destra manca spazio, clamp su tutti i bordi

## v1.0.43 — 2026-05-22 — Nota esplicativa percentuali Modelli

- [DOCS] Stats > Modelli: nota sopra la lista chiarisce che le percentuali rappresentano la distribuzione del proprio uso (somma 100%), non quota/limite

## v1.0.42 — 2026-05-22 — Fix percentuali Token per modello

- [FIX] Token per modello in Stats: Opus 4.7 mostrava 24622% al posto di 57.3% (denominatore incoerente input+output vs numeratore totale tipi)
- [FIX] Totale ricalcolato localmente con tutti i tipi (input+output+cache_read+cache_create), somma 6 modelli = 100%

## v1.0.41 — 2026-05-22 — Niente flicker reload Config

- [IMPROVEMENT] Cambio toggle/select/slider in Config non fa più reload pagina con 1-2s di lag
- [IMPROVEMENT] Apertura Config istantanea se i dati sono in cache (no spinner "Caricamento configurazione…")
- [REFACTOR] UI aggiornata ottimisticamente al click; quando filesystem watch rileva nostra stessa modifica saltiamo re-render

## v1.0.40 — 2026-05-22 — Cleanup Impostazioni + fix Voice toggle

- [FIX] Voice toggle: scrive ora `voice.enabled` (nested) come da schema ufficiale, invece di `voiceEnabled` top-level (Claude Code lo ignorava)
- [FIX] Lingua risposte: opzioni cambiate da codici ISO (`en`/`it`) a nomi capitalized (`English`, `Italian`, ecc.) accettati dallo schema
- [FEATURE] Tema Claude Code: aggiunte opzioni mancanti (`dark-daltonized`, `light-daltonized`, `dark-ansi`, `light-ansi`)
- [IMPROVEMENT] Impostazioni → Informazioni compattata in una sola riga (nome + piattaforma + versione + bottone Changelog)
- [REFACTOR] Rimossa sezione "Statistiche" duplicata da Impostazioni (già in Dashboard e Stats)
- [REFACTOR] Emoji 📁 📋 ⤓ ⤒ sostituite con icone SVG coerenti alla sidebar

## v1.0.39 — 2026-05-22 — Quote sessione/settimana cross-platform

- [FEATURE] Quote sessione/settimana funzionano ora anche su Windows e Linux: legge token OAuth dal file fallback `~/.claude/.credentials.json`
- [IMPROVEMENT] Messaggi di errore distinguono causa per piattaforma (Keychain/file/Credential Manager)

## v1.0.38 — 2026-05-22 — Riorganizzazione Dashboard + Config standalone

- [IMPROVEMENT] Dashboard riorganizzata: in cima "Stima contesto" e "Quote Claude" (info che cambiano più spesso), poi KPI installazione "Statistiche", poi KPI "Utilizzo Claude Code"
- [FEATURE] Sezione "Config" promossa a voce sidebar autonoma con icona + accelerator `Cmd+8` (rimossa dal tab Stats)
- [IMPROVEMENT] Tooltip immediato sopra ogni pallino dell'Effort slider con nome esteso

## v1.0.37 — 2026-05-22 — Fix percentuali quote (display 1400%)

- [FIX] Percentuali quote ora corrispondono al plugin VS Code Claude (erano 100× più grandi, es. 1400% al posto di 14%)
- [FIX] API Anthropic restituisce `utilization` già in scala 0–100, non come float 0–1; rimossa moltiplicazione errata
- [IMPROVEMENT] Clamp di sicurezza [0, 100] contro transienti API

## v1.0.36 — 2026-05-22 — Fix critici quote OAuth

- [FIX] Header obbligatorio `anthropic-beta: oauth-2025-04-20` aggiunto (causa principale del 401 in v1.0.35)
- [FIX] Parsing keychain corretto: payload annidato sotto `claudeAiOauth.accessToken`, non flat
- [FEATURE] Refresh token automatico via `POST platform.claude.com/v1/oauth/token` se token in scadenza (entro 5min) o su 401
- [SECURITY] Token rinnovato SOLO in memoria del processo: CLACOROO non riscrive mai il keychain di Claude Code

## v1.0.35 — 2026-05-22 — Quote sessione/settimana visibili

- [FEATURE] Quote sessione e settimana visibili in CLACOROO: 3 barre (Session 5h · Weekly 7d · Weekly Sonnet) con percentuale + tempo al reset
- [FEATURE] Visibili in pannello "Account Claude" di Impostazioni e nuova sezione "Quote Claude" della Dashboard
- [FEATURE] Colore barra in base alla soglia: blu fino all'80%, arancio 80–95%, rosso oltre
- [FEATURE] Bottone "Gestisci usage su claude.ai →"
- [FEATURE] Lettura via `GET /api/oauth/usage` con token OAuth del macOS Keychain
- [IMPROVEMENT] Cache 60s + render ottimistico per zero flicker

## v1.0.34 — 2026-05-22 — Logout: tooltip custom invece di box arancio

- [IMPROVEMENT] Tooltip stilizzato su hover bottone Logout (card + freccia + lista istanze impattate) invece del box arancio fisso
- [REFACTOR] Estetica pannello Account più pulita

## v1.0.33 — 2026-05-22 — Avviso esplicito Logout globale

- [FEATURE] Box arancio "⚠ Il logout disconnette OVUNQUE (CLACOROO + CLI + IDE)" già visibile prima del click
- [IMPROVEMENT] Dialog di conferma riscritto con dettaglio macOS Keychain condiviso
- [IMPROVEMENT] Bottone "Sì, logout globale" invece del generico "Logout"

## v1.0.32 — 2026-05-22 — Effort level slider 5 pallini

- [FEATURE] "Effort level" come slider a 5 pallini blu stile VS Code Claude plugin (low → max), click imposta livello
- [FEATURE] Label dinamico accanto al titolo ("Effort (xhigh)") mostra il livello corrente
- [FIX] Link "↗ claude.ai" nel pannello Account: ora punta a `https://claude.ai/settings/billing` (era URL inesistente su claude.com)

## v1.0.31 — 2026-05-22 — Guida modalità API key (nessun salvataggio)

- [FEATURE] Bottone "ℹ Modalità API key" nel pannello Account: guida step-by-step per chi vuole usare API key pay-per-use
- [SECURITY] CLACOROO NON salva, legge o trasmette mai la chiave: la guida mostra come impostarla in `.zshrc`/`.bashrc` e copia comandi in clipboard

## v1.0.30 — 2026-05-22 — Effort level in Config tab

- [FEATURE] Tab Config: selettore "Effort level" (low/medium/high/xhigh/max) modifica `effortLevel` di `settings.json` istantaneamente

## v1.0.29 — 2026-05-22 — Pill account in sidebar + bottoni accesso rapido

- [FEATURE] Pill account sempre visibile in sidebar (badge piano + email, sotto Recenti, sopra Stato), click apre Impostazioni
- [FEATURE] Pannello Account: bottoni "↗ claude.ai" (subscription) + "↗ Console API" (billing, API keys, usage)

## v1.0.28 — 2026-05-22 — KPI "Valore API stimato" in USD

- [FEATURE] Nuovo KPI "Valore API stimato" in Stats e Dashboard: USD se pagassi pay-per-use (stima risparmio Max plan)
- [FEATURE] Calcolo basato sui prezzi pubblici Anthropic (Opus, Sonnet, Haiku con cache read/write proporzionali)
- [FEATURE] Range Tutto / 30g / 7g (sub-range stimati per proporzione di messaggi)

## v1.0.27 — 2026-05-21 — Pannello Account Claude in Impostazioni

- [FEATURE] Nuovo pannello "Account Claude": piano (badge Max/Pro/Team colorato), email, org, ID org, auth method, API provider
- [FEATURE] Bottoni "Aggiorna" e "Logout" con conferma esplicita
- [IMPROVEMENT] Cache 5 minuti per non rilanciare `claude auth status` a ogni apertura sezione

## v1.0.26 — 2026-05-21 — Card KPI: glow morbido invece di linea colorata

- [IMPROVEMENT] Card KPI: rimossa linea colorata top, sostituita con glow morbido che avvolge la card e si intensifica in hover
- [IMPROVEMENT] Bordo card tinto del colore di accent ma desaturato per coerenza palette dark

## v1.0.25 — 2026-05-21 — Card KPI compatte + spacing Dashboard

- [IMPROVEMENT] Card KPI più compatte: padding ridotto, numero 26px (era 32), griglia min-width 140px (era 160)
- [IMPROVEMENT] Dashboard: spazio aggiuntivo tra "Marketplace" e "MCP server" per leggibilità

## v1.0.24 — 2026-05-21 — Sezione MCP server in Dashboard

- [FEATURE] Nuova sezione "MCP server" sotto "Marketplace" in Dashboard con chip cliccabili (dot colorato per stato)
- [REFACTOR] Sezione MCP: rimossi link cliccabili su URL (endpoint MCP non sono pagine web), resta solo bottone copia

## v1.0.23 — 2026-05-21 — Stima contesto: nuovo segmento MCP server

- [FEATURE] Barra "Stima contesto" include nuovo segmento MCP servers (colore ciano) accanto a Skills/System prompt/Agents/Memory/Free
- [FEATURE] Stima ~400 token per MCP server connesso (mediana osservata sui plugin ufficiali)
- [FEATURE] Aggiornamento real-time quando attivi/disattivi plugin con MCP server
- [REFACTOR] Cache MCP invalidata automaticamente ad ogni cambio plugin

## v1.0.22 — 2026-05-21 — Polish sezione MCP

- [IMPROVEMENT] Filtri MCP: divisore verticale fra tipo (claude.ai / plugin) e stato
- [FEATURE] Bottone copy negli appunti su ogni card MCP per URL/comando
- [FEATURE] URL HTTP/SSE cliccabili: si aprono nel browser di sistema (utile per OAuth dei server "Needs Auth")

## v1.0.21 — 2026-05-21 — Pack G: Sezione MCP server

- [FEATURE] Nuova sezione "MCP" in sidebar: lista tutti gli MCP server configurati con stato Connected/Needs Auth/Errore
- [FEATURE] Card stile Marketplace per ogni server (nome, origine, transport, URL/comando, badge stato)
- [FEATURE] Filtri per stato e tipo (claude.ai / dai plugin)
- [FEATURE] Bottone "Aggiorna stato live" rilancia health-check ufficiale
- [FEATURE] KPI "MCP connessi" in Dashboard (X/Y)

## v1.0.20 — 2026-05-21 — Stima contesto: animazione fluida segmenti

- [FIX] Barra "Stima contesto" non sparisce più quando attivi/disattivi plugin: segmenti animano fino al nuovo valore (era flash bianco ~1s)
- [REFACTOR] Aggiornamento in-place dei valori senza ricostruire DOM, transizione CSS su width

## v1.0.19 — 2026-05-21 — Stima contesto in pagina Plugin + live update

- [FEATURE] Barra "Stima contesto" anche in cima alla pagina Plugin
- [FEATURE] Tutte le barre aggiornano dinamicamente su attivazione/disattivazione/update/rimozione plugin
- [REFACTOR] Cache statistiche invalidata sia post-azione plugin sia su modifica esterna di `settings.json`

## v1.0.18 — 2026-05-21 — KPI Utilizzo Claude Code in Dashboard

- [FEATURE] Dashboard arricchita con 9 KPI di "Utilizzo Claude Code" (Sessioni, Messaggi, Token, Giorni attivi, Giorno più attivo, Streak, Ora di punta, Modello preferito)
- [FEATURE] Barra "Stima contesto" in Dashboard con legenda orizzontale compatta
- [REFACTOR] Statistiche condivise fra Dashboard e Stats (no doppio I/O)

## v1.0.17 — 2026-05-21 — KPI Modello preferito: nome esteso

- [IMPROVEMENT] "Modello preferito" mostra nome esteso (`Opus 4.7`, `Sonnet 4.6`) invece di abbreviato
- [IMPROVEMENT] Etichetta KPI estesa "Modello Preferito" su due righe (era troncata)

## v1.0.16 — 2026-05-21 — Fix KPI Sessioni: count reale .jsonl

- [FIX] KPI "Sessioni" conta i file `.jsonl` reali in `~/.claude/projects/` (era sottostimato dalla cache aggregata)
- [IMPROVEMENT] Filtri 30g/7g applicano count reale per data modifica file (allineato a `claude /stats`)

## v1.0.15 — 2026-05-21 — Allineamento dati con `claude /stats`

- [FIX] "Token totali": somma solo input+output (era ~400× più alto includendo cache_read che è gratis)
- [FEATURE] Filtri Tutto / 30g / 7g applicano anche ai KPI (non solo alla heatmap)
- [FEATURE] Nuovo KPI "Giorno più attivo" (data con più messaggi nel range)
- [IMPROVEMENT] "Giorni attivi" mostra ratio `attivi/totali` quando range 30g/7g (es. "18/30")
- [IMPROVEMENT] "Modello preferito" per range 30g/7g ricalcolato dal periodo, non all-time

## v1.0.14 — 2026-05-21 — Heatmap stile Claude Desktop + 8 KPI

- [FEATURE] Heatmap ridisegnata stile Claude Desktop: 52 settimane × 7 giorni (anno intero), label mesi, tooltip dettagliato
- [FEATURE] 8 KPI sopra heatmap (Sessioni, Messaggi, Token, Giorni attivi, Streak, Ora di punta, Modello preferito)
- [FEATURE] Filtri "Tutto / 30g / 7g" per periodo heatmap
- [FIX] Stima contesto realistica: per skill/agent conta solo frontmatter YAML (era 417%, ora < 100%)
- [DOCS] Nota chiarificatrice: "Per skill/agent conta solo il frontmatter — il body viene caricato solo quando invocata"

## v1.0.13 — 2026-05-21 — Heatmap GitHub style + Stima contesto

- [FEATURE] Heatmap attività stile GitHub contribution graph (13 settimane × 7 giorni, label mesi, legenda intensità)
- [FEATURE] Nuova "Stima contesto" stile `claude /context`: barra orizzontale System prompt/Memory/Skills/Agents, fill su 200k
- [FEATURE] Istogramma giornaliero token con tooltip per-modello (top 3)
- [FEATURE] Tab Per-progetto: aggiunto count messaggi e nota chiarificatrice
- [FIX] Toggle Always Thinking/Voice nel Config tab non si resetta più dopo 1s (cache invalidata su cambio settings.json)

## v1.0.12 — 2026-05-21 — Sezione Stats (4 tab)

- [FEATURE] Nuova sezione "Stats" con 4 tab: Overview (KPI + heatmap 90gg), Modelli (barre token + istogramma), Per-progetto (lista progetti con sessioni e token), Config (editor visuale settings.json)
- [FEATURE] Heatmap stile GitHub contribution graph con palette CLACOROO
- [IMPROVEMENT] Caching server-side 60s + client-side per zero re-I/O su cambio tab
- [REFACTOR] Path progetti decodificato leggendo `cwd` dei file JSONL (più affidabile del decode ambiguo dir)

## v1.0.11 — 2026-05-21 — Scope locale/globale: progetti tracciati

- [FEATURE] Tracking progetti: CLACOROO mostra anche plugin/skill/agent installati nel `.claude/` locale di ciascun progetto tracciato
- [FEATURE] Bottone "+ Progetto" in topbar per aggiungere progetto
- [FEATURE] Sezione Impostazioni "Progetti tracciati" per gestire lista
- [FEATURE] Badge "globale" (blu) / "locale: nome-progetto" (verde) su ogni plugin/skill/agent
- [FEATURE] Auto-refresh su modifica `.claude/plugins/installed_plugins.json` dei progetti

## v1.0.10 — 2026-05-21 — Command palette Cmd+K + Changelog viewer + Sidebar recenti

- [FEATURE] Command palette globale: `Cmd+K` per cercare/aprire plugin/skill/agent/marketplace + azioni rapide
- [FEATURE] Changelog viewer integrato: bottone "📋 Changelog" in Impostazioni con schede colorate per versione
- [FEATURE] Sidebar arricchita con sezione "Recenti" (ultime attività eseguite, click per saltare al contesto)

## v1.0.09 — 2026-05-21 — Soft auto-update via GitHub Releases API

- [FEATURE] Check automatico aggiornamenti all'avvio + ogni 24h via GitHub Releases API
- [FEATURE] Banner topbar quando esce nuova versione con bottone "Apri pagina download"
- [FEATURE] Sezione Impostazioni → Aggiornamenti con check manuale e toggle auto-check
- [FEATURE] Possibilità "Ricorda più tardi" o "Salta questa versione" (state persistente)
- [DOCS] Soft update: nessun download/install in-app, solo notifica + link al `.dmg`

## v1.0.08 — 2026-05-21 — Mascotte ridisegnata + about panel pulito

- [IMPROVEMENT] Mascotte ridisegnata: testa più tonda, 4 zampette ben definite, occhi grandi con highlight
- [IMPROVEMENT] Antenna in grigio caldo, visibile sullo sfondo scuro
- [IMPROVEMENT] Sotto il logo CLACOROO appare la versione estesa "CLAude-code COntrol ROom"
- [IMPROVEMENT] About panel pulito con copyright aggiornato
- [CHORE] Icona app rigenerata con la nuova mascotte

## v1.0.07 — 2026-05-21 — Sicurezza hardening + UX nativa desktop

- [SECURITY] `sandbox: true` esplicito in `BrowserWindow.webPreferences`
- [SECURITY] `setWindowOpenHandler` blocca popup, ridirige `https?:` a `shell.openExternal`
- [SECURITY] `webContents.on('will-navigate')` blocca navigazioni esterne
- [SECURITY] `app.requestSingleInstanceLock()` + handler `second-instance` (early return)
- [FEATURE] Application menu nativo macOS con accesso a tutte le sezioni
- [FEATURE] Shortcut tastiera: `Cmd+R` refresh, `Cmd+Q` quit, `Cmd+,` Impostazioni, `Cmd+1..6` switch sezione
- [FEATURE] About panel con info versione e link al repository
- [FEATURE] Notifiche native macOS su enable/disable/update/uninstall plugin (solo se app non in focus)
- [FEATURE] Persistenza `windowBounds` + `lastSection` in `~/.claude-control-room/state.json`

## v1.0.06 — 2026-05-21 — Tipografia Anthropic-inspired

- [FEATURE] Inter variable (SIL OFL) self-hosted per UI/brand/KPI
- [FEATURE] Source Serif 4 variable (SIL OFL) self-hosted per markdown body
- [FIX] Icona Dock e nome app personalizzati anche in modalità sviluppo
- [SECURITY] CSP estesa con `font-src 'self'` esplicito
- [DOCS] LICENSE + NOTICE per font bundled (richiesto SIL OFL)

## v1.0.05 — 2026-05-20 — Sette idee feature locali (goal mode)

- [FEATURE] Bottoni "Apri nel Finder" / "Apri in editor" su ogni plugin card
- [FEATURE] Activity log `~/.claude-control-room/activity-log.json` con sub-section Dashboard
- [FEATURE] Plugin Validator (`claude plugins validate <path>`) in Impostazioni
- [FEATURE] Onboarding tour first-run con 5 step + bottone Riavvia in Impostazioni
- [FEATURE] Health check skill/agent: badge ⚠ su frontmatter mancante/malformato + KPI Dashboard
- [FEATURE] Export/import snapshot `.clacoroo` (marketplaces + plugin + blocklist)
- [FEATURE] Visualizzatore SKILL.md/agent.md inline (modal markdown DOM-based)
- [FIX] `enabledPlugins` di `~/.claude/settings.json` è la fonte di verità (non `blocklist.json`)
- [FIX] `fs.watchFile` (polling) sostituisce `fs.watch` per affidabilità cross-platform
- [REFACTOR] Estratti `src/lib/markdown.js`, `state.js`, `snapshot.js`

## v1.0.04 — 2026-05-20 — Packaging cross-platform (.dmg/.exe/.AppImage)

- [FEATURE] Pacchetto distribuibile macOS (.dmg arm64 + x64), Windows (.exe NSIS + portable), Linux (.AppImage + .deb + .rpm)
- [FEATURE] App icon personalizzata con mascotte CLACOROO
- [FEATURE] macOS hardened runtime + dark mode support nativo
- [FEATURE] Windows NSIS: `oneClick: false`, `allowToChangeInstallationDirectory: true`, `asInvoker` (no admin)
- [FEATURE] Linux desktop entry con category Development/Utility

## v1.0.02 — 2026-05-19 — Rebrand CLACOROO + identità visiva Claude

- [FEATURE] Rebrand a CLACOROO con identità visiva ispirata a Claude (Anthropic)
- [FEATURE] Palette arancione caldo + neutri caldi Claude (`#d97757` accent)
- [FEATURE] Mascotte pixel-art (SVG `<rect>` only) integrata in sidebar e loading screen
- [FEATURE] Logo "CLACOROO" con "CO" arancione (sovrapposizione Code/Control)
- [FEATURE] Animazione `mascotBob` nel loading screen
- [DOCS] README riscritto in italiano con etimologia + sezione brand

## v1.0.01 — 2026-05-19 — Prima release: foundation

- [FEATURE] Gestione visuale di plugin, marketplace, skill e agent di Claude Code
- [FEATURE] Dashboard con KPI di sintesi (plugin attivi/disattivati, marketplace, skill/agent totali)
- [FEATURE] Toggle enable/disable plugin, update e uninstall via CLI `claude plugins`
- [FEATURE] Sezione Marketplace, Skill, Agent: browser ricercabile
- [FEATURE] Impostazioni: percorsi rilevati, statistiche, configurazione manuale binario `claude`
- [FEATURE] Auto-refresh quando file di configurazione cambiano esternamente
- [FEATURE] Toast notification per feedback azioni
- [SECURITY] Architettura sicura: `contextBridge` + `contextIsolation: true` + `nodeIntegration: false`
- [SECURITY] `execFile` con array args (zero shell injection)
- [SECURITY] Validazione regex su `pluginId` e `marketplaceName` prima della CLI
- [DOCS] Documento di handoff tecnico (`docs/doc-tecnico_handoff.html`)
