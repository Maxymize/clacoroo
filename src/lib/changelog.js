'use strict';

const fs   = require('fs');
const path = require('path');

// CHANGELOG.md è alla root del progetto (in dev e prod via app.asar)
function resolveChangelogPath() {
  const candidates = [
    path.join(__dirname, '..', '..', 'CHANGELOG.md'),  // dev
    path.join(process.resourcesPath || '', 'app.asar', 'CHANGELOG.md'),  // prod packaged
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function readChangelogRaw() {
  const p = resolveChangelogPath();
  if (!p) return null;
  try { return fs.readFileSync(p, 'utf8'); }
  catch { return null; }
}

// Parsing: ## vX.Y.Z — YYYY-MM-DD → version block con sections (### Title) e bullets (- item)
function parseChangelog(content) {
  if (!content) return [];
  const lines = content.split(/\r?\n/);
  const versions = [];
  let current = null;
  let currentSection = null;

  for (const line of lines) {
    const ver = line.match(/^##\s+(v?[\d.]+)\s*(?:—|-)\s*(.+?)\s*$/);
    if (ver) {
      if (current) versions.push(current);
      current = { version: ver[1].replace(/^v/, ''), date: ver[2], sections: [] };
      currentSection = null;
      continue;
    }
    if (!current) continue;
    const sec = line.match(/^###\s+(.+?)\s*$/);
    if (sec) {
      currentSection = { title: sec[1], items: [] };
      current.sections.push(currentSection);
      continue;
    }
    const bullet = line.match(/^\s*-\s+(.+?)\s*$/);
    if (bullet) {
      if (!currentSection) {
        currentSection = { title: '', items: [] };
        current.sections.push(currentSection);
      }
      currentSection.items.push(bullet[1]);
      continue;
    }
    // Paragrafi liberi sotto una sezione: accumula nel testo dell'ultima section (note)
    if (line.trim() && currentSection && !line.startsWith('#')) {
      if (!currentSection.notes) currentSection.notes = [];
      currentSection.notes.push(line.trim());
    }
  }
  if (current) versions.push(current);
  return versions;
}

module.exports = { readChangelogRaw, parseChangelog };
