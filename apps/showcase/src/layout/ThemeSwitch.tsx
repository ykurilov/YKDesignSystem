import { CircleHalfIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button, useThemePreference, type IconComponent, type ThemePreference } from "@ykurilov/ds-react";

const CHOICES: Array<{ value: ThemePreference; label: string; icon: IconComponent }> = [
  { value: "light", label: "Светлая", icon: SunIcon },
  { value: "dark", label: "Тёмная", icon: MoonIcon },
  { value: "system", label: "Как в системе", icon: CircleHalfIcon },
];

/** Инструмент витрины для просмотра частей в обеих темах. В приложениях тема выбирается только в настройках (ThemeSettings). */
export function ThemeSwitch() {
  const { theme, setTheme } = useThemePreference();
  return (
    <div className="sc-theme" role="group" aria-label="Тема витрины">
      {CHOICES.map(({ value, label, icon }) => (
        <Button key={value} size="sm" variant={theme === value ? "secondary" : "ghost"} icon={icon} aria-pressed={theme === value} onClick={() => setTheme(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}
