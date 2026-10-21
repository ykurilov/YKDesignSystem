import { CaretRightIcon } from "@phosphor-icons/react";
import type { HTMLAttributes, LiHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { MonoNum, NewDot } from "../marks/marks.js";

/** Список строк в одной рамке. */
export function List({ className, ...rest }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={classNames("yk-list", className)} {...rest} />;
}

export interface ListRowProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title" | "onClick"> {
  /** Значок в плашке слева. */
  icon?: IconComponent;
  title: ReactNode;
  /** Подпись мелким серым под заголовком. */
  caption?: ReactNode;
  /** Выбранная строка: полоска акцента слева и мягкая подсветка. */
  selected?: boolean;
  /** Точка «есть новое». */
  isNew?: boolean;
  /** Число справа, моноширинное. */
  count?: number | string;
  /** Что угодно справа вместо стрелки: переключатель, метка. Тогда строка сама не нажимается. */
  trailing?: ReactNode;
  /** Строка-ссылка. */
  href?: string;
  /** Строка-кнопка. */
  onClick?: MouseEventHandler<HTMLElement>;
}

/** Строка списка. С `href` или `onClick` вся строка нажимается и доступна с клавиатуры. */
export function ListRow({
  icon, title, caption, selected = false, isNew = false, count, trailing, href, onClick, className, ...rest
}: ListRowProps) {
  const interactive = href != null || onClick != null;
  const current = selected ? { "aria-current": "true" as const } : {};
  const content = (
    <>
      {icon && (
        <span className="yk-list-row__icon"><Icon icon={icon} size={16} /></span>
      )}
      <span className="yk-list-row__text">
        <span className="yk-list-row__title">{title}</span>
        {caption != null && <span className="yk-list-row__caption">{caption}</span>}
      </span>
      {isNew && <NewDot label="Есть новое" />}
      {count != null && <MonoNum className="yk-list-row__count">{count}</MonoNum>}
      {trailing}
      {interactive && trailing == null && (
        <span className="yk-list-row__chevron"><Icon icon={CaretRightIcon} size={14} /></span>
      )}
    </>
  );

  return (
    <li className={classNames("yk-list-row", interactive && "yk-list-row--interactive", className)} data-selected={selected || undefined} {...rest}>
      {href != null ? (
        <a className="yk-list-row__body" href={href} onClick={onClick} {...current}>{content}</a>
      ) : onClick ? (
        <button type="button" className="yk-list-row__body" onClick={onClick} {...current}>{content}</button>
      ) : (
        <div className="yk-list-row__body">{content}</div>
      )}
    </li>
  );
}
