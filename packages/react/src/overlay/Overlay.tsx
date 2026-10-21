import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { classNames } from "../classNames.js";
import { useModalBehavior } from "./useModalBehavior.js";

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  /** Клик по затемнённому фону закрывает окно. */
  closeOnBackdrop?: boolean;
  /** id заголовка внутри окна — становится именем окна. */
  labelledBy: string;
  /** center — окно по центру, bottom — шторка снизу. */
  placement: "center" | "bottom";
  className?: string;
  children: ReactNode;
}

/** Затемнённый фон и модальная панель с фокус-ловушкой. Основа для Dialog и Sheet. */
export function Overlay({ open, onClose, closeOnBackdrop = true, labelledBy, placement, className, children }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressStartedOnBackdrop = useRef(false);
  useModalBehavior({ open, onClose, containerRef: panelRef });

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={classNames("yk-overlay", `yk-overlay--${placement}`)}
      data-testid="yk-overlay"
      onMouseDown={(event) => { pressStartedOnBackdrop.current = event.target === event.currentTarget; }}
      onClick={(event) => {
        // Выделение текста, начатое в окне и законченное на фоне, окно не закрывает
        if (closeOnBackdrop && pressStartedOnBackdrop.current && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={className}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
