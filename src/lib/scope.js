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

// v1.2.20 — Da globale a locale: skill personali e plugin assegnati a uno o più
// progetti, per non caricarli in ogni sessione.
//   - Skill: la cartella passa da ~/.claude/skills a ~/.claude/skills-library e
//     ogni progetto assegnato ne riceve un link simbolico in .claude/skills.
//   - Plugin: enabledPlugins false in ~/.claude/settings.json e true in
//     <progetto>/.claude/settings.local.json.
// Ogni modifica è una "azione" (moveDir / link / unlink / setting / exclude*):
// la stessa lista alimenta anteprima e applicazione. Ogni azione eseguita
// produce la propria inversa, salvata nel backup: l'annullamento le riapplica
// al contrario. I file di impostazioni toccati vengono anche copiati nel backup.

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const INVENTORY = require('./inventory');
const { mcpServersFromRaw } = require('./mcp');

const NAME_RE   = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;
const PLUGIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*@[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
const BYTES_PER_TOKEN = 3.5;   // stessa stima di stats.js
const MCP_TOKENS = 400;        // stessa stima di stats.js per server MCP connesso
const MAX_BACKUPS = 20;

const isDir  = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const isFile = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const lstat  = p => { try { return fs.lstatSync(p); } catch { return null; } };
const same   = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

// Scrittura atomica: file temporaneo nella stessa cartella e rename.
function writeJsonAtomic(file, obj, indent) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.clacoroo-tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, indent) + '\n', 'utf8');
  try { fs.chmodSync(tmp, fs.statSync(file).mode); } catch { /* file nuovo */ }
  fs.renameSync(tmp, file);
}

function detectIndent(file) {
  try { return /^\t/m.test(fs.readFileSync(file, 'utf8')) ? '\t' : 2; } catch { return 2; }
}

function frontmatterTokens(file) {
  try {
    const m = fs.readFileSync(file, 'utf8').match(/^---\r?\n[\s\S]*?\r?\n---/);
    return m ? Math.round(Buffer.byteLength(m[0], 'utf8') / BYTES_PER_TOKEN) : 0;
  } catch { return 0; }
}

function getPath(obj, keys) {
  let cur = obj;
  for (const k of keys) { if (cur === null || typeof cur !== 'object' || !(k in cur)) return undefined; cur = cur[k]; }
  return cur;
}

// Imposta (o rimuove) obj[keys...]; toglie i contenitori rimasti vuoti.
function setPath(obj, keys, value, del) {
  const stack = [];
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] === null || typeof cur[keys[i]] !== 'object') {
      if (del) return;
      cur[keys[i]] = {};
    }
    stack.push([cur, keys[i]]);
    cur = cur[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (del) {
    delete cur[last];
    for (let i = stack.length - 1; i >= 0; i--) {
      const [parent, key] = stack[i];
      if (Object.keys(parent[key]).length) break;
      delete parent[key];
    }
  } else cur[last] = value;
}

// ── git ──────────────────────────────────────────────────────────────────────
function git(cwd, args) {
  try {
    return { code: 0, out: execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }).trim() };
  } catch (e) { return { code: typeof e.status === 'number' ? e.status : -1, out: '' }; }
}

function gitRepoInfo(project) {
  if (git(project, ['rev-parse', '--is-inside-work-tree']).out !== 'true') return null;
  const prefix = git(project, ['rev-parse', '--show-prefix']).out;
  const ex = git(project, ['rev-parse', '--git-path', 'info/exclude']).out;
  if (!ex) return null;
  return { prefix, excludeFile: path.resolve(project, ex) };
}

// ── modulo ───────────────────────────────────────────────────────────────────
// opts: { claudeDir, backupRoot, ledgerFile, trackedProjects: () => string[] }
function create(opts) {
  const { claudeDir, backupRoot, ledgerFile } = opts;
  const skillsDir   = path.join(claudeDir, 'skills');
  const libDir      = path.join(claudeDir, 'skills-library');
  const userSetting = path.join(claudeDir, 'settings.json');
  const installedFile = path.join(claudeDir, 'plugins', 'installed_plugins.json');

  const tracked = () => (opts.trackedProjects() || []).map(p => path.resolve(p)).filter(isDir);
  const ledger  = () => (readJson(ledgerFile, {}).projects || []).filter(p => typeof p === 'string');
  const knownProjects = () => [...new Set([...tracked(), ...ledger().map(p => path.resolve(p)).filter(isDir)])];

  const projSkillLink  = (p, name) => path.join(p, '.claude', 'skills', name);
  const projLocalFile  = p => path.join(p, '.claude', 'settings.local.json');

  // Link simbolico di `at` che punta a `target` (anche tramite catena di link).
  function linksTo(at, target) {
    const st = lstat(at);
    if (!st || !st.isSymbolicLink()) return false;
    try { return fs.realpathSync(at) === fs.realpathSync(target); } catch { return false; }
  }

  // ── token ──
  function skillTokens(dir) { return frontmatterTokens(path.join(dir, 'SKILL.md')); }

  function pluginTokens(id) {
    const installed = readJson(installedFile, { plugins: {} });
    const root = INVENTORY.installPathFor(installed, id);
    if (!root) return 0;
    let meta = {};
    for (const loc of ['plugin.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json']) {
      const mp = path.join(root, loc);
      if (isFile(mp)) { meta = readJson(mp, {}); break; }
    }
    const items = INVENTORY.scanPluginItems(root, meta);
    let tok = 0;
    for (const i of [...items.skills, ...items.agents, ...items.commands]) tok += frontmatterTokens(i.file);
    for (const f of ['.mcp.json', 'mcp.json', path.join('.claude-plugin', 'mcp.json')]) {
      const mf = path.join(root, f);
      if (isFile(mf)) { tok += Object.keys(mcpServersFromRaw(readJson(mf, {}))).length * MCP_TOKENS; break; }
    }
    return tok;
  }

  // ── inventario ──
  function inventory() {
    const projects = tracked();
    const known = knownProjects();
    const settings = readJson(userSetting, {});
    const skills = [];
    const seen = new Set();
    const addSkills = (dir, where) => {
      let entries = [];
      try { entries = fs.readdirSync(dir); } catch { return; }
      for (const name of entries.sort()) {
        if (name.startsWith('.') || !NAME_RE.test(name) || seen.has(name)) continue;
        const d = path.join(dir, name);
        if (!isFile(path.join(d, 'SKILL.md'))) continue;
        seen.add(name);
        skills.push({
          name, where,
          override: (settings.skillOverrides || {})[name] || null,
          projects: where === 'library' ? known.filter(p => linksTo(projSkillLink(p, name), d)) : [],
          tokens: skillTokens(d),
        });
      }
    };
    addSkills(skillsDir, 'global');
    addSkills(libDir, 'library');

    const installed = readJson(installedFile, { plugins: {} });
    const enabled = settings.enabledPlugins || {};
    const plugins = [];
    for (const [id, entries] of Object.entries(installed.plugins || {})) {
      if (!PLUGIN_RE.test(id) || !Array.isArray(entries) || !entries.some(e => e && e.scope === 'user')) continue;
      const localProjects = known.filter(p => getPath(readJson(projLocalFile(p), {}), ['enabledPlugins', id]) === true);
      const where = enabled[id] === true ? 'global' : (localProjects.length ? 'local' : 'off');
      plugins.push({ id, where, projects: localProjects, tokens: pluginTokens(id) });
    }
    plugins.sort((a, b) => a.id.localeCompare(b.id));
    return { projects, skills, plugins, libraryDir: libDir };
  }

  // ── pianificazione ──
  const settingAction = (file, keys, value, del) => ({ t: 'setting', file, keys, value, del: !!del });

  // Azioni per portare `op` allo stato desiderato. Restituisce { actions, errors, tokens, projects }.
  function plan(op) {
    const errors = [];
    const actions = [];
    const projects = tracked();
    const want = Array.isArray(op.projects) ? [...new Set(op.projects.map(p => path.resolve(String(p))))] : [];
    if (op.target !== 'global' && op.target !== 'projects') errors.push('badTarget');
    for (const p of want) if (!projects.includes(p)) errors.push('badProject');
    if (errors.length) return { errors, actions, tokens: 0 };

    const known = knownProjects();
    const settings = readJson(userSetting, {});

    if (op.kind === 'skill') {
      const name = op.name;
      if (typeof name !== 'string' || !NAME_RE.test(name)) return { errors: ['badName'], actions, tokens: 0 };
      const gDir = path.join(skillsDir, name), lDir = path.join(libDir, name);
      const inGlobal = isFile(path.join(gDir, 'SKILL.md')), inLib = isFile(path.join(lDir, 'SKILL.md'));
      if (!inGlobal && !inLib) return { errors: ['notFound'], actions, tokens: 0 };
      const tokens = skillTokens(inGlobal ? gDir : lDir);
      const hadLinks = known.filter(p => linksTo(projSkillLink(p, name), lDir));
      const off = (settings.skillOverrides || {})[name] === 'off';
      const localOn = p => settingAction(projLocalFile(p), ['skillOverrides', name], 'on');
      const localClear = p => settingAction(projLocalFile(p), ['skillOverrides', name], null, true);

      if (op.target === 'global') {
        if (inGlobal) errors.push('alreadyGlobal');
        else {
          if (lstat(gDir)) errors.push('conflictGlobal');
          for (const p of hadLinks) {
            actions.push({ t: 'unlink', at: projSkillLink(p, name) });
            if (off && getPath(readJson(projLocalFile(p), {}), ['skillOverrides', name]) === 'on') actions.push(localClear(p));
          }
          actions.push({ t: 'moveDir', from: lDir, to: gDir });
        }
      } else {
        if (inGlobal) {
          if (lstat(lDir)) errors.push('conflictLibrary');
          actions.push({ t: 'moveDir', from: gDir, to: lDir });
        }
        for (const p of hadLinks.filter(x => !want.includes(x))) {
          actions.push({ t: 'unlink', at: projSkillLink(p, name) });
          if (off) actions.push(localClear(p));
        }
        for (const p of want.filter(x => !hadLinks.includes(x))) {
          const at = projSkillLink(p, name);
          if (lstat(at)) { errors.push('conflictProject:' + p); continue; }
          actions.push({ t: 'link', at, target: lDir });
          if (off) actions.push(localOn(p));
        }
      }
      return { errors, actions, tokens, projects: want, fixed: [] };
    }

    if (op.kind === 'plugin') {
      const id = op.id;
      if (typeof id !== 'string' || !PLUGIN_RE.test(id)) return { errors: ['badName'], actions, tokens: 0 };
      const installed = readJson(installedFile, { plugins: {} }).plugins || {};
      if (!Array.isArray(installed[id]) || !installed[id].some(e => e && e.scope === 'user')) return { errors: ['notFound'], actions, tokens: 0 };
      const tokens = pluginTokens(id);
      const hadLocal = known.filter(p => getPath(readJson(projLocalFile(p), {}), ['enabledPlugins', id]) === true);
      const key = ['enabledPlugins', id];
      if (op.target === 'global') {
        if (settings.enabledPlugins && settings.enabledPlugins[id] === true) errors.push('alreadyGlobal');
        actions.push(settingAction(userSetting, key, true));
        for (const p of hadLocal) actions.push(settingAction(projLocalFile(p), key, null, true));
      } else {
        actions.push(settingAction(userSetting, key, false));
        for (const p of want) actions.push(settingAction(projLocalFile(p), key, true));
        for (const p of hadLocal.filter(x => !want.includes(x))) actions.push(settingAction(projLocalFile(p), key, null, true));
      }
      return { errors, actions, tokens, projects: want };
    }
    return { errors: ['badKind'], actions, tokens: 0 };
  }

  // Avvisi git: file nuovi in un repository che finirebbero nei commit.
  // Restituisce { warnings, excludeActions }: le azioni sono aggiunte solo se richieste.
  function gitCheck(actions) {
    const warnings = [], excludeActions = [];
    const byProject = new Map();
    for (const a of actions) {
      let file = null;
      if (a.t === 'link') file = a.at;
      else if (a.t === 'setting' && a.file !== userSetting && !a.del) file = a.file;
      if (!file) continue;
      const proj = file.split(path.sep + '.claude' + path.sep)[0];
      if (!byProject.has(proj)) byProject.set(proj, new Set());
      byProject.get(proj).add(file);
    }
    for (const [proj, files] of byProject) {
      const info = gitRepoInfo(proj);
      if (!info) continue;
      for (const file of files) {
        const rel = path.relative(proj, file);
        if (git(proj, ['check-ignore', '-q', '--', rel]).code === 0) continue;
        const line = '/' + (info.prefix || '') + rel.split(path.sep).join('/');
        warnings.push({ project: proj, path: rel, line });
        excludeActions.push({ t: 'excludeAdd', file: info.excludeFile, line });
      }
    }
    return { warnings, excludeActions };
  }

  function describe(a) {
    switch (a.t) {
      case 'moveDir': return { type: 'move', from: a.from, to: a.to };
      case 'link':    return { type: 'link', at: a.at, target: a.target };
      case 'unlink':  return { type: 'unlink', at: a.at };
      case 'setting': return { type: 'setting', file: a.file, key: a.keys.join('.'), value: a.del ? null : a.value, del: a.del };
      case 'excludeAdd': return { type: 'exclude', file: a.file, line: a.line };
      default: return { type: a.t };
    }
  }

  function planHash(actions) {
    return crypto.createHash('sha1').update(JSON.stringify(actions)).digest('hex');
  }

  // Anteprima: nessuna scrittura. `gitExclude` aggiunge le righe a .git/info/exclude.
  function preview(op) {
    const p = plan(op);
    if (p.errors.length) return { ok: false, errors: p.errors };
    if (!p.actions.length) return { ok: false, errors: ['nothing'] };
    const g = gitCheck(p.actions);
    const actions = op.gitExclude ? [...p.actions, ...g.excludeActions] : p.actions;
    const touched = [...new Set(actions.flatMap(a => a.t === 'moveDir' ? [a.from, a.to] : [a.at || a.file]))];
    // Risparmio: il costo dell'elemento esce dalle sessioni fuori dai progetti assegnati.
    // Tornando globale è l'inverso (nessun risparmio, costo aggiunto ovunque).
    const saving = op.target === 'projects' ? p.tokens : 0;
    return {
      ok: true,
      actions: actions.map(describe),
      touched,
      tokens: { item: p.tokens, savedPerSession: saving, addedPerSession: op.target === 'global' ? p.tokens : 0 },
      warnings: g.warnings,
      planHash: planHash(actions),
    };
  }

  // ── esecuzione ──
  // Ogni funzione esegue l'azione e ritorna la sua inversa; lancia se non applicabile.
  const RUN = {
    moveDir(a) {
      const st = lstat(a.from);
      if (!st) throw new Error('Sorgente sparita: ' + a.from);
      if (lstat(a.to)) throw new Error('Destinazione già presente: ' + a.to);
      fs.mkdirSync(path.dirname(a.to), { recursive: true });
      if (st.isSymbolicLink()) {
        fs.symlinkSync(fs.realpathSync(a.from), a.to);   // assoluto: il link relativo si romperebbe
        fs.unlinkSync(a.from);
      } else fs.renameSync(a.from, a.to);
      return { t: 'moveDir', from: a.to, to: a.from };
    },
    link(a) {
      if (lstat(a.at)) throw new Error('Esiste già: ' + a.at);
      fs.mkdirSync(path.dirname(a.at), { recursive: true });
      fs.symlinkSync(a.target, a.at);
      return { t: 'unlink', at: a.at, expect: a.target };
    },
    unlink(a) {
      const st = lstat(a.at);
      if (!st) return null;
      if (!st.isSymbolicLink()) throw new Error('Non è un link simbolico: ' + a.at);
      const target = fs.readlinkSync(a.at);
      if (a.expect && path.resolve(path.dirname(a.at), target) !== a.expect) throw new Error('Il link è stato cambiato: ' + a.at);
      fs.unlinkSync(a.at);
      return { t: 'link', at: a.at, target };
    },
    setting(a) {
      const existed = isFile(a.file);
      let obj = existed ? readJson(a.file, null) : {};
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('JSON non valido: ' + a.file);
      const prev = getPath(obj, a.keys);
      const indent = existed ? detectIndent(a.file) : 2;
      setPath(obj, a.keys, a.value, a.del);
      writeJsonAtomic(a.file, obj, indent);
      return { t: 'setting', file: a.file, keys: a.keys, value: prev, del: prev === undefined, createdFile: !existed || undefined };
    },
    excludeAdd(a) {
      let cur = '';
      try { cur = fs.readFileSync(a.file, 'utf8'); } catch { /* nuovo */ }
      if (cur.split('\n').includes(a.line)) return null;
      fs.mkdirSync(path.dirname(a.file), { recursive: true });
      fs.writeFileSync(a.file, cur + (cur && !cur.endsWith('\n') ? '\n' : '') + a.line + '\n', 'utf8');
      return { t: 'excludeRemove', file: a.file, line: a.line };
    },
    excludeRemove(a) {
      let cur;
      try { cur = fs.readFileSync(a.file, 'utf8'); } catch { return null; }
      fs.writeFileSync(a.file, cur.split('\n').filter(l => l !== a.line).join('\n'), 'utf8');
      return null;
    },
  };

  // Esegue in sequenza; a metà errore ripristina quanto fatto. Ritorna il giornale delle inverse.
  function execute(actions) {
    const journal = [];
    try {
      for (const a of actions) {
        const inv = RUN[a.t](a);
        if (inv) journal.push(inv);
      }
    } catch (e) {
      for (const inv of journal.slice().reverse()) { try { RUN[inv.t](inv); } catch { /* meglio un ripristino parziale che nessuno */ } }
      throw e;
    }
    return journal;
  }

  function stamp() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${String(d.getMilliseconds()).padStart(3, '0')}`;
  }

  function pruneBackups() {
    let dirs = [];
    try { dirs = fs.readdirSync(backupRoot).filter(d => isDir(path.join(backupRoot, d))).sort(); } catch { return; }
    for (const d of dirs.slice(0, Math.max(0, dirs.length - MAX_BACKUPS))) {
      try { fs.rmSync(path.join(backupRoot, d), { recursive: true, force: true }); } catch { /* ignora */ }
    }
  }

  function apply(op, expectedHash) {
    const p = plan(op);
    if (p.errors.length) return { success: false, errors: p.errors };
    const g = gitCheck(p.actions);
    const actions = op.gitExclude ? [...p.actions, ...g.excludeActions] : p.actions;
    if (!actions.length) return { success: false, errors: ['nothing'] };
    if (expectedHash && planHash(actions) !== expectedHash) return { success: false, errors: ['stale'] };

    // Backup prima di scrivere: copia dei file di impostazioni toccati.
    const id = stamp();
    const dir = path.join(backupRoot, id);
    fs.mkdirSync(dir, { recursive: true });
    const files = [...new Set(actions.filter(a => a.t === 'setting' || a.t === 'excludeAdd').map(a => a.file))];
    const copies = files.map((f, i) => {
      const name = `${i}-${path.basename(f)}`;
      const existed = isFile(f);
      if (existed) fs.copyFileSync(f, path.join(dir, name));
      return { file: f, backup: existed ? name : null };
    });
    let journal;
    try { journal = execute(actions); }
    catch (e) { fs.rmSync(dir, { recursive: true, force: true }); return { success: false, errors: ['exec'], message: e.message }; }

    const projectsTouched = [...new Set(actions
      .map(a => (a.at || a.file || '').match(/^(.*)\/\.claude\/(?:skills\/|settings\.local\.json$)/))
      .filter(Boolean).map(m => m[1]))];
    const manifest = {
      id, createdAt: new Date().toISOString(), undone: false,
      op: { kind: op.kind, name: op.name || op.id, target: op.target, projects: p.projects },
      copies, journal,
    };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    const lg = readJson(ledgerFile, {});
    lg.projects = [...new Set([...(lg.projects || []), ...projectsTouched])];
    writeJsonAtomic(ledgerFile, lg, 2);
    pruneBackups();
    return { success: true, id, count: actions.length };
  }

  // Backup più recente non ancora annullato.
  function last() {
    let dirs = [];
    try { dirs = fs.readdirSync(backupRoot).sort().reverse(); } catch { return null; }
    for (const d of dirs) {
      const m = readJson(path.join(backupRoot, d, 'manifest.json'), null);
      if (m && !m.undone) return { id: m.id, createdAt: m.createdAt, op: m.op, dir: path.join(backupRoot, d) };
      if (m && m.undone) continue;
    }
    return null;
  }

  function undo(id) {
    const l = last();
    if (!l || l.id !== id) return { success: false, errors: ['notLast'] };
    const mf = path.join(l.dir, 'manifest.json');
    const m = readJson(mf, null);
    if (!m) return { success: false, errors: ['noManifest'] };
    // Le inverse sono nell'ordine di esecuzione: si riapplicano al contrario.
    const inverses = m.journal.slice().reverse();
    try { execute(inverses); }
    catch (e) { return { success: false, errors: ['exec'], message: e.message }; }
    // File di impostazioni creati da noi e tornati vuoti: via.
    for (const a of inverses) {
      if (a.t === 'setting' && a.createdFile && isFile(a.file) && !Object.keys(readJson(a.file, {})).length) {
        try { fs.unlinkSync(a.file); } catch { /* ignora */ }
      }
    }
    m.undone = true;
    fs.writeFileSync(mf, JSON.stringify(m, null, 2), 'utf8');
    return { success: true, id };
  }

  return { inventory, preview, apply, last, undo, _plan: plan };
}

module.exports = { create, NAME_RE, PLUGIN_RE };
