import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon } from "../icon/Icon.js";
import { MonoLabel } from "../marks/marks.js";

export interface StatChange {
  direction: "up" | "down";
  /** Например «12% за неделю». */
  text: string;
}

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  /** Мелкая единица или «из скольких» после числа: «/ 64», «ч». */
  unit?: string;
  change?: StatChange;
  /** Число цветом акцента — для главного счётчика. */
  accent?: boolean;
}

/** Счётчик: метка, крупное моноширинное число, единица и изменение со значком. */
export function Stat({ label, value, unit, change, accent = false, className, ...rest }: StatProps) {
  return (
    <div className={classNames("yk-stat", className)} {...rest}>
      <MonoLabel>{label}</MonoLabel>
      <span className={classNames("yk-stat__value", accent && "yk-stat__value--accent")}>
        {value}
        {unit && <small className="yk-stat__unit">{unit}</small>}
      </span>
      {change && (
        <span className={classNames("yk-stat__change", `yk-stat__change--${change.direction}`)}>
          <Icon icon={change.direction === "up" ? TrendUpIcon : TrendDownIcon} size={13} />
          <span className="yk-visually-hidden">{change.direction === "up" ? "Рост:" : "Падение:"}</span>
          <span>{change.text}</span>
        </span>
      )}
    </div>
  );
}

/** Ряд счётчиков в одной рамке, с разделителями. */
export function StatGroup({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames("yk-stat-group", className)} {...rest} />;
}
