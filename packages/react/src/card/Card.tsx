import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { MonoLabel } from "../marks/marks.js";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: string;
  /** Метка статуса справа от заголовка, например `<Chip>`. */
  status?: ReactNode;
  /** Служебная подпись под заголовком, моноширинным капсом. */
  caption?: string;
}

/** Карточка: поверхность с рамкой и умеренным углом. */
export function Card({ title, status, caption, className, children, ...rest }: CardProps) {
  const hasHeader = title != null || status != null;
  return (
    <div className={classNames("yk-card", className)} {...rest}>
      {hasHeader && (
        <div className="yk-card__top">
          {title != null && <h3 className="yk-card__title">{title}</h3>}
          {status}
        </div>
      )}
      {caption && <MonoLabel className="yk-card__caption">{caption}</MonoLabel>}
      {children}
    </div>
  );
}
