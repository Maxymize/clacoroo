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
};

/* ── DOM REFS ─────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── INIT ─────────────────────────────────────────────────────────────── */
async function init() {
  setupNav();
  await loadData();
  window.claudeAPI.onConfigChanged(() => {
    toast('Configurazione aggiornata — ricarico…', 'info');
    loadData();
  });
  // B2 — Native menu → switch section via IPC (Cmd+1..6, Cmd+,)
  window.claudeAPI.onSwitchSection(name => switchToSection(name));
  // B2 — Cmd+R refresh dal menu nativo
  window.claudeAPI.onForceRefresh(() => loadData());
  // First-run onboarding (idea #7)
  const appState = await window.claudeAPI.getState();
  if (appState.lastSection && appState.lastSection !== 'dashboard') {
    switchToSection(appState.lastSection);
  }
  if (!appState.onboardingShown) showOnboardingTour();
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
  setStatus('ok', state.plugins.length + ' plugin');
}

function processData() {
  const raw     = state.rawData;
  const blocked = new Set((raw.blocklist.plugins || []).map(b => b.plugin));
  const catalog = raw.catalog.plugins || {};

  state.plugins = (raw.installed.plugins || []).map(fullId => {
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
      tokensAlways: tokenInfo?.always_on  || 0,
      tokensInvoke: tokenInfo?.on_invoke  || 0,
    };
  });

  // Marketplaces
  const mktMap = raw.marketplaces || {};
  state.mktList = Object.entries(mktMap).map(([id, cfg]) => {
    const mktPlugins = state.plugins.filter(p => p.mkt === id);
    return {
      id,
      repo:        cfg._repo || '',
      autoUpdate:  cfg.autoUpdate  || false,
      lastUpdated: cfg.lastUpdated || '',
      plugins:     mktPlugins,
    };
  }).sort((a, b) => b.plugins.length - a.plugins.length);

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
    settings:    'Impostazioni',
  };
  $('topbar-title').textContent = sectionTitles[state.section] || '';

  // Topbar actions: bottone refresh sempre visibile
  const actions = $('topbar-actions');
  actions.textContent = '';
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
  const active   = state.plugins.filter(p => !p.blocked);
  const disabled = state.plugins.filter(p => p.blocked);
  const allSkills = state.plugins.flatMap(p => p.skills.map(s => ({ skill: s, plugin: p.fullId })));
  const allAgents = state.plugins.flatMap(p => p.agents.map(a => ({ agent: a, plugin: p.fullId })));
  const totalTokens = state.plugins.reduce((s, p) => s + p.tokensAlways, 0);

  const wrap = el('div');

  // Health summary (idea #3): count skill+agent con status err/warn
  let healthErr = 0, healthWarn = 0;
  state.plugins.forEach(p => {
    Object.values(p.skillHealth).forEach(h => { if (h.status === 'err') healthErr++; else if (h.status === 'warn') healthWarn++; });
    Object.values(p.agentHealth).forEach(h => { if (h.status === 'err') healthErr++; else if (h.status === 'warn') healthWarn++; });
  });

  const kpiGrid = el('div', 'kpi-grid');
  const kpis = [
    { num: active.length,      label: 'Plugin attivi',     color: '#788c5d' },  // Anthropic green
    { num: disabled.length,    label: 'Disattivati',       color: '#ef4444' },
    { num: state.mktList.length, label: 'Marketplace',     color: '#d97757' },  // CLACOROO orange
    { num: allSkills.length,   label: 'Skill totali',      color: '#e89478' },  // accent2 chiaro
    { num: allAgents.length,   label: 'Agent totali',      color: '#f97316' },
    { num: totalTokens > 0 ? (Math.round(totalTokens / 100) / 10) + 'K' : '—',
      label: 'Token always-on',  color: '#6a9bcc' },                            // Anthropic blue
    { num: healthErr + healthWarn,
      label: healthErr ? 'Health issues' : (healthWarn ? 'Warning' : 'Health'),
      color: healthErr ? '#ef4444' : (healthWarn ? '#f59e0b' : '#788c5d') },
  ];
  kpis.forEach(k => {
    const card = el('div', 'kpi-card');
    card.style.setProperty('--kpi-color', k.color);
    const num = el('div', 'kpi-num', String(k.num));
    const lbl = el('div', 'kpi-label', k.label);
    card.appendChild(num); card.appendChild(lbl);
    kpiGrid.appendChild(card);
  });
  wrap.appendChild(kpiGrid);

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

/* ── PLUGINS ──────────────────────────────────────────────────────────── */
function renderPlugins() {
  const f = state.filters.plugins;

  const wrap = el('div');

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

function buildPluginCard(p) {
  const col = mktColor(p.mkt);
  const card = el('div', 'plugin-card' + (p.blocked ? ' blocked' : ''));
  card.style.setProperty('--mkt-color', col);

  // BODY
  const body = el('div', 'pc-body');

  const top = el('div', 'pc-top');
  const leftCol = el('div');
  const idEl  = el('div', 'pc-id', p.id);
  const verEl = el('div', 'pc-ver', 'v' + p.version);
  leftCol.appendChild(idEl); leftCol.appendChild(verEl);

  const pill = el('span', 'pc-mkt-pill', p.mkt);
  pill.style.background = col + '28';
  pill.style.color = col;
  top.appendChild(leftCol); top.appendChild(pill);
  body.appendChild(top);

  if (p.description) {
    const desc = el('div', 'pc-desc', p.description);
    body.appendChild(desc);
  }

  // BADGES
  const badges = el('div', 'pc-badges');
  function addBadge(txt, cls) {
    const b = el('span', 'badge ' + cls, txt);
    badges.appendChild(b);
  }
  if (p.skills.length)  addBadge(p.skills.length + ' skill', 'b-skill');
  if (p.agents.length)  addBadge(p.agents.length + ' agent', 'b-agent');
  if (p.hasMcp)         addBadge('MCP', 'b-mcp');
  if (p.hasHooks)       addBadge('Hook', 'b-hook');
  if (p.tokensAlways)   addBadge(p.tokensAlways + ' tok', 'b-tokens');
  if (p.blocked)        addBadge('DISATTIVATO', 'b-blocked');
  body.appendChild(badges);
  card.appendChild(body);

  // FOOTER
  const footer = el('div', 'pc-footer');

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

  // Apri nel Finder (idea #2)
  const finderBtn = el('button', 'btn btn-sm btn-ghost btn-icon-text', '📁');
  finderBtn.title = 'Apri sorgente nel Finder';
  finderBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openPluginPath(p.fullId);
    if (!r.success) toast('Errore apertura Finder: ' + r.error, 'error');
  });

  // Apri in VS Code (idea #2)
  const codeBtn = el('button', 'btn btn-sm btn-ghost btn-icon-text', '📝');
  codeBtn.title = 'Apri sorgente in VS Code';
  codeBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openInEditor(p.fullId);
    if (!r.success) toast('Errore apertura VS Code: ' + r.error, 'error');
  });

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
function renderMarketplaces() {
  const wrap = el('div');

  const hdr = el('div', 'section-header');
  hdr.appendChild(el('span', 'section-count', state.mktList.length + ' marketplace configurati'));
  wrap.appendChild(hdr);

  const grid = el('div', 'mkt-cards-grid');

  state.mktList.forEach(m => {
    const col  = mktColor(m.id);
    const card = el('div', 'mkt-card' + (m.plugins.length === 0 ? ' inactive' : ''));
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
    const cnt  = el('span', 'mkt-card-count', String(m.plugins.length));
    const cntL = el('span', 'mkt-card-count-label', ' plugin');
    cnt.style.color = col;
    const autoBadge = el('span', 'badge ' + (m.autoUpdate ? 'b-auto' : 'b-manual'),
      m.autoUpdate ? 'auto-update' : 'manuale');
    meta.appendChild(cnt); meta.appendChild(cntL); meta.appendChild(autoBadge);
    body.appendChild(meta);

    if (m.lastUpdated) {
      const d = new Date(m.lastUpdated);
      const note = el('div', 'mkt-card-note', 'Ultimo aggiornamento: ' + d.toLocaleDateString('it-IT'));
      body.appendChild(note);
    }

    card.appendChild(body);

    // EXPAND (se ci sono plugin)
    if (m.plugins.length > 0) {
      const toggleBtn = el('button', 'mkt-card-toggle-btn');
      const arrow = el('span', 'arrow', '▶');
      toggleBtn.appendChild(arrow);
      toggleBtn.appendChild(document.createTextNode(' PLUGIN (' + m.plugins.length + ')'));

      const detail = el('div', 'mkt-card-detail');
      m.plugins.forEach(p => {
        const row = el('div', 'mkt-plugin-row');
        row.appendChild(el('span', 'mkt-plugin-row-id', p.id));
        const badges = el('span');
        badges.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;';
        if (p.skills.length) { const b = el('span','badge b-skill', p.skills.length+' skill'); badges.appendChild(b); }
        if (p.agents.length) { const b = el('span','badge b-agent', p.agents.length+' agent'); badges.appendChild(b); }
        if (p.hasMcp)  { badges.appendChild(el('span','badge b-mcp','MCP')); }
        if (p.blocked) { badges.appendChild(el('span','badge b-blocked','off')); }
        row.appendChild(badges);
        if (p.description) row.appendChild(el('span', 'mkt-plugin-row-desc', p.description.slice(0, 55)));
        detail.appendChild(row);
      });

      toggleBtn.addEventListener('click', () => {
        const open = detail.classList.toggle('open');
        toggleBtn.classList.toggle('open', open);
      });

      card.appendChild(toggleBtn);
      card.appendChild(detail);
    }

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
  const all = state.plugins.flatMap(p =>
    p.skills.map(s => ({ name: s, plugin: p.id, mkt: p.mkt, blocked: p.blocked, health: p.skillHealth[s], fullId: p.fullId }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'skills', item => {
    const chip = el('div', 'skill-chip clickable' + (item.blocked ? ' blocked' : ''));
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:' + mktColor(item.mkt);
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    appendHealthBadge(chip, item.health);
    chip.addEventListener('click', () => openMarkdownPreview(item.fullId, 'skill', item.name));
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt, 'Cerca skill…', 'skill-grid');
}

/* ── AGENTS ───────────────────────────────────────────────────────────── */
function renderAgents() {
  const all = state.plugins.flatMap(p =>
    p.agents.map(a => ({ name: a, plugin: p.id, mkt: p.mkt, health: p.agentHealth[a], fullId: p.fullId }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'agents', item => {
    const chip = el('div', 'skill-chip clickable');
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:#f97316';
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    appendHealthBadge(chip, item.health);
    chip.addEventListener('click', () => openMarkdownPreview(item.fullId, 'agent', item.name));
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt, 'Cerca agent…', 'skill-grid');
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

  const g2 = group('Statistiche');
  row(g2, 'Plugin installati', null, String(state.plugins.length));
  row(g2, 'Plugin disattivati', null, String(state.plugins.filter(p => p.blocked).length));
  row(g2, 'Marketplace', null, String(state.mktList.length));
  row(g2, 'Skill totali', null, String(state.plugins.reduce((s, p) => s + p.skills.length, 0)));
  row(g2, 'Agent totali', null, String(state.plugins.reduce((s, p) => s + p.agents.length, 0)));

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
  const browseBtn = el('button', 'btn btn-sm btn-ghost', '📂 Sfoglia');
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

  // Backup snapshot (idea #5)
  const g6 = group('Backup snapshot');
  const snapRow = el('div', 'settings-row');
  const snapLeft = el('div');
  snapLeft.appendChild(el('div', 'settings-row-label', 'Snapshot configurazione'));
  snapLeft.appendChild(el('div', 'settings-row-desc', 'Esporta o importa un file .clacoroo (marketplaces + plugin + blocklist). Utile per backup o migrazione su altro Mac.'));
  snapRow.appendChild(snapLeft);
  const snapBtns = el('div');
  snapBtns.style.cssText = 'display:flex;gap:6px;';
  const exportBtn = el('button', 'btn btn-sm btn-ghost', '⤓ Esporta');
  exportBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.exportSnapshot();
    if (r.success) toast('Snapshot esportato in ' + r.path, 'success');
    else if (r.error !== 'Annullato') toast('Errore export: ' + r.error, 'error');
  });
  const importBtn = el('button', 'btn btn-sm btn-primary', '⤒ Importa');
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
    importBtn.textContent = '⤒ Importa';
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

  const g3 = group('Informazioni');
  row(g3, 'Nome app', null, 'CLACOROO');
  row(g3, 'Versione', null, '1.0.08');
  row(g3, 'Piattaforma', null, d.platform);

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
