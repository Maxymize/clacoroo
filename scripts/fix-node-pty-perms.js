#!/usr/bin/env node
/*
 * CLACOROO — postinstall hook
 * Fix permessi spawn-helper di node-pty: i prebuilds tarball non preservano
 * il bit eseguibile su alcune piattaforme (npm cache + tar), risultato:
 * `posix_spawnp failed` al primo spawn. Forziamo chmod +x sui binari.
 *
 * Idempotente: se il file non esiste (es. piattaforma senza prebuild) salta.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const prebuildsRoot = path.join(__dirname, '..', 'node_modules', 'node-pty', 'prebuilds');
if (!fs.existsSync(prebuildsRoot)) return;

const targets = [
  ['darwin-arm64', 'spawn-helper'],
  ['darwin-x64',   'spawn-helper'],
];

for (const [arch, file] of targets) {
  const full = path.join(prebuildsRoot, arch, file);
  if (!fs.existsSync(full)) continue;
  try {
    fs.chmodSync(full, 0o755);
  } catch (e) {
    process.stderr.write(`[clacoroo postinstall] chmod ${arch}/${file} failed: ${e.message}\n`);
  }
}
