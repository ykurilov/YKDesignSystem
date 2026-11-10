// Проверка типов: этот файл проверяет tsc (pnpm typecheck), а не только Vitest
import { ArrowUpIcon } from "@phosphor-icons/react";
import { describe, expect, it } from "vitest";
import { Button, type TextButtonVariant } from "../src/index.js";

describe("типы Button", () => {
  it("кнопке-значку обязателен aria-label", () => {
    const ok = <Button icon={ArrowUpIcon} aria-label="Отправить" />;
    // @ts-expect-error нет aria-label
    const noLabel = <Button icon={ArrowUpIcon} />;
    // @ts-expect-error у кнопки нет ни текста, ни значка
    const empty = <Button />;
    const withText = <Button icon={ArrowUpIcon}>Наверх</Button>;
    expect([ok, noLabel, empty, withText]).toHaveLength(4);
  });
});

describe("типы Button: ghost только у значка", () => {
  it("текстовой кнопке доступны все виды, кроме ghost", () => {
    const icon = <Button variant="ghost" icon={ArrowUpIcon} aria-label="Наверх" />;
    const text = <Button variant="outline" size="sm" icon={ArrowUpIcon}>Наверх</Button>;
    const variant: TextButtonVariant = "secondary";
    const fromVariable = <Button variant={variant}>Готово</Button>;
    // @ts-expect-error у невидимой кнопки не бывает текста
    const ghostText = <Button variant="ghost">Отмена</Button>;
    expect([icon, text, fromVariable, ghostText]).toHaveLength(4);
  });
});
