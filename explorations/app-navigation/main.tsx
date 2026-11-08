import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell, Button, Dialog, MonoLabel, Sphere, ThemeSettings, themeScript, useThemePreference, type AppNavigationGroup, type AppShellAccount } from "@ykurilov/ds-react";
import {
  HouseIcon, FolderSimpleIcon, BooksIcon, RobotIcon, NotePencilIcon, UserIcon, GearSixIcon, QuestionIcon, SignOutIcon,
  DeviceMobileIcon, DesktopIcon, CheckSquareOffsetIcon,
} from "@phosphor-icons/react";
import "@ykurilov/ds-tokens/tokens.css";
import "@ykurilov/ds-react/styles.css";
import "./reference.css";

const params = new URLSearchParams(location.search);
// Тема для снимков: ?theme=dark|light. В приложении её задаёт только экран настроек.
const urlTheme = params.get("theme");
if (urlTheme === "dark" || urlTheme === "light") localStorage.setItem("yk-theme", urlTheme);
new Function(themeScript())();

const SECTIONS = [
  { name: "Обзор", icon: HouseIcon }, { name: "Задачи", icon: CheckSquareOffsetIcon },
  { name: "Библиотека", icon: BooksIcon }, { name: "Агенты", icon: RobotIcon },
];
const LONG = params.has("long") ? Array.from({ length: 40 }, (_, i) => ({ name: "Раздел " + (i + 5), icon: FolderSimpleIcon })) : [];
const PROJECTS = ["Запуск интенсива", "Курс по агентам", "Сайт школы", "Личные финансы"];
const CHATS = [
  "План эфира про агентов на четверг", "Разбор отзывов участников после третьего модуля интенсива", "Письмо для рассылки",
  "Как настроить кэш модели в чате", "Идеи для обложки курса", "Сравнение тарифов хостинга", "Сценарий ролика про Бали",
  "Квиз по второму уроку", "Расписание занятий на ноябрь", "Ответы на частые вопросы",
];

function Demo() {
  useThemePreference(); // держит тему страницы в согласии с выбором в настройках, в том числе во встроенном окне
  const [active, setActive] = useState("Обзор");
  const [settings, setSettings] = useState(false);
  const row = (label: string) => ({ id: label, label, active: active === label, onSelect: () => setActive(label) });
  const groups: AppNavigationGroup[] = [
    { id: "projects", label: "Проекты", visibleCount: 3, items: PROJECTS.map(label => ({ ...row(label), icon: FolderSimpleIcon })) },
    { id: "recent", label: "Недавние", items: CHATS.map((label, i) => ({ ...row(label), hasNew: i === 1 })) },
  ];
  const account: AppShellAccount = {
    name: "Юрий Курилов", initials: "ЮК", email: "ykurilov@gmail.com",
    menu: [
      { label: "Профиль", icon: UserIcon, onSelect: () => setActive("Профиль") },
      { label: "Настройки", icon: GearSixIcon, onSelect: () => setSettings(true) },
      { label: "Помощь", icon: QuestionIcon, onSelect: () => setActive("Помощь") },
      "separator",
      { label: "Выйти", icon: SignOutIcon, danger: true, onSelect: () => {} },
    ],
  };
  return (
    <AppShell
      brand={{ label: "Одуванчик", logo: <Sphere size={24} label="Одуванчик" /> }}
      storageKey="yk-app-navigation-reference"
      primaryAction={{ label: "Новый чат", icon: NotePencilIcon, onSelect: () => setActive("Новый чат") }}
      navigation={[...SECTIONS, ...LONG].map(s => ({ id: s.name, label: s.name, icon: s.icon, active: active === s.name, onSelect: () => setActive(s.name) }))}
      groups={params.has("long") ? undefined : groups}
      onSearch={() => setActive("Поиск")}
      account={account}
      onSettings={() => setSettings(true)}
      header={<span className="current-section">{active}</span>}
    >
      <div className="page-heading"><MonoLabel>Личное пространство</MonoLabel><h1>{active === "Обзор" ? "С чего начнём?" : active}</h1><p>Всё для текущей работы — в одном месте.</p></div>
      <div className="reference-note"><MonoLabel>Поведение панели</MonoLabel><p>Кнопка вверху сворачивает панель до значков, значки не сдвигаются. На телефоне панель открывается слева поверх содержимого и закрывается после выбора. Тема меняется только в настройках: шестерёнка внизу или пункт меню аккаунта.</p></div>
      <Dialog open={settings} onClose={() => setSettings(false)} title="Настройки" actions={<Button onClick={() => setSettings(false)}>Готово</Button>}>
        <ThemeSettings />
      </Dialog>
    </AppShell>
  );
}

function Reference() {
  const [phone, setPhone] = useState(false);
  if (params.has("frame")) return <Demo />;
  return (
    <div className="reference">
      <div className="reference-bar">
        <div><MonoLabel>Одуванчик · Референс 01</MonoLabel><span className="reference-title">Навигация приложения · вариант A</span></div>
        <div className="reference-controls">
          <Button variant="ghost" icon={phone ? DesktopIcon : DeviceMobileIcon} aria-label={phone ? "Компьютер" : "Телефон"} title={phone ? "Компьютер" : "Телефон"} onClick={() => setPhone(!phone)} />
        </div>
      </div>
      <div className={"preview" + (phone ? " phone" : "")}>{phone ? <iframe title="Мобильная навигация" src="/?frame=true" /> : <Demo />}</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Reference />);
