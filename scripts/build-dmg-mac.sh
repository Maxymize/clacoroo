#!/usr/bin/env bash
#
# CLACOROO — build DMG macOS con sfondo finestra installazione
#
# PERCHÉ questo script invece di `electron-builder --mac dmg`:
# electron-builder su macOS Sequoia ha un bug noto nella scrittura del
# .DS_Store del DMG → lo sfondo della finestra installazione NON appare
# (finestra bianca). Vedi commento in build/dmgbuild-settings.py.
#
# Soluzione: electron-builder produce SOLO il .app (target `dir`), poi
# `dmgbuild` (Python) costruisce il DMG con sfondo scrivendo il .DS_Store
# programmaticamente (HFS+ + .background.tiff in root), senza AppleScript/
# Finder. Risultato identico ai DMG storici funzionanti (es. v1.0.80).
#
# Uso: npm run build   (oppure: bash scripts/build-dmg-mac.sh)
# Output: dist/CLACOROO-<version>-arm64.dmg + dist/CLACOROO-<version>-x64.dmg
set -euo pipefail

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
VENV=".venv-dmg"

echo "==> CLACOROO build DMG v$VERSION"

# 1. dmgbuild in venv locale (isolato, non tocca il Python di sistema)
if [ ! -x "$VENV/bin/dmgbuild" ]; then
  echo "==> Installo dmgbuild in $VENV (una tantum)"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet dmgbuild
fi

# 2. electron-builder produce SOLO i .app (target dir), niente DMG suo
echo "==> electron-builder: packaging .app (arm64 + x64)"
npx electron-builder --mac dir --arm64
npx electron-builder --mac dir --x64

# 3. dmgbuild crea i DMG con sfondo per ogni architettura
ARM_APP="dist/mac-arm64/CLACOROO.app"
X64_APP="dist/mac/CLACOROO.app"
ARM_DMG="dist/CLACOROO-$VERSION-arm64.dmg"
X64_DMG="dist/CLACOROO-$VERSION-x64.dmg"

for pair in "$ARM_APP|$ARM_DMG|arm64" "$X64_APP|$X64_DMG|x64"; do
  APP="${pair%%|*}"; rest="${pair#*|}"; DMG="${rest%%|*}"; ARCH="${rest##*|}"
  if [ ! -d "$APP" ]; then
    echo "ERRORE: $APP non trovato (electron-builder dir fallito?)"; exit 1
  fi
  echo "==> dmgbuild $ARCH → $DMG"
  rm -f "$DMG"
  "$VENV/bin/dmgbuild" -s build/dmgbuild-settings.py \
    -D app="$APP" "CLACOROO $VERSION" "$DMG"
done

# 4. Verifica che lo sfondo sia presente (filesystem HFS+ + .background.tiff)
echo "==> Verifica sfondo DMG"
MNT="/tmp/clacoroo-dmg-verify-$$"
hdiutil attach "$ARM_DMG" -nobrowse -mountpoint "$MNT" >/dev/null 2>&1
if [ -f "$MNT/.background.tiff" ]; then
  echo "    OK: sfondo presente in $ARM_DMG"
else
  echo "    ⚠ ATTENZIONE: .background.tiff mancante in $ARM_DMG"
fi
hdiutil detach "$MNT" >/dev/null 2>&1 || true

echo "==> Fatto:"
ls -lh "$ARM_DMG" "$X64_DMG"
