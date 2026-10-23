import { useState } from "react";
import { Button, ChatHeader, ChatProgress, CompletionCard } from "@ykurilov/ds-react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function ChatPartsDemo() {
  const [done, setDone] = useState(true);
  return (
    <div className="sc-chat-parts">
      <ChatHeader title="Помощник магазина" headingLevel={3}
        aside={done ? <ChatProgress label="Готово" value={3} max={3} /> : <ChatProgress label="Шаг 2 из 3" value={2} max={3} />} />
      <div className="yk-chat-column sc-chat-parts__body">
        {done ? <CompletionCard title="Заказ оформлен" description="Курьер позвонит за час до доставки."
          items={[
            { id: "item", label: "Термокружка с подогревом", status: "done" },
            { id: "pay", label: "Оплата картой", status: "done" },
            { id: "delivery", label: "Доставка в пятницу, 10–14", status: "done" },
            { id: "postcard", label: "Открытка", status: "later", statusLabel: "позже" },
          ]}
          action={<Button variant="secondary" icon={PencilSimpleIcon} onClick={() => setDone(false)}>Изменить заказ</Button>}
          note="Номер заказа 48 213" />
          : <Button variant="secondary" onClick={() => setDone(true)}>Показать итог</Button>}
      </div>
    </div>
  );
}

export default {
  order: 11,
  title: "Части чата",
  description: "Колонка, шапка с ходом работы и карточка итога. Слова, пункты и статусы задаёт приложение.",
  Demo: ChatPartsDemo,
} satisfies ShowcaseSection;
