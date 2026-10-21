#!/bin/bash
# Собирает витрину, ставит на симулятор iPhone 16 (iOS 18.5) и снимает каждый раздел
# в светлой и тёмной теме, плюс несколько разделов крупным шрифтом. Снимки — в swift/screenshots/.
# Запуск с основного Mac: imac-run --no-setup --fetch swift/screenshots -- 'bash swift/run-showcase.sh'
set -euo pipefail
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
export PATH=$HOME/.local/bin:$PATH
ROOT="$(cd "$(dirname "$0")" && pwd)"
DEVICE=$(xcrun simctl list devices available | awk '/-- iOS 18.5 --/{f=1;next} /^--/{f=0} f && /iPhone 16 \(/{gsub(/[()]/,"",$3); print $3; exit}')
BUNDLE=cloud.kurilov.YKShowcaseApp
OUT="$ROOT/screenshots"
SECTIONS="${SECTIONS:-1 2 3 4 5 6 7 8 9}"
LARGE_SECTIONS="${LARGE_SECTIONS:-2 3 4 7 8}"
mkdir -p "$OUT"

cd "$ROOT/YKShowcaseApp"
xcodegen generate --quiet
xcodebuild build -project YKShowcaseApp.xcodeproj -scheme YKShowcaseApp \
  -destination "id=$DEVICE" -derivedDataPath ~/work/yk-app-dd -quiet 2>&1 | grep -vE "^\s*$|DVTDeviceOperation" || true
APP=$(ls -d ~/work/yk-app-dd/Build/Products/Debug-iphonesimulator/YKShowcaseApp.app)

xcrun simctl boot "$DEVICE" 2>/dev/null || true
xcrun simctl bootstatus "$DEVICE" -b >/dev/null
xcrun simctl status_bar "$DEVICE" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3
xcrun simctl install "$DEVICE" "$APP"

shoot() { # тема, размер шрифта, раздел, имя файла
  xcrun simctl ui "$DEVICE" appearance "$1"
  xcrun simctl ui "$DEVICE" content_size "$2"
  xcrun simctl terminate "$DEVICE" "$BUNDLE" 2>/dev/null || true
  xcrun simctl launch "$DEVICE" "$BUNDLE" --section "$3" >/dev/null
  sleep 2.5
  xcrun simctl io "$DEVICE" screenshot --type=png "$OUT/$4.png" >/dev/null 2>&1
  echo "снимок: $4.png"
}

for theme in light dark; do
  for s in $SECTIONS; do shoot "$theme" large "$s" "$(printf '%02d' "$s")-$theme"; done
done
for s in $LARGE_SECTIONS; do shoot light accessibility-medium "$s" "$(printf '%02d' "$s")-light-large-type"; done
xcrun simctl ui "$DEVICE" content_size large
xcrun simctl ui "$DEVICE" appearance light
