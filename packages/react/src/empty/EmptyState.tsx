import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { MonoLabel } from "../marks/marks.js";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Служебная метка сверху, например «Проектов · 0». */
  label?: string;
  title: string;
  description?: ReactNode;
  /** Кнопки под текстом. */
  actions?: ReactNode;
}

/** Пустой экран: что здесь будет и что сделать. Рамка пунктиром. */
export function EmptyState({ label, title, description, actions, className, ...rest }: EmptyStateProps) {
  return (
    <div className={classNames("yk-empty", className)} {...rest}>
      {label && <MonoLabel>{label}</MonoLabel>}
      <h3 className="yk-empty__title">{title}</h3>
      {description != null && <p className="yk-empty__description">{description}</p>}
      {actions && <div className="yk-empty__actions">{actions}</div>}
    </div>
  );
}
