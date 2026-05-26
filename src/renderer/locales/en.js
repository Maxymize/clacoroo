// Locale: en. Default fallback per sistemi non-it. Shape deve restare
// identica a it.js (controllata da `t()` con fallback).
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
    stimaContestoStile: 'Context estimate · claude /context style',
    attivitaRecenti:    'Recent activity',
    attivita7g:         'Activity · last 7 days',
    attivita30g:        'Activity · last 30 days',
    attivita52sett:     'Activity · last 52 weeks',
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
    hooksTooltip:    'Open the Hooks section',
    hooksWarnTooltip:'Open Hooks to see which CLI tools are missing',
  },

  // Badge / Status
  badge: {
    scopeGlobal:      'global',
    scopeLocal:       'local',
    scopeProgetto:    'project',
    scopeLocalNamed:  'local: {name}',
    scopeLocalParen:  'local ({name})',
    pluginActive:     'active',
    healthError:      'health: error',
    healthWarn:       'health: warning',
    disabled:         'disabled',
    modified:         'modified',
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

  // Chip nelle sezioni riassuntive (Dashboard)
  chip: {
    openSection: 'Open the {name} section',
  },

  // View switcher
  view: {
    cards:   'Cards view',
    compact: 'Compact view',
  },

  // Sort options
  sort: {
    label:        'Sort:',
    nameAsc:      'Name (A → Z)',
    nameDesc:     'Name (Z → A)',
    installedDesc:'Recently installed',
    installedAsc: 'Installed earliest',
    statusFirst:  'Status (Connected first)',
    eventAsc:     'Event (A → Z)',
    eventDesc:    'Event (Z → A)',
    pluginAsc:    'Plugin (A → Z)',
    pluginDesc:   'Plugin (Z → A)',
    mktDefault:   'Default (by N plugins)',
    mktAddedDesc: 'Recently added',
    mktAddedAsc:  'Added earliest',
    mktUpdatedDesc:'Recently updated',
    mktUpdatedAsc:'Updated earliest',
  },

  // Filter chips
  filter: {
    all:           'All',
    allKinds:      'All types',
    fromPlugin:    'From plugins',
    builtinClaudeAi:'claude.ai',
    needsAuth:     'Needs Auth',
  },

  // Search placeholder generico
  search: {
    generic:       'Search…',
    hooks:         'Search matcher, command, plugin…',
  },

  // Empty states
  empty: {
    noPlugin:        'No plugin installed.',
    noPluginResults: 'No plugin matches the filters.',
    noSkill:         'No skill available.',
    noAgent:         'No agent available.',
    noMcp:           'No MCP server configured.',
    noMcpResults:    'No server matches the filters.',
    noHooks:         'No hooks configured from installed plugins.',
    noHooksInstall:  'No hooks found. Install a plugin with `hooks/hooks.json` to populate this section.',
    noResults:       'No results match the filters.',
    noResultsShort:  'No results',
    noActivity:      'No activity recorded. Operations you perform here will appear in this list.',
    noStatsProjects: 'No project with activity found in ~/.claude/projects/',
    noTrackedProjects:'No project tracked. Add one from the "+" button in the topbar.',
    noGenericItems:  'No items.',
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
    dataReloaded:    'Data reloaded',
    copied:          'Copied to clipboard',
    saved:           'Saved',
    error:           'Error',
    configChanged:   'Configuration changed — reloading…',
    noPublicRelease: 'No public release available (private repo or no releases)',
    upToDate:        'You\'re on the latest version ✓',
    updateCheckError:'Update check error: {msg}',
    cannotCopy:      'Cannot copy to clipboard',
    pluginRemoved:   'Plugin removed: {id}',
    pluginUpdated:   'Updated: {id}',
    pluginDisabled:  'Plugin disabled: {id} (−{tok} tok)',
    projectAdded:    'Project added: {name}',
    projectRemoved:  'Project removed',
    marketplaceAdded:'Marketplace added',
    errorPrefix:     'Error: {msg}',
    errorOpen:       'Open error: {msg}',
    errorOpenFinder: 'Finder open error: {msg}',
    errorOpenEditor: 'Editor open error: {msg}',
    errorUpdate:     'Update error: {msg}',
    copiedShort:     'Copied: {text}',
  },
};
