import type { ComponentType } from "react";

/** Раздел витрины. Новый раздел — новый файл в src/sections/ с `export default { … } satisfies ShowcaseSection`. */
export interface ShowcaseSection {
  /** Место на странице и номер в заголовке (01, 02…). */
  order: number;
  title: string;
  description?: string;
  Demo: ComponentType;
}

const modules = import.meta.glob<{ default: ShowcaseSection }>("../sections/*.tsx", { eager: true });

export const sections: ShowcaseSection[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order);
