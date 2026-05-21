# Changelog

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
