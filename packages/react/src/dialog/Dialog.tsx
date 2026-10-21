import { useId, type ReactNode } from "react";
import { MonoLabel } from "../marks/marks.js";
import { Overlay } from "../overlay/Overlay.js";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Заголовок — он же имя окна для экранного диктора. */
  title: string;
  /** Служебная метка над заголовком, например «Удаление». */
  eyebrow?: string;
  /** Кнопки внизу справа. Первая кнопка получает фокус, если нет элемента с `data-autofocus`. */
  actions?: ReactNode;
  /** Клик по затемнённому фону закрывает окно. По умолчанию да. */
  closeOnBackdrop?: boolean;
  children?: ReactNode;
}

/** Модальное окно: фокус внутри, Esc и фон закрывают, фон не прокручивается. */
export function Dialog({ open, onClose, title, eyebrow, actions, closeOnBackdrop, children }: DialogProps) {
  const titleId = useId();
  return (
    <Overlay open={open} onClose={onClose} closeOnBackdrop={closeOnBackdrop} labelledBy={titleId} placement="center" className="yk-dialog">
      {eyebrow && <MonoLabel>{eyebrow}</MonoLabel>}
      <h2 id={titleId} className="yk-dialog__title">{title}</h2>
      {children != null && <div className="yk-dialog__body">{children}</div>}
      {actions && <div className="yk-dialog__actions">{actions}</div>}
    </Overlay>
  );
}
