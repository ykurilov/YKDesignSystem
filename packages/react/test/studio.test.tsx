import { createRef, useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollArea, StudioLayout } from "../src/index.js";

afterEach(() => vi.restoreAllMocks());

describe("Студия", () => {
  it("на компьютере журнал монтируется один раз независимо от мобильного open", () => {
    render(<StudioLayout header="Песочница" inspector={{ title: "Журнал", content: <button>Параметры запроса</button>, open: false, onClose: vi.fn() }}>Рабочая область</StudioLayout>);
    expect(screen.getByRole("complementary", { name: "Журнал" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Параметры запроса" })).toHaveLength(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("на телефоне журнал закрывается Esc и возвращает фокус к триггеру", async () => {
    const original = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation(query => query.includes("max-width")
      ? { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList
      : original(query));
    function Host() {
      const [open, setOpen] = useState(false);
      return <StudioLayout header={<button onClick={() => setOpen(true)}>Открыть журнал</button>}
        inspector={{ title: "Журнал", content: <button>Параметры запроса</button>, open, onClose: () => setOpen(false) }}>Рабочая область</StudioLayout>;
    }
    const user = userEvent.setup();
    render(<Host />);
    expect(screen.queryByRole("button", { name: "Параметры запроса" })).toBeNull();
    const trigger = screen.getByRole("button", { name: "Открыть журнал" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Журнал" });
    expect(within(dialog).getByRole("button", { name: "Параметры запроса" })).toHaveFocus();
    expect(screen.getAllByRole("button", { name: "Параметры запроса" })).toHaveLength(1);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("область прокрутки доступна с клавиатуры и отдаёт ref вызывающему коду", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ScrollArea label="Переписка" ref={ref}>Сообщения</ScrollArea>);
    const area = screen.getByRole("region", { name: "Переписка" });
    expect(ref.current).toBe(area);
    expect(area).toHaveAttribute("tabindex", "0");
  });
});
