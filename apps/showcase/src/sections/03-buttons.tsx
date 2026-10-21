import { ArrowRightIcon, ArrowUpIcon, PlusIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Icon } from "@ykurilov/ds-react";
import { useState } from "react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function LoadingOnClick() {
  const [loading, setLoading] = useState(false);
  return (
    <Button loading={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2500); }}>
      {loading ? "Агент пишет…" : "Нажми — загрузка"}
    </Button>
  );
}

function ButtonsDemo() {
  return (
    <DemoStack>
      <DemoLine label="Виды">
        <Button>Создать проект</Button>
        <Button variant="secondary">Импорт</Button>
        <Button variant="outline">Настроить</Button>
        <Button variant="ghost">Отмена</Button>
        <Button variant="danger">Удалить</Button>
        <Button variant="link">Шаблоны <Icon icon={ArrowRightIcon} size={14} /></Button>
      </DemoLine>
      <DemoLine label="Состояния">
        <Button>Обычная</Button>
        <Button disabled>Отключена</Button>
        <Button loading>Агент пишет…</Button>
        <LoadingOnClick />
      </DemoLine>
      <DemoLine label="Размеры">
        <Button size="sm">Маленькая</Button>
        <Button>Средняя</Button>
        <Button size="lg">Большая · телефон</Button>
        <Button variant="secondary" icon={ArrowUpIcon} aria-label="Отправить" />
        <Button kbd="⌘N">Создать</Button>
      </DemoLine>
      <DemoLine label="Со значком">
        <Button size="sm" variant="outline" icon={PlusIcon}>Добавить</Button>
        <Button variant="secondary" icon={PlusIcon}>Добавить</Button>
        <Button size="lg" icon={PlusIcon}>Добавить</Button>
        <Button variant="danger" icon={TrashIcon}>Удалить</Button>
      </DemoLine>
      <DemoLine label="Только знак">
        <Button size="sm" variant="ghost" icon={TrashIcon} aria-label="Удалить" />
        <Button variant="outline" icon={PlusIcon} aria-label="Добавить" />
        <Button icon={ArrowUpIcon} aria-label="Отправить" />
        <Button size="lg" icon={StopIcon} aria-label="Остановить" />
        <Button loading icon={ArrowUpIcon} aria-label="Отправляется" />
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 3,
  title: "Кнопки",
  description: "Главная — всегда чёрная. Одна главная кнопка на экран. Фокус — оранжевое кольцо (Tab).",
  Demo: ButtonsDemo,
} satisfies ShowcaseSection;
