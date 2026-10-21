import type { HTMLAttributes } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { Sphere } from "../sphere/Sphere.js";

export type ChipTone = "neutral" | "live" | "success" | "danger" | "solid";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** live — «в работе», сфера ставится сама. */
  tone?: ChipTone;
  icon?: IconComponent;
}

/** Метка статуса моноширинным капсом. */
export function Chip({ tone = "neutral", icon, className, children, ...rest }: ChipProps) {
  return (
    <span className={classNames("yk-chip", `yk-chip--${tone}`, icon && tone !== "live" && "yk-chip--with-icon", className)} {...rest}>
      {tone === "live" ? <Sphere size={12} /> : icon && <Icon icon={icon} size={12} />}
      {children}
    </span>
  );
}
