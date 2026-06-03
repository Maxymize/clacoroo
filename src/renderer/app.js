/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE <info@maxymizebusiness.com>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License v3 or later.
 * Full license text: see LICENSE file or https://www.gnu.org/licenses/agpl-3.0
 */
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

/* ── ICONE LUCIDE (v1.0.95 — no emoji as icons) ────────────────────────
 * Set di icone Lucide (lucide.dev, MIT) usate inline al posto di emoji
 * (🗑/▶/↗/⎘/⚠/etc). Coerenza visuale con la sidebar (anche lei Lucide
 * dalla v1.0.84). viewBox 24×24, stile stroke, ereditano currentColor.
 *
 * Per aggiungere un'icona: copia il path SVG da lucide.dev e mettilo nel
 * dictionary qui sotto. Renderer la usa via `icon('nome')` che ritorna
 * un nodo <svg> inline (cssClass `inline-icon`).
 */
const LUCIDE_ICONS = {
  'plus':        '<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>',
  'x':           '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'check':       '<path d="M20 6 9 17l-5-5"/>',
  'trash-2':     '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'play':        '<polygon points="6 3 20 12 6 21 6 3"/>',
  'copy':        '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'external-link':'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'search':      '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'folder-open': '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  'triangle-alert':'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'rotate-cw':   '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  'circle-check':'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'circle-x':    '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'circle-alert':'<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  'ban':         '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  'eye':         '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  'terminal':    '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  'plug':        '<path d="M9 2v6"/><path d="M15 2v6"/><path d="M12 17v3"/><path d="M5 8h14"/><path d="M6 11V8h12v3a6 6 0 0 1-12 0Z"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'chevron-up':  '<path d="m18 15-6-6-6 6"/>',
  // v1.0.96 — Pack M: view switcher cards/compatta
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  'list':        '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  // v1.0.99 — Editor markdown inline (skill/agent)
  'pencil':      '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  // v1.0.102 — Migrate da svgIcon legacy a Lucide
  'code':        '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  'upload':      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  // v1.0.108 — Icone Lucide per i section title della Dashboard (stesso set della sidebar)
  'store':       '<path d="M2 7h20"/><path d="M4 4v3"/><path d="M20 4v3"/><path d="M5 22V11"/><path d="M19 22V11"/><path d="M5 11h14"/><path d="M9 22v-6h6v6"/>',
  'puzzle':      '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>',
  'sparkles':    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  'bot':         '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  'plug-2':      '<path d="M9 2v6"/><path d="M15 2v6"/><path d="M12 17v3"/><path d="M5 8h14"/><path d="M6 11V8h12v3a6 6 0 0 1-12 0Z"/>',
  'anchor':      '<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>',
  'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'gauge':       '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
};

/**
 * Ritorna un nodo <svg> Lucide inline. Argomento `name` = chiave di
 * LUCIDE_ICONS. Classe CSS `.inline-icon` per dimensione/colore standard.
 * Per usarla in un bottone: `btn.appendChild(icon('trash-2'))` + testo.
 */
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.classList.add('inline-icon');
  // I path Lucide sono semplici: parse via innerHTML SAFE (markup statico
  // controllato da noi, niente input utente, vedi LUCIDE_ICONS sopra).
  svg.innerHTML = LUCIDE_ICONS[name] || '';
  return svg;
}

/**
 * Helper per creare un button con icona Lucide + testo. Sostituisce il
 * pattern `el('button', cls, '🗑 Rimuovi')` con `btnWithIcon(cls, 'trash-2', 'Rimuovi')`
 * — coerente con il design system v1.0.95 (no emoji).
 */
function btnWithIcon(cls, iconName, label) {
  const btn = el('button', cls);
  btn.appendChild(icon(iconName));
  btn.appendChild(document.createTextNode(label));
  return btn;
}

/**
 * Helper per "span con icona + testo" (badge, status, ecc.).
 */
function spanWithIcon(cls, iconName, label) {
  const span = el('span', cls);
  span.appendChild(icon(iconName));
  span.appendChild(document.createTextNode(label));
  return span;
}

/**
 * v1.0.108 — Helper sectionTitle(text, iconName): costruisce un
 * `<div class="list-section-title">` con icona Lucide a sinistra + testo.
 * Standardizza tutti i title di sezione Dashboard (e altre pagine).
 */
function sectionTitle(text, iconName) {
  const t = el('div', 'list-section-title');
  if (iconName) t.appendChild(icon(iconName));
  t.appendChild(document.createTextNode(text));
  return t;
}

// v1.1.8 — Empty state "full page" con mascotte CLACOROO. Usato quando una
// sezione (Plugin/Skill/Agent/MCP/Hooks/Marketplace) è completamente vuota.
// `cta` opzionale: { label, onClick } per un bottone arancione che porta
// l'utente alla soluzione (es. "Vai a Marketplace" da sezione Plugin vuota).
function buildMascotEmpty(opts) {
  const wrap = el('div', 'empty-mascot');
  const img = el('img', 'empty-mascot-img');
  img.src = 'clacoroo.svg';
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  wrap.appendChild(img);
  wrap.appendChild(el('h2', 'empty-mascot-title', opts.title));
  wrap.appendChild(el('p', 'empty-mascot-msg', opts.message));
  if (opts.cta) {
    const btn = el('button', 'btn btn-primary empty-mascot-cta', opts.cta.label);
    btn.addEventListener('click', opts.cta.onClick);
    wrap.appendChild(btn);
  }
  return wrap;
}

/* ── i18n ──────────────────────────────────────────────────────────────── */
// `window.LOCALES` popolato dai <script> locales/<lang>.js prima di app.js.
// `activeLang` = runtime; `state.locale` = scelta utente persistita (vuota
// finché l'utente non seleziona dal dropdown, così l'auto-detect OS può
// seguire i cambi di lingua di sistema fra un avvio e l'altro).
const LOCALES = window.LOCALES || {};
let activeLang = 'it';

function lookupDeep(obj, key) {
  if (!obj || typeof key !== 'string') return undefined;
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return undefined;
  }
  return cur;
}

function t(key, vars) {
  let s = lookupDeep(LOCALES[activeLang], key);
  if (s === undefined) s = lookupDeep(LOCALES.en, key);
  if (typeof s !== 'string') return key;
  if (vars && s.indexOf('{') !== -1) {
    s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
  }
  return s;
}

function resolveLocale(raw) {
  if (typeof raw !== 'string' || !raw) return 'en';
  const pref = raw.toLowerCase().split(/[-_]/)[0];
  return LOCALES[pref] ? pref : 'en';
}

function setLocale(lang) {
  if (LOCALES[lang]) activeLang = lang;
}

// Risolve la lingua da usare al boot: scelta utente persistita prevale
// sull'auto-detect OS; se mancano entrambi, fallback 'en'. `appState` è
// passato per evitare un secondo getState() IPC roundtrip.
async function initLocale(appState) {
  if (appState && typeof appState.locale === 'string' && LOCALES[appState.locale]) {
    state.locale = appState.locale;
    setLocale(appState.locale);
    return;
  }
  try {
    const sysRes = await window.claudeAPI.getSystemLocale();
    const raw = (sysRes && (sysRes.locale || sysRes.systemLocale)) || '';
    setLocale(resolveLocale(raw));
  } catch {
    setLocale('en');
  }
}

async function changeLocale(lang) {
  if (!LOCALES[lang]) return;
  state.locale = lang;
  setLocale(lang);
  await window.claudeAPI.setState({ locale: lang });
  applyStaticI18n();
  render();
}

// "Usa lingua sistema": reset persistito + switch live alla lingua rilevata.
// Se OS è su una lingua non supportata (es. fr/es/de), fallback su EN come
// per il boot. Ritorna info per toast: lingua applicata + se è fallback.
async function applySystemLocale() {
  state.locale = '';
  await window.claudeAPI.setState({ locale: '' });
  let rawOsLang = '';
  try {
    const sysRes = await window.claudeAPI.getSystemLocale();
    rawOsLang = (sysRes && (sysRes.locale || sysRes.systemLocale)) || '';
  } catch {}
  const next = resolveLocale(rawOsLang);
  const osPrefix = (rawOsLang || '').toLowerCase().split(/[-_]/)[0];
  const isFallback = !!osPrefix && !LOCALES[osPrefix];
  setLocale(next);
  applyStaticI18n();
  render();
  return { applied: next, detected: osPrefix || 'unknown', isFallback };
}

// Restituisce il nome localizzato di una lingua (es. 'it' → "Italiano" in IT,
// "Italian" in EN). Usa Intl.DisplayNames (Chromium 130+, Electron 36+).
// Fallback al codice lingua se l'API non disponibile.
function languageDisplayName(langCode) {
  try {
    return new Intl.DisplayNames([activeLang], { type: 'language' }).of(langCode);
  } catch {
    return langCode;
  }
}

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
    hooks:        { search: '', event: 'all', scope: 'all', plugin: 'all' },
  },
  // v1.0.55 — ordinamento marketplace. Valori:
  //   'default'        plugin disponibili desc, poi installati desc
  //   'added-desc'     aggiunti di recente prima
  //   'added-asc'      aggiunti meno di recente prima
  //   'updated-desc'   aggiornati di recente prima
  //   'updated-asc'    aggiornati meno di recente prima (utile per scoprire stale)
  mktSort: 'default',
  // v1.0.82 — Pack L: ordinamento Plugin/Skill/Agent/MCP
  pluginSort: 'name-asc',
  skillSort:  'name-asc',
  agentSort:  'name-asc',
  mcpSort:    'name-asc',
  // v1.0.83 — Pack K: ordinamento sezione Hooks
  hookSort:   'event-asc',
  // v1.0.96 — Pack M: vista cards (default) vs compatta (chip) switchabile
  // per ogni sezione, persistita in state.json. Le sezioni che oggi hanno
  // solo una delle 2 viste ottengono l'altra (Skill/Agent cards, MCP/Hooks/
  // Plugin/Marketplace compact). Switch tramite 2 iconcine nel topbar.
  viewMode: {
    plugins:      'cards',
    marketplaces: 'cards',
    skills:       'cards',
    agents:       'cards',
    mcp:          'cards',
    hooks:        'cards',
  },
  // v1.0.100 — Tracking file .md modificati localmente dall'utente via editor
  // inline (showMarkdownModal Modifica/Salva). Persisted in state.json.
  // Permette di mostrare un badge "modificato" sulle card skill/agent.
  // Chiave: `kind:fullId:name` (es. "skill:claude-mem@thedotmack:mcp-search").
  // Value: timestamp ISO ultima modifica.
  modifiedFiles: {},
  // v1.0.109 — Modello selezionato per il token budget visualizzato
  // ('sonnet' | 'opus'). Default Sonnet 4.6. Persisted in state.json.
  tokenModel: 'sonnet',
  // Scelta utente esplicita. Vuota = auto-detect OS ad ogni avvio.
  locale: '',
  // v1.1.9 — Notifiche soglia quota Claude (system-level). Default: ON.
  // false = opt-out esplicito. Restorato in init() da appState.
  notifyQuota: true,
  // Dedup notifiche quota: { fiveHour: {level, at}, sevenDay: {...}, ... }
  quotaLastNotified: {},
  // v1.1.24 — frequenza polling quota in ms (0 = Manuale). Default 10 min.
  quotaPollMs: 600000,
};

const MKT_SORTERS = {
  'default':      (a, b) => b.available - a.available || b.installed - a.installed,
  'added-desc':   (a, b) => dateMs(b.addedAt) - dateMs(a.addedAt),
  'added-asc':    (a, b) => dateMs(a.addedAt) - dateMs(b.addedAt),
  'updated-desc': (a, b) => dateMs(b.lastUpdated) - dateMs(a.lastUpdated),
  'updated-asc':  (a, b) => dateMs(a.lastUpdated) - dateMs(b.lastUpdated),
};
function dateMs(s) { return s ? Date.parse(s) || 0 : 0; }
// Backwards-compat alias (era usato come `mktDateValue`)
function mktDateValue(s) { return dateMs(s); }
function applyMktSort() {
  const sorter = MKT_SORTERS[state.mktSort] || MKT_SORTERS['default'];
  state.mktList.sort(sorter);
}

/* ── v1.0.82 — Pack L: ordinamento universale per Plugin/Skill/Agent/MCP ── */
const PLUGIN_SORTERS = {
  'name-asc':       (a, b) => (a.id || '').localeCompare(b.id || ''),
  'name-desc':      (a, b) => (b.id || '').localeCompare(a.id || ''),
  'installed-desc': (a, b) => dateMs(b.installedAt) - dateMs(a.installedAt),
  'installed-asc':  (a, b) => dateMs(a.installedAt) - dateMs(b.installedAt),
};
const NAME_SORTERS = {  // skill, agent (name-only)
  'name-asc':  (a, b) => (a.name || '').localeCompare(b.name || ''),
  'name-desc': (a, b) => (b.name || '').localeCompare(a.name || ''),
};
const MCP_STATUS_ORDER = { connected: 0, needsAuth: 1, error: 2, unknown: 3 };
const MCP_SORTERS = {
  'name-asc':   (a, b) => (a.name || '').localeCompare(b.name || ''),
  'name-desc':  (a, b) => (b.name || '').localeCompare(a.name || ''),
  'status':     (a, b) => (MCP_STATUS_ORDER[a.status] ?? 9) - (MCP_STATUS_ORDER[b.status] ?? 9)
                          || (a.name || '').localeCompare(b.name || ''),
};
// v1.0.83 — Pack K: sorters per la sezione Hooks
const HOOK_SORTERS = {
  'event-asc':   (a, b) => (a.event   || '').localeCompare(b.event || '')
                          || (a.pluginId || '').localeCompare(b.pluginId || ''),
  'event-desc':  (a, b) => (b.event   || '').localeCompare(a.event || '')
                          || (a.pluginId || '').localeCompare(b.pluginId || ''),
  'plugin-asc':  (a, b) => (a.pluginId || '').localeCompare(b.pluginId || '')
                          || (a.event || '').localeCompare(b.event || ''),
  'plugin-desc': (a, b) => (b.pluginId || '').localeCompare(a.pluginId || '')
                          || (a.event || '').localeCompare(b.event || ''),
};

// v1.0.96 — Pack M: due bottoni icona toggle per scegliere vista cards
// (default) o compatta. Persiste in state.json via setState. Posizionato
// nel section-header accanto al sort dropdown. Pattern coerente: il
// bottone attivo ha bordo accent2.
function renderViewSwitcher(section, currentMode, onChange) {
  const wrap = el('div', 'view-switcher');
  const modes = [
    { key: 'cards',   iconName: 'layout-grid', titleKey: 'view.cards' },
    { key: 'compact', iconName: 'list',        titleKey: 'view.compact' },
  ];
  modes.forEach(m => {
    const btn = el('button', 'view-switcher-btn' + (currentMode === m.key ? ' active' : ''));
    btn.appendChild(icon(m.iconName));
    const title = t(m.titleKey);
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.addEventListener('click', () => {
      if (m.key === currentMode) return;
      onChange(m.key);
    });
    wrap.appendChild(btn);
  });
  return wrap;
}

// Helper: switch del view mode di una sezione + persist + re-render
async function setViewMode(section, mode) {
  // Guard: no-op se invariato (evita render + setState inutili)
  if (state.viewMode[section] === mode) return;
  state.viewMode[section] = mode;
  await window.claudeAPI.setState({ viewMode: state.viewMode });
  render();
}

// Helper: chiave canonical per state.modifiedFiles (era reinventata in 2+ siti)
function modifiedFileKey(kind, fullId, name) { return kind + ':' + fullId + ':' + name; }

// Helper: aggiunge un badge "modificato" a un node se l'item è stato editato
// localmente. Estratto per evitare duplicazione fra buildSkillAgentCard e Chip.
function appendModifiedBadge(parent, item, kind, mode) {
  if (!isLocallyModified(item, kind)) return;
  const ts = state.modifiedFiles[modifiedFileKey(kind, item.fullId, item.name)];
  const tsStr = ts ? new Date(ts).toLocaleString('it-IT') : '';
  if (mode === 'chip') {
    const modIcon = icon('pencil');
    modIcon.classList.add('chip-modified-icon');
    modIcon.style.cssText = 'width:11px;height:11px;color:#fbbf24;margin-left:4px;';
    if (tsStr) modIcon.setAttribute('aria-label', t('plugin.modifiedLocal', { when: tsStr }));
    parent.appendChild(modIcon);
    return;
  }
  const modBadge = el('span', 'browse-card-modified');
  modBadge.appendChild(icon('pencil'));
  modBadge.appendChild(document.createTextNode(t('badge.modified')));
  if (tsStr) modBadge.title = t('plugin.modifiedLocal', { when: tsStr })
    + t('plugin.modifiedNote', { id: item.fullId });
  parent.appendChild(modBadge);
}

// Renderizza una <select> di ordinamento standardizzata. opts: [{key,labelKey},...]
function renderSortDropdown(currentKey, opts, onChange) {
  const wrap = el('div', 'sort-dropdown-wrap');
  wrap.appendChild(el('span', 'sort-dropdown-label', t('sort.label')));
  const sel = el('select', 'sort-dropdown');
  opts.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.key;
    opt.textContent = t(o.labelKey);
    if (o.key === currentKey) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => onChange(sel.value));
  wrap.appendChild(sel);
  return wrap;
}

// Opzioni standard per sezione. `labelKey` risolto in renderSortDropdown
// via t() così le option seguono la lingua corrente (no module-load lock-in).
const SORT_OPTIONS = {
  plugin: [
    { key: 'name-asc',       labelKey: 'sort.nameAsc' },
    { key: 'name-desc',      labelKey: 'sort.nameDesc' },
    { key: 'installed-desc', labelKey: 'sort.installedDesc' },
    { key: 'installed-asc',  labelKey: 'sort.installedAsc' },
  ],
  skill: [
    { key: 'name-asc',  labelKey: 'sort.nameAsc' },
    { key: 'name-desc', labelKey: 'sort.nameDesc' },
  ],
  agent: [
    { key: 'name-asc',  labelKey: 'sort.nameAsc' },
    { key: 'name-desc', labelKey: 'sort.nameDesc' },
  ],
  mcp: [
    { key: 'name-asc',  labelKey: 'sort.nameAsc' },
    { key: 'name-desc', labelKey: 'sort.nameDesc' },
    { key: 'status',    labelKey: 'sort.statusFirst' },
  ],
  hook: [
    { key: 'event-asc',   labelKey: 'sort.eventAsc' },
    { key: 'event-desc',  labelKey: 'sort.eventDesc' },
    { key: 'plugin-asc',  labelKey: 'sort.pluginAsc' },
    { key: 'plugin-desc', labelKey: 'sort.pluginDesc' },
  ],
};

// v1.0.83 — Palette eventi hook (mappa standard Claude Code → colore badge).
// Eventi non noti restano grigio neutro.
const HOOK_EVENT_COLORS = {
  SessionStart:     '#3b82f6',
  SessionEnd:       '#2563eb',
  UserPromptSubmit: '#f59e0b',
  PreToolUse:       '#a78bfa',
  PostToolUse:      '#8b5cf6',
  Stop:             '#ef4444',
  SubagentStop:     '#dc2626',
  PreCompact:       '#eab308',
  Notification:     '#06b6d4',
  Setup:            '#22c55e',
};
function hookEventColor(name) {
  return HOOK_EVENT_COLORS[name] || '#71717a';
}

// v1.0.101 — Tooltip esplicativo per ogni event type Claude Code: passando
// il mouse sopra il badge sulla card hook, l'utente legge cosa fa l'event,
// quando viene triggerato, e cosa tipicamente fanno gli hook che vi si
// agganciano. Sostituisce il vecchio title=event name che era ridondante.
const HOOK_EVENT_DOCS = {
  SessionStart:
    'Triggera all\'avvio di una sessione `claude` (startup, --continue, --resume, /clear).\n\n' +
    'Tipicamente usato per: inizializzare contesto, iniettare istruzioni, ' +
    'caricare memoria persistente (es. claude-mem), eseguire setup checks.',
  SessionEnd:
    'Triggera alla fine della sessione `claude` (uscita normale o forzata).\n\n' +
    'Tipicamente usato per: cleanup, persistenza stato, log finale di sessione.',
  Stop:
    'Triggera quando Claude finisce di rispondere a un prompt utente.\n\n' +
    'Tipicamente usato per: riassumere/registrare la risposta, salvare ' +
    'observations (es. claude-mem), trigger di azioni post-completion.',
  SubagentStop:
    'Come `Stop`, ma per i subagent (Task tool con agent specifico).\n\n' +
    'Tipicamente usato per: log dedicato dei subagent, analisi separata ' +
    'rispetto alla main conversation.',
  UserPromptSubmit:
    'Triggera quando l\'utente invia un messaggio, PRIMA che Claude lo processi.\n\n' +
    'Tipicamente usato per: iniettare contesto, applicare guardrail, ' +
    'preparare la memoria della sessione (es. claude-mem session-init).',
  PreToolUse:
    'Triggera PRIMA che Claude usi un tool. Il `matcher` filtra quali tool ' +
    'attivano il hook (regex, es. `Edit|Write|MultiEdit`, oppure `*` per tutti).\n\n' +
    'Tipicamente usato per: pre-validation (es. security-guidance prima di edit), ' +
    'pre-fetch context, log del tool che sta per essere invocato.',
  PostToolUse:
    'Triggera DOPO che Claude ha usato un tool. Il `matcher` filtra quali tool.\n\n' +
    'Tipicamente usato per: registrare observations su cosa Claude ha fatto ' +
    '(es. claude-mem PostToolUse `*` traccia ogni azione), post-validation.',
  PreCompact:
    'Triggera prima che Claude compatti il contesto (quando si avvicina al limite ' +
    'di token).\n\n' +
    'Tipicamente usato per: salvare un riassunto della sessione prima della ' +
    'compattazione, persistere informazioni che andrebbero perse.',
  Notification:
    'Triggera quando Claude vuole notificare qualcosa all\'utente (es. completamento, ' +
    'permessi richiesti).\n\n' +
    'Tipicamente usato per: integrazione con sistemi di notifica esterni (toast, ' +
    'macOS notifications, Slack).',
  Setup:
    'Triggera al primo setup del plugin (one-time configuration).\n\n' +
    'Tipicamente usato per: verifiche di prerequisiti (es. claude-mem version-check), ' +
    'creazione di directory di storage, init di config files.',
};

function hookEventDoc(name) {
  const desc = HOOK_EVENT_DOCS[name];
  if (desc) return name + '\n\n' + desc;
  return name + '\n\nEvent custom (non documentato nel core di Claude Code).';
}

/* ── DOM REFS ─────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── INIT ─────────────────────────────────────────────────────────────── */
async function init() {
  // Leggi appState UNA volta e condividi fra initLocale + restore sort/view/ecc.
  // Lingua va inizializzata prima di setupNav() così il primo paint usa la
  // locale corretta.
  const appState = await window.claudeAPI.getState();
  await initLocale(appState);
  setupNav();
  attachSupportButtons();
  attachFeedbackButton();
  // v1.0.67 — Carica caps pty PRIMA del primo render, così il bottone
  // "Terminale" appare nel topbar fin dal primo paint (altrimenti il
  // render parte con termState.caps=null e l'utente non vede il bottone).
  try {
    termState.caps = await window.claudeAPI.pty.capabilities();
    // v1.0.75 — carica la shell preferita persistita (se presente). Vale solo
    // per le NUOVE tab; le tab esistenti restano con la shell con cui sono nate.
    if (termState.caps && termState.caps.preferredShell) {
      termState.preferredShell = termState.caps.preferredShell;
    }
  } catch { /* graceful: pty non disponibile, nessun bottone */ }
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
    toast(t('toast.configChanged'), 'info');
    statsCache = null;
    loadData();
  });
  window.claudeAPI.onSwitchSection(name => switchToSection(name));
  window.claudeAPI.onForceRefresh(() => loadData());
  if (appState.mktSort && MKT_SORTERS[appState.mktSort]) {
    state.mktSort = appState.mktSort;
    applyMktSort();
    if (state.section === 'marketplaces') render();
  }
  // v1.0.82 — restore sort preferences per Plugin/Skill/Agent/MCP
  if (appState.pluginSort && PLUGIN_SORTERS[appState.pluginSort]) state.pluginSort = appState.pluginSort;
  if (appState.skillSort  && NAME_SORTERS[appState.skillSort])   state.skillSort  = appState.skillSort;
  if (appState.agentSort  && NAME_SORTERS[appState.agentSort])   state.agentSort  = appState.agentSort;
  if (appState.mcpSort    && MCP_SORTERS[appState.mcpSort])      state.mcpSort    = appState.mcpSort;
  if (appState.hookSort   && HOOK_SORTERS[appState.hookSort])    state.hookSort   = appState.hookSort;
  // v1.0.96 — Pack M: restore viewMode persistito per sezione (default cards)
  if (appState.viewMode && typeof appState.viewMode === 'object') {
    for (const sec of Object.keys(state.viewMode)) {
      if (appState.viewMode[sec] === 'cards' || appState.viewMode[sec] === 'compact') {
        state.viewMode[sec] = appState.viewMode[sec];
      }
    }
  }
  // v1.0.100 — restore modifiedFiles tracking (file .md editati localmente)
  if (appState.modifiedFiles && typeof appState.modifiedFiles === 'object') {
    state.modifiedFiles = appState.modifiedFiles;
  }
  // v1.0.109 — restore tokenModel preferito
  if (appState.tokenModel === 'opus' || appState.tokenModel === 'sonnet') {
    state.tokenModel = appState.tokenModel;
  }
  // v1.1.9 — restore notifiche quota (opt-out: false esplicito)
  if (appState.notifyQuota === false) state.notifyQuota = false;
  // v1.1.24 — restore frequenza polling quota (ms; 0 = Manuale)
  if (Number.isFinite(appState.quotaPollMs) && appState.quotaPollMs >= 0) {
    state.quotaPollMs = appState.quotaPollMs;
  }
  if (appState.quotaLastNotified && typeof appState.quotaLastNotified === 'object') {
    state.quotaLastNotified = appState.quotaLastNotified;
  }
  if (appState.lastSection && appState.lastSection !== 'dashboard') {
    switchToSection(appState.lastSection);
  }
  if (!appState.onboardingShown) showOnboardingTour();
  // v1.0.09 — Soft auto-update: check all'avvio + ogni 24h se app rimane aperta
  scheduleUpdateCheck();
  // v1.1.9 — Notifiche soglia quota Claude: polling 10 min con dedup 12h
  scheduleQuotaCheck();
  // v1.0.29 — Pack A: pill account sempre visibile in sidebar
  bootSidebarAccount();
  // v1.0.67 — Pack B: Terminale integrato (drawer + multi-tab)
  await initTerminalDrawer();
}

// v1.1.22 — Auto-update: check forzato (silenzioso) ad ogni avvio + ogni 3h.
// `force` bypassa il cooldown di 1h del main → all'avvio rileva sempre una
// nuova release. `silent` sopprime i toast di esito (il banner appare comunque):
// così non spunta "Tutto aggiornato" ad ogni lancio. Interroga GitHub, non
// l'API Anthropic → nessun impatto sul rate-limit dell'account.
const UPDATE_POLL_MS = 3 * 60 * 60 * 1000;
// v1.1.22 — il banner/footer di aggiornamento apre SEMPRE la pagina download
// del sito ufficiale (link sempre allineati all'ultima release), mai la release
// GitHub grezza. v1.1.25 — l'updater non espone più l'URL GitHub per evitare
// che venga ricollegato per sbaglio: usare sempre questa costante.
const DOWNLOAD_PAGE_URL = 'https://clacoroo.app/download/';
// v1.1.23 — Pagina feedback sul sito (lingua-aware: EN su /, IT su /it/).
const FEEDBACK_URL_EN = 'https://clacoroo.app/feedback';
const FEEDBACK_URL_IT = 'https://clacoroo.app/it/feedback';
function scheduleUpdateCheck() {
  runUpdateCheck(true, true);
  setInterval(() => runUpdateCheck(true, true), UPDATE_POLL_MS);
}

// v1.1.9 — Quota threshold notifications. Polling ogni 10 min, dedup per
// soglia (80/95/100) con cooldown 12h via state.json.
const QUOTA_BANDS = [
  { key: 'fiveHour',       i18nKey: 'settingsExtra.bandSession' },
  { key: 'sevenDay',       i18nKey: 'settingsExtra.bandWeekly' },
  { key: 'sevenDaySonnet', i18nKey: 'settingsExtra.bandWeeklySonnet' },
];
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000;
function thresholdLevel(pct) {
  if (pct >= 100) return 100;
  if (pct >= 95)  return 95;
  if (pct >= 80)  return 80;
  return 0;
}
// v1.1.24 — preset frequenza polling quota. ms=0 → Manuale (nessun polling
// automatico). unit guida la label i18n (quotaPollSec / quotaPollMin / manual).
const QUOTA_POLL_PRESETS = [
  { ms: 30 * 1000,        n: 30,  unit: 'sec' },
  { ms: 60 * 1000,        n: 60,  unit: 'sec' },
  { ms: 120 * 1000,       n: 120, unit: 'sec' },
  { ms: 5 * 60 * 1000,    n: 5,   unit: 'min' },
  { ms: 10 * 60 * 1000,   n: 10,  unit: 'min' },
  { ms: 15 * 60 * 1000,   n: 15,  unit: 'min' },
  { ms: 30 * 60 * 1000,   n: 30,  unit: 'min' },
  { ms: 60 * 60 * 1000,   n: 60,  unit: 'min' },
  { ms: 0,                n: 0,   unit: 'manual' },
];
function quotaPollLabel(preset) {
  if (preset.unit === 'manual') return t('settingsExtra.quotaPollManual');
  const key = preset.unit === 'sec' ? 'settingsExtra.quotaPollSec' : 'settingsExtra.quotaPollMin';
  return t(key, { n: preset.n });
}

let quotaPollTimer = null;
// Avvia il polling quota: clear del timer precedente + un check "kick" dopo
// kickMs, poi a intervalli regolari. Manuale (quotaPollMs<=0) → nessuno dei due.
// Boot e cambio-a-runtime condividono questo unico modello.
function startQuotaPollTimer(kickMs = 0) {
  if (quotaPollTimer) { clearInterval(quotaPollTimer); quotaPollTimer = null; }
  const ms = Number(state.quotaPollMs);
  if (ms <= 0) return;
  if (kickMs >= 0) setTimeout(() => runQuotaCheck(), kickMs);
  quotaPollTimer = setInterval(() => runQuotaCheck(), ms);
}
// Boot: primo check SUBITO (così il badge "Ultimo aggiornamento" ha un dato
// reale dall'apertura, niente "in attesa"), poi a intervalli secondo la
// frequenza scelta. In Manuale fa comunque il primo check ma non avvia il timer.
function scheduleQuotaCheck() {
  runQuotaCheck();              // primo update immediato, sempre
  startQuotaPollTimer(-1);      // timer a intervalli senza kick (auto); no-op in Manuale
}
// Cambio frequenza a runtime: persiste + ricrea il timer (refresh immediato
// sulla nuova cadenza), senza riavviare l'app.
function applyQuotaPollSetting(ms) {
  state.quotaPollMs = ms;
  try { window.claudeAPI.setState({ quotaPollMs: ms }); } catch {}
  startQuotaPollTimer(0);
}
async function runQuotaCheck() {
  // v1.1.24 — il poll automatico è proprio la cadenza scelta dall'utente: forza
  // il fetch reale (bypassa il TTL al limite) così "Ultimo aggiornamento" si
  // azzera puntuale a ogni tick. Il backoff 429 resta indipendente (force
  // ignorato in pausa, gestito nel main).
  let usageRes;
  try { usageRes = await window.claudeAPI.getUsage({ force: true }); } catch { return; }
  if (!usageRes || !usageRes.ok) return;
  // Aggiorna i dati live anche se l'utente non è nella sezione attiva: tiene il
  // contatore allineato alla cadenza (riparte da 0 a ogni poll) e ridipinge le
  // barre quota + tutte le sezioni da getStats().
  if (!usageRes.rateLimited && Number.isFinite(usageRes.fetchedAt)) {
    lastUsageData = usageRes;
    // Badge "Ultimo aggiornamento" (Dashboard) + riga Account: nuovo timestamp
    document.querySelectorAll('.usage-updated').forEach((elx) => {
      elx.dataset.fetchedAt = String(usageRes.fetchedAt);
    });
    refreshUsageUpdatedLabels();
    // Barre quota già in pagina (Dashboard compact + pannello Account)
    document.querySelectorAll('.dashboard-usage-bars').forEach((c) => paintUsageBars(c, usageRes, { compact: true }));
    document.querySelectorAll('.account-usage-section').forEach((c) => paintUsageBars(c, usageRes));
    // Stessa cadenza per contesto, KPI Claude Code e tab Stats
    refreshStatsLive();
  }
  if (state.notifyQuota === false) return;  // opt-out: niente notifiche soglia
  // v1.1.21 — durante un backoff 429 i dati sono cachati (potenzialmente stantii):
  // non far scattare notifiche soglia su valori non freschi.
  if (usageRes.rateLimited) return;
  const data = usageRes.data || {};
  const last = state.quotaLastNotified || {};
  let stateMutated = false;
  for (const band of QUOTA_BANDS) {
    const b = data[band.key];
    if (!b || !Number.isFinite(b.utilization)) continue;
    const pct = Math.min(100, Math.max(0, b.utilization));
    const level = thresholdLevel(pct);
    const prev = last[band.key] || { level: 0, at: 0 };
    // Reset state se la quota è scesa sotto la soglia (rinnovo settimanale/sessione)
    if (level < prev.level) {
      last[band.key] = { level, at: Date.now() };
      stateMutated = true;
      continue;
    }
    if (level === 0) continue;
    if (level === prev.level && (Date.now() - prev.at) < QUOTA_COOLDOWN_MS) continue;
    // Notifica
    const bandName = t(band.i18nKey);
    const when = b.resetsAt ? formatResetTime(b.resetsAt) : '';
    let title, body;
    if (level === 100) {
      title = t('settingsExtra.quotaNotifTitle100', { band: bandName });
      body  = t('settingsExtra.quotaNotifBody100',  { band: bandName, when });
    } else if (level === 95) {
      title = t('settingsExtra.quotaNotifTitle95',  { band: bandName });
      body  = t('settingsExtra.quotaNotifBody95',   { band: bandName, pct: Math.floor(pct), when });
    } else {
      title = t('settingsExtra.quotaNotifTitle80',  { band: bandName });
      body  = t('settingsExtra.quotaNotifBody80',   { band: bandName, pct: Math.floor(pct), remaining: when || '?' });
    }
    // force:true → mostra anche con app in focus (alert importante)
    try { window.claudeAPI.showNotification(title, body, true); } catch {}
    last[band.key] = { level, at: Date.now() };
    stateMutated = true;
  }
  if (stateMutated) {
    state.quotaLastNotified = last;
    try { await window.claudeAPI.setState({ quotaLastNotified: last }); } catch {}
  }
}

async function runUpdateCheck(force, silent) {
  const r = await window.claudeAPI.checkUpdates(force);
  if (!r) return;
  // Skipped per cooldown: usa risultato cached se disponibile
  const info = r.skipped ? r.cached : r;
  if (!info || !info.ok || !info.available) {
    window._latestUpdateInfo = null;
    refreshFooterStatus(null);
    if (force && !silent) {
      if (r.ok === false) {
        toast(t('toast.updateCheckError', { msg: r.error }), 'error');
      } else if ((info && info.reason === 'no-release') || (r.reason === 'no-release')) {
        toast(t('toast.noPublicRelease'), 'info');
      } else {
        toast(t('toast.upToDate'), 'success');
      }
    }
    return;
  }
  // Salvo per il footer (anche se l'utente ha skipped la versione: la
  // segnalazione resta utile, solo niente banner)
  window._latestUpdateInfo = info;
  refreshFooterStatus(info);
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
  setStatus('loading', t('status.loading'));
  const result = await window.claudeAPI.getData();
  if (!result.ok) {
    setStatus('error', t('uiErr.dataLoad'));
    toast(t('toast.errorPrefix', { msg: result.error }), 'error');
    return;
  }
  state.rawData = result.data;
  if (result.data.appVersion) _currentAppVersion = result.data.appVersion;
  processData();
  render();
  refreshSidebarRecent();
  refreshFooterStatus(window._latestUpdateInfo || null);
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
      // v1.0.100 — routing esteso per i nuovi kind (skill/agent/mcp/hooks)
      const map = {
        marketplace: 'marketplaces',
        skill:       'skills',
        agent:       'agents',
        mcp:         'mcp',
        hook:        'hooks',
      };
      switchToSection(map[entry.kind] || 'plugins');
    });
    container.appendChild(row);
  });
}

function processData() {
  const raw     = state.rawData;
  const blocked = new Set((raw.blocklist.plugins || []).map(b => b.plugin));
  const catalog = raw.catalog.plugins || {};
  const localData = raw.localData || { localPlugins: [], localSkills: [], localAgents: [] };

  // v1.0.102 — Invalida memoize hooks list ad ogni reload dati
  state._hookListCache = null;

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

    // v1.0.109 — Salvo tokens per ENTRAMBI i modelli (Opus 4.7 + Sonnet 4.6)
    // così il renderer può switchare via state.tokenModel senza re-leggere il catalog.
    const tokensSonnet = cat.tokens ? (cat.tokens['claude-sonnet-4-6'] || null) : null;
    const tokensOpus   = cat.tokens ? (cat.tokens['claude-opus-4-7']   || null) : null;
    const tokenInfo = tokensSonnet || tokensOpus || (cat.tokens ? Object.values(cat.tokens)[0] : null);

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
      hookEvents:  cache.hookEvents  || [],
      installedAt: cache.installedAt || '',
      blocked:     blocked.has(fullId),
      scope:       'global',
      tokensAlways: tokenInfo?.always_on  || 0,
      tokensInvoke: tokenInfo?.on_invoke  || 0,
      // v1.0.109 — Tokens per modello (Sonnet 4.6 e Opus 4.7) per il comparatore
      tokensByModel: {
        sonnet: { always: tokensSonnet?.always_on || 0, invoke: tokensSonnet?.on_invoke || 0 },
        opus:   { always: tokensOpus?.always_on   || 0, invoke: tokensOpus?.on_invoke   || 0 },
      },
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
  applyStaticI18n();
}

function applyStaticI18n() {
  document.documentElement.setAttribute('lang', activeLang);
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    if (key) node.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(node => {
    const key = node.getAttribute('data-i18n-title');
    if (key) node.title = t(key);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => {
    const key = node.getAttribute('data-i18n-aria');
    if (key) node.setAttribute('aria-label', t(key));
  });
}

/* ── RENDER DISPATCHER ────────────────────────────────────────────────── */
function render() {
  const sectionTitleKey = {
    dashboard:   'nav.dashboard',
    plugins:     'nav.plugin',
    marketplaces:'nav.marketplace',
    skills:      'nav.skill',
    agents:      'nav.agent',
    mcp:         'nav.mcp',
    hooks:       'nav.hooks',
    stats:       'nav.stats',
    config:      'nav.config',
    settings:    'nav.settings',
  };
  $('topbar-title').textContent = t(sectionTitleKey[state.section] || '');

  // v1.1.24 — badge "Ultimo aggiornamento" centrato nell'header, solo in
  // Dashboard (l'update riguarda tutti i dati live della Dashboard). Si
  // auto-aggiorna ogni secondo via refreshUsageUpdatedLabels().
  const updated = $('topbar-updated');
  updated.textContent = '';
  if (state.section === 'dashboard') updated.appendChild(buildDashboardUpdatedBadge());

  // Topbar actions
  const actions = $('topbar-actions');
  actions.textContent = '';

  // v1.0.51 — Bottone "+" contestuale alla sezione Marketplace: aggiunge
  // un marketplace da URL/repo. Sostituisce "+ Progetto" quando si è in
  // questa pagina perché Progetto qui non avrebbe senso.
  if (state.section === 'marketplaces') {
    const addMktBtn = btnWithIcon('btn btn-sm btn-ghost btn-refresh', 'plus', t('topbar.addMarketplace'));
    addMktBtn.title = t('topbar.addMktTooltip');
    addMktBtn.addEventListener('click', () => showAddMarketplaceModal());
    actions.appendChild(addMktBtn);
  } else if (state.section === 'mcp') {
    // v1.0.94 — Pack G v2: bottone per aggiungere un server da CLACOROO
    // via `claude mcp add` (form modale con transport/url/command/env/headers).
    const addMcpBtn = btnWithIcon('btn btn-sm btn-ghost btn-refresh', 'plus', t('topbar.addMcp'));
    addMcpBtn.title = t('topbar.addMcpTooltip');
    addMcpBtn.addEventListener('click', () => showAddMcpModal());
    actions.appendChild(addMcpBtn);
  } else {
    // v1.0.11 — Bottone "+" per aggiungere progetto tracciato (locale)
    const addProjBtn = btnWithIcon('btn btn-sm btn-ghost btn-refresh', 'plus', t('topbar.addProject'));
    addProjBtn.title = t('topbar.addProjectTooltip');
    addProjBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.addTrackedProject();
      if (r.success) {
        toast(t('toast.projectAdded', { name: r.path.split('/').pop() }), 'success');
        await loadData();
      } else if (r.error !== t('uiErr.cancelled')) {
        toast(t('toast.errorPrefix', { msg: r.error }), 'error');
      }
    });
    actions.appendChild(addProjBtn);
  }

  // v1.1.24 — Refresh come primo pulsante a sinistra, con stile accent CLACOROO
  // (outline arancio → pieno al hover). È l'azione più frequente in Dashboard.
  const refreshBtn = btnWithIcon('btn btn-sm btn-refresh btn-accent-outline', 'rotate-cw', t('topbar.refresh'));
  refreshBtn.title = t('topbar.refreshTooltip');
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…';
    // v1.0.90 — Invalida il cache delle hook deps PRIMA di ricaricare i dati,
    // così se l'utente ha appena installato/disinstalato un tool (es. Bun)
    // il badge "Manca: bun" appare/sparisce subito senza riavviare l'app.
    try { await window.claudeAPI.refreshHookDeps(); } catch { /* graceful */ }
    forceUsageNextLoad = true;   // v1.1.24 — refresh manuale → fetch quota reale
    await loadData();
    refreshBtn.disabled = false;
    refreshBtn.textContent = '';
    refreshBtn.appendChild(icon('rotate-cw'));
    refreshBtn.appendChild(document.createTextNode(t('topbar.refresh')));
    toast(t('toast.dataReloaded'), 'success');
  });
  actions.insertBefore(refreshBtn, actions.firstChild);

  // v1.0.67 — Pack B: toggle terminale integrato
  if (termState && termState.caps && termState.caps.available) {
    const termBtn = btnWithIcon('btn btn-sm btn-ghost btn-refresh', 'terminal', t('topbar.terminal'));
    termBtn.title = 'Apri/chiudi il terminale integrato (Cmd+`)';
    termBtn.addEventListener('click', () => termSetOpen(!termState.open));
    actions.appendChild(termBtn);
  }

  switch (state.section) {
    case 'dashboard':    renderDashboard();   break;
    case 'plugins':      renderPlugins();     break;
    case 'marketplaces': renderMarketplaces();break;
    case 'skills':       renderSkills();      break;
    case 'agents':       renderAgents();      break;
    case 'mcp':          renderMcp();         break;
    case 'hooks':        renderHooks();       break;
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

// v1.0.102 — Rimosso blocco legacy svgIcon/ICONS/btnWithIcon (heroicons-like)
// che shadowava le definizioni Lucide v1.0.95 quando referenziato dopo riga
// 762. Tutte le 6 chiamate `svgIcon('xxx')` migrate a `icon('xxx')` (Lucide).
// Vedi src/renderer/app.js linee 38-110 per la versione attiva.

// v1.0.61 — Swap atomico fra overlay modali. Appende il nuovo PRIMA di
// rimuovere i vecchi e disabilita l'animation tourFade .2s sul nuovo
// se ci sono overlay esistenti (la fade-in da opacity 0 lasciava
// vedere la pagina sotto attraverso il nuovo overlay semi-trasparente).
// Primo open mantiene il fade-in morbido; swap è istantaneo.
function swapModalOverlay(newOverlay) {
  const existing = Array.from(document.querySelectorAll('.md-overlay'));
  if (existing.length > 0) {
    newOverlay.classList.add('md-overlay-instant');
  }
  document.body.appendChild(newOverlay);
  existing.forEach(o => {
    if (typeof o._close === 'function') o._close();
    else o.remove();
  });
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
  if (s < 60)     return t('time.secondsAgo', { n: s });
  const m = Math.floor(s / 60);
  if (m < 60)     return t('time.minutesAgo', { n: m });
  const h = Math.floor(m / 60);
  if (h < 24)     return t('time.hoursAgo', { n: h });
  const d = Math.floor(h / 24);
  if (d < 30)     return t('time.daysAgo', { n: d });
  return new Date(ts).toLocaleDateString(t('time.locale'));
}

// v1.1.24 — formato "tempo trascorso" per il contatore live della quota: mostra
// sempre i secondi così scorre visibilmente (es. "45s", "1m 23s", "1h 04m").
// Diverso da relativeTime() (che sopra il minuto perde i secondi).
function liveAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return t('time.liveSec', { s });
  const m = Math.floor(s / 60), rs = s % 60;
  if (m < 60) return t('time.liveMin', { m, s: String(rs).padStart(2, '0') });
  const h = Math.floor(m / 60), rm = m % 60;
  if (h < 24) return t('time.liveHour', { h, m: String(rm).padStart(2, '0') });
  return new Date(ts).toLocaleDateString(t('time.locale'));
}

// v1.1.24 — modalità di aggiornamento corrente (per la riga "Ultimo
// aggiornamento"): "Auto ogni 30 s" / "Auto ogni 5 min" oppure "Manuale".
function quotaModeLabel() {
  const ms = Number(state.quotaPollMs);
  if (!(ms > 0)) return t('settingsExtra.usageModeManual');
  const preset = QUOTA_POLL_PRESETS.find((p) => p.ms === ms);
  const every = preset ? quotaPollLabel(preset) : Math.round(ms / 1000) + ' s';
  return t('settingsExtra.usageModeAuto', { every });
}

// v1.1.24 — badge "Ultimo aggiornamento" in cima alla Dashboard. Copre TUTTI i
// dati live (contesto, quota, statistiche, pesi plugin, usage CC). Il testo
// interno (.usage-updated) è aggiornato dal loop a 1s; il data-fetchedAt viene
// popolato dall'ultimo fetch usage andato a buon fine.
function buildDashboardUpdatedBadge() {
  const badge = el('div', 'dashboard-updated-badge');
  badge.appendChild(icon('rotate-cw'));
  const txt = el('span', 'usage-updated');
  const ts = lastUsageData && Number.isFinite(lastUsageData.fetchedAt) ? lastUsageData.fetchedAt : null;
  if (ts != null) {
    txt.dataset.fetchedAt = String(ts);
    txt.textContent = t('settingsExtra.usageLastUpdate', { ago: liveAgo(ts) }) + ' · ' + quotaModeLabel();
  } else {
    txt.textContent = t('settingsExtra.usageLastUpdateWait');
  }
  badge.appendChild(txt);
  return badge;
}

// v1.1.24 — aggiorna SOLO il testo "Ultimo aggiornamento" dei blocchi già in
// pagina (badge Dashboard + riga Account; nessuna chiamata API), così il
// contatore scorre live secondo per secondo. In modalità Auto si azzera da solo
// quando arriva il refresh (nuovo fetchedAt → "0s"). Intervallo 1s.
function refreshUsageUpdatedLabels() {
  const mode = quotaModeLabel();
  document.querySelectorAll('.usage-updated').forEach((el) => {
    const ts = Number(el.dataset.fetchedAt);
    if (Number.isFinite(ts)) {
      el.textContent = t('settingsExtra.usageLastUpdate', { ago: liveAgo(ts) }) + ' · ' + mode;
    }
  });
}
setInterval(refreshUsageUpdatedLabels, 1000);

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
  // v1.0.83 — Pack K: KPI hook (combo event+matcher) + plugin che li forniscono
  const hookList = buildHookList();
  const hookPluginsCount = new Set(hookList.map(h => h.fullId)).size;
  // v1.0.87 — count hook con almeno 1 dipendenza CLI mancante. Mostrato come
  // KPI solo se > 0 per non rumoreggiare la dashboard.
  const hookMissingDepsCount = hookList.filter(h => missingDepsForHook(h).length > 0).length;

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
  // v1.1.14 — `dashboard-overview` raggruppa contesto+quote+statistiche+usage
  // così il tour onboarding può evidenziarle come un unico blocco panoramica.
  const overview = el('div', 'dashboard-overview');
  wrap.appendChild(overview);

  const ctxBar = el('div', 'dashboard-context-section');
  overview.appendChild(ctxBar);
  loadDashboardContextBar(ctxBar, renderToken);

  const usageSection = el('div', 'dashboard-usage-section');
  overview.appendChild(usageSection);
  usageSection.appendChild(sectionTitle(t('section.quoteClaude'), 'gauge'));
  const usageBars = el('div', 'dashboard-usage-bars');
  usageSection.appendChild(usageBars);
  loadDashboardUsage(usageBars, renderToken);

  // KPI plugin (stato installazione)
  overview.appendChild(sectionTitle(t('section.statistiche'), 'bar-chart-3'));
  const kpiGrid = el('div', 'kpi-grid');
  const kpis = [
    { num: active.length,      label: t('kpi.pluginActive'),   color: '#788c5d' },  // global only
    { num: disabled.length,    label: t('kpi.pluginDisabled'), color: '#ef4444' },
    { num: locals.length,      label: t('kpi.pluginLocal'),    color: '#b8c79a' },  // verde Anthropic chiaro
    { num: state.mktList.length, label: t('kpi.marketplace'),  color: '#d97757' },  // CLACOROO orange
    { num: allSkills.length,   label: t('kpi.skillTotal'),     color: '#e89478' },  // accent2 chiaro
    { num: allAgents.length,   label: t('kpi.agentTotal'),     color: '#f97316' },
    { num: mcpKpiNum,          label: t('kpi.mcpConnected'),   color: '#22c55e', kind: 'mcp' },
    { num: hookList.length,    label: hookPluginsCount ? t('kpi.hooksPlugins', { n: hookPluginsCount }) : t('kpi.hooks'),
      color: '#a78bfa', kind: 'hooks' },
    // v1.0.87 — KPI condizionale: mostrato solo se ci sono hook con dep mancanti
    ...(hookMissingDepsCount > 0 ? [{
      num: hookMissingDepsCount,
      label: t('kpi.hooksMissingDeps'),
      color: '#f59e0b', kind: 'hooks-warn',
    }] : []),
    { num: totalTokens > 0 ? (Math.round(totalTokens / 100) / 10) + 'K' : '—',
      label: t('kpi.tokensAlways'),  color: '#6a9bcc' },                            // Anthropic blue
    { num: healthErr + healthWarn,
      label: healthErr ? t('kpi.healthIssues') : (healthWarn ? t('kpi.healthWarning') : t('kpi.health')),
      color: healthErr ? '#ef4444' : (healthWarn ? '#f59e0b' : '#788c5d') },
  ];
  kpis.forEach(k => {
    const card = el('div', 'kpi-card');
    if (k.kind) card.dataset.kpi = k.kind;
    card.style.setProperty('--kpi-color', k.color);
    const num = el('div', 'kpi-num', String(k.num));
    const lbl = el('div', 'kpi-label', k.label);
    card.appendChild(num); card.appendChild(lbl);
    // v1.0.83 — KPI Hooks cliccabile → naviga alla sezione dedicata
    // v1.0.87 — anche hooks-warn cliccabile (porta a Hooks per drill-down)
    if (k.kind === 'hooks' || k.kind === 'hooks-warn') {
      card.style.cursor = 'pointer';
      card.title = k.kind === 'hooks-warn'
        ? t('kpi.hooksWarnTooltip')
        : t('kpi.hooksTooltip');
      card.addEventListener('click', () => switchToSection('hooks'));
    }
    kpiGrid.appendChild(card);
  });
  overview.appendChild(kpiGrid);

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

  // KPI utilizzo Claude Code (range='all') — ultima sezione della panoramica
  const statsSection = el('div', 'dashboard-stats-section');
  overview.appendChild(statsSection);
  loadDashboardStats(statsSection, renderToken);

  // v1.0.107 — Pack C: Top-N plugin per peso (token cost breakdown)
  renderTokenBudgetSection(wrap, state.plugins);

  // v1.0.105 — Sezioni riassuntive dashboard nello stesso ordine della sidebar
  // (Marketplace → Plugin → Skill → Agent → MCP → Hooks). Tutte usano lo
  // stesso helper renderDashboardSection con max 19 + 20° "Vedi tutte".

  // 1. Marketplace
  renderDashboardSection({
    container: wrap, title: t('section.marketplaceTitle'), iconName: 'store', targetSection: 'marketplaces',
    items: state.mktList,
    getTimestamp: m => Date.parse(m.addedAt || m.lastUpdated || '') || 0,
    buildChip: (m) => {
      const chip = el('div', 'skill-chip clickable');
      chip.title = t('chip.openSection', { name: t('section.marketplaceTitle') });
      chip.style.borderLeftColor = mktColor(m.id);
      const dot = el('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + mktColor(m.id);
      chip.appendChild(dot);
      chip.appendChild(el('span', 'skill-chip-name', m.id));
      chip.appendChild(el('span', 'skill-chip-plugin', t('counter.cardPlugins', { n: m.plugins.length })));
      chip.addEventListener('click', () => switchToSection('marketplaces'));
      return chip;
    },
  });

  // 2. Plugin
  renderDashboardSection({
    container: wrap, title: t('section.pluginTitle'), iconName: 'puzzle', targetSection: 'plugins',
    items: state.plugins,
    getTimestamp: p => Date.parse(p.installedAt || '') || 0,
    emptyText: t('empty.noPlugin'),
    buildChip: (p) => {
      const chip = el('div', 'skill-chip clickable' + (p.blocked ? ' blocked' : ''));
      chip.title = t('chip.openSection', { name: t('section.pluginTitle') });
      chip.style.borderLeftColor = mktColor(p.mkt);
      const dot = el('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + mktColor(p.mkt);
      chip.appendChild(dot);
      chip.appendChild(el('span', 'skill-chip-name', p.id));
      chip.appendChild(el('span', 'skill-chip-plugin', p.mkt));
      chip.addEventListener('click', () => switchToSection('plugins'));
      return chip;
    },
  });

  // 3. Skill (recency = installedAt del plugin proprietario)
  const allSkillItems = state.plugins.flatMap(p =>
    (p.skills || []).map(s => ({ name: s, plugin: p.id, mkt: p.mkt, fullId: p.fullId, installedAt: p.installedAt }))
  );
  renderDashboardSection({
    container: wrap, title: t('section.skillTitle'), iconName: 'sparkles', targetSection: 'skills',
    items: allSkillItems,
    getTimestamp: s => Date.parse(s.installedAt || '') || 0,
    emptyText: t('empty.noSkill'),
    buildChip: (s) => {
      const chip = el('div', 'skill-chip clickable');
      chip.title = t('chip.openSection', { name: t('section.skillTitle') });
      chip.style.borderLeftColor = mktColor(s.mkt);
      const dot = el('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + mktColor(s.mkt);
      chip.appendChild(dot);
      chip.appendChild(el('span', 'skill-chip-name', s.name));
      chip.appendChild(el('span', 'skill-chip-plugin', s.plugin));
      chip.addEventListener('click', () => switchToSection('skills'));
      return chip;
    },
  });

  // 4. Agent (recency = installedAt del plugin proprietario)
  const allAgentItems = state.plugins.flatMap(p =>
    (p.agents || []).map(a => ({ name: a, plugin: p.id, mkt: p.mkt, fullId: p.fullId, installedAt: p.installedAt }))
  );
  renderDashboardSection({
    container: wrap, title: t('section.agentTitle'), iconName: 'bot', targetSection: 'agents',
    items: allAgentItems,
    getTimestamp: a => Date.parse(a.installedAt || '') || 0,
    emptyText: t('empty.noAgent'),
    buildChip: (a) => {
      const chip = el('div', 'skill-chip clickable');
      chip.title = t('chip.openSection', { name: t('section.agentTitle') });
      chip.style.borderLeftColor = '#f97316';
      const dot = el('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:#f97316';
      chip.appendChild(dot);
      chip.appendChild(el('span', 'skill-chip-name', a.name));
      chip.appendChild(el('span', 'skill-chip-plugin', a.plugin));
      chip.addEventListener('click', () => switchToSection('agents'));
      return chip;
    },
  });

  // 5. MCP server — chip riassuntiva async (cache 30s), click → sezione MCP
  const mcpSection = el('div', 'dashboard-mcp-section');
  wrap.appendChild(mcpSection);
  loadDashboardMcp(mcpSection, renderToken);

  // 6. Hooks (recency = installedAt del plugin proprietario)
  const allHookItems = buildHookList();
  // Aggiungo installedAt come proxy di recency dal plugin
  const installedAtMap = {};
  state.plugins.forEach(p => { installedAtMap[p.fullId] = p.installedAt; });
  allHookItems.forEach(h => { h.installedAt = installedAtMap[h.fullId] || ''; });
  renderDashboardSection({
    container: wrap, title: t('section.hooksTitle'), iconName: 'anchor', targetSection: 'hooks',
    items: allHookItems,
    getTimestamp: h => Date.parse(h.installedAt || '') || 0,
    emptyText: t('empty.noHooks'),
    buildChip: (h) => {
      const chip = el('div', 'skill-chip clickable');
      chip.title = t('chip.openSection', { name: t('section.hooksTitle') });
      const evColor = hookEventColor(h.event);
      chip.style.borderLeftColor = evColor;
      const dot = el('span');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + evColor;
      chip.appendChild(dot);
      chip.appendChild(el('span', 'skill-chip-name', h.event));
      chip.appendChild(el('span', 'skill-chip-plugin', h.pluginId));
      chip.addEventListener('click', () => switchToSection('hooks'));
      return chip;
    },
  });

  // Attività recenti (idea #4)
  const actTitle = sectionTitle(t('section.attivitaRecenti'), 'rotate-cw');
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
    container.appendChild(el('div', 'activity-empty', t('empty.noActivity')));
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
  container.appendChild(sectionTitle(t('section.stimaContesto'), 'eye'));
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
  container.appendChild(sectionTitle(t('section.utilizzoClaude'), 'bar-chart-3'));
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

// v1.1.24 — aggiorna in-place TUTTI i dati live da getStats() già in pagina,
// sulla stessa cadenza del polling quota (un'unica frequenza per tutta la
// Dashboard + tab Stats). Invalida la cache stats, ri-fetcha una sola volta e
// ripinge i contenitori presenti riusando le funzioni di paint esistenti — che
// aggiornano in-place o ricostruiscono il solo sotto-albero della sezione, senza
// toccare scroll, dropdown (state-driven) o il resto della pagina.
async function refreshStatsLive() {
  // Niente sezioni stats in pagina → niente fetch (es. sei in Skill/Settings)
  const ctxSections = document.querySelectorAll('.dashboard-context-section, .plugins-context-section');
  const statsSection = document.querySelector('.dashboard-stats-section');
  const statsContent = document.querySelector('.stats-content');
  if (!ctxSections.length && !statsSection && !statsContent) return;

  statsCache = null;  // forza il re-fetch
  const data = await fetchStatsSafe();
  if (!data) return;
  lastStatsData = data;

  // Context bar (Dashboard + pannello Plugin)
  if (data.contextBreakdown) {
    ctxSections.forEach((sec) => {
      if (sec.querySelector('.context-breakdown')) paintCtxBar(sec, data.contextBreakdown);
    });
  }
  // KPI utilizzo Claude Code (sessioni, token, streak, modello preferito…)
  if (statsSection && data.cache) paintDashboardStats(statsSection, data);
  // Tab Stats aperto (Overview/Modelli/Progetti: heatmap, tokens per model,
  // daily tokens, progetti) — ripinto con lo stesso tab/range correnti. Le
  // funzioni renderStatsX appendono senza pulire (lo fa renderStats), quindi
  // svuoto il content prima per non duplicare i nodi.
  if (statsContent) {
    statsContent.textContent = '';
    paintStatsTab(statsContent, data);
  }
}

// v1.0.107 — Pack C analytics: formatter token "12.5K" / "1.2M" / "950"
function formatTokenSize(n) {
  if (!n || n < 1000) return String(n || 0);
  if (n < 1000000) return (n / 1000).toFixed(n < 10000 ? 1 : 0) + 'K';
  return (n / 1000000).toFixed(1) + 'M';
}

// v1.0.107 — Pack C analytics: sezione Dashboard "Plugin per peso" con
// Top-N bar chart orizzontale per always-on tokens + colonna on-invoke.
// Mostra solo plugin globali attivi (no locali, no blocked). Sorted desc.
// Cliccando "Vedi tutti" si apre il modal con tabella completa.
// v1.0.108-109 — opts.mode: 'compact' (Dashboard, Top 5, layout standard) o
// 'full' (Stats Overview, Top 30 + rank + mkt + % context window).
// v1.0.109 — model switcher Sonnet/Opus + bottone Disabilita inline.
//
// Helper: estrae always/invoke per il modello attualmente selezionato.
function tokenValuesFor(p, model) {
  const m = (p.tokensByModel && p.tokensByModel[model]) || null;
  if (m) return { always: m.always || 0, invoke: m.invoke || 0 };
  return { always: p.tokensAlways || 0, invoke: p.tokensInvoke || 0 };
}

function renderTokenBudgetSection(container, plugins, opts = {}) {
  const mode = opts.mode || 'compact';
  const model = state.tokenModel || 'sonnet';
  const modelLabel = model === 'opus' ? 'Opus 4.7' : 'Sonnet 4.6';
  const eligible = (plugins || []).filter(p => {
    if (p.scope !== 'global' || p.blocked) return false;
    const v = tokenValuesFor(p, model);
    return v.always > 0 || v.invoke > 0;
  });
  if (!eligible.length) return;

  // Title row con dropdown modello a destra
  const titleRow = el('div', 'token-budget-title-row');
  titleRow.appendChild(sectionTitle(t('section.pluginPerPeso'), 'gauge'));
  const modelSwitch = el('div', 'token-budget-model-switch');
  modelSwitch.appendChild(el('span', 'token-budget-model-label', t('token.modelLabel')));
  const sel = el('select', 'token-budget-model-select');
  [
    { v: 'sonnet', l: 'Sonnet 4.6' },
    { v: 'opus',   l: 'Opus 4.7'   },
  ].forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.v; opt.textContent = o.l;
    if (o.v === model) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', async () => {
    state.tokenModel = sel.value;
    try { await window.claudeAPI.setState({ tokenModel: state.tokenModel }); } catch {}
    render();
  });
  modelSwitch.appendChild(sel);
  titleRow.appendChild(modelSwitch);
  container.appendChild(titleRow);

  const sorted = [...eligible].sort((a, b) => tokenValuesFor(b, model).always - tokenValuesFor(a, model).always);
  const TOP_N = mode === 'full' ? 30 : 5;
  const top = sorted.slice(0, TOP_N);
  const maxAlways = top.reduce((m, p) => Math.max(m, tokenValuesFor(p, model).always), 1);
  const totalAlways = sorted.reduce((s, p) => s + tokenValuesFor(p, model).always, 0);
  const totalInvoke = sorted.reduce((s, p) => s + tokenValuesFor(p, model).invoke, 0);

  // Summary line
  const summary = el('div', 'token-budget-summary');
  summary.appendChild(el('span', 'token-budget-total-label', t('tokenBudget.totalAlways', { model: modelLabel })));
  summary.appendChild(el('strong', 'token-budget-total-val', formatTokenSize(totalAlways) + ' tok'));
  summary.appendChild(el('span', 'token-budget-sub', t('tokenBudget.subtitle', { n: sorted.length, tok: formatTokenSize(totalInvoke) })));
  if (mode === 'full') {
    const pctCtx = ((totalAlways / 200000) * 100).toFixed(1);
    summary.appendChild(el('span', 'token-budget-sub', '· ' + pctCtx + '% del context window (200K)'));
  }
  container.appendChild(summary);

  // Bar chart
  const list = el('div', 'token-budget-list' + (mode === 'full' ? ' token-budget-list-full' : ''));
  top.forEach((p, idx) => {
    const v = tokenValuesFor(p, model);
    const row = el('div', 'token-budget-row');
    row.title = t('tokenBudget.titleTooltip', { id: p.id, mkt: p.mkt, always: v.always, invoke: v.invoke }).replace(/\\n/g, '\n');
    if (mode === 'full') {
      row.appendChild(el('span', 'token-budget-rank-inline', '#' + (idx + 1)));
    }
    const nameWrap = el('div', 'token-budget-name');
    const dot = el('span', 'token-budget-dot');
    dot.style.background = mktColor(p.mkt);
    nameWrap.appendChild(dot);
    nameWrap.appendChild(el('span', 'token-budget-name-text', p.id));
    if (mode === 'full') {
      nameWrap.appendChild(el('span', 'token-budget-name-mkt', p.mkt));
    }
    row.appendChild(nameWrap);
    const barCol = el('div', 'token-budget-bar-col');
    const bar = el('div', 'token-budget-bar');
    bar.style.width = Math.max(2, Math.round((v.always / maxAlways) * 100)) + '%';
    bar.style.background = mktColor(p.mkt);
    barCol.appendChild(bar);
    row.appendChild(barCol);
    row.appendChild(el('span', 'token-budget-val-always', formatTokenSize(v.always) + ' tok'));
    const invoke = el('span', 'token-budget-val-invoke');
    invoke.textContent = t('tokenBudget.introInvoke', { tok: formatTokenSize(v.invoke) });
    row.appendChild(invoke);
    // v1.0.109 — Bottone Disabilita inline (quick context cleanup)
    const disableBtn = el('button', 'token-budget-disable-btn');
    disableBtn.appendChild(icon('ban'));
    disableBtn.appendChild(document.createTextNode(t('token.disableBtn', { tok: formatTokenSize(v.always) })));
    disableBtn.title = t('plugin.disableTip', { id: p.id, tok: v.always });
    disableBtn.addEventListener('click', e => {
      e.stopPropagation();
      confirmAndDisablePlugin(p, v.always);
    });
    row.appendChild(disableBtn);
    row.addEventListener('click', () => showTokenBudgetModal(sorted));
    list.appendChild(row);
  });
  container.appendChild(list);

  if (sorted.length > TOP_N) {
    const seeAll = el('button', 'btn btn-sm btn-ghost token-budget-see-all');
    seeAll.appendChild(icon('external-link'));
    seeAll.appendChild(document.createTextNode(t('plugin.seeAllTopN', { n: sorted.length })));
    seeAll.addEventListener('click', () => showTokenBudgetModal(sorted));
    container.appendChild(seeAll);
  }
}

// v1.0.109 — Confirm + disable plugin via IPC pluginAction('disable', id).
// Quick action dal token budget per recuperare context window al volo.
async function confirmAndDisablePlugin(p, recovery) {
  const response = await window.claudeAPI.confirmDialog({
    title:   t('confirm.disablePlugin.title'),
    message: t('confirm.disablePlugin.message', { id: p.id }),
    detail:  t('confirm.disablePlugin.detail', { fullId: p.fullId, recovery }),
    buttons: [t('button.cancel'), t('confirm.disablePlugin.yes')],
  });
  if (response !== 1) return;
  const r = await window.claudeAPI.pluginAction('disable', p.fullId);
  if (r.success) {
    toast(t('toast.pluginDisabled', { id: p.id, tok: formatTokenSize(recovery) }), 'success');
    await loadData();
  } else {
    toast(t('toast.errorPrefix', { msg: r.error || t('mcp.status.unknown') }), 'error');
  }
}

// v1.0.107 — Modal "Plugin per peso": tabella completa con tutti i plugin
// ordinati desc per tokensAlways. Colonne: rank · nome · marketplace · always · on-invoke · total
function showTokenBudgetModal(plugins) {
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal token-budget-modal');

  const header = el('div', 'md-header');
  const title  = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', 'analytics'));
  title.appendChild(document.createTextNode(' Plugin per peso nel context window'));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = el('div', 'md-content');
  // v1.0.109 — modello attualmente selezionato + comparison entrambi
  const model = state.tokenModel || 'sonnet';
  const modelLabel = model === 'opus' ? 'Opus 4.7' : 'Sonnet 4.6';
  // Intro
  const intro = el('p', 'token-budget-intro');
  intro.textContent = t('token.introTopN', { model: modelLabel });
  content.appendChild(intro);

  // Table — v1.0.109 colonna delta Opus aggiunta
  const table = el('table', 'token-budget-table');
  const thead = el('thead');
  const trh = el('tr');
  [t('token.colNumber'), t('token.colPlugin'), t('token.colMarketplace'), t('token.colAlwaysOn', { model: modelLabel }), t('token.colOnInvoke'), t('token.colDeltaOpus'), t('token.colTotal'), ''].forEach(h => trh.appendChild(el('th', null, h)));
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = el('tbody');
  const sortedPlugins = [...plugins].sort((a, b) => tokenValuesFor(b, model).always - tokenValuesFor(a, model).always);
  const maxAlways = sortedPlugins.reduce((m, p) => Math.max(m, tokenValuesFor(p, model).always), 1);
  sortedPlugins.forEach((p, i) => {
    const v = tokenValuesFor(p, model);
    const vSonnet = tokenValuesFor(p, 'sonnet');
    const vOpus   = tokenValuesFor(p, 'opus');
    const delta = vOpus.always - vSonnet.always;
    const deltaPct = vSonnet.always > 0 ? Math.round((delta / vSonnet.always) * 100) : 0;
    const tr = el('tr');
    tr.appendChild(el('td', 'token-budget-rank', String(i + 1)));
    const nameTd = el('td', 'token-budget-table-name');
    const dot = el('span', 'token-budget-dot');
    dot.style.background = mktColor(p.mkt);
    nameTd.appendChild(dot);
    nameTd.appendChild(el('span', null, p.id));
    tr.appendChild(nameTd);
    tr.appendChild(el('td', 'token-budget-table-mkt', p.mkt));
    const alwaysTd = el('td', 'token-budget-table-always');
    const mini = el('div', 'token-budget-mini');
    const miniBar = el('div', 'token-budget-mini-bar');
    miniBar.style.width = Math.max(2, Math.round((v.always / maxAlways) * 100)) + '%';
    miniBar.style.background = mktColor(p.mkt);
    mini.appendChild(miniBar);
    alwaysTd.appendChild(mini);
    alwaysTd.appendChild(el('span', 'token-budget-val', formatTokenSize(v.always) + ' tok'));
    tr.appendChild(alwaysTd);
    tr.appendChild(el('td', 'token-budget-table-invoke', formatTokenSize(v.invoke) + ' tok'));
    // Δ Opus column (sempre relativo a Sonnet, indipendente dal modello attivo)
    const deltaTd = el('td', 'token-budget-table-delta');
    if (delta > 0) deltaTd.textContent = '+' + formatTokenSize(delta) + ' (+' + deltaPct + '%)';
    else if (delta < 0) deltaTd.textContent = formatTokenSize(delta) + ' (' + deltaPct + '%)';
    else deltaTd.textContent = '—';
    tr.appendChild(deltaTd);
    tr.appendChild(el('td', 'token-budget-table-total', formatTokenSize(v.always + v.invoke) + ' tok'));
    // v1.0.109 — Bottone Disabilita in colonna azioni
    const actTd = el('td', 'token-budget-table-act');
    const disBtn = el('button', 'token-budget-disable-btn-sm');
    disBtn.appendChild(icon('ban'));
    disBtn.title = t('plugin.disableTipShort', { id: p.id, tok: v.always });
    disBtn.addEventListener('click', e => { e.stopPropagation(); confirmAndDisablePlugin(p, v.always); });
    actTd.appendChild(disBtn);
    tr.appendChild(actTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  content.appendChild(table);

  // Footer totale
  const totalAlways = sortedPlugins.reduce((s, p) => s + tokenValuesFor(p, model).always, 0);
  const totalInvoke = sortedPlugins.reduce((s, p) => s + tokenValuesFor(p, model).invoke, 0);
  const totalAlwaysSonnet = sortedPlugins.reduce((s, p) => s + tokenValuesFor(p, 'sonnet').always, 0);
  const totalAlwaysOpus   = sortedPlugins.reduce((s, p) => s + tokenValuesFor(p, 'opus').always, 0);
  const footer = el('div', 'token-budget-modal-footer');
  footer.textContent = modelLabel + ' totale: ' + formatTokenSize(totalAlways) + ' tok always-on (peso fisso) + ' +
    t('tokenBudget.summaryAllInvoke', { tok: formatTokenSize(totalInvoke), sonnet: formatTokenSize(totalAlwaysSonnet) }) +
    ' vs Opus ' + formatTokenSize(totalAlwaysOpus) + ' (delta ' + formatTokenSize(totalAlwaysOpus - totalAlwaysSonnet) + ' tok)';
  content.appendChild(footer);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
}

// v1.0.105 — Helper riassuntivo Dashboard: titolo + griglia di max 19 chip
// + 20° chip "Vedi tutte (N)" colorato accent CLACOROO che porta alla sezione.
// Tutti gli items vengono ordinati per recency (getTimestamp desc). Se < 20
// items, il "Vedi tutte" è comunque l'ultimo riquadro per coerenza UX.
function renderDashboardSection({ container, title, items, buildChip, targetSection, getTimestamp, emptyText, iconName }) {
  container.appendChild(sectionTitle(title, iconName));
  if (!items || !items.length) {
    container.appendChild(el('div', 'mcp-empty', emptyText || t('empty.noGenericItems')));
    return;
  }
  const sorted = [...items];
  if (typeof getTimestamp === 'function') {
    sorted.sort((a, b) => (getTimestamp(b) || 0) - (getTimestamp(a) || 0));
  }
  const MAX_DISPLAY = 19;
  const grid = el('div', 'skill-grid');
  sorted.slice(0, MAX_DISPLAY).forEach(item => {
    grid.appendChild(buildChip(item));
  });
  // 20° chip "Vedi tutte" — sempre presente, colore accent CLACOROO
  const seeAllChip = el('div', 'skill-chip dashboard-see-all clickable');
  seeAllChip.title = t('plugin.openFullSection', { title });
  seeAllChip.appendChild(icon('external-link'));
  const lbl = el('span', 'dashboard-see-all-lbl', t('counter.seeAllN', { n: sorted.length }));
  seeAllChip.appendChild(lbl);
  seeAllChip.addEventListener('click', () => switchToSection(targetSection));
  grid.appendChild(seeAllChip);
  container.appendChild(grid);
}

function paintDashboardMcpChips(container, servers) {
  container.textContent = '';
  container.appendChild(sectionTitle(t('section.mcpServerTitle'), 'plug-2'));
  if (!servers || !servers.length) {
    container.appendChild(el('div', 'mcp-empty', t('empty.noMcp')));
    return;
  }
  // v1.0.105 — Limite 19 + 20° "Vedi tutte" coerente con le altre sezioni dashboard
  const grid = el('div', 'skill-grid');
  const statusColor = { connected: '#22c55e', needsAuth: '#f59e0b', warning: '#f59e0b', error: '#ef4444', unknown: '#b0aea5', disabled: '#b0aea5' };
  const MAX_DISPLAY = 19;
  servers.slice(0, MAX_DISPLAY).forEach(srv => {
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
  // Chip "Vedi tutte" sempre presente come ultimo
  const seeAllChip = el('div', 'skill-chip dashboard-see-all clickable');
  seeAllChip.title = 'Apri la sezione completa MCP server';
  seeAllChip.appendChild(icon('external-link'));
  seeAllChip.appendChild(el('span', 'dashboard-see-all-lbl', t('counter.seeAllN', { n: servers.length })));
  seeAllChip.addEventListener('click', () => switchToSection('mcp'));
  grid.appendChild(seeAllChip);
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

  // v1.1.8 — Empty state "full page" con mascotte se nessun plugin installato
  if (!state.plugins.length) {
    wrap.appendChild(buildMascotEmpty({
      title: t('empty.bigNoPluginTitle'),
      message: t('empty.bigNoPluginMsg'),
      cta: { label: t('empty.bigNoPluginCta'), onClick: () => switchToSection('marketplaces') },
    }));
    setContent(wrap);
    return;
  }

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
  searchInp.setAttribute('placeholder', t('search.plugins'));
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
    { key: 'all',     label: t('filter.all') },
    { key: 'active',  label: t('filter.active'),    dot: '#10b981' },
    { key: 'blocked', label: t('filter.disabled'),  dot: '#ef4444' },
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
    allChip.textContent = t('filter.allMarketplaces');
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

  // COUNT + VIEW SWITCHER + SORT (v1.0.82, v1.0.97)
  const countRow = el('div', 'section-header');
  const countSpan = el('span', 'section-count', '');
  countRow.appendChild(countSpan);
  const pMode = state.viewMode.plugins;
  countRow.appendChild(renderViewSwitcher('plugins', pMode, (m) => setViewMode('plugins', m)));
  countRow.appendChild(renderSortDropdown(state.pluginSort, SORT_OPTIONS.plugin, async (key) => {
    state.pluginSort = key;
    await window.claudeAPI.setState({ pluginSort: key });
    renderPlugins();
  }));
  wrap.appendChild(countRow);

  // GRID: cards (default) o compact list
  const grid = el('div', pMode === 'cards' ? 'cards-grid' : 'compact-list');
  let visible = 0;

  const sortedPlugins = [...state.plugins].sort(PLUGIN_SORTERS[state.pluginSort] || PLUGIN_SORTERS['name-asc']);
  state._renderedPlugins = sortedPlugins;  // usato da applyPluginFilters per indicizzazione corretta
  sortedPlugins.forEach(p => {
    const card = pMode === 'cards' ? buildPluginCard(p) : buildPluginCompactRow(p);
    const show = pluginMatchesFilter(p, f);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
    grid.appendChild(card);
  });

  if (visible === 0) {
    const no = el('div', 'no-results', t('empty.noPluginResults'));
    grid.appendChild(no);
  }

  countSpan.textContent = t('counter.plugins', { visible, total: state.plugins.length });
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
  const arr = state._renderedPlugins || state.plugins;
  let visible = 0;
  grid.querySelectorAll('.plugin-card').forEach((card, i) => {
    const p = arr[i];
    if (!p) return;
    const show = pluginMatchesFilter(p, f);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const countEl = grid.previousElementSibling?.querySelector('.section-count');
  if (countEl) countEl.textContent = t('counter.plugins', { visible, total: state.plugins.length });
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
    row.appendChild(icon('code'));
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
  // v1.0.60 — Il guard del double-open è gestito da swapModalOverlay() a fine funzione
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-skill', 'plugin'));
  title.appendChild(document.createTextNode(' ' + p.id));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
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

  // v1.0.56 — Click su skill/agent apre direttamente il modal markdown,
  // saltando il passaggio "vai alla sezione filtrata". Era confondente:
  // la sezione mostrava 1 solo item che bisognava ri-cliccare per il dettaglio.
  // v1.0.61 — NON chiudo qui: openMarkdownPreview → showMarkdownModal
  // chiamerà swapModalOverlay() che rimuove questo overlay dopo aver
  // appeso il nuovo. Niente flash.
  appendModalItemList(content, t('plugin.sectionSkills'), p.skills, item => {
    openMarkdownPreview(p.fullId, 'skill', item.name || item);
  });
  appendModalItemList(content, t('plugin.sectionAgents'), p.agents, item => {
    openMarkdownPreview(p.fullId, 'agent', item.name || item);
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
    content.appendChild(el('h3', 'plugin-content-section-title', t('plugin.sectionHook')));
    if (p.hookEvents && p.hookEvents.length) {
      // Lista dettagliata: nome evento + N handler (es. "SessionStart · 2 handler")
      const list = el('div', 'plugin-content-list');
      p.hookEvents.forEach(h => {
        const row = el('div', 'plugin-content-item plugin-content-item-static');
        row.appendChild(icon('code'));
        const info = el('div', 'plugin-content-item-info');
        info.appendChild(el('div', 'plugin-content-item-name', h.event));
        const detailLine = el('div', 'plugin-content-item-desc',
          h.handlerCount + (h.handlerCount === 1 ? ' handler' : ' handler')
          + ' · ' + h.matcherCount + (h.matcherCount === 1 ? ' matcher' : ' matcher'));
        info.appendChild(detailLine);
        row.appendChild(info);
        list.appendChild(row);
      });
      content.appendChild(list);
    } else {
      content.appendChild(el('div', 'plugin-content-note',
        'Plugin definisce hook ma il file `hooks/hooks.json` non è disponibile per la lettura. Apri il sorgente per ispezionarli.'));
    }
  }

  // v1.0.56 — Bottoni "Apri sorgente" sempre disponibili in fondo al modal
  // (l'utente segnalava che la nota faceva riferimento a bottoni non visibili
  // nel modal: quelli erano sulle plugin card, non qui)
  const sourceActions = el('div', 'plugin-content-source-actions');
  const finderBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'folder', ' ' + t('pluginCard.openFinder'));
  finderBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openPluginPath(p.fullId);
    if (!r.success) toast(t('toast.errorPrefix', { msg: r.error }), 'error');
  });
  const editorBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'code', ' ' + t('pluginCard.openEditor'));
  editorBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openInEditor(p.fullId);
    if (!r.success) toast(t('toast.errorPrefix', { msg: r.error }), 'error');
  });
  sourceActions.appendChild(finderBtn);
  sourceActions.appendChild(editorBtn);
  content.appendChild(sourceActions);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
}

// v1.0.97 — Pack M: compact view row per la sezione Plugin. Riga singola
// con dot mkt + name + status badge (attivo/disattivato/locale) + count
// skill/agent/mcp/hooks. Click apre il modal "Contenuto plugin".
function buildPluginCompactRow(p) {
  const row = el('div', 'compact-row plugin-compact-row');
  row.style.borderLeftColor = mktColor(p.mkt);
  if (p.blocked) row.classList.add('blocked');
  // Dot mkt
  const dot = el('span', 'compact-row-dot');
  dot.style.background = mktColor(p.mkt);
  row.appendChild(dot);
  // Nome plugin
  row.appendChild(el('span', 'compact-row-name', p.id));
  // Mkt
  row.appendChild(el('span', 'compact-row-sub', p.mkt));
  // Status badge
  let statusLabel, statusClass;
  if (p.scope === 'local') {
    statusLabel = p.projectName
      ? t('badge.scopeLocalNamed', { name: p.projectName })
      : t('badge.scopeLocal');
    statusClass = 'plugin-status-local';
  }
  else if (p.blocked) { statusLabel = t('badge.disabled');     statusClass = 'plugin-status-blocked'; }
  else                { statusLabel = t('badge.pluginActive'); statusClass = 'plugin-status-active'; }
  row.appendChild(el('span', 'compact-row-pstatus ' + statusClass, statusLabel));
  // Count summary
  const counts = [];
  if (p.skills.length) counts.push(p.skills.length + ' skill');
  if (p.agents.length) counts.push(p.agents.length + ' agent');
  if (p.hasMcp)        counts.push('mcp');
  if (p.hasHooks)      counts.push('hooks');
  if (counts.length) {
    row.appendChild(el('span', 'compact-row-counts', counts.join(' · ')));
  }
  row.addEventListener('click', () => showPluginContentModal(p));
  return row;
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
    p.scope === 'local'
      ? t('badge.scopeLocalNamed', { name: p.projectName || t('badge.scopeProgetto') })
      : t('badge.scopeGlobal'));
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
    const openBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'folder', ' ' + t('pluginCard.openFinder'));
    openBtn.title = p.projectPath || '';
    openBtn.addEventListener('click', async () => {
      // shell.openPath è il metodo corretto cross-platform per aprire una directory
      // nel file manager (Finder/Explorer/Files).
      if (!p.projectPath) return;
      const r = await window.claudeAPI.openDirectory(p.projectPath);
      if (!r.success) toast(t('toast.errorOpen', { msg: r.error }), 'error');
    });
    footer.appendChild(openBtn);
    card.appendChild(footer);
    return card;
  }

  // Toggle enable/disable
  const toggleWrap = el('label', 'toggle');
  toggleWrap.title = p.blocked ? t('plugin.activate') : t('plugin.deactivate');
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
      toast(t(action === 'enable' ? 'plugin.toastEnabled' : 'plugin.toastDisabled', { id: p.id }),
            action === 'enable' ? 'success' : 'warn');
      window.claudeAPI.showNotification(action === 'enable' ? t('plugin.notifActivated') : t('plugin.notifDeactivated'), p.id);
      statsCache = null;  // forza re-fetch contextBreakdown → barra si aggiorna
      await loadData();
    } else {
      toast(t('toast.errorPrefix', { msg: result.error }), 'error');
      inp.checked = !inp.checked; // revert
      toggleWrap.classList.remove('loading');
      inp.disabled = false;
    }
  });

  footer.appendChild(toggleWrap);

  // Action buttons
  const actions = el('div', 'pc-actions');

  const detailsBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  detailsBtn.dataset.tt = t('pluginCard.detailsTip');
  detailsBtn.appendChild(icon('eye'));
  detailsBtn.addEventListener('click', () => showPluginContentModal(p));

  const finderBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  finderBtn.dataset.tt = t('pluginCard.openSourceFinder');
  finderBtn.appendChild(icon('folder-open'));
  finderBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openPluginPath(p.fullId);
    if (!r.success) toast(t('toast.errorOpenFinder', { msg: r.error }), 'error');
  });

  const codeBtn = el('button', 'btn btn-sm btn-ghost btn-icon');
  codeBtn.dataset.tt = t('pluginCard.openSourceEditor');
  codeBtn.appendChild(icon('code'));
  codeBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.openInEditor(p.fullId);
    if (!r.success) toast(t('toast.errorOpenEditor', { msg: r.error }), 'error');
  });

  actions.appendChild(detailsBtn);
  actions.appendChild(finderBtn);
  actions.appendChild(codeBtn);

  const updateBtn = el('button', 'btn btn-sm btn-ghost', t('button.update'));
  updateBtn.addEventListener('click', async () => {
    updateBtn.disabled = true;
    updateBtn.textContent = '…';
    const r = await window.claudeAPI.pluginAction('update', p.fullId);
    if (r.success) {
      toast(t('toast.pluginUpdated', { id: p.id }), 'success');
      window.claudeAPI.showNotification(t('plugin.notifUpdated'), p.id);
    } else toast(t('toast.errorUpdate', { msg: r.error }), 'error');
    updateBtn.disabled = false;
    updateBtn.textContent = t('button.update');
    statsCache = null;
    await loadData();
  });

  const uninstBtn = el('button', 'btn btn-sm btn-danger', t('button.remove'));
  uninstBtn.addEventListener('click', async () => {
    const choice = await window.claudeAPI.confirmDialog({
      title:   t('confirm.removePlugin.title'),
      message: t('confirm.removePlugin.message', { id: p.id }),
      detail:  t('confirm.removePlugin.detail'),
      buttons: [t('button.cancel'), t('confirm.removePlugin.yes')],
    });
    if (choice !== 1) return;
    uninstBtn.disabled = true;
    const r = await window.claudeAPI.pluginAction('uninstall', p.fullId);
    if (r.success) {
      toast(t('toast.pluginRemoved', { id: p.id }), 'success');
      window.claudeAPI.showNotification(t('toast.pluginRemovedNotif'), p.id);
      statsCache = null;
      await loadData();
    } else {
      toast(t('toast.errorPrefix', { msg: r.error }), 'error');
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
  // v1.0.60 — Il guard del double-open è gestito da swapModalOverlay() a fine funzione
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', t('modalMkt.badge')));
  title.appendChild(document.createTextNode(' ' + t('modalMkt.title')));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
  header.appendChild(title); header.appendChild(closeBtn);

  const content = el('div', 'md-content');

  content.appendChild(el('p', null, t('modalMkt.intro')));

  // Input source
  const formWrap = el('div', 'add-mkt-form');
  const lbl = el('label', 'add-mkt-label', t('modalMkt.sourceLabel'));
  lbl.setAttribute('for', 'add-mkt-input');
  formWrap.appendChild(lbl);

  const input = el('input', 'add-mkt-input');
  input.id = 'add-mkt-input';
  input.type = 'text';
  input.placeholder = t('modalMkt.placeholder');
  input.setAttribute('spellcheck', 'false');
  input.setAttribute('autocomplete', 'off');
  formWrap.appendChild(input);

  const helper = el('div', 'add-mkt-helper');
  helper.appendChild(el('div', null, t('modalMkt.formatsTitle')));
  const ul = el('ul');
  ['modalMkt.formatShort', 'modalMkt.formatUrl', 'modalMkt.formatPath'].forEach(k => {
    const li = el('li', null, t(k));
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
  const cancelBtn = el('button', 'btn btn-sm btn-ghost', t('button.cancel'));
  cancelBtn.addEventListener('click', () => close());
  const submitBtn = el('button', 'btn btn-sm btn-primary', t('modalMkt.submit'));

  function showError(msg) {
    errBox.textContent = '⚠ ' + msg;
    errBox.style.display = 'block';
  }
  function clearError() { errBox.style.display = 'none'; errBox.textContent = ''; }

  // Validazione client-side: il main.js esegue la propria validazione regex
  // più strict prima di runClaudeArgs (validMarketplaceName). Qui filtriamo
  // solo input vuoti o palesemente malformati per evitare round-trip inutili.
  function validateSource(s) {
    if (!s) return t('modalMkt.errEmpty');
    if (s.length > 500) return t('modalMkt.errTooLong');
    // Caratteri shell pericolosi vietati anche se il main usa execFile
    if (/[;|&`$<>(){}[\]"'\\]/.test(s)) return t('modalMkt.errBadChars');
    return null;
  }

  async function submit() {
    clearError();
    const src = input.value.trim();
    const validationErr = validateSource(src);
    if (validationErr) { showError(validationErr); return; }
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    submitBtn.textContent = t('modalMkt.submitting');
    const r = await window.claudeAPI.marketplaceAction('add', '', src);
    if (r.success) {
      toast(t('toast.marketplaceAdded'), 'success');
      close();
      await loadData();
    } else {
      showError(r.error || t('modalMkt.errUnknown'));
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      submitBtn.textContent = t('modalMkt.submit');
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
  overlay._close = close;
  swapModalOverlay(overlay);

  // Focus automatico sull'input
  setTimeout(() => input.focus(), 50);
}

// v1.0.94 — Pack G v2 chiusura: modal "Aggiungi MCP server" che chiama
// `claude mcp add` con transport (http/sse/stdio) + name + URL/comando +
// env vars + headers HTTP. Coerente col pattern di showAddMarketplaceModal.
function showAddMcpModal() {
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', t('modalMcp.badge')));
  title.appendChild(document.createTextNode(' ' + t('modalMcp.title')));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
  header.appendChild(title); header.appendChild(closeBtn);

  const content = el('div', 'md-content');
  content.appendChild(el('p', null, t('modalMcp.intro')));

  const form = el('div', 'add-mcp-form');

  // Field: name
  form.appendChild(makeFormLabel(t('modalMcp.nameLabel'), t('modalMcp.nameHint')));
  const nameInp = makeFormInput('add-mcp-name', t('modalMcp.namePlaceholder'));
  form.appendChild(nameInp);

  // Field: transport
  form.appendChild(makeFormLabel(t('modalMcp.transportLabel'), t('modalMcp.transportHint')));
  const transWrap = el('div', 'add-mcp-radios');
  const transports = [
    { key: 'http',  label: t('modalMcp.transportHttp'),  desc: t('modalMcp.transportHttpDesc') },
    { key: 'sse',   label: t('modalMcp.transportSse'),   desc: t('modalMcp.transportSseDesc') },
    { key: 'stdio', label: t('modalMcp.transportStdio'), desc: t('modalMcp.transportStdioDesc') },
  ];
  let currentTransport = 'http';
  transports.forEach(tr => {
    const lbl = el('label', 'add-mcp-radio' + (tr.key === currentTransport ? ' selected' : ''));
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'mcp-transport';
    input.value = tr.key;
    if (tr.key === currentTransport) input.checked = true;
    input.addEventListener('change', () => {
      currentTransport = tr.key;
      transWrap.querySelectorAll('.add-mcp-radio').forEach(r => r.classList.toggle('selected', r.querySelector('input').value === tr.key));
      updateTargetPlaceholder();
      updateArgsVisibility();
    });
    lbl.appendChild(input);
    lbl.appendChild(el('span', 'add-mcp-radio-label', tr.label));
    lbl.appendChild(el('span', 'add-mcp-radio-desc', tr.desc));
    transWrap.appendChild(lbl);
  });
  form.appendChild(transWrap);

  // Field: target (URL o comando)
  const targetLabel = makeFormLabel(t('modalMcp.urlLabel'), t('modalMcp.urlHint'));
  form.appendChild(targetLabel);
  const targetInp = makeFormInput('add-mcp-target', t('modalMcp.urlPlaceholder'));
  form.appendChild(targetInp);

  // Field: args (solo se stdio)
  const argsLabel = makeFormLabel(t('modalMcp.argsLabel'), t('modalMcp.argsHint'));
  const argsInp = el('textarea', 'add-mcp-input add-mcp-textarea');
  argsInp.id = 'add-mcp-args';
  argsInp.placeholder = t('modalMcp.argsPlaceholder');
  argsInp.rows = 3;
  argsInp.spellcheck = false;
  form.appendChild(argsLabel);
  form.appendChild(argsInp);

  function updateTargetPlaceholder() {
    if (currentTransport === 'stdio') {
      targetLabel.querySelector('.add-mcp-label-title').textContent = t('modalMcp.commandLabel');
      targetLabel.querySelector('.add-mcp-label-hint').textContent = t('modalMcp.commandHint');
      targetInp.placeholder = t('modalMcp.commandPlaceholder');
    } else {
      targetLabel.querySelector('.add-mcp-label-title').textContent = t('modalMcp.urlLabel');
      targetLabel.querySelector('.add-mcp-label-hint').textContent = t('modalMcp.urlHintRemote', { transport: currentTransport.toUpperCase() });
      targetInp.placeholder = currentTransport === 'sse' ? t('modalMcp.urlPlaceholderSse') : t('modalMcp.urlPlaceholder');
    }
  }
  function updateArgsVisibility() {
    const showArgs = currentTransport === 'stdio';
    argsLabel.style.display = showArgs ? '' : 'none';
    argsInp.style.display   = showArgs ? '' : 'none';
  }
  updateArgsVisibility();

  // Field: env vars (opzionale, solo stdio tipicamente)
  form.appendChild(makeFormLabel(t('modalMcp.envLabel'), t('modalMcp.envHint')));
  const envInp = el('textarea', 'add-mcp-input add-mcp-textarea');
  envInp.id = 'add-mcp-env';
  envInp.placeholder = t('modalMcp.envPlaceholder');
  envInp.rows = 2;
  envInp.spellcheck = false;
  form.appendChild(envInp);

  // Field: headers (opzionale, solo HTTP/SSE)
  form.appendChild(makeFormLabel(t('modalMcp.headersLabel'), t('modalMcp.headersHint')));
  const hdrInp = el('textarea', 'add-mcp-input add-mcp-textarea');
  hdrInp.id = 'add-mcp-headers';
  hdrInp.placeholder = t('modalMcp.headersPlaceholder');
  hdrInp.rows = 2;
  hdrInp.spellcheck = false;
  form.appendChild(hdrInp);

  // Error box
  const errBox = el('div', 'add-mkt-error');
  errBox.style.display = 'none';
  form.appendChild(errBox);

  content.appendChild(form);

  // Actions
  const actions = el('div', 'add-mkt-actions');
  const cancelBtn = el('button', 'btn btn-sm btn-ghost', t('button.cancel'));
  cancelBtn.addEventListener('click', () => close());
  const submitBtn = el('button', 'btn btn-sm btn-primary', t('modalMcp.submit'));

  function showError(msg) { errBox.textContent = '⚠ ' + msg; errBox.style.display = 'block'; }
  function clearError()   { errBox.style.display = 'none';   errBox.textContent = ''; }

  async function submit() {
    clearError();
    const name = nameInp.value.trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) {
      showError(t('modalMcp.errName'));
      return;
    }
    const target = targetInp.value.trim();
    if (!target) { showError(t('modalMcp.errTarget')); return; }
    if (currentTransport !== 'stdio' && !/^https?:\/\//i.test(target)) {
      showError(t('modalMcp.errUrlScheme'));
      return;
    }
    const args = currentTransport === 'stdio'
      ? argsInp.value.split('\n').map(s => s.trim()).filter(Boolean)
      : [];
    const envs = envInp.value.split('\n').map(s => s.trim()).filter(Boolean);
    const headers = hdrInp.value.split('\n').map(s => s.trim()).filter(Boolean);

    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    submitBtn.textContent = t('modalMcp.submitting');
    const r = await window.claudeAPI.mcpAdd({
      name, transport: currentTransport, target, args, envs, headers, scope: 'user',
    });
    if (r.success) {
      toast(t('modalMcp.toastAdded', { name }), 'success');
      close();
      mcpCache = null;
      if (state.section === 'mcp') renderMcp();
    } else {
      showError(r.error || t('modalMcp.errUnknown'));
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      submitBtn.textContent = t('modalMcp.submit');
    }
  }
  submitBtn.addEventListener('click', submit);
  [nameInp, targetInp].forEach(i => i.addEventListener('input', clearError));

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  content.appendChild(actions);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
  setTimeout(() => nameInp.focus(), 50);
}

function makeFormLabel(title, hint) {
  const lbl = el('div', 'add-mcp-label');
  lbl.appendChild(el('span', 'add-mcp-label-title', title));
  if (hint) lbl.appendChild(el('span', 'add-mcp-label-hint', hint));
  return lbl;
}

function makeFormInput(id, placeholder) {
  const inp = el('input', 'add-mcp-input');
  inp.id = id;
  inp.type = 'text';
  inp.placeholder = placeholder;
  inp.spellcheck = false;
  inp.autocomplete = 'off';
  return inp;
}

// Modal "Plugin del marketplace": lista TUTTI i plugin presenti nel
// marketplace.json (anche non installati), con bottone "Installa" sui
// non-installati. m.plugins nello state contiene solo gli installati.
async function showMarketplaceContentModal(m) {
  // v1.0.60 — Il guard del double-open è gestito da swapModalOverlay() a fine funzione
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', 'marketplace'));
  title.appendChild(document.createTextNode(' ' + m.id));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
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
  overlay._close = close;
  swapModalOverlay(overlay);

  // Mostra placeholder mentre carichiamo i metadata
  const listWrap = el('div');
  content.appendChild(el('h3', 'plugin-content-section-title', t('plugin.pluginsInMkt')));
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
      const detailsBtn = el('button', 'btn btn-sm btn-ghost', t('button.details'));
      // v1.0.61 — Lascio che swapModalOverlay gestisca la rimozione: niente flash
      detailsBtn.addEventListener('click', () => showPluginContentModal(local));
      right.appendChild(detailsBtn);
    } else {
      const installBtn = el('button', 'btn btn-sm btn-primary', t('button.install'));
      installBtn.dataset.tt = 'claude plugins install ' + remote.name + '@' + m.id;
      installBtn.addEventListener('click', async () => {
        const ok = await window.claudeAPI.confirmDialog({
          title:   t('confirm.installPlugin.title'),
          message: t('confirm.installPlugin.message', { name: remote.name }),
          detail:  t('confirm.installPlugin.detailL1', { mkt: m.id }) + '\n\n' +
                   t('confirm.installPlugin.detailL2') + '\n' +
                   t('confirm.installPlugin.detailL3', { name: remote.name, mkt: m.id }) + '\n\n' +
                   (remote.description ? t('confirm.installPlugin.detailDesc', { desc: remote.description }) : ''),
          buttons: [t('button.cancel'), t('confirm.installPlugin.yes')],
        });
        if (ok !== 1) return;
        installBtn.disabled = true;
        installBtn.textContent = t('confirm.installPlugin.progress');
        const r = await window.claudeAPI.pluginAction('install', remote.name + '@' + m.id);
        if (r.success) {
          toast('Installato: ' + remote.name, 'success');
          window.claudeAPI.showNotification(t('plugin.notifInstalled'), remote.name + '@' + m.id);
          await loadData();
          close();  // chiudo il modal, lista refreshata
        } else {
          installBtn.disabled = false;
          installBtn.textContent = t('button.install');
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
    const detailsBtn = el('button', 'btn btn-sm btn-ghost', t('button.details'));
    // v1.0.61 — swapModalOverlay gestisce la transizione senza flash
    detailsBtn.addEventListener('click', () => showPluginContentModal(p));
    right.appendChild(detailsBtn);
    row.appendChild(right);
    container.appendChild(row);
  });
}

// v1.0.97 — Pack M: compact view row per Marketplace. Riga singola con
// dot colore + nome marketplace + count X/Y installati/disponibili + repo.
// Click apre il modal "Plugin del marketplace" (showMarketplaceContentModal).
function buildMarketplaceCompactRow(m) {
  const row = el('div', 'compact-row mkt-compact-row');
  row.style.borderLeftColor = mktColor(m.id);
  // Dot
  const dot = el('span', 'compact-row-dot');
  dot.style.background = mktColor(m.id);
  row.appendChild(dot);
  // Nome marketplace
  row.appendChild(el('span', 'compact-row-name', m.id));
  // Count X/Y
  const count = el('span', 'compact-row-counts');
  count.textContent = t('mkt.installedSlash', { installed: m.installed || 0, available: m.available || 0 });
  count.title = t('mkt.installedTip');
  row.appendChild(count);
  // Repo
  if (m.repo) {
    const r = el('span', 'compact-row-sub', 'github.com/' + m.repo);
    row.appendChild(r);
  }
  // Auto-update badge
  if (m.autoUpdate) {
    const au = el('span', 'compact-row-tag', t('mkt.autoUpdate'));
    row.appendChild(au);
  }
  row.addEventListener('click', () => showMarketplaceContentModal(m));
  return row;
}

function renderMarketplaces() {
  const wrap = el('div');

  // v1.1.8 — Empty state mascotte se nessun marketplace aggiunto
  if (!state.mktList.length) {
    wrap.appendChild(buildMascotEmpty({
      title: t('empty.bigNoMktTitle'),
      message: t('empty.bigNoMktMsg'),
      cta: { label: t('empty.bigNoMktCta'), onClick: () => showAddMarketplaceModal() },
    }));
    setContent(wrap);
    return;
  }

  const hdr = el('div', 'section-header');
  hdr.appendChild(el('span', 'section-count', t('mkt.mktConfigured', { n: state.mktList.length })));

  // v1.0.97 — Pack M: view switcher cards/compatta per Marketplace
  const mMode = state.viewMode.marketplaces;
  hdr.appendChild(renderViewSwitcher('marketplaces', mMode, (m) => setViewMode('marketplaces', m)));

  // v1.0.55 — Selector di ordinamento
  const sortWrap = el('div', 'mkt-sort-wrap');
  sortWrap.appendChild(el('span', 'mkt-sort-label', t('sort.label')));
  const sortSel = el('select', 'mkt-sort-select');
  [
    { v: 'default',      k: 'sort.mktDefault' },
    { v: 'added-desc',   k: 'sort.mktAddedDesc' },
    { v: 'added-asc',    k: 'sort.mktAddedAsc' },
    { v: 'updated-desc', k: 'sort.mktUpdatedDesc' },
    { v: 'updated-asc',  k: 'sort.mktUpdatedAsc' },
  ].forEach(o => {
    const opt = el('option', null, t(o.k));
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

  // Grid: cards (default) o compact list
  if (mMode === 'compact') {
    const list = el('div', 'compact-list');
    state.mktList.forEach(m => {
      list.appendChild(buildMarketplaceCompactRow(m));
    });
    wrap.appendChild(list);
    setContent(wrap);
    return;
  }

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
        ? t('plugin.seePlugins')
        : t('plugin.seeAndInstall');
      countBtn.addEventListener('click', () => showMarketplaceContentModal(m));
    } else {
      countBtn.disabled = true;
    }
    const autoBadge = el('span', 'badge ' + (m.autoUpdate ? 'b-auto' : 'b-manual'),
      m.autoUpdate ? t('mkt.autoUpdate') : t('mkt.manualUpdate'));
    meta.appendChild(countBtn);
    meta.appendChild(autoBadge);
    body.appendChild(meta);

    if (m.lastUpdated) {
      const d = new Date(m.lastUpdated);
      const note = el('div', 'mkt-card-note', t('mkt.lastUpdate') + ': ' + d.toLocaleDateString(t('time.locale')));
      body.appendChild(note);
    }

    card.appendChild(body);


    // Remove button
    const cardFooter = el('div');
    cardFooter.style.cssText = 'padding:10px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;';

    const updateMktBtn = el('button', 'btn btn-sm btn-ghost', '↻ ' + t('mkt.updateBtn'));
    updateMktBtn.addEventListener('click', async () => {
      updateMktBtn.disabled = true; updateMktBtn.textContent = '…';
      const r = await window.claudeAPI.marketplaceAction('update', m.id);
      if (r.success) toast(t('mkt.toastUpdated', { id: m.id }), 'success');
      else if (!(await maybeShowCorruptedMarketplace(r.error, m.id)))
        toast(t('toast.errorPrefix', { msg: r.error }), 'error');
      updateMktBtn.disabled = false; updateMktBtn.textContent = '↻ ' + t('mkt.updateBtn');
    });

    const removeMktBtn = el('button', 'btn btn-sm btn-danger', t('button.remove'));
    removeMktBtn.addEventListener('click', async () => {
      const choice = await window.claudeAPI.confirmDialog({
        title:   t('confirm.removeMarketplace.title'),
        message: t('confirm.removeMarketplace.message', { id: m.id }),
        detail:  t('confirm.removeMarketplace.detail'),
        buttons: [t('button.cancel'), t('confirm.removeMarketplace.yes')],
      });
      if (choice !== 1) return;
      const r = await window.claudeAPI.marketplaceAction('remove', m.id);
      if (r.success) { toast(t('toast.mktRemoved', { id: m.id }), 'success'); await loadData(); }
      else toast(t('toast.errorPrefix', { msg: r.error }), 'error');
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
  const all = [...globals, ...locals].sort(NAME_SORTERS[state.skillSort] || NAME_SORTERS['name-asc']);
  const mode = state.viewMode.skills;
  const gridCls = mode === 'cards' ? 'browse-card-grid' : 'skill-grid';
  const builder = mode === 'cards'
    ? (item) => buildSkillAgentCard(item, 'skill')
    : (item) => buildSkillAgentChip(item, 'skill');

  renderListSection(all, 'skills', builder,
    item => item.name + ' ' + item.plugin + ' ' + item.mkt + (item.projectName || ''),
    gridCls,
    {
      currentKey: state.skillSort,
      options: SORT_OPTIONS.skill,
      onChange: async (key) => {
        state.skillSort = key;
        await window.claudeAPI.setState({ skillSort: key });
        renderSkills();
      },
      viewSwitcher: {
        section: 'skills', mode,
        onChange: (m) => setViewMode('skills', m),
      },
    },
    {
      title: t('empty.bigNoSkillTitle'),
      message: t('empty.bigNoSkillMsg'),
      cta: { label: t('empty.bigGoToPlugin'), onClick: () => switchToSection('plugins') },
    });
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
  const all = [...globals, ...locals].sort(NAME_SORTERS[state.agentSort] || NAME_SORTERS['name-asc']);
  const mode = state.viewMode.agents;
  const gridCls = mode === 'cards' ? 'browse-card-grid' : 'skill-grid';
  const builder = mode === 'cards'
    ? (item) => buildSkillAgentCard(item, 'agent')
    : (item) => buildSkillAgentChip(item, 'agent');

  renderListSection(all, 'agents', builder,
    item => item.name + ' ' + item.plugin + ' ' + item.mkt + (item.projectName || ''),
    gridCls,
    {
      currentKey: state.agentSort,
      options: SORT_OPTIONS.agent,
      onChange: async (key) => {
        state.agentSort = key;
        await window.claudeAPI.setState({ agentSort: key });
        renderAgents();
      },
      viewSwitcher: {
        section: 'agents', mode,
        onChange: (m) => setViewMode('agents', m),
      },
    },
    {
      title: t('empty.bigNoAgentTitle'),
      message: t('empty.bigNoAgentMsg'),
      cta: { label: t('empty.bigGoToPlugin'), onClick: () => switchToSection('plugins') },
    });
}

// v1.0.96 — Pack M: builder chip "compact view" condiviso fra skill/agent
// (era inline in renderSkills/renderAgents prima del refactor). `kind` =
// 'skill' | 'agent' per dot color e icon nel modal preview.
function buildSkillAgentChip(item, kind) {
  const chip = el('div', 'skill-chip' + (item.scope === 'local' ? ' local-scope' : ' clickable') + (item.blocked ? ' blocked' : ''));
  chip.style.borderLeftColor = mktColor(item.mkt);
  const dot = el('span');
  const dotColor = kind === 'agent' ? '#f97316' : mktColor(item.mkt);
  dot.style.cssText = 'width:6px;height:6px;border-radius:50%;flex-shrink:0;background:' + dotColor;
  chip.appendChild(dot);
  chip.appendChild(el('span', 'skill-chip-name', item.name));
  chip.appendChild(el('span', 'skill-chip-plugin', item.plugin));
  appendHealthBadge(chip, item.health);
  appendScopeBadge(chip, item);
  appendModifiedBadge(chip, item, kind, 'chip');
  if (item.scope === 'global') {
    chip.addEventListener('click', () => openMarkdownPreview(item.fullId, kind, item.name));
  }
  return chip;
}

// v1.0.100 — Helper: l'item è stato editato localmente dall'utente?
// Cross-check con state.modifiedFiles (popolato dal save dell'editor inline).
function isLocallyModified(item, kind) {
  if (!item.fullId) return false;
  return !!(state.modifiedFiles && state.modifiedFiles[modifiedFileKey(kind, item.fullId, item.name)]);
}

// v1.0.96 — Pack M: builder card "vista ampia" per skill/agent.
// Layout simile a .hook-card: header con name grande + plugin/mkt dot,
// body con scope badge + health badge, footer con bottone "Apri preview".
function buildSkillAgentCard(item, kind) {
  const card = el('div', 'browse-card' + (item.blocked ? ' blocked' : ''));
  card.style.borderLeftColor = kind === 'agent' ? '#f97316' : mktColor(item.mkt);

  // Header: nome grande + plugin + dot mkt
  const head = el('div', 'browse-card-head');
  const titleWrap = el('div', 'browse-card-title-wrap');
  titleWrap.appendChild(el('div', 'browse-card-title', item.name));
  const pluginLine = el('div', 'browse-card-plugin-line');
  const dot = el('span', 'browse-card-mkt-dot');
  dot.style.background = mktColor(item.mkt);
  pluginLine.appendChild(dot);
  pluginLine.appendChild(el('span', 'browse-card-plugin', item.plugin));
  if (item.mkt) pluginLine.appendChild(el('span', 'browse-card-mkt', item.mkt));
  titleWrap.appendChild(pluginLine);
  head.appendChild(titleWrap);
  card.appendChild(head);

  // Body: scope + health
  const body = el('div', 'browse-card-body');
  const badgeRow = el('div', 'browse-card-badges');
  const scopeBadge = el('span', 'scope-badge scope-' + item.scope,
    item.scope === 'local' ? (item.projectName || t('badge.scopeLocal')) : t('badge.scopeGlobal'));
  if (item.projectPath) scopeBadge.title = item.projectPath;
  badgeRow.appendChild(scopeBadge);
  if (item.health && item.health.status !== 'ok') {
    // v1.0.98 — Badge rettangolare proper + tooltip esplicativo arricchito
    // che spiega cos'è il problema e come può essere risolto. Gli health
    // issues sono errori del manifest del plugin (autore), non feature
    // mancanti sul sistema utente — quindi i fix sono: (a) modificare il
    // file `.md` localmente (viene sovrascritto al prossimo update), o
    // (b) aprire issue sul repo del plugin per fix permanente upstream.
    const hb = el('span', 'browse-card-health h-' + item.health.status);
    hb.appendChild(icon('triangle-alert'));
    hb.appendChild(document.createTextNode(item.health.status === 'err' ? t('badge.healthError') : t('badge.healthWarn')));
    const issues = item.health.issues || [];
    hb.title = t('pluginCard.healthLong', {
      issues: issues.map(i => '  • ' + i).join('\n'),
      repo: item.mkt || t('pluginCard.healthRepoFallback'),
    });
    badgeRow.appendChild(hb);
  }
  if (item.blocked) {
    badgeRow.appendChild(el('span', 'browse-card-blocked', t('badge.disabled')));
  }
  appendModifiedBadge(badgeRow, item, kind, 'card');
  body.appendChild(badgeRow);
  card.appendChild(body);

  // Footer: bottone azione (solo per scope global, locali non hanno preview)
  if (item.scope === 'global') {
    const foot = el('div', 'browse-card-foot');
    const openBtn = btnWithIcon('btn btn-sm btn-ghost', 'eye', t('button.openPreview'));
    openBtn.addEventListener('click', e => {
      e.stopPropagation();
      openMarkdownPreview(item.fullId, kind, item.name);
    });
    foot.appendChild(openBtn);
    card.appendChild(foot);
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openMarkdownPreview(item.fullId, kind, item.name));
  } else {
    // Locali: no preview, mostra path progetto
    const foot = el('div', 'browse-card-foot');
    foot.appendChild(el('span', 'browse-card-hint',
      'Locale al progetto · preview disponibile solo per global'));
    card.appendChild(foot);
  }

  return card;
}

// v1.0.81 — Rimosso `appendRunButton` (era il bottone ⎘ per-riga delle card
// skill/agent introdotto in v1.0.78). Copiava solo il nome del chip che è
// già visibile a colpo d'occhio → bassissimo valore. Il copia "utile" è
// quello dentro il modal markdown preview che copia l'intero contenuto del
// documento (vedi `showMarkdownModal` header).

/* ── HOOKS (v1.0.83 — Pack K) ─────────────────────────────────────────── */

// v1.0.87 — Helper: lista dei tool CLI dichiarati dagli handler di un hook
// item ma NON installati nel sistema (cross-check con state.rawData.hookDepsAvailability,
// popolato dal backend tramite `which`/`where`). Vuoto se tutti i tool sono
// presenti o se l'item non ha detectedDeps.
function missingDepsForHook(item) {
  const avail = (state.rawData && state.rawData.hookDepsAvailability) || {};
  const missing = new Set();
  for (const h of (item.handlers || [])) {
    for (const dep of (h.detectedDeps || [])) {
      const info = avail[dep];
      if (info && !info.installed) missing.add(dep);
    }
  }
  return Array.from(missing).sort();
}

// Aggrega tutti gli hook event di tutti i plugin installati in una lista
// piatta { event, matcher, handlers, pluginId, mkt, fullId, scope, sourcePath }.
// Ogni combinazione event+matcher di un plugin diventa una card.
//
// v1.0.102 — Memoized: state.plugins è immutabile fra loadData() — un'unica
// computazione per ciclo dati. processData() invalida la cache settando
// state._hookListCache = null. Usata sia da renderHooks che da renderDashboard
// (KPI "Hooks · N plugin") che prima ricomputava la lista identica.
function buildHookList() {
  if (state._hookListCache) return state._hookListCache;
  const list = [];
  state.plugins.forEach(p => {
    if (!Array.isArray(p.hookEvents)) return;
    p.hookEvents.forEach(ev => {
      const matchers = Array.isArray(ev.matchers) && ev.matchers.length
        ? ev.matchers
        : [{ matcher: '', handlers: [] }];
      matchers.forEach(m => {
        list.push({
          event:      ev.event,
          matcher:    m.matcher || '',
          handlers:   m.handlers || [],
          pluginId:   p.id,
          mkt:        p.mkt,
          fullId:     p.fullId,
          scope:      p.scope,
          projectName:p.projectName || '',
          projectPath:p.projectPath || '',
          sourcePath: ev.sourcePath || '',
        });
      });
    });
  });
  state._hookListCache = list;
  return list;
}

function renderHooks() {
  const all  = buildHookList().sort(HOOK_SORTERS[state.hookSort] || HOOK_SORTERS['event-asc']);
  const f    = state.filters.hooks;
  const wrap = el('div');

  // Riga 1: search
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
  inp.setAttribute('placeholder', t('search.hooks'));
  inp.setAttribute('type', 'text');
  inp.value = f.search;
  sw.appendChild(inp);
  bar.appendChild(sw);
  wrap.appendChild(bar);

  // Riga 2: filtri event + scope
  const filterRow = el('div', 'hook-filter-row');
  const events = Array.from(new Set(all.map(h => h.event))).sort();
  const evWrap = el('div', 'hook-filter-group');
  evWrap.appendChild(el('span', 'hook-filter-label', t('hooksPage.eventLabel')));
  const evAll = el('button', 'hook-filter-chip' + (f.event === 'all' ? ' active' : ''), t('filter.all'));
  evAll.addEventListener('click', () => { state.filters.hooks.event = 'all'; renderHooks(); });
  evWrap.appendChild(evAll);
  events.forEach(e => {
    const chip = el('button', 'hook-filter-chip' + (f.event === e ? ' active' : ''), e);
    chip.style.borderColor = hookEventColor(e);
    if (f.event === e) chip.style.background = hookEventColor(e);
    chip.title = hookEventDoc(e);  // v1.0.101 — tooltip esplicativo anche sui chip filter
    chip.addEventListener('click', () => { state.filters.hooks.event = e; renderHooks(); });
    evWrap.appendChild(chip);
  });
  filterRow.appendChild(evWrap);

  const scWrap = el('div', 'hook-filter-group');
  scWrap.appendChild(el('span', 'hook-filter-label', t('hooksPage.scopeLabel')));
  ['all', 'global', 'local'].forEach(key => {
    const lbl = key === 'all' ? t('filter.all') : (key === 'global' ? t('filter.globals') : t('filter.locals'));
    const chip = el('button', 'hook-filter-chip' + (f.scope === key ? ' active' : ''), lbl);
    chip.addEventListener('click', () => { state.filters.hooks.scope = key; renderHooks(); });
    scWrap.appendChild(chip);
  });
  filterRow.appendChild(scWrap);

  // v1.0.94 — Pack K extension: filtro per plugin di provenienza. Dropdown
  // invece di chip multipli perché con 5+ plugin la lista chip occuperebbe
  // 2 righe. Lista plugins estratta dinamicamente dagli hook visibili.
  const plugins = Array.from(new Set(all.map(h => h.pluginId))).sort();
  if (plugins.length > 1) {
    const plWrap = el('div', 'hook-filter-group');
    plWrap.appendChild(el('span', 'hook-filter-label', t('hooksPage.pluginLabel')));
    const sel = el('select', 'hook-filter-select');
    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = t('hooksPage.allWithCount', { n: plugins.length });
    if (f.plugin === 'all') optAll.selected = true;
    sel.appendChild(optAll);
    plugins.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (f.plugin === p) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => { state.filters.hooks.plugin = sel.value; renderHooks(); });
    plWrap.appendChild(sel);
    filterRow.appendChild(plWrap);
  }
  wrap.appendChild(filterRow);

  // Riga 3: header con count + view switcher + sort dropdown
  const hdr = el('div', 'section-header');
  const countEl = el('span', 'section-count', '');
  hdr.appendChild(countEl);
  // v1.0.97 — Pack M: view switcher cards/compatta per Hooks
  const hMode = state.viewMode.hooks;
  hdr.appendChild(renderViewSwitcher('hooks', hMode, (m) => setViewMode('hooks', m)));
  hdr.appendChild(renderSortDropdown(state.hookSort, SORT_OPTIONS.hook, async (key) => {
    state.hookSort = key;
    await window.claudeAPI.setState({ hookSort: key });
    renderHooks();
  }));
  wrap.appendChild(hdr);

  // Grid: cards (default) o compact list
  const grid = el('div', hMode === 'cards' ? 'hook-grid' : 'compact-list');
  const cards = [];
  all.forEach(item => {
    const card = hMode === 'cards' ? buildHookCard(item) : buildHookCompactRow(item);
    grid.appendChild(card);
    cards.push(card);
  });

  function applyFilters() {
    const q = inp.value.toLowerCase();
    state.filters.hooks.search = q;
    let visible = 0;
    cards.forEach((card, i) => {
      const it = all[i];
      const matchSearch = !q
        || it.event.toLowerCase().includes(q)
        || it.matcher.toLowerCase().includes(q)
        || it.pluginId.toLowerCase().includes(q)
        || (it.handlers || []).some(h => (h.command || '').toLowerCase().includes(q));
      const matchEvent  = f.event  === 'all' || it.event    === f.event;
      const matchScope  = f.scope  === 'all' || it.scope    === f.scope;
      const matchPlugin = f.plugin === 'all' || it.pluginId === f.plugin;
      const show = matchSearch && matchEvent && matchScope && matchPlugin;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    countEl.textContent = t('counter.items', { visible, total: all.length });
  }

  inp.addEventListener('input', applyFilters);
  applyFilters();

  wrap.appendChild(grid);

  if (!all.length) {
    setContent(buildMascotEmpty({
      title: t('empty.bigNoHookTitle'),
      message: t('empty.bigNoHookMsg'),
      cta: { label: t('empty.bigGoToPlugin'), onClick: () => switchToSection('plugins') },
    }));
    return;
  }

  setContent(wrap);
  inp.focus();
}

function buildHookCard(item) {
  const card = el('div', 'hook-card');
  card.style.borderLeftColor = hookEventColor(item.event);

  // Header: badge evento colorato + plugin + scope
  const head = el('div', 'hook-card-head');
  const evBadge = el('span', 'hook-event-badge', item.event);
  evBadge.style.background = hookEventColor(item.event);
  evBadge.title = hookEventDoc(item.event);  // v1.0.101 — tooltip esplicativo event
  head.appendChild(evBadge);
  const pluginLine = el('span', 'hook-plugin-line');
  pluginLine.appendChild(el('span', 'hook-plugin-name', item.pluginId));
  if (item.mkt) {
    const dot = el('span', 'hook-plugin-mkt-dot');
    dot.style.background = mktColor(item.mkt);
    pluginLine.appendChild(dot);
    pluginLine.appendChild(el('span', 'hook-plugin-mkt', item.mkt));
  }
  head.appendChild(pluginLine);
  const scopeBadge = el('span', 'scope-badge scope-' + item.scope,
    item.scope === 'local' ? (item.projectName || t('badge.scopeLocal')) : t('badge.scopeGlobal'));
  if (item.projectPath) scopeBadge.title = item.projectPath;
  head.appendChild(scopeBadge);
  card.appendChild(head);

  // v1.0.87 — Badge ⚠ se almeno un handler richiede tool CLI non installati
  // (vedi src/lib/hookDeps.js). Lista i tool mancanti in ordine, tooltip
  // contiene gli install hint. Spiega all'utente PRIMA che apra il
  // terminale perché un hook potrebbe fallire silenziosamente al boot.
  // v1.0.91 — Aggiunto bottone "▶ Installa" per tool con installCommand
  // disponibile per la piattaforma corrente. Click → confirm + open terminal
  // + pre-digita comando (no Enter automatico, l'utente conferma manualmente).
  const missingDeps = missingDepsForHook(item);
  if (missingDeps.length) {
    const warnRow = el('div', 'hook-missing-deps-row');
    const warnBadge = el('span', 'hook-missing-deps-badge');
    warnBadge.appendChild(icon('triangle-alert'));
    warnBadge.appendChild(document.createTextNode('Manca: ' + missingDeps.join(', ')));
    const avail = (state.rawData && state.rawData.hookDepsAvailability) || {};
    const hints = missingDeps
      .map(d => (avail[d] && avail[d].installHint) ? (d + '\n' + avail[d].installHint) : (d + ': installazione manuale richiesta'))
      .join('\n\n');
    warnBadge.title = 'Tool richiesti dal command degli handler ma non trovati nel PATH:\n\n' + hints +
      '\n\nInstalla gli strumenti mancanti per evitare errori `hook startup` al boot di `claude`.';
    warnRow.appendChild(warnBadge);

    // Mini-bottone "Installa" per ogni tool mancante con installCommand
    missingDeps.forEach(dep => {
      const info = avail[dep];
      if (!info) return;
      if (info.installCommand) {
        const btn = btnWithIcon('hook-dep-install-btn', 'play', t('hookDep.installBtn', { dep }));
        btn.title = 'Apre il terminale integrato + pre-digita:\n' + info.installCommand
          + '\n\nNON premerà Enter automatico — conferma tu premendo Invio se vuoi procedere.';
        btn.addEventListener('click', e => { e.stopPropagation(); installDepInTerminal(dep, info.installCommand); });
        warnRow.appendChild(btn);
      } else if (info.docsUrl) {
        // Tool senza installer one-liner (es. Docker Desktop, gcloud) → solo link docs
        const link = btnWithIcon('hook-dep-install-btn hook-dep-install-docs', 'external-link', t('hookDep.docsBtn', { dep }));
        link.title = t('hookDep.docsTip', { dep });
        link.addEventListener('click', e => { e.stopPropagation(); window.claudeAPI.openExternal(info.docsUrl); });
        warnRow.appendChild(link);
      }
    });
    card.appendChild(warnRow);
  }

  // Matcher (opzionale)
  if (item.matcher) {
    const matcherRow = el('div', 'hook-matcher-row');
    matcherRow.appendChild(el('span', 'hook-matcher-label', 'matcher'));
    matcherRow.appendChild(el('code', 'hook-matcher-value', item.matcher));
    card.appendChild(matcherRow);
  }

  // Handlers preview (max 2 righe, "+N altri" se più)
  const handlersWrap = el('div', 'hook-handlers');
  const handlers = item.handlers || [];
  const visible = handlers.slice(0, 2);
  visible.forEach(h => {
    const row = el('div', 'hook-handler-row');
    const typeBadge = el('span', 'hook-handler-type', h.type || 'command');
    row.appendChild(typeBadge);
    if (h.shell) {
      const shellBadge = el('span', 'hook-handler-shell', h.shell);
      row.appendChild(shellBadge);
    }
    if (h.async) {
      const asyncBadge = el('span', 'hook-handler-async', 'async');
      row.appendChild(asyncBadge);
    }
    if (typeof h.timeout === 'number') {
      const timeoutBadge = el('span', 'hook-handler-timeout', h.timeout + 's');
      row.appendChild(timeoutBadge);
    }
    const cmd = el('code', 'hook-handler-cmd', truncate(h.command || '', 140));
    cmd.title = h.command || '';
    row.appendChild(cmd);
    handlersWrap.appendChild(row);
  });
  if (handlers.length > visible.length) {
    const more = el('div', 'hook-handler-more',
      '+ ' + (handlers.length - visible.length) + ' altro/i — clicca per vedere tutto');
    handlersWrap.appendChild(more);
  }
  card.appendChild(handlersWrap);

  // Footer azioni
  const foot = el('div', 'hook-card-foot');
  const detailBtn = btnWithIcon('btn btn-sm btn-ghost', 'eye', t('button.details'));
  detailBtn.addEventListener('click', e => { e.stopPropagation(); showHookDetailsModal(item); });
  foot.appendChild(detailBtn);
  if (item.sourcePath) {
    const openBtn = btnWithIcon('btn btn-sm btn-ghost', 'folder-open', t('button.openHooksJson'));
    openBtn.addEventListener('click', e => {
      e.stopPropagation();
      window.claudeAPI.openDirectory(item.sourcePath);
    });
    foot.appendChild(openBtn);
  }
  card.appendChild(foot);

  card.addEventListener('click', () => showHookDetailsModal(item));
  return card;
}

function truncate(s, n) { return s && s.length > n ? s.slice(0, n - 1) + '…' : s; }

// v1.0.97 — Pack M: compact view row per la sezione Hooks. Riga singola
// con badge event mini + plugin + matcher truncato + indicatore deps mancanti.
// Click sulla riga apre il modal dettagli completo (come la card).
function buildHookCompactRow(item) {
  const row = el('div', 'compact-row hook-compact-row');
  row.style.borderLeftColor = hookEventColor(item.event);
  // Badge event
  const evBadge = el('span', 'hook-event-badge hook-event-badge-sm', item.event);
  evBadge.style.background = hookEventColor(item.event);
  evBadge.title = hookEventDoc(item.event);  // v1.0.101 — tooltip esplicativo event
  row.appendChild(evBadge);
  // Plugin
  row.appendChild(el('span', 'compact-row-plugin', item.pluginId));
  // Matcher (mono truncato)
  if (item.matcher) {
    const m = el('code', 'compact-row-matcher', truncate(item.matcher, 30));
    m.title = item.matcher;
    row.appendChild(m);
  }
  // Scope badge
  const scopeBadge = el('span', 'scope-badge scope-' + item.scope,
    item.scope === 'local' ? (item.projectName || t('badge.scopeLocal')) : t('badge.scopeGlobal'));
  if (item.projectPath) scopeBadge.title = item.projectPath;
  row.appendChild(scopeBadge);
  // Warning deps mancanti
  const missingDeps = missingDepsForHook(item);
  if (missingDeps.length) {
    const w = el('span', 'compact-row-warn');
    w.appendChild(icon('triangle-alert'));
    w.appendChild(document.createTextNode('manca ' + missingDeps.join(', ')));
    w.title = 'Tool richiesti dagli handler ma non installati: ' + missingDeps.join(', ');
    row.appendChild(w);
  }
  row.addEventListener('click', () => showHookDetailsModal(item));
  return row;
}

// v1.0.93 — Polling jobs attivi per detection auto-completamento install di
// un tool. Una chiave per tool, valore = id setInterval (per poter clearare
// se l'utente rilancia install su stesso tool).
const _depInstallPollers = new Map();

// Polla `hooks:check-tool` ogni 5s fino a quando il tool diventa disponibile
// o passa il timeout (3 min). Quando trovato → invalida cache + ricarica UI
// + toast success. Non blocca: parte in background dopo che l'utente lancia
// l'install nel terminale.
function startDepInstallPoller(tool) {
  // Pulisci eventuali poller precedenti per lo stesso tool
  const old = _depInstallPollers.get(tool);
  if (old) clearInterval(old);

  const startedAt = Date.now();
  const MAX_DURATION_MS = 3 * 60 * 1000;  // 3 minuti
  const INTERVAL_MS = 5 * 1000;            // poll ogni 5s

  const id = setInterval(async () => {
    if (Date.now() - startedAt > MAX_DURATION_MS) {
      clearInterval(id);
      _depInstallPollers.delete(tool);
      toast('Timeout: ' + tool + ' non rilevato dopo 3 minuti. Clicca "↻ Aggiorna" se hai completato l\'install.', 'info');
      return;
    }
    try {
      const r = await window.claudeAPI.checkHookTool(tool);
      if (r && r.ok && r.installed) {
        clearInterval(id);
        _depInstallPollers.delete(tool);
        toast('✓ ' + tool + ' installato! Ricarico dati…', 'success');
        await window.claudeAPI.refreshHookDeps();
        await loadData();
      }
    } catch { /* graceful: prossimo tick riprova */ }
  }, INTERVAL_MS);

  _depInstallPollers.set(tool, id);
}

// v1.0.91 — Pack K extension: install di un tool CLI mancante via terminale
// integrato. Pattern identico al reconnect MCP del Pack G v2 (open-terminal +
// preDigit). NIENTE Enter automatico: l'utente deve confermare manualmente
// premendo Invio dentro il terminale. Confirm dialog blocca prima del lancio
// per evitare esecuzioni accidentali.
// v1.0.93 — Dopo il lancio parte un polling che rileva auto-completamento
// dell'install e ricarica i dati senza richiedere click manuale su Aggiorna.
async function installDepInTerminal(tool, installCommand) {
  // confirm-dialog ritorna direttamente il numero della risposta (0 = Annulla,
  // 1 = Apri terminale). NON un oggetto {response} — bug fixato in v1.0.92.
  const response = await window.claudeAPI.confirmDialog({
    title:   t('confirm.installTool.title', { tool }),
    message: t('confirm.installTool.message', { tool }),
    detail:  t('confirm.installTool.detail', { cmd: installCommand }),
    buttons: [t('button.cancel'), t('confirm.installTool.yes')],
  });
  if (response !== 1) return;

  // Apre drawer + nuova tab senza eseguire alcun comando (evita prompt vuoto
  // come accadrebbe con openTerminalWithCommand('') che fa pty.write('\r')).
  if (!termState.caps || !termState.caps.available) {
    toast('Terminale integrato non disponibile su questa piattaforma', 'error');
    return;
  }
  if (!termState.open) termSetOpen(true);
  const tab = await termCreateTab({
    cwd:   termState.caps.defaultCwd,
    shell: null,
  });
  if (!tab) return;
  toast('Pre-digitato: ' + tool + ' — premi Invio nel terminale per installare', 'info');
  // Aspetta che la shell stampi il prompt iniziale, poi pre-digita il comando.
  // 600ms è prudente per shell lente (zsh con powerlevel10k, ecc.)
  setTimeout(() => {
    try { window.claudeAPI.pty.write(tab.ptyId, installCommand); } catch {}
  }, 600);
  // v1.0.93 — Avvia polling auto: quando il tool appare nel PATH, CLACOROO
  // ricarica i dati e fa sparire il badge "Manca" senza che l'utente debba
  // cliccare "↻ Aggiorna". Timeout 3 minuti per evitare polling infinito se
  // l'utente decide di non eseguire l'install (e basta una Ctrl+C nel pty).
  startDepInstallPoller(tool);
}

function showHookDetailsModal(item) {
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal hook-modal');

  const header = el('div', 'md-header');
  const titleWrap = el('div', 'md-title');
  const evBadge = el('span', 'hook-event-badge', item.event);
  evBadge.style.background = hookEventColor(item.event);
  evBadge.title = hookEventDoc(item.event);  // v1.0.101 — tooltip esplicativo event
  titleWrap.appendChild(evBadge);
  titleWrap.appendChild(el('span', 'hook-modal-plugin', item.pluginId + (item.mkt ? ' · ' + item.mkt : '')));
  header.appendChild(titleWrap);

  const copyBtn = btnWithIcon('md-copy', 'copy', t('button.copy'));
  copyBtn.title = t('button.copyHookJson');
  copyBtn.addEventListener('click', () => {
    const json = JSON.stringify({
      event: item.event,
      matcher: item.matcher,
      hooks: item.handlers,
    }, null, 2);
    navigator.clipboard.writeText(json);
    toast('JSON hook copiato negli appunti', 'success');
  });
  header.appendChild(copyBtn);

  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.title = 'Chiudi (Esc)';
  header.appendChild(closeBtn);

  modal.appendChild(header);

  const body = el('div', 'md-content hook-modal-body');
  if (item.matcher) {
    const row = el('div', 'hook-detail-row');
    row.appendChild(el('span', 'hook-detail-label', t('plugin.matcher')));
    row.appendChild(el('code', 'hook-detail-value', item.matcher));
    body.appendChild(row);
  }
  const scopeRow = el('div', 'hook-detail-row');
  scopeRow.appendChild(el('span', 'hook-detail-label', t('plugin.scope')));
  scopeRow.appendChild(el('span', '', item.scope === 'local'
    ? t('badge.scopeLocalParen', { name: item.projectName || item.projectPath })
    : t('badge.scopeGlobal')));
  body.appendChild(scopeRow);

  const handlersTitle = el('h3', 'hook-detail-title', 'Handlers (' + (item.handlers || []).length + ')');
  body.appendChild(handlersTitle);
  const avail = (state.rawData && state.rawData.hookDepsAvailability) || {};
  (item.handlers || []).forEach((h, i) => {
    const block = el('div', 'hook-handler-block');
    const meta = el('div', 'hook-handler-meta');
    meta.appendChild(el('span', 'hook-handler-idx', '#' + (i + 1)));
    meta.appendChild(el('span', 'hook-handler-type', h.type || 'command'));
    if (h.shell) meta.appendChild(el('span', 'hook-handler-shell', 'shell: ' + h.shell));
    if (h.async) meta.appendChild(el('span', 'hook-handler-async', 'async'));
    if (typeof h.timeout === 'number') meta.appendChild(el('span', 'hook-handler-timeout', 'timeout: ' + h.timeout + 's'));
    block.appendChild(meta);

    // v1.0.87 — Dipendenze rilevate per questo handler: una "pill" per
    // ogni tool, verde se installato, arancione warning se mancante con
    // suggerimento di installazione cliccando.
    if (Array.isArray(h.detectedDeps) && h.detectedDeps.length) {
      const depsRow = el('div', 'hook-handler-deps');
      depsRow.appendChild(el('span', 'hook-handler-deps-label', t('hooksPage.depsLabel')));
      h.detectedDeps.forEach(tool => {
        const info = avail[tool] || { installed: false, installHint: '' };
        const pill = el('span', 'hook-dep-pill' + (info.installed ? ' dep-ok' : ' dep-miss'),
          (info.installed ? '✓ ' : '⚠ ') + tool);
        pill.title = info.installed
          ? (tool + ' trovato: ' + (info.path || 'in PATH'))
          : (tool + ' NON installato.' + (info.installHint ? '\n\nInstalla con:\n' + info.installHint : ''));
        depsRow.appendChild(pill);
      });
      block.appendChild(depsRow);
    }

    const pre = el('pre', 'hook-handler-pre');
    pre.textContent = h.command || '';
    block.appendChild(pre);
    body.appendChild(block);
  });

  if (item.sourcePath) {
    const srcRow = el('div', 'hook-detail-row');
    srcRow.appendChild(el('span', 'hook-detail-label', t('plugin.source')));
    const link = el('button', 'btn btn-sm btn-ghost', item.sourcePath);
    link.addEventListener('click', () => window.claudeAPI.openDirectory(item.sourcePath));
    srcRow.appendChild(link);
    body.appendChild(srcRow);
  }

  modal.appendChild(body);

  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };
  function onKey(e) { if (e.key === 'Escape') close(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
  closeBtn.focus();
}

function appendScopeBadge(chip, item) {
  const badge = el('span', 'scope-badge scope-' + item.scope,
    item.scope === 'local' ? (item.projectName || t('badge.scopeLocal')) : t('badge.scopeGlobal'));
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
// v1.0.99 — Passa anche fullId a showMarkdownModal per abilitare l'editor inline
async function openMarkdownPreview(fullId, kind, name) {
  const r = await window.claudeAPI.readMarkdownFile(fullId, kind, name);
  if (!r.success) { toast('Errore lettura ' + kind + ': ' + r.error, 'error'); return; }
  showMarkdownModal(name, kind, r.content, fullId);
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

// v1.0.99 — Modal markdown viewer con switch preview ⟷ editor inline.
// Per skill/agent l'utente può cliccare "Modifica" per editare il contenuto
// del file .md (frontmatter + body) e salvarlo. Warning chiaro: le modifiche
// locali verranno sovrascritte al prossimo `claude plugins update <plugin>`.
// `fullId` è opzionale: se passato, abilita l'editor. Senza fullId resta
// solo preview (es. quando il modal viene aperto da un context dove non
// abbiamo l'id del plugin).
function showMarkdownModal(name, kind, content, fullId) {
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  let currentContent = content;        // contenuto live (per copy / save)
  let mode = 'preview';                 // 'preview' | 'edit'

  const header = el('div', 'md-header');
  const title  = el('div', 'md-title');
  const kindBadge = el('span', 'md-kind-badge md-kind-' + kind, kind);
  title.appendChild(kindBadge);
  title.appendChild(document.createTextNode(' ' + name));

  // Bottone copia (sempre disponibile, copia currentContent attuale)
  const copyAllBtn = btnWithIcon('md-copy', 'copy', t('button.copy'));
  copyAllBtn.setAttribute('aria-label', t('mdEdit.copyAria'));
  copyAllBtn.title = t('button.copyDocument');
  copyAllBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      toast(t('mdEdit.copied'), 'success');
    } catch (e) {
      toast(t('mdEdit.copyError', { msg: e.message }), 'error');
    }
  });

  // v1.0.99 — Bottone Modifica/Salva/Annulla (solo se fullId presente)
  const editBtn = btnWithIcon('md-copy', 'pencil', t('button.edit'));
  editBtn.title = t('mdEdit.editTip');

  const saveBtn   = btnWithIcon('md-copy md-save-btn', 'check', t('button.save'));
  saveBtn.title   = t('mdEdit.saveTip');
  saveBtn.style.display = 'none';

  const cancelBtn = btnWithIcon('md-copy', 'x', t('button.cancel'));
  cancelBtn.title = t('mdEdit.cancelTip');
  cancelBtn.style.display = 'none';

  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));

  header.appendChild(title);
  header.appendChild(copyAllBtn);
  if (fullId) {
    header.appendChild(editBtn);
    header.appendChild(saveBtn);
    header.appendChild(cancelBtn);
  }
  header.appendChild(closeBtn);

  // Container che alterna preview rendered ⟷ textarea editor
  const contentEl = el('div', 'md-content');

  function renderPreview() {
    contentEl.textContent = '';
    renderMarkdownToContainer(contentEl, currentContent);
  }

  let editorTextarea = null;
  function renderEditor() {
    contentEl.textContent = '';
    // Warning box visibile sopra l'editor
    const warn = el('div', 'md-editor-warn');
    warn.appendChild(icon('triangle-alert'));
    const wText = el('div', 'md-editor-warn-text');
    wText.appendChild(el('strong', null, t('mdEdit.warnTitle')));
    wText.appendChild(el('div', null,
      t('mdEdit.warnBody', { plugin: fullId || '<plugin>' })));
    warn.appendChild(wText);
    contentEl.appendChild(warn);

    // Textarea editor
    editorTextarea = el('textarea', 'md-editor-textarea');
    editorTextarea.spellcheck = false;
    editorTextarea.value = currentContent;
    contentEl.appendChild(editorTextarea);
    editorTextarea.focus();
  }

  function switchToEdit() {
    mode = 'edit';
    editBtn.style.display   = 'none';
    saveBtn.style.display   = '';
    cancelBtn.style.display = '';
    renderEditor();
  }

  function switchToPreview() {
    mode = 'preview';
    editBtn.style.display   = '';
    saveBtn.style.display   = 'none';
    cancelBtn.style.display = 'none';
    editorTextarea = null;
    renderPreview();
  }

  editBtn.addEventListener('click', switchToEdit);
  cancelBtn.addEventListener('click', () => {
    // Confirm solo se l'utente ha modificato il contenuto
    if (editorTextarea && editorTextarea.value !== currentContent) {
      if (!window.confirm(t('mdEdit.unsavedConfirm'))) return;
    }
    switchToPreview();
  });
  saveBtn.addEventListener('click', async () => {
    if (!editorTextarea) return;
    const newContent = editorTextarea.value;
    if (newContent === currentContent) { switchToPreview(); return; }
    saveBtn.disabled = true; cancelBtn.disabled = true;
    const r = await window.claudeAPI.writeMarkdownFile(fullId, kind, name, newContent);
    saveBtn.disabled = false; cancelBtn.disabled = false;
    if (r.success) {
      currentContent = newContent;
      toast(t('mdEdit.saved'), 'success');
      // v1.0.100 — Marca il file come modificato localmente per mostrare badge
      // sulla card skill/agent. Persisted in state.json.
      state.modifiedFiles[modifiedFileKey(kind, fullId, name)] = new Date().toISOString();
      try { await window.claudeAPI.setState({ modifiedFiles: state.modifiedFiles }); } catch {}
      switchToPreview();
      // Trigger reload dati per re-check health + re-render card con badge
      try { await loadData(); } catch { /* graceful */ }
    } else {
      toast(t('mdEdit.saveError', { msg: r.error || t('toast.errUnknown') }), 'error');
    }
  });

  function onKey(e) {
    if (e.key === 'Escape') {
      if (mode === 'edit') {
        // In edit mode Esc fa Annulla con confirm se modificato
        if (editorTextarea && editorTextarea.value !== currentContent) {
          if (!window.confirm(t('mdEdit.unsavedConfirm'))) return;
        }
        switchToPreview();
      } else {
        close();
      }
    }
  }
  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', () => {
    if (mode === 'edit' && editorTextarea && editorTextarea.value !== currentContent) {
      if (!window.confirm(t('mdEdit.unsavedClose'))) return;
    }
    close();
  });
  overlay.addEventListener('click', e => {
    if (e.target !== overlay) return;
    if (mode === 'edit' && editorTextarea && editorTextarea.value !== currentContent) {
      if (!window.confirm(t('mdEdit.unsavedClose'))) return;
    }
    close();
  });
  document.addEventListener('keydown', onKey);

  // Render iniziale preview
  renderPreview();

  modal.appendChild(header);
  modal.appendChild(contentEl);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
  closeBtn.focus();
}

// v1.1.7 — CLAUDE.md editor inline. Preview Markdown + edit textarea + save.
// `filePath` deve essere whitelistato lato backend (isAllowedClaudeMdPath):
// ~/.claude/CLAUDE.md globale o <projectPath>/CLAUDE.md di un tracked project.
// `displayName` mostrato in title (es. "CLAUDE.md (globale)" / "CLAUDE.md — projectName").
async function showClaudeMdEditor(filePath, displayName) {
  const r = await window.claudeAPI.readClaudeMd(filePath);
  if (!r.success) {
    toast(t('settingsExtra.claudeMdReadErr', { msg: r.error || '?' }), 'error');
    return;
  }
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  let currentContent = r.content || '';
  let mode = 'preview';

  const header = el('div', 'md-header');
  const title  = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', t('settingsExtra.claudeMdTitle')));
  title.appendChild(document.createTextNode(' ' + displayName));

  const copyBtn = btnWithIcon('md-copy', 'copy', t('button.copy'));
  copyBtn.title = t('button.copyDocument');
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(currentContent); toast(t('toast.copied'), 'success'); }
    catch (e) { toast(t('toast.cannotCopy'), 'error'); }
  });

  const editBtn = btnWithIcon('md-copy', 'pencil', t('button.edit'));
  const saveBtn = btnWithIcon('md-copy md-save-btn', 'check', t('button.save'));
  saveBtn.style.display = 'none';
  const cancelBtn = btnWithIcon('md-copy', 'x', t('button.cancel'));
  cancelBtn.style.display = 'none';

  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));

  header.appendChild(title);
  header.appendChild(copyBtn);
  header.appendChild(editBtn);
  header.appendChild(saveBtn);
  header.appendChild(cancelBtn);
  header.appendChild(closeBtn);

  const contentEl = el('div', 'md-content');
  let editorTextarea = null;

  function renderPreview() {
    contentEl.textContent = '';
    if (!currentContent) {
      contentEl.appendChild(el('div', 'context-note', t('settingsExtra.claudeMdEmptyHint')));
      return;
    }
    renderMarkdownToContainer(contentEl, currentContent);
  }
  function renderEditor() {
    contentEl.textContent = '';
    editorTextarea = el('textarea', 'md-editor-textarea');
    editorTextarea.spellcheck = false;
    editorTextarea.value = currentContent;
    contentEl.appendChild(editorTextarea);
    editorTextarea.focus();
  }
  function switchToEdit() {
    mode = 'edit';
    editBtn.style.display = 'none';
    saveBtn.style.display = '';
    cancelBtn.style.display = '';
    renderEditor();
  }
  function switchToPreview() {
    mode = 'preview';
    editBtn.style.display = '';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    editorTextarea = null;
    renderPreview();
  }

  editBtn.addEventListener('click', switchToEdit);
  cancelBtn.addEventListener('click', () => {
    if (editorTextarea && editorTextarea.value !== currentContent) {
      if (!window.confirm('Hai modifiche non salvate. Annullare?')) return;
    }
    switchToPreview();
  });
  saveBtn.addEventListener('click', async () => {
    if (!editorTextarea) return;
    const newContent = editorTextarea.value;
    if (newContent === currentContent) { switchToPreview(); return; }
    saveBtn.disabled = true; cancelBtn.disabled = true;
    const wr = await window.claudeAPI.writeClaudeMd(filePath, newContent);
    saveBtn.disabled = false; cancelBtn.disabled = false;
    if (wr.success) {
      currentContent = newContent;
      toast(t('settingsExtra.claudeMdSaved'), 'success');
      switchToPreview();
    } else {
      toast(t('settingsExtra.claudeMdWriteErr', { msg: wr.error || '?' }), 'error');
    }
  });

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (mode === 'edit' && editorTextarea && editorTextarea.value !== currentContent) {
      if (!window.confirm('Hai modifiche non salvate. Chiudere comunque?')) return;
    }
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  renderPreview();
  modal.appendChild(header);
  modal.appendChild(contentEl);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);
}

// v1.0.82 — `sortConfig` opzionale: { currentKey, options, onChange } iniettato
// nell'header per esporre il dropdown sort (usato da renderSkills/renderAgents).
// v1.0.96 — `sortConfig.viewSwitcher = {section, mode, onChange}` opzionale
// aggiunge il toggle vista cards/compatta accanto al sort dropdown.
function renderListSection(items, key, buildChip, searchFn, gridCls, sortConfig, mascotEmpty) {
  const f = state.filters[key] || { search: '' };
  const wrap = el('div');

  // v1.1.8 — Empty state "full page" con mascotte se nessun item del tutto
  if (mascotEmpty && (!items || !items.length)) {
    wrap.appendChild(buildMascotEmpty(mascotEmpty));
    setContent(wrap);
    return;
  }

  // search
  const bar = el('div', 'filter-bar');
  const sw  = el('div', 'search-wrap');
  // Icona search SVG inline (legacy: definita prima del refactor Lucide v1.0.95).
  // Usa variabile `searchIcon` per non shadoware la funzione globale `icon()`.
  const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  searchIcon.setAttribute('viewBox', '0 0 20 20'); searchIcon.setAttribute('fill', 'currentColor');
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', 'M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z');
  searchIcon.appendChild(iconPath);
  sw.appendChild(searchIcon);
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
  if (sortConfig && sortConfig.viewSwitcher) {
    const vs = sortConfig.viewSwitcher;
    hdr.appendChild(renderViewSwitcher(vs.section, vs.mode, vs.onChange));
  }
  if (sortConfig) {
    hdr.appendChild(renderSortDropdown(sortConfig.currentKey, sortConfig.options, sortConfig.onChange));
  }
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
    countEl.textContent = t('counter.items', { visible, total: items.length });
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
  const tabLabelKeys = { overview: 'stats.tabOverview', modelli: 'stats.tabModels', progetti: 'stats.tabProjects' };
  const tabBar = el('div', 'stats-tabs');
  tabs.forEach(tab => {
    const btn = el('button', 'stats-tab' + (tab === statsActiveTab ? ' active' : ''), t(tabLabelKeys[tab]));
    btn.addEventListener('click', () => { statsActiveTab = tab; renderStats(); });
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
    { num: fmtNum(kpi.sessions),  label: t('stats.kpiSessions'),     color: '#d97757' },
    { num: fmtNum(kpi.messages),  label: t('stats.kpiMessages'),     color: '#e89478' },
    { num: fmtNum(kpi.tokens),    label: t('stats.kpiTokens'),       color: '#6a9bcc' },
    { num: costLabel,             label: t('stats.kpiApiValue'),     color: '#22c55e' },
    { num: activeLabel,           label: t('stats.kpiActiveDays'),   color: '#788c5d' },
    { num: madLabel,              label: t('stats.kpiMostActive'),   color: '#b8c79a' },
    { num: (data.streak || 0) + 'g',     label: t('stats.kpiStreak'),         color: '#b8c79a' },
    { num: (data.longestStreak || 0) + 'g', label: t('stats.kpiLongestStreak'), color: '#9cc1ea' },
    { num: peakH != null ? peakH + ':00' : '—', label: t('stats.kpiPeakHour'),  color: '#f97316' },
    { num: favShort,              label: t('stats.kpiFavModel'),     color: '#d97757' },
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
  [['all', t('stats.rangeAll')], ['30', t('stats.range30')], ['7', t('stats.range7')]].forEach(([k, l]) => {
    const btn = el('button', 'stats-range-btn' + (statsRange === k ? ' active' : ''), l);
    btn.addEventListener('click', () => { statsRange = k; renderStats(); });
    rangeBar.appendChild(btn);
  });
  container.appendChild(rangeBar);

  container.appendChild(buildStatsKpiGrid(data, statsRange));

  // Heatmap (range dinamico)
  const HEATMAP_TITLE_KEY = { '7': 'section.attivita7g', '30': 'section.attivita30g' };
  const title = t(HEATMAP_TITLE_KEY[statsRange] || 'section.attivita52sett');
  container.appendChild(sectionTitle(title, 'bar-chart-3'));
  container.appendChild(buildHeatmap(c.dailyActivity || [], statsRange));

  // Context breakdown realistico
  const cb = data.contextBreakdown;
  if (cb) {
    container.appendChild(sectionTitle(t('section.stimaContestoStile'), 'eye'));
    container.appendChild(buildContextBreakdown(cb));
  }

  // v1.0.108 — Pack C: token budget plugin completo (Top 30 + rank + mkt)
  renderTokenBudgetSection(container, state.plugins, { mode: 'full' });
}

function contextCats(cb) {
  const mcp = cb.mcpServers || { tokens: 0, count: 0, total: 0 };
  const mcpLabel = mcp.total
    ? t('stats.contextMcpServersConn', { count: mcp.count })
    : t('stats.contextMcpServers');
  return [
    { kind: 'skills',       tokens: cb.skills.tokens,       label: t('stats.contextSkills', { count: cb.skills.count }),     color: '#d97757' },
    { kind: 'systemPrompt', tokens: cb.systemPrompt.tokens, label: t('stats.contextSystemPrompt'),                            color: '#6a9bcc' },
    { kind: 'agents',       tokens: cb.agents.tokens,       label: t('stats.contextAgents', { count: cb.agents.count }),     color: '#f97316' },
    { kind: 'memoryFiles',  tokens: cb.memoryFiles.tokens,  label: t('stats.contextMemoryFiles', { count: cb.memoryFiles.count }), color: '#788c5d' },
    { kind: 'mcpServers',   tokens: mcp.tokens,             label: mcpLabel,                                                  color: '#14b8a6' },
    { kind: 'freeSpace',    tokens: cb.freeSpace.tokens,    label: t('stats.contextFreeSpace'),                               color: '#3a3530' },
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
    const note = el('div', 'context-note', t('statsPage.contextEstimateLong'));
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

  container.appendChild(el('div', 'list-section-title', t('statsPage.tokensPerModel')));
  // v1.0.43 — Nota esplicativa per chiarire che le % rappresentano la
  // distribuzione del tuo uso fra modelli (somma = 100%), non una quota o
  // un limite. Le quote vere sono nelle barre Quote Claude della Dashboard.
  container.appendChild(el('div', 'models-section-note', t('statsPage.modelsNote')));
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
        t('statsPage.modelDetail', {
          input: fmtNum(u.inputTokens||0),
          output: fmtNum(u.outputTokens||0),
          cacheRead: fmtNum(u.cacheReadInputTokens||0),
          cacheCreate: fmtNum(u.cacheCreationInputTokens||0),
        }));
      container.appendChild(row);
      container.appendChild(detail);
    });

  // Daily histogram con tooltip flottante
  const dmt = data.cache.dailyModelTokens || [];
  if (dmt.length) {
    container.appendChild(el('div', 'list-section-title', t('statsPage.tokensDaily')));
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
        const lines = [d.date, t('statsPage.dailyTooltipTotal', { n: fmtNum(total) })];
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
    container.appendChild(el('div', 'daily-chart-legend', t('statsPage.dailyLegend')));
  }
}

function renderStatsProjects(container, data) {
  container.appendChild(el('div', 'list-section-title', t('statsPage.projectsTitle')));

  // v1.0.45 — Filtra i progetti "fantasma" (0 sessioni, 0 token): tipicamente
  // directory dove Claude Code è stato aperto una volta ma senza interazioni
  // significative (es. via cowork plugin o sessioni terminate prematuramente).
  const filtered = (data.projects || []).filter(p =>
    (p.sessions || 0) > 0 || (p.messages || 0) > 0 || (p.totalTokens || 0) > 0
  );

  if (!filtered.length) {
    container.appendChild(el('div', 'stats-empty', t('empty.noStatsProjects')));
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
      fmtNum(p.totalTokens || 0), t('statsPage.statTokens'),
      t('statsPage.statTokensTip')));
    meta.appendChild(statCell(
      fmtNum(p.messages || 0), t('statsPage.statMessages'),
      t('statsPage.statMessagesTip')));
    meta.appendChild(statCell(
      String(p.sessions || 0), p.sessions === 1 ? t('statsPage.statSession') : t('statsPage.statSessions'),
      t('statsPage.statSessionsTip')));
    row.appendChild(meta);

    container.appendChild(row);
  });

  container.appendChild(el('div', 'daily-chart-legend',
    t('statsPage.projectsLong', { shown: sorted.length })));
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
    wrap.appendChild(el('div', 'stats-loading', t('status.loadingConfig')));
  }
  const data = await window.claudeAPI.getStats();
  if (state.section !== 'config') return;
  if (data === statsCache) return;  // identica, niente da fare
  statsCache = data;
  wrap.textContent = '';
  renderConfigContent(wrap, data);
}

function renderConfigContent(container, data) {
  container.appendChild(el('div', 'list-section-title', t('config.pageTitle')));
  const warn = el('div', 'stats-warning', t('config.warning'));
  container.appendChild(warn);

  const settings = data.settings || {};

  function configRow(key, label, type, opts, extraDesc) {
    const row = el('div', 'settings-row');
    row.dataset.configKey = key;
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', label));
    const descTxt = '~/.claude/settings.json → ' + key + (extraDesc ? ' · ' + extraDesc : '');
    left.appendChild(el('div', 'settings-row-desc', descTxt));
    row.appendChild(left);

    let input;
    if (type === 'select') {
      input = el('select', 'config-select');
      const optList = (opts || []).slice();
      // v1.1.16 — se il valore salvato in settings.json non è tra le opzioni
      // note (es. un modello nuovo come claude-opus-4-8 non ancora in lista),
      // aggiungiamo un'option dedicata così resta SELEZIONATO e visibile,
      // invece di ripiegare silenziosamente sulla prima voce (che porterebbe
      // a sovrascrivere il modello buono con uno vecchio al primo cambio).
      const current = settings[key];
      if (current && !optList.includes(current)) {
        optList.push(current);
      }
      optList.forEach(o => {
        const opt = el('option', null,
          (opts && opts.includes(o)) || !o ? o : t('config.unknownOption', { value: o }));
        opt.value = o;
        input.appendChild(opt);
      });
      input.value = current || (opts && opts[0]) || '';
    } else if (type === 'dots') {
      // v1.0.32 — slider a pallini stile VS Code Claude plugin
      // v1.0.38 — tooltip custom istantaneo con nomi leggibili
      const dotsWrap = el('div', 'dots-slider');
      const values = (opts || []).slice();
      const displayNames = {
        low: 'Low', medium: 'Medium', high: 'High', xhigh: 'Extra-high',
        max: 'Max', ultracode: 'Ultracode',
      };
      // v1.1.16 — se l'effort salvato non è tra i livelli noti (es. un livello
      // nuovo introdotto da Claude Code) lo aggiungiamo in coda, così lo slider
      // lo mostra al massimo invece di ripiegare su 'low' (indice 0).
      const savedEffort = settings[key];
      if (savedEffort && !values.includes(savedEffort)) values.push(savedEffort);
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
            toast(t('config.toastSetTo', { label, value: v }), 'success');
          } else {
            // revert
            const prevIdx = values.indexOf(previous);
            refresh(prevIdx >= 0 ? prevIdx : 0, previous || values[0]);
            toast(t('toast.errorPrefix', { msg: r.error }), 'error');
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
          toast(t(input.checked ? 'config.toastEnabled' : 'config.toastDisabled', { label }), 'success');
        } else {
          input.checked = !input.checked;  // revert UI
          toast(t('config.toastSaveError', { msg: r.error }), 'error');
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
          toast(t('config.toastSetTo', { label, value: input.value }), 'success');
        } else {
          toast(t('config.toastSaveError', { msg: r.error }), 'error');
        }
      });
    }
    row.appendChild(input);
    container.appendChild(row);
  }

  // v1.0.40 — Tutte le opzioni di Configurazione sono **per Claude Code** (TUI
  // terminale e IDE plugin). Non hanno effetto sulla UI di CLACOROO.
  // Schema corretto verificato da claude-code-settings.schema.json
  configRow('alwaysThinkingEnabled', t('config.alwaysThinking'), 'toggle',
    null, t('config.alwaysThinkingDesc'));

  // Voice: schema corretto è voice.enabled (oggetto nested), NON voiceEnabled top-level
  voiceConfigRow(container, settings);

  // v1.1.16 — lista modelli aggiornata: aggiunto claude-opus-4-8 (modello più
  // capace attuale). I valori sconosciuti in settings.json sono comunque
  // preservati dal select (vedi configRow type 'select'), quindi un modello
  // futuro non andrà perso anche se non è ancora qui.
  configRow('model', t('config.modelLabel'), 'select',
    ['default', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    t('config.modelDesc'));

  // v1.0.30/32 — Effort level: slider a pallini stile VS Code.
  // v1.1.16 — aggiunto 'ultracode' (nuovo livello max introdotto da Claude Code).
  configRow('effortLevel', t('config.effortLabel'), 'dots',
    ['low', 'medium', 'high', 'xhigh', 'max', 'ultracode'],
    t('config.effortDesc'));

  // Theme: tutti i valori dallo schema ufficiale. Si applica alla UI di
  // Claude Code (terminale + IDE), non a CLACOROO.
  configRow('theme', t('config.themeLabel'), 'select',
    ['auto', 'dark', 'light', 'dark-daltonized', 'light-daltonized', 'dark-ansi', 'light-ansi'],
    t('config.themeDesc'));

  // Language: nomi capitalized accettati dallo schema (italian, spanish, ...).
  // Cambia la lingua delle RISPOSTE di Claude, non l'interfaccia CLACOROO.
  configRow('language', t('config.languageLabel'), 'select',
    ['', 'English', 'Italian', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese', 'Chinese'],
    t('config.languageDesc'));
}

// Riga custom per voice.enabled (campo nested in settings.json — lo schema
// di Claude Code è { voice: { enabled, mode, autoSubmit } }, non un flat
// voiceEnabled top-level che veniva ignorato).
function voiceConfigRow(container, settings) {
  const row = el('div', 'settings-row');
  const left = el('div');
  left.appendChild(el('div', 'settings-row-label', t('config.voiceLabel')));
  left.appendChild(el('div', 'settings-row-desc', t('config.voiceDesc')));
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
      toast(t(input.checked ? 'config.toastEnabled' : 'config.toastDisabled', { label: t('config.voiceLabel') }), 'success');
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
  searchInp.setAttribute('placeholder', t('mcpCard.searchPh'));
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
    { key: 'all',       label: t('filter.all') },
    { key: 'connected', label: t('mcp.status.connected'), dot: '#22c55e' },
    { key: 'needsAuth', label: t('filter.needsAuth'), dot: '#f59e0b' },
    { key: 'error',     label: t('mcp.status.error'), dot: '#ef4444' },
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
    { key: 'all',     label: t('filter.allKinds') },
    { key: 'builtin', label: t('filter.builtinClaudeAi') },
    { key: 'plugin',  label: t('filter.fromPlugin') },
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

  // Count + view switcher + sort + refresh button (v1.0.82 — sort, v1.0.97 — view switcher)
  const headerRow = el('div', 'section-header');
  const countSpan = el('span', 'section-count', '');
  headerRow.appendChild(countSpan);
  const mcpMode = state.viewMode.mcp;
  headerRow.appendChild(renderViewSwitcher('mcp', mcpMode, (m) => setViewMode('mcp', m)));
  headerRow.appendChild(renderSortDropdown(state.mcpSort, SORT_OPTIONS.mcp, async (key) => {
    state.mcpSort = key;
    await window.claudeAPI.setState({ mcpSort: key });
    renderMcp();
  }));
  const refreshBtn = btnWithIcon('btn btn-sm btn-ghost', 'rotate-cw', t('mcpCard.refreshLive'));
  refreshBtn.title = 'Esegue `claude mcp list` con health-check (può richiedere qualche secondo)';
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…controllo…';
    mcpCache = null;
    const data = await window.claudeAPI.getMcp({ force: true });
    if (myToken !== mcpRenderToken) return;
    mcpCache = data;
    refreshBtn.disabled = false;
    refreshBtn.textContent = '';
    refreshBtn.appendChild(icon('rotate-cw'));
    refreshBtn.appendChild(document.createTextNode(t('mcpCard.refreshLive')));
    renderMcp();
  });
  headerRow.appendChild(refreshBtn);
  wrap.appendChild(headerRow);

  // Grid: cards (default) o compact list
  const grid = el('div', mcpMode === 'cards' ? 'mcp-grid' : 'compact-list');
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

  // v1.0.104 — Merge dei server disabled dal state.json. Vengono mostrati
  // come card "ghost" con status='disabled' + bottone Abilita per re-add.
  let disabledServers = [];
  try {
    const dr = await window.claudeAPI.mcpListDisabled();
    if (dr && dr.ok) disabledServers = dr.servers || [];
  } catch { /* graceful */ }

  const rawServers = [...(mcpCache.servers || []), ...disabledServers];
  if (!rawServers.length) {
    grid.textContent = '';
    wrap.appendChild(buildMascotEmpty({
      title: t('empty.bigNoMcpTitle'),
      message: t('empty.bigNoMcpMsg'),
      cta: { label: t('empty.bigNoMcpCta'), onClick: () => showAddMcpModal() },
    }));
    return;
  }

  // v1.0.82 — sort applicato secondo state.mcpSort
  const servers = [...rawServers].sort(MCP_SORTERS[state.mcpSort] || MCP_SORTERS['name-asc']);

  let visible = 0;
  servers.forEach(srv => {
    const card = mcpMode === 'cards' ? buildMcpCard(srv) : buildMcpCompactRow(srv);
    const show = mcpMatches(srv, mcpFilter);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
    grid.appendChild(card);
  });

  if (visible === 0) {
    grid.appendChild(el('div', 'no-results', t('empty.noMcpResults')));
  }
  const connectedCount = servers.filter(s => s.status === 'connected').length;
  countSpan.textContent = t('counter.mcpServers', { visible, total: servers.length, connected: connectedCount });
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
  if (visible === 0) grid.appendChild(el('div', 'no-results', t('empty.noMcpResults')));
  const countSpan = wrap.querySelector('.section-count');
  if (countSpan && mcpCache.servers) {
    const connected = mcpCache.servers.filter(s => s.status === 'connected').length;
    countSpan.textContent = t('counter.mcpServers', { visible, total: mcpCache.servers.length, connected });
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

  // v1.0.95 — Badge status con icona Lucide invece di carattere unicode
  const badge = el('div', 'mcp-badge mcp-badge-' + srv.status);
  const badgeIconName = {
    connected: 'circle-check',
    needsAuth: 'circle-alert',
    warning:   'circle-alert',
    error:     'circle-x',
    unknown:   'circle-help',
    disabled:  'ban',
  }[srv.status] || 'circle-help';
  const badgeText = {
    connected: t('mcp.status.connected'),
    needsAuth: t('mcp.status.needsAuth'),
    warning:   t('mcp.status.warning'),
    error:     t('mcp.status.error'),
    unknown:   t('mcp.status.unknown'),
    disabled:  t('mcp.status.disabled'),
  }[srv.status] || srv.status;
  badge.appendChild(icon(badgeIconName));
  badge.appendChild(document.createTextNode(badgeText));
  header.appendChild(badge);
  card.appendChild(header);

  // Body: transport + connection (mono)
  const body = el('div', 'mcp-card-body');
  const transportRow = el('div', 'mcp-card-row');
  transportRow.appendChild(el('span', 'mcp-card-label', t('mcpReconnect.transportLabel')));
  transportRow.appendChild(el('span', 'mcp-card-value mcp-card-transport-' + srv.transport, srv.transport.toUpperCase()));
  body.appendChild(transportRow);

  const connRow = el('div', 'mcp-card-row');
  connRow.appendChild(el('span', 'mcp-card-label', srv.transport === 'stdio' ? t('mcpReconnect.commandLabel') : t('mcpReconnect.urlLabel')));

  const connWrap = el('div', 'mcp-card-conn-wrap');
  const conn = el('code', 'mcp-card-conn');
  conn.textContent = srv.connection || '—';
  connWrap.appendChild(conn);

  if (srv.connection) {
    const copyBtn = el('button', 'mcp-card-icon-btn');
    copyBtn.title = t('button.copyToClipboard');
    copyBtn.setAttribute('aria-label', t('button.copy'));
    copyBtn.appendChild(icon('copy'));
    copyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(srv.connection);
        const short = srv.connection.length > 50 ? srv.connection.slice(0, 47) + '…' : srv.connection;
        toast(t('toast.copiedShort', { text: short }), 'success');
      } catch {
        toast(t('toast.cannotCopy'), 'error');
      }
    });
    connWrap.appendChild(copyBtn);
  }

  // v1.0.95 — Toggle "Mostra tutto" se il comando supera l'altezza max.
  // Verifica DOPO il render (next tick) leggendo scrollHeight vs clientHeight.
  if (srv.connection && srv.connection.length > 80) {
    const toggle = el('button', 'mcp-card-conn-toggle');
    toggle.textContent = 'Mostra tutto';
    toggle.style.display = 'none';  // mostrato solo se serve
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = conn.classList.toggle('expanded');
      toggle.textContent = expanded ? 'Mostra meno' : 'Mostra tutto';
    });
    connWrap.appendChild(toggle);
    // Check truncation dopo il primo paint
    requestAnimationFrame(() => {
      if (conn.scrollHeight > conn.clientHeight + 2) {
        toggle.style.display = '';
      }
    });
  }

  connRow.appendChild(connWrap);
  body.appendChild(connRow);

  if (srv.statusText && srv.status !== 'connected') {
    const stRow = el('div', 'mcp-card-status-msg');
    stRow.textContent = srv.statusText;
    body.appendChild(stRow);
  }

  // v1.0.85 — Pack G v2: badge "tipo di riconnessione" sotto status, visibile
  // solo per server che NON sono connected (per non rumoreggiare il caso ok).
  if (srv.reconnect && srv.status !== 'connected') {
    const rcRow = el('div', 'mcp-card-reconnect-type');
    rcRow.appendChild(el('span', 'mcp-rc-label', t('mcpReconnect.reconnectLabel')));
    const typeBadge = el('span', 'mcp-rc-type mcp-rc-type-' + srv.reconnect.type, t(srv.reconnect.typeLabelKey));
    typeBadge.title = t(srv.reconnect.descriptionKey);
    rcRow.appendChild(typeBadge);
    body.appendChild(rcRow);
  }

  card.appendChild(body);

  // v1.0.85 — Footer arricchito con azioni reconnect contestuali per status
  // !=connected (Pack G v2). Per connected mostra solo nota di sola-lettura.
  // v1.0.94 — Pack G v2: bottone "🗑 Rimuovi" SOLO per MCP user-added
  // (scope='user'). I MCP builtin (claude.ai) e plugin-managed non sono
  // rimuovibili via `claude mcp remove` perché non li ha aggiunti l'utente.
  const footer = el('div', 'mcp-card-footer');
  const isUserAdded = srv.scope === 'user';
  if (srv.status === 'connected' || !srv.reconnect) {
    const hint = el('div', 'mcp-card-hint',
      srv.status === 'connected'
        ? t('mcpCard.connectedHint')
        : t('mcpCard.readOnlyHint'));
    footer.appendChild(hint);
    const actionsWrap = el('div', 'mcp-card-actions');
    // v1.0.103 — Bottone "Tools" sempre visibile su connected (backend
    // filtra cosa è supportato; HTTP/OAuth ricevono errore graceful)
    if (srv.status === 'connected') {
      const toolsBtn = btnWithIcon('btn btn-sm btn-ghost', 'eye', t('mcpCard.toolsBtn'));
      toolsBtn.title = t('mcpCard.toolsBtnTip');
      toolsBtn.addEventListener('click', e => { e.stopPropagation(); showMcpToolsModal(srv); });
      actionsWrap.appendChild(toolsBtn);
    }
    // v1.0.104 — Disabilita (solo user-added attivi): salva config in state
    // + remove via CLI. Re-abilitabile dopo via il bottone "Abilita".
    if (isUserAdded && srv.status !== 'disabled') {
      const disableBtn = btnWithIcon('btn btn-sm btn-ghost', 'ban', t('mcpCard.disableBtn'));
      disableBtn.title = t('mcpCard.disableBtnTip');
      disableBtn.addEventListener('click', e => { e.stopPropagation(); confirmAndDisableMcp(srv); });
      actionsWrap.appendChild(disableBtn);
    }
    // v1.0.104 — Abilita: server attualmente disabilitato → re-add con config salvata
    if (srv.status === 'disabled') {
      const enableBtn = btnWithIcon('btn btn-sm btn-primary', 'check', t('mcpCard.enableBtn'));
      enableBtn.title = t('mcpCard.enableBtnTip');
      enableBtn.addEventListener('click', e => { e.stopPropagation(); enableMcp(srv); });
      actionsWrap.appendChild(enableBtn);
    }
    if (isUserAdded) {
      const rmBtn = btnWithIcon('btn btn-sm btn-ghost', 'trash-2', t('mcpCard.removeBtn'));
      rmBtn.title = t('mcpCard.removeBtnTip', { id: srv.id });
      rmBtn.addEventListener('click', e => { e.stopPropagation(); confirmAndRemoveMcp(srv); });
      actionsWrap.appendChild(rmBtn);
    }
    if (actionsWrap.childNodes.length) footer.appendChild(actionsWrap);
  } else {
    const actionsWrap = el('div', 'mcp-card-actions');
    srv.reconnect.actions.forEach(act => {
      // v1.0.102 — Label backend ora già pulite (no emoji prefix), niente strip.
      // v1.1.3 — backend ritorna labelKey (chiave i18n), renderer fa t()
      const iconByKind = {
        'open-url': 'external-link',
        'open-terminal': 'terminal',
        'clear-cache': 'ban',
      };
      const btn = btnWithIcon('btn btn-sm ' + (act.kind === 'clear-cache' ? 'btn-ghost' : 'btn-primary'),
        iconByKind[act.kind] || 'play', act.labelKey ? t(act.labelKey) : (act.label || ''));
      btn.title = act.kind === 'open-url' ? act.url
        : act.kind === 'open-terminal' ? t('mcpReconnect.tipOpenTerminal', { cmd: act.command })
        : t('mcpReconnect.tipClearCache');
      btn.addEventListener('click', e => { e.stopPropagation(); runMcpReconnectAction(srv, act); });
      actionsWrap.appendChild(btn);
    });
    // v1.0.94 — bottone Rimuovi anche nel footer "needsAuth" se user-added
    if (isUserAdded) {
      const rmBtn = btnWithIcon('btn btn-sm btn-ghost', 'trash-2', t('mcpCard.removeBtn'));
      rmBtn.title = t('mcpCard.removeBtnTip', { id: srv.id });
      rmBtn.addEventListener('click', e => { e.stopPropagation(); confirmAndRemoveMcp(srv); });
      actionsWrap.appendChild(rmBtn);
    }
    footer.appendChild(actionsWrap);
    const desc = el('div', 'mcp-card-hint', t(srv.reconnect.descriptionKey));
    footer.appendChild(desc);
  }
  card.appendChild(footer);

  return card;
}

// v1.0.94 — Pack G v2: conferma + rimuove un MCP server user-added
// v1.0.97 — Pack M: compact view row per la sezione MCP. Riga singola
// con dot status colorato + name + transport + sub (claude.ai/plugin/user).
// Click sulla riga: per ora apre il modal niente (placeholder) — futuro
// integrazione con un detail modal MCP.
function buildMcpCompactRow(srv) {
  const row = el('div', 'compact-row mcp-compact-row');
  row.dataset.mcpId = srv.id;
  // Dot status colorato
  const statusColor = {
    connected: '#22c55e',
    needsAuth: '#f59e0b',
    warning:   '#f59e0b',
    error:     '#ef4444',
    unknown:   '#71717a',
  }[srv.status] || '#71717a';
  const dot = el('span', 'compact-row-dot');
  dot.style.background = statusColor;
  row.appendChild(dot);
  // Nome
  row.appendChild(el('span', 'compact-row-name', srv.displayName || srv.id));
  // Transport badge (HTTP/SSE/STDIO)
  const tr = el('span', 'compact-row-transport mcp-card-transport-' + srv.transport, srv.transport.toUpperCase());
  row.appendChild(tr);
  // Sub: tipo (claude.ai/plugin/user-added)
  const subText = srv.scope === 'builtin' ? 'claude.ai · globale'
    : srv.scope === 'plugin' ? ('plugin: ' + (srv.plugin || '—'))
    : 'user-added';
  row.appendChild(el('span', 'compact-row-sub', subText));
  // Status text se non connected
  if (srv.status !== 'connected' && srv.statusText) {
    const sm = el('span', 'compact-row-status-msg', srv.statusText);
    row.appendChild(sm);
  }
  return row;
}

// v1.0.103 — Modal "Tools esposti dal server MCP". Backend `mcp:list-tools`
// fa l'handshake JSON-RPC. Per server non supportati (OAuth/HTTP) mostra
// un messaggio chiaro invece di crashare.
async function showMcpToolsModal(srv) {
  const overlay = el('div', 'md-overlay');
  const modal   = el('div', 'md-modal');
  const header  = el('div', 'md-header');
  const title   = el('div', 'md-title');
  title.appendChild(el('span', 'md-kind-badge md-kind-agent', 'tools'));
  title.appendChild(document.createTextNode(' ' + (srv.displayName || srv.id)));
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  header.appendChild(title);
  header.appendChild(closeBtn);

  const content = el('div', 'md-content');
  const loading = el('div', 'mcp-tools-loading');
  loading.textContent = t('mcpCard.queryingServer', { name: srv.id });
  content.appendChild(loading);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  overlay._close = close;
  swapModalOverlay(overlay);

  const r = await window.claudeAPI.mcpListTools(srv.id);
  content.textContent = '';
  if (!r.ok) {
    const errBox = el('div', 'mcp-tools-error');
    errBox.appendChild(icon('triangle-alert'));
    const txt = el('div', 'mcp-tools-error-text');
    txt.appendChild(el('strong', null, t('mcpCard.toolsListUnavailable')));
    txt.appendChild(el('div', null, r.error || t('modalMkt.errUnknown')));
    errBox.appendChild(txt);
    content.appendChild(errBox);
    return;
  }
  const tools = r.tools || [];
  if (!tools.length) {
    content.appendChild(el('div', 'mcp-tools-empty', t('mcpCard.noTools')));
    return;
  }
  const summary = el('div', 'mcp-tools-summary');
  summary.textContent = t('mcpCard.toolsCount', { n: tools.length, verb: tools.length === 1 ? t('mcpCard.toolExposed') : t('mcpCard.toolsExposed') });
  content.appendChild(summary);

  const list = el('div', 'mcp-tools-list');
  tools.forEach(t => {
    const item = el('div', 'mcp-tool-item');
    const head = el('div', 'mcp-tool-head');
    head.appendChild(el('code', 'mcp-tool-name', t.name || '—'));
    if (t.title && t.title !== t.name) head.appendChild(el('span', 'mcp-tool-title', t.title));
    item.appendChild(head);
    if (t.description) {
      item.appendChild(el('div', 'mcp-tool-desc', t.description));
    }
    // Input schema (compact summary: list of param names + types)
    const schema = t.inputSchema || t.input_schema;
    if (schema && schema.properties && typeof schema.properties === 'object') {
      const props = Object.keys(schema.properties);
      if (props.length) {
        const paramsRow = el('div', 'mcp-tool-params');
        paramsRow.appendChild(el('span', 'mcp-tool-params-label', 'params'));
        props.slice(0, 8).forEach(p => {
          const def = schema.properties[p] || {};
          const required = Array.isArray(schema.required) && schema.required.includes(p);
          const pill = el('span', 'mcp-tool-param' + (required ? ' required' : ''));
          pill.textContent = p + (def.type ? ': ' + def.type : '');
          if (def.description) pill.title = def.description;
          paramsRow.appendChild(pill);
        });
        if (props.length > 8) {
          paramsRow.appendChild(el('span', 'mcp-tool-param-more', '+' + (props.length - 8)));
        }
        item.appendChild(paramsRow);
      }
    }
    list.appendChild(item);
  });
  content.appendChild(list);
}

// v1.0.104 — Pack G v2 chiusura: disabilita un server MCP user-added.
// Confirm dialog → IPC mcp:disable (salva config in state.json + claude mcp remove).
async function confirmAndDisableMcp(srv) {
  const response = await window.claudeAPI.confirmDialog({
    title:   t('confirm.disableMcp.title'),
    message: t('confirm.disableMcp.message', { id: srv.id }),
    detail:  t('confirm.disableMcp.detail', { id: srv.id }),
    buttons: [t('button.cancel'), t('confirm.disableMcp.yes')],
  });
  if (response !== 1) return;
  const r = await window.claudeAPI.mcpDisable(srv.id);
  if (r.success) {
    toast(t('toast.mcpDisabled', { id: srv.id }), 'success');
    mcpCache = null;
    if (state.section === 'mcp') renderMcp();
  } else {
    toast('Errore disable: ' + (r.error || 'sconosciuto'), 'error');
  }
}

// v1.0.104 — Ri-abilita un server MCP precedentemente disabilitato.
// Usa la config salvata in state.disabledMcpServers per fare `claude mcp add`.
async function enableMcp(srv) {
  const r = await window.claudeAPI.mcpEnable(srv.id);
  if (r.success) {
    toast(t('toast.mcpEnabled', { id: srv.id }), 'success');
    mcpCache = null;
    if (state.section === 'mcp') renderMcp();
  } else {
    toast('Errore enable: ' + (r.error || 'sconosciuto'), 'error');
  }
}

async function confirmAndRemoveMcp(srv) {
  const response = await window.claudeAPI.confirmDialog({
    title:   t('confirm.removeMcp.title'),
    message: t('confirm.removeMcp.message', { id: srv.id }),
    detail:  t('confirm.removeMcp.detail', { id: srv.id }),
    buttons: [t('button.cancel'), t('confirm.removeMcp.yes')],
  });
  if (response !== 1) return;
  const r = await window.claudeAPI.mcpRemove(srv.id);
  if (r.success) {
    toast(t('toast.mcpRemoved', { id: srv.id }), 'success');
    mcpCache = null;
    if (state.section === 'mcp') renderMcp();
  } else {
    toast('Errore rimozione: ' + (r.error || 'sconosciuto'), 'error');
  }
}

// v1.0.85 — Pack G v2: dispatcher delle 3 azioni reconnect.
async function runMcpReconnectAction(srv, act) {
  if (act.kind === 'open-url') {
    await window.claudeAPI.openExternal(act.url);
    toast('Apro ' + act.url + ' nel browser', 'info');
    return;
  }
  if (act.kind === 'open-terminal') {
    // Apre il drawer terminale + nuova tab + lancia `claude` interactive.
    // v1.0.86 — se l'action ha `preDigit` (es. `/mcp`), lo invia DOPO ~4s che
    // claude ha finito di stampare banner + hook + caricato contesto, così
    // l'utente vede direttamente il menu /mcp di Claude Code. Niente Enter
    // automatico: la riga resta digitata, l'utente sceglie se inviare.
    const tab = await openTerminalWithCommand(act.command);
    if (tab && act.preDigit) {
      toast('Apro `claude` e ti porto al menu ' + act.preDigit + ' (attendi qualche secondo)', 'info');
      setTimeout(() => {
        try { window.claudeAPI.pty.write(tab.ptyId, act.preDigit); } catch {}
      }, 4000);
    }
    return;
  }
  if (act.kind === 'clear-cache') {
    const r = await window.claudeAPI.mcpClearAuthCache(srv.id);
    if (!r.ok) { toast(t('toast.errorPrefix', { msg: r.error }), 'error'); return; }
    toast(r.removed
      ? 'Entry "' + srv.id + '" rimossa dalla cache. Aggiorna stato live per ricontrollare.'
      : 'Entry non presente in cache (già pulita)', r.removed ? 'success' : 'info');
    // Invalida cache renderer + re-render
    mcpCache = null;
    if (state.section === 'mcp') renderMcp();
    return;
  }
}

/* ── ACCOUNT (v1.0.27, Pack A) ────────────────────────────────────────── */
let accountCache = null;

function paintAccountPanel(container, result) {
  container.textContent = '';
  if (!result || !result.ok) {
    const err = el('div', 'account-error',
      t('account.readError', { msg: (result && result.error) || t('account.unknownError') }));
    container.appendChild(err);
    return;
  }
  const d = result.data || {};

  if (!d.loggedIn) {
    const card = el('div', 'account-card account-card-loggedout');
    card.appendChild(el('div', 'account-status', t('account.notAuthed')));
    card.appendChild(el('div', 'account-note', t('account.loginInstr')));
    container.appendChild(card);
    return;
  }

  const card = el('div', 'account-card');

  const head = el('div', 'account-head');
  const planBadge = el('span', 'account-plan-badge account-plan-' + (d.subscriptionType || 'unknown'));
  planBadge.textContent = (d.subscriptionType || '—').toUpperCase();
  head.appendChild(planBadge);
  // v1.0.69 — Status badge dinamico: parte come "Connesso" (verde) e diventa
  // "Disconnesso" (rosso) se la call usage ritorna 401/403 (token scaduto +
  // refresh fallito). In quel caso compare anche un bottone "Login terminale".
  const status = el('span', 'account-status account-status-ok', t('account.connected'));
  head.appendChild(status);
  card.appendChild(head);

  // Info rows
  function infoRow(label, value) {
    const r = el('div', 'account-row');
    r.appendChild(el('span', 'account-row-lbl', label));
    r.appendChild(el('span', 'account-row-val', value || '—'));
    card.appendChild(r);
  }
  infoRow(t('account.rowEmail'), d.email);
  infoRow(t('account.rowOrg'), d.orgName);
  infoRow(t('account.rowOrgId'), d.orgId);
  infoRow(t('account.rowAuthMethod'), d.authMethod === 'claude.ai' ? t('account.rowAuthClaudeAi') : d.authMethod || '—');
  infoRow(t('account.rowApiProvider'), d.apiProvider || '—');

  // v1.0.69 — Pre-creo il bottone "Login terminale" (mostrato solo se token scaduto).
  // Il callback di loadAccountUsage lo inserisce/rimuove dalle actions in base
  // allo stato auth reale (401/403 dall'endpoint usage = token irrimediabilmente
  // scaduto, niente più refresh possibile).
  const loginBtn = el('button', 'btn btn-sm btn-primary', t('account.btnLoginTerminal'));
  loginBtn.title = t('account.btnLoginTerminalTip');
  loginBtn.addEventListener('click', () => openTerminalWithCommand('claude auth login'));

  // v1.0.35 — Usage live (Session 5h, Weekly 7d, Weekly Sonnet) via endpoint
  // privato Anthropic. Render ottimistico se cache disponibile, swap on update.
  const usageSection = el('div', 'account-usage-section');
  card.appendChild(usageSection);
  loadAccountUsage(usageSection, (result) => {
    const authBroken = result && !result.ok && (result.status === 401 || result.status === 403);
    if (authBroken) {
      status.className = 'account-status account-status-error';
      status.textContent = t('account.disconnected');
      if (loginBtn && !loginBtn.isConnected) actions.insertBefore(loginBtn, refreshBtn);
    } else {
      status.className = 'account-status account-status-ok';
      status.textContent = t('account.connected');
      if (loginBtn && loginBtn.isConnected) loginBtn.remove();
    }
    // Allinea anche la pill sidebar (usa lastUsageData appena aggiornato)
    refreshSidebarAccountPill();
  });


  // Actions
  const actions = el('div', 'account-actions');
  const refreshBtn = el('button', 'btn btn-sm btn-ghost', t('account.btnRefresh'));
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '…';
    forceUsageNextLoad = true;   // v1.1.24 — refresh manuale → fetch quota reale
    const r = await window.claudeAPI.getAccount({ force: true });
    accountCache = r;
    paintAccountPanel(container, r);
    refreshSidebarAccountPill();
  });

  // Link rapido alla console claude.ai (gestione subscription)
  const claudeBtn = el('button', 'btn btn-sm btn-ghost', t('account.btnClaudeAi'));
  claudeBtn.title = t('account.btnClaudeAiTip');
  claudeBtn.addEventListener('click', () => window.claudeAPI.openExternal('https://claude.ai/settings/billing'));
  // Logout con tooltip custom hover (warning esplicito, niente box invadente)
  const logoutWrap = el('div', 'logout-btn-wrap');
  const logoutBtn = el('button', 'btn btn-sm btn-danger', t('account.btnLogout'));
  const logoutTooltip = el('div', 'logout-tooltip');
  logoutTooltip.appendChild(el('div', 'logout-tooltip-title', t('account.tooltipTitle')));
  logoutTooltip.appendChild(el('div', 'logout-tooltip-body', t('account.tooltipBody')));
  const list = el('ul', 'logout-tooltip-list');
  [t('account.tooltipItem1'), t('account.tooltipItem2'), t('account.tooltipItem3')].forEach(item => {
    const li = el('li', null, item);
    list.appendChild(li);
  });
  logoutTooltip.appendChild(list);
  logoutTooltip.appendChild(el('div', 'logout-tooltip-footer', t('account.tooltipFooter')));
  logoutWrap.appendChild(logoutBtn);
  logoutWrap.appendChild(logoutTooltip);

  logoutBtn.addEventListener('click', async () => {
    const ok = await window.claudeAPI.confirmDialog({
      title:   t('confirm.logoutAccount.title'),
      message: t('confirm.logoutAccount.message'),
      detail:  t('confirm.logoutAccount.detail'),
      buttons: [t('button.cancel'), t('confirm.logoutAccount.yes')],
    });
    if (ok !== 1) return;
    logoutBtn.disabled = true;
    logoutBtn.textContent = '…';
    const r = await window.claudeAPI.accountLogout();
    if (r.ok) {
      toast(t('account.toastLogout'), 'success');
      accountCache = null;
      const fresh = await window.claudeAPI.getAccount({ force: true });
      accountCache = fresh;
      paintAccountPanel(container, fresh);
    } else {
      toast(t('account.toastLogoutErr', { msg: r.error }), 'error');
      logoutBtn.disabled = false;
      logoutBtn.textContent = t('account.btnLogout');
    }
  });
  actions.appendChild(refreshBtn);
  actions.appendChild(claudeBtn);
  actions.appendChild(logoutWrap);
  card.appendChild(actions);

  container.appendChild(card);
}

async function loadAccountPanel(container) {
  // Render ottimistico con cache se disponibile
  if (accountCache) paintAccountPanel(container, accountCache);
  else container.appendChild(el('div', 'account-loading', t('account.loading')));
  const data = await window.claudeAPI.getAccount({});
  accountCache = data;
  paintAccountPanel(container, data);
  refreshSidebarAccountPill();
}

/* ── PANNELLO API KEY (Anthropic) ─────────────────────────────────────
 * Storage cross-platform cifrato (macOS Keychain / Linux libsecret / Win
 * DPAPI), integrazione via `apiKeyHelper` in settings.json. La chiave intera
 * non passa MAI dal main al renderer: solo `last4` per il masking. */

async function loadApiKeyPanel(container) {
  container.textContent = '';
  container.appendChild(el('div', 'account-loading', t('apikey.loadingStatus')));
  try {
    const status = await window.claudeAPI.apiKey.status();
    paintApiKeyPanel(container, status);
  } catch (e) {
    container.textContent = '';
    container.appendChild(el('div', 'account-error', t('apikey.error', { msg: e.message })));
  }
}

function paintApiKeyPanel(container, status) {
  container.textContent = '';
  const card = el('div', 'apikey-card');

  // Header con badge stato
  const head = el('div', 'apikey-head');
  const badge = el('span', 'apikey-status-badge ' + (status.present ? 'apikey-status-active' : 'apikey-status-empty'));
  badge.textContent = status.present ? t('apikey.statusActive') : t('apikey.statusEmpty');
  head.appendChild(badge);
  if (!status.secureStorage) {
    const warn = el('span', 'apikey-storage-warn', t('apikey.storageWarn'));
    warn.title = t('apikey.storageWarnTip');
    head.appendChild(warn);
  }
  card.appendChild(head);

  // Descrizione
  card.appendChild(el('div', 'apikey-desc', t('apikey.description', { backend: status.backend })));

  if (status.present) {
    const info = el('div', 'apikey-info');
    infoLine(info, t('apikey.rowKey'), status.masked || '—');
    infoLine(info, t('apikey.rowStorage'), status.backend);
    infoLine(info, t('apikey.rowHelperScript'), status.helperPath, true);
    if (!status.helperConfigured) {
      info.appendChild(el('div', 'apikey-warn', t('apikey.helperWarn')));
    }
    card.appendChild(info);

    const actions = el('div', 'apikey-actions');
    actions.appendChild(makeTestBtn(container));
    actions.appendChild(makeReplaceBtn(container));
    if (!status.helperConfigured) actions.appendChild(makeReconfigureBtn(container));
    actions.appendChild(makeRemoveBtn(container));
    actions.appendChild(makeConsoleBtn());
    card.appendChild(actions);
  } else {
    appendApiKeyForm(card, container);
  }

  container.appendChild(card);
}

function makeConsoleBtn() {
  const btn = el('button', 'btn btn-sm btn-ghost', t('apikey.btnConsole'));
  btn.title = t('apikey.btnConsoleTip');
  btn.addEventListener('click', () =>
    window.claudeAPI.openExternal('https://console.anthropic.com/settings/keys'));
  return btn;
}

function infoLine(parent, label, value, mono) {
  const r = el('div', 'apikey-info-row');
  r.appendChild(el('span', 'apikey-info-lbl', label));
  const val = el('span', 'apikey-info-val' + (mono ? ' apikey-info-mono' : ''));
  val.textContent = value;
  r.appendChild(val);
  parent.appendChild(r);
}

function appendApiKeyForm(card, container) {
  const form = el('div', 'apikey-form');
  form.appendChild(el('div', 'apikey-form-label', t('apikey.formLabel')));

  const input = el('input', 'apikey-input');
  input.type = 'password';
  input.placeholder = 'sk-ant-••••••••••••••••••••••••••••••••';
  input.autocomplete = 'off';
  input.spellcheck = false;
  form.appendChild(input);

  const showWrap = el('label', 'apikey-show-wrap');
  const showChk = el('input');
  showChk.type = 'checkbox';
  showChk.addEventListener('change', () => { input.type = showChk.checked ? 'text' : 'password'; });
  showWrap.appendChild(showChk);
  showWrap.appendChild(document.createTextNode(t('apikey.show')));
  form.appendChild(showWrap);

  const actions = el('div', 'apikey-actions');
  const testBtn = el('button', 'btn btn-sm btn-ghost', t('apikeyBtn.testConnection'));
  const saveBtn = el('button', 'btn btn-sm btn-primary', t('apikeyBtn.saveKey'));

  const statusInline = el('div', 'apikey-inline-status');

  testBtn.addEventListener('click', async () => {
    const k = input.value.trim();
    if (!k) return setInline(statusInline, t('apikeyBtn.enterKey'), 'error');
    testBtn.disabled = saveBtn.disabled = true;
    testBtn.textContent = t('apikeyBtn.testing');
    setInline(statusInline, '', '');
    const r = await window.claudeAPI.apiKey.test(k);
    testBtn.disabled = saveBtn.disabled = false;
    testBtn.textContent = t('apikeyBtn.testConnection');
    if (r.ok) {
      setInline(statusInline,
        r.modelCount ? t('apikeyBtn.keyValidWithCount', { n: r.modelCount }) : t('apikeyBtn.keyValid'),
        'ok');
    } else {
      setInline(statusInline, t('apikeyBtn.errPrefix', { msg: r.error || t('apikeyBtn.errFallback') }), 'error');
    }
  });

  saveBtn.addEventListener('click', async () => {
    const k = input.value.trim();
    if (!k) return setInline(statusInline, t('apikeyBtn.enterKey'), 'error');
    testBtn.disabled = saveBtn.disabled = true;
    saveBtn.textContent = t('apikeyBtn.saving');
    const r = await window.claudeAPI.apiKey.activate(k);
    if (r.ok) {
      input.value = '';
      toast(t('toast.apiKeyActivated', { warning: r.warning ? ' (' + r.warning + ')' : '' }), 'success');
      await loadApiKeyPanel(container);
    } else {
      testBtn.disabled = saveBtn.disabled = false;
      saveBtn.textContent = t('apikeyBtn.saveKey');
      setInline(statusInline, t('apikeyBtn.errPrefix', { msg: r.error || t('apikeyBtn.errSavePrefix') }), 'error');
    }
  });

  actions.appendChild(testBtn);
  actions.appendChild(saveBtn);
  actions.appendChild(makeConsoleBtn());
  form.appendChild(actions);
  form.appendChild(statusInline);
  card.appendChild(form);
}

function setInline(node, text, kind) {
  node.textContent = text;
  node.className = 'apikey-inline-status' + (kind ? ' apikey-inline-' + kind : '');
}

function renderApiKeyForm(container) {
  container.textContent = '';
  const card = el('div', 'apikey-card');
  card.appendChild(el('div', 'apikey-desc', t('apikeyBtn.replaceFormDesc')));
  appendApiKeyForm(card, container);
  container.appendChild(card);
}

function makeTestBtn() {
  const btn = el('button', 'btn btn-sm btn-ghost', t('apikeyBtn.testConnection'));
  btn.title = t('apikeyBtn.testStoredTip');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = t('apikeyBtn.testing');
    const r = await window.claudeAPI.apiKey.testStored();
    btn.disabled = false;
    btn.textContent = t('apikeyBtn.testConnection');
    if (r.ok) toast(t('apikeyBtn.keyValidWithCount', { n: r.modelCount || '?' }), 'success');
    else toast(t('apikeyBtn.errPrefix', { msg: r.error || t('apikeyBtn.errFallback') }), 'error');
  });
  return btn;
}

function makeReplaceBtn(container) {
  const btn = el('button', 'btn btn-sm btn-ghost', t('apikeyBtn.replaceBtn'));
  btn.title = t('apikeyBtn.replaceTip');
  btn.addEventListener('click', () => renderApiKeyForm(container));
  return btn;
}

function makeReconfigureBtn(container) {
  const btn = el('button', 'btn btn-sm btn-ghost', t('apikeyBtn.reconfigureBtn'));
  btn.title = t('apikeyBtn.reconfigureTip');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = t('apikeyBtn.reconfiguring');
    const r = await window.claudeAPI.apiKey.reconfigure();
    if (r.ok) {
      toast(t('apikeyBtn.reconfigOk'), 'success');
      await loadApiKeyPanel(container);
    } else {
      btn.disabled = false;
      btn.textContent = t('apikeyBtn.reconfigureBtn');
      toast(t('apikeyBtn.reconfigErr', { msg: r.error || t('mcp.status.unknown') }), 'error');
    }
  });
  return btn;
}

function makeRemoveBtn(container) {
  const btn = el('button', 'btn btn-sm btn-danger', t('apikeyBtn.removeBtn'));
  btn.title = t('apikeyBtn.removeTip');
  btn.addEventListener('click', async () => {
    const ok = await window.claudeAPI.confirmDialog({
      title:   t('confirm.removeApiKey.title'),
      message: t('confirm.removeApiKey.message'),
      detail:  t('confirm.removeApiKey.detail'),
      buttons: [t('button.cancel'), t('confirm.removeApiKey.yes')],
    });
    if (ok !== 1) return;
    btn.disabled = true;
    btn.textContent = '…';
    const r = await window.claudeAPI.apiKey.deactivate();
    if (r.ok) {
      toast(t('toast.apiKeyRemoved'), 'success');
      await loadApiKeyPanel(container);
    } else {
      btn.disabled = false;
      btn.textContent = 'Rimuovi';
      toast(t('toast.errorPrefix', { msg: r.error || t('mcp.status.unknown') }), 'error');
    }
  });
  return btn;
}

// Pill account nella sidebar (sotto Recenti, sopra Footer) — sempre visibile
function refreshSidebarAccountPill() {
  const pill = document.getElementById('sidebar-account');
  if (!pill) return;
  pill.textContent = '';
  pill.classList.remove('sidebar-account-broken');
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
  // v1.0.69 — Se l'ultimo fetch usage è andato in 401/403 evidenzio la pill
  // (token irrimediabilmente scaduto, l'utente deve rifare login)
  const broken = lastUsageData && !lastUsageData.ok && (lastUsageData.status === 401 || lastUsageData.status === 403);
  if (broken) {
    pill.classList.add('sidebar-account-broken');
    const warn = el('span', 'sidebar-account-warn', '⚠');
    pill.appendChild(warn);
    pill.title = 'Token Claude scaduto — apri Impostazioni per rifare login';
  } else {
    pill.title = 'Account: ' + (d.email || '') + ' · click per aprire Impostazioni';
  }
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
  const resetTxt = band && band.resetsAt ? t('settingsExtra.quotaResetsAt', { when: formatResetTime(band.resetsAt) }) : '';
  reset.textContent = resetTxt;
  wrap.appendChild(reset);
  return wrap;
}

function paintUsageBars(container, usageData, opts = {}) {
  const compact = !!opts.compact;
  container.textContent = '';
  if (!usageData) {
    container.appendChild(el('div', 'usage-loading',
      compact ? t('settingsExtra.usageLoading') : t('settingsExtra.usageLoadingFull')));
    return;
  }
  if (!usageData.ok) {
    // v1.1.21 — 429 senza dati cachati: nota discreta "in pausa", non JSON grezzo
    if (usageData.rateLimited) {
      container.appendChild(el('div', 'usage-paused', t('settingsExtra.usagePausedNoData')));
      return;
    }
    const err = el('div', 'usage-error', t('settingsExtra.usageReadErr', { msg: usageData.error || 'error' }));
    container.appendChild(err);
    return;
  }
  const d = usageData.data || {};
  if (!compact) {
    container.appendChild(el('div', 'usage-section-title', t('settingsExtra.usageCurrent')));
  }
  const grid = el('div', 'usage-grid' + (compact ? ' usage-grid-compact' : ''));
  grid.appendChild(buildUsageBar(t('settingsExtra.usageBarSession'),      d.fiveHour,       '#6a9bcc'));
  grid.appendChild(buildUsageBar(t('settingsExtra.usageBarWeekly'),       d.sevenDay,       '#788c5d'));
  grid.appendChild(buildUsageBar(t('settingsExtra.usageBarWeeklySonnet'), d.sevenDaySonnet, '#d97757'));
  container.appendChild(grid);

  // v1.1.21 — 429 ma con dati cachati: barre normali + nota discreta sotto
  if (usageData.rateLimited) {
    container.appendChild(el('div', 'usage-paused',
      t('settingsExtra.usagePausedRetry', { min: usageData.retryInMin || 5 })));
  }

  // v1.1.24 — "Ultimo aggiornamento" del fetch reale. In Dashboard (compact) il
  // badge in cima copre tutti i dati live; qui lo mostriamo solo nel pannello
  // Account (non-compact), dove non c'è il badge globale. Si auto-aggiorna ogni
  // secondo via refreshUsageUpdatedLabels().
  if (!compact && Number.isFinite(usageData.fetchedAt)) {
    const upd = el('div', 'usage-updated');
    upd.dataset.fetchedAt = String(usageData.fetchedAt);
    upd.textContent = t('settingsExtra.usageLastUpdate', { ago: liveAgo(usageData.fetchedAt) }) + ' · ' + quotaModeLabel();
    container.appendChild(upd);
  }

  if (!compact) {
    const link = el('button', 'usage-link', t('settingsExtra.manageUsageLink'));
    link.addEventListener('click', () =>
      window.claudeAPI.openExternal('https://claude.ai/settings/usage'));
    container.appendChild(link);
  }
}

// v1.1.24 — flag one-shot: un refresh manuale esplicito (pulsante topbar/account)
// deve bypassare la cache e rifare il fetch reale, così "Ultimo aggiornamento"
// riparte da zero. I cambi-sezione normali invece NON forzano (riusano la cache).
let forceUsageNextLoad = false;
function consumeForceUsage() {
  const f = forceUsageNextLoad;
  forceUsageNextLoad = false;
  return f;
}

async function loadAccountUsage(container, onResult) {
  // 1. Render ottimistico se abbiamo già dati
  paintUsageBars(container, lastUsageData);
  // 2. Fetch fresco; cache server-side 60s evita roundtrip se cambi sezione
  let data;
  try {
    data = await window.claudeAPI.getUsage({ force: consumeForceUsage() });
    lastUsageData = data;
    paintUsageBars(container, data);
  } catch (e) {
    data = { ok: false, error: e.message };
    if (!lastUsageData) paintUsageBars(container, data);
  }
  // v1.0.69 — Notifica al chiamante (paintAccountPanel) per aggiornare badge
  // Connesso↔Disconnesso in base allo status reale (es. 401/403 → token scaduto)
  if (typeof onResult === 'function') onResult(data);
}

async function loadDashboardUsage(container, token) {
  paintUsageBars(container, lastUsageData, { compact: true });
  try {
    const data = await window.claudeAPI.getUsage({ force: consumeForceUsage() });
    if (token !== dashboardRenderToken) return;
    lastUsageData = data;
    paintUsageBars(container, data, { compact: true });
  } catch { /* fail silently in dashboard */ }
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
  const gAccount = group(t('settings.accountClaude'));
  gAccount.dataset.tour = 'account';
  const accountWrap = el('div', 'settings-account-wrap');
  gAccount.appendChild(accountWrap);
  loadAccountPanel(accountWrap);

  const gApiKey = group(t('settings.apiKeyClaude'));
  gApiKey.dataset.tour = 'apikey';
  const apiKeyWrap = el('div', 'apikey-panel-wrap');
  gApiKey.appendChild(apiKeyWrap);
  loadApiKeyPanel(apiKeyWrap);

  const gLang = group(t('settings.appearance'));
  gLang.dataset.tour = 'language';
  const langRow = el('div', 'settings-row');
  const langLeft = el('div');
  langLeft.appendChild(el('div', 'settings-row-label', t('settings.language')));
  langLeft.appendChild(el('div', 'settings-row-desc', t('settings.languageHint')));
  langRow.appendChild(langLeft);
  const langRight = el('div');
  langRight.style.cssText = 'display:flex;gap:8px;align-items:center;';
  const langSel = el('select', 'config-select');
  [
    { v: 'it', l: 'Italiano' },
    { v: 'en', l: 'English' },
  ].forEach(o => {
    const opt = el('option', null, o.l);
    opt.value = o.v;
    langSel.appendChild(opt);
  });
  langSel.value = activeLang;
  langSel.addEventListener('change', async () => {
    const next = langSel.value;
    if (!LOCALES[next]) return;
    await changeLocale(next);
    toast(t('toast.saved'), 'success');
  });
  langRight.appendChild(langSel);
  // Sempre visibile: applica la lingua OS al volo. Se OS è su lingua non
  // supportata (es. fr/es/de), fallback EN con toast esplicativo. Reset
  // persistito così al riavvio rifa auto-detect (se l'utente cambia lingua OS).
  const sysBtn = el('button', 'btn btn-sm btn-ghost', t('settings.useSystemLang'));
  sysBtn.title = t('settings.useSystemLangTooltip');
  sysBtn.addEventListener('click', async () => {
    const info = await applySystemLocale();
    const appliedName = languageDisplayName(info.applied);
    if (info.isFallback) {
      const detectedName = languageDisplayName(info.detected) || info.detected;
      toast(t('settings.systemLangFallback', { detected: detectedName, fallback: appliedName }), 'info');
    } else {
      toast(t('settings.systemLangApplied', { lang: appliedName }), 'success');
    }
  });
  langRight.appendChild(sysBtn);
  langRow.appendChild(langRight);
  gLang.appendChild(langRow);

  // v1.1.7 — CLAUDE.md globale editor (subito sotto Aspetto, sopra Percorsi)
  const gCmGlobal = group(t('settingsExtra.claudeMdTitle'));
  const cmRow = el('div', 'settings-row');
  const cmLeft = el('div');
  cmLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.claudeMdGlobal')));
  cmLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.claudeMdGlobalDesc')));
  cmRow.appendChild(cmLeft);
  const cmGlobalBtn = btnWithIcon('btn btn-sm btn-primary btn-with-icon', 'pencil', ' ' + t('button.edit'));
  cmGlobalBtn.title = t('settingsExtra.claudeMdGlobalEdit');
  cmGlobalBtn.addEventListener('click', () => {
    showClaudeMdEditor(d.claudeDir + '/CLAUDE.md', 'CLAUDE.md (' + t('badge.scopeGlobal') + ')');
  });
  cmRow.appendChild(cmGlobalBtn);
  gCmGlobal.appendChild(cmRow);

  const g1 = group(t('settings.paths'));
  row(g1, t('settings.claudeFolder'), t('settings.claudeFolderDesc'), d.claudeDir);
  row(g1, t('settings.claudeBin'), d.claudeBin ? t('settings.claudeBinFound') : t('settings.claudeBinNotFound'), d.claudeBin || '—');

  if (!d.claudeBin) {
    const r2 = el('div', 'settings-row');
    const left = el('div');
    left.appendChild(el('div', 'settings-row-label', t('settings.configBinLabel')));
    left.appendChild(el('div', 'settings-row-desc', t('settings.configBinDesc')));
    r2.appendChild(left);
    const pathInp = el('input', 'search-input');
    pathInp.style.cssText = 'width:300px;';
    pathInp.setAttribute('placeholder', '/usr/local/bin/claude');
    const saveBtn = el('button', 'btn btn-primary btn-sm', t('button.save'));
    saveBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.setClaudeBin(pathInp.value.trim());
      if (r.success) { toast(t('settingsToast.pathUpdated'), 'success'); await loadData(); }
      else toast(t('toast.errorPrefix', { msg: r.error }), 'error');
    });
    const inputWrap = el('div');
    inputWrap.style.cssText = 'display:flex;gap:8px;align-items:center;';
    inputWrap.appendChild(pathInp); inputWrap.appendChild(saveBtn);
    r2.appendChild(inputWrap);
    g1.appendChild(r2);
  }

  // v1.0.40 — Rimossa sezione Statistiche: già presente in Dashboard e Stats
  // v1.0.11 — Progetti tracciati (scope locale)
  const gProj = group(t('settings.trackedProjects'));
  const projDesc = el('div', 'settings-row');
  const projDescL = el('div');
  projDescL.appendChild(el('div', 'settings-row-label', t('settings.trackedProjectsLabel')));
  projDescL.appendChild(el('div', 'settings-row-desc', t('settings.trackedProjectsDesc')));
  projDesc.appendChild(projDescL);
  gProj.appendChild(projDesc);

  (state.trackedProjects || []).forEach(projectPath => {
    const projRow = el('div', 'settings-row');
    const left = el('div');
    const projName = projectPath.split('/').pop() || projectPath;
    left.appendChild(el('div', 'settings-row-label', projName));
    left.appendChild(el('div', 'settings-row-desc', projectPath));
    projRow.appendChild(left);
    const right = el('div');
    right.style.cssText = 'display:flex;gap:6px;align-items:center;';
    // v1.1.7 — Bottone CLAUDE.md editor inline per progetto tracciato
    const cmBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'changelog', ' CLAUDE.md');
    cmBtn.title = t('settingsExtra.claudeMdProjectEdit');
    cmBtn.addEventListener('click', () => {
      showClaudeMdEditor(projectPath + '/CLAUDE.md', 'CLAUDE.md — ' + projName);
    });
    right.appendChild(cmBtn);
    const removeBtn = el('button', 'btn btn-sm btn-danger', t('button.remove'));
    removeBtn.addEventListener('click', async () => {
      const r = await window.claudeAPI.removeTrackedProject(projectPath);
      if (r.success) {
        toast(t('toast.projectRemoved'), 'success');
        await loadData();
      }
    });
    right.appendChild(removeBtn);
    projRow.appendChild(right);
    gProj.appendChild(projRow);
  });

  if (!state.trackedProjects?.length) {
    const empty = el('div', 'settings-row');
    const emptyL = el('div');
    emptyL.appendChild(el('div', 'settings-row-desc', t('empty.noTrackedProjects')));
    empty.appendChild(emptyL);
    gProj.appendChild(empty);
  }

  // Sviluppo plugin (idea #6 riformulata)
  // v1.0.57 — Editor esterno: usato dal bottone "Apri in editor" delle
  // plugin card e del modal Contenuto plugin. Schema URL: vscode://file/...,
  // cursor://file/... (Cursor è fork di VS Code, stesso protocollo).
  // 'system' = apri con app predefinita del sistema (shell.openPath).
  const gEditor = group(t('settings.externalEditor'));
  const edRow = el('div', 'settings-row');
  const edLeft = el('div');
  edLeft.appendChild(el('div', 'settings-row-label', t('settings.editorDefault')));
  edLeft.appendChild(el('div', 'settings-row-desc', t('settings.editorDefaultDesc')));
  edRow.appendChild(edLeft);

  const edSel = el('select', 'config-select');
  [
    { v: 'vscode',      k: 'settings.editorVscode' },
    { v: 'cursor',      k: 'settings.editorCursor' },
    { v: 'antigravity', k: 'settings.editorAntigravity' },
    { v: 'system',      k: 'settings.editorSystem' },
  ].forEach(o => {
    const opt = el('option', null, t(o.k));
    opt.value = o.v;
    edSel.appendChild(opt);
  });
  // Carico la scelta corrente in modo async
  (async () => {
    const s = await window.claudeAPI.getState();
    edSel.value = s.preferredEditor || 'vscode';
  })();
  edSel.addEventListener('change', async () => {
    await window.claudeAPI.setState({ preferredEditor: edSel.value });
    toast(t('settingsToast.editorSet', { name: edSel.options[edSel.selectedIndex].textContent }), 'success');
  });
  edRow.appendChild(edSel);
  gEditor.appendChild(edRow);

  // v1.0.75 — Terminale: shell predefinita per le nuove tab del drawer
  if (termState.caps && termState.caps.available) {
    const gTerm = group(t('settings.terminal'));
    const shellRow = el('div', 'settings-row');
    const shellLeft = el('div');
    shellLeft.appendChild(el('div', 'settings-row-label', t('settings.shellDefault')));
    shellLeft.appendChild(el('div', 'settings-row-desc', t('settings.shellDefaultDesc')));
    shellRow.appendChild(shellLeft);

    const shellSel = el('select', 'config-select');
    // Opzione "default" = lascia che pty.js decida ($SHELL / pwsh / cmd…)
    const defOpt = el('option', null, t('settings.shellSystemDefault', { shell: termState.caps.defaultShell || '?' }));
    defOpt.value = '';
    shellSel.appendChild(defOpt);
    (termState.caps.availableShells || []).forEach(sh => {
      const opt = el('option', null, sh.label);
      opt.value = sh.path;
      shellSel.appendChild(opt);
    });
    shellSel.value = termState.preferredShell || '';
    shellSel.addEventListener('change', async () => {
      const v = shellSel.value || null;
      termState.preferredShell = v;
      await window.claudeAPI.setState({ preferredShell: v });
      const lbl = v ? (shellSel.options[shellSel.selectedIndex].textContent) : t('settingsToast.shellDefaultName');
      toast(t('settingsToast.shellSet', { name: lbl }), 'success');
    });
    shellRow.appendChild(shellSel);
    gTerm.appendChild(shellRow);
  }

  const g4 = group(t('settings.pluginDev'));
  const devRow = el('div', 'settings-row');
  const devLeft = el('div');
  devLeft.appendChild(el('div', 'settings-row-label', t('settings.pluginValidator')));
  devLeft.appendChild(el('div', 'settings-row-desc', t('settings.pluginValidatorDesc')));
  devRow.appendChild(devLeft);

  const devWrap = el('div');
  devWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:flex-end;min-width:340px;';
  const pathRow = el('div');
  pathRow.style.cssText = 'display:flex;gap:6px;align-items:center;';
  const pathInp = el('input', 'search-input');
  pathInp.style.cssText = 'width:240px;font-family:"SF Mono",monospace;';
  pathInp.setAttribute('placeholder', '/path/to/local/plugin');
  pathInp.setAttribute('type', 'text');
  const browseBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'folder', t('settings.pluginBrowse'));
  const validateBtn = el('button', 'btn btn-sm btn-primary', t('settings.pluginValidate'));
  const outputEl = el('pre', 'dev-validate-output');
  outputEl.style.display = 'none';

  browseBtn.addEventListener('click', async () => {
    const p = await window.claudeAPI.pickDirectory();
    if (p) pathInp.value = p;
  });
  validateBtn.addEventListener('click', async () => {
    const p = pathInp.value.trim();
    if (!p) { toast(t('settings.pluginPathRequired'), 'warn'); return; }
    validateBtn.disabled = true;
    validateBtn.textContent = '…';
    const r = await window.claudeAPI.validatePlugin(p);
    validateBtn.disabled = false;
    validateBtn.textContent = t('settings.pluginValidate');
    outputEl.textContent = r.success ? (r.output || t('settings.pluginValid')) : ('✗ ' + r.error);
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
  const gUpd = group(t('settings.updates'));
  (async () => {
    const st = await window.claudeAPI.getState();
    const last = st.lastUpdateCheck
      ? new Date(st.lastUpdateCheck).toLocaleString(activeLang === 'it' ? 'it-IT' : 'en-US')
      : t('settings.lastCheckNever');
    const cachedInfo = st.lastUpdateResult;

    const rowCheck = el('div', 'settings-row');
    const ckLeft = el('div');
    ckLeft.appendChild(el('div', 'settings-row-label', t('settings.checkUpdates')));
    const desc = cachedInfo?.available && cachedInfo.latest
      ? t('settings.newVersionInfo', { ver: cachedInfo.latest, when: last })
      : t('settings.lastCheck', { when: last });
    ckLeft.appendChild(el('div', 'settings-row-desc', desc));
    rowCheck.appendChild(ckLeft);
    const ckBtn = el('button', 'btn btn-sm btn-primary', t('settings.checkNow'));
    ckBtn.addEventListener('click', async () => {
      ckBtn.disabled = true;
      ckBtn.textContent = '…';
      await runUpdateCheck(true);
      ckBtn.disabled = false;
      ckBtn.textContent = t('settings.checkNow');
      renderSettings();  // refresh timestamp
    });
    rowCheck.appendChild(ckBtn);
    gUpd.appendChild(rowCheck);

    const rowAuto = el('div', 'settings-row');
    const auLeft = el('div');
    auLeft.appendChild(el('div', 'settings-row-label', t('settings.autoCheck')));
    auLeft.appendChild(el('div', 'settings-row-desc', t('settings.autoCheckDesc')));
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
      toast(togInp.checked ? t('settingsExtra.autoCheckOn') : t('settingsExtra.autoCheckOff'), 'info');
    });
    rowAuto.appendChild(togWrap);
    gUpd.appendChild(rowAuto);
  })();

  // v1.1.9 — Notifiche soglia quota Claude
  const gNotify = group(t('settingsExtra.notifyTitle'));
  const notifRow = el('div', 'settings-row');
  const notifLeft = el('div');
  notifLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.notifyQuotaLabel')));
  notifLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.notifyQuotaDesc')));
  notifRow.appendChild(notifLeft);
  const notifToggle = el('label', 'toggle');
  const notifInp = el('input'); notifInp.type = 'checkbox';
  notifInp.checked = state.notifyQuota !== false;
  notifToggle.appendChild(notifInp);
  notifToggle.appendChild(el('span', 'toggle-track'));
  notifToggle.appendChild(el('span', 'toggle-thumb'));
  notifInp.addEventListener('change', async () => {
    state.notifyQuota = notifInp.checked;
    await window.claudeAPI.setState({ notifyQuota: state.notifyQuota });
    toast(notifInp.checked ? t('settingsExtra.notifyQuotaOn') : t('settingsExtra.notifyQuotaOff'), 'info');
  });
  const notifRight = el('div');
  notifRight.style.cssText = 'display:flex;gap:8px;align-items:center;';
  // v1.1.12 — Bottone "Prova notifica" per verificare permesso OS + funzionamento
  const testNotifBtn = el('button', 'btn btn-sm btn-ghost', t('settingsExtra.notifyTest'));
  testNotifBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.showNotification(
      t('settingsExtra.notifyTestTitle'), t('settingsExtra.notifyTestBody'), true);
    if (r && r.success) {
      // Notifica inviata al sistema. Su macOS può non comparire se il permesso
      // non è stato concesso: diamo comunque un feedback in-app esplicito.
      toast(t('settingsExtra.notifyTestSent'), 'info');
    } else {
      toast(t('settingsExtra.notifyTestFail'), 'warn');
    }
  });
  notifRight.appendChild(testNotifBtn);
  notifRight.appendChild(notifToggle);
  notifRow.appendChild(notifRight);
  gNotify.appendChild(notifRow);

  // v1.1.24 — Frequenza polling quota
  const pollRow = el('div', 'settings-row');
  const pollLeft = el('div');
  pollLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.quotaPollLabel')));
  pollLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.quotaPollHint')));
  pollRow.appendChild(pollLeft);
  const pollSel = el('select', 'config-select');
  QUOTA_POLL_PRESETS.forEach((p, i) => {
    const opt = el('option', null, quotaPollLabel(p));
    opt.value = String(i);
    if (p.ms === Number(state.quotaPollMs)) opt.selected = true;
    pollSel.appendChild(opt);
  });
  pollSel.addEventListener('change', () => {
    const preset = QUOTA_POLL_PRESETS[Number(pollSel.value)];
    applyQuotaPollSetting(preset.ms);
    toast(t('settingsExtra.quotaPollSaved', { label: quotaPollLabel(preset) }), 'info');
  });
  pollRow.appendChild(pollSel);
  gNotify.appendChild(pollRow);

  // Backup snapshot (idea #5)
  const g6 = group(t('settingsExtra.backupTitle'));
  const snapRow = el('div', 'settings-row');
  const snapLeft = el('div');
  snapLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.snapshotTitle')));
  snapLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.snapshotDesc')));
  snapRow.appendChild(snapLeft);
  const snapBtns = el('div');
  snapBtns.style.cssText = 'display:flex;gap:6px;';
  const exportBtn = btnWithIcon('btn btn-sm btn-ghost btn-with-icon', 'download', ' ' + t('settingsExtra.exportBtn'));
  exportBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.exportSnapshot();
    if (r.success) toast(t('settingsExtra.snapExported', { path: r.path }), 'success');
    else if (r.error !== t('uiErr.cancelled')) toast(t('settingsExtra.snapExportErr', { msg: r.error }), 'error');
  });
  const importBtn = btnWithIcon('btn btn-sm btn-primary btn-with-icon', 'upload', ' ' + t('settingsExtra.importBtn'));
  importBtn.addEventListener('click', async () => {
    const r = await window.claudeAPI.importSnapshot();
    if (!r.success) {
      if (r.error !== t('uiErr.cancelled')) toast(t('settingsExtra.snapImportErr', { msg: r.error }), 'error');
      return;
    }
    const { mktToAdd, pluginsToInstall } = r.preview;
    if (!mktToAdd.length && !pluginsToInstall.length) {
      toast(t('settingsExtra.snapAlreadyAligned'), 'info');
      return;
    }
    const choice = await window.claudeAPI.confirmDialog({
      title:   t('confirm.applySnapshot.title'),
      message: t('confirm.applySnapshot.message'),
      detail:  t('confirm.applySnapshot.detail', { mktCount: mktToAdd.length, plgCount: pluginsToInstall.length }),
      buttons: [t('button.cancel'), t('confirm.applySnapshot.yes')],
    });
    if (choice !== 1) return;
    importBtn.disabled = true;
    importBtn.textContent = t('confirm.applySnapshot.progress');
    const a = await window.claudeAPI.applySnapshot(r.preview);
    importBtn.disabled = false;
    importBtn.textContent = ' ' + t('settingsExtra.importBtn');
    importBtn.prepend(icon('upload'));
    if (a.success) toast(t('settingsExtra.snapApplied', { n: a.log.length }), 'success');
    else {
      const failed = a.log.filter(l => !l.success).length;
      toast(t('settingsExtra.snapFailed', { n: failed }), 'warn');
    }
    await loadData();
  });
  snapBtns.appendChild(exportBtn);
  snapBtns.appendChild(importBtn);
  snapRow.appendChild(snapBtns);
  g6.appendChild(snapRow);

  // Onboarding (idea #7)
  const g5 = group(t('settingsExtra.onboardingTitle'));
  const tourRow = el('div', 'settings-row');
  const tourLeft = el('div');
  tourLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.welcomeTour')));
  tourLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.welcomeTourDesc')));
  tourRow.appendChild(tourLeft);
  const restartBtn = el('button', 'btn btn-sm btn-primary', t('settingsExtra.restartTour'));
  restartBtn.addEventListener('click', () => {
    showOnboardingTour();
  });
  tourRow.appendChild(restartBtn);
  g5.appendChild(tourRow);

  // v1.0.40 — Informazioni compatta: una sola riga con nome + versione + bottone changelog
  const g3 = group(t('settingsExtra.infoTitle'));
  const infoRow = el('div', 'settings-row');
  const infoLeft = el('div');
  infoLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.appName')));
  const platformLabel = ({ darwin: 'macOS', win32: 'Windows', linux: 'Linux' })[d.platform] || d.platform;
  infoLeft.appendChild(el('div', 'settings-row-desc', platformLabel));
  infoRow.appendChild(infoLeft);
  const infoRight = el('div');
  infoRight.style.cssText = 'display:flex;gap:10px;align-items:center;';
  // v1.0.75 — versione letta da app.getVersion() (package.json) come fonte
  // unica di verità, così footer sidebar e Impostazioni mostrano sempre lo
  // stesso valore senza dover sincronizzare manualmente più punti del codice.
  const verVal = el('div', 'settings-row-val', d.appVersion || _currentAppVersion || '?');
  const chBtn = btnWithIcon('btn btn-sm btn-green btn-with-icon', 'changelog', ' ' + t('settingsExtra.changelogBtn'));
  chBtn.title = t('settingsExtra.changelogTip');
  chBtn.addEventListener('click', () => openChangelogModal());
  infoRight.appendChild(verVal);
  infoRight.appendChild(chBtn);
  infoRow.appendChild(infoRight);
  g3.appendChild(infoRow);

  // v1.0.65 — Riga Licenza: AGPL-3.0-or-later + copyright MAXYMIZE
  const licRow = el('div', 'settings-row');
  const licLeft = el('div');
  licLeft.appendChild(el('div', 'settings-row-label', t('settingsExtra.licenseLabel')));
  licLeft.appendChild(el('div', 'settings-row-desc', t('settingsExtra.licenseCopy')));
  licRow.appendChild(licLeft);
  const licRight = el('div');
  licRight.style.cssText = 'display:flex;gap:10px;align-items:center;';
  const licVal = el('div', 'settings-row-val', 'AGPL-3.0-or-later');
  const licBtn = el('button', 'btn btn-sm btn-ghost', t('settingsExtra.licenseText'));
  licBtn.title = t('settingsExtra.licenseTip');
  licBtn.addEventListener('click', () => {
    window.claudeAPI.openExternal('https://www.gnu.org/licenses/agpl-3.0');
  });
  licRight.appendChild(licVal);
  licRight.appendChild(licBtn);
  licRow.appendChild(licRight);
  g3.appendChild(licRow);

  // v1.0.74 — Disclaimer Anthropic: in fondo alla sezione "Informazioni",
  // sotto la riga Licenza.
  const disclaimerBox = el('div', 'settings-disclaimer');
  disclaimerBox.appendChild(el('div', 'settings-disclaimer-title', t('settingsExtra.disclaimerTitle')));
  disclaimerBox.appendChild(el('div', 'settings-disclaimer-body', t('settingsExtra.disclaimer')));
  g3.appendChild(disclaimerBox);

  setContent(wrap);
}

/* ── ONBOARDING TOUR ──────────────────────────────────────────────────── */
// Tour coachmark interattivo: vedi src/renderer/tour.js (window.startTour).
// `showOnboardingTour()` resta come thin wrapper per i call site esistenti.
function showOnboardingTour() {
  if (typeof window.startTour === 'function') window.startTour();
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
  const sections = ['dashboard', 'marketplaces', 'plugins', 'skills', 'agents', 'mcp', 'hooks', 'stats', 'config', 'settings'];
  sections.forEach(s => items.push({
    kind: 'action', icon: '→',
    label: t('palette.actionGoTo', { name: t('nav.' + (s === 'marketplaces' ? 'marketplace' : s === 'plugins' ? 'plugin' : s === 'skills' ? 'skill' : s === 'agents' ? 'agent' : s)) }),
    sub: t('palette.sectionKindSection'),
    run: () => switchToSection(s),
  }));
  items.push({ kind: 'action', icon: '↻', label: t('palette.actionReload'), sub: t('palette.sectionAction'), run: () => loadData() });
  items.push({ kind: 'action', icon: '⤓', label: t('palette.actionExport'), sub: t('palette.sectionAction'), run: async () => {
    const r = await window.claudeAPI.exportSnapshot();
    if (r.success) toast(t('palette.toastSnapshot'), 'success');
  }});
  items.push({ kind: 'action', icon: '⤒', label: t('palette.actionImport'), sub: t('palette.sectionAction'), run: () => switchToSection('settings') });
  items.push({ kind: 'action', icon: '📋', label: t('palette.actionChangelog'), sub: t('palette.sectionAction'), run: () => openChangelogModal() });
  items.push({ kind: 'action', icon: '🎓', label: t('palette.actionRestartTour'), sub: t('palette.sectionAction'), run: () => showOnboardingTour() });
  items.push({ kind: 'action', icon: '⤓', label: t('palette.actionCheckUpdates'), sub: t('palette.sectionAction'), run: () => runUpdateCheck(true) });

  // Plugin
  state.plugins.forEach(p => items.push({
    kind: 'plugin', icon: '🧩', label: p.id, sub: p.mkt + (p.blocked ? t('palette.pluginDisabledSuffix') : ''),
    run: () => { switchToSection('plugins'); state.filters.plugins.search = p.id.toLowerCase(); render(); },
  }));
  // Marketplace
  state.mktList.forEach(m => items.push({
    kind: 'marketplace', icon: '🏪', label: m.id, sub: t('palette.pluginsCount', { n: m.plugins.length }),
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
  input.placeholder = t('palette.placeholder');
  input.setAttribute('aria-label', t('palette.ariaLabel'));

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
      list.appendChild(el('div', 'palette-empty', t('empty.noResultsShort')));
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
  const versions = await window.claudeAPI.getChangelog(activeLang);
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
  const closeBtn = el('button', 'md-close'); closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
  header.appendChild(title); header.appendChild(closeBtn);

  const body = el('div', 'changelog-body');

  // v1.0.68 — Render sintetico: badge colorati per categoria + one-liner
  versions.forEach((v, idx) => {
    const card = el('div', 'changelog-card' + (idx === 0 ? ' current' : ''));

    const cardHead = el('div', 'changelog-card-head');
    const verBadge = el('span', 'changelog-version-badge', 'v' + v.version);
    cardHead.appendChild(verBadge);
    if (idx === 0) {
      const currentLbl = el('span', 'changelog-current-tag', 'attuale');
      cardHead.appendChild(currentLbl);
    }
    const dateLbl = el('span', 'changelog-date', v.date);
    cardHead.appendChild(dateLbl);
    card.appendChild(cardHead);

    if (v.title) {
      const titleEl = el('div', 'changelog-version-title', v.title);
      card.appendChild(titleEl);
    }

    if (v.items && v.items.length) {
      const list = el('ul', 'changelog-items');
      v.items.forEach(item => {
        const li = el('li', 'changelog-item');
        const badge = el('span', 'changelog-badge changelog-badge-' + item.type.toLowerCase(), item.type);
        li.appendChild(badge);
        const txt = el('span', 'changelog-item-text');
        inlineNodes(item.text).forEach(n => txt.appendChild(n));
        li.appendChild(txt);
        list.appendChild(li);
      });
      card.appendChild(list);
    }

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
  const msg = el('span', null, t('updateBanner.msgPre'));
  const ver = el('strong', null, 'v' + info.latest);
  const tail = el('span', null, t('updateBanner.msgTail'));
  txt.appendChild(dot); txt.appendChild(msg); txt.appendChild(ver); txt.appendChild(tail);

  const actions = el('div', 'update-banner-actions');
  const openBtn = el('button', 'btn btn-sm btn-primary', t('updateBanner.openDownload'));
  openBtn.addEventListener('click', () => {
    window.claudeAPI.openExternal(DOWNLOAD_PAGE_URL);
  });
  const laterBtn = el('button', 'btn btn-sm btn-ghost', t('updateBanner.later'));
  laterBtn.addEventListener('click', () => banner.remove());
  const skipBtn = el('button', 'btn btn-sm btn-ghost', t('updateBanner.skipVersion'));
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

/* ── SIDEBAR SUPPORT BUTTONS (v1.0.76) ───────────────────────────────── */
// 3 mini-bottoni di donazione (GitHub Sponsors, BMAC, PayPal) sempre
// visibili nel footer del sidebar. URL letti da data-url nell'HTML.
// Aperti via shell.openExternal nel browser di sistema.
function attachSupportButtons() {
  document.querySelectorAll('.sidebar-support-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url;
      if (url) window.claudeAPI.openExternal(url);
    });
  });
}

// v1.1.23 — Pulsante Feedback nel footer: apre la pagina del sito nella
// lingua attiva dell'app. Apre nel browser di sistema (no modal, no CSP).
function attachFeedbackButton() {
  const btn = document.getElementById('feedback-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = activeLang === 'it' ? FEEDBACK_URL_IT : FEEDBACK_URL_EN;
    window.claudeAPI.openExternal(url);
  });
}

/* ── STATUS / FOOTER (v1.0.62) ────────────────────────────────────────── */
// Il footer del sidebar ora mostra la versione corrente + indicatore di
// stato aggiornamento. Stati:
//   'loading'    — durante boot
//   'ok'         — versione aggiornata (lucina verde, label vN.N.NN)
//   'outdated'   — disponibile nuova versione (lucina arancio + bottone Update)
//   'error'      — errore boot
function setStatus(type, label) {
  const dot = $('status-dot');
  const lbl = $('status-label');
  if (dot) dot.className = 'status-dot ' + type;
  if (lbl) lbl.textContent = label;
}

let _currentAppVersion = '';

function refreshFooterStatus(updateInfo) {
  const dot = $('status-dot');
  const lbl = $('status-label');
  const wrap = $('sidebar-status');
  if (!dot || !lbl || !wrap) return;
  // Rimuovo eventuale bottone Update da precedenti chiamate
  wrap.querySelectorAll('.footer-update-btn').forEach(b => b.remove());

  const v = 'v' + _currentAppVersion;
  if (updateInfo && updateInfo.available) {
    dot.className = 'status-dot outdated';
    lbl.textContent = v;
    lbl.title = t('status.updateAvailable', { latest: updateInfo.latest });
    const btn = el('button', 'footer-update-btn', t('status.footerUpdateBtn'));
    btn.dataset.tt = t('status.footerUpdateTip', { latest: updateInfo.latest });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.claudeAPI.openExternal(DOWNLOAD_PAGE_URL);
    });
    wrap.appendChild(btn);
  } else {
    dot.className = 'status-dot ok';
    lbl.textContent = v;
    lbl.title = t('status.upToDate');
  }
}

/* ── TOAST ────────────────────────────────────────────────────────────── */
// v1.1.16 — Riconosce l'errore "corrupted installLocation" della CLI Claude:
// il path salvato in known_marketplaces.json punta a un utente/cartella
// diversi (tipico dopo aver copiato .claude da un altro Mac o un reset con
// username diverso). Invece del raw error grezzo (illeggibile, pieno di path)
// mostra un dialog guidato con il comando da eseguire e un bottone Copia.
// Ritorna true se ha gestito l'errore, false altrimenti (→ toast normale).
async function maybeShowCorruptedMarketplace(rawError, id) {
  if (!rawError || !/corrupted\s+installLocation/i.test(String(rawError))) return false;
  const cmd = t('mkt.corruptedCmd', { id });
  const choice = await window.claudeAPI.confirmDialog({
    title:   t('mkt.corruptedTitle', { id }),
    message: t('mkt.corruptedBody', { id }),
    detail:  cmd,
    buttons: [t('button.close'), t('mkt.copyCmd')],
  });
  if (choice === 1) {
    try { await navigator.clipboard.writeText(cmd); toast(t('toast.copied'), 'success'); }
    catch { /* clipboard non disponibile: il comando è comunque nel dialog */ }
  }
  return true;
}

function toast(msg, type) {
  const container = $('toast-container');
  const t = el('div', 'toast t-' + (type || 'info'), msg);
  container.appendChild(t);
  // v1.1.16 — durata adattiva: gli errori (spesso lunghi, es. output CLI con
  // path) restano più a lungo, e messaggi lunghi guadagnano tempo extra per
  // essere letti. Cap a 12s per non incollare il toast a schermo.
  const base = type === 'error' ? 6000 : 3200;
  const extra = Math.min(6000, Math.max(0, String(msg).length - 60) * 40);
  const dwell = Math.min(12000, base + extra);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .3s';
    setTimeout(() => t.remove(), 320);
  }, dwell);
}

/* ── v1.0.67 — TERMINAL DRAWER (Pack B) ──────────────────────────────── */
/* Stato in-memory delle tab aperte. Ogni voce: { id, ptyId, term, cwd, title, shell, container, ... } */
const termState = {
  tabs: new Map(),   // tabId → tabObj
  order: [],         // tabId in ordine di creazione/UI
  activeId: null,
  open: false,
  height: 280,       // px
  caps: null,        // pty capabilities (default shell, platform, ecc.)
  preferredShell: null, // v1.0.75 — shell scelta in Impostazioni (null = $SHELL/default)
  saveDebounce: 0,
  busyTimers: new Map(),  // tabId → timeout id (per status dot: arancio ↔ verde)
  cwdPoll: 0,        // setInterval handle per live cwd tracking
};

// Trasforma `/Users/maxymize/Sviluppo/Claude/Claude-Control-Room` in
// `~/…/Claude-Control-Room`. Path al di fuori di HOME: solo basename.
function termShortCwd(cwd) {
  if (!cwd) return '';
  const home = termState.caps && termState.caps.defaultCwd ? termState.caps.defaultCwd : '';
  const sep = (cwd.indexOf('\\') !== -1 && cwd.indexOf('/') === -1) ? '\\' : '/';
  if (home && cwd === home) return '~';
  if (home && (cwd.startsWith(home + '/') || cwd.startsWith(home + '\\'))) {
    const rest = cwd.slice(home.length + 1);
    const parts = rest.split(/[\/\\]/).filter(Boolean);
    if (parts.length === 0) return '~';
    if (parts.length === 1) return '~/' + parts[0];
    if (parts.length === 2) return '~/' + parts.join('/');
    return '~/…/' + parts[parts.length - 1];
  }
  const parts = cwd.split(/[\/\\]/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : cwd;
}

function termMarkBusy(tabId) {
  const tab = termState.tabs.get(tabId);
  if (!tab) return;
  tab.busy = true;
  if (tab.dotEl) tab.dotEl.className = 'terminal-tab-dot busy';
  if (termState.busyTimers.has(tabId)) clearTimeout(termState.busyTimers.get(tabId));
  termState.busyTimers.set(tabId, setTimeout(() => {
    tab.busy = false;
    if (tab.dotEl) tab.dotEl.className = 'terminal-tab-dot idle';
    termState.busyTimers.delete(tabId);
  }, 400));
}

async function termPollActiveCwd() {
  const id = termState.activeId;
  if (!id) return;
  const tab = termState.tabs.get(id);
  if (!tab) return;
  try {
    const r = await window.claudeAPI.pty.cwd(tab.ptyId);
    const newCwd = r && r.cwd;
    if (newCwd && newCwd !== tab.cwd) {
      tab.cwd = newCwd;
      // Aggiorna SOLO la label di questa tab, niente full re-render
      if (tab.labelEl) tab.labelEl.textContent = termShortCwd(newCwd);
      const btn = document.querySelector(`.terminal-tab[data-tab-id="${id}"]`);
      if (btn) btn.title = `${tab.shell}  •  ${newCwd}`;
      termSavePersistent();
    }
  } catch { /* ignore */ }
}

function termSavePersistent() {
  clearTimeout(termState.saveDebounce);
  termState.saveDebounce = setTimeout(() => {
    const payload = {
      open: termState.open,
      height: termState.height,
      activeTabId: termState.activeId,
      tabs: termState.order.map(id => {
        const t = termState.tabs.get(id);
        return t ? { id: t.id, cwd: t.cwd, title: t.title, shell: t.shell } : null;
      }).filter(Boolean),
    };
    window.claudeAPI.setState({ terminalDrawer: payload });
  }, 250);
}

function termPickTabId() {
  // ID stabile per UI: non riusiamo il ptyId perché può cambiare al reload.
  return 't' + Math.random().toString(36).slice(2, 9);
}

async function initTerminalDrawer() {
  if (!termState.caps) {
    try { termState.caps = await window.claudeAPI.pty.capabilities(); }
    catch { termState.caps = { available: false }; }
  }
  if (!termState.caps.available) {
    console.warn('[CLACOROO] pty non disponibile:', termState.caps.loadError);
    const drawer = document.getElementById('terminal-drawer');
    if (drawer) drawer.style.display = 'none';
    return;
  }

  // Routing eventi pty → tab corrispondente. Ogni chunk attiva il dot "busy"
  // (arancio) della tab per 400ms; senza ulteriori chunk torna idle (verde).
  window.claudeAPI.pty.onData(({ id, chunk }) => {
    for (const t of termState.tabs.values()) {
      if (t.ptyId === id) {
        t.write(chunk);
        termMarkBusy(t.id);
        break;
      }
    }
  });
  window.claudeAPI.pty.onExit(({ id }) => {
    for (const t of termState.tabs.values()) {
      if (t.ptyId === id) {
        t.write('\r\n\x1b[33m[processo terminato]\x1b[0m\r\n');
        // Visualizza dot rosso fisso (processo morto)
        if (t.dotEl) t.dotEl.className = 'terminal-tab-dot dead';
        break;
      }
    }
  });

  // Bind topbar/drawer buttons
  document.getElementById('terminal-drawer-newtab').addEventListener('click', () => termOpenNewTab());
  document.getElementById('terminal-drawer-close').addEventListener('click', () => termSetOpen(false));
  termInitResizer();

  // Restore state
  const appState = await window.claudeAPI.getState();
  const saved = appState.terminalDrawer;
  if (saved && Number.isFinite(saved.height)) {
    termState.height = Math.max(140, Math.min(800, saved.height));
  }
  applyDrawerHeight();

  if (saved && Array.isArray(saved.tabs) && saved.tabs.length) {
    for (const s of saved.tabs) {
      await termCreateTab({ cwd: s.cwd, title: s.title, shell: s.shell, makeActive: false });
    }
    if (saved.activeTabId) {
      // Trova il tab nella stessa posizione (gli id nuovi sono diversi)
      const idx = saved.tabs.findIndex(t => t.id === saved.activeTabId);
      if (idx >= 0 && idx < termState.order.length) {
        termActivateTab(termState.order[idx]);
      } else if (termState.order.length) {
        termActivateTab(termState.order[0]);
      }
    } else if (termState.order.length) {
      termActivateTab(termState.order[0]);
    }
  }
  if (saved && saved.open) {
    termSetOpen(true, /*skipSave*/ true);
  }

  // Shortcut globali
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.userAgent.includes('Mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;
    // Cmd + ` toggle drawer
    if (e.key === '`') {
      e.preventDefault();
      termSetOpen(!termState.open);
    }
    // Cmd + T nuova tab (solo quando drawer aperto, altrimenti rispetta default browser)
    if (e.key === 't' && termState.open) {
      e.preventDefault();
      termOpenNewTab();
    }
  });
}

async function termCreateTab(opts = {}) {
  const id = termPickTabId();
  const body = document.getElementById('terminal-drawer-body');

  // Spawn pty lato main (v1.0.75: se nessuno shell esplicito, usa la
  // preferredShell scelta in Impostazioni; null = default di piattaforma)
  const r = await window.claudeAPI.pty.spawn({
    cwd:   opts.cwd   || termState.caps?.defaultCwd,
    title: opts.title || null,
    shell: opts.shell || termState.preferredShell || null,
    cols:  80,
    rows:  24,
  });
  if (!r || !r.success) {
    toast('Errore avvio terminale: ' + (r?.error || 'sconosciuto'), 'error');
    return null;
  }
  const info = r.info;

  const tab = window.TermDrawer.createTab({
    id,
    ptyId: info.id,
    cwd:   info.cwd,
    title: info.title,
    shell: info.shell,
    parent: null,  // attacchiamo solo quando diventa attiva
  });
  // tab è ritornato dall'helper TermDrawer; aggiungo property a posteriori per sicurezza
  tab.id = id;
  tab.ptyId = info.id;
  tab.cwd = info.cwd;
  tab.title = info.title;
  tab.shell = info.shell;

  termState.tabs.set(id, tab);
  termState.order.push(id);
  renderTermTabs();

  if (opts.makeActive !== false) termActivateTab(id);
  termSavePersistent();
  return tab;
}

function termOpenNewTab() {
  if (!termState.open) termSetOpen(true);
  return termCreateTab({});
}

// v1.0.69 — Apre il drawer, crea una nuova tab in HOME ed esegue un comando.
// Usato per: bottone "Login terminale" nel pannello Account (claude auth login),
// future skill launcher (claude -p "<skill>"), ecc.
async function openTerminalWithCommand(cmd, opts = {}) {
  if (!termState.caps || !termState.caps.available) {
    toast('Terminale integrato non disponibile su questa piattaforma', 'error');
    return null;
  }
  if (!termState.open) termSetOpen(true);
  const tab = await termCreateTab({
    cwd:   opts.cwd   || termState.caps.defaultCwd,
    title: opts.title || null,
    shell: opts.shell || null,
  });
  if (!tab) return null;
  // Aspetta che il pty sia pronto a ricevere input (la shell prima stampa il prompt)
  setTimeout(() => {
    try { window.claudeAPI.pty.write(tab.ptyId, cmd + '\r'); } catch {}
  }, 350);
  return tab;
}

function termActivateTab(id) {
  const tab = termState.tabs.get(id);
  if (!tab) return;
  const body = document.getElementById('terminal-drawer-body');
  // Detach altre tab dal body (preserviamo le istanze)
  for (const t of termState.tabs.values()) {
    if (t.id !== id) t.detach();
  }
  tab.attach(body);
  termState.activeId = id;
  renderTermTabs();
  // Aggiorna subito cwd della nuova tab attiva (non aspettare 3s)
  if (termState.open) termPollActiveCwd();
  termSavePersistent();
}

function termCloseTab(id) {
  const tab = termState.tabs.get(id);
  if (!tab) return;
  window.claudeAPI.pty.kill(tab.ptyId);
  tab.dispose();
  termState.tabs.delete(id);
  termState.order = termState.order.filter(x => x !== id);
  if (termState.activeId === id) {
    termState.activeId = termState.order[termState.order.length - 1] || null;
    if (termState.activeId) termActivateTab(termState.activeId);
  }
  renderTermTabs();
  termSavePersistent();
}

function renderTermTabs() {
  const bar = document.getElementById('terminal-drawer-tabs');
  if (!bar) return;
  bar.textContent = '';
  for (const id of termState.order) {
    const t = termState.tabs.get(id);
    if (!t) continue;
    const btn = document.createElement('button');
    btn.className = 'terminal-tab' + (id === termState.activeId ? ' active' : '');
    btn.dataset.tabId = id;
    btn.title = `${t.shell}  •  ${t.cwd}`;

    // Status dot: idle (verde) di default, busy (arancio pulse) se attività
    // recente, dead (rosso) se processo terminato.
    const dot = document.createElement('span');
    dot.className = 'terminal-tab-dot ' + (t.busy ? 'busy' : 'idle');
    btn.appendChild(dot);
    t.dotEl = dot;

    const lbl = document.createElement('span');
    lbl.className = 'terminal-tab-label';
    lbl.textContent = termShortCwd(t.cwd);
    btn.appendChild(lbl);
    t.labelEl = lbl;

    const close = document.createElement('span');
    close.className = 'terminal-tab-close';
    close.textContent = '×';
    close.title = 'Chiudi tab';
    close.addEventListener('click', (ev) => { ev.stopPropagation(); termCloseTab(id); });
    btn.appendChild(close);

    btn.addEventListener('click', () => termActivateTab(id));
    bar.appendChild(btn);
  }
}

function applyDrawerHeight() {
  const d = document.getElementById('terminal-drawer');
  if (d) d.style.height = termState.height + 'px';
}

function termSetOpen(open, skipSave) {
  termState.open = !!open;
  const d = document.getElementById('terminal-drawer');
  if (!d) return;
  d.dataset.open = String(termState.open);
  d.setAttribute('aria-hidden', String(!termState.open));
  if (termState.open) {
    applyDrawerHeight();
    // Se non c'è nessuna tab, aprine una di default
    if (termState.order.length === 0) {
      termCreateTab({});
    } else if (termState.activeId) {
      // Refit dopo che il drawer è visibile
      const t = termState.tabs.get(termState.activeId);
      if (t) requestAnimationFrame(() => {
        try {
          t.fit.fit();
          const { cols, rows } = t.term;
          if (cols && rows) window.claudeAPI.pty.resize(t.ptyId, cols, rows);
        } catch {}
        t.term.focus();
      });
    }
    // Start live cwd polling (3s) per la tab attiva
    if (!termState.cwdPoll) {
      termPollActiveCwd();
      termState.cwdPoll = setInterval(termPollActiveCwd, 3000);
    }
  } else {
    // Ferma polling per non sprecare CPU quando il drawer è chiuso
    if (termState.cwdPoll) {
      clearInterval(termState.cwdPoll);
      termState.cwdPoll = 0;
    }
  }
  if (!skipSave) termSavePersistent();
}

function termInitResizer() {
  const handle = document.getElementById('terminal-drawer-resizer');
  if (!handle) return;
  let dragStartY = 0;
  let dragStartH = 0;
  let dragging = false;
  const onMove = (ev) => {
    if (!dragging) return;
    const dy = dragStartY - ev.clientY;
    let h = dragStartH + dy;
    h = Math.max(140, Math.min(window.innerHeight - 120, h));
    termState.height = h;
    applyDrawerHeight();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    // Refit la tab attiva dopo resize completato
    const t = termState.tabs.get(termState.activeId);
    if (t) requestAnimationFrame(() => {
      try {
        t.fit.fit();
        const { cols, rows } = t.term;
        if (cols && rows) window.claudeAPI.pty.resize(t.ptyId, cols, rows);
      } catch {}
    });
    termSavePersistent();
  };
  handle.addEventListener('mousedown', (ev) => {
    dragging = true;
    dragStartY = ev.clientY;
    dragStartH = termState.height;
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* ── START ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
