# Changelog

## v1.0.38 — 2026-05-22

- Dashboard riorganizzata: in cima ora ci sono "Stima contesto" e "Quote Claude" (le info che cambiano più spesso), seguiti dalle KPI di installazione (Plugin, Marketplace, Skill, ecc.) con il nuovo titolo "Statistiche", poi le KPI "Utilizzo Claude Code"
- Sezione "Config" promossa a voce di menu autonoma (tra "Stats" e "Impostazioni"), con icona dedicata e accelerator `Cmd+8`. Rimossa dal tab di Stats — è una configurazione, non una statistica
- Tooltip immediato sopra ogni pallino dell'Effort slider con nome esteso ("Low", "Medium", "High", "Extra-high", "Max")

## v1.0.37 — 2026-05-22

- Fix: i valori percentuali delle quote ora corrispondono a quelli del plugin VS Code Claude (erano 100× più grandi, es. 1400% al posto di 14%). L'API Anthropic restituisce `utilization` già in percentuale 0..100, non come float 0..1; la moltiplicazione extra era un errore mio
- Clamp di sicurezza a [0, 100] per evitare display oltre 100% in caso di transienti API

## v1.0.36 — 2026-05-22

Fix critici alle quote (v1.0.35 mostrava sempre "Token non valido"):

- Header obbligatorio `anthropic-beta: oauth-2025-04-20` aggiunto (era mancante, causa principale del 401)
- Parsing keychain corretto: il payload è annidato sotto `claudeAiOauth.accessToken`, non flat
- Refresh token automatico via `POST platform.claude.com/v1/oauth/token` quando il token sta per scadere (entro 5 minuti) o quando la chiamata torna 401
- Token rinnovato mantenuto SOLO in memoria del processo (CLACOROO non riscrive mai il keychain di Claude Code — sicurezza assoluta delle credenziali)

## v1.0.35 — 2026-05-22

- **Quote sessione e settimana** finalmente visibili in CLACOROO. Tre barre orizzontali (Session 5h · Weekly 7d · Weekly Sonnet) con percentuale e tempo al reset, esattamente come nella modal di Claude Code in VS Code
- Visibili nel pannello "Account Claude" di Impostazioni e in una nuova sezione "Quote Claude" della Dashboard
- Le barre cambiano colore in base alla soglia: blu fino all'80%, arancio 80-95%, rosso oltre
- Bottone "Gestisci usage su claude.ai →" per aprire la dashboard completa
- I dati vengono letti via `GET /api/oauth/usage` con il token OAuth del macOS Keychain (lo stesso che usa Claude Code). La prima volta macOS chiede "Allow keychain access" — è il flusso standard, dopo "Always Allow" il permesso resta permanente
- Cache 60s e render ottimistico per zero flicker

## v1.0.34 — 2026-05-22

- Pannello Account: rimosso il box arancio fisso, sostituito con un tooltip custom che appare al passaggio del mouse sul bottone Logout. Stesso contenuto (avviso che il logout è globale di sistema), ma estetica più pulita
- Tooltip stilizzato in card con freccia, titolo arancio "⚠ Logout di sistema", lista delle istanze impattate e nota su come ri-autenticarsi

## v1.0.33 — 2026-05-22

- Avviso esplicito sul Logout: ora il pannello Account mostra un box arancio "⚠ Il logout disconnette OVUNQUE (CLACOROO + CLI terminale + plugin IDE)" già prima di cliccare il bottone
- Dialog di conferma riscritto con dettaglio chiaro sullo storage condiviso (macOS Keychain) e la lista delle istanze che si disconnetteranno
- Bottone "Sì, logout globale" invece del generico "Logout" nel dialog
- Tooltip del bottone aggiornato con il warning

## v1.0.32 — 2026-05-22

- "Effort level" è ora uno slider a 5 pallini blu stile VS Code Claude plugin (low → max). Click sul pallino imposta il livello, gli attivi diventano blu pieno
- Label dinamico accanto al titolo: "Effort (xhigh)" mostra il livello corrente
- Fix link "↗ claude.ai" nel pannello Account: ora punta a `https://claude.ai/settings/billing` (era un URL inesistente su claude.com)

## v1.0.31 — 2026-05-22

- Nuovo bottone "ℹ Modalità API key" nel pannello Account: apre una guida step-by-step (modal) per chi vuole usare un'API key pay-per-use invece della subscription Max/Pro
- Sicurezza assoluta: CLACOROO NON salva, legge o trasmette mai la tua chiave. La guida ti mostra come impostarla nel tuo `.zshrc` / `.bashrc` (lo standard più sicuro), e copia i comandi in clipboard

## v1.0.30 — 2026-05-22

- Tab Config (Stats): nuovo selettore "Effort level" (low / medium / high / xhigh / max) — modifica `effortLevel` di `~/.claude/settings.json` istantaneamente, equivalente a `claude --effort <level>`. Posizionato accanto a Modello predefinito

## v1.0.29 — 2026-05-22

- Pill account sempre visibile nella sidebar (badge piano + email, sotto Recenti, sopra Stato). Click apre le Impostazioni
- Pannello Account: due nuovi bottoni di accesso rapido — "↗ claude.ai" (gestione subscription) e "↗ Console API" (billing, API keys, usage)

## v1.0.28 — 2026-05-22

- Nuovo KPI "Valore API stimato" in Stats e Dashboard: mostra in USD quanto staresti spendendo se pagassi pay-per-use API (sei su Max plan: questo valore è la stima del risparmio della subscription)
- Calcolo basato sui prezzi pubblici Anthropic (Opus $15/$75 input/output 1M, Sonnet $3/$15, Haiku $0.80/$4, con cache read/write proporzionali)
- Range Tutto / 30g / 7g supportato (sub-range stimati per proporzione di messaggi)

## v1.0.27 — 2026-05-21

- Nuovo pannello "Account Claude" in Impostazioni: piano (badge Max / Pro / Team colorato), email, organizzazione, ID org, metodo di autenticazione, provider API
- Bottoni "Aggiorna" e "Logout" — il logout chiede conferma prima di disconnettere
- Le quote sessione/settimanale al momento non sono esposte dalla CLI di Claude Code: per vederle apri Claude Code interattivo ed esegui `/usage` (avvisato nel pannello)
- Cache 5 minuti per non rilanciare `claude auth status` a ogni apertura della sezione

## v1.0.26 — 2026-05-21

- Card KPI: rimossa la linea colorata in alto, sostituita con un glow morbido del colore di accent che avvolge tutta la card (e si intensifica leggermente in hover)
- Bordo della card tinto del colore di accent ma desaturato, in modo coerente con la palette dark

## v1.0.25 — 2026-05-21

- Dashboard: spazio aggiuntivo tra le sezioni "Marketplace" e "MCP server" per migliorarne la leggibilità
- Card KPI più compatte: padding ridotto, numero principale 26px (era 32px), griglia con larghezza minima 140px (era 160px) — più informazioni a colpo d'occhio senza scroll

## v1.0.24 — 2026-05-21

- Dashboard: nuova sezione "MCP server" subito sotto "Marketplace" con chip cliccabili (dot colorato per stato), click porta alla sezione MCP
- Sezione MCP: rimossi link cliccabili sull'URL e icona apri-in-browser (gli endpoint MCP non sono pagine web). Resta solo il bottone "copia negli appunti"

## v1.0.23 — 2026-05-21

- La barra "Stima contesto" include ora un nuovo segmento **MCP servers** (colore ciano) accanto a Skills, System prompt, Agents, Memory files e Free space
- Stima ~400 token per ogni MCP server connesso (mediana osservata sui plugin del catalogo ufficiale; il valore reale varia col numero di tool esposti)
- La barra si aggiorna in tempo reale quando attivi o disattivi un plugin che porta con sé degli MCP server: vedi visualmente quanto contesto liberi
- Cache MCP invalidata automaticamente ad ogni cambio plugin (`installed_plugins.json` / `settings.json` modificati o azione plugin riuscita)
- Il calcolo è applicato ovunque la barra è presente: Dashboard, sezione Plugin, sezione Stats

## v1.0.22 — 2026-05-21

- Sezione MCP: i filtri per tipo (claude.ai / Dai plugin) sono ora visivamente separati dai filtri di stato con un divisore verticale
- Bottone copy negli appunti su ogni card MCP per URL o comando
- URL HTTP / SSE cliccabili direttamente: si aprono nel browser di sistema (utile per OAuth dei server "Needs Auth")
- Icona dedicata ↗ accanto agli URL per aprirli senza dover cliccare sul testo

## v1.0.21 — 2026-05-21

- Nuova sezione "MCP" in sidebar: lista tutti gli MCP server configurati con stato Connected / Needs Auth / Errore
- Card stile Marketplace per ogni server: nome, origine (claude.ai globale oppure plugin), transport (HTTP / stdio / SSE), URL o comando, badge stato colorato
- Filtri per stato (Tutti / Connected / Needs Auth / Errore) e per tipo (claude.ai / Dai plugin)
- Bottone "Aggiorna stato live" che rilancia il health-check ufficiale di Claude Code
- KPI "MCP connessi" aggiunto alla Dashboard (X/Y connessi)
- Solo lettura in questa versione: azioni come Reconnect, Clear auth, Disable, View tools sono pianificate per le prossime release

## v1.0.20 — 2026-05-21

- La barra "Stima contesto" non sparisce più quando attivi o disattivi un plugin: i segmenti si animano in modo fluido fino al nuovo valore (era un flash bianco di ~1 secondo)
- Aggiornamento in-place dei valori senza ricostruire il DOM; transizione CSS sulla larghezza dei segmenti
- Render ottimistico con i dati precedenti al cambio sezione, swap morbido quando arrivano i nuovi

## v1.0.19 — 2026-05-21

- Barra "Stima contesto" aggiunta anche in cima alla pagina Plugin
- Tutte le barre di stima contesto si aggiornano dinamicamente quando attivi, disattivi, aggiorni o rimuovi un plugin — vedi in tempo reale quanto contesto liberi o occupi
- Cache statistiche invalidata sia dopo le azioni plugin sia ogni volta che `~/.claude/settings.json` cambia (anche dall'esterno)

## v1.0.18 — 2026-05-21

- Dashboard arricchita con i 9 KPI di "Utilizzo Claude Code" (Sessioni, Messaggi, Token totali, Giorni attivi, Giorno più attivo, Serie attuale, Serie più lunga, Ora di punta, Modello preferito) — visione "Tutto", senza filtri di range
- Aggiunta in Dashboard la barra "Stima contesto" con legenda in linea orizzontale sotto la barra, per restare compatta verticalmente
- Le statistiche caricate sono condivise con la sezione Stats (no doppio I/O)

## v1.0.17 — 2026-05-21

- KPI "Modello preferito" mostra ora il nome esteso `Opus 4.7` / `Sonnet 4.6` (era abbreviato a `opus` / `sonnet`)
- Etichetta del KPI tornata estesa: `Modello Preferito` su due righe (era troncata a `Modello pref.`)

## v1.0.16 — 2026-05-21

- KPI "Sessioni" ora conta i file `.jsonl` reali nella cartella `~/.claude/projects/` invece di dipendere dalla cache aggregata (che era sottostimata di qualche unità)
- I filtri 30g / 7g applicano il count reale filtrando i file per data di modifica, allineando il valore mostrato a quello di `claude /stats`

## v1.0.15 — 2026-05-21

Allineate le statistiche al comando `claude /stats` ufficiale:

- "Token totali" ora corrisponde a quello di Claude: somma solo input+output (era ~400× più alto perché includeva erroneamente il cache_read, che è gratis e non viene conteggiato)
- Filtri Tutto / 30g / 7g ora applicano anche ai KPI (non solo alla heatmap): Sessioni, Messaggi, Token e Giorni attivi cambiano in base al range scelto
- Nuovo KPI "Giorno più attivo": mostra la data con più messaggi nel range
- "Giorni attivi" ora mostra il ratio `attivi/totali` quando il range è 30g o 7g (come Claude /stats: "18/30")
- "Modello preferito" per range 30g/7g: ricalcolato dai dati del periodo, non più all-time

## v1.0.14 — 2026-05-21

- Heatmap ridisegnata stile Claude Desktop: 52 settimane × 7 giorni (anno intero), label mesi in basso, tooltip flottante che mostra "Lunedì 21 maggio 2026 · 1.234 messaggi" al passaggio del mouse (era un "?" senza info)
- 8 KPI sopra heatmap: Sessioni, Messaggi, Token totali, Giorni attivi, Serie attuale, Serie più lunga, Ora di punta, Modello preferito
- Filtri "Tutto / 30g / 7g" per scegliere il periodo della heatmap
- Stima contesto realistica: per skill/agent conta solo il frontmatter YAML (indice di discovery), non il body completo. Esclude plugin disabilitati. Aggiunge "Free space" alla barra. Il valore non sfora più il 100% (era 417%)
- Nota chiarificatrice: "Per skill/agent conta solo il frontmatter — il body viene caricato solo quando invocata"

## v1.0.13 — 2026-05-21

- Heatmap attività ridisegnata in stile GitHub contribution graph (13 settimane × 7 giorni) con label mesi e legenda intensità
- Nuova "Stima contesto" stile `claude /context`: barra orizzontale con segmenti System prompt / Memory files / Skills / Agents, percentuale fill su 200k, lettura reale dei file installati
- Istogramma giornaliero token: tooltip personalizzato segue il mouse con dettaglio per-modello (top 3)
- Tab Per-progetto: aggiunto conteggio messaggi e nota chiarificatrice ("1 sessione = 1 apertura di Claude Code, può contenere migliaia di messaggi")
- Fix: toggle Always Thinking / Voice nel Config tab non si resetta più dopo 1 secondo (cache stats invalidata correttamente quando settings.json cambia)

## v1.0.12 — 2026-05-21

- Nuova sezione "Stats" nella sidebar con 4 tab:
  - **Overview**: KPI (token totali, sessioni, streak, giorni attivi) e heatmap attività ultimi 90 giorni
  - **Modelli**: barre token per modello (input/output/cache) e istogramma giornaliero ultimi 30 giorni
  - **Per-progetto**: lista progetti Claude Code con sessioni e token aggregati, path reale via lettura JSONL
  - **Config**: editor visuale per modificare al volo `~/.claude/settings.json` (modello, tema, lingua, Always Thinking, Voice)
- Heatmap stile GitHub contribution graph, colori palette CLACOROO
- Caching server-side 60s + caching client-side per evitare re-IO ad ogni cambio tab
- Path progetti decodificato leggendo il campo `cwd` dei file JSONL (più affidabile del decode ambiguo della directory)

## v1.0.11 — 2026-05-21

- Scope locale/globale: CLACOROO ora può tracciare i progetti che usi e mostrare anche i plugin/skill/agent installati nel loro `.claude/` locale
- Nuovo bottone "+ Progetto" in alto a destra per aggiungere progetti da tracciare
- Sezione Impostazioni → "Progetti tracciati" per gestire la lista (vedi/rimuovi)
- Badge "globale" (blu) / "locale: nome-progetto" (verde) su ogni plugin, skill e agent
- Item locali sono read-only (la CLI `claude plugins` opera solo a livello globale)
- Auto-refresh quando il file `.claude/plugins/installed_plugins.json` di un progetto cambia

## v1.0.10 — 2026-05-21

- Nuova command palette globale: premi `Cmd+K` per cercare e aprire plugin, skill, agent, marketplace o eseguire azioni rapide
- Viewer changelog integrato: nuovo bottone `📋 Changelog` in Impostazioni mostra lo storico versioni in schede colorate
- Sidebar arricchita: sezione "Recenti" con le ultime attività eseguite, click per saltare al contesto

## v1.0.09 — 2026-05-21

- Controllo automatico aggiornamenti: l'app verifica all'avvio se è disponibile una nuova release
- Banner in alto quando esce una nuova versione, con accesso diretto al download
- Nuova sezione Impostazioni → Aggiornamenti con check manuale e attivazione/disattivazione del controllo automatico
- Possibilità di saltare versioni specifiche o rimandare la notifica

## v1.0.08 — 2026-05-21

- Mascotte ridisegnata: testa più tonda, 4 zampette ben definite, occhi grandi e dolci con highlight
- Antenna ora in grigio caldo, ben visibile sullo sfondo scuro
- Sotto il logo CLACOROO appare la versione estesa "CLAude-code COntrol ROom"
- About panel pulito con copyright aggiornato
- Icona app rigenerata con la nuova mascotte

## v1.0.07 — 2026-05-21

- Sicurezza rinforzata: renderer in sandbox, blocco popup, gestione single-instance
- Menu app nativo macOS con accesso a tutte le sezioni
- Shortcut tastiera: `Cmd+R` ricarica, `Cmd+Q` esci, `Cmd+,` impostazioni, `Cmd+1..6` cambia sezione
- About panel con info versione e link al repository
- Notifiche native macOS quando attivi/disattivi/aggiorni un plugin
- L'app ricorda dimensione finestra e ultima sezione aperta

## v1.0.06 — 2026-05-21

- Nuovi font ispirati allo stile di Anthropic Claude per familiarità visiva
- Inter per UI, Source Serif per i contenuti lunghi
- Font self-hosted: nessuna risorsa esterna, compatibile cross-platform

## v1.0.05 — 2026-05-20

- Bottoni "Apri nel Finder" / "Apri in VS Code" su ogni plugin card
- Registro attività in Dashboard: vedi cosa hai fatto di recente
- Plugin Validator: verifica plugin in sviluppo prima di pubblicarli
- Tour di benvenuto al primo avvio (riavviabile da Impostazioni)
- Health check su skill e agent: badge ⚠ se ci sono problemi nel frontmatter
- Esporta/importa snapshot configurazione: utile per backup o migrazione su altro Mac
- Visualizzatore SKILL.md / agent.md inline: clicca per leggere il contenuto

## v1.0.04 — 2026-05-20

- Pacchetto distribuibile per macOS (.dmg), Windows (.exe) e Linux (.AppImage / .deb / .rpm)
- App icon personalizzata con la mascotte CLACOROO
- macOS hardened runtime + dark mode support nativo

## v1.0.02 — 2026-05-19

- Rebrand a CLACOROO con identità visiva ispirata a Claude (Anthropic)
- Palette arancione caldo e mascotte pixel-art
- Logo "CLACOROO" con il "CO" arancione (sovrapposizione Code/Control)
- Animazione mascotte nel loading screen

## v1.0.01 — 2026-05-19

- Prima release: gestione visuale di plugin, marketplace, skill e agent di Claude Code
- Dashboard con KPI di sintesi
- Toggle attiva/disattiva plugin, aggiornamenti e rimozioni
- Auto-refresh quando i file di configurazione cambiano esternamente
- Architettura sicura: contextBridge, sandbox renderer, validazione input
