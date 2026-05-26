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
const fs = require('fs');
const path = require('path');
const os = require('os');
const IS_WIN = process.platform === 'win32';

// v1.0.89 — Directory standard dove i tool manager installano i loro binari
// MA che spesso non sono nel PATH di un processo Electron lanciato dal Finder
// (eredita il PATH minimal di launchd) o subito dopo install (shell deve essere
// riavviata). Fallback fs.existsSync per ognuna se `which`/`where` falliscono.
const HOMEDIR = os.homedir();
const STANDARD_BIN_DIRS = IS_WIN
  ? [
      // Windows: pochi standard non-PATH. Aggiungi qui se serve.
      path.join(HOMEDIR, '.bun', 'bin'),
      path.join(HOMEDIR, '.deno', 'bin'),
      path.join(HOMEDIR, '.cargo', 'bin'),
    ]
  : [
      path.join(HOMEDIR, '.bun', 'bin'),
      path.join(HOMEDIR, '.deno', 'bin'),
      path.join(HOMEDIR, '.cargo', 'bin'),
      path.join(HOMEDIR, '.local', 'bin'),
      path.join(HOMEDIR, '.volta', 'bin'),
      path.join(HOMEDIR, '.pyenv', 'shims'),
      path.join(HOMEDIR, '.rbenv', 'shims'),
      path.join(HOMEDIR, '.poetry', 'bin'),
      '/opt/homebrew/bin',         // macOS Apple Silicon
      '/opt/homebrew/sbin',
      '/usr/local/bin',            // macOS Intel + Linux
      '/usr/local/sbin',
    ];

// Tool che diamo per scontati su sistemi di sviluppo — anche se rilevati
// nella whitelist, NON generano badge (es. `node` è quasi sempre presente).
// Solo per documentazione: la nuova strategia v1.0.88 cerca SOLO tool della
// whitelist KNOWN_TOOLS, quindi questa lista è informativa.
const UBIQUITOUS = new Set([
  'sh', 'bash', 'zsh', 'fish', 'pwsh', 'cmd', 'powershell',
  'node', 'npm', 'npx', 'yarn',
  'git', 'curl', 'wget',
]);

// v1.0.91 — INSTALL_COMMANDS: comandi di installazione UFFICIALI per piattaforma
// (darwin = macOS, linux, win32 = Windows). Comandi ricavati dalle docs ufficiali
// dei rispettivi tool. NULL significa "non installabile via one-liner sicuro su
// quella piattaforma" → solo URL informativa, niente bottone Installa.
//
// Sicurezza: prima di eseguire mostriamo sempre confirm dialog all'utente con il
// comando completo + NON premiamo Enter automatico (l'utente deve confermare
// manualmente premendo Invio nel terminale). Riusiamo il pattern Pack B v1.0.77
// pre-typing skill/agent.
const INSTALL_COMMANDS = {
  bun: {
    darwin: 'curl -fsSL https://bun.sh/install | bash',
    linux:  'curl -fsSL https://bun.sh/install | bash',
    win32:  'powershell -c "irm bun.sh/install.ps1 | iex"',
  },
  deno: {
    darwin: 'curl -fsSL https://deno.land/install.sh | sh',
    linux:  'curl -fsSL https://deno.land/install.sh | sh',
    win32:  'irm https://deno.land/install.ps1 | iex',
  },
  python3: {
    darwin: 'brew install python3',
    linux:  'sudo apt install -y python3',
    win32:  'winget install Python.Python.3',
  },
  python: {
    darwin: 'brew install python3',
    linux:  'sudo apt install -y python3',
    win32:  'winget install Python.Python.3',
  },
  uv: {
    darwin: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
    linux:  'curl -LsSf https://astral.sh/uv/install.sh | sh',
    win32:  'powershell -c "irm https://astral.sh/uv/install.ps1 | iex"',
  },
  wrangler: {
    darwin: 'npm install -g wrangler',
    linux:  'npm install -g wrangler',
    win32:  'npm install -g wrangler',
  },
  supabase: {
    darwin: 'brew install supabase/tap/supabase',
    linux:  null,  // su Linux la install è multi-step (apt repo aggiunto): meglio link
    win32:  'scoop install supabase',
  },
  vercel: {
    darwin: 'npm install -g vercel',
    linux:  'npm install -g vercel',
    win32:  'npm install -g vercel',
  },
  gcloud: { darwin: null, linux: null, win32: null },  // installer GUI multi-step
  aws: {
    darwin: 'brew install awscli',
    linux:  'sudo apt install -y awscli',
    win32:  'winget install Amazon.AWSCLI',
  },
  gh: {
    darwin: 'brew install gh',
    linux:  'sudo apt install -y gh',
    win32:  'winget install GitHub.cli',
  },
  rg: {
    darwin: 'brew install ripgrep',
    linux:  'sudo apt install -y ripgrep',
    win32:  'winget install BurntSushi.ripgrep.MSVC',
  },
  jq: {
    darwin: 'brew install jq',
    linux:  'sudo apt install -y jq',
    win32:  'winget install jqlang.jq',
  },
  fzf: {
    darwin: 'brew install fzf',
    linux:  'sudo apt install -y fzf',
    win32:  'winget install junegunn.fzf',
  },
  cargo: {
    darwin: 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    linux:  'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    win32:  'winget install Rustlang.Rustup',
  },
  rustc: {
    darwin: 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    linux:  'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh',
    win32:  'winget install Rustlang.Rustup',
  },
  go: {
    darwin: 'brew install go',
    linux:  'sudo apt install -y golang',
    win32:  'winget install GoLang.Go',
  },
  docker: { darwin: null, linux: null, win32: null },  // Docker Desktop installer GUI
  poetry: {
    darwin: 'curl -sSL https://install.python-poetry.org | python3 -',
    linux:  'curl -sSL https://install.python-poetry.org | python3 -',
    win32:  '(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -',
  },
  pipx: {
    darwin: 'brew install pipx',
    linux:  'python3 -m pip install --user pipx && python3 -m pipx ensurepath',
    win32:  'python -m pip install --user pipx',
  },
  pnpm: {
    darwin: 'npm install -g pnpm',
    linux:  'npm install -g pnpm',
    win32:  'npm install -g pnpm',
  },
  ruby: {
    darwin: 'brew install ruby',
    linux:  'sudo apt install -y ruby-full',
    win32:  'winget install RubyInstallerTeam.Ruby.3.3',
  },
};

// INSTALL_HINTS testuali per tooltip umano (più informativo del solo comando).
// Generati automaticamente da INSTALL_COMMANDS + URL ufficiale di reference.
const INSTALL_DOCS = {
  bun:      'https://bun.sh',
  deno:     'https://deno.com/runtime',
  python3:  'https://www.python.org/downloads/',
  python:   'https://www.python.org/downloads/',
  uv:       'https://docs.astral.sh/uv/',
  wrangler: 'https://developers.cloudflare.com/workers/wrangler/',
  supabase: 'https://supabase.com/docs/guides/cli',
  vercel:   'https://vercel.com/docs/cli',
  gcloud:   'https://cloud.google.com/sdk/docs/install',
  aws:      'https://aws.amazon.com/cli/',
  gh:       'https://cli.github.com',
  rg:       'https://github.com/BurntSushi/ripgrep',
  jq:       'https://jqlang.github.io/jq/',
  fzf:      'https://github.com/junegunn/fzf',
  cargo:    'https://rustup.rs',
  rustc:    'https://rustup.rs',
  go:       'https://go.dev/dl/',
  docker:   'https://docs.docker.com/desktop/',
  poetry:   'https://python-poetry.org/docs/',
  pipx:     'https://pipx.pypa.io',
  pnpm:     'https://pnpm.io/installation',
  ruby:     'https://www.ruby-lang.org/en/downloads/',
};

// Helper: ritorna il comando install per la piattaforma corrente, o null se
// non c'è (tool che richiede installer GUI multi-step).
function getInstallCommand(tool, platform) {
  const entry = INSTALL_COMMANDS[tool];
  if (!entry) return null;
  return entry[platform] || null;
}

// Tooltip testuale "human-readable" multi-piattaforma + link docs ufficiali.
// Sostituisce il vecchio INSTALL_HINTS basato su stringa monolitica.
const INSTALL_HINTS = Object.fromEntries(
  Object.keys(INSTALL_COMMANDS).map(tool => {
    const cmds = INSTALL_COMMANDS[tool];
    const parts = [];
    if (cmds.darwin) parts.push('macOS: ' + cmds.darwin);
    if (cmds.linux)  parts.push('Linux: ' + cmds.linux);
    if (cmds.win32)  parts.push('Win: '   + cmds.win32);
    if (INSTALL_DOCS[tool]) parts.push('Docs: ' + INSTALL_DOCS[tool]);
    return [tool, parts.join('\n')];
  })
);

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
 * Verifica se un tool è installato. Strategia a 3 livelli (cross-platform):
 *
 *   1. **`which`/`where`** sul PATH del processo Electron (veloce, 95% dei casi).
 *   2. **`$SHELL -lc 'which <tool>'`** (Unix) per leggere il PATH della shell
 *      login dell'utente, dove sono stati eseguiti gli `export PATH=...` del
 *      `.zshrc`/`.bashrc`. Necessario perché Electron lanciato dal Finder NON
 *      eredita il PATH della shell interattiva (eredita quello di launchd,
 *      molto minimal) → tool installati post-install (es. Bun appena aggiunto)
 *      restano "invisibili" senza questa fallback.
 *   3. **`fs.existsSync`** su STANDARD_BIN_DIRS (`~/.bun/bin/bun`, `~/.deno/bin/deno`,
 *      `/opt/homebrew/bin/<tool>`, …). Garantisce detection anche se il tool
 *      è installato in path standard ma fuori PATH del processo.
 *
 * Sicurezza: execFile con args array, mai stringa interpolata (CLAUDE.md rules).
 */
const _availabilityCache = new Map(); // tool → { installed, checkedAt, path }

// v1.0.89 — Valida che `s` assomigli a un absolute path eseguibile. Necessario
// perché alcuni hook di login shell (es. claude-mem SessionStart che cerca Bun)
// stampano output spurio tipo "bun not found" su stdout intercettato da `which`.
// Senza questa validazione lo prenderemmo come "path trovato" → falso positivo.
function looksLikePath(s) {
  if (!s) return false;
  if (IS_WIN) return /^[A-Za-z]:[/\\]/.test(s) || s.startsWith('\\\\');
  return s.startsWith('/');
}

function whichSimple(tool) {
  return new Promise((resolve) => {
    const cmd = IS_WIN ? 'where' : 'which';
    execFile(cmd, [tool], { timeout: 3000 }, (err, stdout) => {
      if (err) return resolve(null);
      const p = (stdout || '').split('\n')[0].trim();
      resolve(looksLikePath(p) ? p : null);
    });
  });
}

function whichViaLoginShell(tool) {
  if (IS_WIN) return Promise.resolve(null);  // Su Windows i `.profile` di shell login non esistono nel senso Unix
  return new Promise((resolve) => {
    const shell = process.env.SHELL || '/bin/zsh';
    // -l = login shell (legge .zprofile/.bash_profile/.zshrc dell'utente).
    // command -v è builtin POSIX più affidabile di `which`: ritorna SOLO l'absolute
    // path su stdout, niente altro. `2>/dev/null` silenzia STDERR di eventuali
    // hook startup. `|| echo ""` forza exit code 0 per non far errare execFile.
    // `> /dev/null 2>&1` su `:` per drenare stdin/stderr noise da hook precedenti.
    execFile(shell, ['-lc', ': 2>/dev/null; command -v "$1" 2>/dev/null || echo ""', '--', tool], { timeout: 5000 }, (err, stdout) => {
      if (err) return resolve(null);
      // L'output può contenere righe spurie da hook di shell startup. Cerchiamo
      // la PRIMA riga che assomiglia a un absolute path (filtra "bun not found", ecc.)
      const lines = (stdout || '').split('\n').map(l => l.trim()).filter(Boolean);
      const found = lines.find(looksLikePath);
      resolve(found || null);
    });
  });
}

function fsFallback(tool) {
  for (const dir of STANDARD_BIN_DIRS) {
    const full = path.join(dir, IS_WIN ? tool + '.exe' : tool);
    try {
      if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
    } catch { /* skip */ }
  }
  return null;
}

// v1.0.90 — TTL 60s sul cache delle availability. Senza questo, se l'utente
// installa/disinstalla un tool con CLACOROO aperto il cache resta stantio
// fino al restart dell'app (popolato 1 volta al boot). 60s è compromesso fra
// freshness e cost (re-spawn di which/shell -lc per ogni tool è ~1-2s).
// Il bottone "↻ Aggiorna" della topbar invoca clearCache() per forzare
// refresh immediato senza aspettare scadenza naturale.
const AVAIL_TTL_MS = 60 * 1000;

async function checkAvailabilityOne(tool) {
  const cached = _availabilityCache.get(tool);
  if (cached && (Date.now() - cached.checkedAt) < AVAIL_TTL_MS) return cached;

  // Tentativo 1: which/where standard
  let foundPath = await whichSimple(tool);

  // Tentativo 2: which via login shell (legge .zshrc/.bashrc utente)
  if (!foundPath) foundPath = await whichViaLoginShell(tool);

  // Tentativo 3: fs.existsSync su path standard noti
  if (!foundPath) foundPath = fsFallback(tool);

  const result = {
    installed: !!foundPath,
    path: foundPath,
    checkedAt: Date.now(),
  };
  _availabilityCache.set(tool, result);
  return result;
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
      installHint:    INSTALL_HINTS[t] || '',
      // v1.0.91 — comando di install per la piattaforma corrente (null se
      // tool che richiede installer GUI multi-step, es. Docker/gcloud)
      installCommand: getInstallCommand(t, process.platform),
      docsUrl:        INSTALL_DOCS[t] || '',
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
  getInstallCommand,
  UBIQUITOUS,
  INSTALL_HINTS,
  INSTALL_COMMANDS,
  INSTALL_DOCS,
};
