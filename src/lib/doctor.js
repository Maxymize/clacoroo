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

// v1.2.18 — Lettura dell'output di `claude doctor` (sola diagnostica, niente
// correzioni: quelle le fa /doctor dentro una sessione). Il comando non ha un
// output JSON ed esce sempre con 0, quindi si interpreta il testo, che è fatto
// di blocchi separati da righe vuote:
//
//   Claude Code doctor                    ← titolo
//   Running: native (2.1.287)             ← blocco chiave: valore
//   Invalid settings                      ← titolo di sezione
//   - /path/settings.json: Invalid JSON   ← voce
//     Suggested fix: Fix the JSON …       ← correzione della voce sopra
//   5 warnings found
//   - … / Fix: Run claude install …
//   For a full setup checkup …            ← chiusura
//
// La lettura è tollerante: un blocco che non si riconosce diventa una sezione
// generica, e il testo grezzo resta sempre disponibile nella UI.

const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g;
const KEY_VALUE = /^[A-Z][^:\n]{0,60}:\s+\S/;

// Percorso di file all'inizio di una voce ("/x/settings.json: …" o "… › campo").
const FILE_AT_START = /^((?:\/|~|[A-Za-z]:\\).+?\.(?:json|jsonc|md))(?=\s*(?:›|:))/;
// "Run claude install to …" / "Run: claude update" → comando da lanciare.
const CLAUDE_CMD = /\bRun:?\s+(claude\s+(?:install|update)\b(?:\s+(?!to\b)[\w.-]+)*)/i;
// "Run: <comando shell> then …" → comando da copiare (mai eseguito da CLACOROO).
const SHELL_CMD = /\bRun:\s*(.+?)(?:\s+then\b|\s+—\s|\s+-\s+if\b|$)/;

function sectionKind(title, items) {
  if (/invalid settings/i.test(title)) return 'error';
  if (/\bwarnings?\s+found\b/i.test(title)) return 'warning';
  if (/\bno\b.*\bissues?\s+found\b/i.test(title)) return 'ok';
  if (/remote control/i.test(title)) return 'info';
  return items.length ? 'warning' : 'info';
}

// Azione proposta per una voce, dedotta dal testo della correzione.
//   terminal → comando `claude …` da eseguire nel terminale integrato
//   copy     → comando di shell da copiare (PATH, keychain, …)
//   open     → file da aprire e correggere a mano
//   none     → solo informazione
function actionFor(item) {
  const fix = item.fix || '';
  const c = fix.match(CLAUDE_CMD);
  if (c) return { type: 'terminal', command: c[1].trim() };
  const s = fix.match(SHELL_CMD);
  if (s) return { type: 'copy', command: s[1].trim() };
  if (item.file) return { type: 'open', file: item.file };
  return { type: 'none' };
}

function parseDoctorOutput(raw) {
  const text = String(raw || '').replace(ANSI, '').replace(/\r\n/g, '\n');
  const info = {};
  const sections = [];
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines.length) continue;
    const first = lines[0].trim();
    if (/^claude code doctor$/i.test(first)) continue;
    if (/^for a full .*\/doctor/i.test(first)) continue;
    if (lines.every(l => KEY_VALUE.test(l.trim()))) {
      lines.forEach(l => {
        const i = l.indexOf(':');
        info[l.slice(0, i).trim()] = l.slice(i + 1).trim();
      });
      continue;
    }
    const section = { title: first.startsWith('- ') ? '' : first, description: [], items: [] };
    for (const line of first.startsWith('- ') ? lines : lines.slice(1)) {
      const fixMatch = line.match(/^\s+(?:Suggested fix|Fix):\s*(.*)$/i);
      if (fixMatch && section.items.length) {
        section.items[section.items.length - 1].fix = fixMatch[1].trim();
      } else if (/^\s*-\s+/.test(line)) {
        const itemText = line.replace(/^\s*-\s+/, '').trim();
        const fm = itemText.match(FILE_AT_START);
        section.items.push({ text: itemText, fix: '', file: fm ? fm[1] : null });
      } else {
        section.description.push(line.trim());
      }
    }
    section.kind = sectionKind(section.title, section.items);
    section.items.forEach(it => { it.action = actionFor(it); });
    sections.push(section);
  }
  return { info, sections };
}

// Unisce le letture di più cartelle (home + progetti tracciati): stesse
// sezioni per titolo, voci senza doppioni (i problemi di installazione si
// ripetono identici in ogni cartella).
function mergeDoctorRuns(parsedList) {
  const info = (parsedList[0] && parsedList[0].info) || {};
  const byTitle = new Map();
  for (const p of parsedList) {
    for (const s of p.sections) {
      const cur = byTitle.get(s.title);
      if (!cur) { byTitle.set(s.title, { ...s, items: [...s.items] }); continue; }
      for (const it of s.items) if (!cur.items.some(x => x.text === it.text)) cur.items.push(it);
    }
  }
  return { info, sections: [...byTitle.values()] };
}

module.exports = { parseDoctorOutput, mergeDoctorRuns };
