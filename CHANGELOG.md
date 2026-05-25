# Changelog

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

- [DOCS] `CLAUDE.md` riga 4: "Open source MIT" → "Open source AGPL-3.0-or-later, copyright © 2026 MAXYMIZE BUSINESS"
- [DOCS] `docs/doc-tecnico_handoff.html`: KPI licenza `MIT` → `AGPL-3.0+`, file-tree comment LICENSE aggiornato
- [CHORE] `.gitignore`: aggiunto `docs/strategia-lancio/` (materiale strategico personale non pubblicabile)

## v1.0.65 — 2026-05-22 — Switch licenza da MIT a AGPL-3.0-or-later

- [REFACTOR] Switch licenza progetto da MIT a AGPL-3.0-or-later (protezione contro fork commerciali chiusi)
- [FEATURE] Header SPDX-License-Identifier in `src/main.js`, `src/preload.js`, `src/renderer/app.js`
- [FEATURE] About dialog: nuova riga "Licenza" in Impostazioni → Informazioni con bottone "Testo licenza" → gnu.org/licenses/agpl-3.0
- [DOCS] `LICENSE`: testo verbatim AGPL-3.0 ufficiale (661 righe) per match SPDX automatico GitHub Licensee
- [DOCS] `README.md`: badge License `AGPL v3+`, sezione "Licenza" riscritta con spiegazione in italiano (puoi/devi/non puoi) + nota dual licensing
- [DOCS] `package.json`: `"license": "AGPL-3.0-or-later"` (SPDX moderno future-proof), copyright + `NSHumanReadableCopyright` allineati a MAXYMIZE BUSINESS

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
