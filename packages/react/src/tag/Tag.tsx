import { XIcon } from "@phosphor-icons/react";
import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";

interface TagBaseProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  children: ReactNode;
  icon?: IconComponent;
}

interface RemovableTagProps extends TagBaseProps {
  /** Показывает крестик-удаление. */
  onRemove?: () => void;
  /** Имя крестика для экранного диктора. По умолчанию «Удалить «<текст>»». */
  removeLabel?: string;
  onClick?: undefined;
}

interface ActionTagProps extends TagBaseProps {
  /** Тег-кнопка, например «+ тег». */
  onClick: MouseEventHandler<HTMLButtonElement>;
  onRemove?: undefined;
  removeLabel?: undefined;
}

export type TagProps = RemovableTagProps | ActionTagProps;

/** Тег-«таблетка»: метка пользователя, можно удалить крестиком. */
export function Tag({ children, icon, onRemove, removeLabel, onClick, className, ...rest }: TagProps) {
  const leading = icon && <Icon icon={icon} size={12} />;

  if (onClick) {
    return (
      <button type="button" className={classNames("yk-tag", "yk-tag--action", icon && "yk-tag--with-icon", className)} onClick={onClick} {...rest}>
        {leading}
        {children}
      </button>
    );
  }

  return (
    <span className={classNames("yk-tag", onRemove && "yk-tag--removable", icon && "yk-tag--with-icon", className)} {...rest}>
      {leading}
      {children}
      {onRemove && (
        <button
          type="button"
          className="yk-tag__remove"
          aria-label={removeLabel ?? `Удалить «${typeof children === "string" ? children : "тег"}»`}
          onClick={onRemove}
        >
          <Icon icon={XIcon} size={12} />
        </button>
      )}
    </span>
  );
}
