import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";

export interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  total: number;
  done: number;
  /** live — идёт работа, шаги оранжевые. */
  tone?: "default" | "live";
  /** Что именно продвигается — для экранного диктора. */
  label: string;
}

/** Прогресс шагами, а не сплошной полосой. */
export function Steps({ total, done, tone = "default", label, className, ...rest }: StepsProps) {
  const completed = Math.min(Math.max(done, 0), total);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      className={classNames("yk-steps", tone === "live" && "yk-steps--live", className)}
      {...rest}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={classNames("yk-steps__step", i < completed && "yk-steps__step--done")} />
      ))}
    </div>
  );
}
