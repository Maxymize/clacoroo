'use strict';

/* ── PALETTE MARKETPLACE ──────────────────────────────────────────────── */
const MKT_COLORS = {
  'claude-plugins-official': '#d97757',  // Claude Orange (brand)
  'maxym-skills':            '#f59e0b',
  'maxym-plugins':           '#f97316',
  'anthropic-agent-skills':  '#6a9bcc',  // Anthropic blue
  'marketingskills':         '#788c5d',  // Anthropic green
  'sentry-skills':           '#dc2626',
  'cloudflare':              '#6366f1',
  'supabase-agent-skills':   '#64748b',
  'shopify-ai-toolkit':      '#78350f',
  'pm-skills':               '#2563eb',
  'context-engineering-kit': '#84cc16',
  'n8n-mcp-skills':          '#0891b2',
  'neon':                    '#06b6d4',
  'claude-video':            '#ec4899',
  'superpowers-dev':         '#9333ea',
  'karpathy-skills':         '#475569',
};

function mktColor(mkt) { return MKT_COLORS[mkt] || '#d97757'; }

/* ── STATE ────────────────────────────────────────────────────────────── */
const state = {
  rawData:   null,
  plugins:   [],
  mktList:   [],
  section:   'dashboard',
  filters: {
    plugins:      { search: '', status: 'all', mkt: 'all' },
    marketplaces: { search: '' },
    skills:       { search: '' },
    agents:       { search: '' },
  },
  // v1.0.55 — ordinamento marketplace. Valori:
  //   'default'        plugin disponibili desc, poi installati desc
  //   'added-desc'     aggiunti di recente prima
  //   'added-asc'      aggiunti meno di recente prima
  //   'updated-desc'   aggiornati di recente prima
  //   'updated-asc'    aggiornati meno di recente prima (utile per scoprire stale)
  mktSort: 'default',
};

const MKT_SORTERS = {
  'default':      (a, b) => b.available - a.available || b.installed - a.installed,
  'added-desc':   (a, b) => mktDateValue(b.addedAt) - mktDateValue(a.addedAt),
  'added-asc':    (a, b) => mktDateValue(a.addedAt) - mktDateValue(b.addedAt),
  'updated-desc': (a, b) => mktDateValue(b.lastUpdated) - mktDateValue(a.lastUpdated),
  'updated-asc':  (a, b) => mktDateValue(a.lastUpdated) - mktDateValue(b.lastUpdated),
};
function mktDateValue(s) { return s ? Date.parse(s) || 0 : 0; }
function applyMktSort() {
  const sorter = MKT_SORTERS[state.mktSort] || MKT_SORTERS['default'];
  state.mktList.sort(sorter);
}

/* ── DOM REFS ─────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── INIT ─────────────────────────────────────────────────────────────── */
async function init() {
  setupNav();
  await loadData();
  window.claudeAPI.onConfigChanged(() => {
    // v1.0.41 — se l'utente ha appena modificato un setting dalla pagina
    // Config (entro 2s), evitiamo il full reload: la UI è già aggiornata
    // ottimisticamente e ricaricare tutto fa flicker di 1-2s
    const isOurEdit = Date.now() - lastInternalSettingsWrite < 2000;
    if (isOurEdit && state.section === 'config') {
      statsCache = null;  // invalida solo per il prossimo accesso, niente reload
      return;
    }
    toast('Configurazione aggiornata — ricarico…', 'info');
    statsCache = null;
    loadData();
  });
  window.claudeAPI.onSwitchSection(name => switchToSection(name));
  window.claudeAPI.onForceRefresh(() => loadData());
  const appState = await window.claudeAPI.getState();
  if (appState.mktSort && MKT_SORTERS[appState.mktSort]) {
    state.mktSort = appState.mktSort;
    applyMktSort();
    if (state.section === 'marketplaces') render();
  }
  if (appState.lastSection && appState.lastSection !== 'dashboard') {
    switchToSection(appState.lastSection);
  }
  if (!appState.onboardingShown) showOnboardingTour();
  // v1.0.09 — Soft auto-update: check all'avvio + ogni 24h se app rimane aperta
  scheduleUpdateCheck();
  // v1.0.29 — Pack A: pill account sempre visibile in sidebar
  bootSidebarAccount();
}

function scheduleUpdateCheck() {
  runUpdateCheck(false);
  setInterval(() => runUpdateCheck(false), 24 * 60 * 60 * 1000);
}

async function runUpdateCheck(force) {
  const r = await window.claudeAPI.checkUpdates(force);
  if (!r) return;
  // Skipped per cooldown: usa risultato cached se disponibile
  const info = r.skipped ? r.cached : r;
  if (!info || !info.ok || !info.available) {
    if (force) {
      if (r.ok === false) {
        toast('Errore controllo aggiornamenti: ' + r.error, 'error');
      } else if ((info && info.reason === 'no-release') || (r.reason === 'no-release')) {
        toast('Nessuna release pubblica disponibile (repo privato o senza release)', 'info');
      } else {
        toast('Sei già sulla versione più recente ✓', 'success');
      }
    }
    return;
  }
  const appState = await window.claudeAPI.getState();
  if (appState.skippedVersion === info.latest) return;
  renderUpdateBanner(info);
}

function switchToSection(name) {
  if (state.section === name) return;
  state.section = name;
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.section === name);
  });
  render();
  window.claudeAPI.setState({ lastSection: name });
}

/* ── DATA ─────────────────────────────────────────────────────────────── */
async function loadData() {
  setStatus('loading', 'Caricamento…');
  const result = await window.claudeAPI.getData();
  if (!result.ok) {
    setStatus('error', 'Errore lettura dati');
    toast('Errore: ' + result.error, 'error');
    return;
  }
  state.rawData = result.data;
  processData();
  render();
  refreshSidebarRecent();
  setStatus('ok', state.plugins.length + ' plugin');
}

let sidebarRecentToken = 0;
async function refreshSidebarRecent() {
  const container = $('sidebar-recent');
  if (!container) return;
  const token = ++sidebarRecentToken;
  const log = await window.claudeAPI.getActivityLog();
  if (token !== sidebarRecentToken) return;  // stale
  container.textContent = '';
  if (!log.length) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  const title = el('div', 'sidebar-recent-title', 'RECENTI');
  container.appendChild(title);
  log.slice(0, 4).forEach(entry => {
    const row = el('button', 'sidebar-recent-row' + (entry.success ? ' ok' : ' err'));
    row.title = entry.kind + ' ' + entry.action + ' · ' + entry.target;
    const icon = el('span', 'sidebar-recent-icon', entry.success ? '✓' : '✗');
    const txt = el('span', 'sidebar-recent-txt', entry.target.split('@')[0]);
    row.appendChild(icon); row.appendChild(txt);
    row.addEventListener('click', () => {
      const target = entry.kind === 'marketplace' ? 'marketplaces' : 'plugins';
      switchToSection(target);
    });
    container.appendChild(row);
  });
}

function processData() {
  const raw     = state.rawData;
  const blocked = new Set((raw.blocklist.plugins || []).map(b => b.plugin));
  const catalog = raw.catalog.plugins || {};
  const localData = raw.localData || { localPlugins: [], localSkills: [], localAgents: [] };

  state.trackedProjects = raw.trackedProjects || [];
  state.localPlugins    = localData.localPlugins;
  state.localSkills     = localData.localSkills;
  state.localAgents     = localData.localAgents;

  const globalPlugins = (raw.installed.plugins || []).map(fullId => {
    const atIdx = fullId.lastIndexOf('@');
    const id    = atIdx >= 0 ? fullId.slice(0, atIdx) : fullId;
    const mkt   = atIdx >= 0 ? fullId.slice(atIdx + 1) : '';
    const cache  = raw.cacheDetails[fullId] || {};
    const cat    = catalog[fullId] || {};

    const tokenInfo = cat.tokens
      ? (cat.tokens['claude-sonnet-4-6'] || Object.values(cat.tokens)[0])
      : null;

    return {
      fullId,
      id,
      mkt,
      name:        cache.name        || id,
      description: cache.description || '',
      version:     cache.version     || '—',
      author:      cache.author      || '',
      skills:      cache.skills      || [],
      agents:      cache.agents      || [],
      skillHealth: cache.skillHealth || {},
      agentHealth: cache.agentHealth || {},
      hasMcp:      cache.hasMcp      || false,
      hasHooks:    cache.hasHooks    || false,
      blocked:     blocked.has(fullId),
      scope:       'global',
      tokensAlways: tokenInfo?.always_on  || 0,
      tokensInvoke: tokenInfo?.on_invoke  || 0,
    };
  });

  // v1.0.11 — Plugin locali normalizzati con skill/agent aggregati per pluginId
  const localNormalized = (localData.localPlugins || []).map(lp => {
    const atIdx = lp.fullId.lastIndexOf('@');
    const id  = atIdx >= 0 ? lp.fullId.slice(0, atIdx) : lp.fullId;
    const mkt = atIdx >= 0 ? lp.fullId.slice(atIdx + 1) : '';
    const skillsForPlugin = (localData.localSkills || [])
      .filter(s => s.plugin === lp.fullId && s.projectPath === lp.projectPath)
      .map(s => s.name);
    const agentsForPlugin = (localData.localAgents || [])
      .filter(a => a.plugin === lp.fullId && a.projectPath === lp.projectPath)
      .map(a => a.name);
    return {
      fullId: lp.fullId, id, mkt,
      name: id, description: '',
      version: '—', author: '',
      skills: skillsForPlugin, agents: agentsForPlugin,
      skillHealth: {}, agentHealth: {},
      hasMcp: false, hasHooks: false,
      blocked: false,
      scope: 'local',
      projectName: lp.projectName,
      projectPath: lp.projectPath,
      tokensAlways: 0, tokensInvoke: 0,
    };
  });
  state.plugins = [...globalPlugins, ...localNormalized];

  // Marketplaces
  const mktMap = raw.marketplaces || {};
  state.mktList = Object.entries(mktMap).map(([id, cfg]) => {
    const mktPlugins = state.plugins.filter(p => p.mkt === id);
    const available  = cfg._availableCount || 0;
    const installed  = mktPlugins.length;
    return {
      id,
      repo:        cfg._repo || '',
      autoUpdate:  cfg.autoUpdate  || false,
      lastUpdated: cfg.lastUpdated || '',
      addedAt:     cfg._addedAt    || '',
      plugins:     mktPlugins,
      available,
      installed,
    };
  });
  applyMktSort();  // ordinamento dinamico in base a state.filters.mktSort

  // Badge disattivati
  const blockedCount = state.plugins.filter(p => p.blocked).length;
  const badge = $('nav-badge-plugins');
  if (badge) {
    badge.textContent = String(blockedCount);
    badge.classList.toggle('visible', blockedCount > 0);
  }
}

/* ── NAVIGATION ───────────────────────────────────────────────────────── */
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchToSection(btn.dataset.section));
  });
}

/* ── RENDER DISPATCHER ────────────────────────────────────────────────── */
function render() {
  const sectionTitles = {
    dashboard:   'Dashboard',
    plugins:     'Plugin',
    marketplaces:'Marketplace',
    skills:      'Skill',
    agents:      'Agent',
    stats:       'Stats',
    settings:    'Impostazioni',
  };
  $('topbar-title').textContent = sectionTitles[state.section] || '';

  // Topbar actions
  const actions = $('topbar-actions');
  actions.textContent = '';

  // v1.0.51 — Bottone "+" contestuale alla sezione Marketplace: aggiunge
  // un marketplace da URL/repo. Sostituisce "+ Progetto" quando si è in
  // questa pagina perché Progetto qui non avrebbe senso.
  if (state.section === 'marketplaces') {
    const addMktBtn = el('button', 'btn btn-sm btn-ghost btn-refresh', '+ Marketplace');
    addMktBtn.title = 'Aggiungi un marketplace da URL git, repo GitHub o path locale';
    addMktBtn.addEventListener('click', () => showAddMarketplaceModal());
    actions.appendChild(addMktBtn);
  } else {
    // v1.0.11 — Bottone "+" per aggiungere progetto tracciato (locale)
    const addProjBtn = el('button', 'btn btn-sm btn-ghost btn-refresh', '+ Progetto');
    addProjBtn.title = 'Aggiungi un progetto da tracciare (per vedere plugin/skill/agent locali)';
    addProjBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.addTrackedProject();
      if (r.success) {
        toast('Progetto aggiunto: ' + r.path.split('/').pop(), 'success');
        await loadData();
      } else if (r.error !== 'Annullato') {
        toast('Errore: ' + r.error, 'error');
      }
    });
    actions.appendChild(addProjBtn);
  }

  const refreshBtn = el('button', 'btn btn-sm btn-ghost btn-refresh', '↻ Aggiorna');
  refreshBtn.title = 'Ricarica i dati dai file di configurazione di Claude Code';
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…';
    await loadData();
    refreshBtn.disabled = false;
    refreshBtn.textContent = '↻ Aggiorna';
    toast('Dati ricaricati', 'success');
  });
  actions.appendChild(refreshBtn);

  switch (state.section) {
    case 'dashboard':    renderDashboard();   break;
    case 'plugins':      renderPlugins();     break;
    case 'marketplaces': renderMarketplaces();break;
    case 'skills':       renderSkills();      break;
    case 'agents':       renderAgents();      break;
    case 'mcp':          renderMcp();         break;
    case 'stats':        renderStats();       break;
    case 'config':       renderConfig();      break;
    case 'settings':     renderSettings();    break;
  }
}

/* ── UTILS: DOM ───────────────────────────────────────────────────────── */
function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
}

// SVG icon helper (v1.0.40) — sostituisce le emoji nei bottoni con icone
// coerenti allo stile della nav sidebar (Heroicons-like 20x20).
const ICONS = {
  folder:    'M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z',
  document:  'M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z',
  download:  'M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z',
  upload:    'M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM13.707 5.707a1 1 0 01-1.414 0L11 4.414V12a1 1 0 11-2 0V4.414L7.707 5.707a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 010 1.414z',
  changelog: 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z',
  code:      'M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z',
  // Eye Heroicons-style: bulbo + iride con fill-rule evenodd (path multipli)
  eye:       [
    { d: 'M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
    { d: 'M.664 10.59a1.65 1.65 0 010-1.18A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.147.804 0 1.18A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z', fillRule: 'evenodd', clipRule: 'evenodd' },
  ],
};
function svgIcon(name, size = 14) {
  const def = ICONS[name];
  if (!def) return null;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('width',  String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('class', 'inline-icon');
  const paths = Array.isArray(def) ? def : [{ d: def }];
  paths.forEach(spec => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', spec.d);
    if (spec.fillRule) p.setAttribute('fill-rule', spec.fillRule);
    if (spec.clipRule) p.setAttribute('clip-rule', spec.clipRule);
    svg.appendChild(p);
  });
  return svg;
}
function btnWithIcon(cls, iconName, label) {
  const b = el('button', cls);
  const ic = svgIcon(iconName);
  if (ic) b.appendChild(ic);
  b.appendChild(document.createTextNode(label));
  return b;
}

function setContent(node) {
  const area = $('content-area');
  area.textContent = '';
  area.appendChild(node);
}

/* ── UTILS: TIME ──────────────────────────────────────────────────────── */
function relativeTime(ts) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60)     return s + 's fa';
  const m = Math.floor(s / 60);
  if (m < 60)     return m + 'm fa';
  const h = Math.floor(m / 60);
  if (h < 24)     return h + 'h fa';
  const d = Math.floor(h / 24);
  if (d < 30)     return d + 'g fa';
  return new Date(ts).toLocaleDateString('it-IT');
}

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
let dashboardRenderToken = 0;

function renderDashboard() {
  const renderToken = ++dashboardRenderToken;
  // v1.0.11 — KPI: globals e locals conteggiati separatamente
  const globals = state.plugins.filter(p => p.scope !== 'local');
  const locals  = state.plugins.filter(p => p.scope === 'local');
  const active   = globals.filter(p => !p.blocked);
  const disabled = globals.filter(p => p.blocked);
  const allSkills = state.plugins.flatMap(p => p.skills.map(s => ({ skill: s, plugin: p.fullId })));
  const allAgents = state.plugins.flatMap(p => p.agents.map(a => ({ agent: a, plugin: p.fullId })));
  const totalTokens = globals.reduce((s, p) => s + p.tokensAlways, 0);

  const wrap = el('div');

  // Health summary (idea #3): count skill+agent con status err/warn
  let healthErr = 0, healthWarn = 0;
  state.plugins.forEach(p => {
    Object.values(p.skillHealth).forEach(h => { if (h.status === 'err') healthErr++; else if (h.status === 'warn') healthWarn++; });
    Object.values(p.agentHealth).forEach(h => { if (h.status === 'err') healthErr++; else if (h.status === 'warn') healthWarn++; });
  });

  // KPI MCP: usa cache se esiste (popolata dalla sezione MCP o dall'init prefetch),
  // altrimenti placeholder e lancia fetch async che aggiornerà la card a fetch finito
  const mcpKpiNum = mcpCache && mcpCache.servers
    ? mcpCache.servers.filter(s => s.status === 'connected').length + '/' + mcpCache.servers.length
    : '—';

  // v1.0.38 — TOP della dashboard: contesto vivo + quote (ciò che cambia
  // più frequentemente). Le KPI numeriche e le sezioni elenco vengono dopo.
  const ctxBar = el('div', 'dashboard-context-section');
  wrap.appendChild(ctxBar);
  loadDashboardContextBar(ctxBar, renderToken);

  const usageSection = el('div', 'dashboard-usage-section');
  wrap.appendChild(usageSection);
  usageSection.appendChild(el('div', 'list-section-title', 'Quote Claude'));
  const usageBars = el('div', 'dashboard-usage-bars');
  usageSection.appendChild(usageBars);
  loadDashboardUsage(usageBars, renderToken);

  // KPI plugin (stato installazione)
  wrap.appendChild(el('div', 'list-section-title', 'Statistiche'));
  const kpiGrid = el('div', 'kpi-grid');
  const kpis = [
    { num: active.length,      label: 'Plugin attivi',     color: '#788c5d' },  // global only
    { num: disabled.length,    label: 'Disattivati',       color: '#ef4444' },
    { num: locals.length,      label: 'Plugin locali',     color: '#b8c79a' },  // verde Anthropic chiaro
    { num: state.mktList.length, label: 'Marketplace',     color: '#d97757' },  // CLACOROO orange
    { num: allSkills.length,   label: 'Skill totali',      color: '#e89478' },  // accent2 chiaro
    { num: allAgents.length,   label: 'Agent totali',      color: '#f97316' },
    { num: mcpKpiNum,          label: 'MCP connessi',      color: '#22c55e', kind: 'mcp' },
    { num: totalTokens > 0 ? (Math.round(totalTokens / 100) / 10) + 'K' : '—',
      label: 'Token always-on',  color: '#6a9bcc' },                            // Anthropic blue
    { num: healthErr + healthWarn,
      label: healthErr ? 'Health issues' : (healthWarn ? 'Warning' : 'Health'),
      color: healthErr ? '#ef4444' : (healthWarn ? '#f59e0b' : '#788c5d') },
  ];
  kpis.forEach(k => {
    const card = el('div', 'kpi-card');
    if (k.kind) card.dataset.kpi = k.kind;
    card.style.setProperty('--kpi-color', k.color);
    const num = el('div', 'kpi-num', String(k.num));
    const lbl = el('div', 'kpi-label', k.label);
    card.appendChild(num); card.appendChild(lbl);
    kpiGrid.appendChild(card);
  });
  wrap.appendChild(kpiGrid);

  // Se cache MCP non disponibile, fetcha async e aggiorna la card MCP in-place
  if (!mcpCache) {
    (async () => {
      const data = await window.claudeAPI.getMcp({});
      if (renderToken !== dashboardRenderToken) return;
      mcpCache = data;
      const mcpCard = kpiGrid.querySelector('.kpi-card[data-kpi="mcp"] .kpi-num');
      if (mcpCard && data.ok && data.servers) {
        const conn = data.servers.filter(s => s.status === 'connected').length;
        mcpCard.textContent = conn + '/' + data.servers.length;
      }
    })();
  }

  // KPI utilizzo Claude Code (range='all')
  const statsSection = el('div', 'dashboard-stats-section');
  wrap.appendChild(statsSection);
  loadDashboardStats(statsSection, renderToken);

  // Elenco marketplace riassuntivo
  const mktTitle = el('div', 'list-section-title', 'Marketplace');
  wrap.appendChild(mktTitle);

  const mktGrid = el('div', 'skill-grid');
  state.mktList.forEach(m => {
    const chip = el('div', 'skill-chip');
    chip.style.borderLeftColor = mktColor(m.id);

    const dot = el('span');
    dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + mktColor(m.id);
    chip.appendChild(dot);

    const name = el('span', 'skill-chip-name', m.id);
    const cnt  = el('span', 'skill-chip-plugin', m.plugins.length + ' plugin');
    chip.appendChild(name); chip.appendChild(cnt);
    mktGrid.appendChild(chip);
  });
  wrap.appendChild(mktGrid);

  // MCP server (v1.0.24) — chip riassuntiva, click → sezione MCP
  const mcpSection = el('div', 'dashboard-mcp-section');
  wrap.appendChild(mcpSection);
  loadDashboardMcp(mcpSection, renderToken);

  // Attività recenti (idea #4)
  const actTitle = el('div', 'list-section-title', 'Attività recenti');
  wrap.appendChild(actTitle);
  const actContainer = el('div', 'activity-list');
  wrap.appendChild(actContainer);
  renderActivityList(actContainer, 8, renderToken);

  setContent(wrap);
}

async function renderActivityList(container, limit, token) {
  container.textContent = '';
  const log = await window.claudeAPI.getActivityLog();
  if (token !== dashboardRenderToken) return;  // stale render, container già sostituito
  if (!log.length) {
    container.appendChild(el('div', 'activity-empty', 'Nessuna attività registrata. Le operazioni che farai qui appariranno in questo elenco.'));
    return;
  }
  log.slice(0, limit).forEach(entry => {
    const row = el('div', 'activity-row' + (entry.success ? ' ok' : ' err'));
    const icon = el('span', 'activity-icon', entry.success ? '✓' : '✗');
    const main = el('div', 'activity-main');
    const action = el('span', 'activity-action', entry.kind + ' ' + entry.action);
    const target = el('span', 'activity-target', entry.target);
    main.appendChild(action); main.appendChild(target);
    if (!entry.success && entry.error) {
      const err = el('div', 'activity-error', entry.error.slice(0, 100));
      main.appendChild(err);
    }
    const time = el('span', 'activity-time', relativeTime(entry.timestamp));
    row.appendChild(icon); row.appendChild(main); row.appendChild(time);
    container.appendChild(row);
  });
}

// Ultimo data ricevuto, non azzerato dai toggle: permette render ottimistico
// (no flash) mentre arriva il fetch fresh dopo invalidazione di statsCache.
let lastStatsData = null;

// v1.0.41 — timestamp dell'ultima updateSettings fatta dall'utente da
// CLACOROO. Usato per skippare il full re-render quando il fs.watchFile
// rileva la nostra stessa scrittura (evita il flicker "ricarico" da 1-2s).
let lastInternalSettingsWrite = 0;

async function fetchStatsSafe() {
  if (statsCache) return statsCache;
  try {
    const d = await window.claudeAPI.getStats();
    statsCache = d;
    return d;
  } catch { return null; }
}

function paintCtxBar(container, cb) {
  const existing = container.querySelector('.context-breakdown');
  if (existing) {
    // Update in-place: CSS transition anima la width dei segmenti senza flash
    updateCtxBarInPlace(existing, cb);
    return;
  }
  container.textContent = '';
  container.appendChild(el('div', 'list-section-title', 'Stima contesto'));
  container.appendChild(buildContextBreakdown(cb, {
    horizontalLegend: true,
    hideNote: true,
  }));
}

// v1.0.38 — Dashboard ora rende KPI Claude e context bar in due sezioni
// separate (context+quote in cima, KPI sotto). paintDashboardStats si
// limita ai soli KPI; per la context bar c'è paintCtxBar separato.
function paintDashboardStats(container, data) {
  const existingKpi = container.querySelector('.kpi-grid');
  if (existingKpi) {
    const newKpi = buildStatsKpiGrid(data, 'all');
    existingKpi.replaceWith(newKpi);
    return;
  }
  container.textContent = '';
  container.appendChild(el('div', 'list-section-title', 'Utilizzo Claude Code'));
  container.appendChild(buildStatsKpiGrid(data, 'all'));
}

async function loadDashboardStats(container, token) {
  const prevData = lastStatsData;
  // 1. Paint sincrono con dati precedenti — niente flash al cambio sezione/toggle
  if (prevData && prevData.cache) paintDashboardStats(container, prevData);
  // 2. Fetch fresh e swap quando arriva (no-op se identico)
  const data = await fetchStatsSafe();
  if (token !== dashboardRenderToken || !data || !data.cache) return;
  if (data !== prevData) paintDashboardStats(container, data);
  lastStatsData = data;
}

// v1.0.38 — Dashboard: context bar in cima, separata dai KPI Claude
async function loadDashboardContextBar(container, token) {
  const prevData = lastStatsData;
  if (prevData && prevData.contextBreakdown) paintCtxBar(container, prevData.contextBreakdown);
  const data = await fetchStatsSafe();
  if (token !== dashboardRenderToken || !data || !data.contextBreakdown) return;
  if (data !== prevData) paintCtxBar(container, data.contextBreakdown);
  lastStatsData = data;
}

async function loadPluginsContextBar(container, token) {
  const prevData = lastStatsData;
  if (prevData && prevData.contextBreakdown) paintCtxBar(container, prevData.contextBreakdown);
  const data = await fetchStatsSafe();
  if (token !== pluginsRenderToken || !data || !data.contextBreakdown) return;
  if (data !== prevData) paintCtxBar(container, data.contextBreakdown);
  lastStatsData = data;
}

function paintDashboardMcpChips(container, servers) {
  container.textContent = '';
  container.appendChild(el('div', 'list-section-title', 'MCP server'));
  if (!servers || !servers.length) {
    container.appendChild(el('div', 'mcp-empty', 'Nessun MCP server configurato.'));
    return;
  }
  const grid = el('div', 'skill-grid');
  const statusColor = { connected: '#22c55e', needsAuth: '#f59e0b', warning: '#f59e0b', error: '#ef4444', unknown: '#b0aea5' };
  servers.forEach(srv => {
    const chip = el('div', 'skill-chip clickable');
    chip.style.borderLeftColor = statusColor[srv.status] || '#b0aea5';
    chip.title = 'Vai alla sezione MCP per dettagli';

    const dot = el('span');
    dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + (statusColor[srv.status] || '#b0aea5');
    chip.appendChild(dot);

    const name = el('span', 'skill-chip-name', srv.displayName || srv.id);
    name.style.fontFamily = '"SF Mono", "Fira Code", Menlo, monospace';
    name.style.fontSize = '11px';
    const sub = el('span', 'skill-chip-plugin',
      srv.scope === 'builtin' ? 'claude.ai' : (srv.plugin || 'user'));
    chip.appendChild(name); chip.appendChild(sub);

    chip.addEventListener('click', () => switchToSection('mcp'));
    grid.appendChild(chip);
  });
  container.appendChild(grid);
}

async function loadDashboardMcp(container, token) {
  // Render ottimistico se cache già popolata (sezione MCP visitata prima)
  if (mcpCache && mcpCache.ok && mcpCache.servers) {
    paintDashboardMcpChips(container, mcpCache.servers);
  }
  // Fetch fresh (rispetta cache server-side 30s, no health-check ripetuto)
  const data = await window.claudeAPI.getMcp({});
  if (token !== dashboardRenderToken) return;
  if (!data || !data.ok) return;
  mcpCache = data;
  paintDashboardMcpChips(container, data.servers);
}

/* ── PLUGINS ──────────────────────────────────────────────────────────── */
let pluginsRenderToken = 0;

function renderPlugins() {
  const f = state.filters.plugins;
  const renderToken = ++pluginsRenderToken;

  const wrap = el('div');

  // Stima contesto in cima — aggiornata in tempo reale a ogni toggle/enable/disable
  const ctxSection = el('div', 'plugins-context-section');
  wrap.appendChild(ctxSection);
  loadPluginsContextBar(ctxSection, renderToken);

  // FILTER BAR
  const bar = el('div', 'filter-bar');

  const searchWrap = el('div', 'search-wrap');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 20 20'); icon.setAttribute('fill', 'currentColor');
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', 'M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z');
  icon.appendChild(iconPath);
  searchWrap.appendChild(icon);
  const searchInp = el('input', 'search-input');
  searchInp.setAttribute('placeholder', 'Cerca plugin…');
  searchInp.setAttribute('type', 'text');
  searchInp.value = f.search;
  searchInp.addEventListener('input', () => {
    state.filters.plugins.search = searchInp.value.toLowerCase();
    applyPluginFilters(grid);
  });
  searchWrap.appendChild(searchInp);
  bar.appendChild(searchWrap);

  // Status chips
  const chipDefs = [
    { key: 'all',     label: 'Tutti' },
    { key: 'active',  label: 'Attivi',      dot: '#10b981' },
    { key: 'blocked', label: 'Disattivati', dot: '#ef4444' },
  ];
  const chips = el('div', 'chips');
  chipDefs.forEach(c => {
    const chip = el('div', 'chip' + (f.status === c.key ? ' active' : ''));
    if (c.dot) {
      const dot = el('span', 'chip-dot');
      dot.style.background = c.dot;
      chip.appendChild(dot);
    }
    chip.appendChild(document.createTextNode(c.label));
    chip.addEventListener('click', () => {
      state.filters.plugins.status = c.key;
      renderPlugins();
    });
    chips.appendChild(chip);
  });
  bar.appendChild(chips);

  // Marketplace filter
  const allMkts = [...new Set(state.plugins.map(p => p.mkt))].sort();
  if (allMkts.length > 1) {
    const mktChips = el('div', 'chips');
    const allChip = el('div', 'chip' + (f.mkt === 'all' ? ' active' : ''));
    allChip.textContent = 'Tutti i marketplace';
    allChip.addEventListener('click', () => { state.filters.plugins.mkt = 'all'; renderPlugins(); });
    mktChips.appendChild(allChip);
    allMkts.forEach(mkt => {
      const c = el('div', 'chip' + (f.mkt === mkt ? ' active' : ''));
      const dot = el('span', 'chip-dot');
      dot.style.background = mktColor(mkt);
      c.appendChild(dot);
      c.appendChild(document.createTextNode(mkt));
      c.addEventListener('click', () => { state.filters.plugins.mkt = mkt; renderPlugins(); });
      mktChips.appendChild(c);
    });
    bar.appendChild(mktChips);
  }

  wrap.appendChild(bar);

  // COUNT
  const countRow = el('div', 'section-header');
  const countSpan = el('span', 'section-count', '');
  countRow.appendChild(countSpan);
  wrap.appendChild(countRow);

  // GRID
  const grid = el('div', 'cards-grid');
  let visible = 0;

  state.plugins.forEach(p => {
    const card = buildPluginCard(p);
    const show = pluginMatchesFilter(p, f);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
    grid.appendChild(card);
  });

  if (visible === 0) {
    const no = el('div', 'no-results', 'Nessun plugin corrisponde ai filtri.');
    grid.appendChild(no);
  }

  countSpan.textContent = visible + ' di ' + state.plugins.length + ' plugin';
  wrap.appendChild(grid);

  setContent(wrap);
  searchInp.focus();
}

function pluginMatchesFilter(p, f) {
  const statusOk = f.status === 'all'
    || (f.status === 'active'  && !p.blocked)
    || (f.status === 'blocked' &&  p.blocked);
  const mktOk = f.mkt === 'all' || p.mkt === f.mkt;
  const q = f.search;
  const searchOk = !q
    || p.id.includes(q)
    || p.mkt.includes(q)
    || p.description.toLowerCase().includes(q)
    || p.skills.some(s => s.includes(q))
    || p.agents.some(a => a.includes(q));
  return statusOk && mktOk && searchOk;
}

function applyPluginFilters(grid) {
  const f = state.filters.plugins;
  let visible = 0;
  grid.querySelectorAll('.plugin-card').forEach((card, i) => {
    const p = state.plugins[i];
    if (!p) return;
    const show = pluginMatchesFilter(p, f);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const countEl = grid.previousElementSibling?.querySelector('.section-count');
  if (countEl) countEl.textContent = visible + ' di ' + state.plugins.length + ' plugin';
}

// Helper condiviso dai modal Contenuto plugin / Plugin marketplace:
// aggiunge una sezione con titolo e una lista di item cliccabili.
// extraRender(item, infoBlock) consente di iniettare badge o info aggiuntive.
function appendModalItemList(content, sectionTitle, items, onClick, extraRender) {
  if (!items || !items.length) return;
  content.appendChild(el('h3', 'plugin-content-section-title', sectionTitle));
  const list = el('div', 'plugin-content-list');
  items.forEach(item => {
    const row = el('button', 'plugin-content-item');
    row.appendChild(svgIcon('code'));
    const info = el('div', 'plugin-content-item-info');
    info.appendChild(el('div', 'plugin-content-item-name', item.name || item.id || item));
    if (item.description) info.appendChild(el('div', 'plugin-content-item-desc', item.description));
    if (extraRender) extraRender(item, info);
    row.appendChild(info);
    row.appendChild(el('span', 'plugin-content-item-arrow', '→'));
    row.addEventListener('click', () => onClick(item));
    list.appendChild(row);
  });
  content.appendChild(list);
}

// Modal "Contenuto plugin": skill/agent/hook/MCP di un plugin con click
// → switch sezione + filtro pre-applicato sul nome.
function showPluginContentModal(p) {
  if (document.querySelector('.md-overlay')) return;
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-skill', 'plugin'));
  title.appendChild(document.createTextNode(' ' + p.id));
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = el('div', 'md-content');

  // Header info
  const info = el('div', 'plugin-content-info');
  info.appendChild(el('div', 'plugin-content-mkt', p.mkt + ' · v' + p.version));
  if (p.description) info.appendChild(el('div', 'plugin-content-desc', p.description));
  content.appendChild(info);

  // Summary numerico
  const summary = el('div', 'plugin-content-summary');
  function summCell(value, label) {
    const c = el('div', 'plugin-content-stat');
    c.appendChild(el('div', 'plugin-content-stat-value', String(value)));
    c.appendChild(el('div', 'plugin-content-stat-label', label));
    return c;
  }
  summary.appendChild(summCell(p.skills.length, p.skills.length === 1 ? 'skill' : 'skills'));
  summary.appendChild(summCell(p.agents.length, p.agents.length === 1 ? 'agent' : 'agents'));
  summary.appendChild(summCell(p.hasMcp ? 'sì' : '—', 'MCP'));
  summary.appendChild(summCell(p.hasHooks ? 'sì' : '—', 'Hook'));
  if (p.tokensAlways) summary.appendChild(summCell(p.tokensAlways, 'tok always-on'));
  content.appendChild(summary);

  appendModalItemList(content, 'Skills', p.skills, item => {
    state.filters.skills = { search: (item.name || item).toLowerCase() };
    switchToSection('skills');
    close();
  });
  appendModalItemList(content, 'Agents', p.agents, item => {
    state.filters.agents = { search: (item.name || item).toLowerCase() };
    switchToSection('agents');
    close();
  });

  if (p.hasMcp) {
    content.appendChild(el('h3', 'plugin-content-section-title', 'MCP server'));
    const note = el('div', 'plugin-content-mcp-link');
    note.textContent = 'Questo plugin espone MCP server — vedi i dettagli completi nella sezione MCP.';
    const goBtn = el('button', 'btn btn-sm btn-primary');
    goBtn.textContent = '↗ Vai a MCP';
    goBtn.addEventListener('click', () => { switchToSection('mcp'); close(); });
    note.appendChild(goBtn);
    content.appendChild(note);
  }

  if (p.hasHooks) {
    content.appendChild(el('h3', 'plugin-content-section-title', 'Hook'));
    content.appendChild(el('div', 'plugin-content-note',
      'Plugin definisce hook (PreToolUse, PostToolUse, UserPromptSubmit, ecc.). Apri il sorgente con il bottone editor per ispezionarli.'));
  }

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function buildPluginCard(p) {
  const col = mktColor(p.mkt);
  const card = el('div', 'plugin-card' + (p.blocked ? ' blocked' : '') + (p.scope === 'local' ? ' local-scope' : ''));
  card.style.setProperty('--mkt-color', col);

  // BODY
  const body = el('div', 'pc-body');

  const top = el('div', 'pc-top');
  const leftCol = el('div');
  const idEl  = el('div', 'pc-id', p.id);
  const verEl = el('div', 'pc-ver', 'v' + p.version);
  leftCol.appendChild(idEl); leftCol.appendChild(verEl);

  const rightCol = el('div');
  rightCol.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:4px;';
  const pill = el('span', 'pc-mkt-pill', p.mkt);
  pill.style.background = col + '28';
  pill.style.color = col;
  rightCol.appendChild(pill);
  // Badge scope (v1.0.11)
  const scopeBadge = el('span', 'scope-badge scope-' + p.scope,
    p.scope === 'local' ? 'locale: ' + (p.projectName || 'progetto') : 'globale');
  if (p.projectPath) scopeBadge.title = p.projectPath;
  rightCol.appendChild(scopeBadge);

  top.appendChild(leftCol); top.appendChild(rightCol);
  body.appendChild(top);

  if (p.description) {
    const desc = el('div', 'pc-desc', p.description);
    body.appendChild(desc);
  }

  // BADGES (v1.0.46 — cliccabili: aprono il modal "Contenuto plugin")
  const badges = el('div', 'pc-badges');
  function addBadge(txt, cls, tooltip, onClick) {
    const b = el('span', 'badge ' + cls, txt);
    if (tooltip) b.title = tooltip;
    if (onClick) {
      b.classList.add('badge-clickable');
      b.addEventListener('click', onClick);
    }
    badges.appendChild(b);
  }
  const openDetails = () => showPluginContentModal(p);
  if (p.skills.length)  addBadge(p.skills.length + ' skill', 'b-skill',
    'Skill in questo plugin — click per vedere lista e dettagli', openDetails);
  if (p.agents.length)  addBadge(p.agents.length + ' agent', 'b-agent',
    'Agent in questo plugin — click per vedere lista', openDetails);
  if (p.hasMcp)         addBadge('MCP', 'b-mcp',
    'Plugin esporta uno o più MCP server — click per dettagli', openDetails);
  if (p.hasHooks)       addBadge('Hook', 'b-hook',
    'Plugin definisce hook (PreToolUse, PostToolUse, ecc.)', openDetails);
  if (p.tokensAlways)   addBadge(p.tokensAlways + ' tok', 'b-tokens',
    'Token "always-on" stimati: peso aggiunto al context window di Claude Code da questo plugin a prescindere dall\'utilizzo attivo. Fonte: plugin-catalog-cache.json di Claude Code.');
  if (p.blocked)        addBadge('DISATTIVATO', 'b-blocked');
  body.appendChild(badges);
  card.appendChild(body);

  // FOOTER
  const footer = el('div', 'pc-footer');

  // v1.0.11 — Scope locale: footer ridotto (la CLI 'claude plugins' opera
  // solo globalmente, niente toggle/update/remove)
  if (p.scope === 'local') {
    const info = el('div', 'pc-local-info', 'read-only · progetto');
    footer.appendChild(info);
    const openBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'folder', ' Apri progetto');
    openBtn.title = p.projectPath || '';
    openBtn.addEventListener('click', async () => {
      // shell.openPath è il metodo corretto cross-platform per aprire una directory
      // nel file manager (Finder/Explorer/Files).
      if (!p.projectPath) return;
      const r = await window.claudeAPI.openDirectory(p.projectPath);
      if (!r.success) toast('Errore apertura: ' + r.error, 'error');
    });
    footer.appendChild(openBtn);
    card.appendChild(footer);
    return card;
  }

  // Toggle enable/disable
  const toggleWrap = el('label', 'toggle');
  toggleWrap.title = p.blocked ? 'Attiva plugin' : 'Disattiva plugin';
  const inp = el('input');
  inp.type = 'checkbox';
  if (!p.blocked) inp.checked = true;
  const track = el('span', 'toggle-track');
  const thumb = el('span', 'toggle-thumb');
  toggleWrap.appendChild(inp); toggleWrap.appendChild(track); toggleWrap.appendChild(thumb);

  inp.addEventListener('change', async () => {
    toggleWrap.classList.add('loading');
    inp.disabled = true;
    const action = p.blocked ? 'enable' : 'disable';
    const result = await window.claudeAPI.pluginAction(action, p.fullId);
    if (result.success) {
      const verb = action === 'enable' ? 'Attivato' : 'Disattivato';
      toast((action === 'enable' ? '✓ ' : '✗ ') + verb + ': ' + p.id, action === 'enable' ? 'success' : 'warn');
      window.claudeAPI.showNotification('Plugin ' + verb.toLowerCase(), p.id);
      statsCache = null;  // forza re-fetch contextBreakdown → barra si aggiorna
      await loadData();
    } else {
      toast('Errore: ' + result.error, 'error');
      inp.checked = !inp.checked; // revert
      toggleWrap.classList.remove('loading');
      inp.disabled = false;
    }
  });

  footer.appendChild(toggleWrap);

  // Action buttons
  const actions = el('div', 'pc-actions');

  const detailsBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  detailsBtn.dataset.tt = 'Vedi contenuto plugin';
  detailsBtn.appendChild(svgIcon('eye'));
  detailsBtn.addEventListener('click', () => showPluginContentModal(p));

  const finderBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  finderBtn.dataset.tt = 'Apri sorgente nel Finder';
  finderBtn.appendChild(svgIcon('folder'));
  finderBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openPluginPath(p.fullId);
    if (!r.success) toast('Errore apertura Finder: ' + r.error, 'error');
  });

  const codeBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  codeBtn.dataset.tt = 'Apri sorgente in VS Code';
  codeBtn.appendChild(svgIcon('code'));
  codeBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openInEditor(p.fullId);
    if (!r.success) toast('Errore apertura VS Code: ' + r.error, 'error');
  });

  actions.appendChild(detailsBtn);
  actions.appendChild(finderBtn);
  actions.appendChild(codeBtn);

  const updateBtn = el('button', 'btn btn-sm btn-ghost', 'Aggiorna');
  updateBtn.addEventListener('click', async () => {
    updateBtn.disabled = true;
    updateBtn.textContent = '…';
    const r = await window.claudeAPI.pluginAction('update', p.fullId);
    if (r.success) {
      toast('Aggiornato: ' + p.id, 'success');
      window.claudeAPI.showNotification('Plugin aggiornato', p.id);
    } else toast('Errore aggiornamento: ' + r.error, 'error');
    updateBtn.disabled = false;
    updateBtn.textContent = 'Aggiorna';
    statsCache = null;
    await loadData();
  });

  const uninstBtn = el('button', 'btn btn-sm btn-danger', 'Rimuovi');
  uninstBtn.addEventListener('click', async () => {
    const choice = await window.claudeAPI.confirmDialog({
      title:   'Rimuovi plugin',
      message: 'Rimuovere ' + p.id + '?',
      detail:  'Il plugin verrà disinstallato da Claude Code.',
      buttons: ['Annulla', 'Rimuovi'],
    });
    if (choice !== 1) return;
    uninstBtn.disabled = true;
    const r = await window.claudeAPI.pluginAction('uninstall', p.fullId);
    if (r.success) {
      toast('Plugin rimosso: ' + p.id, 'success');
      window.claudeAPI.showNotification('Plugin rimosso', p.id);
      statsCache = null;
      await loadData();
    } else {
      toast('Errore: ' + r.error, 'error');
      uninstBtn.disabled = false;
    }
  });

  actions.appendChild(updateBtn);
  actions.appendChild(uninstBtn);
  footer.appendChild(actions);
  card.appendChild(footer);

  return card;
}

/* ── MARKETPLACES ─────────────────────────────────────────────────────── */
// v1.0.51 — Modal "Aggiungi marketplace": input source + validazione +
// chiamata `claude plugins marketplace add <source>` via IPC. Accetta:
//   - shorthand GitHub:  user/repo  (es. "thedotmack/claude-mem")
//   - URL git completo:  https://github.com/user/repo[.git]
//   - path locale:       /path/to/local/marketplace
function showAddMarketplaceModal() {
  if (document.querySelector('.md-overlay')) return;
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', 'marketplace'));
  title.appendChild(document.createTextNode(' Aggiungi marketplace'));
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title); header.appendChild(closeBtn);

  const content = el('div', 'md-content');

  content.appendChild(el('p', null,
    'Aggiungi un nuovo marketplace per scoprire e installare plugin Claude Code. ' +
    'CLACOROO esegue `claude plugins marketplace add <source>` per te.'));

  // Input source
  const formWrap = el('div', 'add-mkt-form');
  const lbl = el('label', 'add-mkt-label', 'Source');
  lbl.setAttribute('for', 'add-mkt-input');
  formWrap.appendChild(lbl);

  const input = el('input', 'add-mkt-input');
  input.id = 'add-mkt-input';
  input.type = 'text';
  input.placeholder = 'es. thedotmack/claude-mem';
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('autocomplete', 'off');
  formWrap.appendChild(input);

  const helper = el('div', 'add-mkt-helper');
  helper.appendChild(el('div', null, 'Formati accettati:'));
  const ul = el('ul');
  [
    'Shorthand GitHub: user/repo (es. thedotmack/claude-mem)',
    'URL git: https://github.com/user/repo o https://github.com/user/repo.git',
    'Path locale: /path/assoluto/al/marketplace',
  ].forEach(t => {
    const li = el('li', null, t);
    ul.appendChild(li);
  });
  helper.appendChild(ul);
  formWrap.appendChild(helper);

  const errBox = el('div', 'add-mkt-error');
  errBox.style.display = 'none';
  formWrap.appendChild(errBox);

  content.appendChild(formWrap);

  // Actions
  const actions = el('div', 'add-mkt-actions');
  const cancelBtn = el('button', 'btn btn-sm btn-ghost', 'Annulla');
  cancelBtn.addEventListener('click', () => close());
  const submitBtn = el('button', 'btn btn-sm btn-primary', 'Aggiungi marketplace');

  function showError(msg) {
    errBox.textContent = '⚠ ' + msg;
    errBox.style.display = 'block';
  }
  function clearError() { errBox.style.display = 'none'; errBox.textContent = ''; }

  // Validazione client-side: il main.js esegue la propria validazione regex
  // più strict prima di runClaudeArgs (validMarketplaceName). Qui filtriamo
  // solo input vuoti o palesemente malformati per evitare round-trip inutili.
  function validateSource(s) {
    if (!s) return 'Inserisci un source';
    if (s.length > 500) return 'Source troppo lungo (max 500 caratteri)';
    // Caratteri shell pericolosi vietati anche se il main usa execFile
    if (/[;|&`$<>(){}[\]"'\\]/.test(s)) return 'Caratteri non ammessi nel source';
    return null;
  }

  async function submit() {
    clearError();
    const src = input.value.trim();
    const validationErr = validateSource(src);
    if (validationErr) { showError(validationErr); return; }
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    submitBtn.textContent = 'Aggiungo…';
    const r = await window.claudeAPI.marketplaceAction('add', '', src);
    if (r.success) {
      toast('Marketplace aggiunto', 'success');
      close();
      await loadData();
    } else {
      showError(r.error || 'Errore sconosciuto');
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      submitBtn.textContent = 'Aggiungi marketplace';
    }
  }
  submitBtn.addEventListener('click', submit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  input.addEventListener('input', clearError);

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  content.appendChild(actions);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus automatico sull'input
  setTimeout(() => input.focus(), 50);
}

// Modal "Plugin del marketplace": lista TUTTI i plugin presenti nel
// marketplace.json (anche non installati), con bottone "Installa" sui
// non-installati. m.plugins nello state contiene solo gli installati.
async function showMarketplaceContentModal(m) {
  if (document.querySelector('.md-overlay')) return;
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', 'marketplace'));
  title.appendChild(document.createTextNode(' ' + m.id));
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = el('div', 'md-content');

  // Header info marketplace
  const info = el('div', 'plugin-content-info');
  if (m.repo) {
    const repoLink = el('a', 'plugin-content-mkt', 'github.com/' + m.repo);
    repoLink.setAttribute('href', '#');
    repoLink.addEventListener('click', e => {
      e.preventDefault();
      window.claudeAPI.openExternal('https://github.com/' + m.repo);
    });
    info.appendChild(repoLink);
  }
  const metaDesc = el('div', 'plugin-content-desc');
  metaDesc.textContent = (m.autoUpdate ? 'aggiornamento automatico' : 'aggiornamento manuale')
    + (m.lastUpdated ? ' · ultimo aggiornamento ' + new Date(m.lastUpdated).toLocaleDateString('it-IT') : '');
  info.appendChild(metaDesc);
  content.appendChild(info);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Mostra placeholder mentre carichiamo i metadata
  const listWrap = el('div');
  content.appendChild(el('h3', 'plugin-content-section-title', 'Plugin nel marketplace'));
  listWrap.appendChild(el('div', 'plugin-content-note', 'Caricamento lista plugin…'));
  content.appendChild(listWrap);

  const detail = await window.claudeAPI.getMarketplaceDetail(m.id);
  listWrap.textContent = '';

  if (!detail.ok || !detail.plugins.length) {
    // Fallback: mostro solo gli installati (m.plugins)
    listWrap.appendChild(el('div', 'plugin-content-note',
      detail.error || 'marketplace.json non leggibile — mostro solo i plugin installati.'));
    renderInstalledOnly(listWrap, m);
    return;
  }

  // Mappa per lookup veloce dei plugin installati di questo marketplace
  const installed = new Map(m.plugins.map(p => [p.id, p]));
  // Aggiorno la meta con i conteggi reali
  metaDesc.textContent = installed.size + '/' + detail.plugins.length + ' installati · '
    + metaDesc.textContent;

  detail.plugins.forEach(remote => {
    const local = installed.get(remote.name);
    const row = el('div', 'mkt-modal-plugin-row');

    const left = el('div', 'mkt-modal-plugin-info');
    const nameLine = el('div', 'plugin-content-item-name', remote.name);
    if (local) {
      const inst = el('span', 'badge b-installed', '✓ installato');
      nameLine.appendChild(document.createTextNode(' '));
      nameLine.appendChild(inst);
    }
    left.appendChild(nameLine);
    if (remote.description) {
      left.appendChild(el('div', 'plugin-content-item-desc', remote.description));
    }
    if (remote.category) {
      const cat = el('div', 'mkt-modal-plugin-cat', remote.category);
      left.appendChild(cat);
    }
    row.appendChild(left);

    const right = el('div', 'mkt-modal-plugin-actions');
    if (local) {
      // Già installato: bottone "Dettagli" che apre il modal plugin
      const detailsBtn = el('button', 'btn btn-sm btn-ghost', 'Dettagli');
      detailsBtn.addEventListener('click', () => { close(); showPluginContentModal(local); });
      right.appendChild(detailsBtn);
    } else {
      const installBtn = el('button', 'btn btn-sm btn-primary', 'Installa');
      installBtn.dataset.tt = 'claude plugins install ' + remote.name + '@' + m.id;
      installBtn.addEventListener('click', async () => {
        const ok = await window.claudeAPI.confirmDialog({
          title:   'Installa plugin',
          message: 'Installare ' + remote.name + '?',
          detail:  'Da: ' + m.id + '\n\n' +
                   'CLACOROO eseguirà:\n' +
                   '  claude plugins install ' + remote.name + '@' + m.id + '\n\n' +
                   (remote.description ? 'Descrizione: ' + remote.description : ''),
          buttons: ['Annulla', 'Installa'],
        });
        if (ok !== 1) return;
        installBtn.disabled = true;
        installBtn.textContent = '…installazione…';
        const r = await window.claudeAPI.pluginAction('install', remote.name + '@' + m.id);
        if (r.success) {
          toast('Installato: ' + remote.name, 'success');
          window.claudeAPI.showNotification('Plugin installato', remote.name + '@' + m.id);
          await loadData();
          close();  // chiudo il modal, lista refreshata
        } else {
          installBtn.disabled = false;
          installBtn.textContent = 'Installa';
          toast('Errore installazione: ' + r.error, 'error');
        }
      });
      right.appendChild(installBtn);
    }
    row.appendChild(right);

    listWrap.appendChild(row);
  });
}

function renderInstalledOnly(container, m) {
  m.plugins.forEach(p => {
    const row = el('div', 'mkt-modal-plugin-row');
    const left = el('div', 'mkt-modal-plugin-info');
    left.appendChild(el('div', 'plugin-content-item-name', p.id));
    if (p.description) left.appendChild(el('div', 'plugin-content-item-desc', p.description));
    row.appendChild(left);
    const right = el('div', 'mkt-modal-plugin-actions');
    const detailsBtn = el('button', 'btn btn-sm btn-ghost', 'Dettagli');
    detailsBtn.addEventListener('click', () => {
      document.querySelector('.md-overlay')?.remove();
      showPluginContentModal(p);
    });
    right.appendChild(detailsBtn);
    row.appendChild(right);
    container.appendChild(row);
  });
}

function renderMarketplaces() {
  const wrap = el('div');

  const hdr = el('div', 'section-header');
  hdr.appendChild(el('span', 'section-count', state.mktList.length + ' marketplace configurati'));

  // v1.0.55 — Selector di ordinamento
  const sortWrap = el('div', 'mkt-sort-wrap');
  sortWrap.appendChild(el('span', 'mkt-sort-label', 'Ordina:'));
  const sortSel = el('select', 'mkt-sort-select');
  [
    { v: 'default',      l: 'Predefinito (per N plugin)' },
    { v: 'added-desc',   l: 'Aggiunti di recente' },
    { v: 'added-asc',    l: 'Aggiunti meno di recente' },
    { v: 'updated-desc', l: 'Aggiornati di recente' },
    { v: 'updated-asc',  l: 'Aggiornati meno di recente' },
  ].forEach(o => {
    const opt = el('option', null, o.l);
    opt.value = o.v;
    sortSel.appendChild(opt);
  });
  sortSel.value = state.mktSort;
  sortSel.addEventListener('change', async () => {
    state.mktSort = sortSel.value;
    applyMktSort();
    renderMarketplaces();
    await window.claudeAPI.setState({ mktSort: state.mktSort });
  });
  sortWrap.appendChild(sortSel);
  hdr.appendChild(sortWrap);

  wrap.appendChild(hdr);

  const grid = el('div', 'mkt-cards-grid');

  state.mktList.forEach(m => {
    const col  = mktColor(m.id);
    // 'inactive' (grigio) solo se il marketplace.json non dichiara plugin:
    // marketplace vuoto/non valido. Se ha plugin disponibili ma non installati,
    // la card resta attiva (l'utente può installare via modal).
    const totalAvailable = m.available || m.plugins.length;
    const card = el('div', 'mkt-card' + (totalAvailable === 0 ? ' inactive' : ''));
    card.style.setProperty('--mkt-color', col);

    const body = el('div', 'mkt-card-body');
    body.appendChild(el('div', 'mkt-card-name', m.id));

    const repoEl = el('div', 'mkt-card-repo');
    if (m.repo) {
      const repoLink = el('a', null, 'github.com/' + m.repo);
      repoLink.style.cssText = 'color:inherit;text-decoration:none;';
      repoLink.setAttribute('href', '#');
      repoLink.addEventListener('click', e => {
        e.preventDefault();
        window.claudeAPI.openExternal('https://github.com/' + m.repo);
      });
      repoEl.appendChild(repoLink);
    }
    body.appendChild(repoEl);

    const meta = el('div', 'mkt-card-meta');
    // Mostra "N installati / M disponibili" se ce ne sono entrambi.
    // Solo "N plugin" se nessuno installato ma alcuni disponibili.
    // 0 se vuoto.
    const countBtn = el('button', 'mkt-card-count-btn');
    const cnt = el('span', 'mkt-card-count');
    // Logica display:
    //   0 disponibili        → "0"           (marketplace vuoto)
    //   tutti installati     → "21"          (numero intero)
    //   altrimenti (0 o parziale installato) → "X/Y"  (es. 0/1, 10/202)
    if (totalAvailable === 0) {
      cnt.textContent = '0';
    } else if (m.installed === totalAvailable) {
      cnt.textContent = String(totalAvailable);
    } else {
      cnt.textContent = m.installed + '/' + totalAvailable;
    }
    cnt.style.color = col;
    const cntL = el('span', 'mkt-card-count-label', totalAvailable === 1 ? 'plugin' : 'plugin');
    countBtn.appendChild(cnt);
    countBtn.appendChild(cntL);
    if (totalAvailable > 0) {
      countBtn.dataset.tt = m.installed === totalAvailable
        ? 'Vedi plugin installati'
        : 'Vedi e installa plugin';
      countBtn.addEventListener('click', () => showMarketplaceContentModal(m));
    } else {
      countBtn.disabled = true;
    }
    const autoBadge = el('span', 'badge ' + (m.autoUpdate ? 'b-auto' : 'b-manual'),
      m.autoUpdate ? 'auto-update' : 'manuale');
    meta.appendChild(countBtn);
    meta.appendChild(autoBadge);
    body.appendChild(meta);

    if (m.lastUpdated) {
      const d = new Date(m.lastUpdated);
      const note = el('div', 'mkt-card-note', 'Ultimo aggiornamento: ' + d.toLocaleDateString('it-IT'));
      body.appendChild(note);
    }

    card.appendChild(body);


    // Remove button
    const cardFooter = el('div');
    cardFooter.style.cssText = 'padding:10px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;';

    const updateMktBtn = el('button', 'btn btn-sm btn-ghost', '↻ Aggiorna');
    updateMktBtn.addEventListener('click', async () => {
      updateMktBtn.disabled = true; updateMktBtn.textContent = '…';
      const r = await window.claudeAPI.marketplaceAction('update', m.id);
      if (r.success) toast('Marketplace aggiornato: ' + m.id, 'success');
      else toast('Errore: ' + r.error, 'error');
      updateMktBtn.disabled = false; updateMktBtn.textContent = '↻ Aggiorna';
    });

    const removeMktBtn = el('button', 'btn btn-sm btn-danger', 'Rimuovi');
    removeMktBtn.addEventListener('click', async () => {
      const choice = await window.claudeAPI.confirmDialog({
        title:   'Rimuovi marketplace',
        message: 'Rimuovere ' + m.id + '?',
        detail:  'Tutti i plugin installati da questo marketplace rimarranno installati.',
        buttons: ['Annulla', 'Rimuovi'],
      });
      if (choice !== 1) return;
      const r = await window.claudeAPI.marketplaceAction('remove', m.id);
      if (r.success) { toast('Marketplace rimosso: ' + m.id, 'success'); await loadData(); }
      else toast('Errore: ' + r.error, 'error');
    });

    cardFooter.appendChild(updateMktBtn);
    cardFooter.appendChild(removeMktBtn);
    card.appendChild(cardFooter);

    grid.appendChild(card);
  });

  wrap.appendChild(grid);
  setContent(wrap);
}

/* ── SKILLS ───────────────────────────────────────────────────────────── */
function renderSkills() {
  const globals = state.plugins.flatMap(p =>
    p.skills.map(s => ({ name: s, plugin: p.id, mkt: p.mkt, blocked: p.blocked, health: p.skillHealth[s], fullId: p.fullId, scope: 'global' }))
  );
  const locals = (state.localSkills || []).map(s => {
    const at = s.plugin.lastIndexOf('@');
    return { name: s.name, plugin: s.plugin.slice(0, at), mkt: s.plugin.slice(at + 1), blocked: false, fullId: s.plugin, scope: 'local', projectName: s.projectName, projectPath: s.projectPath };
  });
  const all = [...globals, ...locals].sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'skills', item => {
    const chip = el('div', 'skill-chip' + (item.scope === 'local' ? ' local-scope' : ' clickable') + (item.blocked ? ' blocked' : ''));
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:' + mktColor(item.mkt);
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    appendHealthBadge(chip, item.health);
    appendScopeBadge(chip, item);
    if (item.scope === 'global') {
      chip.addEventListener('click', () => openMarkdownPreview(item.fullId, 'skill', item.name));
    }
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt + (item.projectName || ''), 'Cerca skill…', 'skill-grid');
}

/* ── AGENTS ───────────────────────────────────────────────────────────── */
function renderAgents() {
  const globals = state.plugins.flatMap(p =>
    p.agents.map(a => ({ name: a, plugin: p.id, mkt: p.mkt, health: p.agentHealth[a], fullId: p.fullId, scope: 'global' }))
  );
  const locals = (state.localAgents || []).map(a => {
    const at = a.plugin.lastIndexOf('@');
    return { name: a.name, plugin: a.plugin.slice(0, at), mkt: a.plugin.slice(at + 1), fullId: a.plugin, scope: 'local', projectName: a.projectName, projectPath: a.projectPath };
  });
  const all = [...globals, ...locals].sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'agents', item => {
    const chip = el('div', 'skill-chip' + (item.scope === 'local' ? ' local-scope' : ' clickable'));
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:#f97316';
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    appendHealthBadge(chip, item.health);
    appendScopeBadge(chip, item);
    if (item.scope === 'global') {
      chip.addEventListener('click', () => openMarkdownPreview(item.fullId, 'agent', item.name));
    }
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt + (item.projectName || ''), 'Cerca agent…', 'skill-grid');
}

function appendScopeBadge(chip, item) {
  const badge = el('span', 'scope-badge scope-' + item.scope,
    item.scope === 'local' ? (item.projectName || 'locale') : 'globale');
  if (item.projectPath) badge.title = item.projectPath;
  chip.appendChild(badge);
}

/* ── HEALTH BADGE (idea #3) ───────────────────────────────────────────── */
function appendHealthBadge(chip, health) {
  if (!health || health.status === 'ok') return;
  const badge = el('span', 'health-badge h-' + health.status, health.status === 'err' ? '⚠' : '!');
  badge.title = (health.issues || []).join(' · ');
  chip.appendChild(badge);
}

/* ── MARKDOWN PREVIEW (idea #1) ───────────────────────────────────────── */
async function openMarkdownPreview(fullId, kind, name) {
  const r = await window.claudeAPI.readMarkdownFile(fullId, kind, name);
  if (!r.success) { toast('Errore lettura ' + kind + ': ' + r.error, 'error'); return; }
  showMarkdownModal(name, kind, r.content);
}

function inlineNodes(text) {
  const nodes = [];
  let i = 0;
  let buf = '';
  function flush() { if (buf) { nodes.push(document.createTextNode(buf)); buf = ''; } }
  while (i < text.length) {
    const rest = text.slice(i);
    let m = rest.match(/^`([^`]+)`/);
    if (m) { flush(); const c = document.createElement('code'); c.textContent = m[1]; nodes.push(c); i += m[0].length; continue; }
    m = rest.match(/^\*\*([^*]+)\*\*/);
    if (m) { flush(); const s = document.createElement('strong'); s.textContent = m[1]; nodes.push(s); i += m[0].length; continue; }
    m = rest.match(/^\*([^*\s][^*]*?)\*/);
    if (m) { flush(); const e = document.createElement('em'); e.textContent = m[1]; nodes.push(e); i += m[0].length; continue; }
    m = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (m) {
      flush();
      const a = document.createElement('a');
      const url = m[2];
      a.textContent = m[1];
      if (/^(https?:|mailto:)/.test(url)) {
        a.href = url;
        a.addEventListener('click', e => { e.preventDefault(); window.claudeAPI.openExternal(url); });
      }
      nodes.push(a); i += m[0].length; continue;
    }
    buf += text[i];
    i++;
  }
  flush();
  return nodes;
}

function renderMarkdownToContainer(container, content) {
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const lines = body.split(/\r?\n/);
  let inCode = false, codeBuf = [];
  let listEl = null;
  let paraBuf = [];

  function flushPara() {
    if (paraBuf.length) {
      const p = el('p');
      inlineNodes(paraBuf.join(' ')).forEach(n => p.appendChild(n));
      container.appendChild(p);
      paraBuf = [];
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      flushPara(); listEl = null;
      if (inCode) {
        const pre = el('pre'); const code = el('code', null, codeBuf.join('\n'));
        pre.appendChild(code); container.appendChild(pre);
        codeBuf = []; inCode = false;
      } else inCode = true;
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (/^\s*$/.test(line)) { flushPara(); listEl = null; continue; }
    if (/^---+\s*$/.test(line)) { flushPara(); listEl = null; container.appendChild(el('hr')); continue; }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.+)$/))) {
      flushPara(); listEl = null;
      const h = el('h' + m[1].length);
      inlineNodes(m[2]).forEach(n => h.appendChild(n));
      container.appendChild(h);
      continue;
    }
    if ((m = line.match(/^\s*[-*]\s+(.+)$/))) {
      flushPara();
      if (!listEl) { listEl = el('ul'); container.appendChild(listEl); }
      const li = el('li');
      inlineNodes(m[1]).forEach(n => li.appendChild(n));
      listEl.appendChild(li);
      continue;
    }
    listEl = null;
    paraBuf.push(line);
  }
  flushPara();
  if (inCode) { const pre = el('pre'); pre.appendChild(el('code', null, codeBuf.join('\n'))); container.appendChild(pre); }
}

function showMarkdownModal(name, kind, content) {
  if (document.querySelector('.md-overlay')) return;
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title  = el('div', 'md-title');
  const kindBadge = el('span', 'md-kind-badge md-kind-' + kind, kind);
  title.appendChild(kindBadge);
  title.appendChild(document.createTextNode(' ' + name));
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title);
  header.appendChild(closeBtn);

  const contentEl = el('div', 'md-content');
  renderMarkdownToContainer(contentEl, content);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(contentEl);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  closeBtn.focus();
}

function renderListSection(items, key, buildChip, searchFn, gridCls) {
  const f = state.filters[key] || { search: '' };
  const wrap = el('div');

  // search
  const bar = el('div', 'filter-bar');
  const sw  = el('div', 'search-wrap');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 20 20'); icon.setAttribute('fill', 'currentColor');
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', 'M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z');
  icon.appendChild(iconPath);
  sw.appendChild(icon);
  const inp = el('input', 'search-input');
  inp.setAttribute('placeholder', 'Cerca…');
  inp.setAttribute('type', 'text');
  inp.value = f.search;
  sw.appendChild(inp);
  bar.appendChild(sw);
  wrap.appendChild(bar);

  const hdr = el('div', 'section-header');
  const countEl = el('span', 'section-count', '');
  hdr.appendChild(countEl);
  wrap.appendChild(hdr);

  const grid = el('div', gridCls || 'skill-grid');
  let chips = [];

  function filter() {
    const q = inp.value.toLowerCase();
    state.filters[key] = { search: q };
    let visible = 0;
    chips.forEach((chip, i) => {
      const show = !q || searchFn(items[i]).toLowerCase().includes(q);
      chip.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    countEl.textContent = visible + ' di ' + items.length;
  }

  items.forEach(item => {
    const chip = buildChip(item);
    grid.appendChild(chip);
    chips.push(chip);
  });

  inp.addEventListener('input', filter);
  filter();

  wrap.appendChild(grid);
  setContent(wrap);
  inp.focus();
}

/* ── STATS (v1.0.12) ──────────────────────────────────────────────────── */
let statsCache = null;
let statsActiveTab = 'overview';
let statsRenderToken = 0;

async function renderStats() {
  const myToken = ++statsRenderToken;
  const wrap = el('div', 'stats-wrap');
  // Tab strip
  // v1.0.38 — 'config' è ora una sezione sidebar autonoma, rimosso da qui
  const tabs = ['overview', 'modelli', 'progetti'];
  const tabLabels = { overview: 'Overview', modelli: 'Modelli', progetti: 'Per-progetto' };
  const tabBar = el('div', 'stats-tabs');
  tabs.forEach(t => {
    const btn = el('button', 'stats-tab' + (t === statsActiveTab ? ' active' : ''), tabLabels[t]);
    btn.addEventListener('click', () => { statsActiveTab = t; renderStats(); });
    tabBar.appendChild(btn);
  });
  wrap.appendChild(tabBar);

  const content = el('div', 'stats-content');
  wrap.appendChild(content);
  setContent(wrap);

  // Riusa cache se disponibile (evita IO ripetuto su cambio tab)
  if (statsCache) {
    paintStatsTab(content, statsCache);
    return;
  }

  content.appendChild(el('div', 'stats-loading', 'Caricamento statistiche…'));
  const data = await window.claudeAPI.getStats();
  if (myToken !== statsRenderToken) return;  // race guard: tab cambiata
  statsCache = data;
  content.textContent = '';
  paintStatsTab(content, data);
}

function paintStatsTab(content, data) {
  if (!data.cache) {
    content.appendChild(el('div', 'stats-empty',
      'stats-cache.json non disponibile. Claude Code lo crea quando inizi a usarlo: usa la CLI o IDE per qualche sessione e tornerai a vedere statistiche qui.'));
    return;
  }
  if (statsActiveTab === 'overview') renderStatsOverview(content, data);
  else if (statsActiveTab === 'modelli')  renderStatsModels(content, data);
  else if (statsActiveTab === 'progetti') renderStatsProjects(content, data);
}

function formatUsd(amount) {
  if (amount == null || isNaN(amount)) return '—';
  if (amount < 10)    return '$' + amount.toFixed(2);
  if (amount < 1000)  return '$' + amount.toFixed(0);
  if (amount < 10000) return '$' + (amount / 1000).toFixed(1) + 'K';
  return '$' + Math.round(amount / 1000) + 'K';
}

function fmtNum(n) {
  if (!n) return '0';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

let statsRange = 'all';  // all | 30 | 7

function aggregateRangeClient(data, range) {
  // Mirror della logica server-side: ricalcola KPI in base al range scelto
  const cache            = data?.cache;
  const dailyActivity    = cache?.dailyActivity || [];
  const dailyModelTokens = cache?.dailyModelTokens || [];
  const modelUsage       = cache?.modelUsage || {};
  const hourCounts       = cache?.hourCounts || {};
  // Sessioni reali contate dai file .jsonl (più accurato di cache.totalSessions)
  const sessionsReal     = data?.sessionsReal || {};

  // Total input+output (escluso cache_read/creation che gonfiavano 400×)
  function tokensOf(mu) {
    return Object.values(mu).reduce((s, m) => s + (m.inputTokens || 0) + (m.outputTokens || 0), 0);
  }
  function findMostActive(arr) {
    return arr.reduce((best, e) => (e.messageCount || 0) > (best?.messageCount || 0) ? e : best, null);
  }
  function findPeakHour(hc) {
    let best = null, max = -1;
    for (const [h, c] of Object.entries(hc || {})) if (c > max) { max = c; best = Number(h); }
    return best;
  }

  if (range === 'all') {
    let favModel = null, favTot = -1;
    for (const [m, u] of Object.entries(modelUsage)) {
      const t = (u.inputTokens || 0) + (u.outputTokens || 0);
      if (t > favTot) { favTot = t; favModel = m; }
    }
    return {
      sessions:    sessionsReal.all || cache?.totalSessions || dailyActivity.reduce((s, e) => s + (e.sessionCount || 0), 0),
      messages:    cache?.totalMessages || dailyActivity.reduce((s, e) => s + (e.messageCount || 0), 0),
      tokens:      tokensOf(modelUsage),
      activeDays:  dailyActivity.length,
      totalDays:   null,
      peakHour:    findPeakHour(hourCounts),
      favoriteModel: favModel,
      mostActiveDay: findMostActive(dailyActivity),
    };
  }

  const days = parseInt(range, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - days + 1);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const filteredActivity = dailyActivity.filter(e => e.date >= cutoffKey);
  const filteredTokens   = dailyModelTokens.filter(e => e.date >= cutoffKey);

  const tokensByModel = {};
  let totalTok = 0;
  for (const entry of filteredTokens) {
    for (const [m, v] of Object.entries(entry.tokensByModel || {})) {
      tokensByModel[m] = (tokensByModel[m] || 0) + v;
      totalTok += v;
    }
  }
  const favModel = Object.entries(tokensByModel).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Sessions from real .jsonl mtime filtered count (more accurate than dailyActivity rollup)
  const realByRange = days === 30 ? sessionsReal.d30 : days === 7 ? sessionsReal.d7 : null;
  const sessions = (realByRange != null)
    ? realByRange
    : filteredActivity.reduce((s, e) => s + (e.sessionCount || 0), 0);

  return {
    sessions,
    messages:    filteredActivity.reduce((s, e) => s + (e.messageCount || 0), 0),
    tokens:      totalTok,
    activeDays:  filteredActivity.length,
    totalDays:   days,
    peakHour:    findPeakHour(hourCounts),
    favoriteModel: favModel,
    mostActiveDay: findMostActive(filteredActivity),
  };
}

// Estrae "Opus 4.7" / "Sonnet 4.6" da id tipo "claude-opus-4-7" o "claude-sonnet-4-6-20251022"
function formatModelName(id) {
  if (!id) return '—';
  const stripped = id.replace(/^claude-/, '');
  const m = stripped.match(/^([a-zA-Z]+)-(\d+)-(\d+)/);
  if (m) {
    const family = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    return family + ' ' + m[2] + '.' + m[3];
  }
  const first = stripped.split('-')[0] || '—';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function buildStatsKpiGrid(data, range) {
  const kpi = aggregateRangeClient(data, range);
  const favShort = formatModelName(kpi.favoriteModel);
  const peakH = kpi.peakHour;
  const activeLabel = kpi.totalDays
    ? kpi.activeDays + '/' + kpi.totalDays
    : String(kpi.activeDays);
  const mad = kpi.mostActiveDay;
  const madLabel = mad ? new Date(mad.date + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : '—';

  // Costo stimato per range (Pack A v1.0.28)
  const cost = data.cost || {};
  const rangeCost = range === '7' ? cost.d7 : range === '30' ? cost.d30 : cost.total;
  const costLabel = formatUsd(rangeCost);

  const grid = el('div', 'kpi-grid stats-kpi-grid');
  [
    { num: fmtNum(kpi.sessions),  label: 'Sessioni',        color: '#d97757' },
    { num: fmtNum(kpi.messages),  label: 'Messaggi',        color: '#e89478' },
    { num: fmtNum(kpi.tokens),    label: 'Token totali',    color: '#6a9bcc' },
    { num: costLabel,             label: 'Valore\nAPI stimato', color: '#22c55e' },
    { num: activeLabel,           label: 'Giorni attivi',   color: '#788c5d' },
    { num: madLabel,              label: 'Giorno più attivo', color: '#b8c79a' },
    { num: (data.streak || 0) + 'g',     label: 'Serie attuale',   color: '#b8c79a' },
    { num: (data.longestStreak || 0) + 'g', label: 'Serie più lunga', color: '#9cc1ea' },
    { num: peakH != null ? peakH + ':00' : '—', label: 'Ora di punta', color: '#f97316' },
    { num: favShort,              label: 'Modello\nPreferito', color: '#d97757' },
  ].forEach(k => {
    const card = el('div', 'kpi-card');
    card.style.setProperty('--kpi-color', k.color);
    card.appendChild(el('div', 'kpi-num', String(k.num)));
    card.appendChild(el('div', 'kpi-label', k.label));
    grid.appendChild(card);
  });
  return grid;
}

function renderStatsOverview(container, data) {
  const c = data.cache;

  // Filtri range
  const rangeBar = el('div', 'stats-range');
  [['all', 'Tutto'], ['30', '30g'], ['7', '7g']].forEach(([k, l]) => {
    const btn = el('button', 'stats-range-btn' + (statsRange === k ? ' active' : ''), l);
    btn.addEventListener('click', () => { statsRange = k; renderStats(); });
    rangeBar.appendChild(btn);
  });
  container.appendChild(rangeBar);

  container.appendChild(buildStatsKpiGrid(data, statsRange));

  // Heatmap (range dinamico)
  const title = statsRange === '7'  ? 'Attività · ultimi 7 giorni'
              : statsRange === '30' ? 'Attività · ultimi 30 giorni'
              : 'Attività · ultime 52 settimane';
  container.appendChild(el('div', 'list-section-title', title));
  container.appendChild(buildHeatmap(c.dailyActivity || [], statsRange));

  // Context breakdown realistico
  const cb = data.contextBreakdown;
  if (cb) {
    container.appendChild(el('div', 'list-section-title', 'Stima contesto · stile claude /context'));
    container.appendChild(buildContextBreakdown(cb));
  }
}

function contextCats(cb) {
  const mcp = cb.mcpServers || { tokens: 0, count: 0, total: 0 };
  // Label MCP: "MCP servers · X connessi / Y totali" se ci sono server,
  // altrimenti "MCP servers" semplice (caso pre-1.0.23 o nessun server)
  const mcpLabel = mcp.total
    ? 'MCP servers · ' + mcp.count + ' connessi'
    : 'MCP servers';
  return [
    { kind: 'skills',       tokens: cb.skills.tokens,       label: 'Skills (index) · ' + cb.skills.count,    color: '#d97757' },
    { kind: 'systemPrompt', tokens: cb.systemPrompt.tokens, label: 'System prompt',                            color: '#6a9bcc' },
    { kind: 'agents',       tokens: cb.agents.tokens,       label: 'Agents (index) · ' + cb.agents.count,    color: '#f97316' },
    { kind: 'memoryFiles',  tokens: cb.memoryFiles.tokens,  label: 'Memory files · ' + cb.memoryFiles.count, color: '#788c5d' },
    { kind: 'mcpServers',   tokens: mcp.tokens,             label: mcpLabel,                                    color: '#14b8a6' },
    { kind: 'freeSpace',    tokens: cb.freeSpace.tokens,    label: 'Free space',                               color: '#3a3530' },
  ];
}

function buildContextBreakdown(cb, opts = {}) {
  const { horizontalLegend = false, hideNote = false } = opts;
  const wrap = el('div', 'context-breakdown' + (horizontalLegend ? ' context-compact' : ''));
  wrap.dataset.horizontalLegend = horizontalLegend ? '1' : '0';
  const max = cb.contextWindow;

  const summary = el('div', 'context-summary');
  summary.appendChild(el('span', 'context-summary-tokens', fmtNum(cb.totalEstimate) + ' / ' + fmtNum(max) + ' tokens'));
  summary.appendChild(el('span', 'context-summary-pct', cb.fillPercent + '%'));
  wrap.appendChild(summary);

  const cats = contextCats(cb);
  const bar = el('div', 'context-bar');
  cats.forEach(c => {
    const seg = el('div', 'context-bar-seg');
    seg.dataset.kind = c.kind;
    seg.style.width = c.tokens ? ((c.tokens / max) * 100) + '%' : '0%';
    seg.style.background = c.color;
    seg.title = c.label + ': ' + fmtNum(c.tokens);
    bar.appendChild(seg);
  });
  wrap.appendChild(bar);

  const legend = el('div', 'context-legend' + (horizontalLegend ? ' context-legend-horizontal' : ''));
  cats.forEach(c => {
    const row = el('div', 'context-legend-row');
    row.dataset.kind = c.kind;
    const dot = el('span', 'context-legend-dot');
    dot.style.background = c.color;
    row.appendChild(dot);
    row.appendChild(el('span', 'context-legend-lbl', c.label));
    if (!horizontalLegend) {
      const pct = ((c.tokens / max) * 100).toFixed(1);
      row.appendChild(el('span', 'context-legend-val', fmtNum(c.tokens) + ' · ' + pct + '%'));
    }
    legend.appendChild(row);
  });
  wrap.appendChild(legend);

  if (!hideNote) {
    const note = el('div', 'context-note',
      'Per skill e agent conta SOLO il frontmatter YAML (indice di discovery), non il body completo — ' +
      'che viene caricato solo quando la skill è effettivamente invocata. ' +
      'MCP servers: stima ~400 token per server connesso (il valore reale dipende dal numero di tool esposti). ' +
      'Non include: messaggi sessione, autocompact buffer, custom agents (richiede sessione live).');
    wrap.appendChild(note);
  }

  return wrap;
}

// Aggiorna in-place i valori di una .context-breakdown esistente, senza
// distruggere/ricreare il DOM. Permette CSS transition smooth sulla width
// dei segmenti quando l'utente toggla un plugin.
function updateCtxBarInPlace(barNode, cb) {
  const max = cb.contextWindow;
  const horizontalLegend = barNode.dataset.horizontalLegend === '1';

  const tokensEl = barNode.querySelector('.context-summary-tokens');
  if (tokensEl) tokensEl.textContent = fmtNum(cb.totalEstimate) + ' / ' + fmtNum(max) + ' tokens';
  const pctEl = barNode.querySelector('.context-summary-pct');
  if (pctEl) pctEl.textContent = cb.fillPercent + '%';

  contextCats(cb).forEach(c => {
    const seg = barNode.querySelector('.context-bar-seg[data-kind="' + c.kind + '"]');
    if (seg) {
      seg.style.width = c.tokens ? ((c.tokens / max) * 100) + '%' : '0%';
      seg.title = c.label + ': ' + fmtNum(c.tokens);
    }
    const row = barNode.querySelector('.context-legend-row[data-kind="' + c.kind + '"]');
    if (row) {
      const lbl = row.querySelector('.context-legend-lbl');
      if (lbl) lbl.textContent = c.label;
      if (!horizontalLegend) {
        const val = row.querySelector('.context-legend-val');
        if (val) {
          const pct = ((c.tokens / max) * 100).toFixed(1);
          val.textContent = fmtNum(c.tokens) + ' · ' + pct + '%';
        }
      }
    }
  });
}

function buildHeatmap(dailyActivity, range) {
  const byDate = {};
  let maxCount = 0;
  for (const e of dailyActivity) {
    byDate[e.date] = e.messageCount || 0;
    if (e.messageCount > maxCount) maxCount = e.messageCount;
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Determina numero settimane in base al range
  const weeks = range === '7' ? 1 : range === '30' ? 5 : 52;

  // Trova il sabato della settimana corrente (fine settimana per allineamento)
  const dayOfWeek = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeek));
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - weeks * 7 + 1);

  const wrap = el('div', 'heatmap-wrap');

  // Tooltip flottante (sostituisce title attribute)
  const tip = el('div', 'heatmap-tip');
  tip.style.display = 'none';
  wrap.appendChild(tip);

  // Griglia: una colonna per settimana, 7 righe per giorno (dom-sab)
  const grid = el('div', 'heatmap-grid');
  for (let w = 0; w < weeks; w++) {
    const col = el('div', 'heatmap-col');
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const key = date.toISOString().slice(0, 10);
      const isFuture = date > today;
      const count = byDate[key] || 0;
      const intensity = isFuture ? -1 : (count === 0 ? 0 : Math.min(4, Math.ceil((count / Math.max(maxCount, 1)) * 4)));
      const cell = el('div', 'heatmap-cell' + (isFuture ? ' future' : ' i-' + intensity));
      cell.dataset.date = key;
      cell.dataset.count = String(count);
      cell.addEventListener('mouseenter', e => {
        const dateLabel = new Date(key + 'T00:00:00').toLocaleDateString('it-IT', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
        tip.textContent = dateLabel + '\n' + count + (count === 1 ? ' messaggio' : ' messaggi');
        tip.style.display = 'block';
      });
      cell.addEventListener('mousemove', e => {
        const r = wrap.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left + 12) + 'px';
        tip.style.top = (e.clientY - r.top + 12) + 'px';
      });
      cell.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
      col.appendChild(cell);
    }
    grid.appendChild(col);
  }
  wrap.appendChild(grid);

  // Label mesi sotto (1 etichetta per mese, sopra la colonna che inizia quel mese)
  const monthLabels = el('div', 'heatmap-months');
  monthLabels.style.gridTemplateColumns = 'repeat(' + weeks + ', 1fr)';
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + w * 7);
    const m = d.getMonth();
    const txt = (m !== lastMonth) ? d.toLocaleDateString('it-IT', { month: 'short' }) : '';
    monthLabels.appendChild(el('span', 'heatmap-month-lbl', txt));
    if (m !== lastMonth) lastMonth = m;
  }
  wrap.appendChild(monthLabels);

  // Legenda intensità
  const legend = el('div', 'heatmap-legend');
  legend.appendChild(el('span', 'heatmap-legend-txt', 'meno'));
  for (let i = 0; i <= 4; i++) legend.appendChild(el('span', 'heatmap-cell i-' + i));
  legend.appendChild(el('span', 'heatmap-legend-txt', 'più'));
  wrap.appendChild(legend);

  return wrap;
}

function renderStatsModels(container, data) {
  const models = data.cache.modelUsage || {};

  // v1.0.42 — Bug fix: il denominatore deve essere coerente con il numeratore.
  // data.totalTokens dal v1.0.15 conta solo input+output (per allineamento
  // con `claude /stats`), mentre qui sommiamo TUTTI i tipi (input + output +
  // cache_read + cache_create). Calcoliamo localmente il totale completo.
  function sumAllTypes(u) {
    return (u.inputTokens||0) + (u.outputTokens||0)
         + (u.cacheReadInputTokens||0) + (u.cacheCreationInputTokens||0);
  }
  const total = Object.values(models).reduce((s, u) => s + sumAllTypes(u), 0) || 1;

  container.appendChild(el('div', 'list-section-title', 'Token per modello'));
  // v1.0.43 — Nota esplicativa per chiarire che le % rappresentano la
  // distribuzione del tuo uso fra modelli (somma = 100%), non una quota o
  // un limite. Le quote vere sono nelle barre Quote Claude della Dashboard.
  container.appendChild(el('div', 'models-section-note',
    'Distribuzione del tuo uso fra i modelli da quando hai iniziato (la somma di tutte le barre fa 100%). ' +
    'Non è una quota: per le quote sessione/settimana vedi "Quote Claude" in Dashboard o pannello Account.'));
  Object.entries(models)
    .sort((a, b) => sumAllTypes(b[1]) - sumAllTypes(a[1]))
    .forEach(([model, u]) => {
      const sum = sumAllTypes(u);
      const pct = ((sum / total) * 100).toFixed(1);
      const row = el('div', 'model-row');
      row.appendChild(el('div', 'model-name', model));
      const bar = el('div', 'model-bar');
      const fill = el('div', 'model-bar-fill');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el('div', 'model-val', fmtNum(sum) + ' (' + pct + '%)'));
      const detail = el('div', 'model-detail',
        'in ' + fmtNum(u.inputTokens||0) +
        ' · out ' + fmtNum(u.outputTokens||0) +
        ' · cache-read ' + fmtNum(u.cacheReadInputTokens||0) +
        ' · cache-create ' + fmtNum(u.cacheCreationInputTokens||0));
      container.appendChild(row);
      container.appendChild(detail);
    });

  // Daily histogram con tooltip flottante
  const dmt = data.cache.dailyModelTokens || [];
  if (dmt.length) {
    container.appendChild(el('div', 'list-section-title', 'Token giornalieri'));
    const last30 = dmt.slice(-30);
    const maxDay = Math.max(...last30.map(d => Object.values(d.tokensByModel || {}).reduce((s, v) => s + v, 0)));

    const chartWrap = el('div', 'daily-chart-wrap');
    const tip = el('div', 'daily-chart-tip');
    tip.style.display = 'none';
    const chart = el('div', 'daily-chart');

    last30.forEach(d => {
      const total = Object.values(d.tokensByModel || {}).reduce((s, v) => s + v, 0);
      const h = maxDay ? Math.max(2, Math.round((total / maxDay) * 100)) : 2;
      const bar = el('div', 'daily-bar');
      bar.style.height = h + '%';
      bar.addEventListener('mouseenter', e => {
        const byModel = d.tokensByModel || {};
        const lines = [d.date, fmtNum(total) + ' token totali'];
        Object.entries(byModel)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .forEach(([m, v]) => lines.push(m.replace(/^claude-/, '') + ': ' + fmtNum(v)));
        tip.textContent = lines.join('\n');
        tip.style.display = 'block';
      });
      bar.addEventListener('mousemove', e => {
        // v1.0.44 — fix: tooltip rimane sempre dentro chartWrap. Flippa a
        // sinistra del cursore se a destra non c'è spazio (era il caso
        // delle barre più recenti che uscivano dalla finestra).
        const r = chartWrap.getBoundingClientRect();
        const tw = tip.offsetWidth  || 180;
        const th = tip.offsetHeight || 60;
        const pad = 6;
        let x = e.clientX - r.left + 10;
        let y = e.clientY - r.top  - 10;
        if (x + tw + pad > r.width)  x = e.clientX - r.left - tw - 10;  // flip sinistra
        if (x < pad)                 x = pad;
        if (y < pad)                 y = pad;
        if (y + th + pad > r.height) y = r.height - th - pad;
        tip.style.left = x + 'px';
        tip.style.top  = y + 'px';
      });
      bar.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
      chart.appendChild(bar);
    });
    chartWrap.appendChild(chart);
    chartWrap.appendChild(tip);
    container.appendChild(chartWrap);
    container.appendChild(el('div', 'daily-chart-legend', 'Ultimi 30 giorni — hover per dettagli per modello'));
  }
}

function renderStatsProjects(container, data) {
  container.appendChild(el('div', 'list-section-title', 'Progetti Claude Code'));

  // v1.0.45 — Filtra i progetti "fantasma" (0 sessioni, 0 token): tipicamente
  // directory dove Claude Code è stato aperto una volta ma senza interazioni
  // significative (es. via cowork plugin o sessioni terminate prematuramente).
  const filtered = (data.projects || []).filter(p =>
    (p.sessions || 0) > 0 || (p.messages || 0) > 0 || (p.totalTokens || 0) > 0
  );

  if (!filtered.length) {
    container.appendChild(el('div', 'stats-empty', 'Nessun progetto con attività trovato in ~/.claude/projects/'));
    return;
  }

  const sorted = filtered.sort((a, b) => (b.totalTokens || 0) - (a.totalTokens || 0));
  sorted.forEach(p => {
    const row = el('div', 'project-row');

    const left = el('div', 'project-left');
    left.appendChild(el('div', 'project-name', p.path.split('/').pop() || p.key));
    left.appendChild(el('div', 'project-path', p.path));
    row.appendChild(left);

    const meta = el('div', 'project-stats');
    function statCell(value, label, tooltip) {
      const cell = el('div', 'project-stat');
      const v = el('div', 'project-stat-value', value);
      const l = el('div', 'project-stat-label', label);
      cell.appendChild(v);
      cell.appendChild(l);
      if (tooltip) cell.title = tooltip;
      return cell;
    }
    meta.appendChild(statCell(
      fmtNum(p.totalTokens || 0), 'token',
      'Token totali aggregati dai file JSONL di sessione'));
    meta.appendChild(statCell(
      fmtNum(p.messages || 0), 'messaggi',
      'Singole interazioni user/assistant nelle sessioni'));
    meta.appendChild(statCell(
      String(p.sessions || 0), p.sessions === 1 ? 'sessione' : 'sessioni',
      'Sessioni riprendibili (file .jsonl ancora presenti in ~/.claude/projects/)'));
    row.appendChild(meta);

    container.appendChild(row);
  });

  container.appendChild(el('div', 'daily-chart-legend',
    'Mostrati i primi ' + sorted.length + ' progetti — token aggregati dai file JSONL di sessione. ' +
    'Il count "sessioni" rappresenta i file di sessione ancora presenti e riprendibili (con `claude --continue`), ' +
    'non il numero totale di volte che hai aperto Claude Code nel progetto.'));
}

// v1.0.38 — Config promossa a sezione sidebar standalone.
// v1.0.41 — Render ottimistico se cache disponibile: niente spinner se
// abbiamo già i settings, swap silenzioso quando arriva il fetch fresh.
async function renderConfig() {
  const wrap = el('div');
  setContent(wrap);
  if (statsCache && statsCache.settings) {
    renderConfigContent(wrap, statsCache);
  } else {
    wrap.appendChild(el('div', 'stats-loading', 'Caricamento configurazione…'));
  }
  const data = await window.claudeAPI.getStats();
  if (state.section !== 'config') return;
  if (data === statsCache) return;  // identica, niente da fare
  statsCache = data;
  wrap.textContent = '';
  renderConfigContent(wrap, data);
}

function renderConfigContent(container, data) {
  container.appendChild(el('div', 'list-section-title', 'Configurazione Claude Code'));
  const warn = el('div', 'stats-warning',
    'Le modifiche qui sono immediate — equivalenti a `claude /config`. Modifica con cautela: '
    + 'la sintassi/valori errati possono rompere Claude Code.');
  container.appendChild(warn);

  const settings = data.settings || {};

  function configRow(key, label, type, opts, extraDesc) {
    const row = el('div', 'settings-row');
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', label));
    const descTxt = '~/.claude/settings.json → ' + key + (extraDesc ? ' · ' + extraDesc : '');
    left.appendChild(el('div', 'settings-row-desc', descTxt));
    row.appendChild(left);

    let input;
    if (type === 'select') {
      input = el('select', 'config-select');
      (opts || []).forEach(o => {
        const opt = el('option', null, o);
        opt.value = o;
        input.appendChild(opt);
      });
      input.value = settings[key] || (opts && opts[0]) || '';
    } else if (type === 'dots') {
      // v1.0.32 — slider a pallini stile VS Code Claude plugin
      // v1.0.38 — tooltip custom istantaneo con nomi leggibili
      const dotsWrap = el('div', 'dots-slider');
      const values = opts || [];
      const displayNames = {
        low: 'Low', medium: 'Medium', high: 'High', xhigh: 'Extra-high', max: 'Max',
      };
      const labelEl = left.querySelector('.settings-row-label');
      const labelSuffix = el('span', 'dots-current-label');
      labelEl.appendChild(labelSuffix);

      function refresh(activeIdx, activeValue) {
        dotsWrap.querySelectorAll('.dots-slider-dot').forEach((d, j) => {
          d.classList.toggle('active', j <= activeIdx);
        });
        labelSuffix.textContent = ' (' + (displayNames[activeValue] || activeValue) + ')';
      }

      const currentValue = settings[key];
      let activeIdx = values.indexOf(currentValue);
      if (activeIdx < 0) activeIdx = 0;

      values.forEach((v, i) => {
        const dotWrap = el('span', 'dots-slider-dot-wrap');
        const dot = el('button', 'dots-slider-dot');
        dot.type = 'button';
        dot.dataset.value = v;
        const tip = el('span', 'dots-slider-tooltip', displayNames[v] || v);
        dotWrap.appendChild(dot);
        dotWrap.appendChild(tip);
        dot.addEventListener('click', async () => {
          const previous = settings[key];
          refresh(i, v);  // ottimistico
          lastInternalSettingsWrite = Date.now();
          const r = await window.claudeAPI.updateSettings({ [key]: v });
          if (r.success) {
            settings[key] = v;
            if (statsCache && statsCache.settings) statsCache.settings[key] = v;
            toast(label + ' → ' + v, 'success');
          } else {
            // revert
            const prevIdx = values.indexOf(previous);
            refresh(prevIdx >= 0 ? prevIdx : 0, previous || values[0]);
            toast('Errore: ' + r.error, 'error');
          }
        });
        dotsWrap.appendChild(dotWrap);
      });

      refresh(activeIdx, values[activeIdx] || currentValue);
      row.appendChild(dotsWrap);
      container.appendChild(row);
      return;
    } else if (type === 'toggle') {
      const toggleWrap = el('label', 'toggle');
      input = el('input');
      input.type = 'checkbox';
      input.checked = !!settings[key];
      const track = el('span', 'toggle-track');
      const thumb = el('span', 'toggle-thumb');
      toggleWrap.appendChild(input);
      toggleWrap.appendChild(track);
      toggleWrap.appendChild(thumb);
      input.addEventListener('change', async () => {
        lastInternalSettingsWrite = Date.now();
        const r = await window.claudeAPI.updateSettings({ [key]: input.checked });
        if (r.success) {
          // Aggiorna cache locale per evitare reset al prossimo render (settings.json
          // fs.watchFile scatta 'config-changed' che re-renderizza)
          settings[key] = input.checked;
          if (statsCache && statsCache.settings) statsCache.settings[key] = input.checked;
          toast(label + (input.checked ? ' attivato' : ' disattivato'), 'success');
        } else {
          input.checked = !input.checked;  // revert UI
          toast('Errore salvataggio: ' + r.error, 'error');
        }
      });
      row.appendChild(toggleWrap);
      container.appendChild(row);
      return;
    } else {
      input = el('input', 'config-input');
      input.value = settings[key] || '';
    }
    if (type === 'select') {
      input.addEventListener('change', async () => {
        lastInternalSettingsWrite = Date.now();
        const r = await window.claudeAPI.updateSettings({ [key]: input.value });
        if (r.success) {
          settings[key] = input.value;
          if (statsCache && statsCache.settings) statsCache.settings[key] = input.value;
          toast(label + ' impostato a: ' + input.value, 'success');
        } else {
          toast('Errore salvataggio: ' + r.error, 'error');
        }
      });
    }
    row.appendChild(input);
    container.appendChild(row);
  }

  // v1.0.40 — Tutte le opzioni di Configurazione sono **per Claude Code** (TUI
  // terminale e IDE plugin). Non hanno effetto sulla UI di CLACOROO.
  // Schema corretto verificato da claude-code-settings.schema.json
  configRow('alwaysThinkingEnabled', 'Always Thinking', 'toggle',
    null, 'Abilita il ragionamento esteso sui modelli che lo supportano. Effetto interno al modello: non c\'è un\'animazione, ma le risposte sono più ragionate.');

  // Voice: schema corretto è voice.enabled (oggetto nested), NON voiceEnabled top-level
  voiceConfigRow(container, settings);

  configRow('model', 'Modello predefinito', 'select',
    ['default', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    'Modello scelto da Claude Code per ogni nuova sessione (override del default).');

  // v1.0.30/32 — Effort level: slider a pallini stile VS Code (5 livelli).
  configRow('effortLevel', 'Effort', 'dots',
    ['low', 'medium', 'high', 'xhigh', 'max'],
    'Intensità del ragionamento (più alto = più cura, più token, più lento).');

  // Theme: tutti i valori dallo schema ufficiale. Si applica alla UI di
  // Claude Code (terminale + IDE), non a CLACOROO.
  configRow('theme', 'Tema (Claude Code)', 'select',
    ['auto', 'dark', 'light', 'dark-daltonized', 'light-daltonized', 'dark-ansi', 'light-ansi'],
    'Tema della UI di Claude Code nel terminale e nel plugin IDE. Non ha effetto sul tema di CLACOROO.');

  // Language: nomi capitalized accettati dallo schema (italian, spanish, ...).
  // Cambia la lingua delle RISPOSTE di Claude, non l'interfaccia CLACOROO.
  configRow('language', 'Lingua risposte', 'select',
    ['', 'English', 'Italian', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Chinese'],
    'Lingua preferita per le risposte di Claude (e dictation vocale). Non cambia la lingua di CLACOROO.');
}

// Riga custom per voice.enabled (campo nested in settings.json — lo schema
// di Claude Code è { voice: { enabled, mode, autoSubmit } }, non un flat
// voiceEnabled top-level che veniva ignorato).
function voiceConfigRow(container, settings) {
  const row = el('div', 'settings-row');
  const left = el('div');
  left.appendChild(el('div', 'settings-row-label', 'Voice'));
  left.appendChild(el('div', 'settings-row-desc',
    '~/.claude/settings.json → voice.enabled · Abilita la dictation hold-to-talk / tap-to-toggle nella TUI Claude Code'));
  row.appendChild(left);

  const voice = settings.voice || {};
  const toggleWrap = el('label', 'toggle');
  const input = el('input');
  input.type = 'checkbox';
  input.checked = !!voice.enabled;
  const track = el('span', 'toggle-track');
  const thumb = el('span', 'toggle-thumb');
  toggleWrap.appendChild(input);
  toggleWrap.appendChild(track);
  toggleWrap.appendChild(thumb);
  input.addEventListener('change', async () => {
    const currentVoice = (statsCache?.settings?.voice) || settings.voice || {};
    const next = { ...currentVoice, enabled: input.checked };
    lastInternalSettingsWrite = Date.now();
    const r = await window.claudeAPI.updateSettings({ voice: next });
    if (r.success) {
      settings.voice = next;
      if (statsCache?.settings) statsCache.settings.voice = next;
      toast('Voice ' + (input.checked ? 'attivato' : 'disattivato'), 'success');
    } else {
      input.checked = !input.checked;
      toast('Errore salvataggio: ' + r.error, 'error');
    }
  });
  row.appendChild(toggleWrap);
  container.appendChild(row);
}

/* ── MCP (v1.0.21) ────────────────────────────────────────────────────── */
let mcpCache = null;       // ultimo result di get-mcp (riusato fra cambi sezione)
let mcpRenderToken = 0;
let mcpFilter = { search: '', status: 'all', scope: 'all' };

async function renderMcp() {
  const myToken = ++mcpRenderToken;
  const wrap = el('div');

  // Filter bar + bottone refresh
  const bar = el('div', 'filter-bar');
  const searchWrap = el('div', 'search-wrap');
  const sicon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sicon.setAttribute('viewBox', '0 0 20 20'); sicon.setAttribute('fill', 'currentColor');
  const sPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sPath.setAttribute('fill-rule', 'evenodd');
  sPath.setAttribute('d', 'M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z');
  sicon.appendChild(sPath); searchWrap.appendChild(sicon);
  const searchInp = el('input', 'search-input');
  searchInp.setAttribute('placeholder', 'Cerca server MCP…');
  searchInp.setAttribute('type', 'text');
  searchInp.value = mcpFilter.search;
  searchInp.addEventListener('input', () => {
    mcpFilter.search = searchInp.value.toLowerCase();
    applyMcpFilters(wrap);
  });
  searchWrap.appendChild(searchInp);
  bar.appendChild(searchWrap);

  // Status chips
  const statusDefs = [
    { key: 'all',       label: 'Tutti' },
    { key: 'connected', label: 'Connected', dot: '#22c55e' },
    { key: 'needsAuth', label: 'Needs Auth', dot: '#f59e0b' },
    { key: 'error',     label: 'Errore',    dot: '#ef4444' },
  ];
  const sChips = el('div', 'chips');
  statusDefs.forEach(c => {
    const chip = el('div', 'chip' + (mcpFilter.status === c.key ? ' active' : ''));
    if (c.dot) {
      const dot = el('span', 'chip-dot');
      dot.style.background = c.dot;
      chip.appendChild(dot);
    }
    chip.appendChild(document.createTextNode(c.label));
    chip.addEventListener('click', () => { mcpFilter.status = c.key; renderMcp(); });
    sChips.appendChild(chip);
  });
  bar.appendChild(sChips);

  // Scope chips (builtin / plugin) — gruppo separato visivamente dai filtri stato
  const scopeDefs = [
    { key: 'all',     label: 'Tutti i tipi' },
    { key: 'builtin', label: 'claude.ai' },
    { key: 'plugin',  label: 'Dai plugin' },
  ];
  const scChips = el('div', 'chips chips-group-divider');
  scopeDefs.forEach(c => {
    const chip = el('div', 'chip' + (mcpFilter.scope === c.key ? ' active' : ''));
    chip.textContent = c.label;
    chip.addEventListener('click', () => { mcpFilter.scope = c.key; renderMcp(); });
    scChips.appendChild(chip);
  });
  bar.appendChild(scChips);

  wrap.appendChild(bar);

  // Count + refresh button
  const headerRow = el('div', 'section-header');
  const countSpan = el('span', 'section-count', '');
  headerRow.appendChild(countSpan);
  const refreshBtn = el('button', 'btn btn-sm btn-ghost', '↻ Aggiorna stato live');
  refreshBtn.title = 'Esegue `claude mcp list` con health-check (può richiedere qualche secondo)';
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…controllo…';
    mcpCache = null;
    const data = await window.claudeAPI.getMcp({ force: true });
    if (myToken !== mcpRenderToken) return;
    mcpCache = data;
    refreshBtn.disabled = false;
    refreshBtn.textContent = '↻ Aggiorna stato live';
    renderMcp();
  });
  headerRow.appendChild(refreshBtn);
  wrap.appendChild(headerRow);

  // Grid
  const grid = el('div', 'mcp-grid');
  wrap.appendChild(grid);

  // Caricamento iniziale o usa cache
  setContent(wrap);

  if (!mcpCache) {
    grid.appendChild(el('div', 'mcp-loading', 'Controllo stato MCP server… (health-check live, può richiedere qualche secondo)'));
    const data = await window.claudeAPI.getMcp({});
    if (myToken !== mcpRenderToken) return;
    mcpCache = data;
    grid.textContent = '';
  }

  if (!mcpCache.ok) {
    grid.appendChild(el('div', 'mcp-empty',
      'Errore lettura MCP: ' + (mcpCache.error || 'sconosciuto')));
    return;
  }

  const servers = mcpCache.servers || [];
  if (!servers.length) {
    grid.appendChild(el('div', 'mcp-empty', 'Nessun MCP server configurato.'));
    return;
  }

  let visible = 0;
  servers.forEach(srv => {
    const card = buildMcpCard(srv);
    const show = mcpMatches(srv, mcpFilter);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
    grid.appendChild(card);
  });

  if (visible === 0) {
    grid.appendChild(el('div', 'no-results', 'Nessun server corrisponde ai filtri.'));
  }
  const connectedCount = servers.filter(s => s.status === 'connected').length;
  countSpan.textContent = visible + ' di ' + servers.length + ' server · ' + connectedCount + ' connessi';
}

function applyMcpFilters(wrap) {
  const grid = wrap.querySelector('.mcp-grid');
  if (!grid || !mcpCache || !mcpCache.servers) return;
  let visible = 0;
  Array.from(grid.querySelectorAll('.mcp-card')).forEach(card => {
    const id = card.dataset.mcpId;
    const srv = mcpCache.servers.find(s => s.id === id);
    const show = srv && mcpMatches(srv, mcpFilter);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  // remove any existing no-results
  const old = grid.querySelector('.no-results');
  if (old) old.remove();
  if (visible === 0) grid.appendChild(el('div', 'no-results', 'Nessun server corrisponde ai filtri.'));
  const countSpan = wrap.querySelector('.section-count');
  if (countSpan && mcpCache.servers) {
    const connected = mcpCache.servers.filter(s => s.status === 'connected').length;
    countSpan.textContent = visible + ' di ' + mcpCache.servers.length + ' server · ' + connected + ' connessi';
  }
}

function mcpMatches(srv, f) {
  if (f.status !== 'all' && srv.status !== f.status) return false;
  if (f.scope !== 'all' && srv.scope !== f.scope) return false;
  if (!f.search) return true;
  const q = f.search;
  return srv.id.toLowerCase().includes(q)
      || (srv.displayName || '').toLowerCase().includes(q)
      || (srv.plugin || '').toLowerCase().includes(q)
      || (srv.connection || '').toLowerCase().includes(q);
}

function buildMcpCard(srv) {
  const card = el('div', 'mcp-card');
  card.dataset.mcpId = srv.id;

  // Header
  const header = el('div', 'mcp-card-header');
  const nameWrap = el('div', 'mcp-card-name-wrap');
  const name = el('div', 'mcp-card-name', srv.displayName || srv.id);
  nameWrap.appendChild(name);
  const sub = el('div', 'mcp-card-sub');
  if (srv.scope === 'builtin') {
    sub.textContent = 'claude.ai · globale';
  } else if (srv.scope === 'plugin') {
    sub.textContent = 'plugin: ' + (srv.plugin || '—');
  } else {
    sub.textContent = 'user-added';
  }
  nameWrap.appendChild(sub);
  header.appendChild(nameWrap);

  const badge = el('div', 'mcp-badge mcp-badge-' + srv.status);
  const badgeText = {
    connected: '✓ Connected',
    needsAuth: '! Needs auth',
    warning:   '! Warning',
    error:     '✗ Errore',
    unknown:   '? Sconosciuto',
  }[srv.status] || srv.status;
  badge.textContent = badgeText;
  header.appendChild(badge);
  card.appendChild(header);

  // Body: transport + connection (mono)
  const body = el('div', 'mcp-card-body');
  const transportRow = el('div', 'mcp-card-row');
  transportRow.appendChild(el('span', 'mcp-card-label', 'Transport'));
  transportRow.appendChild(el('span', 'mcp-card-value mcp-card-transport-' + srv.transport, srv.transport.toUpperCase()));
  body.appendChild(transportRow);

  const connRow = el('div', 'mcp-card-row');
  connRow.appendChild(el('span', 'mcp-card-label', srv.transport === 'stdio' ? 'Comando' : 'URL'));

  const connWrap = el('div', 'mcp-card-conn-wrap');
  const conn = el('code', 'mcp-card-conn');
  conn.textContent = srv.connection || '—';
  connWrap.appendChild(conn);

  if (srv.connection) {
    const copyBtn = el('button', 'mcp-card-icon-btn');
    copyBtn.title = 'Copia negli appunti';
    copyBtn.setAttribute('aria-label', 'Copia');
    copyBtn.textContent = '⧉';
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(srv.connection);
        const short = srv.connection.length > 50 ? srv.connection.slice(0, 47) + '…' : srv.connection;
        toast('Copiato: ' + short, 'success');
      } catch {
        toast('Impossibile copiare negli appunti', 'error');
      }
    });
    connWrap.appendChild(copyBtn);
  }
  connRow.appendChild(connWrap);
  body.appendChild(connRow);

  if (srv.statusText && srv.status !== 'connected') {
    const stRow = el('div', 'mcp-card-status-msg');
    stRow.textContent = srv.statusText;
    body.appendChild(stRow);
  }

  card.appendChild(body);

  // Footer: placeholder per azioni (v1 sola lettura — vedi TASK Pack G)
  const footer = el('div', 'mcp-card-footer');
  const hint = el('div', 'mcp-card-hint',
    srv.status === 'needsAuth'
      ? 'Apri Claude Code o IDE e completa OAuth quando richiesto'
      : 'Solo lettura · azioni in arrivo');
  footer.appendChild(hint);
  card.appendChild(footer);

  return card;
}

/* ── ACCOUNT (v1.0.27, Pack A) ────────────────────────────────────────── */
let accountCache = null;

function paintAccountPanel(container, result) {
  container.textContent = '';
  if (!result || !result.ok) {
    const err = el('div', 'account-error',
      'Impossibile leggere lo stato auth: ' + ((result && result.error) || 'errore sconosciuto'));
    container.appendChild(err);
    return;
  }
  const d = result.data || {};

  if (!d.loggedIn) {
    const card = el('div', 'account-card account-card-loggedout');
    card.appendChild(el('div', 'account-status', '⚠ Non autenticato'));
    card.appendChild(el('div', 'account-note',
      'Esegui `claude auth login` da terminale (o avvia Claude Code) per accedere.'));
    container.appendChild(card);
    return;
  }

  const card = el('div', 'account-card');

  const head = el('div', 'account-head');
  const planBadge = el('span', 'account-plan-badge account-plan-' + (d.subscriptionType || 'unknown'));
  planBadge.textContent = (d.subscriptionType || '—').toUpperCase();
  head.appendChild(planBadge);
  const status = el('span', 'account-status account-status-ok', '✓ Connesso');
  head.appendChild(status);
  card.appendChild(head);

  // Info rows
  function infoRow(label, value) {
    const r = el('div', 'account-row');
    r.appendChild(el('span', 'account-row-lbl', label));
    r.appendChild(el('span', 'account-row-val', value || '—'));
    card.appendChild(r);
  }
  infoRow('Email', d.email);
  infoRow('Organizzazione', d.orgName);
  infoRow('ID organizzazione', d.orgId);
  infoRow('Auth method', d.authMethod === 'claude.ai' ? 'claude.ai (OAuth)' : d.authMethod || '—');
  infoRow('API provider', d.apiProvider || '—');

  // v1.0.35 — Usage live (Session 5h, Weekly 7d, Weekly Sonnet) via endpoint
  // privato Anthropic. Render ottimistico se cache disponibile, swap on update.
  const usageSection = el('div', 'account-usage-section');
  card.appendChild(usageSection);
  loadAccountUsage(usageSection);


  // Actions
  const actions = el('div', 'account-actions');
  const refreshBtn = el('button', 'btn btn-sm btn-ghost', '↻ Aggiorna');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…';
    const r = await window.claudeAPI.getAccount({ force: true });
    accountCache = r;
    paintAccountPanel(container, r);
    refreshSidebarAccountPill();
  });

  // Link rapidi alle console Anthropic (v1.0.29)
  const claudeBtn = el('button', 'btn btn-sm btn-ghost', '↗ claude.ai');
  claudeBtn.title = 'Apri claude.ai (gestione subscription Max/Pro)';
  claudeBtn.addEventListener('click', () => window.claudeAPI.openExternal('https://claude.ai/settings/billing'));
  const consoleBtn = el('button', 'btn btn-sm btn-ghost', '↗ Console API');
  consoleBtn.title = 'Apri console.anthropic.com (API key, billing, usage API)';
  consoleBtn.addEventListener('click', () => window.claudeAPI.openExternal('https://console.anthropic.com'));
  // Logout con tooltip custom hover (warning esplicito, niente box invadente)
  const logoutWrap = el('div', 'logout-btn-wrap');
  const logoutBtn = el('button', 'btn btn-sm btn-danger', 'Logout');
  const logoutTooltip = el('div', 'logout-tooltip');
  logoutTooltip.appendChild(el('div', 'logout-tooltip-title', '⚠ Logout di sistema'));
  logoutTooltip.appendChild(el('div', 'logout-tooltip-body',
    'Disconnette OVUNQUE — non solo da CLACOROO: il token è nel macOS Keychain condiviso.'));
  const list = el('ul', 'logout-tooltip-list');
  ['CLACOROO', 'Claude Code nel terminale (CLI)', 'Plugin IDE (VS Code, JetBrains, ecc.)'].forEach(item => {
    const li = el('li', null, item);
    list.appendChild(li);
  });
  logoutTooltip.appendChild(list);
  logoutTooltip.appendChild(el('div', 'logout-tooltip-footer',
    'Per riaccedere: apri terminale ed esegui `claude auth login`.'));
  logoutWrap.appendChild(logoutBtn);
  logoutWrap.appendChild(logoutTooltip);

  logoutBtn.addEventListener('click', async () => {
    const ok = await window.claudeAPI.confirmDialog({
      title:   '⚠ Logout di sistema da Claude',
      message: 'Il logout disconnette OVUNQUE — non solo da CLACOROO',
      detail:
        'Questa azione rimuove le credenziali OAuth dal Keychain macOS, che è lo storage condiviso da tutte le istanze del binario `claude`.\n\n' +
        'Disconnetterai contemporaneamente:\n' +
        '  • CLACOROO\n' +
        '  • Claude Code nel terminale (CLI)\n' +
        '  • Eventuali plugin IDE (VS Code, JetBrains, ecc.)\n\n' +
        'Per ri-autenticarti dovrai aprire un terminale ed eseguire:\n' +
        '    claude auth login\n\n' +
        'Procedere?',
      buttons: ['Annulla', 'Sì, logout globale'],
    });
    if (ok !== 1) return;
    logoutBtn.disabled = true;
    logoutBtn.textContent = '…';
    const r = await window.claudeAPI.accountLogout();
    if (r.ok) {
      toast('Logout effettuato', 'success');
      accountCache = null;
      const fresh = await window.claudeAPI.getAccount({ force: true });
      accountCache = fresh;
      paintAccountPanel(container, fresh);
    } else {
      toast('Errore logout: ' + r.error, 'error');
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Logout';
    }
  });
  // v1.0.31 — Pulsante guida API key (sicurezza: CLACOROO NON gestisce la chiave)
  const apiKeyBtn = el('button', 'btn btn-sm btn-ghost', 'ℹ Modalità API key');
  apiKeyBtn.title = 'Guida per usare un\'API key invece della subscription';
  apiKeyBtn.addEventListener('click', () => showApiKeyGuideModal());

  actions.appendChild(refreshBtn);
  actions.appendChild(claudeBtn);
  actions.appendChild(consoleBtn);
  actions.appendChild(apiKeyBtn);
  actions.appendChild(logoutWrap);
  card.appendChild(actions);

  container.appendChild(card);
}

async function loadAccountPanel(container) {
  // Render ottimistico con cache se disponibile
  if (accountCache) paintAccountPanel(container, accountCache);
  else container.appendChild(el('div', 'account-loading', 'Caricamento info account…'));
  const data = await window.claudeAPI.getAccount({});
  accountCache = data;
  paintAccountPanel(container, data);
  refreshSidebarAccountPill();
}

// Pill account nella sidebar (sotto Recenti, sopra Footer) — sempre visibile
function refreshSidebarAccountPill() {
  const pill = document.getElementById('sidebar-account');
  if (!pill) return;
  pill.textContent = '';
  if (!accountCache || !accountCache.ok || !accountCache.data || !accountCache.data.loggedIn) {
    pill.style.display = 'none';
    return;
  }
  pill.style.display = '';
  const d = accountCache.data;
  const badge = el('span', 'sidebar-account-plan account-plan-' + (d.subscriptionType || 'unknown'));
  badge.textContent = (d.subscriptionType || '—').toUpperCase();
  const emailEl = el('span', 'sidebar-account-email', d.email || '—');
  emailEl.title = d.email || '';
  pill.appendChild(badge);
  pill.appendChild(emailEl);
  pill.title = 'Account: ' + (d.email || '') + ' · click per aprire Impostazioni';
  pill.style.cursor = 'pointer';
  pill.onclick = () => switchToSection('settings');
}

// v1.0.35 — Usage live tracking. Cache anti-flicker: lastUsageData mantiene
// l'ultima response valida ed è usata per il render istantaneo a ogni
// re-mount; il fetch async sostituisce i valori solo quando arrivano dati
// freschi diversi. Riusabile da pannello Account e Dashboard.
let lastUsageData = null;

function formatResetTime(isoTimestamp) {
  if (!isoTimestamp) return null;
  const target = new Date(isoTimestamp);
  if (isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 'a breve';
  const mins  = Math.round(diffMs / 60000);
  const hours = Math.round(diffMs / 3600000);
  const days  = Math.round(diffMs / 86400000);
  if (days   >= 1) return 'in ' + days  + 'g';
  if (hours  >= 1) return 'in ' + hours + 'h';
  return 'in ' + Math.max(1, mins) + 'min';
}

function buildUsageBar(label, band, color) {
  const wrap = el('div', 'usage-bar-wrap');
  wrap.dataset.band = label;
  const header = el('div', 'usage-bar-header');
  header.appendChild(el('span', 'usage-bar-label', label));
  const pctEl = el('span', 'usage-bar-pct');
  // utilization è GIÀ in percentuale (0..100) — confermato leggendo il
  // plugin VS Code: Math.min(100, Math.max(0, Z)) senza moltiplicazioni.
  // Clampiamo a [0, 100] per sicurezza.
  const pct = band && Number.isFinite(band.utilization)
    ? Math.min(100, Math.max(0, band.utilization))
    : null;
  if (pct != null) {
    pctEl.textContent = Math.floor(pct) + '%';
  } else {
    pctEl.textContent = '—';
    pctEl.classList.add('usage-bar-pct-na');
  }
  header.appendChild(pctEl);
  wrap.appendChild(header);

  const track = el('div', 'usage-bar-track');
  const fill = el('div', 'usage-bar-fill');
  fill.style.background = color;
  fill.style.width = pct != null ? (pct + '%') : '0%';
  // Color shift se vicino alla soglia (>=80% arancio, >=95% rosso)
  if (pct != null && pct >= 95) fill.style.background = '#ef4444';
  else if (pct != null && pct >= 80) fill.style.background = '#f59e0b';
  track.appendChild(fill);
  wrap.appendChild(track);

  const reset = el('div', 'usage-bar-reset');
  const resetTxt = band && band.resetsAt ? 'Si azzera ' + formatResetTime(band.resetsAt) : '';
  reset.textContent = resetTxt;
  wrap.appendChild(reset);
  return wrap;
}

function paintUsageBars(container, usageData, opts = {}) {
  const compact = !!opts.compact;
  container.textContent = '';
  if (!usageData) {
    container.appendChild(el('div', 'usage-loading',
      compact ? 'Caricamento usage…' : 'Caricamento quote sessione/settimana…'));
    return;
  }
  if (!usageData.ok) {
    const err = el('div', 'usage-error', '⚠ Impossibile leggere usage: ' + (usageData.error || 'errore'));
    container.appendChild(err);
    return;
  }
  const d = usageData.data || {};
  if (!compact) {
    container.appendChild(el('div', 'usage-section-title', 'Usage corrente'));
  }
  const grid = el('div', 'usage-grid' + (compact ? ' usage-grid-compact' : ''));
  grid.appendChild(buildUsageBar('Session (5h)',    d.fiveHour,       '#6a9bcc'));
  grid.appendChild(buildUsageBar('Weekly (7d)',     d.sevenDay,       '#788c5d'));
  grid.appendChild(buildUsageBar('Weekly Sonnet',   d.sevenDaySonnet, '#d97757'));
  container.appendChild(grid);

  if (!compact) {
    const link = el('button', 'usage-link', 'Gestisci usage su claude.ai →');
    link.addEventListener('click', () =>
      window.claudeAPI.openExternal('https://claude.ai/settings/usage'));
    container.appendChild(link);
  }
}

async function loadAccountUsage(container) {
  // 1. Render ottimistico se abbiamo già dati
  paintUsageBars(container, lastUsageData);
  // 2. Fetch fresco; cache server-side 60s evita roundtrip se cambi sezione
  try {
    const data = await window.claudeAPI.getUsage({});
    lastUsageData = data;
    paintUsageBars(container, data);
  } catch (e) {
    if (!lastUsageData) paintUsageBars(container, { ok: false, error: e.message });
  }
}

async function loadDashboardUsage(container, token) {
  paintUsageBars(container, lastUsageData, { compact: true });
  try {
    const data = await window.claudeAPI.getUsage({});
    if (token !== dashboardRenderToken) return;
    lastUsageData = data;
    paintUsageBars(container, data, { compact: true });
  } catch { /* fail silently in dashboard */ }
}

// v1.0.31 — Guida modalità API key. Per sicurezza CLACOROO non maneggia mai
// la chiave: mostriamo solo istruzioni per impostarla nel proprio shell profile,
// così la chiave resta esclusivamente sul sistema dell'utente.
function showApiKeyGuideModal() {
  if (document.querySelector('.md-overlay')) return;
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title  = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-skill', 'guida'));
  title.appendChild(document.createTextNode(' Modalità API key'));
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = el('div', 'md-content');

  function p(text) { content.appendChild(el('p', null, text)); }
  function h(text) { content.appendChild(el('h3', null, text)); }
  function note(text, kind) {
    const n = el('div', 'apikey-note apikey-note-' + (kind || 'info'), text);
    content.appendChild(n);
  }
  function codeBlock(label, snippet) {
    const wrap = el('div', 'apikey-code-wrap');
    const lbl = el('div', 'apikey-code-label', label);
    const pre = el('div', 'apikey-code-block');
    const code = el('code', null, snippet);
    pre.appendChild(code);
    const copyBtn = el('button', 'apikey-code-copy', '⧉ Copia');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(snippet);
        toast('Copiato', 'success');
      } catch { toast('Impossibile copiare', 'error'); }
    });
    wrap.appendChild(lbl);
    wrap.appendChild(pre);
    wrap.appendChild(copyBtn);
    content.appendChild(wrap);
  }

  note('⚡ Sicurezza prima di tutto: CLACOROO NON salva, legge o trasmette mai la tua API key. La chiave resta esclusivamente nel tuo shell profile, accessibile solo al tuo utente macOS.', 'security');

  h('Quando usare la modalità API key');
  p('Se non hai una subscription Claude Max/Pro/Team e vuoi usare i tuoi crediti API pay-per-use, oppure se vuoi forzare l\'uso di un\'API key specifica (es. per un progetto con billing separato).');

  h('Step 1 — Ottieni una chiave');
  p('Vai sulla console Anthropic, crea o copia una chiave esistente. Le chiavi iniziano con sk-ant-…');
  const consoleBtn = el('button', 'btn btn-sm btn-primary apikey-step-btn', '↗ Apri console.anthropic.com');
  consoleBtn.addEventListener('click', () => window.claudeAPI.openExternal('https://console.anthropic.com/settings/keys'));
  content.appendChild(consoleBtn);

  h('Step 2 — Aggiungila al tuo shell profile');
  p('Aggiungi questa riga al file di configurazione della tua shell. Sostituisci sk-ant-xxxx con la tua chiave reale.');
  codeBlock('Per Zsh (default su macOS recente):', 'echo \'export ANTHROPIC_API_KEY="sk-ant-xxxx"\' >> ~/.zshrc');
  codeBlock('Per Bash (es. Linux o macOS legacy):', 'echo \'export ANTHROPIC_API_KEY="sk-ant-xxxx"\' >> ~/.bashrc');

  h('Step 3 — Ricarica la shell');
  p('Chiudi e riapri il terminale, oppure esegui:');
  codeBlock('Zsh:',  'source ~/.zshrc');
  codeBlock('Bash:', 'source ~/.bashrc');

  h('Step 4 — Verifica');
  p('Esegui in terminale:');
  codeBlock('Verifica auth:', 'claude auth status --json');
  p('Dovresti vedere "authMethod" cambiare a "api" e "apiProvider" che resta "firstParty".');

  note('💡 Nota: questa modalità sostituisce l\'OAuth della subscription. Se vuoi tornare alla subscription Max/Pro, rimuovi la riga export dal profile, ricarica la shell, e ri-esegui claude auth login.', 'info');

  note('🔒 Perché non un campo di input qui? Salvare la chiave in CLACOROO significherebbe scriverla in un file leggibile, oppure usare macOS Keychain. Entrambi gli approcci aggiungono complessità e nuovi vettori di rischio. Lo shell profile è il modo standard e più sicuro: niente intermediari.', 'security');

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// All'avvio carica l'account pill anche se l'utente non visita Impostazioni
async function bootSidebarAccount() {
  try {
    const data = await window.claudeAPI.getAccount({});
    accountCache = data;
    refreshSidebarAccountPill();
  } catch { /* fail silently */ }
}

/* ── SETTINGS ─────────────────────────────────────────────────────────── */
function renderSettings() {
  if (!state.rawData) return;
  const d   = state.rawData;
  const wrap = el('div');

  function group(title) {
    const g = el('div', 'settings-group');
    g.appendChild(el('div', 'settings-group-title', title));
    wrap.appendChild(g);
    return g;
  }

  function row(g, label, desc, val) {
    const r = el('div', 'settings-row');
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', label));
    if (desc) left.appendChild(el('div', 'settings-row-desc', desc));
    r.appendChild(left);
    if (val) {
      const valEl = el('div', 'settings-row-val', val);
      r.appendChild(valEl);
    }
    g.appendChild(r);
    return r;
  }

  // v1.0.27 — Pack A: pannello Account (sopra a tutto)
  const gAccount = group('Account Claude');
  const accountWrap = el('div', 'settings-account-wrap');
  gAccount.appendChild(accountWrap);
  loadAccountPanel(accountWrap);

  const g1 = group('Percorsi');
  row(g1, 'Cartella Claude Code', 'Directory di configurazione globale', d.claudeDir);
  row(g1, 'Binario claude', d.claudeBin ? 'Trovato automaticamente' : '⚠ Non trovato — configura manualmente', d.claudeBin || '—');

  if (!d.claudeBin) {
    const r2 = el('div', 'settings-row');
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', 'Configura percorso claude'));
    left.appendChild(el('div', 'settings-row-desc', 'Inserisci il percorso completo al binario claude'));
    r2.appendChild(left);
    const pathInp = el('input', 'search-input');
    pathInp.style.cssText = 'width:300px;';
    pathInp.setAttribute('placeholder', '/usr/local/bin/claude');
    const saveBtn = el('button', 'btn btn-primary btn-sm', 'Salva');
    saveBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.setClaudeBin(pathInp.value.trim());
      if (r.success) { toast('Percorso aggiornato', 'success'); await loadData(); }
      else toast('Errore: ' + r.error, 'error');
    });
    const inputWrap = el('div');
    inputWrap.style.cssText = 'display:flex;gap:8px;align-items:center;';
    inputWrap.appendChild(pathInp); inputWrap.appendChild(saveBtn);
    r2.appendChild(inputWrap);
    g1.appendChild(r2);
  }

  // v1.0.40 — Rimossa sezione Statistiche: già presente in Dashboard e Stats
  // v1.0.11 — Progetti tracciati (scope locale)
  const gProj = group('Progetti tracciati');
  const projDesc = el('div', 'settings-row');
  const projDescL = el('div');
  projDescL.appendChild(el('div', 'settings-row-label', 'Progetti con scope locale'));
  projDescL.appendChild(el('div', 'settings-row-desc', 'CLACOROO mostrerà anche plugin/skill/agent installati in .claude/ di questi progetti. Click su "+ Progetto" nella topbar per aggiungerli.'));
  projDesc.appendChild(projDescL);
  gProj.appendChild(projDesc);

  (state.trackedProjects || []).forEach(projectPath => {
    const projRow = el('div', 'settings-row');
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', projectPath.split('/').pop() || projectPath));
    left.appendChild(el('div', 'settings-row-desc', projectPath));
    projRow.appendChild(left);
    const removeBtn = el('button', 'btn btn-sm btn-danger', 'Rimuovi');
    removeBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.removeTrackedProject(projectPath);
      if (r.success) {
        toast('Progetto rimosso', 'success');
        await loadData();
      }
    });
    projRow.appendChild(removeBtn);
    gProj.appendChild(projRow);
  });

  if (!state.trackedProjects?.length) {
    const empty = el('div', 'settings-row');
    const emptyL = el('div');
    emptyL.appendChild(el('div', 'settings-row-desc', 'Nessun progetto tracciato. Aggiungine uno dal bottone "+" in topbar.'));
    empty.appendChild(emptyL);
    gProj.appendChild(empty);
  }

  // Sviluppo plugin (idea #6 riformulata)
  const g4 = group('Sviluppo plugin');
  const devRow = el('div', 'settings-row');
  const devLeft = el('div');
  devLeft.appendChild(el('div', 'settings-row-label', 'Plugin Validator'));
  devLeft.appendChild(el('div', 'settings-row-desc', 'Valida plugin.json e marketplace.json di un plugin locale prima di pubblicarlo'));
  devRow.appendChild(devLeft);

  const devWrap = el('div');
  devWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-end;min-width:340px;';
  const pathRow = el('div');
  pathRow.style.cssText = 'display:flex;gap:6px;align-items:center;';
  const pathInp = el('input', 'search-input');
  pathInp.style.cssText = 'width:240px;font-family:"SF Mono",monospace;';
  pathInp.setAttribute('placeholder', '/path/to/local/plugin');
  pathInp.setAttribute('type', 'text');
  const browseBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'folder', ' Sfoglia');
  const validateBtn = el('button', 'btn btn-sm btn-primary', 'Valida');
  const outputEl = el('pre', 'dev-validate-output');
  outputEl.style.display = 'none';

  browseBtn.addEventListener('click', async () => {
    const p = await window.claudeAPI.pickDirectory();
    if (p) pathInp.value = p;
  });
  validateBtn.addEventListener('click', async () => {
    const p = pathInp.value.trim();
    if (!p) { toast('Specifica un path', 'warn'); return; }
    validateBtn.disabled = true;
    validateBtn.textContent = '…';
    const r = await window.claudeAPI.validatePlugin(p);
    validateBtn.disabled = false;
    validateBtn.textContent = 'Valida';
    outputEl.textContent = r.success ? (r.output || '✓ Manifest valido') : ('✗ ' + r.error);
    outputEl.className = 'dev-validate-output ' + (r.success ? 'ok' : 'err');
    outputEl.style.display = 'block';
  });

  pathRow.appendChild(pathInp);
  pathRow.appendChild(browseBtn);
  pathRow.appendChild(validateBtn);
  devWrap.appendChild(pathRow);
  devWrap.appendChild(outputEl);
  devRow.appendChild(devWrap);
  g4.appendChild(devRow);

  // Aggiornamenti (v1.0.09 — soft auto-update)
  const gUpd = group('Aggiornamenti');
  (async () => {
    const st = await window.claudeAPI.getState();
    const last = st.lastUpdateCheck
      ? new Date(st.lastUpdateCheck).toLocaleString('it-IT')
      : 'mai';
    const cachedInfo = st.lastUpdateResult;

    const rowCheck = el('div', 'settings-row');
    const ckLeft = el('div');
    ckLeft.appendChild(el('div', 'settings-row-label', 'Controlla aggiornamenti'));
    const desc = cachedInfo?.available && cachedInfo.latest
      ? 'Nuova versione disponibile: v' + cachedInfo.latest + ' · Ultimo controllo: ' + last
      : 'Ultimo controllo: ' + last;
    ckLeft.appendChild(el('div', 'settings-row-desc', desc));
    rowCheck.appendChild(ckLeft);
    const ckBtn = el('button', 'btn btn-sm btn-primary', 'Controlla adesso');
    ckBtn.addEventListener('click', async () => {
      ckBtn.disabled = true;
      ckBtn.textContent = '…';
      await runUpdateCheck(true);
      ckBtn.disabled = false;
      ckBtn.textContent = 'Controlla adesso';
      renderSettings();  // refresh timestamp
    });
    rowCheck.appendChild(ckBtn);
    gUpd.appendChild(rowCheck);

    const rowAuto = el('div', 'settings-row');
    const auLeft = el('div');
    auLeft.appendChild(el('div', 'settings-row-label', 'Controllo automatico'));
    auLeft.appendChild(el('div', 'settings-row-desc', "All'avvio dell'app + ogni 24 ore (con cooldown 1h)"));
    rowAuto.appendChild(auLeft);
    const togWrap = el('label', 'toggle');
    const togInp = el('input');
    togInp.type = 'checkbox';
    togInp.checked = !st.updateCheckDisabled;
    const togTrack = el('span', 'toggle-track');
    const togThumb = el('span', 'toggle-thumb');
    togWrap.appendChild(togInp); togWrap.appendChild(togTrack); togWrap.appendChild(togThumb);
    togInp.addEventListener('change', async () => {
      await window.claudeAPI.setState({ updateCheckDisabled: !togInp.checked });
      toast(togInp.checked ? 'Controllo automatico attivato' : 'Controllo automatico disattivato', 'info');
    });
    rowAuto.appendChild(togWrap);
    gUpd.appendChild(rowAuto);
  })();

  // Backup snapshot (idea #5)
  const g6 = group('Backup snapshot');
  const snapRow = el('div', 'settings-row');
  const snapLeft = el('div');
  snapLeft.appendChild(el('div', 'settings-row-label', 'Snapshot configurazione'));
  snapLeft.appendChild(el('div', 'settings-row-desc', 'Esporta o importa un file .clacoroo (marketplaces + plugin + blocklist). Utile per backup o migrazione su altro Mac.'));
  snapRow.appendChild(snapLeft);
  const snapBtns = el('div');
  snapBtns.style.cssText = 'display:flex;gap:6px;';
  const exportBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'download', ' Esporta');
  exportBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.exportSnapshot();
    if (r.success) toast('Snapshot esportato in ' + r.path, 'success');
    else if (r.error !== 'Annullato') toast('Errore export: ' + r.error, 'error');
  });
  const importBtn = btnWithIcon('btn btn-sm btn-primary btn-with-icon', 'upload', ' Importa');
  importBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.importSnapshot();
    if (!r.success) {
      if (r.error !== 'Annullato') toast('Errore import: ' + r.error, 'error');
      return;
    }
    const { mktToAdd, pluginsToInstall } = r.preview;
    if (!mktToAdd.length && !pluginsToInstall.length) {
      toast('Snapshot già allineato — niente da applicare', 'info');
      return;
    }
    const choice = await window.claudeAPI.confirmDialog({
      title:   'Applica snapshot',
      message: 'Applicare le seguenti azioni?',
      detail:  '+ ' + mktToAdd.length + ' marketplace\n+ ' + pluginsToInstall.length + ' plugin\n\nL\'operazione può richiedere alcuni minuti.',
      buttons: ['Annulla', 'Applica'],
    });
    if (choice !== 1) return;
    importBtn.disabled = true;
    importBtn.textContent = 'Applicazione…';
    const a = await window.claudeAPI.applySnapshot(r.preview);
    importBtn.disabled = false;
    importBtn.textContent = ' Importa';
    importBtn.prepend(svgIcon('upload'));
    if (a.success) toast('Snapshot applicato (' + a.log.length + ' azioni)', 'success');
    else {
      const failed = a.log.filter(l => !l.success).length;
      toast(failed + ' azioni fallite, vedi Attività recenti', 'warn');
    }
    await loadData();
  });
  snapBtns.appendChild(exportBtn);
  snapBtns.appendChild(importBtn);
  snapRow.appendChild(snapBtns);
  g6.appendChild(snapRow);

  // Onboarding (idea #7)
  const g5 = group('Onboarding');
  const tourRow = el('div', 'settings-row');
  const tourLeft = el('div');
  tourLeft.appendChild(el('div', 'settings-row-label', 'Tour di benvenuto'));
  tourLeft.appendChild(el('div', 'settings-row-desc', '5 step rapidi che spiegano le sezioni e le funzioni principali'));
  tourRow.appendChild(tourLeft);
  const restartBtn = el('button', 'btn btn-sm btn-primary', 'Riavvia tour');
  restartBtn.addEventListener('click', () => {
    showOnboardingTour();
  });
  tourRow.appendChild(restartBtn);
  g5.appendChild(tourRow);

  // v1.0.40 — Informazioni compatta: una sola riga con nome + versione + bottone changelog
  const g3 = group('Informazioni');
  const infoRow = el('div', 'settings-row');
  const infoLeft = el('div');
  infoLeft.appendChild(el('div', 'settings-row-label', 'CLACOROO'));
  const platformLabel = ({ darwin: 'macOS', win32: 'Windows', linux: 'Linux' })[d.platform] || d.platform;
  infoLeft.appendChild(el('div', 'settings-row-desc', platformLabel));
  infoRow.appendChild(infoLeft);
  const infoRight = el('div');
  infoRight.style.cssText = 'display:flex;gap:10px;align-items:center;';
  const verVal = el('div', 'settings-row-val', '1.0.55');
  const chBtn = btnWithIcon('btn btn-sm btn-green btn-with-icon', 'changelog', ' Changelog');
  chBtn.title = 'Mostra storico versioni';
  chBtn.addEventListener('click', () => openChangelogModal());
  infoRight.appendChild(verVal);
  infoRight.appendChild(chBtn);
  infoRow.appendChild(infoRight);
  g3.appendChild(infoRow);

  setContent(wrap);
}

/* ── ONBOARDING TOUR (idea #7) ────────────────────────────────────────── */
const TOUR_STEPS = [
  {
    title: 'Benvenuto in CLACOROO',
    body: 'Il pannello visuale per gestire plugin, marketplace, skill e agent del tuo Claude Code. Niente più comandi CLI da ricordare. Ti faccio un giro rapido in 5 step.',
  },
  {
    title: 'Sidebar',
    body: 'A sinistra trovi 6 sezioni: Dashboard (panoramica), Plugin (gestisci attivi/disattivi), Marketplace (sorgenti dei plugin), Skill e Agent (cataloghi), Impostazioni. Clicca per spostarti.',
  },
  {
    title: 'Plugin',
    body: 'Ogni plugin ha una card con toggle attiva/disattiva, bottone Aggiorna, Rimuovi, e i nuovi bottoni 📁 (apri nel Finder) e 📝 (apri in VS Code). Filtri e ricerca in alto.',
  },
  {
    title: 'Auto-refresh',
    body: "L'UI si aggiorna sola quando i file di config di Claude Code cambiano. Le operazioni eseguite qui finiscono in 'Attività recenti' nella Dashboard.",
  },
  {
    title: 'Pronto!',
    body: 'Esplora liberamente. Puoi rivedere questo tour da Impostazioni → Onboarding → Riavvia tour. Buon lavoro!',
  },
];

function showOnboardingTour() {
  if (document.querySelector('.tour-overlay')) return;  // guard double-modal

  let stepIdx = 0;
  const overlay = el('div', 'tour-overlay');
  const modal   = el('div', 'tour-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'tour-title-el');
  const mascot  = el('img', 'tour-mascot');
  mascot.src = 'clacoroo.svg';
  mascot.alt = '';
  mascot.setAttribute('aria-hidden', 'true');
  const title   = el('h2', 'tour-title');
  title.id = 'tour-title-el';
  const body    = el('p', 'tour-body');
  const counter = el('div', 'tour-counter');
  const actions = el('div', 'tour-actions');
  const skipBtn = el('button', 'btn btn-sm btn-ghost', 'Salta');
  const backBtn = el('button', 'btn btn-sm btn-ghost', 'Indietro');
  const nextBtn = el('button', 'btn btn-sm btn-primary', 'Avanti');

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') nextBtn.click();
    else if (e.key === 'ArrowLeft')  backBtn.click();
  }
  function close() {
    window.claudeAPI.setState({ onboardingShown: true });
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  function renderStep() {
    const s = TOUR_STEPS[stepIdx];
    title.textContent = s.title;
    body.textContent  = s.body;
    counter.textContent = (stepIdx + 1) + ' / ' + TOUR_STEPS.length;
    backBtn.disabled = stepIdx === 0;
    nextBtn.textContent = stepIdx === TOUR_STEPS.length - 1 ? 'Inizia' : 'Avanti';
    nextBtn.focus();
  }
  skipBtn.addEventListener('click', close);
  backBtn.addEventListener('click', () => { if (stepIdx > 0) { stepIdx--; renderStep(); } });
  nextBtn.addEventListener('click', () => {
    if (stepIdx < TOUR_STEPS.length - 1) { stepIdx++; renderStep(); }
    else close();
  });
  document.addEventListener('keydown', onKey);

  actions.appendChild(skipBtn);
  actions.appendChild(backBtn);
  actions.appendChild(nextBtn);
  modal.appendChild(mascot);
  modal.appendChild(title);
  modal.appendChild(body);
  modal.appendChild(counter);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  renderStep();
}

/* ── COMMAND PALETTE Cmd+K (v1.0.10) ──────────────────────────────────── */
function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = String(target || '').toLowerCase();
  if (!q) return 1;
  const idx = t.indexOf(q);
  if (idx >= 0) return 1000 - idx;
  // subsequence match
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i >= q.length) return 50;
  }
  return 0;
}

function buildPaletteItems() {
  const items = [];
  // Azioni rapide
  const sections = ['dashboard', 'marketplaces', 'plugins', 'skills', 'agents', 'mcp', 'stats', 'config', 'settings'];
  sections.forEach(s => items.push({
    kind: 'action', icon: '→',
    label: 'Vai a ' + s.charAt(0).toUpperCase() + s.slice(1),
    sub: 'sezione',
    run: () => switchToSection(s),
  }));
  items.push({ kind: 'action', icon: '↻', label: 'Ricarica dati', sub: 'azione', run: () => loadData() });
  items.push({ kind: 'action', icon: '⤓', label: 'Esporta snapshot', sub: 'azione', run: async () => {
    const r = await window.claudeAPI.exportSnapshot();
    if (r.success) toast('Snapshot esportato', 'success');
  }});
  items.push({ kind: 'action', icon: '⤒', label: 'Importa snapshot', sub: 'azione', run: () => switchToSection('settings') });
  items.push({ kind: 'action', icon: '📋', label: 'Apri changelog', sub: 'azione', run: () => openChangelogModal() });
  items.push({ kind: 'action', icon: '🎓', label: 'Riavvia onboarding tour', sub: 'azione', run: () => showOnboardingTour() });
  items.push({ kind: 'action', icon: '⤓', label: 'Controlla aggiornamenti', sub: 'azione', run: () => runUpdateCheck(true) });

  // Plugin
  state.plugins.forEach(p => items.push({
    kind: 'plugin', icon: '🧩', label: p.id, sub: p.mkt + (p.blocked ? ' · disattivato' : ''),
    run: () => { switchToSection('plugins'); state.filters.plugins.search = p.id.toLowerCase(); render(); },
  }));
  // Marketplace
  state.mktList.forEach(m => items.push({
    kind: 'marketplace', icon: '🏪', label: m.id, sub: m.plugins.length + ' plugin',
    run: () => switchToSection('marketplaces'),
  }));
  // Skill
  state.plugins.forEach(p => p.skills.forEach(s => items.push({
    kind: 'skill', icon: '⚡', label: s, sub: p.id,
    run: () => openMarkdownPreview(p.fullId, 'skill', s),
  })));
  // Agent
  state.plugins.forEach(p => p.agents.forEach(a => items.push({
    kind: 'agent', icon: '🤖', label: a, sub: p.id,
    run: () => openMarkdownPreview(p.fullId, 'agent', a),
  })));
  return items;
}

function openCommandPalette() {
  // Cross-modal guard: non aprire se è già aperto un altro modale
  if (document.querySelector('.palette-overlay, .tour-overlay, .md-overlay, .changelog-overlay')) return;
  const overlay = el('div', 'palette-overlay');
  const palette = el('div', 'palette');
  palette.setAttribute('role', 'dialog');
  palette.setAttribute('aria-modal', 'true');

  const input = el('input', 'palette-input');
  input.type = 'text';
  input.placeholder = 'Cerca plugin, skill, agent, marketplace o azione…';
  input.setAttribute('aria-label', 'Command palette');

  const list = el('div', 'palette-list');
  const allItems = buildPaletteItems();
  let visible = [];
  let activeIdx = 0;

  function renderList(query) {
    list.textContent = '';
    visible = allItems
      .map(it => ({ ...it, _score: Math.max(fuzzyScore(query, it.label), fuzzyScore(query, it.sub) * 0.5) }))
      .filter(it => it._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 30);
    if (!visible.length) {
      list.appendChild(el('div', 'palette-empty', 'Nessun risultato'));
      return;
    }
    visible.forEach((it, i) => {
      const row = el('div', 'palette-row' + (i === activeIdx ? ' active' : ''));
      row.appendChild(el('span', 'palette-icon', it.icon));
      const txtCol = el('div', 'palette-col');
      txtCol.appendChild(el('div', 'palette-label', it.label));
      txtCol.appendChild(el('div', 'palette-sub', it.sub));
      row.appendChild(txtCol);
      row.appendChild(el('span', 'palette-kind', it.kind));
      row.addEventListener('mouseenter', () => {
        activeIdx = i;
        list.querySelectorAll('.palette-row').forEach((r, j) => r.classList.toggle('active', j === activeIdx));
      });
      row.addEventListener('click', () => { run(); });
      list.appendChild(row);
    });
  }

  function run() {
    const item = visible[activeIdx];
    if (!item) return;
    close();
    setTimeout(() => item.run(), 50);
  }

  function close() {
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, visible.length - 1);
      renderList(input.value);
      list.querySelector('.palette-row.active')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      renderList(input.value);
      list.querySelector('.palette-row.active')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  }

  input.addEventListener('input', () => { activeIdx = 0; renderList(input.value); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey, true);

  palette.appendChild(input);
  palette.appendChild(list);
  overlay.appendChild(palette);
  document.body.appendChild(overlay);

  renderList('');
  input.focus();
}

// Global Cmd+K binding
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.shiftKey) {
    e.preventDefault();
    openCommandPalette();
  }
});

/* ── CHANGELOG MODAL (v1.0.10) ────────────────────────────────────────── */
async function openChangelogModal() {
  if (document.querySelector('.changelog-overlay')) return;
  const versions = await window.claudeAPI.getChangelog();
  if (!versions || !versions.length) {
    toast('Changelog non disponibile', 'error');
    return;
  }

  const overlay = el('div', 'changelog-overlay');
  const modal = el('div', 'changelog-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'changelog-header');
  const title = el('div', 'changelog-title', 'Changelog');
  const closeBtn = el('button', 'md-close', '×');
  closeBtn.setAttribute('aria-label', 'Chiudi');
  header.appendChild(title); header.appendChild(closeBtn);

  const body = el('div', 'changelog-body');

  versions.forEach((v, idx) => {
    const card = el('div', 'changelog-card' + (idx === 0 ? ' current' : ''));
    const cardHead = el('div', 'changelog-card-head');
    const verBadge = el('span', 'changelog-version-badge', 'v' + v.version);
    const dateLbl = el('span', 'changelog-date', v.date);
    if (idx === 0) {
      const currentLbl = el('span', 'changelog-current-tag', 'attuale');
      cardHead.appendChild(verBadge);
      cardHead.appendChild(currentLbl);
    } else {
      cardHead.appendChild(verBadge);
    }
    cardHead.appendChild(dateLbl);
    card.appendChild(cardHead);

    v.sections.forEach(sec => {
      if (sec.title) {
        const secTitle = el('div', 'changelog-section-title', sec.title);
        card.appendChild(secTitle);
      }
      if (sec.notes && sec.notes.length) {
        const note = el('p', 'changelog-note', sec.notes.join(' '));
        card.appendChild(note);
      }
      if (sec.items.length) {
        const ul = el('ul', 'changelog-items');
        sec.items.forEach(item => {
          const li = el('li');
          inlineNodes(item).forEach(n => li.appendChild(n));
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }
    });

    body.appendChild(card);
  });

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  closeBtn.focus();
}

/* ── UPDATE BANNER (v1.0.09) ──────────────────────────────────────────── */
function renderUpdateBanner(info) {
  const existing = document.querySelector('.update-banner');
  if (existing) existing.remove();

  const banner = el('div', 'update-banner');
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  const txt = el('div', 'update-banner-text');
  const dot = el('span', 'update-banner-dot');
  const msg = el('span', null, 'Nuova versione ');
  const ver = el('strong', null, 'v' + info.latest);
  const tail = el('span', null, ' disponibile');
  txt.appendChild(dot); txt.appendChild(msg); txt.appendChild(ver); txt.appendChild(tail);

  const actions = el('div', 'update-banner-actions');
  const openBtn = el('button', 'btn btn-sm btn-primary', 'Apri pagina download');
  openBtn.addEventListener('click', () => {
    window.claudeAPI.openExternal(info.url);
  });
  const laterBtn = el('button', 'btn btn-sm btn-ghost', 'Ricorda più tardi');
  laterBtn.addEventListener('click', () => banner.remove());
  const skipBtn = el('button', 'btn btn-sm btn-ghost', 'Salta questa versione');
  skipBtn.addEventListener('click', () => {
    window.claudeAPI.setState({ skippedVersion: info.latest });
    banner.remove();
  });
  actions.appendChild(openBtn);
  actions.appendChild(laterBtn);
  actions.appendChild(skipBtn);

  banner.appendChild(txt);
  banner.appendChild(actions);

  // Insert sotto la topbar
  const topbar = document.querySelector('.topbar');
  if (topbar) topbar.insertAdjacentElement('afterend', banner);
}

/* ── STATUS ───────────────────────────────────────────────────────────── */
function setStatus(type, label) {
  const dot = $('status-dot');
  const lbl = $('status-label');
  if (dot) { dot.className = 'status-dot ' + type; }
  if (lbl) lbl.textContent = label;
}

/* ── TOAST ────────────────────────────────────────────────────────────── */
function toast(msg, type) {
  const container = $('toast-container');
  const t = el('div', 'toast t-' + (type || 'info'), msg);
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 320);
  }, 3200);
}

/* ── START ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
