/*
 * CLACOROO — Claude Code Control Room
 * Copyright (C) 2026 MAXYMIZE BUSINESS (Maximilian Giurastante <info@maxymizebusiness.com>)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * lib/term.js — Wrapper xterm.js per il drawer terminale (Pack B v1.0.67).
 *
 * Espone window.TermDrawer con:
 *   createTab(opts)   → istanzia xterm + spawn pty, ritorna { id, term, fit, container }
 *   activateTab(tab)  → muove la container dentro #terminal-drawer-body e fa fit + focus
 *   destroyTab(tab)   → kill pty + dispose xterm
 *   fitAll()          → ricalcola dimensioni di tutte le tab visibili
 *
 * Le istanze xterm vivono in container DOM detached quando la tab NON è attiva
 * (così l'output continua ad arrivare ma è invisibile), e vengono riattaccate
 * quando l'utente torna sulla tab. Niente re-render — preserviamo lo scrollback.
 */
'use strict';

(function () {
  // Palette CLACOROO per xterm. Allineata a style.css (bg drawer + cream text).
  const CLACOROO_THEME = {
    background:        '#0d0c0b',
    foreground:        '#faf9f5',
    cursor:            '#d97757',
    cursorAccent:      '#0d0c0b',
    selectionBackground:'rgba(217,119,87,0.30)',
    black:             '#1e1c1a',
    red:               '#ef4444',
    green:             '#788c5d',
    yellow:            '#f59e0b',
    blue:              '#6a9bcc',
    magenta:           '#b87fae',
    cyan:              '#7fb3b3',
    white:             '#e8e6dc',
    brightBlack:       '#b0aea5',
    brightRed:         '#fc6868',
    brightGreen:       '#94ab6f',
    brightYellow:      '#fbb959',
    brightBlue:        '#8bb4d8',
    brightMagenta:     '#cfa0c4',
    brightCyan:        '#9dcaca',
    brightWhite:       '#faf9f5',
  };

  function createTab({ id, ptyId, cwd, title, shell, parent }) {
    const Terminal     = window.Terminal;
    const FitAddon     = window.FitAddon?.FitAddon;
    const WebLinksAddon= window.WebLinksAddon?.WebLinksAddon;
    if (!Terminal || !FitAddon) {
      throw new Error('xterm.js non caricato (controlla index.html script tags)');
    }

    const term = new Terminal({
      theme: CLACOROO_THEME,
      fontFamily: 'Menlo, Monaco, "Cascadia Mono", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowProposedApi: false,
      convertEol: false,
      windowsMode: navigator.userAgent.includes('Windows'),
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    if (WebLinksAddon) {
      term.loadAddon(new WebLinksAddon((_e, url) => {
        if (window.claudeAPI?.openExternal) window.claudeAPI.openExternal(url);
      }));
    }

    const container = document.createElement('div');
    container.className = 'terminal-tab-pane';
    container.dataset.tabId = id;
    if (parent) parent.appendChild(container);

    term.open(container);

    // Wire input renderer→pty
    const disp = term.onData((data) => {
      window.claudeAPI.pty.write(ptyId, data);
    });

    // Resize observer per refit quando il drawer cambia altezza
    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
        const { cols, rows } = term;
        if (cols > 0 && rows > 0) {
          window.claudeAPI.pty.resize(ptyId, cols, rows);
        }
      } catch {}
    });
    ro.observe(container);

    return {
      id, ptyId, cwd, title, shell, container, term, fit, disp, ro,
      detach() {
        if (container.parentElement) container.parentElement.removeChild(container);
      },
      attach(parentEl) {
        if (parentEl) parentEl.appendChild(container);
        // Forza un refit subito + uno frame dopo (xterm calcola misure async)
        try { fit.fit(); } catch {}
        requestAnimationFrame(() => {
          try {
            fit.fit();
            const { cols, rows } = term;
            if (cols > 0 && rows > 0) window.claudeAPI.pty.resize(ptyId, cols, rows);
          } catch {}
        });
        term.focus();
      },
      dispose() {
        try { ro.disconnect(); } catch {}
        try { disp.dispose(); } catch {}
        try { term.dispose(); } catch {}
        if (container.parentElement) container.parentElement.removeChild(container);
      },
      write(chunk) {
        term.write(chunk);
      },
    };
  }

  window.TermDrawer = { createTab };
})();
