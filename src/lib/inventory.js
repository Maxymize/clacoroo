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

// v1.2.14 — Inventario di skill, agent e comandi da TUTTE le fonti che Claude
// Code carica, non solo dai plugin:
//   - plugin installati (cartella indicata da installPath, non l'ultima in
//     ordine alfabetico nella cache)
//   - skill/agent/comandi personali in ~/.claude/{skills,agents,commands}
//   - skill/agent/comandi di progetto in <progetto>/.claude/{skills,agents,commands}
// I link simbolici che puntano a un percorso inesistente vengono restituiti a
// parte (`broken`): Claude Code li ignora, ma l'utente deve poterli vedere.

const fs   = require('fs');
const path = require('path');
const { checkMarkdownHealth } = require('./markdown');

function isDir(p)  { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function isFile(p) { try { return fs.statSync(p).isFile(); }      catch { return false; } }
function listDir(p) { try { return fs.readdirSync(p); } catch { return []; } }

// Target del link se `p` è un symlink rotto, altrimenti null.
function brokenLinkTarget(p) {
  try { if (!fs.lstatSync(p).isSymbolicLink()) return null; } catch { return null; }
  if (fs.existsSync(p)) return null;
  try { return fs.readlinkSync(p); } catch { return ''; }
}

// Data di aggiunta (birthtime) per l'ordinamento "recenti" in Dashboard.
function addedAt(p) {
  try {
    const st = fs.statSync(p);
    return (st.birthtime || st.ctime || st.mtime).toISOString();
  } catch { return ''; }
}

const isAgentMd = f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md';

// Skill: sottocartelle con SKILL.md. Una cartella che è essa stessa una skill
// (plugin.json con `skills: ["./skills/foo"]`) vale come singola skill.
function scanSkillDir(dir, out, broken) {
  if (isFile(path.join(dir, 'SKILL.md'))) {
    out.push({ name: path.basename(dir), dir, file: path.join(dir, 'SKILL.md') });
    return;
  }
  for (const entry of listDir(dir)) {
    if (entry.startsWith('.')) continue;
    const p = path.join(dir, entry);
    const target = brokenLinkTarget(p);
    if (target !== null) { broken.push({ kind: 'skill', name: entry, path: p, target }); continue; }
    const md = path.join(p, 'SKILL.md');
    if (isDir(p) && isFile(md)) out.push({ name: entry, dir: p, file: md });
  }
}

// Agent: file .md piatti nella cartella (come fa Claude Code).
function scanAgentDir(dir, out, broken) {
  for (const entry of listDir(dir)) {
    if (!isAgentMd(entry)) continue;
    const p = path.join(dir, entry);
    const target = brokenLinkTarget(p);
    if (target !== null) { broken.push({ kind: 'agent', name: entry.replace(/\.md$/, ''), path: p, target }); continue; }
    if (isFile(p)) out.push({ name: entry.replace(/\.md$/, ''), dir, file: p });
  }
}

// Comandi: file .md, anche in sottocartelle (Claude Code le usa come namespace).
function scanCommandDir(dir, out, broken, depth = 0) {
  for (const entry of listDir(dir)) {
    if (entry.startsWith('.')) continue;
    const p = path.join(dir, entry);
    const target = brokenLinkTarget(p);
    if (target !== null) { broken.push({ kind: 'command', name: entry.replace(/\.md$/, ''), path: p, target }); continue; }
    if (isDir(p) && depth < 3) scanCommandDir(p, out, broken, depth + 1);
    else if (isAgentMd(entry) && isFile(p)) out.push({ name: entry.replace(/\.md$/, ''), dir, file: p });
  }
}

// Percorsi dichiarati in plugin.json (`skills`/`agents`/`commands`): stringa o
// array, relativi alla root del plugin. Si aggiungono a quelli di default.
function declaredPaths(root, meta, key) {
  const raw = meta && meta[key];
  const list = Array.isArray(raw) ? raw : (typeof raw === 'string' ? [raw] : []);
  const out = [path.join(root, key)];
  for (const rel of list) {
    if (typeof rel !== 'string') continue;
    const abs = path.resolve(root, rel);
    // niente percorsi fuori dalla cartella del plugin
    if (abs !== root && !abs.startsWith(root + path.sep)) continue;
    if (!out.includes(abs)) out.push(abs);
  }
  return out;
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(i => (seen.has(i.file) ? false : (seen.add(i.file), true)));
}

// Skill, agent e comandi di una cartella di plugin.
function scanPluginItems(root, meta) {
  const skills = [], agents = [], commands = [], broken = [];
  for (const d of declaredPaths(root, meta, 'skills'))   if (isDir(d)) scanSkillDir(d, skills, broken);
  for (const d of declaredPaths(root, meta, 'agents')) {
    if (isDir(d)) scanAgentDir(d, agents, broken);
    else if (isAgentMd(d) && isFile(d)) agents.push({ name: path.basename(d, '.md'), dir: path.dirname(d), file: d });
  }
  for (const d of declaredPaths(root, meta, 'commands')) {
    if (isDir(d)) scanCommandDir(d, commands, broken);
    else if (isAgentMd(d) && isFile(d)) commands.push({ name: path.basename(d, '.md'), dir: path.dirname(d), file: d });
  }
  return { skills: dedupe(skills), agents: dedupe(agents), commands: dedupe(commands), broken };
}

// Skill/agent/comandi "sciolti" di una cartella .claude (personale o di progetto).
function scanStandalone(claudeDir) {
  const skills = [], agents = [], commands = [], broken = [];
  scanSkillDir(path.join(claudeDir, 'skills'), skills, broken);
  scanAgentDir(path.join(claudeDir, 'agents'), agents, broken);
  scanCommandDir(path.join(claudeDir, 'commands'), commands, broken);
  // Percorso da spostare nel Cestino per eliminare una voce (la cartella della
  // skill, il file .md di agent/comando, il link rotto): solo se è figlia diretta
  // di skills/agents/commands. Mai la cartella contenitore, nemmeno se contiene
  // essa stessa un SKILL.md; null = non eliminabile da CLACOROO. Unica regola per
  // voci e link rotti: la UI mostra il cestino solo dove main lo accetterà.
  const FOLDER = { skill: 'skills', agent: 'agents', command: 'commands' };
  const removable = (kind, p) => (path.dirname(p) === path.join(claudeDir, FOLDER[kind]) ? p : null);
  const withMeta = (i, kind) => {
    const own = kind === 'skill' ? i.dir : i.file;
    return {
      name: i.name,
      file: i.file,
      addedAt: addedAt(own),
      health: kind === 'command' ? null : checkMarkdownHealth(i.file),
      removePath: removable(kind, own),
    };
  };
  return {
    skills:   skills.map(i => withMeta(i, 'skill')),
    agents:   agents.map(i => withMeta(i, 'agent')),
    commands: commands.map(i => withMeta(i, 'command')),
    broken: broken.map(b => ({ ...b, removePath: removable(b.kind, b.path) })),
  };
}

// Cartella di installazione di un plugin: installPath dell'installazione con
// scope `user` (o la prima), se esiste; altrimenti null.
function installPathFor(installedRaw, fullId) {
  const entries = installedRaw && installedRaw.plugins && !Array.isArray(installedRaw.plugins)
    ? installedRaw.plugins[fullId]
    : null;
  if (!Array.isArray(entries) || !entries.length) return null;
  const entry = entries.find(e => e && e.scope === 'user') || entries[0];
  return entry && typeof entry.installPath === 'string' && isDir(entry.installPath)
    ? entry.installPath
    : null;
}

// Tutti i file che finiscono nell'indice di Claude Code (frontmatter di skill,
// agent e comandi) per la stima del contesto: plugin attivi + personali.
function contextFiles(pluginDetails, blockedSet, standalone) {
  const skills = [], agents = [];
  for (const [fullId, d] of Object.entries(pluginDetails || {})) {
    if (blockedSet && blockedSet.has(fullId)) continue;
    skills.push(...Object.values(d.skillFiles || {}), ...Object.values(d.commandFiles || {}));
    agents.push(...Object.values(d.agentFiles || {}));
  }
  if (standalone) {
    skills.push(...standalone.skills.map(s => s.file), ...standalone.commands.map(c => c.file));
    agents.push(...standalone.agents.map(a => a.file));
  }
  return { skills, agents };
}

module.exports = {
  scanPluginItems,
  scanStandalone,
  installPathFor,
  contextFiles,
};
