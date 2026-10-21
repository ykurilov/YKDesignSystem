import { useEffect, useId, type ReactNode } from "react";

export type FieldSize = "sm" | "md";

/** Общие свойства полей ввода. */
export interface FieldBaseProps {
  /** Подпись над полем (моноширинная метка). Без неё нужен aria-label. */
  label?: ReactNode;
  /** Подсказка под полем. */
  hint?: ReactNode;
  /** Текст ошибки: поле становится красным, `aria-invalid`. `true` — красное без текста. */
  error?: ReactNode;
  /** sm — 32px, md — 40px. */
  size?: FieldSize;
}

interface FieldInput extends FieldBaseProps {
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const hasContent = (node: ReactNode) => node != null && node !== false && node !== "";

/** Связывает поле с подписью, подсказкой и ошибкой: id, aria-invalid, aria-describedby. */
export function useField(input: FieldInput) {
  const auto = useId();
  const id = input.id ?? auto;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const hint = hasContent(input.hint) ? input.hint : null;
  const invalid = hasContent(input.error);
  const errorText = typeof input.error === "boolean" || !invalid ? null : input.error;

  const unnamed = !hasContent(input.label) && !input["aria-label"] && !input["aria-labelledby"];
  useEffect(() => {
    if (unnamed) console.warn("YKDesignSystem: у поля должна быть подпись (label) или aria-label.");
  }, [unnamed]);

  const describedBy = [input["aria-describedby"], hint && hintId, errorText && errorId].filter(Boolean).join(" ") || undefined;

  return {
    invalid,
    controlProps: { id, "aria-invalid": invalid || undefined, "aria-describedby": describedBy },
    frameProps: { label: input.label, labelFor: id, hint, hintId, errorText, errorId, invalid },
  };
}
