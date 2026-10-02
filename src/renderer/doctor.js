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
//   Alla riapertura mostra subito l'ultimo risultato e lo aggiorna in sottofondo.
// - "Correggi tutto" esegue solo azioni sicure e reversibili (action.auto: oggi i
//   link rotti, spostati nel Cestino). Il resto è guidato: apri file, copia
//   comando, esegui nel terminale, vai alla sezione. Ogni voce si può ignorare
//   (persistito in state.doctorIgnored; a ogni controllo si tolgono le voci che
//   non compaiono più).
// - "Con Claude" apre una sessione nel terminale integrato per /doctor, il
//   checkup completo con l'AI, che chiede conferma per ogni correzione. Il
//   comando non si passa come prompt iniziale: Claude Code può prima chiedere
//   se fidarsi della cartella, quindi /doctor va negli appunti.
// - "Problema" di una skill/agent = itemProblem() di app.js, la stessa
//   definizione del KPI Health della Dashboard.
// Usa i global di app.js (el, t, icon, toast, state, ...): è caricato prima,
// ma le funzioni vengono chiamate solo dopo l'avvio.

// cc = risposta di doctor:run, mcp = risposta di get-mcp: restano salvati per
// rifare i gruppi dopo una correzione senza rilanciare i comandi. groups =
// [{ title, source, severity: 'error'|'warning'|'info', items: [{ key, text, detail, action }] }]
// running = primo controllo (solo attesa); refreshing = aggiornamento mentre si
// vede già l'ultimo risultato. paint = ridisegno della finestra aperta (null se
// chiusa): un controllo che finisce dopo una chiusura e riapertura aggiorna
// comunque la finestra giusta.
const doctorState = { cc: null, mcp: null, groups: [], running: false, refreshing: false, paint: null, showIgnored: false, showRaw: false };

const doctorIsIgnored = key => state.doctorIgnored.includes(key);
const paintDoctor = () => { if (doctorState.paint) doctorState.paint(); };

// Da sistemare: voci non ignorate dei gruppi che non sono solo informativi (le
// sezioni di `claude doctor` senza problemi, come Remote Control).
// Definizione unica per badge, riepilogo e "Correggi tutto".
const doctorPending = groups => groups
  .filter(g => g.severity !== 'info')
  .flatMap(g => g.items)
  .filter(i => !doctorIsIgnored(i.key));

async function setDoctorIgnored(list) {
  state.doctorIgnored = list;
  try { await window.claudeAPI.setState({ doctorIgnored: list }); } catch { /* graceful */ }
  refreshDoctorBadge();
}

// Toglie dalle voci ignorate quelle che non compaiono più (problema risolto): lo
// stato non cresce e, se il problema torna, riappare. Le categorie che non si
// sono potute leggere in questo controllo (claude doctor o MCP falliti) non si
// toccano, altrimenti un controllo andato male cancellerebbe le scelte.
async function pruneDoctorIgnored() {
  const present = new Set(doctorState.groups.flatMap(g => g.items.map(i => i.key)));
  const unreadable = { 'cc:': !doctorState.cc.ok, 'mcp:': !(doctorState.mcp && doctorState.mcp.servers) };
  const keep = state.doctorIgnored.filter(k => present.has(k) || unreadable[k.slice(0, k.indexOf(':') + 1)]);
  if (keep.length !== state.doctorIgnored.length) await setDoctorIgnored(keep);
}

// Titoli tradotti per i blocchi di `claude doctor` che si riconoscono; gli altri
// restano col loro titolo originale.
const DOCTOR_CC_TITLES = { error: 'doctor.groupSettings', warning: 'doctor.groupInstall' };
// Le chiavi di "ignora" devono sopravvivere a un aggiornamento: via i numeri di
// versione, e per MCP/hook il codice del problema, così se lo stato cambia (es.
// da needsAuth a error) la voce riappare. Per skill/agent: itemProblemKey().
const ccKey = text => 'cc:' + text.replace(/\d+(?:\.\d+)+/g, '#').replace(/\s+/g, ' ');

function buildDoctorGroups(cc, mcp) {
  const groups = [];
  const add = (title, severity, items, source = 'CLACOROO') => {
    if (items.length) groups.push({ title, source, severity, items });
  };

  // 1. claude doctor: voci e correzioni restano nel testo originale (in inglese)
  if (cc.ok) {
    for (const s of cc.sections) {
      add(DOCTOR_CC_TITLES[s.kind] ? t(DOCTOR_CC_TITLES[s.kind]) : s.title,
        s.kind === 'unknown' ? 'warning' : s.kind,
        s.items.map(it => ({ key: ccKey(it.text), text: it.text, detail: it.fix, action: it.action })),
        'claude doctor');
    }
  }

  // 2. skill/agent con un problema (itemProblem): i link rotti sono gli unici con
  //    correzione automatica; per il front matter le tue voci le correggi tu, quelle
  //    dei plugin vanno corrette dall'autore (ma contano lo stesso, e si possono ignorare)
  const problems = [...allSkillItems(), ...allAgentItems()].filter(itemProblem);
  add(t('doctor.groupBroken'), 'warning', problems.filter(i => i.broken).map(i => ({
    key: itemProblemKey(i),
    text: i.plugin + '/' + i.name,
    detail: t('skillAgent.brokenHint', { target: i.target || '?' }),
    action: i.removePath ? { type: 'trash', item: i, auto: true } : { type: 'none' },
  })));
  const healthItem = i => ({
    key: itemProblemKey(i),
    text: i.name + ' · ' + i.plugin,
    detail: i.health.issues.map(translateHealthIssue).join(' · '),
    action: { type: 'preview', item: i },
  });
  const unhealthy = problems.filter(i => !i.broken);
  add(t('doctor.groupHealthOwn'), 'warning', unhealthy.filter(i => i.standalone).map(healthItem));
  add(t('doctor.groupHealthPlugins'), 'warning', unhealthy.filter(i => !i.standalone).map(healthItem));

  // 3. server MCP non connessi
  const badMcp = ((mcp && mcp.servers) || []).filter(s => ['error', 'needsAuth', 'warning'].includes(s.status));
  add(t('doctor.groupMcp'), badMcp.some(s => s.status === 'error') ? 'error' : 'warning', badMcp.map(s => ({
    key: 'mcp:' + s.id + ':' + s.status,
    text: s.displayName || s.id,
    detail: s.statusText || s.status,
    action: { type: 'goto', section: 'mcp' },
  })));

  // 4. hook con programmi mancanti
  const hooks = buildHookList().map(h => ({ h, missing: missingDepsForHook(h) })).filter(x => x.missing.length);
  add(t('doctor.groupHooks'), 'warning', hooks.map(({ h, missing }) => ({
    key: 'hook:' + h.fullId + ':' + h.event + ':' + h.matcher + ':' + missing.join(','),
    text: h.event + (h.matcher ? ' · ' + h.matcher : '') + ' · ' + h.pluginId,
    detail: t('doctor.hookMissing', { tools: missing.join(', ') }),
    action: { type: 'goto', section: 'hooks' },
  })));

  return groups;
}

function rebuildDoctor() {
  doctorState.groups = buildDoctorGroups(doctorState.cc, doctorState.mcp);
  refreshDoctorBadge();
}

// Controllo completo: claude doctor (home + progetti) e server MCP insieme.
// Provato: `claude mcp list` in parallelo a `claude doctor` non dà il falso
// allarme del Portachiavi che si ha tra due `claude doctor` paralleli.
// Con un risultato già in mano resta visibile mentre si aggiorna.
async function runDoctor() {
  if (doctorState.running || doctorState.refreshing) return;
  if (doctorState.cc) doctorState.refreshing = true; else doctorState.running = true;
  paintDoctor();
  try {
    [doctorState.cc, doctorState.mcp] = await Promise.all([
      window.claudeAPI.doctorRun(),
      window.claudeAPI.getMcp({}).catch(() => null),
    ]);
  } catch (e) {
    doctorState.cc = { ok: false, error: e.message };
    doctorState.mcp = null;
  }
  doctorState.running = doctorState.refreshing = false;
  rebuildDoctor();
  await pruneDoctorIgnored();
  paintDoctor();
}

async function doctorFixAll() {
  const items = doctorPending(doctorState.groups).filter(i => i.action.auto);
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
    const r = await window.claudeAPI.trashItemFile(i.action.item.file);
    if (r.success) ok++; else fail++;
  }
  toast(fail ? t('doctor.fixAllPartial', { ok, fail }) : t('doctor.fixAllDone', { n: ok }), fail ? 'warn' : 'success');
  // Le correzioni toccano solo skill/agent: dati app freschi e gruppi rifatti,
  // senza rilanciare claude doctor né i controlli MCP.
  clearStatsCaches();
  lastSelfChangeAt = Date.now();
  await loadData();
  rebuildDoctor();
  paintDoctor();
}

/* ── Header ───────────────────────────────────────────────────────────── */

function buildDoctorButton() {
  const btn = btnWithIcon('btn btn-sm btn-refresh btn-doctor', 'stethoscope', t('topbar.doctor'));
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
  if (!doctorState.cc) return;
  const count = doctorPending(doctorState.groups).length;
  const badge = el('span', 'doctor-badge' + (count ? '' : ' ok'));
  if (count) badge.textContent = String(count);
  else badge.appendChild(icon('check'));
  btn.appendChild(badge);
}

function refreshDoctorBadge() {
  const btn = document.querySelector('.btn-doctor');
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

  const paint = () => renderDoctorBody(body, foot, close);
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    document.removeEventListener('keydown', onKey);
    if (doctorState.paint === paint) doctorState.paint = null;
    overlay.remove();
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);
  overlay._close = close;

  doctorState.paint = paint;
  swapModalOverlay(overlay);
  // Subito l'ultimo risultato (se c'è) e aggiornamento in sottofondo; se un
  // controllo è già in corso, runDoctor non ne parte un secondo.
  runDoctor();
  paintDoctor();
}

function renderDoctorBody(body, foot, close) {
  body.textContent = '';
  foot.textContent = '';
  if (doctorState.running) {
    body.appendChild(el('div', 'doctor-running', t('doctor.running')));
    return;
  }
  const { cc, groups } = doctorState;
  const updating = doctorState.refreshing ? ' · ' + t('doctor.refreshing') : '';

  if (cc.ok) {
    const meta = [cc.info.Running && t('doctor.metaVersion', { v: cc.info.Running }), cc.info.Platform].filter(Boolean).join(' · ');
    // Il blocco chiave: valore (versione, piattaforma) è la parte più stabile
    // dell'output: se manca, il formato è cambiato e non si deve dire "tutto ok".
    body.appendChild(el('div', meta ? 'doctor-meta' : 'doctor-error', (meta || t('doctor.unrecognized')) + updating));
  } else {
    body.appendChild(el('div', 'doctor-error', t('doctor.ccError', { msg: cc.error || '?' }) + updating));
  }

  const pending = doctorPending(groups);
  const autoCount = pending.filter(i => i.action.auto).length;
  body.appendChild(el('div', 'doctor-summary ' + (pending.length ? 'has-issues' : 'clean'),
    pending.length ? t('doctor.summary', { n: pending.length, auto: autoCount }) : t('doctor.allGood')));

  for (const g of groups) {
    const visible = g.items.filter(i => doctorState.showIgnored || !doctorIsIgnored(i.key));
    if (!visible.length) continue;
    const sec = el('div', 'doctor-group sev-' + g.severity);
    const head = el('div', 'doctor-group-head');
    head.appendChild(el('span', 'doctor-dot'));
    head.appendChild(el('span', 'doctor-group-title', g.title));
    head.appendChild(el('span', 'doctor-group-src', g.source + ' · ' + visible.length));
    const open = g.items.filter(i => !doctorIsIgnored(i.key));
    if (open.length > 1) {
      const ignAll = el('button', 'btn btn-sm btn-ghost', t('doctor.ignoreGroup'));
      ignAll.addEventListener('click', async () => {
        await setDoctorIgnored([...state.doctorIgnored, ...open.map(i => i.key)]);
        paintDoctor();
      });
      head.appendChild(ignAll);
    }
    sec.appendChild(head);
    visible.forEach(it => sec.appendChild(buildDoctorRow(it, close)));
    body.appendChild(sec);
  }

  if (doctorState.showRaw && cc.ok) {
    for (const run of cc.runs) {
      body.appendChild(el('div', 'doctor-raw-title', run.cwd));
      body.appendChild(el('pre', 'doctor-raw', run.raw || run.error || ''));
    }
  }

  // Footer: azioni globali a sinistra, vista e chiusura a destra
  const left = el('div', 'doctor-foot-group');
  const fixAll = el('button', 'btn btn-sm btn-accent-outline', t('doctor.fixAll', { n: autoCount }));
  fixAll.disabled = !autoCount;
  fixAll.title = t('doctor.fixAllTip');
  fixAll.addEventListener('click', doctorFixAll);
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
  recheck.disabled = doctorState.refreshing;
  recheck.addEventListener('click', runDoctor);
  right.appendChild(recheck);
  const rawBtn = el('button', 'btn btn-sm btn-ghost', t(doctorState.showRaw ? 'doctor.hideRaw' : 'doctor.showRaw'));
  rawBtn.addEventListener('click', () => { doctorState.showRaw = !doctorState.showRaw; paintDoctor(); });
  right.appendChild(rawBtn);
  const ignoredCount = groups.flatMap(g => g.items).filter(i => doctorIsIgnored(i.key)).length;
  if (ignoredCount) {
    const ignBtn = el('button', 'btn btn-sm btn-ghost',
      doctorState.showIgnored ? t('doctor.hideIgnored') : t('doctor.showIgnored', { n: ignoredCount }));
    ignBtn.addEventListener('click', () => { doctorState.showIgnored = !doctorState.showIgnored; paintDoctor(); });
    right.appendChild(ignBtn);
  }
  const leave = el('button', 'btn btn-sm btn-ghost', t('doctor.leave'));
  leave.addEventListener('click', close);
  right.appendChild(leave);
  foot.appendChild(left);
  foot.appendChild(right);
}

function buildDoctorRow(it, close) {
  const ignored = doctorIsIgnored(it.key);
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
  row.appendChild(acts);

  if (ignored) {
    add(t('doctor.restore'), async () => {
      await setDoctorIgnored(state.doctorIgnored.filter(k => k !== it.key));
      paintDoctor();
    });
    return row;
  }

  const a = it.action;
  // Stessa eliminazione della card Skill/Agent (con la sua conferma); si rifanno
  // i gruppi sui dati app già ricaricati, senza rilanciare claude doctor.
  if (a.type === 'trash') add(t('doctor.fix'), async () => {
    if (!(await deleteItem(a.item))) return;
    rebuildDoctor();
    paintDoctor();
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
    await setDoctorIgnored([...state.doctorIgnored, it.key]);
    paintDoctor();
  });
  return row;
}
