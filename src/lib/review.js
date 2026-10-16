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

// v1.2.25 — Richiesta di recensione. Lo stato vive in ~/.claude-control-room/
// state.json (fuori dall'app), quindi sopravvive agli aggiornamenti: chi ha già
// recensito non vede più la finestra nemmeno con le versioni successive. Si
// perde solo cancellando quella cartella o cambiando computer.
//   - compare dopo 7 giorni dal primo avvio E almeno 5 avvii
//   - "Non ora": ricompare dopo 15 giorni, e così via
//   - recensione inviata: mai più
// L'invio riusa l'endpoint del sito (vedi feedback.js), senza modifiche lato sito.

const STATE = require('./state');
const FEEDBACK = require('./feedback');

const DAY = 24 * 3600 * 1000;
const MIN_AGE_DAYS = 7;
const MIN_LAUNCHES = 5;
const SNOOZE_DAYS = 15;
const NAME_MAX = 40;
const TEXT_MAX = 2000;

let counted = false;

function read() {
  const r = STATE.readState().review;
  return r && typeof r === 'object' ? r : {};
}
function write(patch) { STATE.writeState({ review: { ...read(), ...patch } }); }

// Da chiamare una volta per avvio: conta l'avvio e dice se mostrare la finestra.
function check(now = Date.now()) {
  const r = read();
  const patch = {};
  if (!r.firstSeen) patch.firstSeen = now;
  if (!counted) { counted = true; patch.launches = (r.launches || 0) + 1; }
  if (Object.keys(patch).length) write(patch);
  const cur = { ...r, ...patch };
  if (cur.done) return { show: false };
  const old = now - cur.firstSeen >= MIN_AGE_DAYS * DAY;
  const used = (cur.launches || 0) >= MIN_LAUNCHES;
  const due = !cur.nextAt || now >= cur.nextAt;
  return { show: old && used && due, starClicked: !!cur.starClicked };
}

function dismiss(now = Date.now()) {
  write({ nextAt: now + SNOOZE_DAYS * DAY });
  return { ok: true };
}

function starClicked() {
  write({ starClicked: true });
  return { ok: true };
}

async function submit({ stars, name, text, lang, version, platform } = {}) {
  const n = Math.round(Number(stars));
  if (!(n >= 1 && n <= 5)) return { ok: false, error: 'noStars' };
  const who = String(name || '').trim().slice(0, NAME_MAX) || 'Anonymous';
  const body = String(text || '').trim().slice(0, TEXT_MAX);
  const ver = String(version || '?').slice(0, 20);
  const res = await FEEDBACK.post({
    type: 'other',
    name: who,
    email: FEEDBACK.NO_REPLY,
    message: `RECENSIONE CLACOROO: ${n}/5 stelle\n\n${body || '(nessun testo)'}\n\n--\nCLACOROO ${ver} · ${String(platform || '?').slice(0, 20)} · ${String(lang || '?').slice(0, 10)}`,
  });
  if (res.ok) write({ done: true, doneAt: Date.now() });
  return res;
}

module.exports = { check, dismiss, starClicked, submit };
