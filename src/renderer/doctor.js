/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE (Maximilian Giurastante <info@maxymizebusiness.com>)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License v3 or later.
 * Full license text: see LICENSE file or https://www.gnu.org/licenses/agpl-3.0
 */
'use strict';

// v1.2.18 — Doctor: controllo della configurazione di Claude Code dall'header.
// Unisce `claude doctor` (installazione, PATH, settings non validi: sola
// diagnostica) e i controlli che CLACOROO fa già (link rotti, front matter di
// skill/agent, server MCP, programmi mancanti degli hook).
// - Gira solo al click: niente polling (vedi il caso rate limit della v1.1.35).
// - "Correggi tutto" esegue solo azioni sicure e reversibili (oggi: link rotti
//   nel Cestino). Il resto è guidato: apri file, copia comando, esegui nel
//   terminale, vai alla sezione. Ogni voce si può ignorare (persistito).
// - "Con Claude" apre una sessione nel terminale integrato per /doctor, il
//   checkup completo con l'AI, che chiede conferma per ogni correzione. Il
//   comando non si passa come prompt iniziale: Claude Code può prima chiedere
//   se fidarsi della cartella, quindi /doctor va negli appunti.
// Usa i global di app.js (el, t, icon, toast, state, ...): è caricato prima,
// ma le funzioni vengono chiamate solo dopo l'avvio.

const doctorState = { result: null, running: false, showIgnored: false, showRaw: false, count: null };

function doctorIgnored() {
  return Array.isArray(state.doctorIgnored) ? state.doctorIgnored : [];
}

async function setDoctorIgnored(list) {
  state.doctorIgnored = list;
  try { await window.claudeAPI.setState({ doctorIgnored: list }); } catch { /* graceful */ }
  if (doctorState.result) doctorState.count = doctorProblemCount(doctorState.result.groups);
  refreshDoctorBadge();
}

// Problemi da sistemare: voci non ignorate dei gruppi error/warning. Le voci
// "info" (es. front matter dei plugin, che corregge l'autore) non contano.
function doctorProblemCount(groups) {
  const ign = new Set(doctorIgnored());
  return groups
    .filter(g => g.severity !== 'info')
    .reduce((n, g) => n + g.items.filter(i => !ign.has(i.key)).length, 0);
}

function doctorAutoItems(groups) {
  const ign = new Set(doctorIgnored());
  return groups.flatMap(g => g.items).filter(i => i.action.type === 'trash' && !ign.has(i.key));
}

// Gruppi: { id, title, source, severity: 'error'|'warning'|'info', items: [{ key, text, detail, action }] }
async function collectDoctorFindings() {
  const [cc, mcp] = await Promise.all([
    window.claudeAPI.doctorRun(),
    window.claudeAPI.getMcp({}).catch(() => null),
  ]);
  const groups = [];

  // 1. claude doctor: i titoli noti si traducono, voci e correzioni restano
  //    nel testo originale di Claude Code (in inglese).
  if (cc && cc.ok) {
    for (const s of cc.sections) {
      if (!s.items.length) continue;
      const severity = s.kind === 'error' ? 'error' : s.kind === 'warning' ? 'warning' : 'info';
      const title = s.kind === 'error' ? t('doctor.groupSettings')
        : s.kind === 'warning' ? t('doctor.groupInstall') : s.title;
      groups.push({
        id: 'cc:' + s.title, title, source: 'claude doctor', severity,
        items: s.items.map(it => ({ key: 'cc:' + it.text, text: it.text, detail: it.fix, action: it.action })),
      });
    }
  }

  // 2. link rotti (Claude Code li ignora): gli unici con correzione automatica
  const all = [...allSkillItems(), ...allAgentItems()];
  const broken = all.filter(i => i.broken);
  if (broken.length) {
    groups.push({
      id: 'broken', title: t('doctor.groupBroken'), source: 'CLACOROO', severity: 'warning',
      items: broken.map(i => ({
        key: 'broken:' + i.file,
        text: i.plugin + '/' + i.name,
        detail: t('skillAgent.brokenHint', { target: i.target || '?' }),
        action: i.removePath ? { type: 'trash', file: i.file } : { type: 'none' },
      })),
    });
  }

  // 3. front matter: le tue voci le correggi tu, quelle dei plugin l'autore
  const unhealthy = all.filter(i => !i.broken && i.health && i.health.status !== 'ok');
  const healthItem = i => ({
    key: 'health:' + (i.file || i.fullId + ':' + i.kind + ':' + i.name),
    text: i.name + ' · ' + i.plugin,
    detail: (i.health.issues || []).map(translateHealthIssue).join(' · '),
    action: { type: 'preview', item: i },
  });
  const own = unhealthy.filter(i => i.standalone);
  const fromPlugins = unhealthy.filter(i => !i.standalone);
  if (own.length) groups.push({ id: 'health-own', title: t('doctor.groupHealthOwn'), source: 'CLACOROO', severity: 'warning', items: own.map(healthItem) });
  if (fromPlugins.length) groups.push({ id: 'health-plugins', title: t('doctor.groupHealthPlugins'), source: 'CLACOROO', severity: 'info', items: fromPlugins.map(healthItem) });

  // 4. server MCP non connessi
  const badMcp = ((mcp && mcp.servers) || []).filter(s => ['error', 'needsAuth', 'warning'].includes(s.status));
  if (badMcp.length) {
    groups.push({
      id: 'mcp', title: t('doctor.groupMcp'), source: 'CLACOROO',
      severity: badMcp.some(s => s.status === 'error') ? 'error' : 'warning',
      items: badMcp.map(s => ({
        key: 'mcp:' + s.id, text: s.displayName || s.id, detail: s.statusText || s.status,
        action: { type: 'goto', section: 'mcp' },
      })),
    });
  }

  // 5. hook con programmi mancanti
  const hooks = buildHookList().map(h => ({ h, missing: missingDepsForHook(h) })).filter(x => x.missing.length);
  if (hooks.length) {
    groups.push({
      id: 'hooks', title: t('doctor.groupHooks'), source: 'CLACOROO', severity: 'warning',
      items: hooks.map(({ h, missing }) => ({
        key: 'hook:' + h.fullId + ':' + h.event + ':' + h.matcher,
        text: h.event + (h.matcher ? ' · ' + h.matcher : '') + ' · ' + h.pluginId,
        detail: t('doctor.hookMissing', { tools: missing.join(', ') }),
        action: { type: 'goto', section: 'hooks' },
      })),
    });
  }

  return { cc, groups };
}

async function runDoctor(render) {
  doctorState.running = true;
  render();
  try {
    doctorState.result = await collectDoctorFindings();
  } catch (e) {
    doctorState.result = { cc: { ok: false, error: e.message }, groups: [] };
  }
  doctorState.running = false;
  doctorState.count = doctorProblemCount(doctorState.result.groups);
  refreshDoctorBadge();
  render();
}

// Dopo una correzione: dati freschi (le liste cambiano) e nuovo controllo.
async function afterDoctorFix(render) {
  clearStatsCaches();
  await loadData();
  await runDoctor(render);
}

async function doctorFixAll(render) {
  const items = doctorAutoItems(doctorState.result.groups);
  if (!items.length) return;
  const choice = await window.claudeAPI.confirmDialog({
    title:   t('doctor.fixAllConfirm.title', { n: items.length }),
    message: t('doctor.fixAllConfirm.message'),
    detail:  items.map(i => '• ' + i.text).join('\n'),
    buttons: [t('button.cancel'), t('doctor.fixAllConfirm.yes')],
  });
  if (choice !== 1) return;
  let ok = 0, fail = 0;
  for (const i of items) {
    const r = await window.claudeAPI.trashItemFile(i.action.file);
    if (r.success) ok++; else fail++;
  }
  toast(fail ? t('doctor.fixAllPartial', { ok, fail }) : t('doctor.fixAllDone', { n: ok }), fail ? 'warn' : 'success');
  await afterDoctorFix(render);
}

/* ── Header ───────────────────────────────────────────────────────────── */

function buildDoctorButton() {
  const btn = btnWithIcon('btn btn-sm btn-refresh btn-doctor doctor-btn', 'stethoscope', t('topbar.doctor'));
  btn.title = t('topbar.doctorTooltip');
  btn.addEventListener('click', openDoctorModal);
  paintDoctorBadge(btn);
  return btn;
}

// Badge col numero di problemi dell'ultimo controllo (nessun badge prima del
// primo click, spunta verde se è tutto in ordine).
function paintDoctorBadge(btn) {
  const old = btn.querySelector('.doctor-badge');
  if (old) old.remove();
  if (doctorState.count == null) return;
  const badge = el('span', 'doctor-badge' + (doctorState.count ? '' : ' ok'));
  if (doctorState.count) badge.textContent = String(doctorState.count);
  else badge.appendChild(icon('check'));
  btn.appendChild(badge);
}

function refreshDoctorBadge() {
  const btn = document.querySelector('.doctor-btn');
  if (btn) paintDoctorBadge(btn);
}

/* ── Finestra ─────────────────────────────────────────────────────────── */

function openDoctorModal() {
  const overlay = el('div', 'md-overlay');
  const modal = el('div', 'md-modal doctor-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  const header = el('div', 'md-header');
  const title = el('div', 'md-title');
  title.appendChild(icon('stethoscope'));
  title.appendChild(document.createTextNode(' ' + t('doctor.title')));
  const closeBtn = el('button', 'md-close');
  closeBtn.appendChild(icon('x'));
  closeBtn.setAttribute('aria-label', t('button.close'));
  header.appendChild(title);
  header.appendChild(closeBtn);
  const body = el('div', 'md-content doctor-body');
  const foot = el('div', 'doctor-foot');
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(foot);
  overlay.appendChild(modal);

  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
  overlay._close = close;

  const render = () => renderDoctorBody(body, foot, render, close);
  swapModalOverlay(overlay);
  if (doctorState.running) render();
  else runDoctor(render);
}

function renderDoctorBody(body, foot, render, close) {
  body.textContent = '';
  foot.textContent = '';
  if (doctorState.running || !doctorState.result) {
    body.appendChild(el('div', 'doctor-running', t('doctor.running')));
    return;
  }
  const { cc, groups } = doctorState.result;
  const ign = new Set(doctorIgnored());

  if (cc && cc.ok) {
    const meta = [cc.info.Running && t('doctor.metaVersion', { v: cc.info.Running }), cc.info.Platform].filter(Boolean).join(' · ');
    if (meta) body.appendChild(el('div', 'doctor-meta', meta));
  } else {
    body.appendChild(el('div', 'doctor-error', t('doctor.ccError', { msg: (cc && cc.error) || '?' })));
  }

  const count = doctorProblemCount(groups);
  const autoItems = doctorAutoItems(groups);
  body.appendChild(el('div', 'doctor-summary' + (count ? ' has-issues' : ' clean'),
    count ? t('doctor.summary', { n: count, auto: autoItems.length }) : t('doctor.allGood')));

  for (const g of groups) {
    const visible = g.items.filter(i => doctorState.showIgnored || !ign.has(i.key));
    if (!visible.length) continue;
    const sec = el('div', 'doctor-group sev-' + g.severity);
    const head = el('div', 'doctor-group-head');
    head.appendChild(el('span', 'doctor-dot'));
    head.appendChild(el('span', 'doctor-group-title', g.title));
    head.appendChild(el('span', 'doctor-group-src', g.source + ' · ' + visible.length));
    const pending = g.items.filter(i => !ign.has(i.key));
    if (pending.length > 1) {
      const ignAll = el('button', 'btn btn-sm btn-ghost', t('doctor.ignoreGroup'));
      ignAll.addEventListener('click', async () => {
        await setDoctorIgnored([...doctorIgnored(), ...pending.map(i => i.key)]);
        render();
      });
      head.appendChild(ignAll);
    }
    sec.appendChild(head);
    visible.forEach(it => sec.appendChild(buildDoctorRow(it, ign.has(it.key), render, close)));
    body.appendChild(sec);
  }

  if (doctorState.showRaw && cc && Array.isArray(cc.runs)) {
    for (const run of cc.runs) {
      body.appendChild(el('div', 'doctor-raw-title', run.cwd));
      body.appendChild(el('pre', 'doctor-raw', run.raw || run.error || ''));
    }
  }

  // Footer: azioni globali a sinistra, vista e chiusura a destra
  const left = el('div', 'doctor-foot-group');
  const fixAll = el('button', 'btn btn-sm btn-accent-outline', t('doctor.fixAll', { n: autoItems.length }));
  fixAll.disabled = !autoItems.length;
  fixAll.title = t('doctor.fixAllTip');
  fixAll.addEventListener('click', () => doctorFixAll(render));
  const withClaude = el('button', 'btn btn-sm btn-ghost', t('doctor.withClaude'));
  withClaude.title = t('doctor.withClaudeTip');
  withClaude.addEventListener('click', async () => {
    close();
    try { await navigator.clipboard.writeText('/doctor'); } catch { /* graceful */ }
    const tab = await openTerminalWithCommand('claude', { title: 'claude /doctor' });
    if (tab) toast(t('doctor.withClaudeHint'), 'info');
  });
  left.appendChild(fixAll);
  left.appendChild(withClaude);

  const right = el('div', 'doctor-foot-group');
  const recheck = el('button', 'btn btn-sm btn-ghost', t('doctor.recheck'));
  recheck.addEventListener('click', () => runDoctor(render));
  right.appendChild(recheck);
  const rawBtn = el('button', 'btn btn-sm btn-ghost', t(doctorState.showRaw ? 'doctor.hideRaw' : 'doctor.showRaw'));
  rawBtn.addEventListener('click', () => { doctorState.showRaw = !doctorState.showRaw; render(); });
  right.appendChild(rawBtn);
  const ignoredCount = groups.flatMap(g => g.items).filter(i => ign.has(i.key)).length;
  if (ignoredCount) {
    const ignBtn = el('button', 'btn btn-sm btn-ghost',
      doctorState.showIgnored ? t('doctor.hideIgnored') : t('doctor.showIgnored', { n: ignoredCount }));
    ignBtn.addEventListener('click', () => { doctorState.showIgnored = !doctorState.showIgnored; render(); });
    right.appendChild(ignBtn);
  }
  const leave = el('button', 'btn btn-sm btn-ghost', t('doctor.leave'));
  leave.addEventListener('click', close);
  right.appendChild(leave);
  foot.appendChild(left);
  foot.appendChild(right);
}

function buildDoctorRow(it, ignored, render, close) {
  const row = el('div', 'doctor-row' + (ignored ? ' ignored' : ''));
  const txt = el('div', 'doctor-row-text');
  txt.appendChild(el('div', 'doctor-row-main', it.text));
  if (it.detail) txt.appendChild(el('div', 'doctor-row-detail', it.detail));
  row.appendChild(txt);

  const acts = el('div', 'doctor-row-actions');
  const add = (label, onClick, cls) => {
    const b = el('button', 'btn btn-sm ' + (cls || 'btn-ghost'), label);
    b.addEventListener('click', onClick);
    acts.appendChild(b);
  };
  const a = it.action;
  if (ignored) {
    add(t('doctor.restore'), async () => {
      await setDoctorIgnored(doctorIgnored().filter(k => k !== it.key));
      render();
    });
  } else {
    if (a.type === 'trash') add(t('doctor.fix'), async () => {
      const r = await window.claudeAPI.trashItemFile(a.file);
      if (r.success) toast(t('doctor.fixed'), 'success');
      else toast(t('toast.itemTrashError', { msg: r.error || '?' }), 'error');
      await afterDoctorFix(render);
    }, 'btn-accent-outline');
    if (a.type === 'terminal') add(t('doctor.runInTerminal', { cmd: a.command }), () => {
      close();
      openTerminalWithCommand(a.command);
    });
    if (a.type === 'copy') add(t('doctor.copyCommand'), async () => {
      try { await navigator.clipboard.writeText(a.command); toast(t('doctor.copied'), 'success'); }
      catch (e) { toast(t('toast.errorPrefix', { msg: e.message }), 'error'); }
    });
    if (a.type === 'open') add(t('doctor.openFile'), async () => {
      const r = await window.claudeAPI.openDirectory(a.file);
      if (!r.success) toast(t('toast.errorPrefix', { msg: r.error || '?' }), 'error');
    });
    if (a.type === 'preview') add(t('doctor.open'), () => openItemPreview(a.item));
    if (a.type === 'goto') add(t(a.section === 'mcp' ? 'doctor.gotoMcp' : 'doctor.gotoHooks'), () => {
      close();
      switchToSection(a.section);
    });
    add(t('doctor.ignore'), async () => {
      await setDoctorIgnored([...doctorIgnored(), it.key]);
      render();
    });
  }
  row.appendChild(acts);
  return row;
}
