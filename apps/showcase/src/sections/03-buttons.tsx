import { ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, DotsThreeIcon, HeartIcon, PlusIcon, ShareNetworkIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, Icon, MonoLabel } from "@ykurilov/ds-react";
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

/** Шапка поста: «назад» над заголовком и действия под ним. */
function PostExample({ wrong }: { wrong?: boolean }) {
  return (
    <div className="sc-post">
      <MonoLabel>{wrong ? "Не так · ghost с текстом" : "Так"}</MonoLabel>
      {wrong
        ? <span className="sc-old-ghost"><Icon icon={ArrowLeftIcon} size={16} />Лента</span>
        : <Button href="#" variant="outline" size="sm" icon={ArrowLeftIcon} onClick={(e) => e.preventDefault()}>Лента</Button>}
      <h3 className="sc-post__title">Как мы запускали клуб</h3>
      <div className="sc-post__actions">
        {wrong
          ? <span className="sc-old-ghost"><Icon icon={HeartIcon} size={16} />0</span>
          : <Button variant="secondary" size="sm" icon={HeartIcon} aria-label="Нравится, 0">0</Button>}
        <span className="sc-post__spacer" />
        <Button variant="ghost" size="sm" icon={ShareNetworkIcon} aria-label="Поделиться" />
        <Button variant="ghost" size="sm" icon={DotsThreeIcon} aria-label="Ещё" />
      </div>
    </div>
  );
}

function ButtonsDemo() {
  return (
    <DemoStack>
      <DemoLine label="Виды">
        <Button>Создать проект</Button>
        <Button variant="secondary">Импорт</Button>
        <Button variant="outline">Настроить</Button>
        <Button variant="ghost" icon={DotsThreeIcon} aria-label="Ещё" />
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
      <DemoLine label="Ghost">
        <div className="sc-posts">
          <PostExample />
          <PostExample wrong />
        </div>
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 3,
  title: "Кнопки",
  description: "Главная — всегда чёрная. Одна главная кнопка на экран. Фокус — оранжевое кольцо (Tab). Невидимая (ghost) — только значок без текста; действие с текстом всегда с фоном или рамкой, «назад» — маленькая с рамкой и стрелкой.",
  Demo: ButtonsDemo,
} satisfies ShowcaseSection;
