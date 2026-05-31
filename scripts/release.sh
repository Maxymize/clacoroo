#!/usr/bin/env bash
#
# CLACOROO — release.sh
# Copyright (C) 2026 MAXYMIZE (Maximilian Giurastante <info@maxymizebusiness.com>)
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# Crea e pusha il tag vX.Y.Z (preso da package.json) che fa partire la build
# multipiattaforma + release su GitHub (vedi .github/workflows/release.yml).
#
# NON bumpa la versione né scrive il CHANGELOG: quello lo fai tu prima, a mano,
# nel commit della release. Questo script si limita a verificare che sia tutto
# in ordine e a piazzare il tag. Lo lanci solo quando sei sicuro.
#
# Uso:
#   npm run release          # tagga la versione corrente di package.json e pusha
#   npm run release -- --dry # mostra cosa farebbe, senza pushare nulla
#
set -euo pipefail

cd "$(dirname "$0")/.."

DRY_RUN=0
[[ "${1:-}" == "--dry" || "${1:-}" == "--dry-run" ]] && DRY_RUN=1

# Colori (no-op se non TTY)
if [[ -t 1 ]]; then
  R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; B=$'\033[1m'; X=$'\033[0m'
else
  R=''; G=''; Y=''; B=''; X=''
fi
ok()   { echo "${G}✓${X} $1"; }
warn() { echo "${Y}!${X} $1"; }
die()  { echo "${R}✗ $1${X}" >&2; exit 1; }

VERSION="$(node -p "require('./package.json').version")"
TAG="v${VERSION}"
echo "${B}Release CLACOROO ${TAG}${X}"
echo

# 1. branch main
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[[ "$BRANCH" == "main" ]] || die "Devi essere sul branch 'main' (sei su '$BRANCH')."
ok "branch: main"

# 2. working tree pulito (niente modifiche non committate)
if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "Working tree non pulito. Committa o stasha prima di rilasciare."
fi
ok "working tree pulito"

# 3. tag non già esistente (locale o remoto)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  die "Il tag $TAG esiste già in locale. Hai dimenticato di bumpare package.json?"
fi
if git ls-remote --exit-code --tags origin "$TAG" >/dev/null 2>&1; then
  die "Il tag $TAG esiste già su origin. Bumpa la versione in package.json."
fi
ok "tag $TAG libero (locale + remoto)"

# 4. entry CHANGELOG presente in ENTRAMBE le lingue
for f in CHANGELOG.md CHANGELOG.en.md; do
  grep -q "^## ${TAG} " "$f" \
    || die "Manca la sezione '## ${TAG} …' in $f. Aggiorna il CHANGELOG prima di rilasciare."
done
ok "CHANGELOG IT + EN aggiornati per $TAG"

# 5. locali allineati
npm run --silent audit:locales >/dev/null \
  || die "audit:locales fallito. Allinea i file locales prima di rilasciare."
ok "audit:locales OK"

# 6. allineato con origin/main (niente commit non pushati)
git fetch --quiet origin main || warn "git fetch fallito — controllo allineamento saltato."
if git rev-parse --verify --quiet origin/main >/dev/null; then
  AHEAD="$(git rev-list --count origin/main..HEAD)"
  if [[ "$AHEAD" -gt 0 ]]; then
    warn "Hai $AHEAD commit non ancora su origin/main: verranno pushati prima del tag."
  else
    ok "HEAD allineato con origin/main"
  fi
fi

echo
echo "${B}Riepilogo${X}"
echo "  Versione : $VERSION"
echo "  Tag      : $TAG"
echo "  Commit   : $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"
echo "  Effetto  : push main + push tag $TAG → CI builda macOS/Windows/Linux e pubblica la release"
echo

if [[ "$DRY_RUN" == "1" ]]; then
  warn "Dry-run: nessuna modifica. Tutti i controlli sono passati."
  exit 0
fi

read -r -p "Procedo con il push del tag ${TAG}? [y/N] " ANS
[[ "$ANS" == "y" || "$ANS" == "Y" ]] || die "Annullato."

# push main (nel caso ci siano commit pendenti) + tag
git push origin main
git tag -a "$TAG" -m "$TAG — CLACOROO"
git push origin "$TAG"

echo
ok "Tag $TAG pushato. La build è partita."
echo "  Segui la CI: ${B}gh run watch${X}  oppure  https://github.com/Maxymize/clacoroo/actions"
echo "  Release    : https://github.com/Maxymize/clacoroo/releases/tag/$TAG"
