import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, EmptyState, MonoLabel, SegmentedControl, Sphere, ToastProvider, useToast, type MenuEntry } from "@ykurilov/ds-react";
import {
  BookOpenIcon, BrowserIcon, CalendarBlankIcon, ChartBarIcon, ChatCircleIcon, ClipboardTextIcon, CreditCardIcon, EnvelopeIcon,
  FolderSimpleIcon, GearSixIcon, HouseIcon, KanbanIcon, KeyboardIcon, ListChecksIcon, MegaphoneIcon, NotePencilIcon, PlugsIcon,
  PlusIcon, QuestionIcon, ReceiptIcon, SignOutIcon, StudentIcon, TagIcon, TicketIcon, TrayIcon, UserIcon, UsersIcon,
} from "@phosphor-icons/react";
import { WorkShell, type SidebarGroup, type SidebarItem, type WorkShellProps } from "./WorkShell";
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import "./work-shell.css";
import "./page.css";

type AppKind = "chat" | "admin";
const params = new URLSearchParams(location.search);

const chatTitles = ["План запуска курса по нейросетям", "Разбор отзывов участников потока", "Письмо для прогрева — третья версия", "Сценарий эфира на четверг",
  "Почему падает конверсия лендинга", "Структура модуля про агентов", "Ответы на частые вопросы кураторов", "Таблица тарифов и бонусов",
  "Идеи для рилс про Бали", "Текст оффера для интенсива", "Сравнение платёжных сервисов", "Расписание созвонов на ноябрь",
  "Анализ продаж за октябрь", "Квиз по третьему уроку", "Пост для сообщества ВКонтакте", "Черновик договора с подрядчиком",
  "Что поправить в онбординге", "Заголовки для рассылки", "Разбор домашних заданий группы Б", "Сводка встречи с командой",
  "Перевод урока на английский", "Вопросы для распаковки эксперта", "Описание бонусного модуля", "Как настроить автоворонку",
  "Список задач на запуск", "Ответ клиенту про возврат", "Сценарий видео-приглашения", "Идеи названий для подкаста",
  "Отчёт по рекламе за неделю", "Шаблон приветственного письма", "Проверка текста лендинга", "Конспект эфира про промпты",
  "Чек-лист перед вебинаром", "Новые темы для марафона", "Кейсы участников для отзывов", "Подготовка презентации",
  "Сегменты базы для рассылки", "Правила для чата участников", "Как объяснить тариф «Про»", "Итоги потока и выводы"];

function chatApp(): Pick<WorkShellProps, "brand" | "primaryAction" | "groups"> {
  return {
    brand: { label: "Мастерская", logo: <Sphere size={22} label="Мастерская" /> },
    primaryAction: { label: "Новый чат", icon: NotePencilIcon, shortcut: "C", onSelect: () => {} },
    groups: [
      { id: "main", items: [
        { id: "home", label: "Главная", icon: HouseIcon },
        { id: "inbox", label: "Входящие", icon: TrayIcon, badge: { value: 4, label: "4 непрочитанных", tone: "attention" } },
        { id: "tasks", label: "Задачи", icon: ListChecksIcon, badge: { value: 23, label: "23 открытых" } },
        { id: "calendar", label: "Календарь", icon: CalendarBlankIcon },
        { id: "library", label: "Материалы", icon: BookOpenIcon },
      ] },
      { id: "projects", title: "Проекты", kind: "list", collapsible: true, items: [
        { id: "p1", label: "Запуск курса «Агенты»", icon: FolderSimpleIcon, badge: { value: 12, label: "12 чатов" } },
        { id: "p2", label: "Сайт школы", icon: FolderSimpleIcon, badge: { value: 5, label: "5 чатов" } },
        { id: "p3", label: "Подкаст о вайб-кодинге", icon: FolderSimpleIcon, badge: { value: 3, label: "3 чата" } },
      ] },
      { id: "history", title: "Недавние чаты", kind: "list", collapsible: true, limit: 15,
        items: chatTitles.map((label, i) => ({ id: "chat" + i, label })) },
    ],
  };
}

function adminApp(): Pick<WorkShellProps, "brand" | "primaryAction" | "groups"> {
  return {
    brand: { label: "Кабинет школы", logo: <Sphere size={22} label="Кабинет школы" /> },
    primaryAction: { label: "Создать", icon: PlusIcon, shortcut: "C", onSelect: () => {} },
    groups: [
      { id: "work", items: [
        { id: "home", label: "Обзор", icon: HouseIcon },
        { id: "leads", label: "Заявки", icon: TrayIcon, badge: { value: 8, label: "8 новых", tone: "attention" } },
        { id: "orders", label: "Заказы", icon: ReceiptIcon, badge: { value: 124, label: "124 заказа" } },
        { id: "clients", label: "Клиенты", icon: UsersIcon, badge: { value: "3,2к", label: "3 210 клиентов" } },
        { id: "payments", label: "Платежи", icon: CreditCardIcon },
      ] },
      { id: "learning", title: "Обучение", collapsible: true, items: [
        { id: "courses", label: "Курсы", icon: StudentIcon, badge: { value: 14, label: "14 курсов" } },
        { id: "homework", label: "Домашние задания", icon: ClipboardTextIcon, badge: { value: 27, label: "27 ждут проверки", tone: "attention" } },
        { id: "schedule", label: "Расписание", icon: CalendarBlankIcon },
        { id: "board", label: "Доска кураторов", icon: KanbanIcon },
      ] },
      { id: "marketing", title: "Маркетинг", collapsible: true, items: [
        { id: "mail", label: "Рассылки", icon: EnvelopeIcon, badge: { value: 2, label: "2 в черновиках" } },
        { id: "landings", label: "Лендинги", icon: BrowserIcon },
        { id: "promo", label: "Промокоды", icon: TicketIcon },
        { id: "ads", label: "Реклама", icon: MegaphoneIcon },
        { id: "reports", label: "Отчёты", icon: ChartBarIcon },
      ] },
      { id: "system", title: "Система", collapsible: true, defaultCollapsed: true, items: [
        { id: "integrations", label: "Интеграции", icon: PlugsIcon, badge: { value: 1, label: "1 ошибка", tone: "attention" } },
        { id: "tags", label: "Метки", icon: TagIcon },
        { id: "chat-log", label: "Журнал агента", icon: ChatCircleIcon },
      ] },
    ],
  };
}

type AccountKind = "plan" | "email" | "name";
function Demo({ app, collapsed, setCollapsed, accountKind }: { app: AppKind; collapsed: boolean; setCollapsed: (v: boolean) => void; accountKind: AccountKind }) {
  const toast = useToast();
  const data = app === "chat" ? chatApp() : adminApp();
  const [active, setActive] = useState<SidebarItem>(data.groups[0].items[0]);
  useEffect(() => setActive(data.groups[0].items[0]), [app]);
  const say = (text: string) => () => toast.show({ message: text });
  const menu: MenuEntry[] = [
    { label: "Профиль", icon: UserIcon, onSelect: say("Профиль") },
    ...(accountKind === "plan" ? [{ label: "Тариф и оплата", icon: CreditCardIcon, onSelect: say("Тариф и оплата") }] : []),
    { label: "Горячие клавиши", icon: KeyboardIcon, shortcut: "?", onSelect: say("Горячие клавиши") },
    { label: "Помощь", icon: QuestionIcon, onSelect: say("Помощь") },
    "separator",
    { label: "Выйти", icon: SignOutIcon, danger: true, onSelect: say("Выход") },
  ];
  return <WorkShell key={app} {...data} primaryAction={{ ...data.primaryAction!, onSelect: say(data.primaryAction!.label) }}
    activeId={active.id} onSelect={setActive} collapsed={collapsed} onCollapsedChange={setCollapsed}
    storageKey={`sidebar-c-${app}`} defaultMobileOpen={params.has("open")}
    account={{ name: "Юрий Курилов", initials: "ЮК", menu,
      email: accountKind === "name" ? undefined : "ykurilov@gmail.com",
      plan: accountKind === "plan" ? (app === "chat" ? "Тариф Про" : "Тариф Школа") : undefined }}
    onSettings={say("Настройки")}
    header={<><span className="page-crumb">{active.label}</span><span className="page-header-spacer" />
      <Button variant="ghost" size="sm" icon={GearSixIcon} aria-label="Параметры раздела" /></>}>
    <div className="page-empty">
      <EmptyState label={`${active.label} · 0`} title="Здесь пока пусто" description="Рабочий экран раздела. Панель слева — стандарт, который приложение получает без правок." />
      <div className="page-keys">
        <MonoLabel>Клавиатура</MonoLabel>
        <dl>
          <dt><kbd>⌘K</kbd> <kbd>/</kbd></dt><dd>Поиск по разделам и чатам</dd>
          <dt><kbd>[</kbd></dt><dd>Свернуть или раскрыть панель</dd>
          <dt><kbd>C</kbd></dt><dd>{data.primaryAction!.label}</dd>
          <dt><kbd>⌥1</kbd>…<kbd>⌥9</kbd></dt><dd>Перейти к разделу по номеру</dd>
          <dt><kbd>↑</kbd> <kbd>↓</kbd></dt><dd>Ходить по строкам панели</dd>
          <dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Свернуть или раскрыть группу</dd>
        </dl>
      </div>
    </div>
  </WorkShell>;
}

function Page() {
  const [app, setApp] = useState<AppKind>((params.get("app") as AppKind) ?? "chat");
  const [view, setView] = useState(params.get("view") ?? "expanded");
  const [dark, setDark] = useState(params.get("theme") === "dark");
  const [accountKind, setAccountKind] = useState<AccountKind>((params.get("account") as AccountKind) ?? "email");
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  if (params.has("frame")) return <ToastProvider><Demo app={app} accountKind={accountKind} collapsed={false} setCollapsed={() => {}} /></ToastProvider>;
  return <div className="page">
    <div className="page-bar">
      <div><MonoLabel>Одуванчик · Сайдбар · вариант C</MonoLabel><span className="page-title">Плотная панель рабочего приложения</span></div>
      <div className="page-controls">
        <SegmentedControl size="sm" aria-label="Тип приложения" value={app} onValueChange={v => setApp(v as AppKind)}
          options={[{ value: "chat", label: "Чат и разделы" }, { value: "admin", label: "Только разделы" }]} />
        <SegmentedControl size="sm" aria-label="Состояние панели" value={view} onValueChange={setView}
          options={[{ value: "expanded", label: "Раскрыто" }, { value: "collapsed", label: "Свёрнуто" }, { value: "phone", label: "Телефон" }]} />
        <SegmentedControl size="sm" aria-label="Вторая строка аккаунта" value={accountKind} onValueChange={v => setAccountKind(v as AccountKind)}
          options={[{ value: "plan", label: "Тариф" }, { value: "email", label: "Почта" }, { value: "name", label: "Только имя" }]} />
        <SegmentedControl size="sm" aria-label="Тема" value={dark ? "dark" : "light"} onValueChange={v => setDark(v === "dark")}
          options={[{ value: "light", label: "Светлая" }, { value: "dark", label: "Тёмная" }]} />
      </div>
    </div>
    <div className={"page-preview" + (view === "phone" ? " page-preview--phone" : "")}>
      {view === "phone"
        ? <iframe key={app + dark + accountKind} title="Телефон" src={`/?frame&app=${app}&account=${accountKind}&theme=${dark ? "dark" : "light"}&open`} />
        : <ToastProvider><Demo app={app} accountKind={accountKind} collapsed={view === "collapsed"} setCollapsed={c => setView(c ? "collapsed" : "expanded")} /></ToastProvider>}
    </div>
  </div>;
}

createRoot(document.getElementById("root")!).render(<Page />);
