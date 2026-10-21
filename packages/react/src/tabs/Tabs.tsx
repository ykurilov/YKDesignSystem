import { createContext, useContext, useId, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { classNames } from "../classNames.js";

interface TabsContext {
  baseId: string;
  value: string | undefined;
  select: (value: string) => void;
}

const Context = createContext<TabsContext | null>(null);

function useTabs(part: string): TabsContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error(`YKDesignSystem: ${part} нужно класть внутрь <Tabs>.`);
  return ctx;
}

const idPart = (value: string) => value.replace(/\s+/g, "_");

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: string;
  /** Вкладка, открытая сначала (когда значение не приходит снаружи). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/** Вкладки: Tabs → TabList → Tab, и TabPanel на каждую вкладку. */
export function Tabs({ value, defaultValue, onValueChange, className, ...rest }: TabsProps) {
  const baseId = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const select = (next: string) => {
    if (value === undefined) setInner(next);
    if (next !== current) onValueChange?.(next);
  };
  return (
    <Context.Provider value={{ baseId, value: current, select }}>
      <div className={classNames("yk-tabs", className)} {...rest} />
    </Context.Provider>
  );
}

/** Ряд вкладок. Стрелки, Home и End двигают выбор. Нужен aria-label. */
export function TabList({ className, onKeyDown, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !ref.current) return;
    const tabs = Array.from(ref.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
    const at = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight") next = tabs[(at + 1) % tabs.length];
    else if (event.key === "ArrowLeft") next = tabs[(at - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") next = tabs[0];
    else if (event.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
    next.click();
  };

  return <div ref={ref} role="tablist" className={classNames("yk-tab-list", className)} onKeyDown={handleKeyDown} {...rest} />;
}

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role" | "value"> {
  value: string;
  /** Число рядом с названием, моноширинным. */
  count?: ReactNode;
}

/** Одна вкладка. */
export function Tab({ value, count, className, children, onClick, ...rest }: TabProps) {
  const ctx = useTabs("Tab");
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${idPart(value)}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${idPart(value)}`}
      tabIndex={selected ? 0 : -1}
      className={classNames("yk-tab", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.select(value);
      }}
      {...rest}
    >
      {children}
      {count != null && <>{" "}<span className="yk-mono-num yk-tab__count">{count}</span></>}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

/** Содержимое вкладки; видно только у выбранной. */
export function TabPanel({ value, className, ...rest }: TabPanelProps) {
  const ctx = useTabs("TabPanel");
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${idPart(value)}`}
      aria-labelledby={`${ctx.baseId}-tab-${idPart(value)}`}
      hidden={ctx.value !== value}
      tabIndex={0}
      className={classNames("yk-tab-panel", className)}
      {...rest}
    />
  );
}
