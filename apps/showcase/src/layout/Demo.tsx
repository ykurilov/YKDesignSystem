import { MonoLabel } from "@ykurilov/ds-react";
import type { ReactNode } from "react";

/** Строка примеров с подписью слева. */
export function DemoLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sc-line">
      <MonoLabel className="sc-line__label">{label}</MonoLabel>
      {children}
    </div>
  );
}

/** Столбец строк примеров. */
export function DemoStack({ children }: { children: ReactNode }) {
  return <div className="sc-stack">{children}</div>;
}
