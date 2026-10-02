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

const os   = require('os');
const path = require('path');

// v1.2.18 — Lettura dell'output di `claude doctor` (sola diagnostica, niente
// correzioni: quelle le fa /doctor dentro una sessione). Il comando non ha un
// output JSON ed esce sempre con 0, quindi si interpreta il testo, fatto di
// blocchi separati da righe vuote:
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
// 'unknown', le righe di prosa si scartano e il testo grezzo resta sempre
// disponibile nella UI.

const ANSI = /\x1b\[[0-9;?]*[A-Za-z]/g;
const KEY_VALUE = /^[A-Z][^:\n]{0,60}:\s+\S/;

// Percorso di un file di configurazione all'inizio di una voce ("/x/settings.json: …" o "… › campo").
const FILE_AT_START = /^((?:\/|~|[A-Za-z]:\\).+?\.(?:json|jsonc|md))(?=\s*[›:])/;
// Comando che CLACOROO può eseguire nel terminale: SOLO `claude install|update` con al
// massimo un argomento di forma nota. Il testo che segue ("then restart…", "to repair…")
// non entra mai nel comando: tutto il resto al massimo si copia.
const CLAUDE_CMD = /\bRun:?\s+(claude\s+(?:install|update)(?:\s+(?:stable|latest|\d[\w.]*|--[\w-]+))?)(?=\s|$|[.,;:])/i;
// "Run: <comando shell> then …" → comando da copiare (mai eseguito da CLACOROO).
const SHELL_CMD = /\bRun:\s*(.+?)(?:\s+then\b|\s+—\s|\s+-\s+if\b|$)/;

// error = impostazioni non valide · warning = "N warnings found" · info = sezioni
// senza problemi (Remote Control, nessun problema) · unknown = blocco con voci che
// non si riconosce: la UI lo mostra col suo titolo, senza fingere di capirlo.
function sectionKind(title, items) {
  if (/invalid settings/i.test(title)) return 'error';
  if (/\bwarnings?\s+found\b/i.test(title)) return 'warning';
  if (/remote control/i.test(title)) return 'info';
  return items.length ? 'unknown' : 'info';
}

function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

// Azione proposta per una voce, dedotta dal testo della voce e della correzione.
//   terminal → comando `claude install|update` da eseguire nel terminale integrato
//   copy     → comando di shell da copiare (PATH, Portachiavi, …)
//   open     → file di configurazione da aprire e correggere a mano
//   none     → solo informazione
function actionFor(text, fix) {
  const c = fix.match(CLAUDE_CMD);
  if (c) return { type: 'terminal', command: c[1].trim() };
  const s = fix.match(SHELL_CMD);
  if (s) return { type: 'copy', command: s[1].trim() };
  const f = text.match(FILE_AT_START);
  if (f) return { type: 'open', file: expandHome(f[1]) };
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
    if (/^claude code doctor$/i.test(first) || /^for a full .*\/doctor/i.test(first)) continue;
    if (lines.every(l => KEY_VALUE.test(l.trim()))) {
      lines.forEach(l => {
        const i = l.indexOf(':');
        info[l.slice(0, i).trim()] = l.slice(i + 1).trim();
      });
      continue;
    }
    // Titolo separato dalle sue voci da una riga vuota: le voci vanno alla
    // sezione precedente rimasta vuota, non a una sezione senza titolo.
    const untitled = first.startsWith('- ');
    const prev = sections[sections.length - 1];
    const section = untitled && prev && !prev.items.length ? prev : { title: untitled ? '' : first, items: [] };
    for (const line of untitled ? lines : lines.slice(1)) {
      const fixMatch = line.match(/^\s+(?:Suggested fix|Fix):\s*(.*)$/i);
      const itemMatch = line.match(/^\s*-\s+(.*)$/);
      if (fixMatch) {
        const last = section.items[section.items.length - 1];
        if (last) last.fix = fixMatch[1].trim();
      } else if (itemMatch) {
        section.items.push({ text: itemMatch[1].trim(), fix: '' });
      }
      // altre righe: prosa, scartata (resta in "Output completo")
    }
    if (section !== prev) sections.push(section);
  }
  sections.forEach(s => {
    s.kind = sectionKind(s.title, s.items);
    s.items.forEach(it => { it.action = actionFor(it.text, it.fix); });
  });
  return { info, sections };
}

// Unisce le letture di più cartelle (home + progetti tracciati): stessa sezione
// = stesso tipo e stesso titolo senza i numeri ("2 warnings found" e "3 warnings
// found" sono la stessa sezione), voci senza doppioni (i problemi di
// installazione si ripetono identici in ogni cartella).
function mergeDoctorRuns(parsedList) {
  const byKey = new Map();
  for (const { sections } of parsedList) {
    for (const s of sections) {
      const key = s.kind + ':' + s.title.replace(/\d+/g, '#');
      const cur = byKey.get(key) || { ...s, items: [] };
      byKey.set(key, cur);
      for (const it of s.items) if (!cur.items.some(x => x.text === it.text)) cur.items.push(it);
    }
  }
  return { info: (parsedList[0] && parsedList[0].info) || {}, sections: [...byKey.values()] };
}

module.exports = { parseDoctorOutput, mergeDoctorRuns };
