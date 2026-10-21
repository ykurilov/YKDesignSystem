import { forwardRef, useCallback, useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";
import { FieldFrame } from "../field/FieldFrame.js";
import { useField, type FieldBaseProps } from "../field/useField.js";
import { mergeRefs } from "../mergeRefs.js";

export interface TextareaProps extends FieldBaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Высота растёт вместе с текстом. */
  autoGrow?: boolean;
}

/** Многострочное поле. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, size = "md", autoGrow = false, rows = 3, className, id, disabled, onInput, value, ...rest },
  ref,
) {
  const { controlProps, frameProps } = useField({ id, label, hint, error, "aria-label": rest["aria-label"], "aria-labelledby": rest["aria-labelledby"], "aria-describedby": rest["aria-describedby"] });
  const inner = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = inner.current;
    if (!autoGrow || !el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  useLayoutEffect(fit, [fit, value]);

  const handleInput: NonNullable<TextareaProps["onInput"]> = (event) => {
    fit();
    onInput?.(event);
  };

  return (
    <FieldFrame {...frameProps} size={size} disabled={disabled} multiline className={className}>
      <textarea
        ref={mergeRefs(inner, ref)}
        className="yk-input__control"
        rows={rows}
        disabled={disabled}
        value={value}
        onInput={handleInput}
        {...rest}
        {...controlProps}
      />
    </FieldFrame>
  );
});
