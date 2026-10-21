// Проверка типов: этот файл проверяет tsc (pnpm typecheck), а не только Vitest
import { ArrowUpIcon } from "@phosphor-icons/react";
import { describe, expect, it } from "vitest";
import { Button } from "../src/index.js";

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
