import { EnvelopeIcon } from "@phosphor-icons/react";
import { SearchField, Select, TextField, Textarea } from "@ykurilov/ds-react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function FieldsDemo() {
  return (
    <DemoStack>
      <div className="sc-fields">
        <TextField label="Название" placeholder="Например, «Марафон»" hint="Видно участникам" />
        <TextField className="sc-force-focus" label="Название · в фокусе" defaultValue="Марафон по ИИ" hint="Видно участникам" />
        <TextField label="Почта" defaultValue="yuri@gmail" error="Похоже, не хватает «.com»" />
        <Select label="Курс" defaultValue="vibe">
          <option value="vibe">Вайб-кодинг</option>
          <option value="ai">ИИ для экспертов</option>
          <option value="launch">Запуски</option>
        </Select>
        <SearchField label="Поиск" placeholder="Найти проект" />
        <TextField label="Отключено" defaultValue="Только чтение" disabled />
        <Textarea
          className="sc-fields__wide"
          label="Задание агенту"
          defaultValue="Собери план рассылки к вебинару: 5 писем, от анонса до дожима."
          hint="Чем конкретнее, тем лучше результат"
        />
        <Textarea label="Растёт с текстом" autoGrow rows={2} defaultValue={"Нажми Enter —\nполе подрастёт"} />
      </div>
      <DemoLine label="Со значком">
        <TextField aria-label="Почта" icon={EnvelopeIcon} placeholder="Почта" kbd="⌘M" />
        <SearchField aria-label="Поиск с текстом" defaultValue="марафон" />
        <SearchField aria-label="Поиск без подсказки" kbd={null} placeholder="Без подсказки клавиши" />
      </DemoLine>
      <DemoLine label="Маленькие">
        <TextField size="sm" aria-label="Маленькое поле" placeholder="Маленькое · 32px" />
        <Select size="sm" aria-label="Маленький список" defaultValue="a">
          <option value="a">Список · 32px</option>
        </Select>
        <SearchField size="sm" aria-label="Маленький поиск" placeholder="Поиск · 32px" />
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 4,
  title: "Поля ввода",
  description: "Рамка выбранного поля оранжевая, рамка поля с ошибкой — красная. Высота 40px, маленькие — 32px.",
  Demo: FieldsDemo,
} satisfies ShowcaseSection;
