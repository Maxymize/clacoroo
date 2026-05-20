'use strict';

const fs   = require('fs');
const path = require('path');

// Naive frontmatter parser: handles only single-line `key: value` pairs.
// Sufficient for SKILL.md / agent.md where we only need name + description.
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  m[1].split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key) fm[key] = val;
  });
  return Object.keys(fm).length ? fm : null;
}

function checkMarkdownHealth(filePath) {
  if (!fs.existsSync(filePath)) {
    return { status: 'err', issues: ['File mancante: ' + path.basename(filePath)] };
  }
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); }
  catch (e) { return { status: 'err', issues: ['Errore lettura: ' + e.message] }; }

  const fm = parseFrontmatter(content);
  if (!fm) return { status: 'err', issues: ['Frontmatter YAML mancante o vuoto'] };

  const issues = [];
  if (!fm.name)        issues.push('Campo "name" mancante nel frontmatter');
  if (!fm.description) issues.push('Campo "description" mancante nel frontmatter');
  else if (fm.description.length < 10) issues.push('Description troppo corta (< 10 caratteri)');

  if (issues.some(i => i.includes('mancante'))) return { status: 'err', issues };
  if (issues.length) return { status: 'warn', issues };
  return { status: 'ok', issues: [] };
}

module.exports = { parseFrontmatter, checkMarkdownHealth };
