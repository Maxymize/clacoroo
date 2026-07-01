# Changelog

> Italiano (canonico). English translation: [CHANGELOG.en.md](./CHANGELOG.en.md) — allineato a ogni release.

## v1.2.1 — 2026-07-01 — Modelli: rispecchia il selettore di Claude Code

- [FIX] Il dropdown modelli in Claude Config ora mostra solo i tier selezionabili di default in Claude Code (Default, Opus, Sonnet, Haiku, Fable), scritti come alias. `sonnet` punta sempre al modello Sonnet corrente (oggi Sonnet 5), così resta valido anche con i modelli futuri
- [IMPROVEMENT] Fuori dal dropdown gli ID specifici "altri/previous" (es. Opus 4.7, Sonnet 4.6), che in Claude Code stanno dietro "Altri modelli" o richiedono `--model`; i valori già salvati in settings.json restano preservati

## v1.2.0 — 2026-07-01 — Sonnet 5 tra i modelli + Sessioni consolidate

- [FEATURE] Sonnet 5 (`claude-sonnet-5`) ora selezionabile tra i modelli in Claude Config; pricing e nome "Sonnet 5" riconosciuti anche nelle statistiche di costo e nelle card sessione
- [REFACTOR] Pulizia interna della sezione Sessioni (comportamento invariato)

## v1.1.39 — 2026-06-30 — Sessioni: drill-down progetti + ricerca globale + breadcrumb

- [FEATURE] Vista Sessioni ora a due livelli: griglia di progetti (una card per cartella, con n. sessioni, costo, turni) → sessioni del progetto selezionato, con breadcrumb per tornare indietro
- [FEATURE] Ricerca globale: digitare filtra le sessioni di tutti i progetti contemporaneamente; ordinamento progetti per ultima attività, creazione, costo o numero di sessioni
- [FEATURE] Ogni card sessione mostra data e ora esatte di creazione e ultima modifica, oltre al "x giorni fa"
- [FIX] Anteprima del primo messaggio più pulita: salta i tag di contesto IDE e l'output della skill /watch invece di mostrarli come prompt
- [FIX] Transcript più leggibile: padding del contenuto e elenchi puntati non più tagliati a ridosso del bordo

## v1.1.38 — 2026-06-29 — Sessioni: pagina lista + modal transcript leggibile

- [FEATURE] Nuova pagina Sessioni: elenco di tutte le sessioni di lavoro in ~/.claude/projects/ con card (cartella, primo messaggio, tempo, turni, costo) o vista compatta a righe
- [FEATURE] Ricerca per cartella o primo messaggio, ordinamento per ultima attività o data creazione, toggle cards/lista
- [FEATURE] Modal transcript: clicca una sessione per leggere la conversazione con windowing (40 entry per volta, carica altro allo scroll), tool collassabili
- [FEATURE] Azioni rapide nel modal: riprendi nel terminale interno, apri terminale esterno, copia comando `claude --resume`, apri cartella

## v1.1.37 — 2026-06-29 — Statistiche dal vivo: token in chiaro, costo reale, attribuzione

Le statistiche ora si calcolano dal vivo dai transcript delle sessioni, non più da una cache che restava indietro. Più accurate e più trasparenti.

- [FEATURE] Stats calcolata dal vivo: i "token di lavoro" (input + output) in evidenza, con la cache (read/write) separata e spiegata invece di un unico numero da miliardi gonfiato dal contesto riletto
- [FEATURE] Costo API reale per ogni tipo di token (input/output/cache), per modello e per progetto — il valore equivalente di ciò che hai davvero consumato
- [FEATURE] Nuovo tab **Attribuzione**: quanto costo è attribuibile a ogni plugin/skill/agent/server MCP, più la ripartizione sessione principale vs subagent
- [FEATURE] Nuovo tab **Efficienza**: cache hit ratio, contesto medio per turno, turni oltre 150k token e i tool più usati con tasso di errore
- [IMPROVEMENT] Heatmap, modelli, progetti e tutte le metriche rispettano il filtro periodo (7g / 30g / Tutto)

## v1.1.36 — 2026-06-25 — MCP: server connessi/falliti di nuovo visibili + scope progetto

- [FIX] Il pannello MCP mostrava solo i server "needs auth" e segnava "0 connected": il parser di `claude mcp list` non riconosceva i simboli di stato attuali di Claude Code (✔ connesso, ✘ fallito) e scartava silenziosamente tutti i server connessi e falliti. Ora compaiono di nuovo tutti
- [FIX] Il dettaglio di un plugin mostrava "MCP —" anche per i plugin che forniscono MCP (es. claude-mem, cloudflare, neon, context7, supabase): il rilevamento cercava `mcp.json` invece dello standard `.mcp.json`. Ora rileva i server, ne mostra il numero ed elenca i nomi nel dettaglio plugin
- [FEATURE] Mostrati anche gli MCP **project-scoped** (definiti in `.claude.json` per una cartella), con badge "progetto: …" e filtro "Da progetto". Il cestino **Rimuovi** ora funziona anche su di loro (oltre agli user-added) e li toglie davvero dalla config
- [FEATURE] Pulsante **"Disconnetti"** sui server MCP OAuth connessi (HTTP/SSE): azzera l'autenticazione (`claude mcp logout`) per riautorizzarli, anche con un altro account — utile per spostare un MCP da un account all'altro
- [IMPROVEMENT] MCP forniti da un plugin: la card spiega che si gestiscono dal plugin e un pulsante **"Gestisci plugin"** porta direttamente al plugin proprietario nella sezione Plugin; i connettori claude.ai indicano che si gestiscono su claude.ai. La conferma di rimozione ricorda che le sessioni `claude` già aperte vedono il server finché non vengono riavviate

## v1.1.35 — 2026-06-24 — Quota Claude: scheda dedicata + stop al consumo di rate-limit

Nuova scheda per quote e insight di utilizzo, e CLACOROO non incide più sui limiti/overload del tuo account mentre resta aperto.

- [FEATURE] Nuova scheda **Quota Claude** in Stats: le barre dei limiti (Session 5h, Weekly 7g, Weekly Sonnet) e "Cosa incide sui limiti" con toggle Giorno/Settimana (contesto >150k, sessioni con molti subagent, 8+ ore, 4+ in parallelo, per-plugin). Calcolata in locale dai transcript, zero chiamate API
- [FIX] CLACOROO non rinnova più il token OAuth: rinnovandolo poteva invalidare quello usato da Claude Code (refresh token rotante), causando avvisi di limite/overload nelle sessioni `claude` aperte. Ora legge solo il token corrente; se è scaduto lo segnala e lascia che sia Claude Code a rinnovarlo
- [IMPROVEMENT] Il polling quota in background è ora **Manuale di default**: in idle CLACOROO non interroga più l'endpoint quota (condiviso col rate-limit di Claude Code). Si aggiorna aprendo la scheda Quota/Dashboard o premendo aggiorna; l'auto resta riattivabile dalle Impostazioni
- [IMPROVEMENT] Nuovo pulsante **"?"** tondo nella barra in alto (a destra di Terminale): apre la documentazione su clacoroo.app nella lingua dell'interfaccia

## v1.1.34 — 2026-06-18 — Claude Config: editor dei permessi

- [FEATURE] Nuova riga **Permessi** in Claude Config: gestisci le regole che decidono cosa Claude Code può fare senza chiedere (allow), cosa chiede sempre (ask) e cosa è vietato (deny), oltre alla modalità di default. Liste comprimibili con ricerca, validazione del formato, avviso quando una regola dà accesso troppo ampio o è già presente in un'altra lista, e un pulsante per copiare al volo una regola da spostare tra le liste. Le liste allow/deny/ask si applicano subito anche alle sessioni di Claude Code già aperte; la modalità di default vale per le nuove sessioni
- [FIX] Il badge "Disattivato" sulla card di un plugin e i dettagli della modale "Plugin per peso" (titolo, footer, percentuale context window) ora seguono la lingua dell'interfaccia (IT/EN) invece di restare in italiano fisso
- [IMPROVEMENT] Il menu modello in "Plugin per peso" elenca dinamicamente i modelli misurati da Claude Code: si adatta da solo quando ne arrivano di nuovi, senza versioni cablate nel codice

## v1.1.33 — 2026-06-16 — API key: avviso saldo crediti esaurito

- [FIX] Quando si testa la API key Claude e l'account non ha credito sufficiente (HTTP 402), CLACOROO ora mostra un avviso chiaro ("⚠ Saldo crediti esaurito — ricarica su platform.anthropic.com/settings/billing") invece di un generico errore HTTP
- [DOCS] README (IT+EN): griglia screenshot dell'app + nota Gatekeeper aggiornata

## v1.1.32 — 2026-06-16 — Fix i18n: badge changelog, health issues, terminale

- [FIX] Badge "attuale" nel modal Changelog ora segue la lingua dell'interfaccia (IT/EN)
- [FIX] Messaggi di errore health degli agent/skill ora seguono la lingua dell'interfaccia
- [FIX] Terminale integrato non si apriva (schermo nero): variabile locale `t` nel loop tab sovrascriveva la funzione globale `t()`
- [IMPROVEMENT] Context Estimate rimosso dalla pagina Plugin: rimane solo in Dashboard e Stats

## v1.1.31 — 2026-06-16 — DMG: sfondo finestra installazione in inglese

- [CHORE] La scritta nella finestra di installazione del DMG macOS è ora in inglese ("Drag CLACOROO to the Applications folder")

## v1.1.30 — 2026-06-16 — macOS: firma Developer ID + notarizzazione automatica in CI

- [FEATURE] I DMG macOS prodotti dalla CI sono ora firmati con certificato Developer ID e notarizzati da Apple: niente più avviso "sviluppatore non verificato" all'apertura. Il workflow GitHub Actions importa il certificato in un keychain temporaneo effimero e usa `xcrun notarytool submit --wait` + `xcrun stapler staple` prima di pubblicare gli installer

## v1.1.29 — 2026-06-15 — Traduzioni: ultime stringhe residue (terminale, hook, MCP, vari)

- [FIX] Tradotte le ultime stringhe ancora in italiano fisso che comparivano a prescindere dalla lingua scelta: tooltip del terminale e delle tab, avvisi sulle dipendenze hook mancanti (coi relativi messaggi del terminale), chip e badge MCP della Dashboard, legenda della heatmap, placeholder di ricerca e tooltip dell'account. Ora seguono tutte la lingua dell'interfaccia (IT/EN)

## v1.1.28 — 2026-06-15 — Quote: rispetto del Retry-After sul rate-limit

- [FIX] Quando l'endpoint delle quote risponde "troppe richieste" (429) e indica per quanto attendere (header `Retry-After`), CLACOROO ora rispetta quel tempo invece di usare solo il proprio ritardo fisso. Riduce il contributo dell'app ai rate-limit dell'account Claude, condivisi con Claude Code stesso

## v1.1.27 — 2026-06-14 — Avviso nuova versione solo quando il download è pronto + Homebrew

- [FIX] Il banner "nuova versione disponibile" non compare più mentre gli installer sono ancora in fase di pubblicazione: ora attende che almeno un file scaricabile (.dmg/.exe/.AppImage/.deb/.rpm) sia effettivamente caricato sulla release. Prima poteva apparire in anticipo e portare a scaricare la versione precedente
- [DOCS] Installazione e aggiornamento via **Homebrew** su macOS: `brew install --cask maxymize/clacoroo/clacoroo`; per aggiornare `brew update && brew upgrade --cask clacoroo`. Aggiunto nei README (IT+EN) e su clacoroo.app

## v1.1.26 — 2026-06-03 — MCP: toggle attiva/disattiva per risparmiare token

- [FEATURE] I server MCP aggiunti da te ora hanno un toggle attiva/disattiva (come i plugin): disattivane uno quando non serve per togliere i suoi tool dal contesto e risparmiare token, riattivalo in un click quando ti serve. Disattivare chiede conferma; la configurazione viene salvata per riattivarlo senza reinserirla
- [IMPROVEMENT] Le card skill e agent ora indicano "Gestito dal plugin X": skill e agent non si attivano singolarmente, si abilitano o disabilitano insieme al plugin che li fornisce

## v1.1.25 — 2026-06-03 — Aggiornamenti: link download sempre al sito ufficiale

- [FIX] Il pulsante "Apri pagina download" (banner e footer) ora apre sempre la pagina ufficiale clacoroo.app/download, mai la pagina grezza della release su GitHub

## v1.1.24 — 2026-06-03 — Frequenza aggiornamento quota configurabile

- [FEATURE] Nuova impostazione "Frequenza aggiornamento dati": scegli ogni quanto CLACOROO aggiorna i dati live della Dashboard (da 30 secondi fino a 60 minuti, oppure Manuale per aggiornare solo col pulsante Refresh). La stessa cadenza aggiorna tutto: quote, stima contesto, statistiche, Plugin per peso e utilizzo di Claude Code. Frequenze basse aggiornano più spesso ma usano di più l'API
- [FEATURE] Nuovo badge "Ultimo aggiornamento" al centro dell'header della Dashboard, con contatore live in minuti e secondi (es. "1m 23s") e modalità attiva ("Auto ogni 30 s" oppure "Manuale"). Il primo aggiornamento parte subito all'apertura; in auto si azzera a ogni aggiornamento, premendo Refresh riparte da zero
- [IMPROVEMENT] Se l'API limita le richieste, la nota "Aggiornamento in pausa" ora suggerisce di aumentare l'intervallo di aggiornamento nelle Impostazioni

## v1.1.23 — 2026-05-31 — Feedback: segnala bug e proponi feature

- [FEATURE] Nuovo pulsante "Feedback" nel footer della sidebar: apre un form sul sito dove puoi segnalare un bug o proporre una nuova funzione. Il form si apre nella lingua dell'app

## v1.1.22 — 2026-05-31 — Aggiornamenti: rilevamento automatico all'avvio

- [IMPROVEMENT] Ad ogni avvio CLACOROO controlla subito se c'è una nuova versione (prima poteva saltare il controllo e mostrare dati vecchi), poi ricontrolla automaticamente ogni 3 ore mentre l'app è aperta — non più ogni 24 ore
- [IMPROVEMENT] Il controllo all'avvio è silenzioso: appare il banner solo se c'è davvero un aggiornamento, niente messaggi a ogni lancio. Il pulsante "Controlla aggiornamenti" continua a confermare l'esito
- [IMPROVEMENT] Il pulsante "Apri pagina download" (banner e footer) ora apre la pagina ufficiale clacoroo.app/download invece della pagina grezza di GitHub

## v1.1.21 — 2026-05-31 — Lettura quote: niente più rate-limit dell'account

- [FIX] Quando l'API di Anthropic limitava le richieste (errore "rate limited"), CLACOROO continuava a interrogarla, contribuendo al limite del tuo account — che poteva ripercuotersi anche su Claude Code. Ora si ferma in automatico e riprova più tardi, senza disturbare
- [IMPROVEMENT] Durante una pausa, le quote mostrano gli ultimi valori noti con una nota discreta ("Aggiornamento in pausa…") invece di un messaggio d'errore tecnico

## v1.1.20 — 2026-05-29 — Controllo aggiornamenti: rileva le nuove versioni

- [FIX] Il controllo aggiornamenti ora rileva correttamente le nuove versioni pubblicate: prima diceva sempre "sei già aggiornato" perché interrogava un endpoint che ignorava i rilasci più recenti

## v1.1.19 — 2026-05-29 — Windows: rilevamento di Claude Code e terminale

- [FIX] Su Windows CLACOROO ora rileva correttamente il binario di Claude Code (`claude.exe`/`claude.cmd` nei percorsi di installazione tipici): lo stato dell'account e le azioni che richiedono la CLI tornano a funzionare
- [FIX] Il terminale integrato ora trova `claude` anche quando l'app è avviata con un PATH ridotto: la cartella del binario rilevato viene aggiunta al PATH del terminale (vale anche su macOS per app aperte dal Finder)

## v1.1.18 — 2026-05-29 — Traduzioni mancanti + tooltip update leggibile

- [FIX] L'avviso "modifica locale temporanea" nell'editor dei file .md e tutti i messaggi di quella finestra ora seguono la lingua dell'interfaccia (prima erano sempre in italiano)
- [FIX] Il tooltip del pulsante di aggiornamento (accanto al numero di versione) ora è tradotto e non viene più tagliato ai bordi: si ancora al pulsante e va a capo se serve

## v1.1.17 — 2026-05-29 — Opus 4.8, effort Ultracode e modelli non persi

In Claude Config: aggiunti il modello Opus 4.8 e il livello di effort Ultracode.

- [FEATURE] Il modello **Opus 4.8** è ora selezionabile in Claude Config, e l'effort include il nuovo livello **Ultracode**
- [FIX] Se in `settings.json` è impostato un modello o un effort non ancora presente nella lista di CLACOROO (es. una versione futura), ora viene mostrato come selezionato invece di ripiegare silenziosamente su un valore vecchio — niente più rischio di sovrascrivere il modello scelto
- [FIX] Risolto il crash "A JavaScript error occurred in the main process" (`Object has been destroyed`) che poteva comparire riaprendo CLACOROO mentre un'altra copia era già in esecuzione: ora la finestra esistente viene riportata in primo piano (o ricreata) in modo sicuro

## v1.1.16 — 2026-05-29 — Toast leggibili + errore marketplace con percorso non valido

- [FIX] I messaggi lunghi (es. errori della CLI con percorsi assoluti) ora vanno a capo dentro il riquadro del toast invece di uscire dal bordo destro; gli errori restano visibili più a lungo per dare tempo di leggerli
- [IMPROVEMENT] Quando l'aggiornamento di un marketplace fallisce perché il percorso salvato punta a un utente diverso (tipico dopo aver copiato la cartella `.claude` da un altro computer o un reset di sistema), CLACOROO mostra un avviso chiaro con il comando esatto per risolvere e un pulsante per copiarlo

## v1.1.15 — 2026-05-29 — Fix crash "JavaScript error in the main process"

- [FIX] Risolto il crash con dialog "A JavaScript error occurred in the main process" (errore `write EIO`) che poteva comparire tornando sull'app dopo aver chiuso il terminale da cui era stata avviata: gli errori di scrittura benigni su stdout/stderr ora vengono ignorati senza abbattere l'app

## v1.1.14 — 2026-05-28 — Tutorial iniziale interattivo

- [IMPROVEMENT] Il tour di benvenuto ora evidenzia gli elementi reali dell'interfaccia uno alla volta (sidebar, dashboard, plugin, MCP, hook, terminale, lingua) invece di una finestra di testo statica, con la mascotte CLACOROO che ti accompagna
- [IMPROVEMENT] Contenuti del tour aggiornati a tutte le funzionalità attuali; resta rilanciabile da Impostazioni e dalla palette comandi

## v1.1.13 — 2026-05-28 — DevTools disabilitati nelle build + fix avvio senza Claude Code

- [SECURITY] Gli strumenti per sviluppatori (DevTools) sono ora disabilitati nelle versioni distribuite: non possono più essere aperti né da scorciatoia né da menu
- [FIX] Risolto un errore all'avvio su sistemi in cui Claude Code non è ancora installato: la lettura dei server MCP non va più in errore

## v1.1.12 — 2026-05-28 — Fix notifiche soglia quota non mostrate ad app aperta

- [FIX] Le notifiche di soglia quota Claude non comparivano quando la finestra CLACOROO era in primo piano: ora vengono mostrate sempre, anche con l'app aperta (caso tipico in cui stai lavorando e stai per esaurire la quota)
- [FEATURE] Nuovo bottone "Prova notifica" in Impostazioni → Notifiche per verificare al volo che le notifiche di sistema funzionino (utile per controllare il permesso macOS)

## v1.1.11 — 2026-05-27 — CHANGELOG cleanup + regola "concise entries"

- [DOCS] Riscritte le entry da v1.1.0 a v1.1.10 in forma sintetica (3-6 bullet badged max). Eliminati dettagli implementativi interni, percorsi file, nomi funzione, roadmap future e stati strategici dalle entry — restano solo i cambiamenti visibili all'utente
- [DOCS] Formalizzata la regola stile CHANGELOG: le entry sono user-facing (modal Changelog in-app), quindi devono restare concise. I dettagli tecnici vivono nei commit message

## v1.1.10 — 2026-05-27 — Guida smoke test cross-platform

- [DOCS] Nuovo file `SMOKE_TEST.md` con setup VM Linux/Windows tramite UTM, checklist di verifica dell'app, note specifiche per piattaforma

## v1.1.9 — 2026-05-27 — Notifiche di sistema soglia quota Claude

- [FEATURE] Notifiche di sistema quando una quota Claude (Session 5h, Weekly 7d, Weekly Sonnet) supera 80%, 95% o 100%
- [FEATURE] Toggle on/off in Impostazioni → Notifiche, con cooldown 12h per evitare spam

## v1.1.8 — 2026-05-27 — Empty states con mascotte CLACOROO

- [FEATURE] Le sezioni completamente vuote (Plugin, Skill, Agent, MCP, Hooks, Marketplace) ora mostrano la mascotte CLACOROO con descrizione e bottone per andare alla soluzione, invece di un testo "Nessun X" minimale

## v1.1.7 — 2026-05-27 — Editor CLAUDE.md inline

- [FEATURE] Editor inline per modificare il file CLAUDE.md globale (`~/.claude/CLAUDE.md`) direttamente da Impostazioni
- [FEATURE] Editor inline per il CLAUDE.md di ogni progetto tracciato, accessibile dalla riga del progetto
- [SECURITY] Il backend accetta solo path verso file CLAUDE.md effettivamente whitelistati (globale o progetti tracciati)

## v1.1.6 — 2026-05-27 — Switch lingua sistema immediato + fallback inglese

- [FIX] Il bottone "Usa lingua sistema" ora applica la lingua di sistema istantaneamente, senza dover riavviare l'app
- [FEATURE] Toast esplicativo se il sistema operativo è su una lingua non ancora supportata (fallback automatico in inglese)

## v1.1.5 — 2026-05-27 — Toast "config changed" anti-spam + layout card MCP

- [FIX] Risolto lo spam dei toast "Configurazione aggiornata" che apparivano periodicamente: ora la notifica viene mostrata solo se il contenuto del file di configurazione cambia davvero
- [STYLE] Le schede MCP hanno ora il footer (azioni Tools/Disable/Remove) sempre allineato in basso anche quando il contenuto della card è minimo

## v1.1.4 — 2026-05-27 — Traduzioni residue + Changelog nella lingua attiva

- [REFACTOR] Il modal Changelog ora mostra le note nella lingua attiva dell'app (era sempre in italiano)
- [REFACTOR] Tradotte le label delle schede MCP (Transport/URL/Comando), i tooltip dei plugin (Apri nel Finder/in VS Code), il tooltip lungo dei warning su agent/skill e i filtri della pagina Hooks

## v1.1.3 — 2026-05-27 — Traduzioni Dashboard + Marketplace + Sidebar + API key + MCP

- [REFACTOR] Tradotti i sottotitoli Dashboard "Plugin per peso", i contatori delle card Marketplace e le chip "Vedi tutte"
- [REFACTOR] Tradotti la label "Supporta" in sidebar, i pulsanti del pannello API key (Test connessione / Salva / Riconfigura / Sostituisci / Rimuovi) e i testi di riconnessione delle schede MCP

## v1.1.2 — 2026-05-27 — Architettura i18n scalabile + Changelog bilingue

Setup formale dell'infrastruttura i18n per renderla pronta a nuove lingue senza dover fare ricerche di stringhe sparse ad ogni release. Risposta diretta al feedback utente post-v1.1.1: "tutto sia mappato per la traduzione, non bisogna ogni volta andare a fare la ricerca di parole ancora in italiano o in inglese".

- [FEATURE] Nuovo script `npm run audit:locales` per verificare automaticamente che tutte le lingue abbiano le stesse chiavi e gli stessi placeholder
- [DOCS] Guida step-by-step per aggiungere una nuova lingua all'app (in `src/renderer/locales/README.md`)
- [FEATURE] CHANGELOG ora pubblicato anche in inglese (`CHANGELOG.en.md`), mantenuto allineato a ogni release

## v1.1.1 — 2026-05-27 — Traduzioni estese pagine principali

- [REFACTOR] Tradotti molti testi italiani ancora hardcoded sparsi nelle pagine Dashboard, Marketplace, Plugin, Skill/Agent, MCP, Hooks, Stats, Claude Config e Impostazioni
- [REFACTOR] Format orario relativo ("18h fa", "1g fa") ora segue la lingua attiva dell'app

## v1.1.0 — 2026-05-26 — 🎉 Release bilingue: CLACOROO ora è multilingua

- [FEATURE] L'intera interfaccia è ora disponibile in italiano e in inglese
- [FEATURE] La lingua viene rilevata automaticamente dal sistema operativo al primo avvio (fallback inglese per lingue non ancora supportate)
- [FEATURE] Cambio lingua manuale immediato dal nuovo gruppo "Aspetto" in Impostazioni

## v1.0.120 — 2026-05-26 — Pack N (Phase 3g batch finale): onboarding tour + update banner + command palette + token modal + setStatus

Ultimo batch incrementale di Pack N prima della Phase 4 closure. Migrate onboarding tour completo (5 step + buttons), banner update notification, command palette labels, modal token budget headers + intro + disable button, search placeholder Plugin, modal close aria-label e Copy tooltip.

### Locales — 5 namespace nuovi

- **`tour.*` (12)**: skip/back/next/start buttons + 5 step (title + body)
- **`updateBanner.*` (5)**: msgPre, msgTail, openDownload, later, skipVersion
- **`palette.*` (14)**: placeholder, ariaLabel, sectionAction/Section, 7 action labels (goTo/reload/export/import/changelog/restartTour/checkUpdates), pluginDisabledSuffix, pluginsCount{n}, toastSnapshot
- **`token.*` (10)**: modelLabel, disableBtn{tok}, introTopN{model}, 6 table column headers
- **`status.*` (1)**: loading
- **Esteso `search.*`**: + plugins / skills / agents placeholders
- **Esteso `button.*`**: + copyHookJson / copyDocument / copyToClipboard

### Migrazione

- [REFACTOR] **Onboarding tour**: `TOUR_STEPS` array module-level rimosso. Sostituito da `getTourStep(idx)` runtime helper che fa lookup `t('tour.stepNTitle')` + `t('tour.stepNBody')` — segue lingua attiva
- [REFACTOR] **Tour buttons** (Salta/Indietro/Avanti/Inizia): tutti via `t('tour.*')`. Counter "N / 5" formato dinamico
- [REFACTOR] **Update banner**: msg parts (pre/tail) + 3 action buttons (openDownload / later / skipVersion)
- [REFACTOR] **Command palette**: placeholder + aria-label + 7 action labels + 2 sub labels (azione/sezione) con interpolazione `{name}` per goTo
- [REFACTOR] **Token budget modal**: model dropdown label "Modello:", disable button "Disabilita −X" con interpolazione `{tok}`, intro text completo con `{model}`, 6 column headers
- [REFACTOR] **`setStatus('loading', …)`**: stringa "Caricamento…" via `t('status.loading')`
- [REFACTOR] **Plugin search placeholder**: 'Cerca plugin…' via t()
- [REFACTOR] **4 modal close aria-label** ("Chiudi"): replace_all su `t('button.close')`
- [REFACTOR] **3 Copy tooltip varianti**: copyHookJson, copyDocument, copyToClipboard

### Stats

- 463 chiamate `t()` totali in app.js
- Coverage finale stimato: ~97% delle stringhe user-visible migrate

### Residui (intenzionalmente non migrati)

- **HOOK_EVENT_DOCS** (~30 long-form descriptions tecniche per developer): mantenute in IT, tooltip raramente visti. Migrazione opzionale post-v1.1.0
- **About dialog** (setupAboutPanel in src/lib/menu.js + main process): testi statici Electron menu. Migrazione opzionale post-v1.1.0
- **~10 toast errori specifici** (es. MCP auth cache cleared, snapshot import errors): casi raramente attivati, restano in IT
- **Activity log entries** (kind/action labels stringhe lib/state.js): backend strings, migrazione opzionale

Prossimo step: **v1.1.0 closure** — audit shape it↔en + smoke test + bump esplicito a milestone bilingue.

## v1.0.119 — 2026-05-26 — Pack N (Phase 3f): pannelli Account Claude + API key Claude

Continua Pack N i18n. Migrate i 2 pannelli inner di Settings (Account + API key) che erano hardcoded in italiano. Coprono buona parte delle stringhe restanti.

### Locales — 2 namespace nuovi

- **`account.*` (29 chiavi)**: loading, readError{msg}, unknownError, notAuthed, loginInstr, connected, disconnected, 6 row labels (Email/Org/OrgID/AuthMethod/rowAuthClaudeAi/ApiProvider), 6 button labels e tooltip (LoginTerminal/Refresh/ClaudeAi/Logout), 5 tooltip parts (title/body/3 items/footer), 2 toast (logout success + error)
- **`apikey.*` (15 chiavi)**: loadingStatus, error{msg}, statusActive/Empty, storageWarn + tip, description{backend}, 3 row labels (Key/Storage/HelperScript), helperWarn, btnConsole + tip, formLabel, show

### Migrazione

- [REFACTOR] **`paintAccountPanel`**: tutte le ~25 stringhe migrate inclusi tooltip logout con 3 items lista + footer
- [REFACTOR] **`loadAccountPanel`**: loading text + error msg
- [REFACTOR] **`paintApiKeyPanel` + `loadApiKeyPanel`**: badge status (Attiva / Non configurata), storage warn, description con interpolazione `{backend}`, 3 info rows, helper warn, console btn, form label, show toggle
- [REFACTOR] **`makeConsoleBtn`**: button label + tooltip

### Coverage finale Phase 3

- ✅ Quasi tutti i panel principali migrati (Account + API key inner)
- ⏳ Onboarding tour (~30 stringhe) → v1.0.120
- ⏳ About dialog (`setupAboutPanel` in main.js + relative stringhe) → v1.0.120
- ⏳ Footer update banner (`renderUpdateBanner`) → v1.0.120
- ⏳ ~15-20 toast/error scattered minori → v1.0.120

Dopo v1.0.120 → Phase 4 closure (audit shape it↔en + smoke test + EN review) → **v1.1.0 bilingue completa**.

## v1.0.118 — 2026-05-26 — Pack N (Phase 3e): plugin/marketplace/hook buttons + filter chips + notifications + tooltip

Continua Pack N i18n. Migrate ~50 stringhe scattered: filter chips Plugin/Hook, plugin card buttons (Aggiorna/Rimuovi/Dettagli/Installa), system notifications, plugin status tooltips e label hook detail.

### Locales — nuove key

- **`filter.*` (+5)**: active, disabled, allMarketplaces, globals, locals
- **`plugin.*` (16+2)**: activate, deactivate, notifActivated, notifDeactivated, notifInstalled, notifUpdated, disableTip{id,tok}, disableTipShort{id,tok}, seeAllTopN{n}, openFullSection{title}, modifiedLocal{when}, modifiedNote{id}, sectionSkills/Agents/Hook, pluginsInMkt, seePlugins, seeAndInstall, matcher, scope, source, toastEnabled{id}, toastDisabled{id}
- **`hookDep.*` (3)**: installBtn{dep}, docsBtn{dep}, docsTip{dep}
- **`uiErr.*` (2)**: dataLoad, cancelled

### Migrazione

- [REFACTOR] **Plugin filter chips**: status (Tutti/Attivi/Disattivati) + marketplace filter (Tutti i marketplace) via t()
- [REFACTOR] **Hook filter chips**: scope filter (Tutti/Globali/Locali) + event filter (Tutti)
- [REFACTOR] **Plugin card buttons**: Aggiorna / Rimuovi / Dettagli / Installa via button.* keys; reused buttons via replace_all
- [REFACTOR] **Plugin toggle tooltip**: 'Attiva plugin' / 'Disattiva plugin' via t()
- [REFACTOR] **Plugin notifications**: 'Plugin attivato/disattivato/installato/aggiornato' + toast `✓ Attivato: {id}` / `✗ Disattivato: {id}`
- [REFACTOR] **Plugin tooltip**: 'Disabilita X (recupera Y tok always-on)' con interpolazione completa
- [REFACTOR] **Top-N "Vedi tutti i N plugin per peso"** + tooltip "Apri la sezione completa X"
- [REFACTOR] **Modal section heads**: 'Skills', 'Agents', 'Hook' (modal Plugin content) + 'Plugin nel marketplace'
- [REFACTOR] **Hook detail labels**: 'Matcher', 'Scope', 'Sorgente'
- [REFACTOR] **Hook dep buttons**: 'Installa X' + 'Docs X' + tooltip docs
- [REFACTOR] **Marketplace tooltip**: 'Vedi plugin installati' / 'Vedi e installa plugin'
- [REFACTOR] **Modified badge** title con interpolazione `{when}` + `{id}`
- [REFACTOR] **Generic UI errors**: 'Errore lettura dati' + 'Annullato' (status load + cancel check)
- [REFACTOR] **Copy / Apri preview** + altri button reuse da namespace `button.*`

### Stats

- 382 chiamate `t()` totali in app.js (era 0 pre-Pack N)
- Coverage stimato: ~85-90% delle stringhe user-visible migrate
- Residui: loadAccountPanel / loadApiKeyPanel inner texts, onboarding tour, About dialog, restanti toast errori (~10-15 stringhe minori)

## v1.0.117 — 2026-05-26 — Pack N (Phase 3d): Stats KPI + range filters + tabs + context breakdown

Continua Pack N i18n. Migrate l'intera pagina Stats: tab bar, range filter chips, 10 KPI labels e i 6 context breakdown labels con interpolazione.

### Locales — namespace nuovo `stats.*` (23 chiavi)

- **Tabs (3)**: tabOverview / tabModels / tabProjects
- **Range filters (3)**: rangeAll / range30 / range7
- **KPI labels (10)**: kpiSessions / kpiMessages / kpiTokens / kpiApiValue / kpiActiveDays / kpiMostActive / kpiStreak / kpiLongestStreak / kpiPeakHour / kpiFavModel
- **Context breakdown (7)**: contextSkills{count} / contextSystemPrompt / contextAgents{count} / contextMemoryFiles{count} / contextMcpServers / contextMcpServersConn{count} / contextFreeSpace

### Migrazione

- [REFACTOR] **Stats tab bar** (3 tab): `tabLabels` mappa hardcoded → `tabLabelKeys` con `t()` lookup al render. Variable shadow fix (`tabs.forEach(t => ...)` → `forEach(tab => ...)`)
- [REFACTOR] **`buildStatsKpiGrid`**: tutte le 10 KPI label via `t('stats.kpi*')`
- [REFACTOR] **Range filter chips** `[['all', 'Tutto'], ['30', '30g'], ['7', '7g']]` → letti via `t()` al render time
- [REFACTOR] **`contextCats()`** breakdown labels: 6 categorie via `t()` con interpolazione `{count}` per skills/agents/memoryFiles/mcpServersConn

### Coverage

- ✅ Tutta la pagina Stats (KPI + tabs + filtri + heatmap titles + context breakdown)
- ✅ Stat dashboard summary chip Dashboard (già migrate in batch 1)
- ⏳ Stats per-model + per-project tabs (renderStatsModels + renderStatsProjects) — ancora da migrare in batch successiva
- ⏳ Account panel + API key panel inner texts → Phase 3e
- ⏳ Onboarding tour → Phase 3e

## v1.0.116 — 2026-05-26 — Pack N (Phase 3c): Settings labels esistenti (gruppi Percorsi/Editor/Terminale/Progetti/Aggiornamenti/Sviluppo plugin)

Continua Pack N i18n. Migrate i 6 gruppi Impostazioni "core" che erano ancora hardcoded in italiano.

### Locales — chiavi nuove

- **`settings.*` (+30 chiavi)**: appearance, accountClaude, apiKeyClaude, paths, claudeFolder/Bin/BinFound/BinNotFound, configBinLabel/Desc, trackedProjects/Label/Desc, externalEditor, editorDefault/Desc + 4 editor options (vscode/cursor/antigravity/system), terminal, shellDefault/Desc, shellSystemDefault{shell}, pluginDev/Validator/ValidatorDesc/Validate/Browse/Valid/PathRequired, updates, checkUpdates, checkNow, autoCheck/Desc, lastCheck{when}, lastCheckNever, newVersionInfo{ver,when}
- **`settingsToast.*` (4)**: pathUpdated, editorSet{name}, shellSet{name}, shellDefaultName

### Migrazione

- [REFACTOR] **Gruppo "Account Claude"** + **"API key Claude"** + **"Aspetto"**: titoli via `t()`
- [REFACTOR] **Gruppo "Percorsi"**: title + 2 row labels (Cartella Claude Code, Binario claude) + 2 row desc + 2 status (Trovato/Non trovato) + bottone Salva + toast "Percorso aggiornato"
- [REFACTOR] **Gruppo "Progetti tracciati"**: title + label + desc + bottone "Rimuovi"
- [REFACTOR] **Gruppo "Editor esterno"**: title + label + desc + 4 option labels (Visual Studio Code / Cursor / Antigravity / Sistema) + toast change
- [REFACTOR] **Gruppo "Terminale"**: title + label + desc + "Default di sistema (X)" con interpolazione + toast change "Shell predefinita: X — vale per le nuove tab"
- [REFACTOR] **Gruppo "Sviluppo plugin"**: title + Plugin Validator label + desc + Sfoglia/Valida buttons + "Specifica un path" + "✓ Manifest valido"
- [REFACTOR] **Gruppo "Aggiornamenti"**: title + 2 row labels + 2 desc (con interpolazione `{when}` / `{ver}`) + "Controlla adesso" button + "ultimo controllo: mai/timestamp" con locale-aware date formatting (it-IT vs en-US)

### Coverage Settings

- ✅ Tutti i 6 gruppi core (Account/API key/Aspetto/Percorsi/Progetti/Editor/Terminale/Sviluppo/Aggiornamenti)
- ⏳ Inner panels: `loadAccountPanel()` + `loadApiKeyPanel()` (panel renderer separati con 20+ stringhe ciascuno) → Phase 3c batch successiva
- ⏳ Onboarding tour, About dialog content, Footer aggiornamenti banner

## v1.0.115 — 2026-05-26 — Pack N (Phase 3b): modali Add Marketplace + Add MCP + 10 confirm dialogs

Continua Pack N i18n. Migrate i 2 modali principali (Add Marketplace + Add MCP) con tutte le label/placeholder/hint/error + tutti i 10 confirm dialog Electron native (title + message + detail + buttons).

### Locales — nuovi namespace

- **`modalMkt.*` (15 chiavi)**: Add Marketplace modal — title, badge, intro, sourceLabel, placeholder, formatsTitle, 3 formats accepted, submit, submitting, 3 validation errors, errUnknown
- **`modalMcp.*` (30+ chiavi)**: Add MCP modal — title, badge, intro, name/transport/url/command/args/env/headers (label + hint + placeholder), 3 transport options (label + desc), 2 url placeholder variants (http vs sse), 4 validation errors, toastAdded{name}
- **`confirm.*` (10 dialog × ~4 fields)**: disablePlugin / removePlugin / installPlugin / removeMarketplace / installTool / disableMcp / removeMcp / logoutAccount / removeApiKey / applySnapshot. Tutti con interpolazione `{id}`, `{name}`, `{fullId}`, `{recovery}`, `{tool}`, `{cmd}`, `{mktCount}`, `{plgCount}`, `{desc}`, `{transport}` etc.
- **`toast.*` (+7)**: mktRemoved{id}, mcpDisabled{id}, mcpEnabled{id}, mcpRemoved{id}, apiKeyActivated{warning}, apiKeyRemoved, pluginRemovedNotif (per system notification)

### Migrazione

- [REFACTOR] **`showAddMarketplaceModal()`**: title/badge/close-aria/intro/source-label/placeholder/helper-list/buttons/validation-errors tutto via `t()`
- [REFACTOR] **`showAddMcpModal()`**: ~25 stringhe migrate (form labels + hints + placeholders + 3 transport radio + dynamic URL/Comando swap via `updateTargetPlaceholder()` + 4 validation errors + submit/cancel)
- [REFACTOR] **10 `confirmDialog()` calls** migrate con interpolazione completa. Tutti i dialog preservano comportamento ma testi seguono lingua attiva
- [REFACTOR] **6 toast specifici** (mktRemoved, mcpDisabled/enabled/removed, apiKeyActivated/removed) + system notification "Plugin rimosso"
- [QUALITY] Variable shadow fix: `transports.forEach(t => ...)` rinominato a `tr` per non shadoware il helper `t()` globale (2 altri shadow lasciati perché non chiamano t() dentro)

### Coverage

- ✅ Modali principali Plugin (Add Marketplace + Add MCP)
- ✅ Tutti i 10 confirm dialog native Electron
- ✅ Toast contestuali aggiuntivi (6+1)
- ⏳ Settings labels esistenti (Percorsi/Editor/Terminale/Progetti tracciati/Account/API key panel) → v1.0.116
- ⏳ Stats KPI + range filters + context breakdown labels → v1.0.117
- ⏳ Onboarding tour + activity log entries → v1.0.116
- ⏳ Audit shape it↔en + review EN + smoke test → v1.1.0 closure

## v1.0.114 — 2026-05-26 — Pack N (Phase 3a): empty states + toast principali

Continua Pack N i18n. Migrate i 12 empty state messages e ~15 toast statici/parametrizzati comuni.

### Locales — chiavi nuove

- **`empty.*` (+8)**: noPluginResults, noMcpResults, noHooksInstall, noResultsShort, noStatsProjects, noTrackedProjects, noGenericItems
- **`toast.*` (+17)**: configChanged, noPublicRelease, upToDate, updateCheckError{msg}, cannotCopy, pluginRemoved{id}, pluginUpdated{id}, pluginDisabled{id,tok}, projectAdded{name}, projectRemoved, marketplaceAdded, errorPrefix{msg}, errorOpen{msg}, errorOpenFinder{msg}, errorOpenEditor{msg}, errorUpdate{msg}, copiedShort{text}

### Migrazione empty states (12)

- [REFACTOR] `Nessuna attività registrata...` → `t('empty.noActivity')`
- [REFACTOR] `Nessun MCP server configurato.` → `t('empty.noMcp')` (3 occorrenze in Dashboard MCP + sezione MCP principale + grid)
- [REFACTOR] `Nessun plugin corrisponde ai filtri.` → `t('empty.noPluginResults')`
- [REFACTOR] `Nessun server corrisponde ai filtri.` → `t('empty.noMcpResults')` (2 occorrenze)
- [REFACTOR] `Nessun hook trovato. Installa un plugin...` → `t('empty.noHooksInstall')`
- [REFACTOR] `Nessun progetto con attività trovato...` (Stats) → `t('empty.noStatsProjects')`
- [REFACTOR] `Nessun progetto tracciato. Aggiungine uno...` (Settings) → `t('empty.noTrackedProjects')`
- [REFACTOR] `Nessun risultato` (palette) → `t('empty.noResultsShort')`
- [REFACTOR] `Nessun elemento.` (mcp-empty fallback) → `t('empty.noGenericItems')`

### Migrazione toast comuni (15+)

- [REFACTOR] `'Configurazione aggiornata — ricarico…'` → `t('toast.configChanged')` (il toast spam che si vede ~ogni minuto, ora bilingue mentre aspettiamo il fix del polling)
- [REFACTOR] Update check: 3 messaggi statici/parametrizzati (noPublicRelease, upToDate, updateCheckError)
- [REFACTOR] Plugin actions: `Plugin disabilitato: X (−Y tok)` / `Plugin rimosso: X` / `Aggiornato: X` / `Errore aggiornamento: X` con interpolazione
- [REFACTOR] Errori comuni: `Errore: X` → `t('toast.errorPrefix', {msg: X})` (multiple occorrenze)
- [REFACTOR] `Errore apertura: X` / `Errore apertura Finder: X` / `Errore apertura VS Code: X` → toast.errorOpen* (3 varianti)
- [REFACTOR] Progetto tracciato: aggiunto / rimosso
- [REFACTOR] MCP: marketplace aggiunto, copiato negli appunti, impossibile copiare

### Toast rimasti da migrare (Phase 3b-c)

- ~55 toast con messaggi specifici contestuali (Disabilitato/Abilitato XX / Hook copy / Skill markdown save / Account login / API key activate / Snapshot import-export / etc.) → da batch successive Phase 3b/c

## v1.0.113 — 2026-05-26 — Pack N (Phase 2 batch 2): badge + status MCP + sort dropdown + view switcher + filter chips

Continua Pack N Phase 2. Migrate i badge scope/health/blocked/modified, gli status MCP (badge + filter chips), il sort dropdown universale, il view switcher e i filter chips MCP.

### Locales — chiavi nuove

- **`sort.mkt*` (5)**: opzioni dedicate del dropdown ordinamento Marketplace (default / added-desc / added-asc / updated-desc / updated-asc)
- **`filter.*` (5)**: chip filtri MCP — `all` / `allKinds` / `fromPlugin` / `builtinClaudeAi` / `needsAuth`
- **`badge.pluginActive`**: 'attivo' (status compact row plugin)
- **`badge.scopeProgetto`**: 'progetto' (fallback per scope local senza nome)
- **`badge.scopeLocalNamed` (interpolato `{name}`)**: 'locale: {name}'
- **`badge.scopeLocalParen` (interpolato `{name}`)**: 'locale ({name})'

### Migrazione

- [REFACTOR] **`SORT_OPTIONS`** module-level: ogni opzione ora ha `labelKey` invece di `label` hardcoded. Risolto a `t(labelKey)` dentro `renderSortDropdown` → segue automaticamente la lingua attiva (no module-load lock-in)
- [REFACTOR] **`renderSortDropdown`** label "Ordina:" via `t('sort.label')`
- [REFACTOR] **`renderViewSwitcher`** tooltip "Vista a cards"/"Vista compatta" via `t('view.cards')` / `t('view.compact')`
- [REFACTOR] **Marketplace sort dropdown** (5 opzioni): mappate a `sort.mkt*` keys, label e value separati per evitare collisioni con SORT_OPTIONS generico
- [REFACTOR] **MCP status chips** (4): label da `mcp.status.*` + `filter.*` (es. 'Tutti' / 'Needs Auth' / 'Errore')
- [REFACTOR] **MCP scope chips** (3): 'Tutti i tipi' / 'claude.ai' / 'Dai plugin' → `filter.*`
- [REFACTOR] **MCP card badge text** (6 status): `mcp.status.connected/needsAuth/warning/error/unknown/disabled`
- [REFACTOR] **6 scope badge** scattered nei card buildPluginCard + buildSkillAgentCard + 3 altre card builder → tutti usano `t('badge.scopeGlobal')` / `t('badge.scopeLocal')` / `t('badge.scopeLocalNamed', {name})` / `t('badge.scopeLocalParen', {name})` a seconda del formato
- [REFACTOR] **Plugin compact status row**: 'locale: ...' / 'disabilitato' / 'attivo' → `t('badge.*')`
- [REFACTOR] **Health badge text** ('health: errore' / 'health: warning'): `t('badge.healthError')` / `t('badge.healthWarn')`
- [REFACTOR] **'modificato' badge** in `appendModifiedBadge()`: `t('badge.modified')`
- [REFACTOR] **'disabilitato' browse-card-blocked**: `t('badge.disabled')`

### Coverage finora

- ✅ Sidebar nav + topbar (v1.0.110)
- ✅ Dashboard KPI + section titles + summary chips (v1.0.112)
- ✅ Badge scope/health/blocked/modified su tutti i card builder (Plugin, Skill, Agent compat) (v1.0.113)
- ✅ MCP status (badge + filter chips + scope chips + sort)
- ✅ Sort dropdown universale + view switcher (5 sezioni Plugin/Skill/Agent/MCP/Hooks)
- ⏳ Plugin sez: modali (Add Marketplace, Add MCP, Confirm dialogs), form labels, tooltip card, empty states
- ⏳ Stats KPI + filtri range + context breakdown labels
- ⏳ Settings labels (Percorsi/Editor/Terminale/Progetti tracciati/API key)
- ⏳ Toast messages + activity log + onboarding tour
- ⏳ Audit shape it↔en + smoke test → v1.1.0 closure

## v1.0.112 — 2026-05-26 — Pack N (Phase 2 batch 1): section titles JS + KPI Dashboard + summary chips

Continuazione Pack N. Migrate a `t()` tutte le 11 `sectionTitle()` rese dinamicamente in JS + 10 KPI labels Dashboard + tooltip card Hooks + 5 sezioni riassuntive Dashboard (title + emptyText + tooltip chip).

### Locales — 11 nuove key

- [FEATURE] `section.stimaContestoStile` ("Stima contesto · stile claude /context")
- [FEATURE] `section.attivita7g` / `section.attivita30g` / `section.attivita52sett` — varianti dinamiche del titolo heatmap in Stats
- [FEATURE] `kpi.hooksTooltip` / `kpi.hooksWarnTooltip` — tooltip card Hooks Dashboard
- [FEATURE] `chip.openSection` ("Apri la sezione {name}") — interpolazione `{name}` da riusare su tutti i chip Dashboard summary (5 sezioni)
- Specchiate in `en.js` con stessa shape

### Migrazione

- [REFACTOR] **11 section title** migrati da string letterale a `t()`: Quote Claude, Statistiche, Attività recenti, Stima contesto, Utilizzo Claude Code, Plugin per peso, MCP server, Marketplace/Plugin/Skill/Agent/Hooks (dashboard summary), + heatmap title Stats (lookup table su HEATMAP_TITLE_KEY) + Stima contesto · stile claude /context
- [REFACTOR] **10 KPI labels Dashboard**: Plugin attivi / Disattivati / Plugin locali / Marketplace / Skill totali / Agent totali / MCP connessi / Hooks · N plugin / Hook con dep mancanti / Token always-on / Health issues|Warning|Health
- [REFACTOR] **2 tooltip card Hooks** (kpi click navigation)
- [REFACTOR] **5 sezioni Dashboard summary** (renderDashboardSection): title + emptyText + chip tooltip "Apri la sezione X" con interpolazione `{name}`
- [QUALITY] Heatmap title in Stats: ternary chain a 3 vie sostituito da lookup table `HEATMAP_TITLE_KEY` + fallback default (più conforme alle simplify rules)

### Coverage

- Dashboard: praticamente 100% delle stringhe statiche migrate (resta solo testo embedded in funzioni helper non ancora toccate come `loadDashboardUsage`/`loadDashboardStats`/`loadDashboardMcp`)
- Stats: heatmap title e context breakdown title migrati; KPI Stats + filtri range + context breakdown labels in batch 2
- Altre sezioni (Plugin/Marketplace/Skill/Agent/MCP/Hooks/Settings): da migrare in v1.0.113+

## v1.0.111 — 2026-05-26 — Simplify pass post-Pack N Phase 1

Cleanup di qualità sull'infrastruttura i18n appena introdotta, dopo `/simplify` (3 review agents: reuse / quality / efficiency). Nessun cambiamento funzionale per l'utente — l'app si comporta identica a v1.0.110.

### Code quality

- [REFACTOR] **`i18nState` object rimosso**: sostituito da una semplice `let activeLang = 'it'` module-level. Eliminato il dead field `i18nState.detected` (scritto in `initLocale()` ma mai letto). Una sola fonte di verità per la lingua runtime
- [REFACTOR] **`_lookupDeep` → `lookupDeep`**: rimosso prefisso underscore non in linea con la convenzione del codebase (nessun altro helper usa `_`)
- [REFACTOR] **Commenti narrativi trimmed** in app.js e locales/*.js: rimossi i JSDoc che narravano l'ovvio (`setLocale()`, `resolveLocale()`, header i18n) e i commenti versionati `v1.0.110 — Pack N:` sul campo `state.locale`. Conformi alla regola "no narrative comments" di CLAUDE.md (keep only WHY)

### Efficiency

- [PERF] **IPC `getState()` dedup**: `init()` ora chiama `getState()` una volta sola e passa `appState` a `initLocale(appState)`. Prima erano 2 roundtrip IPC consecutivi al cold start (-5ms boot time, marginale ma gratis)
- [PERF] **Regex guard in `t()`**: la sostituzione `s.replace(/\{(\w+)\}/g, ...)` viene saltata se `vars` è undefined O se la stringa non contiene `{`. Risparmia ~50-100 regex execution per render (al ramp-up di Pack N Phase 2, dove `t()` sarà chiamato 500+ volte)

### Defensive coding removed

- [REFACTOR] **`try/catch` su `document.documentElement.setAttribute('lang', …)` rimosso** in `applyStaticI18n` e nel langSel handler. `setAttribute` con una stringa non lancia mai eccezioni; `document.documentElement` esiste sempre quando app.js è caricato. Tre righe diventano una

### DRY

- [REFACTOR] **`changeLocale(lang)` helper** estratto: centralizza i 5 step del cambio lingua (`state.locale =`, `setLocale()`, `setState({locale})`, `applyStaticI18n()`, `render()`). Il langSel handler in `renderSettings()` ora è 4 righe invece di 7. Elimina il duplicate `setAttribute('lang')` che era sia nell'handler sia (correttamente) in `applyStaticI18n()`

### Numeri

- `src/renderer/app.js`: -82 righe nette (127 rimosse, 45 aggiunte)
- `src/renderer/locales/it.js` + `en.js`: -6 righe ciascuno (header semplificati)

### Findings agenti non applicate (false positives o premature)

- ❌ Costanti `LANGS.IT / MODELS.SONNET` per stringhe 'it'/'en'/'sonnet'/'opus': surface piccolo, premature abstraction
- ❌ Spostare `applyStaticI18n()` nel blocco i18n: cosmetico, no behavioral change
- ❌ `tokenValuesFor()` fallback ora dead: out of scope (è Pack C residual, non Pack N)
- ❌ Cache element lookup in `renderSettings()` per il dropdown: re-render Settings non è hot path

## v1.0.110 — 2026-05-26 — Pack N (Phase 1): i18n infrastructure + sidebar/topbar/section titles migrati

Prima fase di Pack N — internazionalizzazione `it` + `en` (l'altra metà della Fase 0 prima del lancio pubblico AGPL). Mira a coprire ~500-700 stringhe UI totali in 10-15h di lavoro. Questa v1.0.110 imposta solo l'infrastruttura + le aree statiche; le sezioni dinamiche (modali, toast, badge, dropdown sort, empty states…) seguiranno nelle prossime release di Pack N.

### Infrastruttura i18n

- [FEATURE] **`src/renderer/locales/it.js` + `en.js`**: tabelle nested per categoria (`nav`, `topbar`, `section`, `kpi`, `badge`, `mcp`, `button`, `view`, `sort`, `search`, `empty`, `settings`, `toast`). ~80 stringhe iniziali per lingua. Caricate via `<script>` tag (no `require()`: CSP + `nodeIntegration:false`). Si attaccano a `window.LOCALES`
- [FEATURE] **Helper `t(key, vars?)`** in `app.js`: lookup gerarchico (es. `t('nav.dashboard')`), fallback automatico EN se mancante in IT, fallback alla key stessa se mancante ovunque, sostituzione `{var}` da `vars` argument
- [FEATURE] **`resolveLocale(raw)`** mappa locale OS (`it-IT`, `en-US`, `fr-FR`, …) → 'it' o 'en' con fallback 'en' per lingue non supportate
- [FEATURE] **`applyStaticI18n()`**: itera tutti i nodi con `data-i18n="key"` e ne aggiorna il `textContent` via `t()`. Aggiorna anche `<html lang>` per accessibility/screen reader

### Auto-detect lingua sistema (primo avvio)

- [FEATURE] **IPC `get-system-locale`** in `src/main.js`: chiama `app.getLocale()` (preferito) + `app.getSystemLocale()` (fallback) Electron, ritorna entrambi al renderer
- [FEATURE] **Bridge `getSystemLocale()`** in `src/preload.js`
- [FEATURE] **`initLocale()`** chiamata UNA volta in `init()` PRIMA del primo render. Ordine: (1) `state.locale` persistito → usa quello, (2) altrimenti chiama IPC → `resolveLocale()` → 'it'/'en', (3) fallback finale 'en'
- [FEATURE] **`state.locale`** (`'' | 'it' | 'en'`) persistito in `state.json`. Vuoto = auto-detect ad ogni avvio. Setato esplicitamente solo se l'utente cambia lingua dal dropdown

### Dropdown lingua in Impostazioni

- [FEATURE] **Sezione "Aspetto" → "Lingua"** in `renderSettings()`: dropdown con `Italiano` + `English`, hint che spiega "auto-detected from OS first time". Selezione → `setState({ locale })` + `setLocale()` + `applyStaticI18n()` + `render()` immediato (no riavvio)
- [FEATURE] **Bottone "Usa lingua sistema"** (visibile solo se `state.locale` esplicitamente settato): reset → `setState({ locale: '' })` → al prossimo riavvio l'app ri-fa auto-detect dall'OS. Tooltip esplicativo
- [STYLE] Coerente con il pattern esistente del select "Editor predefinito" / "Shell predefinita" già usato in Impostazioni

### Aree migrate a `t()` in questa release

- [REFACTOR] **Sidebar nav** (`src/renderer/index.html`): ogni label nav wrappata in `<span class="nav-label" data-i18n="nav.X">`. Click sui 10 items + cambio lingua aggiorna textContent istantaneamente
- [REFACTOR] **Topbar title** (`render()`): mappa `state.section` → key `nav.X` → `t()`. Mostra "Dashboard"/"Marketplace"/"Plugin"/"Skill"/… in IT e "Dashboard"/"Marketplaces"/"Plugins"/… in EN
- [REFACTOR] **Topbar buttons**: "Aggiorna" / "Terminale" / "+ Progetto" / "+ Marketplace" / "+ MCP" + tooltips. Refresh button preserva l'icona Lucide rotate-cw

### Aree NON ancora migrate (Phase 2-4 prossime release)

- Section titles renderizzati in JS (`sectionTitle(text, iconName)`) ancora hardcoded — migrazione massiva nelle prossime release
- KPI labels Dashboard
- Badge "globale/locale/disabilitato/modificato/health: errore"
- Status MCP ("Connected/Needs auth/Warning/…")
- Dropdown sort + view switcher tooltips
- Modal titles + form labels (Add Marketplace + Add MCP + confirm dialogs)
- Toast messages, empty states, attività recenti
- Settings labels esistenti (Percorsi, Editor esterno, Terminale, Progetti tracciati…)

### Decisioni design

- **Default fallback EN, non IT**: anglofoni = TAM ~25× IT (1.5B vs 60M). Sistema su qualsiasi lingua non-IT → mostra EN, non IT
- **Auto-detect non persistito**: se l'utente cambia lingua dell'OS, CLACOROO segue al prossimo avvio. Override manuale persistente solo se dropdown usato esplicitamente
- **Stringa `t()` non re-render automatico**: chiamante decide se serve `render()` dopo cambio lingua (per ora: sì sempre dal dropdown)
- **No traduzioni in `main.js`/lib backend**: errori e messaggi sistema restano in IT/italiano in v1.0.110; traduzione completa in Phase 3

## v1.0.109 — 2026-05-26 — Pack C: Comparatore Opus/Sonnet + Disabilita inline dal token budget

Due feature Pack C selezionate dall'utente (#3 + #4). Le altre 2 (dependency tree + statistiche storiche) spostate in ROADMAP.md per pianificazione community futura.

### Comparatore Opus 4.7 vs Sonnet 4.6 (#3)

I dati per entrambi i modelli sono **già nel file** `plugin-catalog-cache.json` di Claude Code. Prima caricavamo solo Sonnet 4.6 — ora caricati entrambi e l'utente può switchare.

- [FEATURE] **`tokensByModel`** nuovo campo per ogni plugin in `state.plugins`: `{ sonnet: {always, invoke}, opus: {always, invoke} }`
- [FEATURE] **`state.tokenModel`** ('sonnet' | 'opus', default 'sonnet') persistito in `state.json`. Restore in `init()` con validation
- [FEATURE] **Dropdown "Modello: [Sonnet 4.6 ▼ / Opus 4.7 ▼]"** nel section title del token budget (sia Dashboard compact che Stats full). Switch immediato → ricalcolo summary + sort + render
- [FEATURE] **Modal token budget esteso**: nuova colonna **"Δ Opus"** che mostra la differenza in tok + % di Opus rispetto a Sonnet (tipicamente +30-40%). Footer modal mostra il totale per entrambi i modelli + delta complessivo
- [FEATURE] **`tokenValuesFor(p, model)`** helper: estrae always/invoke per il modello corrente con fallback graceful
- [STYLE] `.token-budget-title-row` flex space-between per accomodare title + dropdown allo stesso livello

### Bottone "Disabilita" inline dal token budget (#4)

Quick action di "context cleanup" senza dover navigare alla sezione Plugin.

- [FEATURE] **`.token-budget-disable-btn`** su ogni riga del Top-N (Dashboard + Stats): testo "Disabilita −2.1K" con icona Lucide `ban`. Click → confirm dialog con dettagli (recupero tok + nota sessioni aperte) → `pluginAction('disable', fullId)` → toast + reload data
- [FEATURE] **`.token-budget-disable-btn-sm`** versione compatta (solo icona) nella colonna azioni del modal full table
- [FEATURE] **`confirmAndDisablePlugin(p, recovery)`** helper: confirm + IPC + toast feedback con "Disabilitato: X (−Y tok)" che evidenzia il recupero
- [SAFETY] Confirm dialog OBBLIGATORIO + spiegazione che le sessioni `claude` già aperte continuano col plugin attivo finché non vengono riavviate (coerente con v1.0.106 comportamento OS-level)

### ROADMAP.md creato

- [DOCS] **Nuovo file `ROADMAP.md`**: idee aperte per future iterazioni, organizzate per area (Analytics, UX, Distribuzione, i18n, Multi-account). Task #1 (Dependency tree) e #2 (Statistiche storiche) di Pack C spostati qui dal TASK.md
- [DOCS] **Brainstorming Free vs Pro** storico: descrive cosa terremmo gratuito (tutto quello che oggi è già implementato) e cosa potrebbe diventare Pro (bulk ops, automation, multi-account, custom themes, AI recommendations). Pricing ipotetico €4-7/mese · €40-60/anno · €99-149 lifetime. Filosofia: free completo e auto-sufficient, Pro = automation + scale + premium polish
- [DOCS] **Sezione "Suggest a feature"** placeholder per quando il progetto sarà pubblico (template issue GitHub + modulo sito web)
- [DOCS] **Open questions** documentate: scissione codice AGPL/Pro, payment provider (Stripe/Lemon), license key (offline JWT vs online check)

## v1.0.108 — 2026-05-26 — Section title con icona Lucide + spacing uniforme + Token budget compatto in Dashboard, completo in Stats

Tre fix Dashboard dal feedback utente:

### Section titles: icona + font + spacing uniforme

- [STYLE] **`.list-section-title`** ridisegnato: font da `11px` a `13px`, `margin-top: 28px` (era 0, ogni sezione era troppo vicina alla precedente), `margin-bottom: 12px` (era 10). Con `:first-child { margin-top: 0; }` per la prima sezione. Risultato: distanze uniformi fra TUTTE le sezioni in Dashboard
- [FEATURE] **`sectionTitle(text, iconName)`** helper: costruisce `<div class="list-section-title">` con icona Lucide a sinistra + testo. Sostituisce il pattern `el('div', 'list-section-title', text)` in tutta l'app
- [FEATURE] **Icone Lucide nei section title Dashboard** (stesso set della sidebar):
  - Quote Claude → `gauge`
  - Statistiche → `bar-chart-3`
  - Utilizzo Claude Code → `bar-chart-3`
  - Plugin per peso → `gauge`
  - Marketplace → `store` · Plugin → `puzzle` · Skill → `sparkles` · Agent → `bot` · MCP server → `plug-2` · Hooks → `anchor`
  - Stima contesto → `eye` · Attività recenti → `rotate-cw`
- [FEATURE] **Aggiunte 8 icone Lucide a `LUCIDE_ICONS`**: `store`, `puzzle`, `sparkles`, `bot`, `plug-2`, `anchor`, `bar-chart-3`, `gauge`
- [STYLE] `.list-section-title .inline-icon` con `width: 16px`, `opacity: 0.85`, `color: var(--text-muted)` per coerenza con il testo title
- [REFACTOR] **`renderDashboardSection` accetta `iconName`** opzionale (passato da renderDashboard per tutte le 6 sezioni)
- [REFACTOR] Migrate altri 5 title hardcoded a `sectionTitle()` in `renderStatsOverview` (Heatmap, Stima contesto)

### Token budget: compatto in Dashboard, completo in Stats Overview

- [REFACTOR] **`renderTokenBudgetSection(container, plugins, {mode})`** accetta nuovo parametro `mode`:
  - `'compact'` (default, Dashboard): Top 5 plugin, layout standard
  - `'full'` (Stats Overview): Top 30 plugin + colonna rank `#1, #2, ...` + name suffix con marketplace + % del context window 200K nel summary
- [FEATURE] **Token budget in Stats Overview**: nuova sezione `Plugin per peso` aggiunta in fondo alla tab Overview (`renderStatsOverview`). Stessa logica di Dashboard ma con dataset esteso e più colonne
- [STYLE] Nuova classe `.token-budget-list-full` con grid template a 5 colonne (rank + name+mkt + bar + always + invoke); `.token-budget-rank-inline` + `.token-budget-name-mkt` per le info extra del full mode

## v1.0.107 — 2026-05-26 — Pack C: Token cost breakdown per plugin (Top-N + modal full table)

Prima feature del **Pack C — Insight + analytics**. Nuova sezione "Plugin per peso" in Dashboard che mostra Top-10 plugin globali attivi ordinati per token always-on (peso fisso nel context window). Click sulla riga o sul bottone "Vedi tutti" apre un modal con tabella completa di tutti i plugin attivi.

### Backend (dati già disponibili)

I dati sono **già caricati** in `state.plugins` da v1.0.11 — letti da `~/.claude/plugins/plugin-catalog-cache.json` di Claude Code per il modello `claude-sonnet-4-6`:
- `p.tokensAlways` (sempre caricati al boot di `claude`)
- `p.tokensInvoke` (cost aggiuntivo quando il plugin viene invocato)

Nessuna modifica backend richiesta — analytics puro renderer.

### Frontend

- [FEATURE] **`formatTokenSize(n)`** helper: formatta `12500 → "12.5K"`, `1500000 → "1.5M"`, `<1000 → numero`
- [FEATURE] **`renderTokenBudgetSection(container, plugins)`** in Dashboard:
  - Filtra plugin globali attivi con tokens > 0 (no locali, no blocked)
  - Summary line: "Totale always-on: X.XK tok · N plugin attivi · on-invoke potenziale Y.YK"
  - Bar chart orizzontale dei **Top 10**: nome con dot mkt color + bar proporzionale + valore tok + on-invoke estimate
  - Click su qualsiasi riga → apre modal completa
  - Footer "↗ Vedi tutti i N plugin per peso" se ci sono > 10 plugin attivi
- [FEATURE] **`showTokenBudgetModal(plugins)`**: modal large (max-w 900) con:
  - Intro esplicativa (always-on vs on-invoke + fonte plugin-catalog-cache.json)
  - Tabella completa: rank · nome · marketplace · always (con mini bar) · on-invoke · totale
  - Footer con totali aggregati (always + on-invoke + N plugin)
  - Tutti i valori formatati con `formatTokenSize`
  - Tabella ordinata desc per `tokensAlways`
- [STYLE] Nuove classi: `.token-budget-summary/-total-label/-total-val/-sub`, `.token-budget-list/-row/-name/-name-text/-dot/-bar-col/-bar/-val-always/-val-invoke/-see-all`, `.token-budget-modal/-intro/-table/-rank/-table-name/-mkt/-always/-mini/-mini-bar/-val/-invoke/-total/-modal-footer`. Coerente con design system CLACOROO

### Posizionamento

La sezione "Plugin per peso" appare in Dashboard **subito dopo le KPI Utilizzo Claude Code** e **prima delle sezioni riassuntive Marketplace/Plugin/Skill/...** (vedi v1.0.105). Visibilità alta per la decisione "quali plugin disabilitare per recuperare context".

### Non-goals (rimangono nel backlog Pack C)

- ❌ Dependency tree skill → plugin → marketplace (visualizzazione gerarchica)
- ❌ Statistiche storiche (abilitazioni/disabilitazioni nel tempo)
- ❌ Comparatore Opus 4.7 vs Sonnet 4.6 (i dati sono entrambi nel catalog cache, ma usiamo solo Sonnet ora)
- ❌ Bottone "Disabilita" direttamente dalla riga budget (l'utente può andare in sezione Plugin per fare l'azione)

## v1.0.106 — 2026-05-26 — Rinominata sidebar "Config" → "Claude Config" per chiarezza

Piccolo fix UX: la voce sidebar "Config" era ambigua rispetto a "Impostazioni" (settings dell'app CLACOROO). "Claude Config" chiarisce che la sezione contiene le impostazioni di Claude Code (`~/.claude/settings.json` — model, theme, language, Always Thinking, Voice, Effort), distinte dalle impostazioni dell'app stessa.

- [REFACTOR] `src/renderer/index.html` line 77: "Config" → "Claude Config" nella voce sidebar nav
- [REFACTOR] `src/renderer/app.js`: `sectionTitles.config: 'Config'` → `'Claude Config'` (titolo topbar quando attiva la sezione)
- [NOTE] La pagina interna mostra già `Configurazione Claude Code` come list-section-title (invariata)

## v1.0.105 — 2026-05-26 — Dashboard: sezioni riassuntive Plugin / Skill / Agent / Hooks + "Vedi tutte"

Estensione Dashboard (richiesta utente 2026-05-26): aggiunte 4 nuove sezioni riassuntive (Plugin, Skill, Agent, Hooks) con stesso stile di quelle Marketplace e MCP Server già presenti. Tutte le 6 sezioni ora hanno limite **19 chip + 20° "Vedi tutte (N)"** che porta alla sezione completa.

### Layout Dashboard finale (ordine = sidebar menu)

1. Stima contesto · Quote Claude · KPI Statistiche · Utilizzo Claude Code (invariati)
2. **Marketplace** (esistente, ora con limite + "Vedi tutte")
3. **Plugin** (NUOVO) — ordinato per `installedAt` desc
4. **Skill** (NUOVO) — recency = installedAt del plugin proprietario
5. **Agent** (NUOVO) — recency = installedAt del plugin proprietario
6. **MCP server** (esistente, ora con limite + "Vedi tutte")
7. **Hooks** (NUOVO) — recency = installedAt del plugin proprietario
8. Attività recenti (invariato)

### Helper condiviso

- [FEATURE] **`renderDashboardSection({container, title, items, buildChip, targetSection, getTimestamp, emptyText})`**: helper riusabile per tutte le sezioni. Sort items per recency (`getTimestamp` desc), slice a 19, ognuna `buildChip(item)` per la pittura, poi aggiunge come 20° chip una "Vedi tutte (N)" cliccabile che fa `switchToSection(targetSection)`. Empty state se zero items
- [FEATURE] **Chip "Vedi tutte" come ultimo riquadro sempre presente** (anche con < 20 elementi): coerenza UX, sempre lo stesso punto di accesso
- [STYLE] **`.skill-chip.dashboard-see-all`**: colore CLACOROO accent (`var(--accent-soft)` bg, `var(--accent)` border + text), icona Lucide `external-link` + label "Vedi tutte (N)". Hover scaling + accent2

### Recency / ordinamento

- **Marketplace**: `Date.parse(addedAt || lastUpdated)` desc — fallback a ordine state
- **Plugin**: `Date.parse(installedAt)` desc — disponibile da v1.0.82 (birthtime cache dir plugin)
- **Skill / Agent / Hooks**: `installedAt` del plugin proprietario come proxy (più recente plugin → più recenti skill/agent/hook del plugin). Per ora migliore alternativa senza tracking timestamp per-skill in backend
- **MCP**: ordine return da `claude mcp list` (no recency disponibile, mantengo ordine API)

### Refactor MCP Dashboard

- [REFACTOR] **`paintDashboardMcpChips`** ora applica anche il limite 19 + chip "Vedi tutte" per coerenza con le altre sezioni (prima mostrava TUTTI gli MCP, anche 12+)

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
