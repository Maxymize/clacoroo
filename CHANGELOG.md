# Changelog

> Italiano (canonico). English translation: [CHANGELOG.en.md](./CHANGELOG.en.md) — allineato a ogni release.

## v1.2.2 — 2026-07-01 — Fix: costo Fable 5 non calcolato

- [FIX] Le sessioni con Fable 5 risultavano a costo $0 nelle statistiche: mancava il prezzo di riferimento per questo modello. Ora calcolato correttamente come per gli altri modelli

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
- [IMPROVEMENT] Le schede MCP hanno ora il footer (azioni Tools/Disable/Remove) sempre allineato in basso anche quando il contenuto della card è minimo

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

## v1.0.120 — 2026-05-26 — Pack N (Phase 3g): onboarding tour e altre stringhe tradotte

- [FEATURE] Tour di benvenuto, banner aggiornamenti, command palette e modal token budget ora seguono la lingua dell'interfaccia (IT/EN)
- [IMPROVEMENT] Copertura traduzioni estesa a quasi tutte le stringhe visibili dell'app

## v1.0.119 — 2026-05-26 — Pack N (Phase 3f): pannelli Account e API key tradotti

- [FEATURE] I pannelli Account Claude e API key Claude in Impostazioni ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.118 — 2026-05-26 — Pack N (Phase 3e): plugin, marketplace e hook tradotti

- [FEATURE] Filtri, bottoni delle card plugin, notifiche di sistema e tooltip di stato ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.117 — 2026-05-26 — Pack N (Phase 3d): pagina Stats tradotta

- [FEATURE] Tab, filtri periodo, KPI e ripartizione del contesto nella pagina Stats ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.116 — 2026-05-26 — Pack N (Phase 3c): Impostazioni tradotte

- [FEATURE] I gruppi principali di Impostazioni (Percorsi, Editor, Terminale, Progetti tracciati, Aggiornamenti, Sviluppo plugin) ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.115 — 2026-05-26 — Pack N (Phase 3b): modali e dialog di conferma tradotti

- [FEATURE] I modal Aggiungi Marketplace e Aggiungi MCP, oltre a tutti i dialog di conferma dell'app, ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.114 — 2026-05-26 — Pack N (Phase 3a): stati vuoti e notifiche tradotti

- [FEATURE] Messaggi di stato vuoto e le notifiche toast più comuni ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.113 — 2026-05-26 — Pack N (Phase 2 batch 2): badge e filtri MCP tradotti

- [FEATURE] Badge di stato/scope, filtri MCP, ordinamento e switcher vista ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.112 — 2026-05-26 — Pack N (Phase 2 batch 1): Dashboard tradotta

- [FEATURE] Titoli di sezione, KPI e riepiloghi della Dashboard ora seguono la lingua dell'interfaccia (IT/EN)

## v1.0.111 — 2026-05-26 — Pulizia interna infrastruttura i18n

- [REFACTOR] Semplificata la gestione interna della lingua attiva, nessun cambiamento visibile per l'utente
- [IMPROVEMENT] Piccola ottimizzazione dei tempi di avvio

## v1.0.110 — 2026-05-26 — Pack N (Phase 1): prima infrastruttura multilingua

- [FEATURE] Introdotta l'infrastruttura di traduzione dell'app (italiano/inglese), con rilevamento automatico della lingua di sistema al primo avvio
- [FEATURE] Nuovo selettore lingua in Impostazioni, con opzione per tornare alla lingua di sistema
- [FEATURE] Sidebar, barra superiore e titoli delle sezioni principali ora tradotti; le altre aree seguiranno nelle prossime versioni

## v1.0.109 — 2026-05-26 — Confronto Opus/Sonnet e disabilitazione rapida plugin

- [FEATURE] Il pannello "Plugin per peso" permette ora di confrontare il consumo di token stimato tra i modelli Opus e Sonnet
- [FEATURE] Nuovo bottone "Disabilita" direttamente dalla riga del plugin nel token budget, senza dover andare nella sezione Plugin
- [DOCS] Aggiunta roadmap pubblica per idee future non ancora pianificate

## v1.0.108 — 2026-05-26 — Dashboard: icone nei titoli e token budget più leggibile

- [IMPROVEMENT] Spaziatura uniforme tra le sezioni della Dashboard, con icona accanto a ogni titolo di sezione
- [IMPROVEMENT] Il pannello "Plugin per peso" mostra una versione compatta in Dashboard e una tabella completa nella pagina Stats

## v1.0.107 — 2026-05-26 — Nuova sezione "Plugin per peso" in Dashboard

- [FEATURE] Nuova sezione Dashboard che mostra i plugin ordinati per consumo di token nel contesto, con i 10 più pesanti in evidenza
- [FEATURE] Modal con tabella completa di tutti i plugin attivi e il relativo peso in token

## v1.0.106 — 2026-05-26 — Chiarezza: voce sidebar "Config" rinominata

- [IMPROVEMENT] La voce di menu "Config" è stata rinominata in "Claude Config" per distinguerla chiaramente dalle Impostazioni dell'app

## v1.0.105 — 2026-05-26 — Dashboard: nuove sezioni riassuntive Plugin/Skill/Agent/Hooks

- [FEATURE] Aggiunte in Dashboard le sezioni riassuntive Plugin, Skill, Agent e Hooks (oltre a Marketplace e MCP già presenti), tutte con limite di elementi visibili e link "Vedi tutte"

## v1.0.104 — 2026-05-26 — MCP: disabilita/abilita un singolo server

- [FEATURE] I server MCP aggiunti manualmente possono ora essere disabilitati e riabilitati singolarmente, senza toccare l'intero plugin
- [FEATURE] La configurazione del server disabilitato resta salvata e viene ripristinata alla riattivazione

## v1.0.103 — 2026-05-26 — MCP: elenco degli strumenti esposti da un server

- [FEATURE] Nuovo bottone "Tools" sulle card MCP connesse: mostra l'elenco degli strumenti esposti dal server, con nome, descrizione e parametri
- [IMPROVEMENT] Se il server non supporta ancora questa funzione, l'app mostra un messaggio chiaro invece di un errore generico

## v1.0.102 — 2026-05-26 — Fix icone sui bottoni e ripulitura interna

- [FIX] Corretto un bug per cui alcune card e bottoni mostravano ancora le vecchie icone invece di quelle nuove
- [REFACTOR] Diversi helper interni consolidati per ridurre duplicazioni, nessun cambiamento di comportamento per l'utente

## v1.0.101 — 2026-05-26 — Hooks: tooltip esplicativo sugli eventi

- [FEATURE] I badge evento nella sezione Hooks ora mostrano un tooltip che spiega quando l'evento scatta e come viene tipicamente usato dai plugin

## v1.0.100 — 2026-05-26 — Tre fix UX: log attività, toast e badge "modificato"

- [FIX] Il registro attività recenti ora include anche le azioni più recenti (modifica file, aggiunta/rimozione MCP) che prima non venivano registrate
- [FIX] I toast generati dentro un modal non restano più nascosti dietro l'overlay
- [FEATURE] Le card di skill/agent modificate localmente mostrano ora un badge "Modificato" con timestamp

## v1.0.99 — 2026-05-26 — Editor inline per i file .md di skill e agent

- [FEATURE] Il modal di anteprima di skill/agent ha ora un bottone "Modifica" che apre un editor di testo per correggere il file `.md` direttamente da CLACOROO
- [FEATURE] Avviso chiaro che le modifiche sono locali e verranno sovrascritte al prossimo aggiornamento del plugin
- [FEATURE] Conferma richiesta se si chiude l'editor con modifiche non salvate

## v1.0.98 — 2026-05-26 — Tooltip più chiaro sui badge di salute di Skill/Agent

- [IMPROVEMENT] Il tooltip sui badge di avviso/errore di skill e agent ora spiega meglio cosa significano, che non sono un problema dell'installazione dell'utente, e come risolverli

## v1.0.97 — 2026-05-26 — Vista compatta anche per Marketplace, Plugin, MCP, Hooks

- [FEATURE] Tutte le sezioni principali offrono ora sia la vista a card sia una vista compatta a righe, con switch immediato dalla barra superiore
- [FIX] Corretto un problema di sovrapposizione grafica tra i badge di stato sulle card di Skill/Agent

## v1.0.96 — 2026-05-26 — Vista cards/compatta per Skill e Agent

- [FEATURE] Skill e Agent hanno ora anche una vista a card (oltre a quella compatta esistente), selezionabile con un nuovo switcher nella barra della sezione

## v1.0.95 — 2026-05-26 — MCP: card più leggibili + icone coerenti

- [FIX] Le card MCP con comandi molto lunghi non deformano più l'altezza della griglia: il testo viene troncato con un bottone "Mostra tutto"
- [REFACTOR] Sostituite le icone emoji con un set di icone coerente su bottoni e badge in tutta l'app (lavoro parziale, prosegue nelle versioni successive)

## v1.0.94 — 2026-05-26 — Filtro plugin negli Hooks + gestione completa MCP

- [FEATURE] Nuovo filtro "Plugin" nella sezione Hooks, visibile quando sono installati hook da più plugin
- [FEATURE] Possibilità di aggiungere e rimuovere server MCP direttamente da CLACOROO, con un nuovo modal guidato per l'aggiunta

## v1.0.93 — 2026-05-26 — Hooks: rilevamento automatico dopo installazione dipendenza

- [IMPROVEMENT] Dopo aver avviato l'installazione di uno strumento mancante dal terminale integrato, CLACOROO rileva automaticamente quando è pronto e aggiorna la card, senza bisogno di premere manualmente "Aggiorna"

## v1.0.92 — 2026-05-26 — Fix bottone "Installa" dipendenza mancante

- [FIX] Risolto un bug per cui il bottone "Apri terminale" nel dialog di conferma installazione non rispondeva al click

## v1.0.91 — 2026-05-26 — Hooks: bottone di installazione rapida per dipendenze mancanti

- [FEATURE] Quando una card hook segnala uno strumento CLI mancante, un nuovo bottone apre il terminale integrato con il comando di installazione ufficiale già pronto, senza eseguirlo automaticamente
- [FEATURE] Per gli strumenti che richiedono un installer grafico, un bottone alternativo apre la pagina di documentazione ufficiale

## v1.0.90 — 2026-05-26 — Hooks: rilevamento dipendenze sempre aggiornato

- [FIX] Il rilevamento degli strumenti CLI richiesti dagli hook ora si aggiorna correttamente dopo installazioni o disinstallazioni fatte mentre l'app è aperta, senza richiedere un riavvio

## v1.0.89 — 2026-05-26 — Hooks: rilevamento dipendenze più affidabile

- [FIX] Corretto il rilevamento degli strumenti CLI installati tramite installer che modificano solo il profilo della shell utente: ora vengono trovati correttamente anche se non presenti nel PATH di base dell'app

## v1.0.88 — 2026-05-26 — Hooks: fix falsi positivi nel rilevamento dipendenze

- [FIX] Corretto un bug per cui il rilevamento delle dipendenze mancanti segnalava come "strumenti da installare" anche parole chiave della shell e argomenti dei comandi, generando avvisi privi di senso

## v1.0.87 — 2026-05-26 — Hooks: badge per dipendenze CLI mancanti

- [FEATURE] Le card hook segnalano ora se uno strumento CLI richiesto dal comando (es. Bun, Deno, Python) non è installato, con un badge di avviso e le istruzioni per installarlo
- [FEATURE] Nuovo KPI in Dashboard per gli hook con dipendenze mancanti, visibile solo se presente

## v1.0.86 — 2026-05-26 — MCP: riconnessione guidata verso il menu ufficiale di Claude Code

- [FIX] Il bottone di riconnessione per i server MCP via OAuth ora apre direttamente il menu `/mcp` ufficiale di Claude Code nel terminale integrato, invece di lasciare una sessione vuota senza indicazioni
- [IMPROVEMENT] Etichette e descrizioni dei bottoni di riconnessione aggiornate per riflettere il nuovo comportamento

## v1.0.85 — 2026-05-26 — MCP: riconnessione assistita per server non connessi

- [FEATURE] Le card dei server MCP non connessi mostrano ora l'azione più adatta al tipo di server (riautorizza su claude.ai, apri il terminale, o pulisci la cache locale), con un'azione di fallback sempre disponibile
- [SECURITY] CLACOROO non legge né modifica mai le credenziali di autenticazione custodite da Claude Code: agisce solo su una cache locale non sensibile

## v1.0.84 — 2026-05-25 — Icone sidebar rinnovate

- [IMPROVEMENT] Tutte le icone della sidebar sostituite con un set più coerente e riconoscibile (in particolare MCP e Hooks, segnalate come poco chiare dagli utenti)
- [FIX] Logo nel README ora leggibile anche sul tema scuro di GitHub

## v1.0.83 — 2026-05-25 — Nuova sezione Hooks

- [FEATURE] Nuova voce di menu "Hooks": browser dedicato che raccoglie tutti gli hook di tutti i plugin installati, con ricerca, filtri per evento/scope, ordinamento e modal di dettaglio con copia della configurazione
- [FEATURE] Nuovo KPI "Hooks" in Dashboard, cliccabile per accedere alla sezione

## v1.0.82 — 2026-05-25 — Ordinamento disponibile in tutte le sezioni

- [FEATURE] Aggiunto un menu di ordinamento (già presente in Marketplace) anche a Plugin, Skill, Agent e MCP, con preferenza ricordata per ciascuna sezione

## v1.0.81 — 2026-05-25 — Copia contenuto skill/agent dal modal

- [REFACTOR] Rimosso il piccolo bottone di copia su ogni card skill/agent (copiava solo il nome, poco utile) e sostituito con un bottone unico nell'header del modal che copia l'intero contenuto del documento aperto

## v1.0.80 — 2026-05-25 — Icona app: angoli trasparenti

- [FIX] Corretti gli angoli dell'icona dell'app, che apparivano bianchi invece che trasparenti nel Dock, nell'installer e nelle anteprime del Finder

## v1.0.79 — 2026-05-25 — macOS: installazione senza avvisi "app danneggiata"

- [FIX] Risolto il messaggio "CLACOROO è danneggiato e non può essere aperto" che compariva scaricando l'app dalla release pubblica: ora appare solo il normale avviso Gatekeeper "Apri app scaricata?"

## v1.0.78 — 2026-05-25 — Skill/Agent: solo copia comando

- [REFACTOR] Rimosso il bottone di avvio diretto nel terminale per skill/agent (poco utile per gli elementi a scope globale): resta il bottone di copia del comando, da incollare in una sessione Claude già aperta nel progetto giusto

## v1.0.77 — 2026-05-25 — Skill/Agent: nuovo launcher con copia e avvio guidato

- [FEATURE] Ogni card skill/agent ha ora due bottoni: copia il comando negli appunti, oppure apre il terminale integrato con Claude Code avviato e il comando già scritto (mai inviato automaticamente)

## v1.0.76 — 2026-05-25 — Canali di supporto/donazione attivi

- [FEATURE] Nuova riga "Supporta CLACOROO" nella sidebar con accesso rapido a GitHub Sponsors, Buy Me a Coffee e PayPal
- [DOCS] README aggiornati con badge e sezione dedicata al supporto del progetto

## v1.0.75 — 2026-05-25 — Skill/Agent: avvio rapido da terminale + scelta shell

- [FIX] Il numero di versione mostrato nell'app ora proviene sempre da un'unica fonte, eliminando possibili disallineamenti
- [FEATURE] Nuovo bottone "Esegui in terminale" su ogni card di Skill e Agent
- [FEATURE] Nuovo selettore "Shell predefinita" in Impostazioni, con rilevamento automatico delle shell disponibili sul sistema

## v1.0.74 — 2026-05-25 — Disclaimer indipendenza da Anthropic

- [DOCS] Aggiunto un disclaimer, sia nei README sia in fondo alle Impostazioni dell'app, che chiarisce che CLACOROO è un progetto indipendente non affiliato ad Anthropic
- [REFACTOR] Nome del brand semplificato in tutta la documentazione e nei crediti dell'app

## v1.0.73 — 2026-05-25 — README e pannello Informazioni rifiniti

- [DOCS] README italiano e inglese riscritti in modo completo, con tutte le funzionalità dell'app organizzate per area
- [FIX] Corretto l'acronimo del nome del progetto nella documentazione
- [IMPROVEMENT] Pannello Informazioni dell'app semplificato

## v1.0.72 — 2026-05-25 — Installer DMG ridisegnato con identità CLACOROO

- [FEATURE] Nuova finestra di installazione macOS con grafica dedicata, mascotte CLACOROO e logo in stile pixel-art
- [FIX] Risolto un problema noto di alcuni tool di build che impediva la corretta visualizzazione dello sfondo personalizzato del DMG su macOS recenti

## v1.0.71 — 2026-05-23 — Pulizia bottoni pannello API key

- [REFACTOR] Rimosso un bottone duplicato nel pannello account e riorganizzati i bottoni del form API key su un'unica riga

## v1.0.70 — 2026-05-23 — API key Claude: gestione integrata e cifrata

- [FEATURE] Nuovo pannello "API key Claude" in Impostazioni per inserire, testare, salvare e rimuovere la chiave API senza dover modificare file di configurazione a mano
- [SECURITY] La chiave viene salvata in modo cifrato usando il gestore di credenziali nativo del sistema operativo (Keychain su macOS, equivalenti su Linux/Windows) e non è mai visibile in chiaro nell'interfaccia
- [FEATURE] Bottone "Test connessione" per verificare che la chiave sia valida prima di usarla
- [FEATURE] Avviso quando il sistema operativo non supporta uno storage cifrato, con indicazioni su come abilitarlo

## v1.0.69 — 2026-05-23 — Account: stato disconnesso rilevato correttamente

- [FIX] Il pannello Account ora mostra correttamente lo stato "Disconnesso" quando la sessione Claude è scaduta, invece di restare erroneamente su "Connesso"
- [FEATURE] Nuovo bottone "Login terminale" che appare quando serve rifare l'accesso, con avviso visibile anche nella sidebar

## v1.0.68 — 2026-05-23 — Changelog più leggibile con badge per categoria

- [IMPROVEMENT] Il visualizzatore Changelog in-app è stato ridisegnato: una riga per voce, con badge colorati per categoria (novità, fix, miglioramento, ecc.) invece di lunghi paragrafi

## v1.0.67 — 2026-05-22 — Terminale integrato

- [FEATURE] Nuovo terminale integrato nell'app: pannello a comparsa multi-scheda, ridimensionabile, con indicatore di stato per ogni scheda
- [FEATURE] Scorciatoie da tastiera per aprire/chiudere il terminale e creare nuove schede
- [SECURITY] Il terminale integrato convalida sempre i parametri di avvio (cartella, dimensioni, shell) prima di aprire una nuova sessione

## v1.0.66 — 2026-05-22 — Pulizia riferimenti residui alla vecchia licenza

- [DOCS] Aggiornati alcuni riferimenti rimasti alla vecchia licenza MIT nella documentazione interna

## v1.0.65 — 2026-05-22 — Cambio licenza a AGPL-3.0-or-later

- [REFACTOR] Il progetto passa dalla licenza MIT alla AGPL-3.0-or-later per proteggere il codice da fork commerciali chiusi
- [DOCS] Aggiunta una nuova voce "Licenza" nel pannello Informazioni dell'app, con link al testo ufficiale

## v1.0.64 — 2026-05-22 — Fix indicatore aggiornamento disponibile bloccato

- [FIX] Il footer non mostrava più correttamente lo stato "aggiornato" subito dopo aver installato un aggiornamento: ora il controllo si aggiorna correttamente
- [DOCS] Aggiunta nota sul workaround Gatekeeper necessario finché l'app non sarà firmata e notarizzata

## v1.0.63 — 2026-05-22 — Test end-to-end del sistema di aggiornamento

- [CHORE] Verifica completa del flusso di rilevamento e installazione aggiornamento, dal download fino all'installazione

## v1.0.62 — 2026-05-22 — Footer sidebar: versione e stato aggiornamento

- [FEATURE] Il footer della sidebar mostra ora la versione corrente dell'app e un indicatore colorato che segnala se è disponibile un aggiornamento
- [FEATURE] Bottone "UPDATE" per aprire direttamente la pagina di download quando c'è una nuova versione

## v1.0.61 — 2026-05-22 — Eliminato definitivamente lo sfarfallio tra i modal

- [FIX] Risolti gli ultimi casi residui di sfarfallio visivo quando si passa da un modal a un altro

## v1.0.60 — 2026-05-22 — Niente più sfarfallio tra modal consecutivi

- [FIX] Corretto lo sfarfallio visibile quando si apre un modal sopra un altro già aperto

## v1.0.59 — 2026-05-22 — Editor esterno: supporto Windows e Linux

- [FIX] Il collegamento con l'editor esterno ora funziona correttamente anche su Windows e Linux, non solo su macOS
- [IMPROVEMENT] Messaggi di errore più specifici per piattaforma quando l'editor non viene trovato

## v1.0.58 — 2026-05-22 — Editor esterno: aggiunto Antigravity

- [FEATURE] Aggiunta la possibilità di aprire file con l'editor Antigravity (Google), oltre alle opzioni già esistenti

## v1.0.57 — 2026-05-22 — Editor esterno configurabile

- [FEATURE] Nuova opzione in Impostazioni per scegliere l'editor esterno predefinito (VS Code, Cursor o quello di sistema), invece di un'unica scelta fissa

## v1.0.56 — 2026-05-22 — Modal plugin: dettagli hook e apertura sorgente

- [FEATURE] Il modal "Contenuto plugin" mostra ora anche l'elenco degli hook con il relativo conteggio
- [FEATURE] Bottoni per aprire il plugin nel Finder o nell'editor direttamente dal modal
- [IMPROVEMENT] Click su skill/agent nel modal apre subito l'anteprima, con un passaggio in meno

## v1.0.55 — 2026-05-22 — Ordinamento marketplace

- [FEATURE] Nuovo menu di ordinamento per la sezione Marketplace (predefinito, aggiunti/aggiornati di recente o meno recente), con preferenza ricordata

## v1.0.54 — 2026-05-22 — Card marketplace: conteggio più chiaro

- [FIX] Corretto il conteggio dei plugin installati/disponibili sulla card marketplace, che in alcuni casi risultava ambiguo

## v1.0.53 — 2026-05-22 — Card marketplace: installati vs disponibili

- [FEATURE] La card marketplace ora distingue chiaramente i plugin installati da quelli disponibili ma non ancora installati
- [IMPROVEMENT] Ordinamento e tooltip aggiornati per riflettere questa distinzione

## v1.0.52 — 2026-05-22 — Installazione plugin dal marketplace

- [FEATURE] Il modal "Plugin del marketplace" mostra ora tutti i plugin disponibili, con bottone "Installa" e anteprima del costo in token prima di confermare
- [FEATURE] Notifica desktop e aggiornamento automatico dopo l'installazione

## v1.0.51 — 2026-05-22 — Aggiungi Marketplace dal pannello

- [FEATURE] Nuovo bottone "+ Marketplace" nella barra superiore della sezione Marketplace, con modal guidato per aggiungerne uno nuovo

## v1.0.50 — 2026-05-22 — Rifinitura badge conteggio plugin

- [IMPROVEMENT] Migliorata la leggibilità del badge con il numero di plugin sulle card Marketplace

## v1.0.49 — 2026-05-22 — Sidebar: Marketplace prima di Plugin

- [IMPROVEMENT] Riordinate le voci di menu per riflettere la gerarchia logica (i Marketplace contengono i Plugin, che a loro volta contengono Skill/Agent/MCP)

## v1.0.48 — 2026-05-22 — Card marketplace: numero plugin cliccabile

- [IMPROVEMENT] Rimossa una striscia grafica poco elegante dalle card Marketplace
- [FEATURE] Il numero di plugin sulla card è ora cliccabile per aprire direttamente l'elenco

## v1.0.47 — 2026-05-22 — Rifinitura card plugin e marketplace

- [IMPROVEMENT] Layout dei bottoni sulle card plugin più coerente indipendentemente dalla lunghezza della descrizione
- [IMPROVEMENT] Tooltip immediati sui bottoni a icona, senza il ritardo del tooltip nativo del browser

## v1.0.46 — 2026-05-22 — Modal "Contenuto plugin"

- [FEATURE] Nuovo bottone sulle card plugin che apre un modal con il riepilogo del contenuto (skill, agent, MCP, hook e stima token)
- [FEATURE] Click su una skill/agent nel modal porta direttamente alla relativa sezione con filtro applicato

## v1.0.45 — 2026-05-22 — Stats per-progetto: design e filtro

- [IMPROVEMENT] Nuovo design più leggibile per le statistiche per-progetto
- [FEATURE] Filtrati automaticamente i progetti senza alcuna attività registrata

## v1.0.44 — 2026-05-22 — Fix posizione tooltip istogramma

- [FIX] Il tooltip dell'istogramma token giornalieri in Stats non esce più dai bordi della finestra

## v1.0.43 — 2026-05-22 — Nota esplicativa sulle percentuali per modello

- [DOCS] Aggiunta una nota che chiarisce il significato delle percentuali di utilizzo per modello in Stats

## v1.0.42 — 2026-05-22 — Fix percentuali token per modello

- [FIX] Corretto un calcolo errato che mostrava percentuali di utilizzo per modello palesemente sbagliate (es. oltre il 24000%)

## v1.0.41 — 2026-05-22 — Niente più sfarfallio nella pagina Config

- [IMPROVEMENT] Le modifiche in Claude Config ora si applicano istantaneamente, senza ricaricare l'intera pagina

## v1.0.40 — 2026-05-22 — Pulizia Impostazioni e fix toggle Voice

- [FIX] Corretto un bug per cui il toggle Voice non veniva salvato correttamente nella configurazione di Claude Code
- [FIX] Corrette le opzioni di lingua delle risposte, non più riconosciute correttamente da Claude Code
- [FEATURE] Aggiunte le varianti di tema mancanti nel selettore tema di Claude Code
- [IMPROVEMENT] Sezione Informazioni delle Impostazioni compattata in una sola riga

## v1.0.39 — 2026-05-22 — Quote sessione/settimana anche su Windows e Linux

- [FEATURE] Le quote di utilizzo sessione/settimana sono ora leggibili anche su Windows e Linux, non solo macOS

## v1.0.38 — 2026-05-22 — Dashboard riorganizzata + Config come sezione autonoma

- [IMPROVEMENT] Dashboard riorganizzata mettendo in cima le informazioni che cambiano più spesso
- [FEATURE] La sezione Config diventa una voce autonoma della sidebar con scorciatoia da tastiera dedicata

## v1.0.37 — 2026-05-22 — Fix percentuali quote errate

- [FIX] Corretto un bug che mostrava le percentuali di utilizzo delle quote 100 volte più grandi del reale (es. 1400% invece di 14%)

## v1.0.36 — 2026-05-22 — Fix critici lettura quote Claude

- [FIX] Risolto un errore che impediva la lettura corretta delle quote di utilizzo dell'account Claude
- [FEATURE] Rinnovo automatico della sessione quando prossima alla scadenza
- [SECURITY] Il rinnovo avviene solo in memoria: CLACOROO non modifica mai le credenziali salvate da Claude Code

## v1.0.35 — 2026-05-22 — Quote sessione e settimana visibili in app

- [FEATURE] Nuove barre di utilizzo (sessione 5h, settimana, settimana Sonnet) visibili sia nel pannello Account sia in una nuova sezione Dashboard "Quote Claude"
- [FEATURE] Colore della barra che cambia in base alla soglia di utilizzo raggiunta
- [FEATURE] Link diretto alla gestione dell'utilizzo su claude.ai

## v1.0.34 — 2026-05-22 — Logout: tooltip più curato

- [IMPROVEMENT] Sostituito un riquadro di avviso fisso con un tooltip più elegante sul bottone Logout

## v1.0.33 — 2026-05-22 — Avviso più chiaro sul logout globale

- [FEATURE] Avviso ben visibile che spiega che il logout disconnette l'account ovunque (CLACOROO, CLI, IDE), non solo nell'app
- [IMPROVEMENT] Dialog di conferma riscritto con più dettagli

## v1.0.32 — 2026-05-22 — Effort level: selettore a slider

- [FEATURE] Il livello di "Effort" di Claude Code si imposta ora con uno slider a 5 livelli invece di un menu a tendina
- [FIX] Corretto un link non funzionante verso le impostazioni di fatturazione

## v1.0.31 — 2026-05-22 — Guida all'uso con API key

- [FEATURE] Nuova guida in-app per chi vuole usare Claude Code con una API key pay-per-use invece dell'abbonamento
- [SECURITY] La guida mostra solo come impostare la chiave manualmente: CLACOROO non la salva né la legge in questa modalità

## v1.0.30 — 2026-05-22 — Effort level configurabile

- [FEATURE] Nuovo selettore "Effort level" nella pagina Config per modificare il comportamento di Claude Code

## v1.0.29 — 2026-05-22 — Accesso rapido all'account in sidebar

- [FEATURE] Nuovo riquadro sempre visibile in sidebar con piano ed email dell'account collegato
- [FEATURE] Bottoni di accesso rapido a claude.ai e alla console API

## v1.0.28 — 2026-05-22 — Nuovo KPI: valore stimato in dollari

- [FEATURE] Nuovo KPI che stima quanto costerebbe in dollari l'utilizzo registrato se pagato a consumo, utile per capire il risparmio del piano in abbonamento

## v1.0.27 — 2026-05-21 — Pannello Account Claude

- [FEATURE] Nuovo pannello Impostazioni con piano, email, organizzazione e metodo di autenticazione dell'account collegato
- [FEATURE] Bottoni per aggiornare lo stato e per il logout, con conferma esplicita

## v1.0.26 — 2026-05-21 — Card KPI: nuovo stile con glow

- [IMPROVEMENT] Le card KPI hanno ora un bagliore morbido invece di una linea colorata, più coerente con lo stile dell'app

## v1.0.25 — 2026-05-21 — Card KPI più compatte

- [IMPROVEMENT] Ridotto il padding e la dimensione delle card KPI per una Dashboard più densa e leggibile

## v1.0.24 — 2026-05-21 — Sezione MCP server in Dashboard

- [FEATURE] Nuova sezione Dashboard con i server MCP configurati, mostrati come riquadri cliccabili con indicatore di stato

## v1.0.23 — 2026-05-21 — Stima contesto include i server MCP

- [FEATURE] La barra "Stima contesto" include ora anche il peso stimato dei server MCP connessi, aggiornato in tempo reale

## v1.0.22 — 2026-05-21 — Rifinitura sezione MCP

- [FEATURE] Bottone di copia rapida su ogni card MCP
- [FEATURE] Gli URL dei server HTTP/SSE sono cliccabili e si aprono nel browser (utile per completare l'autenticazione)

## v1.0.21 — 2026-05-21 — Nuova sezione MCP server

- [FEATURE] Nuova sezione "MCP" in sidebar con l'elenco dei server configurati e il relativo stato di connessione
- [FEATURE] Filtri per stato e tipo di server, bottone per aggiornare lo stato in tempo reale
- [FEATURE] Nuovo KPI "MCP connessi" in Dashboard

## v1.0.20 — 2026-05-21 — Stima contesto: animazione più fluida

- [FIX] La barra "Stima contesto" non sparisce più momentaneamente quando si attiva o disattiva un plugin

## v1.0.19 — 2026-05-21 — Stima contesto anche nella pagina Plugin

- [FEATURE] La barra "Stima contesto" è ora visibile anche in cima alla pagina Plugin, e si aggiorna live con ogni azione

## v1.0.18 — 2026-05-21 — KPI "Utilizzo Claude Code" in Dashboard

- [FEATURE] Nuovi KPI in Dashboard su sessioni, messaggi, token, giorni attivi e modello preferito
- [FEATURE] Barra "Stima contesto" aggiunta anche in Dashboard

## v1.0.17 — 2026-05-21 — KPI "Modello preferito" più leggibile

- [IMPROVEMENT] Il nome del modello preferito ora appare per esteso invece che abbreviato

## v1.0.16 — 2026-05-21 — Fix conteggio sessioni

- [FIX] Il KPI "Sessioni" ora conta correttamente le sessioni reali, risultando prima sottostimato

## v1.0.15 — 2026-05-21 — Statistiche allineate a Claude Code

- [FIX] Corretto il calcolo dei token totali, che risultava molto più alto del reale
- [FEATURE] Nuovo KPI "Giorno più attivo" e filtri periodo applicati a tutti i KPI, non solo alla heatmap

## v1.0.14 — 2026-05-21 — Heatmap rinnovata + nuovi KPI

- [FEATURE] Heatmap dell'attività ridisegnata in stile Claude Desktop, con l'intero anno visibile
- [FEATURE] Nuovi KPI riassuntivi sopra la heatmap
- [FIX] Corretta la stima del contesto per skill/agent, che risultava eccessiva

## v1.0.13 — 2026-05-21 — Heatmap attività + stima contesto

- [FEATURE] Nuova heatmap di attività in stile GitHub
- [FEATURE] Nuova sezione "Stima contesto" che mostra la composizione stimata del contesto caricato
- [FIX] Corretto un bug per cui alcuni toggle di Claude Config si resettavano da soli dopo un secondo

## v1.0.12 — 2026-05-21 — Nuova sezione Stats

- [FEATURE] Nuova sezione "Stats" con panoramica, statistiche per modello, per progetto e configurazione visuale
- [IMPROVEMENT] Caching per un cambio tab istantaneo

## v1.0.11 — 2026-05-21 — Progetti tracciati: scope locale/globale

- [FEATURE] CLACOROO può ora mostrare anche i plugin/skill/agent configurati a livello di singolo progetto, non solo quelli globali
- [FEATURE] Nuova gestione "Progetti tracciati" in Impostazioni, con badge che distingue elementi globali e locali

## v1.0.10 — 2026-05-21 — Command palette, Changelog viewer, sidebar Recenti

- [FEATURE] Nuova command palette globale per cercare e aprire rapidamente qualsiasi elemento
- [FEATURE] Visualizzatore Changelog integrato in Impostazioni
- [FEATURE] Sidebar arricchita con una sezione "Recenti" per tornare rapidamente alle ultime azioni

## v1.0.09 — 2026-05-21 — Controllo automatico degli aggiornamenti

- [FEATURE] Controllo automatico di nuove versioni all'avvio e periodicamente, con banner e link diretto al download
- [FEATURE] Possibilità di posticipare o saltare una versione specifica

## v1.0.08 — 2026-05-21 — Mascotte ridisegnata

- [IMPROVEMENT] Nuovo design della mascotte CLACOROO, più espressiva e definita
- [IMPROVEMENT] Pannello Informazioni dell'app rifinito

## v1.0.07 — 2026-05-21 — Sicurezza e integrazione desktop nativa

- [SECURITY] Rafforzata la configurazione di sicurezza della finestra dell'app e bloccata l'apertura di popup o navigazioni verso siti esterni
- [FEATURE] Menu applicazione nativo macOS e scorciatoie da tastiera per le sezioni principali
- [FEATURE] Notifiche di sistema per le azioni sui plugin quando l'app non è in primo piano

## v1.0.06 — 2026-05-21 — Nuova tipografia

- [FEATURE] Nuovi font (Inter e Source Serif) inclusi nell'app per un look coerente con l'ecosistema Claude
- [FIX] Icona dell'app corretta anche in modalità sviluppo

## v1.0.05 — 2026-05-20 — Prima ondata di funzionalità locali

- [FEATURE] Bottoni rapidi per aprire un plugin nel Finder o nell'editor
- [FEATURE] Registro delle attività recenti, visibile in Dashboard
- [FEATURE] Validatore plugin, tour di benvenuto al primo avvio, ed export/import di uno snapshot di configurazione
- [FEATURE] Controllo di salute su skill/agent con badge di avviso in caso di file malformati
- [FIX] Corretta la fonte di verità per lo stato attivo/disattivo dei plugin

## v1.0.04 — 2026-05-20 — Distribuzione multipiattaforma

- [FEATURE] Pacchetti installabili per macOS, Windows e Linux, con icona dedicata dell'app
- [FEATURE] Supporto nativo alla modalità scura su macOS

## v1.0.02 — 2026-05-19 — Rebrand CLACOROO

- [FEATURE] Rebrand completo dell'app con identità visiva ispirata a Claude
- [FEATURE] Mascotte pixel-art e logo animato nella schermata di caricamento
- [DOCS] README riscritto in italiano

## v1.0.01 — 2026-05-19 — Prima release

- [FEATURE] Gestione visuale di plugin, marketplace, skill e agent di Claude Code
- [FEATURE] Dashboard con KPI di sintesi, toggle attiva/disattiva plugin, aggiornamento e disinstallazione
- [FEATURE] Sezioni Marketplace, Skill e Agent con ricerca, più aggiornamento automatico su modifiche esterne alla configurazione
- [SECURITY] Architettura sicura basata su processo isolato e validazione degli input prima di ogni comando eseguito
