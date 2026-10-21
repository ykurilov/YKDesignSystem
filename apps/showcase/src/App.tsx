import { MonoLabel } from "@ykurilov/ds-react";
import { sections } from "./layout/sectionRegistry.js";
import { ThemeSwitch } from "./layout/ThemeSwitch.js";

export function App() {
  return (
    <main className="sc-page">
      <header className="sc-page__head">
        <div>
          <MonoLabel>YKDesignSystem · витрина</MonoLabel>
          <h1>Базовые элементы</h1>
        </div>
        <ThemeSwitch />
      </header>
      {sections.map(({ order, title, description, Demo }) => (
        <section key={order} className="sc-section" aria-labelledby={`section-${order}`}>
          <header>
            <MonoLabel>{String(order).padStart(2, "0")}</MonoLabel>
            <h2 id={`section-${order}`}>{title}</h2>
            {description && <p>{description}</p>}
          </header>
          <div className="sc-section__demo">
            <Demo />
          </div>
        </section>
      ))}
    </main>
  );
}
