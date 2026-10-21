# YKDesignSystem

Дизайн-система Юрия для веба (React) и iPhone (SwiftUI). Облик и принятые решения — в [DECISIONS.md](DECISIONS.md), история выбора — в `sketches/`.

## Структура

```
packages/tokens/   @ykurilov/ds-tokens — переменные: цвета двух тем, тени, радиусы, шрифты, отступы
  src/tokens.ts    единственный источник правды; всё остальное генерируется из него
apps/              приложения-витрины (позже)
swift/YKDesign/    Swift-пакет для iPhone (iOS 17+, macOS 14+): переменные, значки Phosphor, компоненты, витрина
swift/YKShowcaseApp/  приложение-витрина (проект собирает XcodeGen)
swift/screenshots/ снимки витрины на симуляторе
sketches/          наброски — история, не править
```

`pnpm -r build` в пакете переменных выдаёт:
- `dist/tokens.css` — переменные `--yk-*`; светлая тема в `:root`, тёмная — по `data-theme="dark"` и сама по системной настройке; классы `.yk-mono-label`, `.yk-mono-num`;
- `dist/index.js` + `.d.ts` — те же значения для JS;
- `swift/YKDesign/Sources/YKDesign/Generated/Tokens.swift` — `enum YKTokens`: цвета, радиусы, отступы, роли шрифта, тень, плавность (коммитится);
- `swift/YKDesign/Tests/YKDesignTests/Fixtures/tokens.json` — образец, по которому тесты Swift сверяют цвета.

## Команды

```bash
pnpm install
pnpm -r build
pnpm -r test
```

Правка переменной: изменить `packages/tokens/src/tokens.ts` → `pnpm -r build` → закоммитить вместе с обновлённым `Tokens.swift`. Тест проверяет, что Swift-файл не отстал от источника.

## Swift (iPhone)

Подключение: Swift Package `swift/YKDesign`, продукт `YKDesign`. Значки — официальный пакет Phosphor для SwiftUI.

```swift
import YKDesign

Text("Проекты").ykText(.screen)
Text("В работе").ykMonoLabel()
Button("Создать проект") {}.buttonStyle(.yk(.primary, size: .lg))
Toggle("Напоминать", isOn: $on).toggleStyle(.ykSwitch)
YKChip("В работе", kind: .live)
YKIcon(.caretRight, size: 14)
```

Компоненты: `YKSphere`, `YKNewDot`, `YKButtonStyle`, `YKChip`, `YKSteps`, `YKAvatar`, `YKTag`, `YKTextField` / `YKField`, `.ykSwitch` / `.ykCheckbox`, `YKSegmented`, `YKCard`, `YKStat`, `YKListGroup` + `YKListRow`, `YKBanner`, `YKToast`, `YKEmptyState`. Все разом — `YKShowcaseView`.

Тесты и снимки — на iMac:

```bash
imac-run --no-setup -- 'bash swift/run-tests.sh'
imac-run --no-setup --fetch swift/screenshots -- 'bash swift/run-showcase.sh'
```
