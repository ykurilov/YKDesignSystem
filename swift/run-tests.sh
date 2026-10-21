#!/bin/bash
# Тесты пакета YKDesign на симуляторе iPhone. Запуск с основного Mac: imac-run --no-setup -- 'bash swift/run-tests.sh'
# На iMac Xcode 26 без платформы iOS, поэтому берём Xcode 16.4 и симулятор iOS 18.5.
set -o pipefail
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
cd "$(dirname "$0")/YKDesign"
xcodebuild test -scheme YKDesign \
  -destination 'platform=iOS Simulator,OS=18.5,name=iPhone 16' \
  -derivedDataPath ~/work/yk-dd -parallel-testing-worker-count 4 -quiet 2>&1 \
  | grep -vE "^\s*$|DVTDeviceOperation|IDERunDestination"
