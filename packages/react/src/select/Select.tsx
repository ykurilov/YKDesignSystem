import { CaretDownIcon } from "@phosphor-icons/react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { FieldFrame } from "../field/FieldFrame.js";
import { useField, type FieldBaseProps } from "../field/useField.js";
import { Icon } from "../icon/Icon.js";

export interface SelectProps extends FieldBaseProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {}

/** Выпадающий список на нативном select: на телефоне открывается системный выбор. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, size = "md", className, id, disabled, children, ...rest },
  ref,
) {
  const { controlProps, frameProps } = useField({ id, label, hint, error, "aria-label": rest["aria-label"], "aria-labelledby": rest["aria-labelledby"], "aria-describedby": rest["aria-describedby"] });
  return (
    <FieldFrame
      {...frameProps}
      size={size}
      disabled={disabled}
      className={className}
      trailing={<Icon icon={CaretDownIcon} size={14} className="yk-input__caret" />}
    >
      <select ref={ref} className="yk-input__control yk-input__control--select" disabled={disabled} {...rest} {...controlProps}>
        {children}
      </select>
    </FieldFrame>
  );
});
