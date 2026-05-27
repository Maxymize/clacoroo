#!/usr/bin/env node
/*
 * CLACOROO — Audit locale files
 *
 * Verifica che TUTTI i file in src/renderer/locales/<lang>.js abbiano la stessa
 * shape (stesso set di chiavi nested + stesse variabili di interpolazione `{var}`
 * in ogni stringa). Usato per garantire che nuove lingue non manchino chiavi e
 * che lo schema resti coerente fra release.
 *
 * Uso: `node scripts/audit-locales.js` (o `npm run audit:locales`).
 * Exit code: 0 = OK, 1 = mismatches.
 *
 * Per aggiungere una nuova lingua: crea `src/renderer/locales/<lang>.js`,
 * lo script la rileva automaticamente e la confronta con `it` (reference).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'renderer', 'locales');
const REFERENCE = 'it';

// Carica i locale files (formato: assegnano a window.LOCALES.<lang>)
global.window = { LOCALES: {} };
const files = fs.readdirSync(LOCALES_DIR).filter(function (f) { return f.endsWith('.js'); });
files.forEach(function (f) { require(path.join(LOCALES_DIR, f)); });
const LOCALES = global.window.LOCALES;
const langs = Object.keys(LOCALES);

if (!langs.includes(REFERENCE)) {
  console.error('ERROR: reference locale "' + REFERENCE + '" missing in ' + LOCALES_DIR);
  process.exit(1);
}

function flatten(obj, prefix) {
  prefix = prefix || '';
  var out = {};
  Object.keys(obj).forEach(function (k) {
    var v = obj[k];
    var key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      var nested = flatten(v, key);
      Object.keys(nested).forEach(function (nk) { out[nk] = nested[nk]; });
    } else {
      out[key] = v;
    }
  });
  return out;
}

function varsIn(s) {
  if (typeof s !== 'string') return [];
  var matches = s.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return matches.map(function (m) { return m.slice(1, -1); }).sort();
}

var refFlat = flatten(LOCALES[REFERENCE]);
var refKeys = Object.keys(refFlat).sort();
var hasError = false;

console.log('Reference locale: ' + REFERENCE + ' (' + refKeys.length + ' keys)');
console.log('Auditing ' + (langs.length - 1) + ' other locales: ' + langs.filter(function (l) { return l !== REFERENCE; }).join(', '));
console.log();

langs.forEach(function (lang) {
  if (lang === REFERENCE) return;
  var langFlat = flatten(LOCALES[lang]);
  var langKeys = Object.keys(langFlat).sort();

  var missing = refKeys.filter(function (k) { return !(k in langFlat); });
  var extra = langKeys.filter(function (k) { return !(k in refFlat); });

  if (missing.length || extra.length) {
    hasError = true;
    console.log('[FAIL] ' + lang + ': ' + langKeys.length + ' keys');
    if (missing.length) {
      console.log('  Missing (' + missing.length + '):');
      missing.forEach(function (k) { console.log('    - ' + k); });
    }
    if (extra.length) {
      console.log('  Extra (' + extra.length + '):');
      extra.forEach(function (k) { console.log('    + ' + k); });
    }
  } else {
    console.log('[OK] ' + lang + ': ' + langKeys.length + ' keys (shape matches reference)');
  }

  // Check interpolation variables consistency
  var varMismatches = [];
  refKeys.forEach(function (k) {
    if (!(k in langFlat)) return;
    var refVars = varsIn(refFlat[k]).join(',');
    var langVars = varsIn(langFlat[k]).join(',');
    if (refVars !== langVars) {
      varMismatches.push({ key: k, ref: refVars || '(none)', lang: langVars || '(none)' });
    }
  });
  if (varMismatches.length) {
    hasError = true;
    console.log('  Interpolation mismatches (' + varMismatches.length + '):');
    varMismatches.forEach(function (m) {
      console.log('    ! ' + m.key + ' | ' + REFERENCE + '={' + m.ref + '} ' + lang + '={' + m.lang + '}');
    });
  }
});

console.log();
if (hasError) {
  console.error('FAIL — locale shape mismatch detected. Fix before commit.');
  process.exit(1);
} else {
  console.log('OK — all ' + langs.length + ' locales perfectly aligned.');
  process.exit(0);
}
