import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, MonoLabel, MonoNum, SegmentedControl, Sphere, Icon, Switch } from "@ykurilov/ds-react";
import {
  ChatCircleIcon, CompassIcon, BookOpenIcon, LightningIcon, NotePencilIcon, MoonIcon, SunIcon,
  PaperclipIcon, ArrowUpIcon, UserIcon, CreditCardIcon, SignOutIcon, QuestionIcon, PencilSimpleIcon, PushPinIcon, TrashIcon, CaretDownIcon,
  SquaresFourIcon, CalendarBlankIcon, UsersThreeIcon, GraduationCapIcon, VideoCameraIcon, ExamIcon, CertificateIcon,
  MegaphoneIcon, EnvelopeSimpleIcon, LinkSimpleIcon, ShoppingCartIcon, ReceiptIcon, ChartLineUpIcon, PlusIcon,
} from "@phosphor-icons/react";
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import { ChatSidebarShell, type SidebarGroup } from "./ChatSidebarShell";
import "./chat-sidebar.css";
import "./demo.css";

const params = new URLSearchParams(location.search);
const sectionList = [
  { id: "chats", label: "Чаты", icon: ChatCircleIcon },
  { id: "agents", label: "Агенты", icon: LightningIcon },
  { id: "library", label: "Библиотека", icon: BookOpenIcon, badge: { value: 3, label: "3 новых файла" } },
  { id: "explore", label: "Обзор возможностей", icon: CompassIcon },
];
const projects = ["Курс «Вайб-кодинг»", "Запуск интенсива в ноябре", "Сайт школы", "Личные финансы"];
const history: [string, string[]][] = [
  ["Сегодня", ["Сценарий вебинара о том, как агенты пишут код за ночь", "Ответ ученику про ошибку деплоя", "План постов на неделю"]],
  ["Вчера", ["Разбор лендинга интенсива", "Как настроить домен и почту на новом сервере без простоя", "Идеи названий для курса"]],
  ["Прошлая неделя", ["Сравнение моделей для чата поддержки", "Конспект эфира от 30 октября", "Письмо партнёрам", "Таблица цен на тарифы", "Перевод статьи о кэше моделей"]],
  ["Октябрь", ["Структура модуля 3", "Вопросы для интервью с учениками", "Рецепт ужина на неделю", "Черновик договора", "Отзыв на книгу", "Список дел к переезду", "Тексты для рассылки", "Проверка гипотез запуска"]],
];
const entryMenu = [{ label: "Переименовать", icon: PencilSimpleIcon, onSelect() {} }, { label: "Закрепить", icon: PushPinIcon, onSelect() {} }, "separator" as const, { label: "Удалить", icon: TrashIcon, danger: true, onSelect() {} }];

function ChatApp({ collapsed, setCollapsed, accountMode }: { collapsed: boolean; setCollapsed: (v: boolean) => void; accountMode: string }) {
  const [active, setActive] = useState("chats");
  const [chat, setChat] = useState<string | null>(null);
  const groups: SidebarGroup[] = [
    { id: "projects", label: "Проекты", collapsible: true, add: { label: "Новый проект", onSelect() {} },
      entries: projects.map(p => ({ id: p, label: p, active: chat === p, onSelect: () => setChat(p), menu: entryMenu })) },
    ...history.map(([label, items], gi) => ({ id: label, label, entries: items.map((t, i) => ({ id: t, label: t, active: chat === t,
      working: gi === 0 && i === 0, unread: gi === 0 && i === 1, onSelect: () => setChat(t), menu: entryMenu })) })),
  ];
  return <ChatSidebarShell collapsed={collapsed} onCollapsedChange={setCollapsed} defaultDrawerOpen={params.has("open")}
    brand={{ label: "Агент Юрия", logo: <Sphere size={22} label="Агент Юрия" /> }}
    primaryAction={{ label: "Новый чат", icon: NotePencilIcon, shortcut: "⇧⌘O", onSelect: () => setChat(null) }}
    onSearch={() => {}}
    sections={sectionList.map(s => ({ ...s, active: s.id === active && !chat, onSelect: () => { setActive(s.id); setChat(null); } }))}
    groups={groups}
    account={{ name: "Юрий Курилов", initials: "ЮК", email: accountMode === "name" ? undefined : "ykurilov@gmail.com", plan: accountMode === "plan" ? "Тариф Про · 82%" : undefined, onSettings() {},
      menu: [{ label: "Профиль", icon: UserIcon, onSelect() {} }, { label: "Тариф и оплата", icon: CreditCardIcon, onSelect() {} },
        { label: "Помощь", icon: QuestionIcon, onSelect() {} }, "separator", { label: "Выйти", icon: SignOutIcon, danger: true, onSelect() {} }] }}
    header={<><button type="button" className="demo-model">Агент · Opus <Icon icon={CaretDownIcon} size={12} /></button><span className="demo-spacer" /><span className="demo-chat-title">{chat ?? ""}</span></>}>
    <div className="demo-empty">
      <div className="demo-hero"><Sphere size={56} /><h1>С чего начнём, Юрий?</h1></div>
      <div className="demo-composer">
        <div className="demo-composer-input">Спросите агента или опишите задачу</div>
        <div className="demo-composer-row"><Button variant="ghost" size="sm" icon={PaperclipIcon} aria-label="Приложить файл" /><span className="demo-spacer" /><Button variant="primary" size="sm" icon={ArrowUpIcon} aria-label="Отправить" /></div>
      </div>
      <div className="demo-hints">{["Разобрать лендинг", "Написать письмо", "Составить план"].map(h => <button type="button" key={h}>{h}</button>)}</div>
    </div>
  </ChatSidebarShell>;
}

const schoolGroups = [
  { id: "main", label: "Основное", sections: [{ id: "overview", label: "Обзор", icon: SquaresFourIcon }, { id: "schedule", label: "Расписание", icon: CalendarBlankIcon }, { id: "students", label: "Ученики", icon: UsersThreeIcon, badge: { value: 12, label: "12 новых заявок" } }] },
  { id: "learning", label: "Обучение", sections: [{ id: "courses", label: "Курсы", icon: GraduationCapIcon }, { id: "webinars", label: "Эфиры и записи", icon: VideoCameraIcon }, { id: "homework", label: "Домашние задания", icon: ExamIcon, badge: { value: 5, label: "5 работ ждут проверки" } }, { id: "certs", label: "Сертификаты", icon: CertificateIcon }] },
  { id: "marketing", label: "Маркетинг", sections: [{ id: "landings", label: "Лендинги", icon: MegaphoneIcon }, { id: "mailing", label: "Рассылки", icon: EnvelopeSimpleIcon }, { id: "utm", label: "Партнёрские ссылки", icon: LinkSimpleIcon }] },
  { id: "sales", label: "Продажи", sections: [{ id: "orders", label: "Заказы", icon: ShoppingCartIcon }, { id: "payments", label: "Платежи", icon: ReceiptIcon }, { id: "reports", label: "Отчёты", icon: ChartLineUpIcon }] },
];
const stats = [["Ученики", "1 284"], ["Выручка за месяц", "₽ 842 000"], ["Работ на проверке", "5"]];

function SchoolApp({ collapsed, setCollapsed, accountMode, withAction }: { collapsed: boolean; setCollapsed: (v: boolean) => void; accountMode: string; withAction: boolean }) {
  const [active, setActive] = useState("overview");
  const all = schoolGroups.flatMap(g => g.sections);
  const current = all.find(s => s.id === active)!;
  return <ChatSidebarShell collapsed={collapsed} onCollapsedChange={setCollapsed} defaultDrawerOpen={params.has("open")}
    brand={{ label: "Гильдия", logo: <span className="demo-logo">Г</span> }}
    primaryAction={withAction ? { label: "Создать", icon: PlusIcon, shortcut: "⌘N", onSelect() {} } : undefined}
    onSearch={() => {}}
    sectionGroups={schoolGroups.map(g => ({ ...g, sections: g.sections.map(s => ({ ...s, active: s.id === active, onSelect: () => setActive(s.id) })) }))}
    account={{ name: "Юрий Курилов", initials: "ЮК", email: accountMode === "name" ? undefined : "ykurilov@gmail.com", plan: accountMode === "plan" ? "Тариф Бизнес" : undefined, onSettings() {},
      menu: [{ label: "Профиль", icon: UserIcon, onSelect() {} }, { label: "Помощь", icon: QuestionIcon, onSelect() {} }, "separator", { label: "Выйти", icon: SignOutIcon, danger: true, onSelect() {} }] }}
    header={<span className="demo-section-title">{current.label}</span>}>
    <div className="demo-dashboard">
      <MonoLabel>Кабинет школы</MonoLabel>
      <h1>{current.label}</h1>
      <div className="demo-stats">{stats.map(([label, value]) => <div key={label} className="demo-stat"><MonoLabel>{label}</MonoLabel><MonoNum>{value}</MonoNum></div>)}</div>
      <div className="demo-table">{["Курс «Вайб-кодинг» · поток 7", "Интенсив «Агенты за выходные»", "Мастер-класс по запуску", "Клуб «Мастерская»"].map((t, i) => <div key={t} className="demo-row"><span>{t}</span><MonoNum>{[214, 96, 340, 512][i]}</MonoNum></div>)}</div>
    </div>
  </ChatSidebarShell>;
}

function Prototype() {
  const [dark, setDark] = useState(params.get("theme") === "dark");
  const [mode, setMode] = useState<string>(params.get("mode") ?? "open");
  const [accountMode, setAccountMode] = useState<string>(params.get("account") ?? "email");
  const [kind, setKind] = useState<string>(params.get("kind") ?? "chat");
  const [withAction, setWithAction] = useState(params.get("primary") !== "none");
  const app = (collapsed: boolean, setCollapsed: (v: boolean) => void, acc: string, k: string) => k === "sections"
    ? <SchoolApp collapsed={collapsed} setCollapsed={setCollapsed} accountMode={acc} withAction={withAction} />
    : <ChatApp collapsed={collapsed} setCollapsed={setCollapsed} accountMode={acc} />;
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  if (params.has("frame")) return app(false, () => {}, params.get("account") ?? "email", params.get("kind") ?? "chat");
  return <div className="proto">
    <div className="proto-bar">
      <div><MonoLabel>Одуванчик · Сайдбар · Вариант B</MonoLabel><span className="proto-title">Структура Gemini в характере системы</span></div>
      <div className="proto-controls">
        <SegmentedControl aria-label="Тип приложения" size="sm" value={kind} onValueChange={setKind}
          options={[{ value: "chat", label: "Чат и разделы" }, { value: "sections", label: "Только разделы" }]} />
        {kind === "sections" && <Switch checked={withAction} onCheckedChange={setWithAction}>«Создать»</Switch>}
        <SegmentedControl aria-label="Аккаунт" size="sm" value={accountMode} onValueChange={setAccountMode}
          options={[{ value: "plan", label: "Тариф" }, { value: "email", label: "Почта" }, { value: "name", label: "Только имя" }]} />
        <SegmentedControl aria-label="Состояние" size="sm" value={mode} onValueChange={setMode}
          options={[{ value: "open", label: "Раскрыто" }, { value: "rail", label: "Свёрнуто" }, { value: "phone", label: "Телефон" }]} />
        <Button variant="ghost" icon={dark ? SunIcon : MoonIcon} aria-label={dark ? "Светлая тема" : "Тёмная тема"} onClick={() => setDark(!dark)} />
      </div>
    </div>
    <div className={"proto-preview" + (mode === "phone" ? " proto-preview--phone" : "")}>
      {mode === "phone"
        ? <iframe key={String(dark) + accountMode + kind + withAction} title="Телефон" src={`/?frame&open&kind=${kind}${withAction ? "" : "&primary=none"}&account=${accountMode}&theme=${dark ? "dark" : "light"}`} />
        : app(mode === "rail", v => setMode(v ? "rail" : "open"), accountMode, kind)}
    </div>
  </div>;
}

createRoot(document.getElementById("root")!).render(<Prototype />);
