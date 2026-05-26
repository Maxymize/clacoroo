// Locale: it. Caricato come <script> tag (no require: contextIsolation+
// nodeIntegration:false). Shape deve restare identica fra tutti i locales/*.
'use strict';

window.LOCALES = window.LOCALES || {};
window.LOCALES.it = {
  // Navigation sidebar
  nav: {
    dashboard:    'Dashboard',
    marketplace:  'Marketplace',
    plugin:       'Plugin',
    skill:        'Skill',
    agent:        'Agent',
    mcp:          'MCP',
    hooks:        'Hooks',
    stats:        'Stats',
    config:       'Claude Config',
    settings:     'Impostazioni',
  },

  // Topbar
  topbar: {
    refresh:        'Aggiorna',
    terminal:       'Terminale',
    addProject:     'Progetto',
    addMarketplace: 'Marketplace',
    addMcp:         'MCP',
    refreshTooltip: 'Ricarica i dati dai file di configurazione di Claude Code + ricontrolla le dipendenze hook',
    addProjectTooltip: 'Aggiungi un progetto da tracciare (per vedere plugin/skill/agent locali)',
    addMcpTooltip:  'Aggiungi un MCP server (HTTP, SSE o stdio) via `claude mcp add`',
    addMktTooltip:  'Aggiungi un marketplace da URL git, repo GitHub o path locale',
  },

  // Section titles (Dashboard + main pages)
  section: {
    quoteClaude:        'Quote Claude',
    statistiche:        'Statistiche',
    utilizzoClaude:     'Utilizzo Claude Code',
    pluginPerPeso:      'Plugin per peso (context window)',
    stimaContesto:      'Stima contesto',
    stimaContestoStile: 'Stima contesto · stile claude /context',
    attivitaRecenti:    'Attività recenti',
    attivita7g:         'Attività · ultimi 7 giorni',
    attivita30g:        'Attività · ultimi 30 giorni',
    attivita52sett:     'Attività · ultime 52 settimane',
    marketplaceTitle:   'Marketplace',
    pluginTitle:        'Plugin',
    skillTitle:         'Skill',
    agentTitle:         'Agent',
    mcpServerTitle:     'MCP server',
    hooksTitle:         'Hooks',
    configClaudeCode:   'Configurazione Claude Code',
  },

  // KPI labels Dashboard
  kpi: {
    pluginActive:    'Plugin attivi',
    pluginDisabled:  'Disattivati',
    pluginLocal:     'Plugin locali',
    marketplace:     'Marketplace',
    skillTotal:      'Skill totali',
    agentTotal:      'Agent totali',
    mcpConnected:    'MCP connessi',
    hooks:           'Hooks',
    hooksPlugins:    'Hooks · {n} plugin',
    tokensAlways:    'Token always-on',
    healthIssues:    'Health issues',
    healthWarning:   'Warning',
    health:          'Health',
    hooksMissingDeps:'Hook con dep mancanti',
    hooksTooltip:    'Apri la sezione Hooks',
    hooksWarnTooltip:'Apri Hooks per vedere quali tool CLI sono mancanti',
  },

  // Badge / Status
  badge: {
    scopeGlobal: 'globale',
    scopeLocal:  'locale',
    healthError: 'health: errore',
    healthWarn:  'health: warning',
    disabled:    'disabilitato',
    modified:    'modificato',
  },

  // Status MCP
  mcp: {
    status: {
      connected:  'Connected',
      needsAuth:  'Needs auth',
      warning:    'Warning',
      error:      'Errore',
      unknown:    'Sconosciuto',
      disabled:   'Disabilitato',
    },
    section: {
      builtin:    'claude.ai · globale',
      pluginLbl:  'plugin:',
      userAdded:  'user-added',
    },
  },

  // Buttons standard (action)
  button: {
    cancel:        'Annulla',
    save:          'Salva',
    confirm:       'Conferma',
    close:         'Chiudi',
    copy:          'Copia',
    edit:          'Modifica',
    delete:        'Elimina',
    remove:        'Rimuovi',
    disable:       'Disabilita',
    enable:        'Abilita',
    add:           'Aggiungi',
    install:       'Installa',
    update:        'Aggiorna',
    open:          'Apri',
    openPreview:   'Apri preview',
    openHooksJson: 'Apri hooks.json',
    seeAll:        'Vedi tutte',
    details:       'Dettagli',
    tools:         'Tools',
  },

  // Chip nelle sezioni riassuntive (Dashboard)
  chip: {
    openSection: 'Apri la sezione {name}',
  },

  // View switcher
  view: {
    cards:   'Vista a cards',
    compact: 'Vista compatta',
  },

  // Sort options
  sort: {
    label:       'Ordina:',
    nameAsc:     'Nome (A → Z)',
    nameDesc:    'Nome (Z → A)',
    installedDesc:'Installati di recente',
    installedAsc: 'Installati meno di recente',
    statusFirst: 'Stato (Connected prima)',
    eventAsc:    'Evento (A → Z)',
    eventDesc:   'Evento (Z → A)',
    pluginAsc:   'Plugin (A → Z)',
    pluginDesc:  'Plugin (Z → A)',
  },

  // Search placeholder generico
  search: {
    generic:       'Cerca…',
    hooks:         'Cerca matcher, command, plugin…',
  },

  // Empty states
  empty: {
    noPlugin:     'Nessun plugin installato.',
    noSkill:      'Nessuna skill disponibile.',
    noAgent:      'Nessun agent disponibile.',
    noMcp:        'Nessun MCP server configurato.',
    noHooks:      'Nessun hook configurato dai plugin installati.',
    noResults:    'Nessun risultato corrisponde ai filtri.',
    noActivity:   'Nessuna attività registrata. Le operazioni che farai qui appariranno in questo elenco.',
  },

  // Settings (sezione Impostazioni)
  settings: {
    language:       'Lingua',
    languageHint:   'Lingua dell\'interfaccia CLACOROO. La prima volta viene auto-rilevata dal sistema operativo.',
    useSystemLang:  'Usa lingua sistema',
    useSystemLangTooltip: 'Riusa l\'auto-detect della lingua dal sistema operativo (rilevamento eseguito al prossimo avvio)',
  },

  // Toast messages comuni
  toast: {
    dataReloaded:   'Dati ricaricati',
    copied:         'Copiato negli appunti',
    saved:          'Salvato',
    error:          'Errore',
  },
};
