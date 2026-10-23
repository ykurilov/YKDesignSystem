import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";

export interface ChatProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Видимая подпись и имя для диктора: «Шаг 2 из 3», «Готово». */
  label: string;
  value: number;
  max?: number;
}

/** Ход работы для шапки чата: подпись и полоска. На максимуме — цвет успеха. */
export function ChatProgress({ label, value, max = 100, className, ...rest }: ChatProgressProps) {
  const current = Math.min(Math.max(value, 0), max);
  const complete = current >= max;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={current}
      className={classNames("yk-chat-progress", complete && "yk-chat-progress--complete", className)} {...rest}>
      <span className="yk-chat-progress__label" aria-hidden="true">{label}</span>
      <span className="yk-chat-progress__track"><span className="yk-chat-progress__fill" style={{ width: `${(current / max) * 100}%` }} /></span>
    </div>
  );
}
