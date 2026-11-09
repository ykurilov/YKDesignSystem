import { useEffect, useId, useRef, useState, useSyncExternalStore, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from "react";
import { CaretDownIcon, GearSixIcon, ListIcon, MagnifyingGlassIcon, SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import { Avatar } from "../avatar/Avatar.js";
import { Button } from "../button/Button.js";
import { Icon, type IconComponent } from "../icon/Icon.js";
import { NewDot } from "../marks/marks.js";
import { Menu, type MenuEntry } from "../menu/Menu.js";
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
  /** Счётчик справа от подписи, в свёрнутом виде — в углу значка. `label` читает экранный диктор. */
  badge?: { value: number | string; label: string };
  /** Точка «есть новое, не просмотрено». */
  hasNew?: boolean;
}
/** Пункт группы. Без значка — строка списка (например, чат в истории). */
export interface AppNavigationGroupItem extends Omit<AppNavigationItem, "icon"> { icon?: IconComponent }
export interface AppNavigationGroup {
  id: string;
  /** Мелкий подзаголовок группы. */
  label: string;
  items: readonly AppNavigationGroupItem[];
  /** Сколько пунктов видно сразу; остальные под «Ещё N». */
  visibleCount?: number;
  /** Группа разделов: в свёрнутом виде остаётся значками. Без флага (проекты, чаты) группа в свёрнутом виде скрыта. */
  iconsWhenCollapsed?: boolean;
}
/** Главное действие — только у приложения с одним постоянным повторяющимся действием («Новый чат»). */
export interface AppPrimaryAction { label: string; icon: IconComponent; onSelect?: () => void; href?: string }
export type AppAccountView = "email" | "plan" | "name";
export interface AppShellAccount {
  name: string;
  initials?: string;
  email?: string;
  plan?: string;
  /** Вторая строка под именем. По умолчанию "email". Нет данных для выбранного вида — остаётся одно имя. */
  show?: AppAccountView;
  /** Пункты меню аккаунта — открывается нажатием на аватар. */
  menu: MenuEntry[];
}
/** Ссылка роутера приложения (например, Link из Next.js): получает href, className, onClick, aria-атрибуты и детей. */
export type AppShellLinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
export interface AppShellLabels {
  expand: string; collapse: string; open: string; close: string;
  search: string; settings: string; account: string; isNew: string; less: string;
  more: (hidden: number) => string;
}
export interface AppShellProps {
  brand: { label: string; logo?: ReactNode; href?: string };
  /** Разделы со значками под главным действием. */
  navigation: readonly AppNavigationItem[];
  navigationLabel?: string;
  primaryAction?: AppPrimaryAction;
  /** Группы с подзаголовками в прокручиваемой середине: разделы, проекты, история чатов. */
  groups?: readonly AppNavigationGroup[];
  /** Кнопка поиска вверху панели — только если передан обработчик. */
  onSearch?: () => void;
  /** Стандартный блок аккаунта внизу. Если передан, `footer` не используется. */
  account?: AppShellAccount;
  /** Шестерёнка справа от аккаунта. */
  onSettings?: () => void;
  /** Свой нижний блок вместо `account` (прежний способ). */
  footer?: (collapsed: boolean) => ReactNode;
  header?: ReactNode;
  children: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Явный ключ приложения: без ключа предпочтение не записывается на диск. */
  storageKey?: string | null;
  labels?: Partial<AppShellLabels>;
  className?: string;
  /** Чем рисовать ссылки разделов и названия. По умолчанию — обычный `<a>`. */
  linkComponent?: AppShellLinkComponent;
}
const query = "(max-width: 700px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const snapshot = () => window.matchMedia(query).matches;
const serverSnapshot = () => false;
const defaultLabels: AppShellLabels = {
  expand: "Развернуть навигацию", collapse: "Свернуть навигацию", open: "Открыть навигацию", close: "Закрыть навигацию",
  search: "Поиск", settings: "Настройки", account: "Аккаунт", isNew: "есть новое", less: "Свернуть", more: hidden => `Ещё ${hidden}`,
};

/** Стандартная панель приложения «Одуванчика»: верх, главное действие, разделы, группы, аккаунт. */
export function AppShell({ brand, navigation, navigationLabel = "Навигация приложения", primaryAction, groups = [], onSearch, account, onSettings,
  footer, header, children, collapsed: controlled, defaultCollapsed = false, onCollapsedChange, storageKey, labels, className,
  linkComponent: Link = "a" as unknown as AppShellLinkComponent }: AppShellProps) {
  const [localCollapsed, setLocalCollapsed] = useState(defaultCollapsed);
  const [open, setOpen] = useState(false);
  const compact = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const collapsed = controlled ?? localCollapsed;
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const text = { ...defaultLabels, ...labels };
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
    const after = (action?: () => void) => () => { action?.(); if (mobile) setOpen(false); };
    const row = (item: AppNavigationGroupItem, extraClass?: string) => {
      const name = [item.label, item.badge?.label, item.hasNew ? text.isNew : undefined].filter(Boolean).join(", ");
      const props = { className: classNames("yk-app-shell__item", extraClass), "aria-current": item.active ? "page" as const : undefined,
        "aria-label": rail || item.badge || item.hasNew ? name : undefined, title: rail ? item.label : undefined, onClick: after(item.onSelect) };
      const inner = <>{item.icon && <Icon icon={item.icon} size={20} weight={item.active ? "fill" : "regular"} />}
        {!rail && <span className="yk-app-shell__label">{item.label}</span>}
        {item.badge && <span className="yk-app-shell__badge" aria-hidden="true">{item.badge.value}</span>}
        {item.hasNew && <NewDot className="yk-app-shell__new" />}</>;
      return item.href ? <Link key={item.id} href={item.href} {...props}>{inner}</Link>
        : <button key={item.id} type="button" {...props}>{inner}</button>;
    };
    const visibleGroups = rail ? groups.filter(group => group.iconsWhenCollapsed) : groups;
    const secondLine = account && ({ email: account.email, plan: account.plan, name: undefined })[account.show ?? "email"];
    return <>
      <div className="yk-app-shell__nav-header">
        {!rail && <Link className="yk-app-shell__brand" href={brand.href ?? "/"} title={brand.label}>{brand.logo}<span>{brand.label}</span></Link>}
        <div className="yk-app-shell__top-actions">
          {onSearch && !rail && <Button variant="ghost" icon={MagnifyingGlassIcon} aria-label={text.search} title={text.search} onClick={after(onSearch)} />}
          <Button variant="ghost" icon={mobile ? XIcon : SidebarSimpleIcon}
            aria-label={mobile ? text.close : rail ? text.expand : text.collapse}
            title={mobile ? text.close : rail ? text.expand : text.collapse}
            aria-expanded={mobile ? undefined : !rail} aria-controls={mobile ? undefined : `${id}-navigation`}
            onClick={mobile ? () => setOpen(false) : toggle} />
        </div>
      </div>
      <nav id={mobile ? `${id}-mobile-navigation` : `${id}-navigation`} aria-label={navigationLabel}
        className={classNames("yk-app-shell__nav", visibleGroups.length > 0 && "yk-app-shell__nav--grouped")}>
        <div className="yk-app-shell__items">
          {primaryAction && row({ id: "primary-action", ...primaryAction }, "yk-app-shell__primary")}
          {navigation.map(item => row(item))}
        </div>
        {visibleGroups.length > 0 && <div className="yk-app-shell__groups">
          {visibleGroups.map(group => <NavigationGroup key={group.id} group={group} rail={rail} row={row} text={text} />)}
        </div>}
      </nav>
      {account
        ? <div className="yk-app-shell__footer yk-app-shell__footer--account">
            <Menu label={text.account} entries={mobile ? account.menu.map(entry => entry === "separator" ? entry : { ...entry, onSelect: after(entry.onSelect) }) : account.menu}
              trigger={<button type="button" className="yk-app-shell__account" title={rail ? account.name : undefined}
                aria-label={[`${text.account}: ${account.name}`, rail ? undefined : secondLine].filter(Boolean).join(", ")}>
                <Avatar name={account.name} initials={account.initials} />
                {!rail && <span className="yk-app-shell__who"><span>{account.name}</span>{secondLine && <small>{secondLine}</small>}</span>}
              </button>} />
            {onSettings && !rail && <Button variant="ghost" icon={GearSixIcon} aria-label={text.settings} title={text.settings} onClick={after(onSettings)} />}
          </div>
        : footer && <div className="yk-app-shell__footer">{footer(rail)}</div>}
    </>;
  }
  return <div className={classNames("yk-app-shell", !compact && collapsed && "yk-app-shell--collapsed", compact && "yk-app-shell--compact", className)}>
    {!compact && <aside className="yk-app-shell__sidebar">{content(collapsed, false)}</aside>}
    <div className="yk-app-shell__workspace">
      {(header || compact) && <header className="yk-app-shell__header">
        {compact && <Button ref={mobileTrigger} variant="ghost" icon={ListIcon} aria-label={text.open}
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

function NavigationGroup({ group, rail, row, text }: { group: AppNavigationGroup; rail: boolean;
  row: (item: AppNavigationGroupItem) => ReactNode; text: AppShellLabels }) {
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const limit = rail ? Infinity : group.visibleCount ?? Infinity;
  const activeHidden = group.items.slice(limit).some(item => item.active);
  const shown = expanded || activeHidden ? group.items : group.items.slice(0, limit);
  const hidden = group.items.length - limit;
  return <section className="yk-app-shell__group" aria-labelledby={titleId}>
    <h2 id={titleId} className={classNames("yk-app-shell__group-title", rail && "yk-visually-hidden")}>{group.label}</h2>
    {shown.map(item => row(item))}
    {hidden > 0 && !activeHidden && <button type="button" className="yk-app-shell__item yk-app-shell__more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
      <Icon icon={CaretDownIcon} size={16} className={expanded ? "yk-app-shell__more-icon--open" : undefined} />
      <span className="yk-app-shell__label">{expanded ? text.less : text.more(hidden)}</span>
    </button>}
  </section>;
}
