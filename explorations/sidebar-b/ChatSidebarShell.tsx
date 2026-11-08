import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CaretDownIcon, DotsThreeIcon, GearSixIcon, MagnifyingGlassIcon, PlusIcon, SidebarSimpleIcon, XIcon } from "@phosphor-icons/react";
import { Avatar, Button, Icon, Menu, MonoLabel, MonoNum, NewDot, Sphere, type IconComponent, type MenuEntry } from "@ykurilov/ds-react";

/* Каркас одинаков во всех приложениях. Приложение передаёт только данные ниже. */

export interface SidebarSection { id: string; label: string; icon: IconComponent; active?: boolean; onSelect: () => void; badge?: { value: number | string; label: string } }
export interface SidebarEntry { id: string; label: string; active?: boolean; /** Агент сейчас отвечает — фирменная сфера. */ working?: boolean; /** Есть непросмотренное — точка. */ unread?: boolean; onSelect: () => void; menu?: MenuEntry[] }
export interface SidebarGroup { id: string; label: string; entries: SidebarEntry[]; /** Кнопка «+» у заголовка группы. */ add?: { label: string; onSelect: () => void }; /** Сколько строк видно до «Показать все». */ limit?: number; collapsible?: boolean }
export interface SidebarSectionGroup { id: string; label: string; sections: SidebarSection[] }
export interface SidebarAccount { name: string; initials?: string; /** Вторая строка по умолчанию. */ email?: string; /** Если передан — показывается вместо почты. */ plan?: string; menu: MenuEntry[]; onSettings: () => void }

export interface ChatSidebarShellProps {
  brand: { label: string; logo: ReactNode };
  /** Главное действие под названием. Необязательно. */
  primaryAction?: { label: string; icon: IconComponent; onSelect: () => void; shortcut?: string };
  /** Разделы без подписи группы — сразу под главным действием. */
  sections?: SidebarSection[];
  /** Группы разделов со значками и подписью («Обучение», «Маркетинг»). В свёрнутом виде — значки через разделитель. */
  sectionGroups?: SidebarSectionGroup[];
  /** Группы строк без значков (проекты, история чатов). В свёрнутом виде скрыты. */
  groups?: SidebarGroup[];
  account: SidebarAccount;
  onSearch?: () => void;
  header?: ReactNode;
  children: ReactNode;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Только для прототипа: открыть мобильную панель сразу. */
  defaultDrawerOpen?: boolean;
}

const query = "(max-width: 700px)";
const subscribe = (fn: () => void) => { const m = matchMedia(query); m.addEventListener("change", fn); return () => m.removeEventListener("change", fn); };
const useCompact = () => useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false);

export function ChatSidebarShell(props: ChatSidebarShellProps) {
  const { collapsed, onCollapsedChange, header, children } = props;
  const compact = useCompact();
  const [open, setOpen] = useState(!!props.defaultDrawerOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { const d = dialog.current; if (open && compact) { if (d && !d.open) { d.showModal(); d.focus(); } } else d?.close(); }, [open, compact]);
  const rail = !compact && collapsed;
  return <div className={["ykb-shell", rail && "ykb-shell--rail", compact && "ykb-shell--compact"].filter(Boolean).join(" ")}>
    {!compact && <aside className="ykb-sidebar"><SidebarContent {...props} rail={rail} onToggle={() => onCollapsedChange(!collapsed)} /></aside>}
    <div className="ykb-workspace">
      <header className="ykb-header">
        {compact && <Button ref={trigger} variant="ghost" icon={SidebarSimpleIcon} aria-label="Открыть навигацию" aria-expanded={open} onClick={() => setOpen(true)} />}
        {header}
      </header>
      <main className="ykb-content">{children}</main>
    </div>
    {compact && <dialog ref={dialog} className="ykb-drawer" tabIndex={-1} aria-label="Навигация приложения"
      onCancel={e => { e.preventDefault(); setOpen(false); }} onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="ykb-sidebar"><SidebarContent {...props} rail={false} mobile onToggle={() => setOpen(false)} onPicked={() => setOpen(false)} /></div>
    </dialog>}
  </div>;
}

function SidebarContent({ brand, primaryAction, sections = [], sectionGroups = [], groups = [], account, onSearch, rail, mobile, onToggle, onPicked }:
  ChatSidebarShellProps & { rail: boolean; mobile?: boolean; onToggle: () => void; onPicked?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const pick = (fn: () => void) => () => { fn(); onPicked?.(); };
  const toggleLabel = mobile ? "Закрыть навигацию" : rail ? "Развернуть навигацию" : "Свернуть навигацию";
  return <>
    {/* Верх: всегда на месте */}
    <div className={"ykb-top" + (scrolled ? " ykb-top--lifted" : "")}>
      <div className="ykb-brand-row">
        {!rail && <span className="ykb-brand">{brand.logo}<span>{brand.label}</span></span>}
        <span className="ykb-top-tools">
          {!rail && onSearch && <Button variant="ghost" icon={MagnifyingGlassIcon} aria-label="Поиск" title="Поиск · ⌘K" onClick={pick(onSearch)} />}
          <Button variant="ghost" icon={mobile ? XIcon : SidebarSimpleIcon} aria-label={toggleLabel} title={toggleLabel} aria-expanded={mobile ? undefined : !rail} onClick={onToggle} />
        </span>
      </div>
      {primaryAction && <button type="button" className="ykb-primary" onClick={pick(primaryAction.onSelect)}
        aria-label={rail ? primaryAction.label : undefined} title={rail ? `${primaryAction.label}${primaryAction.shortcut ? " · " + primaryAction.shortcut : ""}` : undefined}>
        <Icon icon={primaryAction.icon} size={18} />
        {!rail && <><span>{primaryAction.label}</span>{primaryAction.shortcut && <kbd>{primaryAction.shortcut}</kbd>}</>}
      </button>}
    </div>

    {/* Середина: прокручивается только она */}
    <div className="ykb-middle" onScroll={e => setScrolled(e.currentTarget.scrollTop > 2)}>
      {(sections.length > 0 || sectionGroups.length > 0) && <nav aria-label="Разделы" className="ykb-sections">
        {sections.map(s => <SectionItem key={s.id} section={s} rail={rail} onPick={pick(s.onSelect)} />)}
        {sectionGroups.map((g, i) => <div key={g.id} role="group" aria-label={g.label} className="ykb-section-group">
          {rail ? (i > 0 || sections.length > 0) && <hr className="ykb-rail-divider" />
            : <div className="ykb-group-head"><span className="ykb-group-title"><MonoLabel>{g.label}</MonoLabel></span></div>}
          {g.sections.map(s => <SectionItem key={s.id} section={s} rail={rail} onPick={pick(s.onSelect)} />)}
        </div>)}
      </nav>}
      {!rail && groups.map(g => <Group key={g.id} group={g} onPicked={onPicked} />)}
    </div>

    {/* Низ: аккаунт и настройки */}
    <div className="ykb-bottom">
      <Menu label="Аккаунт" entries={account.menu} trigger={
        <button type="button" className="ykb-account" aria-label={rail ? `Аккаунт: ${account.name}` : undefined} title={rail ? account.name : undefined}>
          <Avatar name={account.name} initials={account.initials} size="md" />
          {!rail && <span className="ykb-account-text"><span>{account.name}</span>{account.plan ? <MonoLabel>{account.plan}</MonoLabel> : account.email && <span className="ykb-account-email">{account.email}</span>}</span>}
        </button>} />
      {!rail && <Button variant="ghost" icon={GearSixIcon} aria-label="Настройки" title="Настройки" onClick={pick(account.onSettings)} />}
    </div>
  </>;
}

function SectionItem({ section: s, rail, onPick }: { section: SidebarSection; rail: boolean; onPick: () => void }) {
  return <button type="button" className="ykb-item" aria-current={s.active ? "page" : undefined}
    aria-label={rail ? (s.badge ? `${s.label}, ${s.badge.label}` : s.label) : undefined} title={rail ? s.label : undefined} onClick={onPick}>
    <Icon icon={s.icon} size={20} weight={s.active ? "fill" : "regular"} />
    {!rail && <span className="ykb-label">{s.label}</span>}
    {s.badge && <span className="ykb-badge" aria-label={rail ? undefined : s.badge.label} aria-hidden={rail || undefined}>{s.badge.value}</span>}
  </button>;
}

function Group({ group, onPicked }: { group: SidebarGroup; onPicked?: () => void }) {
  const [folded, setFolded] = useState(false);
  const [all, setAll] = useState(false);
  const id = useId();
  const limit = group.limit ?? Infinity;
  const shown = all ? group.entries : group.entries.slice(0, limit);
  const title = <><MonoLabel>{group.label}</MonoLabel><MonoNum className="ykb-group-count">{group.entries.length}</MonoNum></>;
  return <section className="ykb-group" aria-labelledby={id}>
    <div className="ykb-group-head">
      {group.collapsible
        ? <button type="button" id={id} className="ykb-group-title" aria-expanded={!folded} onClick={() => setFolded(!folded)}>{title}<Icon icon={CaretDownIcon} size={12} className={"ykb-caret" + (folded ? " ykb-caret--folded" : "")} /></button>
        : <h2 id={id} className="ykb-group-title">{title}</h2>}
      {group.add && <Button variant="ghost" size="sm" icon={PlusIcon} aria-label={group.add.label} title={group.add.label} onClick={group.add.onSelect} />}
    </div>
    {!folded && <ul className="ykb-entries">
      {shown.map(e => <li key={e.id} className="ykb-entry-row">
        <button type="button" className="ykb-entry" aria-current={e.active ? "page" : undefined} onClick={() => { e.onSelect(); onPicked?.(); }}>
          <span className="ykb-label">{e.label}</span>
          {e.working && <Sphere size={14} label="Агент отвечает" />}
          {!e.working && e.unread && <NewDot label="Есть новое" />}
        </button>
        {e.menu && <span className="ykb-entry-more"><Menu label={`Действия: ${e.label}`} entries={e.menu} trigger={<Button variant="ghost" size="sm" icon={DotsThreeIcon} aria-label={`Действия: ${e.label}`} />} /></span>}
      </li>)}
      {group.entries.length > limit && <li><button type="button" className="ykb-entry ykb-entry--more" onClick={() => setAll(!all)}>
        <span className="ykb-label">{all ? "Свернуть" : `Показать все · ${group.entries.length}`}</span></button></li>}
    </ul>}
  </section>;
}
