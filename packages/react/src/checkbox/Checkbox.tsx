import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import { forwardRef, useEffect, useMemo, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon } from "../icon/Icon.js";
import { mergeRefs } from "../mergeRefs.js";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "children"> {
  /** Текст рядом с флажком. Без него нужен aria-label. */
  children?: ReactNode;
  /** Частично выбран (например, «выбрать все», когда отмечены не все). После клика становится выбранным. */
  indeterminate?: boolean;
}

/** Флажок. Включённый — оранжевый. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, indeterminate = false, className, disabled, ...rest },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  const mergedRef = useMemo(() => mergeRefs(inner, ref), [ref]);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const unnamed = children == null && !rest["aria-label"] && !rest["aria-labelledby"];
  useEffect(() => {
    if (unnamed) console.warn("YKDesignSystem: у флажка без текста должен быть aria-label.");
  }, [unnamed]);

  return (
    <label className={classNames("yk-choice", disabled && "yk-choice--disabled", className)}>
      <span className="yk-check">
        <input ref={mergedRef} type="checkbox" className="yk-check__input" disabled={disabled} {...rest} />
        <Icon icon={CheckIcon} size={14} className="yk-check__mark yk-check__mark--checked" />
        <Icon icon={MinusIcon} size={14} className="yk-check__mark yk-check__mark--mixed" />
      </span>
      {children != null && <span className="yk-choice__text">{children}</span>}
    </label>
  );
});
