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
    btn.addEventListener('click', () => {
      state.section = btn.dataset.section;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
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
  $('topbar-actions').textContent = '';

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

/* ── DASHBOARD ────────────────────────────────────────────────────────── */
function renderDashboard() {
  const active   = state.plugins.filter(p => !p.blocked);
  const disabled = state.plugins.filter(p => p.blocked);
  const allSkills = state.plugins.flatMap(p => p.skills.map(s => ({ skill: s, plugin: p.fullId })));
  const allAgents = state.plugins.flatMap(p => p.agents.map(a => ({ agent: a, plugin: p.fullId })));
  const totalTokens = state.plugins.reduce((s, p) => s + p.tokensAlways, 0);

  const wrap = el('div');

  const kpiGrid = el('div', 'kpi-grid');
  const kpis = [
    { num: active.length,      label: 'Plugin attivi',     color: '#788c5d' },  // Anthropic green
    { num: disabled.length,    label: 'Disattivati',       color: '#ef4444' },
    { num: state.mktList.length, label: 'Marketplace',     color: '#d97757' },  // CLACOROO orange
    { num: allSkills.length,   label: 'Skill totali',      color: '#e89478' },  // accent2 chiaro
    { num: allAgents.length,   label: 'Agent totali',      color: '#f97316' },
    { num: totalTokens > 0 ? (Math.round(totalTokens / 100) / 10) + 'K' : '—',
      label: 'Token always-on',  color: '#6a9bcc' },                            // Anthropic blue
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

  setContent(wrap);
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
      toast((action === 'enable' ? '✓ Attivato: ' : '✗ Disattivato: ') + p.id, action === 'enable' ? 'success' : 'warn');
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
    if (r.success) toast('Aggiornato: ' + p.id, 'success');
    else toast('Errore aggiornamento: ' + r.error, 'error');
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
    p.skills.map(s => ({ name: s, plugin: p.id, mkt: p.mkt, blocked: p.blocked }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'skills', item => {
    const chip = el('div', 'skill-chip' + (item.blocked ? ' blocked' : ''));
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:' + mktColor(item.mkt);
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt, 'Cerca skill…', 'skill-grid');
}

/* ── AGENTS ───────────────────────────────────────────────────────────── */
function renderAgents() {
  const all = state.plugins.flatMap(p =>
    p.agents.map(a => ({ name: a, plugin: p.id, mkt: p.mkt }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  renderListSection(all, 'agents', item => {
    const chip = el('div', 'skill-chip');
    chip.style.borderLeftColor = mktColor(item.mkt);
    const dot = el('span');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:#f97316';
    chip.appendChild(dot);
    chip.appendChild(el('span', 'skill-chip-name', item.name));
    chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
    return chip;
  }, item => item.name + ' ' + item.plugin + ' ' + item.mkt, 'Cerca agent…', 'skill-grid');
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

  const g3 = group('Informazioni');
  row(g3, 'Nome app', null, 'CLACOROO');
  row(g3, 'Versione', null, '1.0.04');
  row(g3, 'Piattaforma', null, d.platform);

  setContent(wrap);
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
