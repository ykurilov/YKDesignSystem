import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { forwardRef, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { FieldFrame } from "../field/FieldFrame.js";
import { useField, type FieldBaseProps } from "../field/useField.js";
import { Icon } from "../icon/Icon.js";
import { mergeRefs } from "../mergeRefs.js";

export interface SearchFieldProps extends FieldBaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Подсказка клавиши, пока поле пустое. `null` — без подсказки. */
  kbd?: ReactNode;
  /** Имя кнопки очистки для экранного диктора. */
  clearLabel?: string;
  /** Поле очищено кнопкой или Escape. */
  onClear?: () => void;
}

const setNativeValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};

/** Поле поиска: лупа, подсказка ⌘K, очистка крестиком (и Escape). */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label, hint, error, size = "md", kbd = "⌘K", clearLabel = "Очистить", onClear, className, id, disabled, value, defaultValue, onChange, onKeyDown, ...rest },
  ref,
) {
  const { controlProps, frameProps } = useField({ id, label, hint, error, "aria-label": rest["aria-label"], "aria-labelledby": rest["aria-labelledby"], "aria-describedby": rest["aria-describedby"] });
  const inner = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState(String(defaultValue ?? ""));
  const hasValue = (value !== undefined ? String(value) : typed) !== "";

  const clear = () => {
    const input = inner.current;
    if (!input) return;
    setNativeValue(input, "");
    input.focus();
    onClear?.();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTyped(event.target.value);
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape" && hasValue && !event.defaultPrevented) {
      event.preventDefault();
      clear();
    }
  };

  const trailing = hasValue
    ? (
      <button type="button" className="yk-input__clear" aria-label={clearLabel} disabled={disabled} onClick={clear}>
        <Icon icon={XIcon} size={size === "sm" ? 12 : 14} />
      </button>
    )
    : kbd != null && <kbd className="yk-input__kbd">{kbd}</kbd>;

  return (
    <FieldFrame {...frameProps} size={size} disabled={disabled} icon={MagnifyingGlassIcon} className={className} trailing={trailing}>
      <input
        ref={mergeRefs(inner, ref)}
        type="search"
        className="yk-input__control"
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
        {...controlProps}
      />
    </FieldFrame>
  );
});
