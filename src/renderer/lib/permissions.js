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

// Validazione delle regole di permesso di Claude Code (formato Tool o
// Tool(specifier)). Logica PURA: nessun DOM, nessun IO → testabile in
// isolamento. Caricata nel renderer via <script> (CSP + nodeIntegration:false
// vietano require nel renderer) e attaccata a window.PermissionsValidator.
//
// Le chiavi di warning/error ritornate sono CHIAVI i18n (il chiamante le
// risolve con t()), così questo modulo resta privo di stringhe localizzate.

// Tool noti di Claude Code (al 2026-06). Un tool fuori da questa lista NON è
// un errore: viene accettato con warning, così non restiamo indietro quando
// Anthropic ne aggiunge di nuovi.
const KNOWN_TOOLS = [
  'Bash', 'Read', 'Edit', 'Write', 'WebFetch', 'WebSearch',
  'Glob', 'Grep', 'NotebookEdit', 'Task',
];

// Pattern che, in una regola ALLOW, indicano accesso ampio/distruttivo →
// warning non bloccante. Non si applicano a deny/ask (lì sono desiderabili).
const RISKY_SUBSTRINGS = ['rm ', 'rm -', 'sudo ', 'curl ', 'wget ', '> ', '&&', '| sh', '| bash'];

// Verifica che le parentesi tonde siano bilanciate e ben formate:
// o niente parentesi, oppure UNA coppia (...) con contenuto non vuoto a fine
// stringa. Ritorna { tool, specifier|null } se ok, altrimenti null.
function parseRule(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  const open = s.indexOf('(');
  if (open === -1) {
    // tool nudo: solo identificatore (lettere/numeri/_, e mcp__...)
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(s) ? { tool: s, specifier: null } : null;
  }
  // deve chiudere esattamente all'ultimo char e non avere altre parentesi
  if (s[s.length - 1] !== ')') return null;
  const tool = s.slice(0, open);
  const specifier = s.slice(open + 1, s.length - 1);
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tool)) return null;   // nome tool valido
  if (specifier.length === 0) return null;                    // Bash() invalido
  if (specifier.indexOf('(') !== -1 || specifier.indexOf(')') !== -1) return null; // parentesi annidate/extra
  return { tool, specifier };
}

// Ritorna { valid, error?, warning? } — error/warning sono CHIAVI i18n.
// listKey: 'allow' | 'deny' | 'ask' (i warning di rischio valgono solo per allow).
function validateRule(raw, listKey) {
  const parsed = parseRule(raw);
  if (!parsed) return { valid: false, error: 'config.permErrFormat' };

  let warning;
  const isMcp = parsed.tool.startsWith('mcp__');
  if (!isMcp && KNOWN_TOOLS.indexOf(parsed.tool) === -1) {
    warning = 'config.permWarnUnknownTool';
  }
  if (listKey === 'allow') {
    // Bash nudo o Bash(*) → accesso shell ampio
    if (parsed.tool === 'Bash' && (parsed.specifier === null || parsed.specifier === '*')) {
      warning = 'config.permWarnBroad';
    } else if (parsed.specifier && RISKY_SUBSTRINGS.some((p) => parsed.specifier.includes(p))) {
      warning = 'config.permWarnDestructive';
    }
  }
  return warning ? { valid: true, warning } : { valid: true };
}

const api = { validateRule, parseRule, KNOWN_TOOLS, RISKY_SUBSTRINGS };

// Doppio export: window per il renderer (script tag), module.exports per i test Node.
if (typeof window !== 'undefined') window.PermissionsValidator = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
