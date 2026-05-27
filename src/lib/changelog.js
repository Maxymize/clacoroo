'use strict';

const fs   = require('fs');
const path = require('path');

// Risolve il file CHANGELOG da leggere in base alla lingua. `it` (default) →
// `CHANGELOG.md` (canonico); altre lingue → `CHANGELOG.<lang>.md` se esiste,
// fallback su canonico. In dev legge dalla root del progetto, in produzione
// dall'app.asar (i file sono inclusi via package.json build.files).
function resolveChangelogPath(lang) {
  const fileName = (lang && lang !== 'it') ? 'CHANGELOG.' + lang + '.md' : 'CHANGELOG.md';
  const candidates = [
    path.join(__dirname, '..', '..', fileName),  // dev
    path.join(process.resourcesPath || '', 'app.asar', fileName),  // prod packaged
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  // Fallback su CHANGELOG.md canonico se la traduzione non esiste
  if (fileName !== 'CHANGELOG.md') return resolveChangelogPath('it');
  return null;
}

function readChangelogRaw(lang) {
  const p = resolveChangelogPath(lang);
  if (!p) return null;
  try { return fs.readFileSync(p, 'utf8'); }
  catch { return null; }
}

// v1.0.68 — Parser sintetico per changelog professionale.
// Formato atteso per ogni release:
//   ## vX.Y.Z — YYYY-MM-DD — Titolo riassuntivo opzionale
//
//   - [FEATURE] Descrizione one-liner
//   - [FIX] Bug fix sintetico
//   - [IMPROVEMENT] Miglioramento di esistente
//   - [SECURITY] Hardening o vulnerability fix
//   - [REFACTOR] Refactor/cleanup interno
//   - [DOCS] Cambiamenti documentazione
//   - [CHORE] Deps bump / build / build config
//
// Items senza badge vengono classificati come `OTHER`.
// Section headers (### Title) e paragrafi prosa sono IGNORATI dal parser
// (legacy entries: vengono semplicemente skipati, l'output rimane pulito).
const VALID_BADGES = new Set(['FEATURE','FIX','IMPROVEMENT','SECURITY','REFACTOR','DOCS','CHORE']);

function parseChangelog(content) {
  if (!content) return [];
  const lines = content.split(/\r?\n/);
  const versions = [];
  let current = null;

  for (const line of lines) {
    // Header versione: cattura version, date (YYYY-MM-DD) e title opzionale
    const ver = line.match(/^##\s+v?(\d+\.\d+\.\d+)\s*(?:—|-|–)\s*(\d{4}-\d{2}-\d{2})(?:\s*(?:—|-|–)\s*(.+?))?\s*$/);
    if (ver) {
      if (current) versions.push(current);
      current = {
        version: ver[1],
        date: ver[2],
        title: (ver[3] || '').trim(),
        items: [],
      };
      continue;
    }
    if (!current) continue;
    // Skip section headers (### …) e tutto il resto che non sia un bullet
    if (line.startsWith('#')) continue;
    const bullet = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!bullet) continue;
    const text = bullet[1];
    // Estrai badge [TYPE] in testa, altrimenti OTHER
    const badge = text.match(/^\[([A-Z]+)\]\s*(.+)$/);
    if (badge && VALID_BADGES.has(badge[1])) {
      current.items.push({ type: badge[1], text: badge[2].trim() });
    } else {
      current.items.push({ type: 'OTHER', text });
    }
  }
  if (current) versions.push(current);
  return versions;
}

module.exports = { readChangelogRaw, parseChangelog };
