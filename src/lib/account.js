'use strict';

const { execFile } = require('child_process');

// Esegue `claude auth status --json` e ritorna l'oggetto risultato.
// Schema osservato (Claude Code 2.1.x):
//   { loggedIn, authMethod, apiProvider, email, orgId, orgName, subscriptionType }
function getAuthStatus(claudeBin) {
  return new Promise((resolve) => {
    if (!claudeBin) {
      resolve({ ok: false, error: 'Binario claude non configurato' });
      return;
    }
    execFile(claudeBin, ['auth', 'status', '--json'], { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, error: (stderr || err.message).trim() });
        return;
      }
      try {
        const data = JSON.parse(stdout.trim());
        resolve({ ok: true, data });
      } catch (e) {
        resolve({ ok: false, error: 'Output non parsabile come JSON: ' + e.message });
      }
    });
  });
}

// `claude auth logout` — chiude la sessione subscription (claude.ai).
// Non rimuove l'API key da env var: quella resta dell'utente.
function logout(claudeBin) {
  return new Promise((resolve) => {
    if (!claudeBin) {
      resolve({ ok: false, error: 'Binario claude non configurato' });
      return;
    }
    execFile(claudeBin, ['auth', 'logout'], { timeout: 10000 }, (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, error: (stderr || err.message).trim() });
        return;
      }
      resolve({ ok: true, output: stdout.trim() });
    });
  });
}

module.exports = {
  getAuthStatus,
  logout,
};
