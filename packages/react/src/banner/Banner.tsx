import { InfoIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon } from "../icon/Icon.js";
import { Sphere } from "../sphere/Sphere.js";

export type BannerTone = "neutral" | "agent" | "danger";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** neutral — обычное сообщение, agent — сообщение от агента (сфера), danger — ошибка. */
  tone?: BannerTone;
  /** Короткая жирная фраза в начале. */
  title?: ReactNode;
}

/** Баннер-сообщение на всю ширину блока. Ошибка читается диктором сразу (`role="alert"`). */
export function Banner({ tone = "neutral", title, className, children, ...rest }: BannerProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={classNames("yk-banner", `yk-banner--${tone}`, className)}
      {...rest}
    >
      <span className="yk-banner__mark">
        {tone === "agent" ? <Sphere size={18} /> : <Icon icon={tone === "danger" ? WarningCircleIcon : InfoIcon} size={20} />}
      </span>
      <div className="yk-banner__text">
        {title != null && <b className="yk-banner__title">{title}</b>}
        {title != null && children != null && " "}
        {children}
      </div>
    </div>
  );
}
