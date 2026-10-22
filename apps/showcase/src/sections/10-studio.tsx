import { useState } from "react";
import { Button, MonoLabel, ScrollArea, Sphere, Steps, StudioLayout } from "@ykurilov/ds-react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function StudioDemo() {
  const [journalOpen, setJournalOpen] = useState(false);
  return (
    <div style={{ height: 600, minWidth: 0 }}>
      <StudioLayout
        navigation={<Sphere size={28} />}
        header={<><span>Студия · рабочая область</span><Button size="sm" variant="secondary" onClick={() => setJournalOpen(true)}>Журнал</Button></>}
        inspector={{ title: "Журнал", open: journalOpen, onClose: () => setJournalOpen(false), content:
          <ScrollArea label="События журнала">
            <Steps total={5} done={3} tone="live" label="Этап 3 из 5" />
            {Array.from({ length: 12 }, (_, n) => <div className="sc-studio-event" key={n}>
              <MonoLabel>Событие {String(n + 1).padStart(2, "0")}</MonoLabel>
              <p>Параметры запроса и результат остаются отделены от скроллбара.</p>
            </div>)}
          </ScrollArea>,
        }}>
        <ScrollArea label="Содержимое рабочей области">
          <MonoLabel>Переиспользуемая композиция</MonoLabel>
          <h3 className="sc-studio-title">Работа и её ход — рядом</h3>
          <p className="sc-studio-copy">Основное содержимое и журнал прокручиваются независимо. Нижняя панель остаётся на месте. На телефоне журнал открывается кнопкой в шторке.</p>
          {Array.from({ length: 5 }, (_, n) => <p className="sc-studio-copy" key={n}>Здесь приложение размещает своё содержимое: документ, результаты задачи или настоящий чат из Agent Chat SDK. Компоновка не дублирует поведение чата.</p>)}
        </ScrollArea>
        <footer className="sc-studio-footer"><Sphere size={20} /><span>Нижняя панель закреплена</span></footer>
      </StudioLayout>
    </div>
  );
}

export default {
  order: 10,
  title: "Студия",
  description: "Мягкие поверхности и отдельная прокрутка. На телефоне журнал становится шторкой с управлением с клавиатуры.",
  Demo: StudioDemo,
} satisfies ShowcaseSection;
