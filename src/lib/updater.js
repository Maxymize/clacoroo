'use strict';

const https = require('node:https');

// v1.1.20 — usiamo /releases (lista) invece di /releases/latest: quest'ultimo
// IGNORA le pre-release, ma il nostro CI pubblica ogni tag come pre-release →
// l'app non vedeva mai i nuovi rilasci. Dalla lista scegliamo la versione più
// alta (per semver) fra le release non-draft, pre-release incluse.
const RELEASES_API = 'https://api.github.com/repos/Maxymize/clacoroo/releases?per_page=30';
const HTTP_TIMEOUT = 8000;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'CLACOROO-updater', 'Accept': 'application/vnd.github+json' },
      timeout: HTTP_TIMEOUT,
    }, res => {
      if (res.statusCode === 404) return resolve(null); // repo privato o nessuna release
      if (res.statusCode === 403) return reject(new Error('rate-limit')); // API rate limit
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
  });
}

// semver 'x.y.z' compare — '1.0.10' > '1.0.9' correctly (numeric per-segment)
function parseVersion(v) {
  return String(v).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
}

function isNewerVersion(remote, local) {
  const R = parseVersion(remote);
  const L = parseVersion(local);
  for (let i = 0; i < Math.max(R.length, L.length); i++) {
    const r = R[i] || 0, l = L[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

// v1.1.27 — Una release è "pronta" solo se ha già almeno un installer
// scaricabile caricato. Il CI crea la release PRIMA e carica gli asset DOPO
// (uno per piattaforma, in 2-4 min): in quella finestra la release esiste ma
// scaricarla darebbe la versione vecchia. Filtrando sugli asset installabili,
// il banner "nuova versione" appare solo quando il download è davvero pronto.
const INSTALLER_EXTS = ['.dmg', '.exe', '.appimage', '.deb', '.rpm'];

function hasInstallerAsset(release) {
  if (!release || !Array.isArray(release.assets)) return false;
  return release.assets.some((a) => {
    const name = (a && a.name ? a.name : '').toLowerCase();
    // Solo asset effettivamente caricati (state 'uploaded'): un upload in corso
    // può comparire come 'starter'/'new' senza essere ancora scaricabile.
    const uploaded = !a.state || a.state === 'uploaded';
    return uploaded && INSTALLER_EXTS.some((ext) => name.endsWith(ext));
  });
}

// Sceglie, da una lista di release GitHub, quella con la versione più alta
// (per semver) escludendo le draft E quelle senza installer ancora pronti.
// Le pre-release SONO incluse (vedi nota su RELEASES_API). Ritorna null se la
// lista è vuota o senza release pronte.
function pickLatestRelease(releases) {
  if (!Array.isArray(releases)) return null;
  let best = null;
  for (const r of releases) {
    if (!r || r.draft || !r.tag_name) continue;
    if (!hasInstallerAsset(r)) continue;  // build non ancora caricate → ignora
    if (!best || isNewerVersion(r.tag_name, best.tag_name)) best = r;
  }
  return best;
}

async function checkLatestRelease(currentVersion) {
  try {
    const releases = await fetchJson(RELEASES_API);
    const release = pickLatestRelease(releases);
    if (!release) {
      return { ok: true, available: false, reason: 'no-release' };
    }
    const latest = release.tag_name.replace(/^v/, '');
    const newer = isNewerVersion(latest, currentVersion);
    return {
      ok: true,
      available: newer,
      latest,
      current: currentVersion,
      // v1.1.25 — NON esporre release.html_url (pagina GitHub grezza): la UI
      // deve sempre puntare alla pagina download ufficiale del sito. Tenere
      // l'URL GitHub qui era una trappola (rischio di ricollegarlo per sbaglio).
      downloadPage: 'https://clacoroo.app/download/',
      publishedAt: release.published_at,
      notes:     (release.body || '').slice(0, 2000),
    };
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
}

module.exports = { checkLatestRelease, isNewerVersion, parseVersion, pickLatestRelease };
