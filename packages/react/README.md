# «Одуванчик»: React-компоненты

```sh
pnpm add @ykurilov/ds-react @ykurilov/ds-tokens @phosphor-icons/react
```

```tsx
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import { StudioLayout, ScrollArea } from "@ykurilov/ds-react";

<div style={{ height: "100dvh" }}>
  <StudioLayout header={header} navigation={navigation}
    inspector={{ title: "Журнал", content: journal,
      open: journalOpen, onClose: () => setJournalOpen(false) }}>
    {workspace}
  </StudioLayout>
</div>;

<ScrollArea label="События журнала">{events}</ScrollArea>;
```

`StudioLayout`: `header`, `navigation?`, `navigationLabel?`, `contentLabel?`, `inspector?`, `children`, стандартные свойства div. `inspector` — `{ title, content, open, onClose }`. На компьютере журнал виден постоянно. До 700 px он становится мобильной шторкой: `open` и `onClose` управляются приложением; кнопку открытия разместите в `header`. Шторка удерживает фокус, закрывается по Esc и возвращает фокус к кнопке. Содержимое журнала монтируется один раз; при смене breakpoint перемонтируется, поэтому его состояние храните выше компоновки.

`ScrollArea`: обязательный `label`, стандартные свойства div, ref на DOM-элемент, `tabIndex=0` по умолчанию. Независимая прокрутка, стабильное место для скроллбара и отступ 16 px до текста, в том числе при overlay-скроллбарах.

Контейнеру компоновки требуется заданная высота, flex/grid-предкам — `min-height: 0`. Содержимое основного слота — flex-column с одной прокручиваемой областью и закреплённым footer. Чат предоставляет Agent Chat SDK со скином `@ykurilov/agent-chat-skin-oduvanchik`; его ленту нельзя оборачивать во второй `ScrollArea`, поскольку SDK управляет её ref и виртуализацией.

Сфера из точек (`Sphere`) по умолчанию оранжевая, значки — Phosphor. Тема по умолчанию системная; пользователь меняет её только в настройках через `ThemeSettings` («Как в системе / Светлая / Тёмная», выбор запоминается), без вспышки — `themeScript()` в `<head>`. Технически — `data-theme="light"` / `"dark"` на корне. Стандартная левая панель — `AppShell`, правила — [NAVIGATION.md](https://github.com/ykurilov/YKDesignSystem/blob/main/NAVIGATION.md) в репозитории дизайн-системы.

Версия 0.2.0 добавляет компоновку и роли размеров. Обычные поля, карточки и существующие компоненты сохраняют прежние размеры. Для новых компонентов требуется `ds-tokens@^0.2.0`.

Канонические документы (ссылки на GitHub, работают и со страницы npm): [NAVIGATION.md](https://github.com/ykurilov/YKDesignSystem/blob/main/NAVIGATION.md) — стандарт левой панели и навигации; [DECISIONS.md](https://github.com/ykurilov/YKDesignSystem/blob/main/DECISIONS.md) — принятые решения; [STUDIO.md](https://github.com/ykurilov/YKDesignSystem/blob/main/STUDIO.md) — рабочий экран с журналом; [CHANGELOG.md](https://github.com/ykurilov/YKDesignSystem/blob/main/CHANGELOG.md) — история версий; [README репозитория](https://github.com/ykurilov/YKDesignSystem/blob/main/README.md).
