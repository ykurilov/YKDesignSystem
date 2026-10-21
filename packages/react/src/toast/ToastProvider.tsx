import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Toast } from "./Toast.js";

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Через сколько мс скрыть. 0 — не скрывать. По умолчанию 5000. */
  duration?: number;
}

export interface ToastApi {
  /** Показывает плашку, возвращает её id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const DEFAULT_DURATION = 5000;
const ToastContext = createContext<ToastApi | null>(null);

interface ActiveToast extends ToastOptions {
  id: string;
}

/**
 * Корень уведомлений: рисует их стопкой внизу по центру. Ставится один раз в корне приложения.
 * Живая область создаётся сразу: экранный диктор зачитывает только то, что появилось в уже существующей области.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const id = `toast-${++counter.current}`;
    setToasts((list) => [...list, { ...options, id }]);
    return id;
  }, []);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="yk-toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <TimedToast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Показать уведомление: `const toast = useToast(); toast.show({ message: "Готово" })`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("YKDesignSystem: useToast нужен внутри ToastProvider.");
  return api;
}

/** Плашка с автоскрытием. Пока курсор над ней или фокус внутри, таймер стоит и потом доживает остаток. */
function TimedToast({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  const duration = toast.duration ?? DEFAULT_DURATION;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(duration);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (duration <= 0 || paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => onDismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [duration, paused]);

  return (
    <Toast
      message={toast.message}
      actionLabel={toast.actionLabel}
      onAction={() => {
        toast.onAction?.();
        onDismiss();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
