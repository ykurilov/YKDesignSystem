import type { Icon as IconComponent, IconProps as PhosphorIconProps } from "@phosphor-icons/react";

export type { IconComponent };

export interface IconProps extends Omit<PhosphorIconProps, "weight" | "size" | "ref"> {
  /** Значок из @phosphor-icons/react, например `ArrowUpIcon`. */
  icon: IconComponent;
  /** Размер в px. */
  size?: number;
  /** `fill` — только для активного пункта навигации и кнопки «Стоп». */
  weight?: "regular" | "fill";
  /** Подпись для экранного диктора. Без неё значок декоративный. */
  label?: string;
}

/** Значок Phosphor с правилами системы: 16px, regular, по умолчанию скрыт от экранного диктора. */
export function Icon({ icon: Glyph, size = 16, weight = "regular", label, className, ...rest }: IconProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <Glyph
      size={size}
      weight={weight}
      focusable="false"
      className={className ? `yk-icon ${className}` : "yk-icon"}
      {...a11y}
      {...rest}
    />
  );
}
