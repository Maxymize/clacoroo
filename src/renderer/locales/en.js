/*
 * CLACOROO v1.0.110+ — Pack N: i18n
 * Locale: English (default fallback for non-Italian systems)
 *
 * Caricato come <script> nel renderer (no require). Si attacca a
 * `window.LOCALES.en`. Mirror di `it.js` (stessa shape, EN strings).
 */
'use strict';

window.LOCALES = window.LOCALES || {};
window.LOCALES.en = {
  // Navigation sidebar
  nav: {
    dashboard:    'Dashboard',
    marketplace:  'Marketplace',
    plugin:       'Plugins',
    skill:        'Skills',
    agent:        'Agents',
    mcp:          'MCP',
    hooks:        'Hooks',
    stats:        'Stats',
    config:       'Claude Config',
    settings:     'Settings',
  },

  // Topbar
  topbar: {
    refresh:        'Refresh',
    terminal:       'Terminal',
    addProject:     'Project',
    addMarketplace: 'Marketplace',
    addMcp:         'MCP',
    refreshTooltip: 'Reload data from Claude Code config files + recheck hook dependencies',
    addProjectTooltip: 'Add a project to track (to see local plugins/skills/agents)',
    addMcpTooltip:  'Add an MCP server (HTTP, SSE or stdio) via `claude mcp add`',
    addMktTooltip:  'Add a marketplace from git URL, GitHub repo or local path',
  },

  // Section titles (Dashboard + main pages)
  section: {
    quoteClaude:        'Claude Quote',
    statistiche:        'Statistics',
    utilizzoClaude:     'Claude Code Usage',
    pluginPerPeso:      'Plugins by weight (context window)',
    stimaContesto:      'Context estimate',
    attivitaRecenti:    'Recent activity',
    marketplaceTitle:   'Marketplaces',
    pluginTitle:        'Plugins',
    skillTitle:         'Skills',
    agentTitle:         'Agents',
    mcpServerTitle:     'MCP servers',
    hooksTitle:         'Hooks',
    configClaudeCode:   'Claude Code configuration',
  },

  // KPI labels Dashboard
  kpi: {
    pluginActive:    'Active plugins',
    pluginDisabled:  'Disabled',
    pluginLocal:     'Local plugins',
    marketplace:     'Marketplaces',
    skillTotal:      'Total skills',
    agentTotal:      'Total agents',
    mcpConnected:    'MCP connected',
    hooks:           'Hooks',
    hooksPlugins:    'Hooks · {n} plugins',
    tokensAlways:    'Always-on tokens',
    healthIssues:    'Health issues',
    healthWarning:   'Warnings',
    health:          'Health',
    hooksMissingDeps:'Hooks with missing deps',
  },

  // Badge / Status
  badge: {
    scopeGlobal: 'global',
    scopeLocal:  'local',
    healthError: 'health: error',
    healthWarn:  'health: warning',
    disabled:    'disabled',
    modified:    'modified',
  },

  // Status MCP
  mcp: {
    status: {
      connected:  'Connected',
      needsAuth:  'Needs auth',
      warning:    'Warning',
      error:      'Error',
      unknown:    'Unknown',
      disabled:   'Disabled',
    },
    section: {
      builtin:    'claude.ai · global',
      pluginLbl:  'plugin:',
      userAdded:  'user-added',
    },
  },

  // Buttons standard (action)
  button: {
    cancel:        'Cancel',
    save:          'Save',
    confirm:       'Confirm',
    close:         'Close',
    copy:          'Copy',
    edit:          'Edit',
    delete:        'Delete',
    remove:        'Remove',
    disable:       'Disable',
    enable:        'Enable',
    add:           'Add',
    install:       'Install',
    update:        'Update',
    open:          'Open',
    openPreview:   'Open preview',
    openHooksJson: 'Open hooks.json',
    seeAll:        'See all',
    details:       'Details',
    tools:         'Tools',
  },

  // View switcher
  view: {
    cards:   'Cards view',
    compact: 'Compact view',
  },

  // Sort options
  sort: {
    label:       'Sort:',
    nameAsc:     'Name (A → Z)',
    nameDesc:    'Name (Z → A)',
    installedDesc:'Recently installed',
    installedAsc: 'Installed earliest',
    statusFirst: 'Status (Connected first)',
    eventAsc:    'Event (A → Z)',
    eventDesc:   'Event (Z → A)',
    pluginAsc:   'Plugin (A → Z)',
    pluginDesc:  'Plugin (Z → A)',
  },

  // Search placeholder generico
  search: {
    generic:       'Search…',
    hooks:         'Search matcher, command, plugin…',
  },

  // Empty states
  empty: {
    noPlugin:     'No plugin installed.',
    noSkill:      'No skill available.',
    noAgent:      'No agent available.',
    noMcp:        'No MCP server configured.',
    noHooks:      'No hooks configured from installed plugins.',
    noResults:    'No results match the filters.',
    noActivity:   'No activity recorded. Operations you perform here will appear in this list.',
  },

  // Settings (sezione Impostazioni)
  settings: {
    language:       'Language',
    languageHint:   'CLACOROO interface language. The first time, it is auto-detected from the operating system.',
    useSystemLang:  'Use system language',
    useSystemLangTooltip: 'Re-use the OS language auto-detection (detection runs on next launch)',
  },

  // Toast messages comuni
  toast: {
    dataReloaded:   'Data reloaded',
    copied:         'Copied to clipboard',
    saved:          'Saved',
    error:          'Error',
  },
};
