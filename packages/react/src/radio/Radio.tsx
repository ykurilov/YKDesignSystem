import { createContext, forwardRef, useContext, useId, useState, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { classNames } from "../classNames.js";

interface RadioGroupContext {
  name: string;
  value: string | undefined;
  disabled: boolean;
  select: (value: string) => void;
}

const GroupContext = createContext<RadioGroupContext | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "children" | "value"> {
  value: string;
  children?: ReactNode;
}

/** Радиокнопка. Внутри RadioGroup имя и выбор берутся от группы. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { children, className, disabled, onChange, value, ...rest },
  ref,
) {
  const group = useContext(GroupContext);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (group && event.target.checked) group.select(value);
  };
  const groupProps = group ? { name: group.name, checked: group.value === value } : {};
  const isDisabled = disabled || group?.disabled;
  return (
    <label className={classNames("yk-choice", isDisabled && "yk-choice--disabled", className)}>
      <input
        ref={ref}
        type="radio"
        className="yk-radio"
        value={value}
        disabled={isDisabled}
        onChange={handleChange}
        {...rest}
        {...groupProps}
      />
      {children != null && <span className="yk-choice__text">{children}</span>}
    </label>
  );
});

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Подпись группы (моноширинная метка). Без неё нужен aria-label. */
  label?: ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

/** Группа радиокнопок: общее имя, выбор, стрелки клавиатуры (родная работа браузера). */
export function RadioGroup({ label, name, value, defaultValue, onValueChange, disabled = false, orientation = "vertical", className, children, ...rest }: RadioGroupProps) {
  const autoName = useId();
  const labelId = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;

  const select = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const labelled = label != null && !rest["aria-label"] && !rest["aria-labelledby"];

  return (
    <GroupContext.Provider value={{ name: name ?? autoName, value: current, disabled, select }}>
      <div
        role="radiogroup"
        className={classNames("yk-radio-group", `yk-radio-group--${orientation}`, className)}
        aria-labelledby={labelled ? labelId : undefined}
        {...rest}
      >
        {label != null && <span id={labelId} className="yk-mono-label yk-radio-group__label">{label}</span>}
        <div className="yk-radio-group__items">{children}</div>
      </div>
    </GroupContext.Provider>
  );
}
