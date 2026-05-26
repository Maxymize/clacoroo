'use strict';

/*
 * CLACOROO v1.0.87 — Hook dependency detector
 *
 * Analizza i `command` degli hook event dei plugin (vedi readHookEvents) e
 * stima quali strumenti CLI esterni il hook richiede per girare. Per ognuno
 * verifica con `which`/`where` se è installato, restituendo una mappa
 * { toolName → { installed: bool, installHint: string } } cachata in memoria
 * per evitare spawn ripetuti.
 *
 * Use case originale: il plugin `claude-mem` richiede `bun` ma se non è
 * installato Claude Code stampa "SessionStart:startup hook error · Bun not
 * found" ad ogni boot. CLACOROO ora marca quei hook con un badge ⚠ chiaro
 * + suggerimento di installazione, prima che l'utente apra il terminale.
 */

const { execFile } = require('child_process');
const os = require('os');
const IS_WIN = process.platform === 'win32';

// Tool che diamo per scontati su sistemi di sviluppo — niente badge per loro
// (rumoreggerebbero le card). Se davvero non sono installati il hook fallirà
// con un errore esplicito comunque.
const UBIQUITOUS = new Set([
  'sh', 'bash', 'zsh', 'fish', 'pwsh', 'cmd', 'powershell',
  'node', 'npm', 'npx', 'yarn',
  'git', 'curl', 'wget',
  'cat', 'echo', 'printf', 'ls', 'cd', 'cp', 'mv', 'rm', 'mkdir', 'touch',
  'export', 'source', 'sed', 'awk', 'grep', 'tr', 'head', 'tail', 'sort',
  'uniq', 'cut', 'tee', 'find', 'xargs', 'which', 'where', 'pwd', 'cygpath',
  'env', 'true', 'false', 'test', '[', '[[', 'set', 'unset', 'eval', 'exec',
  'read', 'declare', 'local', 'return', 'shift', 'trap', 'wait',
]);

// Mappa tool → suggerimento di installazione. Aggiungi qui i tool noti per
// avere hint utili nella tooltip del badge. Per i tool non in mappa il badge
// dice solo "Non installato" senza hint specifico.
const INSTALL_HINTS = {
  bun:        'curl -fsSL https://bun.sh/install | bash',
  deno:       'curl -fsSL https://deno.land/install.sh | sh',
  python3:    'brew install python3   # macOS · apt install python3 · winget install python',
  python:     'brew install python3   # macOS · apt install python3 · winget install python',
  uv:         'curl -LsSf https://astral.sh/uv/install.sh | sh',
  wrangler:   'npm install -g wrangler',
  supabase:   'brew install supabase/tap/supabase   # macOS · scoop install supabase',
  vercel:     'npm install -g vercel',
  gcloud:     'https://cloud.google.com/sdk/docs/install',
  aws:        'brew install awscli   # macOS · pip install awscli · scoop install aws',
  gh:         'brew install gh   # macOS · winget install GitHub.cli · apt install gh',
  rg:         'brew install ripgrep   # macOS · cargo install ripgrep',
  jq:         'brew install jq   # macOS · apt install jq · scoop install jq',
  fzf:        'brew install fzf   # macOS · apt install fzf',
  cargo:      'curl https://sh.rustup.rs -sSf | sh   # installa rustup',
  rustc:      'curl https://sh.rustup.rs -sSf | sh   # installa rustup',
  go:         'brew install go   # macOS · winget install GoLang.Go',
  docker:     'https://docs.docker.com/desktop/',
  poetry:     'curl -sSL https://install.python-poetry.org | python3 -',
  pipx:       'brew install pipx   # macOS · python3 -m pip install pipx',
  pnpm:       'npm install -g pnpm',
  ruby:       'brew install ruby   # macOS · apt install ruby-full',
};

// Pattern speciali: alcuni hook chiamano `node` con uno script che internamente
// richiede un altro tool (es. `bun-runner.js` cerca bun nel PATH). Senza questa
// euristica non vedremmo la dipendenza scansionando solo il command shell.
const SCRIPT_NAME_TO_TOOL = [
  { pattern: /bun-runner/i,    tool: 'bun' },
  { pattern: /deno-runner/i,   tool: 'deno' },
  { pattern: /python-runner/i, tool: 'python3' },
];

/**
 * Estrae i tool CLI usati in un comando shell. Strategia conservativa:
 * - tokenizza su whitespace + pipe + redirect
 * - per ogni token che assomiglia a un nome di comando (no path, no flag,
 *   no var-expansion), aggiunge alla lista candidati
 * - filtra UBIQUITOUS (per non rumoreggiare le card con bash/node/git)
 * - applica pattern speciali su script Node che internamente chiamano tool
 *   esterni (es. bun-runner → bun)
 *
 * Ritorna un Set di tool name unique.
 */
function detectDepsInCommand(cmd) {
  const deps = new Set();
  if (typeof cmd !== 'string' || !cmd) return deps;

  // Tokenizzazione semplice: split su whitespace + alcuni separatori shell.
  // Non parsiamo realmente la shell (sarebbe overkill), euristica sufficiente
  // per il 95% dei casi reali nei plugin Claude Code.
  const tokens = cmd.split(/[\s|;&()`<>]+/).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i].replace(/^['"]+|['"]+$/g, ''); // strip quotes
    if (!raw) continue;

    // Skip path assoluti, var expansion, flag, redirect
    if (raw.startsWith('-') || raw.startsWith('$') || raw.startsWith('{')) continue;
    if (raw === '||' || raw === '&&' || raw === '>>' || raw === '<<') continue;

    // Per "bash -c '...'" o "sh -lc '...'" il vero comando di interesse è
    // l'argomento successivo: skip i wrapper.
    if (UBIQUITOUS.has(raw) && i + 1 < tokens.length) {
      // ancora analizzeremo l'arg successivo nel loop. solo skip self.
    }

    // Pattern script (es. bun-runner.js dice "richiede bun")
    for (const { pattern, tool } of SCRIPT_NAME_TO_TOOL) {
      if (pattern.test(raw)) deps.add(tool);
    }

    // Tool name vero e proprio: deve essere [a-z][a-z0-9_-]*, eventualmente
    // con suffisso ".js"/".sh" rimosso. Skip path-like (`/`).
    if (/[\/\\]/.test(raw)) continue;
    const name = raw.replace(/\.(js|sh|py|rb|cjs|mjs)$/, '').toLowerCase();
    if (!/^[a-z][a-z0-9_-]*$/.test(name)) continue;
    if (UBIQUITOUS.has(name)) continue;

    // Skip nomi che sono chiaramente fragment di codice (parole con underscore
    // tipiche da variabili shell, es. _R, _Q, _C)
    if (/^_/.test(name)) continue;

    deps.add(name);
  }

  return deps;
}

/**
 * Verifica se un tool è installato cercandolo nel PATH.
 * Usa `which` su Unix, `where` su Win. Cross-platform, niente shell injection
 * (execFile con args array, mai stringa interpolata — vedi CLAUDE.md rules).
 */
const _availabilityCache = new Map(); // tool → { installed, checkedAt, path }

function checkAvailabilityOne(tool) {
  return new Promise((resolve) => {
    const cached = _availabilityCache.get(tool);
    if (cached) return resolve(cached);

    const cmd = IS_WIN ? 'where' : 'which';
    execFile(cmd, [tool], { timeout: 3000 }, (err, stdout) => {
      const result = err
        ? { installed: false, path: null, checkedAt: Date.now() }
        : { installed: true, path: (stdout || '').split('\n')[0].trim(), checkedAt: Date.now() };
      _availabilityCache.set(tool, result);
      resolve(result);
    });
  });
}

/**
 * Batch check di una lista di tool. Ritorna mappa tool → { installed, path, installHint }.
 * Risultati cachati per session: se l'utente installa Bun e riavvia CLACOROO,
 * la mappa si aggiorna. Per refresh in-session esiste `clearCache()` esposto.
 */
async function checkAvailability(tools) {
  const out = {};
  const list = Array.from(tools instanceof Set ? tools : new Set(tools || []));
  await Promise.all(list.map(async t => {
    const r = await checkAvailabilityOne(t);
    out[t] = {
      installed: r.installed,
      path: r.path,
      installHint: INSTALL_HINTS[t] || '',
    };
  }));
  return out;
}

function clearCache() {
  _availabilityCache.clear();
}

/**
 * Helper di alto livello: prende un array di hook event (vedi readHookEvents)
 * e ritorna l'union di tutti i tool dependency detectati. Usato dal main per
 * fare un solo batch check al boot/refresh.
 */
function collectAllDeps(hookEvents) {
  const all = new Set();
  if (!Array.isArray(hookEvents)) return all;
  for (const ev of hookEvents) {
    for (const m of (ev.matchers || [])) {
      for (const h of (m.handlers || [])) {
        const deps = detectDepsInCommand(h.command);
        for (const d of deps) all.add(d);
      }
    }
  }
  return all;
}

module.exports = {
  detectDepsInCommand,
  checkAvailability,
  checkAvailabilityOne,
  clearCache,
  collectAllDeps,
  UBIQUITOUS,
  INSTALL_HINTS,
};
