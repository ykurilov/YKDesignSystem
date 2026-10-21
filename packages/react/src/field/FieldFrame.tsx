import type { MouseEvent, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import type { FieldSize } from "./useField.js";

export interface FieldFrameProps {
  label: ReactNode;
  labelFor: string;
  hint: ReactNode;
  hintId: string;
  errorText: ReactNode;
  errorId: string;
  invalid: boolean;
  size: FieldSize;
  disabled?: boolean;
  multiline?: boolean;
  icon?: IconComponent;
  /** Правая часть рамки: подсказка клавиши, кнопка очистки, стрелка списка. */
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
}

const ICON_SIZE: Record<FieldSize, number> = { sm: 14, md: 16 };

/** Клик по значку или пустому месту рамки ставит курсор в поле. */
function focusControl(event: MouseEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if (target.closest(".yk-input__control, button")) return;
  const control = event.currentTarget.querySelector<HTMLElement>(".yk-input__control");
  if (!control) return;
  event.preventDefault();
  control.focus();
}

/** Подпись, рамка поля и сообщения под ним. Само поле приходит в children. */
export function FieldFrame(props: FieldFrameProps) {
  const { label, labelFor, hint, hintId, errorText, errorId, invalid, size, disabled, multiline, icon, trailing, className, children } = props;
  return (
    <div className={classNames("yk-field", className)}>
      {label != null && label !== false && (
        <label className="yk-mono-label yk-field__label" htmlFor={labelFor}>{label}</label>
      )}
      <div
        className={classNames(
          "yk-input",
          `yk-input--${size}`,
          invalid && "yk-input--invalid",
          disabled && "yk-input--disabled",
          multiline && "yk-input--multiline",
        )}
        onMouseDown={focusControl}
      >
        {icon && <Icon icon={icon} size={ICON_SIZE[size]} className="yk-input__icon" />}
        {children}
        {trailing}
      </div>
      {hint && <span id={hintId} className="yk-field__hint">{hint}</span>}
      {errorText && <span id={errorId} className="yk-field__hint yk-field__hint--error">{errorText}</span>}
    </div>
  );
}
