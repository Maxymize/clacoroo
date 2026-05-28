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

/*
 * Tour onboarding interattivo "coachmark": overlay scuro + spotlight
 * sull'elemento reale della UI + bollicina con mascotte CLACOROO.
 * Naviga automaticamente fra le sezioni; salta gli step il cui elemento
 * target non è presente nel DOM (skip-if-missing).
 *
 * Espone window.startTour(). Dipende da window.t (i18n),
 * window.switchToSection, window.claudeAPI.setState.
 */
(function () {
  // Ogni step: selettore dell'elemento da evidenziare, sezione in cui navigare
  // (null = elemento sempre visibile), chiave i18n (→ tour.<key>Title / Body).
  const TOUR_STEPS = [
    { selector: '.sidebar-nav',                       section: null,        key: 'sidebar' },
    { selector: '.dashboard-overview',                section: 'dashboard', key: 'dashboard' },
    { selector: '.nav-item[data-section="plugins"]',  section: 'plugins',   key: 'plugins' },
    { selector: '.nav-item[data-section="skills"]',   section: 'skills',    key: 'skills' },
    { selector: '.nav-item[data-section="agents"]',   section: 'agents',    key: 'agents' },
    { selector: '.nav-item[data-section="mcp"]',      section: 'mcp',       key: 'mcp' },
    { selector: '.nav-item[data-section="hooks"]',    section: 'hooks',     key: 'hooks' },
    { selector: '.nav-item[data-section="stats"]',    section: 'stats',     key: 'stats' },
    { selector: '#topbar-actions',                    section: null,        key: 'terminal' },
    { selector: '[data-tour="account"]',              section: 'settings',  key: 'settingsAccount' },
    { selector: '[data-tour="apikey"]',               section: 'settings',  key: 'settingsApiKey' },
    { selector: '[data-tour="language"]',             section: 'settings',  key: 'language' },
  ];

  const SPOT_PAD = 6;       // padding px attorno all'elemento evidenziato
  const BUBBLE_GAP = 14;    // distanza px fra spotlight e bollicina
  const BUBBLE_W = 300;     // larghezza fissa bollicina (deve combaciare col CSS)
  const VIEWPORT_MARGIN = 12;
  const WAIT_INTERVAL = 30; // polling ms per attendere l'elemento dopo navigazione
  const WAIT_TIMEOUT = 500; // timeout massimo ms

  function t(key, vars) {
    return (typeof window.t === 'function') ? window.t(key, vars) : key;
  }

  // Attende che querySelector(selector) ritorni un elemento, con timeout.
  function waitForElement(selector) {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) { resolve(existing); return; }
      const start = Date.now();
      const timer = setInterval(() => {
        const elFound = document.querySelector(selector);
        if (elFound) { clearInterval(timer); resolve(elFound); return; }
        if (Date.now() - start >= WAIT_TIMEOUT) { clearInterval(timer); resolve(null); }
      }, WAIT_INTERVAL);
    });
  }

  function startTour() {
    if (document.querySelector('.tour-overlay')) return; // guard doppia apertura

    let idx = 0;

    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';

    const spotlight = document.createElement('div');
    spotlight.className = 'tour-spotlight';

    const bubble = document.createElement('div');
    bubble.className = 'tour-bubble';
    bubble.setAttribute('role', 'dialog');
    bubble.setAttribute('aria-modal', 'true');
    bubble.setAttribute('aria-labelledby', 'tour-bubble-title');

    const arrow = document.createElement('div');
    arrow.className = 'tour-arrow';

    const header = document.createElement('h4');
    header.className = 'tour-bubble-title';
    header.id = 'tour-bubble-title';
    const mascot = document.createElement('img');
    mascot.className = 'tour-bubble-mascot';
    mascot.src = 'clacoroo.svg';
    mascot.alt = '';
    mascot.setAttribute('aria-hidden', 'true');
    const titleText = document.createElement('span');
    header.appendChild(mascot);
    header.appendChild(titleText);

    const body = document.createElement('p');
    body.className = 'tour-bubble-body';

    const counter = document.createElement('div');
    counter.className = 'tour-bubble-counter';

    const actions = document.createElement('div');
    actions.className = 'tour-bubble-actions';
    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn btn-sm btn-ghost';
    skipBtn.textContent = t('tour.skip');
    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn-sm btn-ghost';
    backBtn.textContent = t('tour.back');
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-sm btn-primary';
    actions.appendChild(skipBtn);
    actions.appendChild(backBtn);
    actions.appendChild(nextBtn);

    bubble.appendChild(header);
    bubble.appendChild(body);
    bubble.appendChild(counter);
    bubble.appendChild(actions);

    overlay.appendChild(spotlight);
    overlay.appendChild(arrow);
    overlay.appendChild(bubble);
    document.body.appendChild(overlay);

    let lastRect = null;

    function close() {
      if (window.claudeAPI && typeof window.claudeAPI.setState === 'function') {
        window.claudeAPI.setState({ onboardingShown: true });
      }
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      overlay.remove();
    }
    overlay._close = close;

    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') nextBtn.click();
      else if (e.key === 'ArrowLeft') backBtn.click();
    }
    function onResize() {
      if (lastRect) {
        const target = document.querySelector(TOUR_STEPS[idx].selector);
        if (target) place(target.getBoundingClientRect());
      }
    }

    // Posiziona spotlight + bollicina + freccia rispetto al rect del target.
    function place(rect) {
      lastRect = rect;
      // spotlight
      spotlight.style.left = (rect.left - SPOT_PAD) + 'px';
      spotlight.style.top = (rect.top - SPOT_PAD) + 'px';
      spotlight.style.width = (rect.width + SPOT_PAD * 2) + 'px';
      spotlight.style.height = (rect.height + SPOT_PAD * 2) + 'px';

      // bollicina: prova a destra, poi sinistra, poi sotto, poi sopra
      const bw = BUBBLE_W;
      const bh = bubble.offsetHeight || 160;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left, top, side;

      if (rect.right + BUBBLE_GAP + bw + VIEWPORT_MARGIN <= vw) {
        left = rect.right + BUBBLE_GAP; side = 'left';
        top = rect.top + rect.height / 2 - bh / 2;
      } else if (rect.left - BUBBLE_GAP - bw - VIEWPORT_MARGIN >= 0) {
        left = rect.left - BUBBLE_GAP - bw; side = 'right';
        top = rect.top + rect.height / 2 - bh / 2;
      } else if (rect.bottom + BUBBLE_GAP + bh + VIEWPORT_MARGIN <= vh) {
        top = rect.bottom + BUBBLE_GAP; side = 'top';
        left = rect.left + rect.width / 2 - bw / 2;
      } else {
        top = rect.top - BUBBLE_GAP - bh; side = 'bottom';
        left = rect.left + rect.width / 2 - bw / 2;
      }

      // clamp ai bordi del viewport
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - bw - VIEWPORT_MARGIN));
      top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - bh - VIEWPORT_MARGIN));
      bubble.style.left = left + 'px';
      bubble.style.top = top + 'px';

      // freccia: punta dal bordo della bollicina verso lo spotlight
      arrow.className = 'tour-arrow tour-arrow-' + side;
      if (side === 'left') {
        arrow.style.left = (rect.right + SPOT_PAD) + 'px';
        arrow.style.top = (rect.top + rect.height / 2 - 7) + 'px';
      } else if (side === 'right') {
        arrow.style.left = (rect.left - SPOT_PAD - 12) + 'px';
        arrow.style.top = (rect.top + rect.height / 2 - 7) + 'px';
      } else if (side === 'top') {
        arrow.style.left = (rect.left + rect.width / 2 - 7) + 'px';
        arrow.style.top = (rect.bottom + SPOT_PAD) + 'px';
      } else {
        arrow.style.left = (rect.left + rect.width / 2 - 7) + 'px';
        arrow.style.top = (rect.top - SPOT_PAD - 12) + 'px';
      }
    }

    async function renderStep(direction) {
      const dir = direction || 1;
      // termina se fuori range
      if (idx < 0) { idx = 0; }
      if (idx >= TOUR_STEPS.length) { close(); return; }

      const step = TOUR_STEPS[idx];

      // naviga alla sezione richiesta (se serve)
      if (step.section && typeof window.switchToSection === 'function') {
        window.switchToSection(step.section);
      }

      const target = await waitForElement(step.selector);
      if (!target) {
        // skip-if-missing: prosegui nella stessa direzione
        idx += dir;
        if (idx < 0 || idx >= TOUR_STEPS.length) { close(); return; }
        renderStep(dir);
        return;
      }

      // testi
      titleText.textContent = t('tour.' + step.key + 'Title');
      body.textContent = t('tour.' + step.key + 'Body');

      // contatore + label bottoni
      counter.textContent = (idx + 1) + ' / ' + TOUR_STEPS.length;
      backBtn.disabled = idx === 0;
      nextBtn.textContent = (idx === TOUR_STEPS.length - 1) ? t('tour.start') : t('tour.next');

      // porta l'elemento al centro del viewport, poi riposiziona spotlight +
      // bollicina sul rect AGGIORNATO (lo scroll è asincrono: ricalcolo dopo).
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
      requestAnimationFrame(() => {
        place(target.getBoundingClientRect());
        nextBtn.focus();
        // secondo riposizionamento per assestamenti di scroll tardivi
        setTimeout(() => {
          const el2 = document.querySelector(step.selector);
          if (el2) place(el2.getBoundingClientRect());
        }, 120);
      });
    }

    skipBtn.addEventListener('click', close);
    backBtn.addEventListener('click', () => {
      if (idx > 0) { idx -= 1; renderStep(-1); }
    });
    nextBtn.addEventListener('click', () => {
      if (idx < TOUR_STEPS.length - 1) { idx += 1; renderStep(1); }
      else close();
    });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    renderStep(1);
  }

  window.startTour = startTour;
})();
