import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { Avatar, Button, Icon, Menu, type IconComponent, type MenuEntry } from "@ykurilov/ds-react";
import { CaretDownIcon, GearSixIcon, MagnifyingGlassIcon, SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";

/** Счётчик раздела. `attention` — требует действия: оранжевый и виден даже в свёрнутой панели. */
export interface SidebarBadge { value: number | string; label: string; tone?: "attention" }
export interface SidebarItem { id: string; label: string; icon?: IconComponent; badge?: SidebarBadge }
/**
 * `sections` — разделы со значками, видны и в свёрнутой панели.
 * `list` — данные пользователя (чаты, проекты): без значков или с одинаковыми, обрезка «…», в свёрнутой панели скрыты.
 */
export interface SidebarGroup {
  id: string;
  title?: string;
  kind?: "sections" | "list";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Сколько строк показать до кнопки «Показать ещё». */
  limit?: number;
  items: readonly SidebarItem[];
}
export interface WorkShellProps {
  brand: { label: string; logo?: ReactNode };
  primaryAction?: { label: string; icon: IconComponent; shortcut?: string; onSelect: () => void };
  groups: readonly SidebarGroup[];
  activeId?: string;
  onSelect: (item: SidebarItem) => void;
  /** Вторая строка: тариф, если приложение его передало, иначе почта; без обоих — одно имя. */
  account: { name: string; initials?: string; email?: string; plan?: string; menu: MenuEntry[] };
  onSettings?: () => void;
  header?: ReactNode;
  children: ReactNode;
  /** Ключ приложения для сохранения свёрнутости панели и групп. */
  storageKey?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Только для демонстрации: открыть мобильную панель сразу. */
  defaultMobileOpen?: boolean;
}

const mobileQuery = "(max-width: 700px)";
const subscribe = (listener: () => void) => { const m = matchMedia(mobileQuery); m.addEventListener("change", listener); return () => m.removeEventListener("change", listener); };
const useMobile = () => useSyncExternalStore(subscribe, () => matchMedia(mobileQuery).matches, () => false);

function read<T>(key: string | undefined, fallback: T): T {
  if (!key) return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function write(key: string | undefined, value: unknown) {
  if (key) try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* предпочтение необязательно */ }
}
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/** Оболочка рабочего приложения: плотная левая панель с группами, счётчиками и клавиатурой + рабочая область. */
export function WorkShell({ brand, primaryAction, groups, activeId, onSelect, account, onSettings, header, children,
  storageKey, collapsed: controlled, onCollapsedChange, defaultMobileOpen = false }: WorkShellProps) {
  const mobile = useMobile();
  const id = useId();
  const [localCollapsed, setLocalCollapsed] = useState(() => read(storageKey && `${storageKey}:collapsed`, false));
  const collapsed = controlled ?? localCollapsed;
  const [closedGroups, setClosedGroups] = useState<string[]>(() =>
    read(storageKey && `${storageKey}:groups`, groups.filter(g => g.defaultCollapsed).map(g => g.id)));
  const [unlimited, setUnlimited] = useState<string[]>([]);
  const [query, setQuery] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(defaultMobileOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const rail = collapsed && !mobile;

  function setCollapsed(next: boolean) {
    if (controlled === undefined) setLocalCollapsed(next);
    onCollapsedChange?.(next);
    write(storageKey && `${storageKey}:collapsed`, next);
  }
  function toggleGroup(groupId: string, open?: boolean) {
    setClosedGroups(current => {
      const isOpen = !current.includes(groupId);
      const next = (open ?? !isOpen) ? current.filter(x => x !== groupId) : isOpen ? [...current, groupId] : current;
      write(storageKey && `${storageKey}:groups`, next);
      return next;
    });
  }
  function openSearch() {
    if (rail) setCollapsed(false);
    if (mobile) setDrawerOpen(true);
    setQuery(q => q ?? "");
  }
  function closeSearch() { setQuery(null); }
  function select(item: SidebarItem) { onSelect(item); setQuery(null); if (mobile) setDrawerOpen(false); }

  useEffect(() => { if (query !== null) searchInput.current?.focus(); }, [query === null, mobile, drawerOpen]);
  useEffect(() => {
    const el = dialog.current;
    if (mobile && drawerOpen) { if (el && !el.open) el.showModal(); } else if (el?.open) el.close();
  }, [mobile, drawerOpen]);

  const shortcutTargets = useMemo(() => groups.filter(g => (g.kind ?? "sections") === "sections").flatMap(g => g.items).filter(i => i.icon), [groups]);
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") { event.preventDefault(); openSearch(); return; }
      if (isTyping(event.target) || mod) return;
      if (event.altKey && /^Digit[1-9]$/.test(event.code)) {
        const target = shortcutTargets[Number(event.code.slice(5)) - 1];
        if (target) { event.preventDefault(); select(target); }
        return;
      }
      if (event.altKey || event.shiftKey) return;
      if (event.key === "/") { event.preventDefault(); openSearch(); }
      else if (event.key === "[") { event.preventDefault(); mobile ? setDrawerOpen(o => !o) : setCollapsed(!collapsed); }
      else if (event.key.toLowerCase() === "c" && primaryAction) { event.preventDefault(); primaryAction.onSelect(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  /** Стрелки ходят по строкам панели, ←/→ сворачивают и раскрывают группу. */
  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (isTyping(target) && event.key !== "ArrowDown") return;
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-row]")).filter(r => r.offsetParent);
    const index = rows.indexOf(target.closest<HTMLElement>("[data-row]")!);
    const move = (i: number) => { event.preventDefault(); rows[(i + rows.length) % rows.length]?.focus(); };
    if (event.key === "ArrowDown") move(isTyping(target) ? rows.findIndex(r => r.closest(".ws-middle")) : index + 1);
    else if (event.key === "ArrowUp" && index >= 0) move(index - 1);
    else if (event.key === "Home" && index >= 0) move(0);
    else if (event.key === "End" && index >= 0) move(rows.length - 1);
    else if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !rail) {
      const groupEl = target.closest<HTMLElement>("[data-group]");
      const groupId = groupEl?.dataset.group;
      const group = groups.find(g => g.id === groupId);
      if (!group?.collapsible || !groupId) return;
      event.preventDefault();
      toggleGroup(groupId, event.key === "ArrowRight");
      if (event.key === "ArrowLeft") groupEl!.querySelector<HTMLElement>(".ws-group__heading")?.focus();
    }
  }

  const needle = query?.trim().toLocaleLowerCase("ru") ?? "";
  function panel(isRail: boolean, isMobile: boolean) {
    const shown = groups
      .filter(g => !isRail || (g.kind ?? "sections") === "sections")
      .map(g => ({ ...g, items: needle ? g.items.filter(i => i.label.toLocaleLowerCase("ru").includes(needle)) : g.items }))
      .filter(g => g.items.length);
    const toggleLabel = isMobile ? "Закрыть навигацию" : isRail ? "Развернуть панель  [" : "Свернуть панель  [";
    return <div className={"ws-panel" + (isRail ? " ws-panel--rail" : "")} onKeyDown={onPanelKeyDown}>
      <div className="ws-top">
        {isRail ? null : query !== null
          ? <label className="ws-search"><Icon icon={MagnifyingGlassIcon} size={16} />
              <input ref={searchInput} value={query} placeholder="Найти раздел или чат" aria-label="Поиск по панели"
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeSearch(); }
                  if (e.key === "Enter") { const first = shown[0]?.items[0]; if (first) select(first); } }} /></label>
          : <span className="ws-brand">{brand.logo}<span className="ws-brand__label">{brand.label}</span></span>}
        <div className="ws-top__actions">
          {!isRail && query === null && <Button variant="ghost" size="sm" icon={MagnifyingGlassIcon} aria-label="Поиск" title="Поиск  ⌘K" onClick={openSearch} />}
          {!isRail && query !== null && <Button variant="ghost" size="sm" icon={XIcon} aria-label="Закрыть поиск" title="Закрыть поиск  Esc" onClick={closeSearch} />}
          <Button variant="ghost" size="sm" icon={isMobile ? XIcon : SidebarSimpleIcon} aria-label={toggleLabel.split("  ")[0]} title={toggleLabel}
            aria-expanded={isMobile ? undefined : !isRail} aria-controls={isMobile ? undefined : `${id}-panel`}
            onClick={isMobile ? () => setDrawerOpen(false) : () => setCollapsed(!collapsed)} />
        </div>
      </div>
      {isRail && <button type="button" data-row className="ws-item" aria-label="Поиск" title="Поиск  ⌘K" onClick={openSearch}><Icon icon={MagnifyingGlassIcon} size={18} /></button>}
      {primaryAction && query === null && <button type="button" data-row className="ws-primary" onClick={primaryAction.onSelect}
        aria-label={isRail ? primaryAction.label : undefined} title={isRail ? `${primaryAction.label}  ${primaryAction.shortcut ?? ""}` : undefined}
        aria-keyshortcuts={primaryAction.shortcut}>
        <Icon icon={primaryAction.icon} size={18} />{!isRail && <><span>{primaryAction.label}</span>{primaryAction.shortcut && <kbd>{primaryAction.shortcut}</kbd>}</>}
      </button>}
      <nav id={isMobile ? undefined : `${id}-panel`} className="ws-middle" aria-label="Разделы приложения">
        {shown.map(group => {
          const open = needle !== "" || isRail || !group.collapsible || !closedGroups.includes(group.id);
          const limited = !needle && group.limit && !unlimited.includes(group.id) && group.items.length > group.limit;
          const items = limited ? group.items.slice(0, group.limit) : group.items;
          const attention = group.items.filter(i => i.badge?.tone === "attention").reduce((sum, i) => sum + (Number(i.badge!.value) || 0), 0);
          const headingId = `${id}-${group.id}-${isMobile ? "m" : "d"}`;
          return <section key={group.id} data-group={group.id} className={"ws-group ws-group--" + (group.kind ?? "sections")} aria-labelledby={group.title && !isRail ? headingId : undefined}>
            {group.title && !isRail && (group.collapsible
              ? <button type="button" data-row id={headingId} className="ws-group__heading" aria-expanded={open} onClick={() => toggleGroup(group.id)}>
                  <span>{group.title}</span>
                  {!open && attention > 0 && <span className="ws-badge ws-badge--attention" aria-label={`требуют внимания: ${attention}`}>{attention}</span>}
                  <Icon icon={CaretDownIcon} size={12} className="ws-group__caret" /></button>
              : <h2 id={headingId} className="ws-group__heading">{group.title}</h2>)}
            {open && <div className="ws-group__items">
              {items.map(item => {
                const active = item.id === activeId;
                const showBadge = item.badge && (!isRail || item.badge.tone === "attention");
                return <button key={item.id} type="button" data-row className="ws-item" aria-current={active ? "page" : undefined}
                  aria-label={isRail ? (item.badge ? `${item.label}, ${item.badge.label}` : item.label) : undefined}
                  title={isRail || group.kind === "list" ? item.label : undefined} onClick={() => select(item)}>
                  {item.icon && <Icon icon={item.icon} size={18} weight={active ? "fill" : "regular"} />}
                  {!isRail && <span className="ws-item__label">{item.label}</span>}
                  {showBadge && <span className={"ws-badge" + (item.badge!.tone === "attention" ? " ws-badge--attention" : "")}>
                    <span aria-hidden="true">{item.badge!.value}</span>{!isRail && <span className="yk-visually-hidden">, {item.badge!.label}</span>}</span>}
                </button>;
              })}
              {limited && <button type="button" data-row className="ws-item ws-item--more" onClick={() => setUnlimited(u => [...u, group.id])}>
                <span className="ws-item__label">Показать ещё {group.items.length - group.limit!}</span></button>}
            </div>}
          </section>;
        })}
        {!shown.length && <p className="ws-empty">Ничего не нашлось</p>}
      </nav>
      <div className="ws-footer">
        <Menu label="Аккаунт" entries={account.menu} trigger={
          <button type="button" data-row className="ws-account" aria-label={isRail ? `Аккаунт: ${account.name}` : undefined} title={isRail ? account.name : undefined}>
            <Avatar name={account.name} initials={account.initials} size="sm" />
            {!isRail && <span className="ws-account__text"><span>{account.name}</span>{account.plan ? <small className="ws-account__plan">{account.plan}</small> : account.email && <small>{account.email}</small>}</span>}
          </button>} />
        {!isRail && onSettings && <Button variant="ghost" size="sm" icon={GearSixIcon} aria-label="Настройки" title="Настройки" onClick={onSettings} />}
      </div>
    </div>;
  }

  return <div className={"ws-shell" + (rail ? " ws-shell--rail" : "") + (mobile ? " ws-shell--mobile" : "")}>
    {!mobile && <aside className="ws-sidebar">{panel(rail, false)}</aside>}
    <div className="ws-workspace">
      <header className="ws-header">
        {mobile && <Button ref={opener} variant="ghost" size="sm" icon={SidebarSimpleIcon} aria-label="Открыть навигацию" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)} />}
        {header}
      </header>
      <main className="ws-content">{children}</main>
    </div>
    {mobile && <dialog ref={dialog} className="ws-drawer" aria-label="Навигация приложения"
      onCancel={e => { e.preventDefault(); if (query !== null) closeSearch(); else setDrawerOpen(false); }}
      onClose={() => { setDrawerOpen(false); opener.current?.focus(); }}
      onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
      {panel(false, true)}
    </dialog>}
  </div>;
}
