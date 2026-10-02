'use strict';

const fs   = require('fs');
const path = require('path');

// Naive frontmatter parser: top-level `key: value` pairs, enough for SKILL.md /
// agent.md where we only need name + description.
// v1.2.18 — valori su più righe: blocchi YAML (`description: >`, `|`, `>-`…) e
// righe di continuazione indentate. Prima `description: >` restituiva ">" e la
// descrizione risultava "troppo corta" (falsi warning su 30 skill di questa
// macchina, mostrati come HEALTH: WARNING e nel Doctor).
function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  let lastKey = null;
  m[1].split(/\r?\n/).forEach(line => {
    if (lastKey && /^\s+\S/.test(line)) {
      fm[lastKey] = (fm[lastKey] ? fm[lastKey] + ' ' : '') + line.trim();
      return;
    }
    const idx = line.indexOf(':');
    if (idx < 0 || /^\s/.test(line)) { lastKey = null; return; }
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (/^[>|][+-]?\d*$/.test(val)) val = '';  // il testo è nelle righe indentate sotto
    if (key) { fm[key] = val; lastKey = key; }
  });
  return Object.keys(fm).length ? fm : null;
}

function checkMarkdownHealth(filePath) {
  if (!fs.existsSync(filePath)) {
    return { status: 'err', issues: ['health.fileMissing:' + path.basename(filePath)] };
  }
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); }
  catch (e) { return { status: 'err', issues: ['health.fileReadError:' + e.message] }; }

  const fm = parseFrontmatter(content);
  if (!fm) return { status: 'err', issues: ['health.missingFrontmatter'] };

  const issues = [];
  if (!fm.name)        issues.push('health.missingName');
  if (!fm.description) issues.push('health.missingDescription');
  else if (fm.description.length < 10) issues.push('health.descriptionTooShort');

  if (issues.some(i => i.includes('missingName') || i.includes('missingDescription'))) return { status: 'err', issues };
  if (issues.length) return { status: 'warn', issues };
  return { status: 'ok', issues: [] };
}

module.exports = { parseFrontmatter, checkMarkdownHealth };
