import { forwardRef, useEffect, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { Sphere } from "../sphere/Sphere.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** primary — всегда «чернила» (чёрная, в тёмной теме светлая). Одна главная кнопка на экран. */
  variant?: ButtonVariant;
  /** sm — 32px, md — 40px, lg — 48px (телефон). */
  size?: ButtonSize;
  /** Занята: сфера цвета текста, `aria-busy`, клики не проходят, фокус остаётся. */
  loading?: boolean;
  /** Значок перед текстом или единственное содержимое. */
  icon?: IconComponent;
  /** Подсказка клавиши, например `⌘N`. */
  kbd?: ReactNode;
}

interface TextButtonProps extends ButtonOwnProps {
  children: ReactNode;
}

interface IconOnlyButtonProps extends ButtonOwnProps {
  children?: undefined;
  icon: IconComponent;
  /** Кнопке без текста имя обязательно. */
  "aria-label": string;
}

export type ButtonProps = TextButtonProps | IconOnlyButtonProps;

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, kbd, children, className, type = "button", onClick, ...rest },
  ref,
) {
  const iconOnly = children === undefined || children === null;
  const missingLabel = iconOnly && !rest["aria-label"] && !rest["aria-labelledby"];

  useEffect(() => {
    if (missingLabel) console.warn("YKDesignSystem: у кнопки без текста должен быть aria-label.");
  }, [missingLabel]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const leading = loading
    ? <Sphere size={ICON_SIZE[size]} color="currentColor" />
    : icon && <Icon icon={icon} size={ICON_SIZE[size]} />;

  return (
    <button
      ref={ref}
      type={type}
      className={classNames(
        "yk-button",
        `yk-button--${variant}`,
        `yk-button--${size}`,
        iconOnly && "yk-button--icon-only",
        leading && "yk-button--leading",
        className,
      )}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {leading}
      {children}
      {kbd != null && <kbd className="yk-button__kbd">{kbd}</kbd>}
    </button>
  );
});
