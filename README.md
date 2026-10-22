# «Одуванчик» — дизайн-система

Дизайн-система Юрия «Одуванчик» (в коде `oduvanchik`) для веба (React) и iPhone (SwiftUI). Имя — по главной примете: вращающейся сфере из точек, «агент работает». Облик и принятые решения — в [DECISIONS.md](DECISIONS.md), история выбора — в `sketches/`.

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

Пакеты опубликованы в npm:

```bash
pnpm add @ykurilov/ds-tokens @ykurilov/ds-react @phosphor-icons/react
```

Чтобы проверить неопубликованную правку дизайн-системы в приложении до выпуска — живая ссылка с диска: `pnpm -r build` в репозитории системы, затем в приложении `pnpm add link:/путь/к/YKDesignSystem/packages/tokens link:/путь/к/YKDesignSystem/packages/react`. Перед коммитом приложения вернуть зависимость из npm.

Выпуск новой версии: поднять `version` в `packages/tokens/package.json` и `packages/react/package.json`, `pnpm -r build`, затем `pnpm publish --access public` в каждом пакете (ключ — `~/.codex/secrets/npm-ykurilov-publish-token.txt`, через временный `NPM_CONFIG_USERCONFIG`, в файлы проекта не класть).

```tsx
// один раз, в корне приложения: сначала переменные, потом стили компонентов
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";

import { ArrowUpIcon } from "@phosphor-icons/react";
import { Button, Chip, Sphere } from "@ykurilov/ds-react";

export function AgentStatusExample({ busy }: { busy: boolean }) {
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
- Рабочие экраны (с 0.2.0): `StudioLayout`, `ScrollArea`; контракт и пример — [STUDIO.md](STUDIO.md).

`ToastProvider` ставится один раз в корне приложения: он держит живую область, которую читает экранный диктор. Значки — только `@phosphor-icons/react` через `Icon` или проп `icon`; символы из шрифта вместо значков не использовать.

## Чат с агентом

Готовый чат подключается через Agent Chat SDK и скин `@ykurilov/agent-chat-skin-oduvanchik` (первый выпуск — SDK 0.71.0). Поле ввода принадлежит скину SDK; пример `AgentStatusExample` выше показывает отдельные компоненты дизайн-системы.

```bash
pnpm add @ykurilov/agent-chat-react @ykurilov/agent-chat-skin-oduvanchik
```

Все пакеты `@ykurilov/agent-chat-*` в приложении должны быть одной версии. В основном CSS приложения с Tailwind CSS 4:

```css
@import "tailwindcss";
@import "@ykurilov/agent-chat-skin-oduvanchik/styles.css";
@source "../node_modules/@ykurilov/agent-chat-skin-oduvanchik/dist";
@source "../node_modules/@tandem/ui/dist";
```

Пути `@source` считаются от CSS-файла. При строгой структуре pnpm добавьте прямую зависимость базовых примитивов скина: `pnpm add @tandem/ui@npm:@ykurilov/tandem-ui@^0.7.0`.

```tsx
import { AgentChat } from "@ykurilov/agent-chat-react";
import { oduvanchikSkin } from "@ykurilov/agent-chat-skin-oduvanchik";

export function ChatScreen({ chatId }: { chatId: string }) {
  return (
    <div className="oduvanchik-chat" style={{ height: "100dvh" }}>
      <AgentChat api="/api/chat" chatId={chatId} skin={oduvanchikSkin}
        composerOptions={{ variant: "standard" }} />
    </div>
  );
}
```

Пример предполагает настроенный сервер SDK по адресу `/api/chat` и существующий чат. Сервер и хранилище подключаются по [инструкции SDK](https://github.com/ykurilov/agent-chat-sdk/blob/main/docs/getting-started.md).

`composerOptions.variant`:

- `compact` — поле текста и отправка;
- `standard` (по умолчанию) — вложения, контекст и микрофон рядом с отправкой;
- `extended` — также модель, провайдер, рассуждения и инструменты; на телефоне настройки открываются в шторке.

Вложения и голос требуют подключения `attachments` и `voice` в SDK. Список инструментов и обработчики их переключения передаёт приложение; скин не выдаёт серверных разрешений. Согласованный образец поведения — [набросок 12](sketches/12-composer-variants.html).

Сфера и переменные берутся из опубликованных пакетов дизайн-системы. Сложные виджеты, Markdown, просмотр медиа, редакторы памяти и часть голосового интерфейса пока используют базовые примитивы Тандема с переменными «Одуванчика». Отдельные административные расширения оформляются скином Тандема. Подробности подключения и текущие ограничения — [README скина](https://github.com/ykurilov/agent-chat-sdk/blob/main/skins/oduvanchik/README.md).

## Композиция «Студия»

Для песочниц и рабочих экранов с журналом используйте `StudioLayout` и `ScrollArea` из `@ykurilov/ds-react@^0.2.0` вместе с `@ykurilov/ds-tokens@^0.2.0`. Поверхности, прокрутка, мобильная шторка и интеграция с чатом описаны в [STUDIO.md](STUDIO.md). Утверждённый интерактивный образец — `explorations/sandbox/?v=c&state=dialog`. Компоновка работает без Agent Chat SDK; сам чат подключается через SDK.

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

Компоненты: `YKSphere`, `YKNewDot`, `YKButtonStyle`, `YKIconButton`, `YKMenuButton`, `YKChip`, `YKSteps`, `YKAvatar`, `YKTag`, `YKTextField` / `YKField`, `.ykSwitch` / `.ykCheckbox`, `YKRadioGroup`, `YKSegmented`, `YKTabs`, `YKCard`, `YKStat`, `YKListGroup` + `YKListRow` / `YKListDivider`, `YKBanner`, `YKToast`, `YKEmptyState`, `YKSkeleton`, `.ykSheet`, `.ykSystemDialogs()`. Все разом — `YKShowcaseView`.

Тесты и снимки — на iMac:

```bash
imac-run --no-setup -- 'bash swift/run-tests.sh'
imac-run --no-setup --fetch swift/screenshots -- 'bash swift/run-showcase.sh'
```
