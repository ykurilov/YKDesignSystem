import { MonoLabel } from "@ykurilov/ds-react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

const SWATCHES = [
  { name: "Фон", variable: "--yk-bg" },
  { name: "Поверхность", variable: "--yk-surface-2" },
  { name: "Чернила", variable: "--yk-ink" },
  { name: "Акцент", variable: "--yk-accent" },
  { name: "Ошибка", variable: "--yk-danger" },
  { name: "Успех", variable: "--yk-success" },
];

function ColorsDemo() {
  return (
    <div className="sc-swatches">
      {SWATCHES.map(({ name, variable }) => (
        <div key={variable} className="sc-swatch">
          <i style={{ background: `var(${variable})` }} />
          <div>
            <b>{name}</b>
            <MonoLabel>{variable}</MonoLabel>
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  order: 1,
  title: "Цвета",
  description: "Основа бесцветная. Оранжевый — акцент. Ошибка нарочно холоднее и темнее, чтобы не путать «важно» и «сломалось».",
  Demo: ColorsDemo,
} satisfies ShowcaseSection;
