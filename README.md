# YKDesignSystem

Дизайн-система Юрия для веба (React) и iPhone (SwiftUI). Облик и принятые решения — в [DECISIONS.md](DECISIONS.md), история выбора — в `sketches/`.

## Структура

```
packages/tokens/   @ykurilov/ds-tokens — переменные: цвета двух тем, тени, радиусы, шрифты, отступы
  src/tokens.ts    единственный источник правды; всё остальное генерируется из него
apps/              приложения-витрины (позже)
swift/YKDesign/    Swift-пакет (этап 4); сейчас только Sources/YKDesign/Generated/Tokens.swift
sketches/          наброски — история, не править
```

`pnpm -r build` в пакете переменных выдаёт:
- `dist/tokens.css` — переменные `--yk-*`; светлая тема в `:root`, тёмная — по `data-theme="dark"` и сама по системной настройке; классы `.yk-mono-label`, `.yk-mono-num`;
- `dist/index.js` + `.d.ts` — те же значения для JS;
- `swift/YKDesign/Sources/YKDesign/Generated/Tokens.swift` — `enum YKTokens` (коммитится).

## Команды

```bash
pnpm install
pnpm -r build
pnpm -r test
```

Правка переменной: изменить `packages/tokens/src/tokens.ts` → `pnpm -r build` → закоммитить вместе с обновлённым `Tokens.swift`. Тест проверяет, что Swift-файл не отстал от источника.
