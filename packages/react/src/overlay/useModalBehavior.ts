import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Сколько окон сейчас держат прокрутку фона: снимаем блок, когда закрылось последнее. */
let scrollLocks = 0;
let savedOverflow = "";

function lockScroll() {
  if (scrollLocks++ === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  if (--scrollLocks === 0) document.body.style.overflow = savedOverflow;
}

/** Открытые окна, верхнее — последнее. Esc и Tab обслуживают только его. */
const openModals: HTMLElement[] = [];
const INERT_MARK = "data-yk-inert";

/** Корневой элемент окна прямо в body: именно его (а не панель внутри) нельзя отключать. */
function rootInBody(element: HTMLElement): HTMLElement {
  let node = element;
  while (node.parentElement && node.parentElement !== document.body) node = node.parentElement;
  return node;
}

/** Всё, что в body лежит не в верхнем окне, становится inert; чужой inert не трогаем. */
function syncInert() {
  const topRoot = openModals.length > 0 ? rootInBody(openModals[openModals.length - 1]!) : null;
  for (const child of Array.from(document.body.children)) {
    if (topRoot && child !== topRoot) {
      if (!child.hasAttribute("inert")) {
        child.setAttribute("inert", "");
        child.setAttribute(INERT_MARK, "");
      }
    } else if (child.hasAttribute(INERT_MARK)) {
      child.removeAttribute("inert");
      child.removeAttribute(INERT_MARK);
    }
  }
}

function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

interface ModalBehavior {
  open: boolean;
  onClose: () => void;
  /** Само окно: внутри него держим фокус. */
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * Поведение модального окна: фокус уходит внутрь и возвращается на прежнее место,
 * Tab ходит по кругу, Esc закрывает, прокрутка фона заблокирована, всё под окном отключено (inert).
 * Окна могут быть вложены: Esc и Tab слушает только верхнее.
 */
export function useModalBehavior({ open, onClose, containerRef }: ModalBehavior) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!open || !container) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lockScroll();
    openModals.push(container);
    syncInert();
    const first = container.querySelector<HTMLElement>("[data-autofocus]") ?? focusableIn(container)[0] ?? container;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== container) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(container);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0]!;
      const lastItem = items[items.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && (active === firstItem || active === container)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (!container.contains(active)) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      openModals.splice(openModals.indexOf(container), 1);
      syncInert();
      if (opener?.isConnected) opener.focus();
    };
  }, [open, containerRef]);
}
