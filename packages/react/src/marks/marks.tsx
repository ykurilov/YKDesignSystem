import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";

export interface NewDotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Подпись для экранного диктора. Без неё точка декоративная. */
  label?: string;
}

/** Точка «есть новое, не просмотрено». Не анимируется. */
export function NewDot({ label, className, ...rest }: NewDotProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return <span className={classNames("yk-new-dot", className)} {...a11y} {...rest} />;
}

/** Служебная метка моноширинным капсом. Только для меток — не для обычного текста. */
export function MonoLabel({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={classNames("yk-mono-label", className)} {...rest} />;
}

/** Число моноширинным шрифтом с цифрами одной ширины. */
export function MonoNum({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={classNames("yk-mono-num", className)} {...rest} />;
}
