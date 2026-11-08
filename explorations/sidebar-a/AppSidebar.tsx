import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar, Icon, Menu, type IconComponent, type MenuEntry } from "@ykurilov/ds-react";
import { MagnifyingGlassIcon, SidebarSimpleIcon, GearSixIcon, XIcon, ListIcon, CaretDownIcon } from "@phosphor-icons/react";

/* Что приложение передаёт данными. Всё остальное — раскладка, размеры, состояния — общее. */
export interface SidebarItem { id: string; label: string; icon?: IconComponent; active?: boolean; hasNew?: boolean; onSelect: () => void }
/** iconsWhenCollapsed — группа разделов: в свёрнутом виде остаётся значками. Без него (проекты, чаты) группа в свёрнутом виде скрыта. */
export interface SidebarGroup { id: string; label: string; items: SidebarItem[]; visibleCount?: number; iconsWhenCollapsed?: boolean }
export interface AppSidebarProps {
  brand: { label: string; logo: ReactNode };
  primaryAction?: { label: string; icon: IconComponent; onSelect: () => void };
  sections?: SidebarItem[];
  groups: SidebarGroup[];
  /** Вид нижнего блока: "email" (по умолчанию), "plan" или "name". Нет нужного поля — остаётся одно имя. */
  account: { name: string; initials?: string; email?: string; plan?: string; show?: "email" | "plan" | "name"; menu: MenuEntry[] };
  onSearch?: () => void;
  onSettings: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Телефон: панель поверх содержимого. Задаёт оболочка по ширине экрана. */
  overlay?: boolean;
  onClose?: () => void;
}

export function AppSidebar(p: AppSidebarProps) {
  const iconOnly = p.collapsed && !p.overlay;
  const show = p.account.show ?? "email";
  const secondLine = show === "email" ? p.account.email : show === "plan" ? p.account.plan : undefined;
  const [scrolled, setScrolled] = useState({ top: false, bottom: false });
  const middle = useRef<HTMLDivElement>(null);
  const measure = () => {
    const el = middle.current; if (!el) return;
    setScrolled({ top: el.scrollTop > 0, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1 });
  };
  useEffect(measure, [iconOnly, p.groups]);
  const select = (fn: () => void) => () => { fn(); p.onClose?.(); };

  return (
    <nav className={"sb" + (iconOnly ? " sb--collapsed" : "") + (p.overlay ? " sb--overlay" : "")} aria-label="Навигация приложения">
      <div className="sb__top">
        <div className="sb__brand">{p.brand.logo}<span className="sb__label">{p.brand.label}</span></div>
        <div className="sb__top-actions">
          {p.onSearch && <IconButton icon={MagnifyingGlassIcon} label="Поиск" onClick={select(p.onSearch)} />}
          {p.overlay
            ? <IconButton icon={XIcon} label="Закрыть меню" onClick={() => p.onClose?.()} />
            : <IconButton icon={SidebarSimpleIcon} label={p.collapsed ? "Развернуть панель" : "Свернуть панель"} onClick={() => p.onCollapsedChange(!p.collapsed)} />}
        </div>
      </div>

      <div className="sb__lead">
        {p.primaryAction && <Row className="sb__primary" item={{ id: "primary", label: p.primaryAction.label, icon: p.primaryAction.icon, onSelect: select(p.primaryAction.onSelect) }} iconOnly={iconOnly} />}
        {(p.sections ?? []).map(item => <Row key={item.id} item={{ ...item, onSelect: select(item.onSelect) }} iconOnly={iconOnly} />)}
      </div>

      <div className={"sb__middle" + (scrolled.top ? " is-scrolled-top" : "") + (scrolled.bottom ? " is-scrolled-bottom" : "")} ref={middle} onScroll={measure}>
        {p.groups.filter(g => !iconOnly || g.iconsWhenCollapsed).map(group => <Group key={group.id} group={group} select={select} iconOnly={iconOnly} />)}
      </div>

      <div className="sb__bottom">
        <Menu label="Аккаунт" entries={p.account.menu} trigger={
          <button className="sb__account" aria-label={"Аккаунт: " + p.account.name} title={iconOnly ? p.account.name : undefined}>
            <Avatar name={p.account.name} initials={p.account.initials} size="md" />
            <span className="sb__label sb__who"><span>{p.account.name}</span>{secondLine && <small>{secondLine}</small>}</span>
          </button>} />
        <IconButton className="sb__settings" icon={GearSixIcon} label="Настройки" onClick={select(p.onSettings)} />
      </div>
    </nav>
  );
}

function Group({ group, select, iconOnly }: { group: SidebarGroup; select: (fn: () => void) => () => void; iconOnly: boolean }) {
  const limit = iconOnly ? Infinity : group.visibleCount ?? Infinity;
  const [open, setOpen] = useState(false);
  const hasActiveHidden = group.items.slice(limit).some(i => i.active);
  const shown = open || hasActiveHidden ? group.items : group.items.slice(0, limit);
  return (
    <section className="sb__group" aria-labelledby={"sb-g-" + group.id}>
      <h2 className="sb__group-title" id={"sb-g-" + group.id}>{group.label}</h2>
      {shown.map(item => <Row key={item.id} item={{ ...item, onSelect: select(item.onSelect) }} iconOnly={iconOnly} />)}
      {group.items.length > limit && !hasActiveHidden &&
        <button className="sb__row sb__more" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon icon={CaretDownIcon} size={16} className={open ? "is-flipped" : ""} /><span className="sb__label">{open ? "Свернуть" : "Ещё " + (group.items.length - limit)}</span>
        </button>}
    </section>
  );
}

function Row({ item, iconOnly, className = "" }: { item: SidebarItem; iconOnly: boolean; className?: string }) {
  return (
    <button className={"sb__row " + className} aria-current={item.active ? "page" : undefined}
      aria-label={iconOnly ? item.label : undefined} title={iconOnly ? item.label : item.label.length > 28 ? item.label : undefined} onClick={item.onSelect}>
      {item.icon && <Icon icon={item.icon} size={20} weight={item.active ? "fill" : "regular"} />}
      <span className="sb__label">{item.label}</span>
      {item.hasNew && <span className="sb__dot" aria-label="Есть новое" />}
    </button>
  );
}

function IconButton({ icon, label, onClick, className = "" }: { icon: IconComponent; label: string; onClick: () => void; className?: string }) {
  return <button className={"sb__icon-btn " + className} aria-label={label} title={label} onClick={onClick}><Icon icon={icon} size={20} /></button>;
}

/* Оболочка: панель + рабочая область, свёрнутость с сохранением, телефонная шторка. */
export function SidebarShell({ sidebar, header, children, storageKey, collapsed: controlled, onCollapsedChange, defaultDrawerOpen = false }: {
  sidebar: Omit<AppSidebarProps, "collapsed" | "onCollapsedChange" | "overlay" | "onClose">;
  header: ReactNode; children: ReactNode; storageKey?: string;
  collapsed?: boolean; onCollapsedChange?: (collapsed: boolean) => void; defaultDrawerOpen?: boolean;
}) {
  const [own, setOwn] = useState(() => { try { return storageKey ? localStorage.getItem(storageKey) === "1" : false; } catch { return false; } });
  const collapsed = controlled ?? own;
  const setCollapsed = (v: boolean) => { setOwn(v); onCollapsedChange?.(v); };
  const [phone, setPhone] = useState(() => matchMedia("(max-width: 700px)").matches);
  const [drawer, setDrawer] = useState(defaultDrawerOpen);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => { const m = matchMedia("(max-width: 700px)"); const h = () => setPhone(m.matches); m.addEventListener("change", h); return () => m.removeEventListener("change", h); }, []);
  useEffect(() => { if (storageKey) try { localStorage.setItem(storageKey, collapsed ? "1" : "0"); } catch {} }, [collapsed, storageKey]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);
  useEffect(() => { if (!phone) setDrawer(false); }, [phone]);
  const close = () => { setDrawer(false); opener.current?.focus(); };

  return (
    <div className={"shell" + (phone ? " shell--phone" : "")}>
      {phone
        ? drawer && <><div className="shell__scrim" onClick={close} /><div className="shell__drawer" role="dialog" aria-modal="true" aria-label="Меню"><AppSidebar {...sidebar} collapsed={false} onCollapsedChange={() => {}} overlay onClose={close} /></div></>
        : <AppSidebar {...sidebar} collapsed={collapsed} onCollapsedChange={setCollapsed} />}
      <main className="shell__main" inert={phone && drawer ? true : undefined}>
        <header className="shell__header">
          {phone && <button ref={opener} className="sb__icon-btn" aria-label="Открыть меню" onClick={() => setDrawer(true)}><Icon icon={ListIcon} size={20} /></button>}
          {header}
        </header>
        {children}
      </main>
    </div>
  );
}
