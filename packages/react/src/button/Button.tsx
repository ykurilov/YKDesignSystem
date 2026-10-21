import { forwardRef, useEffect, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, type Ref, type RefAttributes } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { Sphere } from "../sphere/Sphere.js";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
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

/** Либо текст, либо только значок (тогда имя обязательно). */
type ButtonContent =
  | { children: ReactNode }
  | {
      children?: undefined;
      icon: IconComponent;
      /** Кнопке без текста имя обязательно. */
      "aria-label": string;
    };

export type ButtonAsButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { href?: undefined } & ButtonContent;

export type ButtonAsLinkProps = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    /** С `href` кнопка рендерится ссылкой `<a>` с тем же видом. */
    href: string;
    disabled?: boolean;
  } & ButtonContent;

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

interface ButtonComponent {
  (props: ButtonAsButtonProps & RefAttributes<HTMLButtonElement>): ReactElement | null;
  (props: ButtonAsLinkProps & RefAttributes<HTMLAnchorElement>): ReactElement | null;
  displayName?: string;
}

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

/** Общий вид свойств под капотом: наружу Button показывает перегрузки ButtonAsButtonProps / ButtonAsLinkProps. */
type AnyProps = ButtonOwnProps & Omit<HTMLAttributes<HTMLElement>, "children"> & {
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  target?: string;
  rel?: string;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, AnyProps>(function Button(
  { variant = "primary", size = "md", loading = false, icon, kbd, children, className, type = "button", onClick, href, disabled, ...rest },
  ref,
) {
  const iconOnly = children === undefined || children === null;
  const missingLabel = iconOnly && !rest["aria-label"] && !rest["aria-labelledby"];

  useEffect(() => {
    if (missingLabel) console.warn("YKDesignSystem: у кнопки без текста должен быть aria-label.");
  }, [missingLabel]);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (loading || (href !== undefined && disabled)) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const leading = loading
    ? <Sphere size={ICON_SIZE[size]} color="currentColor" />
    : icon && <Icon icon={icon} size={ICON_SIZE[size]} />;

  const shared = {
    className: classNames(
      "yk-button",
      `yk-button--${variant}`,
      `yk-button--${size}`,
      iconOnly && "yk-button--icon-only",
      leading && "yk-button--leading",
      className,
    ),
    "aria-busy": loading || undefined,
    onClick: handleClick,
    ...rest,
  };
  const content = (
    <>
      {leading}
      {children}
      {kbd != null && <kbd className="yk-button__kbd">{kbd}</kbd>}
    </>
  );

  if (href !== undefined) {
    const inactive = loading || disabled;
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        aria-disabled={inactive || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...shared}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      {...shared}
    >
      {content}
    </button>
  );
}) as unknown as ButtonComponent;
