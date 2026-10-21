import { Button, Card, EmptyState, Skeleton } from "@ykurilov/ds-react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function EmptyLoadingDemo() {
  return (
    <div className="sc-cols sc-cols--2-1">
      <EmptyState
        label="Проектов · 0"
        title="Здесь пока пусто"
        description="Создайте проект сами или опишите задачу агенту — он соберёт черновик."
        actions={<><Button variant="secondary">Спросить агента</Button><Button>Создать проект</Button></>}
      />
      <Card><Skeleton lines={["60%", "90%", "75%", "40%"]} label="Загружаем проект" /></Card>
    </div>
  );
}

export default {
  order: 9,
  title: "Пусто и загрузка",
  description: "Пустой экран объясняет, что делать. Загрузка мерцает; при «уменьшить движение» — без анимации.",
  Demo: EmptyLoadingDemo,
} satisfies ShowcaseSection;
