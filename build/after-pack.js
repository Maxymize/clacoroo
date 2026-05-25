/*
 * CLACOROO — electron-builder afterPack hook
 *
 * Applica una firma ad-hoc (placeholder) al .app appena impacchettato.
 * Su macOS Sequoia, un'app senza alcuna firma viene marcata come "danneggiata"
 * da Gatekeeper e mostra il dialog "Move to Trash". Una firma ad-hoc (`-`)
 * soddisfa il check senza richiedere un certificato Apple Developer ID.
 *
 * Combinato con `hardenedRuntime: false` nel package.json, l'app scaricata
 * dal browser apre normalmente con un solo prompt "Open downloaded app?"
 * (Gatekeeper standard per file con quarantine attribute), senza richiedere
 * `sudo codesign` manuale lato utente.
 */
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;

  const productFilename = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${productFilename}.app`);

  console.log(`[after-pack] Applying ad-hoc signature to ${appPath}`);
  try {
    execFileSync('codesign', [
      '--force',
      '--deep',
      '--sign', '-',
      appPath,
    ], { stdio: 'inherit' });
    console.log('[after-pack] Ad-hoc signing OK');
  } catch (e) {
    console.error('[after-pack] Ad-hoc signing FAILED:', e.message);
    // Non blocco il build: l'app funziona comunque con workaround manuale.
  }
};
