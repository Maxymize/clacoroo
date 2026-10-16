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

// v1.2.25 — Finestra "Com'è andata?": stelle, nome facoltativo, testo, e il
// pulsante che apre il repo su GitHub. Quando mostrarla lo decide il main
// (lib/review.js): qui c'è solo l'interfaccia. Usa le globali di app.js.

const REVIEW_REPO_URL = 'https://github.com/Maxymize/clacoroo';
const REVIEW_DELAY_MS = 12000;

function scheduleReviewPrompt() {
  setTimeout(async () => {
    let r;
    try { r = await window.claudeAPI.reviewCheck(); } catch { return; }
    if (!r || !r.show) return;
    // non sopra un'altra finestra aperta: al prossimo avvio si riprova
    if (document.querySelector('.md-overlay')) return;
    showReviewModal(!!r.starClicked);
  }, REVIEW_DELAY_MS);
}

function showReviewModal(starAlready) {
  let stars = 0;
  let starDone = starAlready;
  let finished = false;

  const overlay = el('div', 'md-overlay rv-overlay');
  const modal = el('div', 'md-modal rv-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', t('review.title'));

  const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
  const close = () => { document.removeEventListener('keydown', onKey); overlay.remove(); };
  const dismiss = () => {
    if (!finished) window.claudeAPI.reviewDismiss();
    close();
  };

  const closeBtn = el('button', 'fb-close rv-x');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', t('review.close'));
  closeBtn.appendChild(icon('x'));
  closeBtn.addEventListener('click', dismiss);

  const body = el('div', 'rv-body');
  modal.append(closeBtn, body);

  function starButton() {
    const b = el('button', 'btn btn-sm btn-ghost rv-star-btn');
    b.type = 'button';
    b.appendChild(icon('star'));
    b.appendChild(el('span', '', t('review.starGithub')));
    const thanks = el('div', 'rv-star-thanks', t('review.starThanks'));
    thanks.hidden = !starDone;
    b.addEventListener('click', () => {
      window.claudeAPI.openExternal(REVIEW_REPO_URL);
      window.claudeAPI.reviewStarClicked();
      starDone = true;
      thanks.hidden = false;
    });
    const wrap = el('div', 'rv-star');
    wrap.append(b, thanks);
    return wrap;
  }

  function renderForm() {
    body.textContent = '';
    body.appendChild(el('h2', 'rv-title', t('review.title')));
    body.appendChild(el('p', 'rv-sub', t('review.subtitle')));

    const row = el('div', 'rv-stars');
    row.setAttribute('role', 'radiogroup');
    row.setAttribute('aria-label', t('review.starsLabel'));
    const btns = [];
    const paint = (n) => btns.forEach((b, i) => b.classList.toggle('on', i < n));
    for (let i = 1; i <= 5; i++) {
      const b = el('button', 'rv-star-pick');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', t('review.starN', { n: i }));
      b.appendChild(icon('star'));
      b.addEventListener('mouseenter', () => paint(i));
      b.addEventListener('focus', () => paint(i));
      b.addEventListener('click', () => { stars = i; paint(i); err.hidden = true; });
      btns.push(b);
      row.appendChild(b);
    }
    row.addEventListener('mouseleave', () => paint(stars));

    const name = el('input', 'rv-input');
    name.type = 'text';
    name.maxLength = 40;
    name.placeholder = t('review.namePlaceholder');
    const text = el('textarea', 'fb-text rv-text');
    text.rows = 4;
    text.maxLength = 2000;
    text.placeholder = t('review.textPlaceholder');
    const err = el('div', 'fb-error');
    err.hidden = true;

    const send = el('button', 'btn btn-primary');
    send.type = 'button';
    send.textContent = t('review.send');
    const later = el('button', 'btn btn-ghost');
    later.type = 'button';
    later.textContent = t('review.later');
    later.addEventListener('click', dismiss);
    const actions = el('div', 'rv-actions');
    actions.append(later, send);

    send.addEventListener('click', async () => {
      if (!stars) { err.textContent = t('review.err.noStars'); err.hidden = false; return; }
      err.hidden = true;
      send.disabled = true;
      send.textContent = t('review.sending');
      let res;
      try {
        res = await window.claudeAPI.reviewSubmit({ stars, name: name.value, text: text.value, lang: activeLang });
      } catch { res = { ok: false, error: 'network' }; }
      send.disabled = false;
      send.textContent = t('review.send');
      if (!res || !res.ok) {
        err.textContent = t('review.err.' + ((res && res.error) === 'noStars' ? 'noStars' : 'network'));
        err.hidden = false;
        return;
      }
      finished = true;
      renderThanks();
    });

    body.append(row, name, text, err, actions, el('div', 'rv-sep'), starButton());
  }

  function renderThanks() {
    body.textContent = '';
    body.appendChild(el('h2', 'rv-title rv-thanks-title', t('review.thanksTitle')));
    body.appendChild(el('p', 'rv-sub', t('review.thanksBody')));
    if (!starDone) body.appendChild(starButton());
    const ok = el('button', 'btn btn-primary rv-done');
    ok.type = 'button';
    ok.textContent = t('review.done');
    ok.addEventListener('click', close);
    body.appendChild(ok);
  }

  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) dismiss(); });
  document.addEventListener('keydown', onKey);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  renderForm();
}
