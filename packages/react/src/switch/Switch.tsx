import { forwardRef, useId, useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { classNames } from "../classNames.js";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role" | "children" | "onChange" | "value" | "defaultValue"> {
  /** Текст рядом. Без него нужен aria-label. */
  children?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** Переключатель «включено / выключено». Включённый — оранжевый. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { children, checked, defaultChecked = false, onCheckedChange, className, disabled, onClick, id, ...rest },
  ref,
) {
  const auto = useId();
  const buttonId = id ?? auto;
  const textId = `${buttonId}-text`;
  const [inner, setInner] = useState(defaultChecked);
  const isOn = checked !== undefined ? checked : inner;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const next = !isOn;
    if (checked === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  return (
    <div className={classNames("yk-choice", disabled && "yk-choice--disabled", className)}>
      <button
        ref={ref}
        id={buttonId}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-labelledby={children != null && !rest["aria-label"] ? textId : undefined}
        className="yk-switch"
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        <span className="yk-switch__thumb" aria-hidden="true" />
      </button>
      {children != null && <label id={textId} htmlFor={buttonId} className="yk-choice__text">{children}</label>}
    </div>
  );
});
