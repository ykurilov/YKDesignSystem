import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import type { IconComponent } from "../icon/Icon.js";
import { FieldFrame } from "../field/FieldFrame.js";
import { useField, type FieldBaseProps } from "../field/useField.js";

export interface TextFieldProps extends FieldBaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Значок слева. */
  icon?: IconComponent;
  /** Подсказка клавиши справа, например `⌘M`. */
  kbd?: ReactNode;
}

/** Однострочное поле: подпись, подсказка, ошибка, значок слева, подсказка клавиши справа. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, size = "md", icon, kbd, className, id, disabled, ...rest },
  ref,
) {
  const { controlProps, frameProps } = useField({ id, label, hint, error, "aria-label": rest["aria-label"], "aria-labelledby": rest["aria-labelledby"], "aria-describedby": rest["aria-describedby"] });
  return (
    <FieldFrame
      {...frameProps}
      size={size}
      disabled={disabled}
      icon={icon}
      className={className}
      trailing={kbd != null && <kbd className="yk-input__kbd">{kbd}</kbd>}
    >
      <input ref={ref} className="yk-input__control" disabled={disabled} {...rest} {...controlProps} />
    </FieldFrame>
  );
});
