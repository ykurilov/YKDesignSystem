import { useRef, useState, type HTMLAttributes, type KeyboardEvent } from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";

export interface SegmentOption {
  value: string;
  label: string;
  icon?: IconComponent;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "role"> {
  options: readonly SegmentOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";
  disabled?: boolean;
}

/** Группа выбора из нескольких вариантов. Стрелки двигают выбор. Активный — текст акцента. */
export function SegmentedControl({ options, value, defaultValue, onValueChange, size = "md", disabled = false, className, onKeyDown, ...rest }: SegmentedControlProps) {
  const [inner, setInner] = useState(defaultValue ?? options.find((o) => !o.disabled)?.value);
  const current = value !== undefined ? value : inner;
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (next: string) => {
    if (value === undefined) setInner(next);
    if (next !== current) onValueChange?.(next);
  };

  const enabled = options.map((o, i) => (o.disabled || disabled ? -1 : i)).filter((i) => i >= 0);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || enabled.length === 0) return;
    const at = enabled.indexOf(buttons.current.indexOf(document.activeElement as HTMLButtonElement));
    let target: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") target = enabled[(at + 1) % enabled.length];
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") target = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (event.key === "Home") target = enabled[0];
    else if (event.key === "End") target = enabled[enabled.length - 1];
    if (target === undefined) return;
    event.preventDefault();
    buttons.current[target]?.focus();
    select(options[target]!.value);
  };

  const tabStop = options.some((o) => o.value === current && !o.disabled) ? current : options[enabled[0] ?? 0]?.value;

  return (
    <div role="radiogroup" className={classNames("yk-segmented", `yk-segmented--${size}`, className)} onKeyDown={handleKeyDown} {...rest}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(node) => { buttons.current[index] = node; }}
          type="button"
          role="radio"
          aria-checked={option.value === current}
          tabIndex={option.value === tabStop ? 0 : -1}
          disabled={disabled || option.disabled}
          className="yk-segmented__item"
          onClick={() => select(option.value)}
        >
          {option.icon && <Icon icon={option.icon} size={size === "sm" ? 13 : 14} />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
