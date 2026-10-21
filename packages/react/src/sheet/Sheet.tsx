import { useId, type ReactNode } from "react";
import { Overlay } from "../overlay/Overlay.js";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** Заголовок — он же имя шторки для экранного диктора. */
  title: string;
  /** Клик по затемнённому фону закрывает шторку. По умолчанию да. */
  closeOnBackdrop?: boolean;
  children?: ReactNode;
}

/** Шторка снизу для телефона. Правила доступности те же, что у Dialog. */
export function Sheet({ open, onClose, title, closeOnBackdrop, children }: SheetProps) {
  const titleId = useId();
  return (
    <Overlay open={open} onClose={onClose} closeOnBackdrop={closeOnBackdrop} labelledBy={titleId} placement="bottom" className="yk-sheet">
      <i className="yk-sheet__grip" aria-hidden="true" />
      <h2 id={titleId} className="yk-sheet__title">{title}</h2>
      {children}
    </Overlay>
  );
}
