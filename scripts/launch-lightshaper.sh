#!/bin/bash
# Run it yourself: bash ~/Desktop/Hollowbit/scripts/launch-lightshaper.sh
# 1. Publishes Lightshaper 1.0.0 on GitHub (repo + installers).
# 2. Rebuilds hollowbit.dev so download buttons point at the real release, then pushes it.
# 3. Pushes the other product sites, which now list Lightshaper too.
set -e
D="$HOME/Desktop"
AUTHOR=(-c user.name="Elvis Zygmanta" -c user.email="hollowbit-dev@users.noreply.github.com")

echo "== Releasing Lightshaper"
if gh release view v1.0.0 --repo hollowbit-dev/lightshaper >/dev/null 2>&1; then echo "(already released)"; else bash "$D/Lightshaper/scripts/release.sh"; fi

echo "== hollowbit.dev"
cd "$D/Hollowbit"
GITHUB_TOKEN=$(gh auth token) node site/build.mjs
git add -A
git "${AUTHOR[@]}" commit -qm "Lightshaper is out" || echo "(no changes)"
git push -q

for app in Fileshaper Captionshaper Writeshaper Diskshaper; do
  echo "== $app website"
  git -C "$D/$app" push -q
done
echo "Done. Lightshaper: https://hollowbit.dev/lightshaper/"
