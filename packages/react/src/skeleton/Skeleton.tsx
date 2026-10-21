import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Ширины полосок. По умолчанию три. */
  lines?: string[];
  /** Что услышит экранный диктор. */
  label?: string;
}

const DEFAULT_LINES = ["60%", "90%", "75%"];

/** Заглушка на время загрузки: мерцающие полоски. При «уменьшить движение» не мерцает. */
export function Skeleton({ lines = DEFAULT_LINES, label = "Загрузка", className, ...rest }: SkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={classNames("yk-skeleton", className)} {...rest}>
      {lines.map((width, index) => (
        <i key={index} className="yk-skeleton__line" style={{ width }} />
      ))}
    </div>
  );
}
