import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";
import { NewDot } from "../marks/marks.js";
import { Sphere } from "../sphere/Sphere.js";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Имя человека или агента — для экранного диктора и букв по умолчанию. */
  name: string;
  /** Буквы. По умолчанию — первые буквы двух первых слов имени. */
  initials?: string;
  /** md — 32px, sm — 24px. */
  size?: "sm" | "md";
  /** Точка «есть новое». */
  hasNew?: boolean;
  /** Агент: сфера на «чернилах» вместо букв. */
  agent?: boolean;
}

const SPHERE_SIZE = { sm: 14, md: 18 } as const;

export function Avatar({ name, initials, size = "md", hasNew = false, agent = false, className, ...rest }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={hasNew ? `${name}, есть новое` : name}
      className={classNames("yk-avatar", `yk-avatar--${size}`, agent && "yk-avatar--agent", className)}
      {...rest}
    >
      {agent ? <Sphere size={SPHERE_SIZE[size]} /> : <span aria-hidden="true">{initials ?? initialsOf(name)}</span>}
      {hasNew && <NewDot className="yk-avatar__new" />}
    </span>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}
