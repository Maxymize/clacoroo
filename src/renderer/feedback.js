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

// v1.2.24 — Nuvoletta suggerimenti in basso a destra della Dashboard.
// Il nodo è costruito una volta per lingua e solo spostato/nascosto agli altri
// render, così bozza e focus sopravvivono ai refresh automatici della Dashboard.
// Usa le globali di app.js (el, icon, t, state, activeLang), risolte a runtime.

const FEEDBACK_MIN = 10;
const FEEDBACK_MAX = 4000;
let feedbackNode = null;
let feedbackLang = null;
let feedbackDrawerObserver = null;

function syncFeedbackWidget() {
  if (feedbackNode && feedbackLang !== activeLang) {
    feedbackNode.remove();
    feedbackNode = null;
  }
  if (!feedbackNode) {
    feedbackNode = buildFeedbackWidget();
    feedbackLang = activeLang;
    document.body.appendChild(feedbackNode);
    trackDrawerHeight();
  }
  feedbackNode.hidden = state.section !== 'dashboard';
}

// Il terminale integrato si apre in fondo all'area principale: la nuvoletta
// resta sopra di lui invece di coprirlo.
function trackDrawerHeight() {
  const drawer = document.getElementById('terminal-drawer');
  if (!drawer || feedbackDrawerObserver) return;
  const apply = () => document.documentElement.style.setProperty('--fb-bottom', (drawer.offsetHeight + 20) + 'px');
  feedbackDrawerObserver = new ResizeObserver(apply);
  feedbackDrawerObserver.observe(drawer);
  apply();
}

function buildFeedbackWidget() {
  const root = el('div', 'fb-root');
  const panel = el('div', 'fb-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('feedback.title'));

  const head = el('div', 'fb-head');
  head.appendChild(el('span', 'fb-title', t('feedback.title')));
  const closeBtn = el('button', 'fb-close');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', t('feedback.close'));
  closeBtn.appendChild(icon('x'));
  head.appendChild(closeBtn);

  const form = el('div', 'fb-form');
  const area = el('textarea', 'fb-text');
  area.placeholder = t('feedback.placeholder');
  area.maxLength = FEEDBACK_MAX;
  area.rows = 5;
  const error = el('div', 'fb-error');
  error.hidden = true;
  const foot = el('div', 'fb-foot');
  foot.appendChild(el('span', 'fb-hint', t('feedback.hint')));
  const sendBtn = el('button', 'btn btn-sm btn-primary fb-send');
  sendBtn.type = 'button';
  sendBtn.appendChild(icon('send'));
  const sendLabel = el('span', '', t('feedback.send'));
  sendBtn.appendChild(sendLabel);
  foot.appendChild(sendBtn);
  form.append(area, error, foot);

  const thanks = el('div', 'fb-thanks');
  thanks.hidden = true;
  thanks.appendChild(el('div', 'fb-thanks-title', t('feedback.thanksTitle')));
  thanks.appendChild(el('div', 'fb-thanks-body', t('feedback.thanksBody')));

  panel.append(head, form, thanks);

  const bubble = el('button', 'fb-bubble');
  bubble.type = 'button';
  bubble.title = t('feedback.tooltip');
  bubble.setAttribute('aria-label', t('feedback.tooltip'));
  bubble.appendChild(icon('message-circle'));

  function setOpen(open) {
    panel.hidden = !open;
    bubble.setAttribute('aria-expanded', String(open));
    if (open) {
      // dopo il ringraziamento, la riapertura riparte da un modulo pulito
      if (!thanks.hidden) { thanks.hidden = true; form.hidden = false; }
      area.focus();
    }
  }

  function showError(key) {
    error.textContent = t('feedback.err.' + key);
    error.hidden = false;
  }

  async function submit() {
    error.hidden = true;
    const text = area.value.trim();
    if (text.length < FEEDBACK_MIN) return showError('tooShort');
    sendBtn.disabled = true;
    area.disabled = true;
    sendLabel.textContent = t('feedback.sending');
    let res;
    try {
      res = await window.claudeAPI.sendFeedback({ message: text, lang: activeLang });
    } catch {
      res = { ok: false, error: 'network' };
    }
    sendBtn.disabled = false;
    area.disabled = false;
    sendLabel.textContent = t('feedback.send');
    if (!res || !res.ok) return showError((res && res.error) || 'network');
    area.value = '';
    form.hidden = true;
    thanks.hidden = false;
  }

  bubble.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => { setOpen(false); bubble.focus(); });
  sendBtn.addEventListener('click', submit);
  area.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit(); }
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); bubble.focus(); }
  });

  root.append(panel, bubble);
  return root;
}
