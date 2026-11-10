import { CircleHalfIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { SegmentedControl, useThemePreference, type SegmentOption, type ThemePreference } from "@ykurilov/ds-react";

const CHOICES: SegmentOption[] = [
  { value: "light", label: "Светлая", icon: SunIcon },
  { value: "dark", label: "Тёмная", icon: MoonIcon },
  { value: "system", label: "Как в системе", icon: CircleHalfIcon },
];

/** Инструмент витрины для просмотра частей в обеих темах. В приложениях тема выбирается только в настройках (ThemeSettings). */
export function ThemeSwitch() {
  const { theme, setTheme } = useThemePreference();
  return (
    <div className="sc-theme">
      <SegmentedControl size="sm" aria-label="Тема витрины" options={CHOICES} value={theme} onValueChange={(value) => setTheme(value as ThemePreference)} />
    </div>
  );
}
