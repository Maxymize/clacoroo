'use strict';

/*
 * CLACOROO v1.0.103 — Mini-client MCP JSON-RPC
 *
 * Spawna un MCP server stdio, fa l'handshake JSON-RPC standard MCP
 * (initialize + initialized notification + tools/list) e ritorna la lista
 * tools. Server lifecycle: spawn → handshake → tools/list → SIGTERM.
 *
 * SCOPE LIMITATO:
 *   - **Supportato**: server stdio con command/args concreti (es. npx mcp-remote,
 *     sh -c "...node mcp-server.cjs", npx @upstash/context7-mcp). Funziona per
 *     plugin-managed (config letta da `.mcp.json` del plugin) e user-added
 *     (config letta da `claude mcp get <name>`).
 *   - **Non supportato**: HTTP/SSE (richiede OAuth, no accesso ai token Claude
 *     Code). Server claude.ai builtin (idem). Per questi il caller deve
 *     mostrare un messaggio chiaro.
 *
 * SICUREZZA:
 *   - Spawn con array `[command, ...args]` (no shell injection) tranne quando
 *     il command stesso è `sh -c '...'` (es. claude-mem). In questo caso
 *     siamo intrinsecamente in shell context — il command shell viene da
 *     config plugin, non da input utente.
 *   - Timeout 8s per evitare hang processi MCP malformati.
 *   - SIGTERM in cleanup, SIGKILL dopo 2s se non risponde.
 */

const { spawn } = require('child_process');

const JSONRPC_VERSION = '2.0';
const MCP_PROTOCOL_VERSION = '2025-06-18';
const HANDSHAKE_TIMEOUT_MS = 8000;
const LIST_TIMEOUT_MS = 5000;
const KILL_GRACE_MS = 2000;

// Costruisce il messaggio JSON-RPC + linebreak (newline-delimited stdio standard MCP)
function rpcMessage(id, method, params) {
  return JSON.stringify({ jsonrpc: JSONRPC_VERSION, id, method, params }) + '\n';
}
function rpcNotification(method, params) {
  return JSON.stringify({ jsonrpc: JSONRPC_VERSION, method, params }) + '\n';
}

/**
 * Spawna un server MCP stdio e ritorna la sua tools/list.
 *
 * @param {object} cfg - { command, args, env } config dello server stdio
 * @returns {Promise<{ok, tools?, error?}>} array di {name, description, inputSchema}
 */
function listToolsStdio(cfg) {
  return new Promise((resolve) => {
    if (!cfg || typeof cfg.command !== 'string') {
      return resolve({ ok: false, error: 'Config invalida (manca command).' });
    }

    const spawnEnv = { ...process.env, ...(cfg.env || {}) };
    const args = Array.isArray(cfg.args) ? cfg.args : [];

    let proc;
    try {
      proc = spawn(cfg.command, args, {
        env: spawnEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      return resolve({ ok: false, error: 'Spawn fallito: ' + e.message });
    }

    let stdoutBuf = '';
    let stderrBuf = '';
    let resolved = false;
    let phase = 'init';  // 'init' → 'list' → done
    const pending = new Map();  // id → resolver
    let nextId = 1;
    const stderrCap = 4 * 1024;  // 4KB max stderr per errore reporting (no leak)

    function finish(result) {
      if (resolved) return;
      resolved = true;
      clearTimeout(globalTimeout);
      try { proc.kill('SIGTERM'); } catch {}
      setTimeout(() => { try { proc.kill('SIGKILL'); } catch {} }, KILL_GRACE_MS);
      resolve(result);
    }

    const globalTimeout = setTimeout(() => {
      finish({ ok: false, error: 'Timeout ' + HANDSHAKE_TIMEOUT_MS + 'ms (server non risponde all\'handshake JSON-RPC). STDERR: ' + stderrBuf.slice(0, 500) });
    }, HANDSHAKE_TIMEOUT_MS);

    proc.on('error', (err) => {
      finish({ ok: false, error: 'Process error: ' + err.message });
    });
    proc.on('exit', (code) => {
      if (!resolved) {
        finish({ ok: false, error: 'Process exited prematurely (code ' + code + '). STDERR: ' + stderrBuf.slice(0, 500) });
      }
    });

    proc.stderr.on('data', (chunk) => {
      const s = chunk.toString('utf8');
      if (stderrBuf.length < stderrCap) stderrBuf += s.slice(0, stderrCap - stderrBuf.length);
    });

    proc.stdout.on('data', (chunk) => {
      stdoutBuf += chunk.toString('utf8');
      // Parse line-delimited JSON-RPC. Ogni linea è un msg JSON.
      let idx;
      while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
        const line = stdoutBuf.slice(0, idx).trim();
        stdoutBuf = stdoutBuf.slice(idx + 1);
        if (!line) continue;
        let msg;
        try { msg = JSON.parse(line); }
        catch { continue; }  // Skip righe non-JSON (logs server, ecc.)
        if (!msg || msg.jsonrpc !== JSONRPC_VERSION) continue;
        if (msg.id != null && pending.has(msg.id)) {
          const cb = pending.get(msg.id);
          pending.delete(msg.id);
          cb(msg);
        }
      }
    });

    function sendRequest(method, params) {
      const id = nextId++;
      const msg = rpcMessage(id, method, params);
      return new Promise((res) => {
        pending.set(id, res);
        try { proc.stdin.write(msg); } catch (e) {
          pending.delete(id);
          res({ error: { message: 'stdin write failed: ' + e.message } });
        }
      });
    }
    function sendNotification(method, params) {
      try { proc.stdin.write(rpcNotification(method, params)); } catch { /* ignore */ }
    }

    // Handshake: initialize → wait response → initialized notification → tools/list
    (async () => {
      const initRes = await sendRequest('initialize', {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        clientInfo: { name: 'CLACOROO', version: '1.0.103' },
      });
      if (resolved) return;
      if (initRes.error) {
        return finish({ ok: false, error: 'initialize error: ' + (initRes.error.message || JSON.stringify(initRes.error)) });
      }
      phase = 'list';
      // Notification "initialized" per dire al server che siamo pronti
      sendNotification('notifications/initialized', {});

      // Reset timeout per la richiesta tools/list
      clearTimeout(globalTimeout);
      const listTimeout = setTimeout(() => {
        finish({ ok: false, error: 'Timeout tools/list ' + LIST_TIMEOUT_MS + 'ms' });
      }, LIST_TIMEOUT_MS);

      const listRes = await sendRequest('tools/list', {});
      clearTimeout(listTimeout);
      if (resolved) return;
      if (listRes.error) {
        return finish({ ok: false, error: 'tools/list error: ' + (listRes.error.message || JSON.stringify(listRes.error)) });
      }
      const tools = (listRes.result && listRes.result.tools) || [];
      finish({ ok: true, tools });
    })().catch(e => finish({ ok: false, error: 'Handshake exception: ' + e.message }));
  });
}

module.exports = { listToolsStdio };
