import { MonoLabel } from "@ykurilov/ds-react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

const STYLES = [
  { label: "Экран · 30", className: "sc-t-display", sample: "Проекты" },
  { label: "Раздел · 22", className: "sc-t-title", sample: "План рассылки" },
  { label: "Заголовок · 17", className: "sc-t-heading", sample: "Лендинг вебинара" },
  { label: "Текст · 15", className: "sc-t-body", sample: "Агент прочитал лендинг и предлагает пять писем: от анонса до напоминания в день эфира." },
  { label: "Мелкий · 13", className: "sc-t-small", sample: "Обновлено 2 часа назад" },
  { label: "Метка · 11", className: "yk-mono-label", sample: "Рабочее пространство · 12" },
  { label: "Число · 24", className: "sc-t-num", sample: "27 / 64" },
];

function TypeDemo() {
  return (
    <div className="sc-stack sc-type">
      {STYLES.map(({ label, className, sample }) => (
        <div key={label} className="sc-type__row">
          <MonoLabel>{label}</MonoLabel>
          <span className={className}>{sample}</span>
        </div>
      ))}
    </div>
  );
}

export default {
  order: 2,
  title: "Шрифт",
  description: "Системный шрифт для всего текста. Моноширинный капс — только метки и цифры.",
  Demo: TypeDemo,
} satisfies ShowcaseSection;
