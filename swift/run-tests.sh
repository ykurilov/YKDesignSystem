#!/bin/bash
# Тесты пакета YKDesign на симуляторе iPhone. Запуск с основного Mac: imac-run --no-setup -- 'bash swift/run-tests.sh'
# На iMac Xcode 26 без платформы iOS, поэтому берём Xcode 16.4 и симулятор iOS 18.5.
set -o pipefail
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
cd "$(dirname "$0")/YKDesign"
RESULT=~/work/yk-test-results/$(date +%Y%m%d-%H%M%S).xcresult
mkdir -p ~/work/yk-test-results
xcodebuild test -scheme YKDesign \
  -destination 'platform=iOS Simulator,OS=18.5,name=iPhone 16' \
  -derivedDataPath ~/work/yk-dd -resultBundlePath "$RESULT" -parallel-testing-worker-count 4 -quiet 2>&1 \
  | grep -vE "^\s*$|DVTDeviceOperation|IDERunDestination"
status=${PIPESTATUS[0]}
# Итог: сколько тестов прошло и упало
xcrun xcresulttool get test-results summary --path "$RESULT" 2>/dev/null \
  | grep -E '"(result|passedTests|failedTests|skippedTests)"' | sort -u
xcrun xcresulttool get test-results summary --path "$RESULT" 2>/dev/null | grep -A3 '"testName"' || true
exit $status
