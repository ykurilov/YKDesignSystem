import {
  cloneElement, useEffect, useId, useRef, useState,
  type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode,
} from "react";
import { classNames } from "../classNames.js";
import { Icon, type IconComponent } from "../icon/Icon.js";

export interface MenuItemSpec {
  label: string;
  icon?: IconComponent;
  /** Подсказка клавиши справа, например `⌘D`. */
  shortcut?: ReactNode;
  /** Опасное действие — красным. */
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export type MenuEntry = MenuItemSpec | "separator";

export interface MenuProps {
  /** Имя меню для экранного диктора, например «Действия». */
  label: string;
  /** Кнопка, открывающая меню. Должна принимать onClick, onKeyDown и aria-атрибуты (подходит Button). */
  trigger: ReactElement<TriggerProps>;
  entries: MenuEntry[];
  /** С какого края кнопки выровнять меню. */
  align?: "start" | "end";
}

interface TriggerProps {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

const ITEM_SELECTOR = "[role=menuitem]:not([aria-disabled=true])";

/** Выпадающее меню у кнопки: стрелки, Enter, Esc, подсказки клавиш. */
export function Menu({ label, trigger, entries, align = "start" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const triggerElement = () => anchorRef.current?.firstElementChild as HTMLElement | null;
  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);

  const closeToTrigger = () => {
    setOpen(false);
    triggerElement()?.focus();
  };

  useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const moveFocus = (step: 1 | -1 | "first" | "last") => {
    const list = items();
    if (list.length === 0) return;
    const current = list.indexOf(document.activeElement as HTMLElement);
    const next =
      step === "first" ? 0 : step === "last" ? list.length - 1 : (current + step + list.length) % list.length;
    list[next]!.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown": event.preventDefault(); moveFocus(1); break;
      case "ArrowUp": event.preventDefault(); moveFocus(-1); break;
      case "Home": event.preventDefault(); moveFocus("first"); break;
      case "End": event.preventDefault(); moveFocus("last"); break;
      case "Escape": event.preventDefault(); event.stopPropagation(); closeToTrigger(); break;
      // Tab уводит фокус дальше с кнопки меню, как в обычной странице
      case "Tab": setOpen(false); triggerElement()?.focus(); break;
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    trigger.props.onKeyDown?.(event);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const select = (entry: MenuItemSpec) => {
    if (entry.disabled) return;
    setOpen(false);
    triggerElement()?.focus();
    entry.onSelect();
  };

  return (
    <span className="yk-menu-anchor" ref={anchorRef}>
      {cloneElement(trigger, {
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          setOpen((value) => !value);
        },
        onKeyDown: handleTriggerKeyDown,
      })}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          className={classNames("yk-menu", `yk-menu--${align}`)}
          onKeyDown={handleMenuKeyDown}
        >
          {entries.map((entry, index) =>
            entry === "separator" ? (
              <hr key={index} role="separator" className="yk-menu__separator" />
            ) : (
              <button
                key={index}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={entry.disabled || undefined}
                className={classNames("yk-menu__item", entry.icon && "yk-menu__item--with-icon", entry.danger && "yk-menu__item--danger")}
                onClick={() => select(entry)}
              >
                {entry.icon && <Icon icon={entry.icon} size={16} />}
                {entry.label}
                {entry.shortcut != null && <kbd className="yk-menu__kbd">{entry.shortcut}</kbd>}
              </button>
            ),
          )}
        </div>
      )}
    </span>
  );
}
