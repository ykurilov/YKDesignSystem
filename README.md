# YKDesignSystem

Дизайн-система Юрия для веба (React) и iPhone (SwiftUI). Облик и принятые решения — в [DECISIONS.md](DECISIONS.md), история выбора — в `sketches/`.

## Структура

```
packages/tokens/   @ykurilov/ds-tokens — переменные: цвета двух тем, тени, радиусы, шрифты, отступы
  src/tokens.ts    единственный источник правды; всё остальное генерируется из него
packages/react/    @ykurilov/ds-react — React-компоненты; каждый в своей папке src/<компонент>/ (код + css)
apps/showcase/     витрина всех компонентов (Vite), разделы — src/sections/*.tsx
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

## Подключение в React-приложении

Пакеты пока не опубликованы, поэтому подключаем с диска. Проверено на пустом приложении Vite + React: собирается, стили и компоненты работают.

```bash
# один раз, в репозитории дизайн-системы: собрать пакеты (без этого в них нет dist/)
cd /путь/к/YKDesignSystem && pnpm install && pnpm -r build

# в вашем приложении
pnpm add link:/путь/к/YKDesignSystem/packages/tokens link:/путь/к/YKDesignSystem/packages/react @phosphor-icons/react
```

- `link:` — живая ссылка: поправили дизайн-систему, пересобрали (`pnpm -r build`) — приложение видит новое сразу.
- `file:` вместо `link:` — копия на момент установки; после пересборки команду `pnpm add file:…` нужно повторить.
- Путь в `package.json` приложения абсолютный: на другом компьютере и в CI он не сработает, пока пакеты не опубликованы.
- Когда пакеты опубликуют, останется `pnpm add @ykurilov/ds-tokens @ykurilov/ds-react @phosphor-icons/react`.

```tsx
// один раз, в корне приложения: сначала переменные, потом стили компонентов
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";

import { ArrowUpIcon } from "@phosphor-icons/react";
import { Button, Chip, Sphere } from "@ykurilov/ds-react";

export function Composer({ busy }: { busy: boolean }) {
  return (
    <>
      <Chip tone="live">В работе</Chip>
      <Button loading={busy} kbd="⌘↵">Отправить</Button>
      <Button variant="secondary" icon={ArrowUpIcon} aria-label="Отправить" />
      <Sphere size={24} label="Агент пишет ответ" />
    </>
  );
}
```

Тема: светлая по умолчанию, тёмная — сама по системной настройке. Задать вручную: `<html data-theme="dark">` или `data-theme="light"`.

Компоненты:
- Основа: `Icon`, `Sphere`, `NewDot`, `MonoLabel`, `MonoNum`.
- Кнопки и метки: `Button`, `Chip`, `Tag`, `Steps`, `Avatar`.
- Поля: `TextField`, `Textarea`, `SearchField`, `Select`.
- Выбор: `Checkbox`, `Radio` + `RadioGroup`, `Switch`, `SegmentedControl`, `Tabs` (`TabList`, `Tab`, `TabPanel`).
- Карточки и списки: `Card`, `Stat`, `StatGroup`, `List`, `ListRow`, `Table*` (`Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`).
- Всплывающее: `Dialog`, `Sheet`, `Menu`, `Toast` (`ToastProvider` + `useToast`).
- Сообщения и пустота: `Banner`, `EmptyState`, `Skeleton`.

`ToastProvider` ставится один раз в корне приложения: он держит живую область, которую читает экранный диктор. Значки — только `@phosphor-icons/react` через `Icon` или проп `icon`; символы из шрифта вместо значков не использовать.

## Витрина

```bash
pnpm --filter @ykurilov/ds-showcase dev        # http://localhost:5173, компоненты берутся из исходников
pnpm --filter @ykurilov/ds-showcase snapshots http://localhost:5173/   # снимки светлой и тёмной темы в apps/showcase/snapshots/
```

Новый раздел — новый файл `apps/showcase/src/sections/NN-название.tsx` с `export default { order, title, description, Demo } satisfies ShowcaseSection`. Список разделов собирается сам, общий файл править не нужно. Номера: 01 цвета, 02 шрифт, 03 кнопки, 04 поля, 05 выбор, 06 метки, 07 карточки и списки, 08 всплывающее, 09 пусто и загрузка (раздел 07 включает счётчики и таблицу). Строка примеров — `DemoLine` и `DemoStack` из `src/layout/Demo.tsx`.

## Команды

```bash
pnpm install
pnpm -r build
pnpm -r test
```

Правка переменной: изменить `packages/tokens/src/tokens.ts` → `pnpm -r build` → закоммитить вместе с обновлённым `Tokens.swift`. Тест проверяет, что Swift-файл не отстал от источника.

## Swift (iPhone)

Подключение (пакет с диска, проверено сборкой пустого проекта):
- В Xcode: File → Add Package Dependencies… → Add Local… → папка `swift/YKDesign`, продукт `YKDesign`.
- Или в `Package.swift` приложения: `.package(path: "/путь/к/YKDesignSystem/swift/YKDesign")` и `.product(name: "YKDesign", package: "YKDesign")` в зависимостях цели.
- Собирать через Xcode или `xcodebuild`, не через `swift build`: значки Phosphor лежат в каталоге ресурсов, консольный `swift build` его не собирает.

Значки — официальный пакет Phosphor для SwiftUI, подтянется сам.

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
