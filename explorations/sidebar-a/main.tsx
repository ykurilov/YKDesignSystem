import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sphere, Button, Icon, SegmentedControl, MonoLabel, Dialog, RadioGroup, Radio } from "@ykurilov/ds-react";
import {
  HouseIcon, UsersThreeIcon, ChartLineUpIcon, GraduationCapIcon, VideoIcon, ExamIcon, CertificateIcon,
  MegaphoneIcon, EnvelopeSimpleIcon, TagIcon, FunnelIcon, ReceiptIcon, WalletIcon, PlusIcon, PlugsConnectedIcon,
} from "@phosphor-icons/react";
import type { MenuEntry } from "@ykurilov/ds-react";
import {
  NotePencilIcon, CheckSquareOffsetIcon, BooksIcon, RobotIcon, FolderSimpleIcon,
  UserIcon, CreditCardIcon, GearSixIcon, QuestionIcon, SignOutIcon, PaperclipIcon, ArrowUpIcon, CaretDownIcon,
} from "@phosphor-icons/react";
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import "./sidebar.css";
import "./demo.css";
import { SidebarShell, type SidebarItem } from "./AppSidebar";

const params = new URLSearchParams(location.search);
type View = "expanded" | "collapsed" | "phone";

const PROJECTS = ["Запуск интенсива", "Курс по агентам", "Сайт школы", "Личные финансы", "Рецепты и меню", "Поездка на Бали"];
const CHATS = [
  "План эфира про агентов на четверг", "Разбор отзывов участников после третьего модуля интенсива",
  "Письмо для рассылки", "Как настроить кэш модели в чате", "Идеи для обложки курса", "Сравнение тарифов хостинга",
  "Сценарий ролика про Бали", "Квиз по второму уроку", "Договор с подрядчиком: что проверить",
  "Расписание занятий на ноябрь", "Ответы на частые вопросы", "Структура лендинга", "Рецепт тыквенного супа",
  "Таблица расходов за октябрь", "Перевод статьи о памяти агентов", "Тексты для кнопок в приложении",
  "Почему падает сборка на сервере", "Названия для нового продукта", "Подарок на день рождения",
  "Список дел на выходные", "Конспект встречи с командой", "Вопросы для интервью", "Подбор шрифтов для презентации",
  "Как объяснить детям дроби", "Маршрут прогулки по Убуду", "Черновик поста для сообщества",
];

type AccountMode = "plan" | "email" | "name";
type AppMode = "chat" | "sections";

const accountOf = (mode: AccountMode, go: (s: string) => void) => ({
  name: "Юрий Курилов", initials: "ЮК", email: "ykurilov@gmail.com", plan: "Тариф «Про»", show: mode,
  menu: [
    { label: "Профиль", icon: UserIcon, onSelect: () => go("Профиль") },
    { label: "Настройки", icon: GearSixIcon, onSelect: () => go("Настройки") },
    { label: "Помощь", icon: QuestionIcon, onSelect: () => go("Помощь") },
    "separator" as const,
    { label: "Выйти", icon: SignOutIcon, danger: true, onSelect: () => {} },
  ] as MenuEntry[],
});

/* Кабинет онлайн-школы: только разделы, без агента и чатов */
function SchoolApp(mode: AccountMode, withPrimary: boolean, active: string, setActive: (s: string) => void) {
  const item = (label: string, icon: SidebarItem["icon"], hasNew = false): SidebarItem =>
    ({ id: label, label, icon, hasNew, active: active === label, onSelect: () => setActive(label) });
  return {
    brand: { label: "Школа", logo: <span className="school-logo"><Icon icon={GraduationCapIcon} size={16} weight="fill" /></span> },
    ...(withPrimary && { primaryAction: { label: "Создать", icon: PlusIcon, onSelect: () => setActive("Создать") } }),
    sections: [item("Обзор", HouseIcon), item("Ученики", UsersThreeIcon, true), item("Аналитика", ChartLineUpIcon)],
    groups: [
      { id: "learn", label: "Обучение", iconsWhenCollapsed: true, items: [item("Курсы", GraduationCapIcon), item("Эфиры и записи", VideoIcon), item("Тесты и задания", ExamIcon), item("Сертификаты", CertificateIcon)] },
      { id: "marketing", label: "Маркетинг", iconsWhenCollapsed: true, items: [item("Рассылки", EnvelopeSimpleIcon), item("Воронки", FunnelIcon), item("Акции и промокоды", TagIcon), item("Реклама", MegaphoneIcon)] },
      { id: "money", label: "Финансы", iconsWhenCollapsed: true, items: [item("Заказы", ReceiptIcon), item("Выплаты", WalletIcon), item("Интеграции", PlugsConnectedIcon)] },
    ],
    account: accountOf(mode, setActive),
    onSearch: () => setActive("Поиск"),
    onSettings: () => setActive("Настройки"),
  };
}
function ChatApp(mode: AccountMode) {
  const [active, setActive] = useState(CHATS[0]);
  const item = (label: string, icon?: SidebarItem["icon"], hasNew = false): SidebarItem =>
    ({ id: label, label, icon, hasNew, active: active === label, onSelect: () => setActive(label) });
  return {
    brand: { label: "Агент", logo: <Sphere size={22} label="Агент" /> },
    primaryAction: { label: "Новый чат", icon: NotePencilIcon, onSelect: () => setActive("Новый чат") },
    sections: [item("Задачи", CheckSquareOffsetIcon, true), item("Библиотека", BooksIcon), item("Агенты", RobotIcon)],
    groups: [
      { id: "projects", label: "Проекты", items: PROJECTS.map(p => item(p, FolderSimpleIcon)), visibleCount: 4 },
      { id: "recent", label: "Недавние", items: CHATS.map(c => item(c)) },
    ],
    account: {
      name: "Юрий Курилов", initials: "ЮК", email: "ykurilov@gmail.com", plan: "Тариф «Про»", show: mode,
      menu: [
        { label: "Профиль", icon: UserIcon, onSelect: () => setActive("Профиль") },
        { label: "Тариф и оплата", icon: CreditCardIcon, onSelect: () => setActive("Тариф") },
        { label: "Настройки", icon: GearSixIcon, onSelect: () => setActive("Настройки") },
        { label: "Помощь", icon: QuestionIcon, onSelect: () => setActive("Помощь") },
        "separator" as const,
        { label: "Выйти", icon: SignOutIcon, danger: true, onSelect: () => {} },
      ],
    },
    onSearch: () => setActive("Поиск"),
    onSettings: () => setActive("Настройки"),
  };
}

function Demo({ view, setView, account, app, withPrimary }: { view: View; setView?: (v: View) => void; account: AccountMode; app: AppMode; withPrimary: boolean }) {
  const [section, setSection] = useState("Обзор");
  const [theme, setTheme] = useState<Theme>((params.get("theme") as Theme) ?? "system");
  const [settingsOpen, setSettingsOpen] = useState(params.has("settings"));
  useEffect(() => { if (theme === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = theme; }, [theme]);
  const settings = <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} theme={theme} setTheme={setTheme} />;
  const withSettings = <T extends { onSettings: () => void; account: { menu: MenuEntry[] } }>(sb: T): T => ({
    ...sb, onSettings: () => setSettingsOpen(true),
    account: { ...sb.account, menu: sb.account.menu.map(e => e !== "separator" && e.label === "Настройки" ? { ...e, onSelect: () => setSettingsOpen(true) } : e) },
  });
  const chatSidebar = ChatApp(account);
  if (app === "sections") return (
    <SidebarShell sidebar={withSettings(SchoolApp(account, withPrimary, section, setSection))} storageKey="yk-sidebar-a"
      collapsed={view === "collapsed"} onCollapsedChange={c => setView?.(c ? "collapsed" : "expanded")}
      defaultDrawerOpen={params.has("drawer")}
      header={<span className="page-title">{section}</span>}>
      <div className="cabinet">
        <MonoLabel>Кабинет школы</MonoLabel>
        <h1>{section}</h1>
        <div className="cabinet__stats">{[["Ученики", "1 248"], ["Выручка за месяц", "412 000 ₽"], ["Активные курсы", "7"]].map(([k, v]) =>
          <div className="cabinet__stat" key={k}><MonoLabel>{k}</MonoLabel><strong>{v}</strong></div>)}</div>
        <div className="cabinet__table">{["Новая заявка на курс «Агенты»", "Оплата заказа №1042", "Ученик сдал тест модуля 3", "Рассылка «Старт потока» отправлена"].map(t =>
          <div className="cabinet__row" key={t}>{t}</div>)}</div>
      </div>
      {settings}
    </SidebarShell>
  );
  const sidebar = withSettings(chatSidebar);
  return (
    <SidebarShell sidebar={sidebar} storageKey="yk-sidebar-a"
      collapsed={view === "collapsed"} onCollapsedChange={c => setView?.(c ? "collapsed" : "expanded")}
      defaultDrawerOpen={params.has("drawer")}
      header={<button className="model-pick">Агент <span>· быстрый</span><Icon icon={CaretDownIcon} size={14} /></button>}>
      <div className="empty-chat">
        <div className="empty-chat__hello">
          <Sphere size={40} label="Агент" />
          <h1>Привет, Юрий</h1>
          <p>С чего начнём сегодня?</p>
        </div>
        <div className="composer" aria-label="Поле сообщения (макет)">
          <div className="composer__text">Спросите что-нибудь</div>
          <div className="composer__row">
            <Button variant="ghost" icon={PaperclipIcon} aria-label="Вложение" />
            <button className="composer__send" aria-label="Отправить"><Icon icon={ArrowUpIcon} size={18} /></button>
          </div>
        </div>
      </div>
      {settings}
    </SidebarShell>
  );
}

function Prototype() {
  const [view, setView] = useState<View>((params.get("view") as View) ?? "expanded");
  const [account, setAccount] = useState<AccountMode>((params.get("account") as AccountMode) ?? "email");
  const [app, setApp] = useState<AppMode>((params.get("app") as AppMode) ?? "chat");
  const withPrimary = params.get("primary") === "1";
  if (params.has("frame")) return <Demo view="expanded" account={account} app={app} withPrimary={withPrimary} />;
  return (
    <div className="proto">
      <div className="proto__bar">
        <span className="proto__title">Сайдбар · вариант A <small>плоский, как Gemini</small></span>
        <SegmentedControl aria-label="Приложение" value={app} onValueChange={v => setApp(v as AppMode)}
          options={[{ value: "chat", label: "Чат и разделы" }, { value: "sections", label: "Только разделы" }]} />
        <SegmentedControl aria-label="Состояние" value={view} onValueChange={v => setView(v as View)}
          options={[{ value: "expanded", label: "Раскрыто" }, { value: "collapsed", label: "Свёрнуто" }, { value: "phone", label: "Телефон" }]} />
        <SegmentedControl aria-label="Аккаунт" value={account} onValueChange={v => setAccount(v as AccountMode)}
          options={[{ value: "plan", label: "Тариф" }, { value: "email", label: "Почта" }, { value: "name", label: "Только имя" }]} />
      </div>
      <div className={"proto__stage" + (view === "phone" ? " is-phone" : "")}>
        {view === "phone"
          ? <iframe title="Телефон" key={[account, app].join()} src={`/?frame${params.get("theme") ? "&theme=" + params.get("theme") : ""}&account=${account}&app=${app}${params.has("drawer") ? "&drawer" : ""}`} />
          : <Demo view={view} setView={setView} account={account} app={app} withPrimary={withPrimary} />}
      </div>
    </div>
  );
}

type Theme = "system" | "light" | "dark";
/* Тема меняется только здесь, в настройках. Отдельной кнопки темы в интерфейсе нет. */
function SettingsDialog({ open, onClose, theme, setTheme }: { open: boolean; onClose: () => void; theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Настройки" actions={<Button onClick={onClose}>Готово</Button>}>
      <RadioGroup label="Тема" value={theme} onValueChange={v => setTheme(v as Theme)}>
        <Radio value="system">Как в системе</Radio>
        <Radio value="light">Светлая</Radio>
        <Radio value="dark">Тёмная</Radio>
      </RadioGroup>
    </Dialog>
  );
}

createRoot(document.getElementById("root")!).render(<Prototype />);
