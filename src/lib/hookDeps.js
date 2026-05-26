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

// Tool che diamo per scontati su sistemi di sviluppo — anche se rilevati
// nella whitelist, NON generano badge (es. `node` è quasi sempre presente).
// Solo per documentazione: la nuova strategia v1.0.88 cerca SOLO tool della
// whitelist KNOWN_TOOLS, quindi questa lista è informativa.
const UBIQUITOUS = new Set([
  'sh', 'bash', 'zsh', 'fish', 'pwsh', 'cmd', 'powershell',
  'node', 'npm', 'npx', 'yarn',
  'git', 'curl', 'wget',
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

// v1.0.88 — Whitelist tool noti. Solo questi vengono cercati nei command
// degli hook. Strategia conservativa: meglio un falso negativo (mancato avviso
// su tool esotico) che 15 falsi positivi (la versione v1.0.87 trattava `break`,
// `do`, `done`, `claude-code`, `session-start`, ecc. come tool installabili —
// pessima esperienza utente). Per aggiungere un tool nuovo basta inserirlo
// in INSTALL_HINTS sotto: viene automaticamente cercato.
function getKnownTools() {
  return new Set(Object.keys(INSTALL_HINTS));
}

// Escape per uso dentro RegExp (gestisce trattini in nomi come `claude-mem`).
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cerca i tool CLI esterni richiesti dal command. v1.0.88 usa WHITELIST
 * esplicita (KNOWN_TOOLS = Object.keys(INSTALL_HINTS)) cercati con regex
 * word-boundary. Match solo se il tool appare come parola distinta nel
 * command (es. `python3 script.py` → matcha; `polypython3` → no match).
 *
 * Più i pattern speciali SCRIPT_NAME_TO_TOOL per smascherare dipendenze
 * nascoste (es. `node bun-runner.js` rivela un requisito di Bun anche se
 * nel command non appare la parola `bun` come comando diretto).
 */
function detectDepsInCommand(cmd) {
  const deps = new Set();
  if (typeof cmd !== 'string' || !cmd) return deps;

  const knownTools = getKnownTools();

  // Cerca ogni tool della whitelist come parola intera. I delimitatori
  // accettati attorno al tool sono inizio/fine stringa o caratteri shell
  // di separazione (spazio, pipe, semicolon, ampersand, backtick, parentesi,
  // redirect). Questo evita di confondere `bun` con `bundler` o `python3`
  // con `python3-config`.
  for (const tool of knownTools) {
    const re = new RegExp('(^|[\\s;&|`(<>])' + escapeRegex(tool) + '($|[\\s;&|`)<>])', 'i');
    if (re.test(cmd)) deps.add(tool);
  }

  // Pattern speciali: script che internamente richiedono un tool esterno
  for (const { pattern, tool } of SCRIPT_NAME_TO_TOOL) {
    if (pattern.test(cmd)) deps.add(tool);
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
