import type { FocusEventHandler, MouseEventHandler } from "react";

export interface ToastProps {
  message: string;
  /** Текст кнопки действия, например «Вернуть». */
  actionLabel?: string;
  onAction?: () => void;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
}

/** Тёмная плашка с сообщением и необязательной кнопкой. Показывать — через `useToast`: зачитывает её живая область провайдера. */
export function Toast({ message, actionLabel, onAction, ...handlers }: ToastProps) {
  return (
    <div className="yk-toast" {...handlers}>
      <span className="yk-toast__message">{message}</span>
      {actionLabel && (
        <button type="button" className="yk-toast__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
