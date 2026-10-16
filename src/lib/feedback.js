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

// v1.2.24 — Suggerimenti dalla dashboard. L'app non conosce l'indirizzo di
// destinazione: invia a clacoroo.app/api/feedback, che inoltra la mail lato
// server. Il payload rispetta la validazione già in produzione sul sito
// (tipo, nome, email valida, messaggio 10-5000 caratteri), quindi il sito
// non richiede modifiche.

const https = require('node:https');

const ENDPOINT = new URL('https://clacoroo.app/api/feedback');
const HTTP_TIMEOUT = 10000;
const MIN_LEN = 10;
const MAX_LEN = 4000;
// L'endpoint è pubblico e senza chiave: limitiamo l'invio dal client.
const MIN_GAP_MS = 20 * 1000;
const MAX_PER_HOUR = 5;
const NO_REPLY = 'noreply@clacoroo.app';

const sent = [];

function post(payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const req = https.request(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'CLACOROO-feedback',
      },
      timeout: HTTP_TIMEOUT,
    }, res => {
      res.resume();
      res.on('end', () => resolve(res.statusCode >= 200 && res.statusCode < 300
        ? { ok: true }
        : { ok: false, error: 'delivery' }));
    });
    req.on('error', () => resolve({ ok: false, error: 'network' }));
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

async function send({ message, lang, version, platform } = {}) {
  const text = typeof message === 'string' ? message.trim() : '';
  if (text.length < MIN_LEN) return { ok: false, error: 'tooShort' };
  if (text.length > MAX_LEN) return { ok: false, error: 'tooLong' };

  const now = Date.now();
  while (sent.length && now - sent[0] > 3600 * 1000) sent.shift();
  if (sent.length >= MAX_PER_HOUR || (sent.length && now - sent[sent.length - 1] < MIN_GAP_MS)) {
    return { ok: false, error: 'rateLimit' };
  }

  const ver = String(version || '?').slice(0, 20);
  const res = await post({
    type: 'other',
    name: `CLACOROO app ${ver}`,
    email: NO_REPLY,
    message: `${text}\n\n--\nCLACOROO ${ver} · ${String(platform || '?').slice(0, 20)} · ${String(lang || '?').slice(0, 10)}`,
  });
  if (res.ok) sent.push(now);
  return res;
}

module.exports = { send, post, NO_REPLY, MIN_LEN, MAX_LEN };
