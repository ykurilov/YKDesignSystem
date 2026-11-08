import { useState } from "react";
import { AppShell, Button, Dialog, SegmentedControl, Sphere, ThemeSettings, type AppAccountView, type AppNavigationGroup } from "@ykurilov/ds-react";
import { HouseIcon, BooksIcon, RobotIcon, NotePencilIcon, FolderSimpleIcon, UserIcon, GearSixIcon, SignOutIcon } from "@phosphor-icons/react";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

const CHATS = ["План эфира на четверг", "Письмо для рассылки", "Как настроить кэш модели", "Идеи для обложки курса", "Квиз по второму уроку", "Расписание на ноябрь"];

function AppShellDemo() {
  const [active, setActive] = useState("Обзор");
  const [view, setView] = useState<AppAccountView>("email");
  const [settings, setSettings] = useState(false);
  const pick = (label: string) => ({ id: label, label, active: active === label, onSelect: () => setActive(label) });
  const groups: AppNavigationGroup[] = [
    { id: "projects", label: "Проекты", visibleCount: 2, items: ["Запуск интенсива", "Курс по агентам", "Сайт школы"].map(label => ({ ...pick(label), icon: FolderSimpleIcon })) },
    { id: "recent", label: "Недавние", items: CHATS.map(pick) },
  ];
  return (
    <div className="sc-app-shell">
      <SegmentedControl aria-label="Вид блока аккаунта" size="sm" value={view} onValueChange={v => setView(v as AppAccountView)}
        options={[{ value: "email", label: "Почта" }, { value: "plan", label: "Тариф" }, { value: "name", label: "Только имя" }]} />
      <div className="sc-app-shell__frame">
        <AppShell
          brand={{ label: "Одуванчик", logo: <Sphere size={24} label="Одуванчик" /> }}
          storageKey={null}
          primaryAction={{ label: "Новый чат", icon: NotePencilIcon, onSelect: () => setActive("Новый чат") }}
          navigation={[["Обзор", HouseIcon], ["Библиотека", BooksIcon], ["Агенты", RobotIcon]].map(([label, icon]) => ({ ...pick(label as string), icon: icon as typeof HouseIcon }))}
          groups={groups}
          onSearch={() => setActive("Поиск")}
          account={{
            name: "Юрий Курилов", initials: "ЮК", email: "ykurilov@gmail.com", plan: "Тариф «Про»", show: view,
            menu: [
              { label: "Профиль", icon: UserIcon, onSelect: () => setActive("Профиль") },
              { label: "Настройки", icon: GearSixIcon, onSelect: () => setSettings(true) },
              "separator",
              { label: "Выйти", icon: SignOutIcon, danger: true, onSelect: () => {} },
            ],
          }}
          onSettings={() => setSettings(true)}
        >
          <div className="sc-app-shell__content"><h3>{active}</h3><p>Шестерёнка внизу открывает настройки с выбором темы.</p></div>
        </AppShell>
      </div>
      <Dialog open={settings} onClose={() => setSettings(false)} title="Настройки" actions={<Button onClick={() => setSettings(false)}>Готово</Button>}>
        <ThemeSettings />
      </Dialog>
    </div>
  );
}

export default {
  order: 12,
  title: "Панель приложения",
  description: "AppShell в стандартном виде A и ThemeSettings для экрана настроек. Приложение передаёт данные: разделы, группы, аккаунт. Тема — только в настройках, по умолчанию как в системе.",
  Demo: AppShellDemo,
} satisfies ShowcaseSection;
