import { CircleHalfIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button, type IconComponent } from "@ykurilov/ds-react";
import { useState } from "react";

type ThemeChoice = "light" | "dark" | "system";

const CHOICES: Array<{ value: ThemeChoice; label: string; icon: IconComponent }> = [
  { value: "light", label: "Светлая", icon: SunIcon },
  { value: "dark", label: "Тёмная", icon: MoonIcon },
  { value: "system", label: "Как в системе", icon: CircleHalfIcon },
];

function savedChoice(): ThemeChoice {
  const saved = localStorage.getItem("yk-theme");
  return saved === "light" || saved === "dark" ? saved : "system";
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") {
    delete root.dataset.theme;
    localStorage.removeItem("yk-theme");
  } else {
    root.dataset.theme = choice;
    localStorage.setItem("yk-theme", choice);
  }
}

export function ThemeSwitch() {
  const [choice, setChoice] = useState(savedChoice);
  return (
    <div className="sc-theme" role="group" aria-label="Тема">
      {CHOICES.map(({ value, label, icon }) => (
        <Button
          key={value}
          size="sm"
          variant={choice === value ? "secondary" : "ghost"}
          icon={icon}
          aria-pressed={choice === value}
          onClick={() => {
            applyTheme(value);
            setChoice(value);
          }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
