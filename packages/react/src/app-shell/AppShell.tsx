import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "../button/Button.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { useModalBehavior } from "../overlay/useModalBehavior.js";
import { classNames } from "../classNames.js";

export interface AppNavigationItem {
  id: string;
  label: string;
  icon: IconComponent;
  href?: string;
  /** Для маршрутизатора приложения; ссылка с href сохраняет нативные действия браузера. */
  onSelect?: () => void;
  active?: boolean;
}
export interface AppShellProps {
  brand: { label: string; logo?: ReactNode; href?: string };
  navigation: readonly AppNavigationItem[];
  navigationLabel?: string;
  /** Нижний блок аккаунта. В свёрнутом виде приложение оставляет аватар. */
  footer?: (collapsed: boolean) => ReactNode;
  header?: ReactNode;
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Явный ключ приложения: без ключа предпочтение не записывается на диск. */
  storageKey?: string | null;
  labels?: Partial<{ expand: string; collapse: string; open: string; close: string }>;
  className?: string;
}
const query = "(max-width: 700px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;

/** Стандартная навигация приложения: подписи / иконки на компьютере, модальная панель на телефоне. */
export function AppShell({ brand, navigation, navigationLabel = "Навигация приложения", footer, header, children,
  collapsed: controlled, defaultCollapsed = false, onCollapsedChange, storageKey, labels, className }: AppShellProps) {
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);
  const [open, setOpen] = useState(false);
  const compact = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const collapsed = controlled ?? localCollapsed;
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const text = { expand: "Развернуть навигацию", collapse: "Свернуть навигацию", open: "Открыть навигацию", close: "Закрыть навигацию", ...labels };
  useEffect(() => {
    if (!storageKey || controlled !== undefined) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "collapsed" || saved === "expanded") setLocalCollapsed(saved === "collapsed");
    } catch { /* Навигация работает и без доступного хранилища. */ }
  }, [storageKey, controlled]);
  useEffect(() => { setOpen(false); }, [compact]);
  useEffect(() => {
    const element = dialog.current;
    if (open && compact) { if (element && !element.open) element.showModal(); }
    else element?.close();
  }, [open, compact]);
  useModalBehavior({ open: open && compact, onClose: () => setOpen(false), containerRef: dialog });
  function toggle() {
    const next = !collapsed;
    if (controlled === undefined) setLocalCollapsed(next);
    onCollapsedChange?.(next);
    if (storageKey) try { localStorage.setItem(storageKey, next ? "collapsed" : "expanded"); } catch { /* необязательное предпочтение */ }
  }
  function content(rail: boolean, mobile: boolean) {
    return <>
      <div className="yk-app-shell__nav-header">
        {!rail && <a className="yk-app-shell__brand" href={brand.href ?? "/"}>{brand.logo}<span>{brand.label}</span></a>}
        <Button variant="ghost" icon={mobile ? XIcon : SidebarSimpleIcon}
          aria-label={mobile ? text.close : rail ? text.expand : text.collapse}
          title={mobile ? text.close : rail ? text.expand : text.collapse}
          aria-expanded={mobile ? undefined : !rail} aria-controls={mobile ? undefined : `${id}-navigation`}
          onClick={mobile ? () => setOpen(false) : toggle} />
      </div>
      <nav id={mobile ? `${id}-mobile-navigation` : `${id}-navigation`} aria-label={navigationLabel} className="yk-app-shell__items">
        {navigation.map(item => {
          const props = { className: "yk-app-shell__item", "aria-current": item.active ? "page" as const : undefined,
            "aria-label": rail ? item.label : undefined, title: rail ? item.label : undefined,
            onClick: () => { item.onSelect?.(); if (mobile) setOpen(false); } };
          const inner = <><Icon icon={item.icon} size={20} weight={item.active ? "fill" : "regular"} />{!rail && <span>{item.label}</span>}</>;
          return item.href ? <a key={item.id} href={item.href} {...props}>{inner}</a>
            : <button key={item.id} type="button" {...props}>{inner}</button>;
        })}
      </nav>
      {footer && <div className="yk-app-shell__footer">{footer(rail)}</div>}
    </>;
  }
  return <div className={classNames("yk-app-shell", !compact && collapsed && "yk-app-shell--collapsed", compact && "yk-app-shell--compact", className)}>
    {!compact && <aside className="yk-app-shell__sidebar">{content(collapsed, false)}</aside>}
    <div className="yk-app-shell__workspace">
      {(header || compact) && <header className="yk-app-shell__header">
        {compact && <Button ref={mobileTrigger} variant="ghost" icon={SidebarSimpleIcon} aria-label={text.open}
          aria-expanded={open} aria-controls={`${id}-dialog`} onClick={() => setOpen(true)} />}{header}
      </header>}
      <main className="yk-app-shell__content">{children}</main>
    </div>
    {compact && <dialog ref={dialog} id={`${id}-dialog`} aria-label={navigationLabel} className="yk-app-shell__drawer"
      onCancel={event => { event.preventDefault(); setOpen(false); }}
      onClose={() => { setOpen(false); mobileTrigger.current?.focus(); }}
      onClick={event => { if (event.target !== event.currentTarget) return; const r = event.currentTarget.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setOpen(false); }}>
      <div className="yk-app-shell__mobile-content">{content(false, true)}</div>
    </dialog>}
  </div>;
}
