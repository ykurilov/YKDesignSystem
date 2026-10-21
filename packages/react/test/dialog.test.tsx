import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button, Dialog, Sheet } from "../src/index.js";

function Host({ onClose = () => {}, closeOnBackdrop }: { onClose?: () => void; closeOnBackdrop?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Открыть</button>
      <Dialog
        open={open}
        onClose={() => { setOpen(false); onClose(); }}
        title="Удалить проект?"
        eyebrow="Удаление"
        closeOnBackdrop={closeOnBackdrop}
        actions={<><Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button><Button variant="danger">Удалить</Button></>}
      >
        Проект исчезнет.
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("закрытое окно ничего не рисует", () => {
    render(<Dialog open={false} onClose={() => {}} title="Заголовок">текст</Dialog>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("role=dialog, aria-modal и имя из заголовка", () => {
    render(<Dialog open onClose={() => {}} title="Удалить проект?">текст</Dialog>);
    const dialog = screen.getByRole("dialog", { name: "Удалить проект?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const titleId = dialog.getAttribute("aria-labelledby")!;
    expect(document.getElementById(titleId)).toHaveTextContent("Удалить проект?");
  });

  it("при открытии фокус уходит внутрь окна — на первую кнопку", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByText("Открыть"));
    expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus();
  });

  it("элемент с data-autofocus получает фокус первым", () => {
    render(
      <Dialog open onClose={() => {}} title="Имя">
        <button>Первая</button>
        <input aria-label="Название" data-autofocus />
      </Dialog>,
    );
    expect(screen.getByLabelText("Название")).toHaveFocus();
  });

  it("без кнопок фокус получает само окно", () => {
    render(<Dialog open onClose={() => {}} title="Тишина">просто текст</Dialog>);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("Tab не выходит за пределы окна: по кругу", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByText("Открыть"));
    expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Удалить" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Отмена" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Удалить" })).toHaveFocus();
  });

  it("Esc закрывает окно", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);
    await user.click(screen.getByText("Открыть"));
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("клик по фону закрывает, клик внутри — нет", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Host onClose={onClose} />);
    await user.click(screen.getByText("Открыть"));
    await user.click(screen.getByText("Проект исчезнет."));
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("yk-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeOnBackdrop=false — фон не закрывает", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Host onClose={onClose} closeOnBackdrop={false} />);
    await user.click(screen.getByText("Открыть"));
    await user.click(screen.getByTestId("yk-overlay"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("после закрытия фокус возвращается на кнопку, открывшую окно", async () => {
    const user = userEvent.setup();
    render(<Host />);
    const opener = screen.getByText("Открыть");
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(opener).toHaveFocus();
  });

  it("пока окно открыто, фон не прокручивается; после закрытия прокрутка возвращается", async () => {
    const user = userEvent.setup();
    render(<Host />);
    expect(document.body.style.overflow).toBe("");
    await user.click(screen.getByText("Открыть"));
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });

  it("надпись над заголовком — моноширинная метка", () => {
    render(<Dialog open onClose={() => {}} title="Заголовок" eyebrow="Удаление">текст</Dialog>);
    expect(screen.getByText("Удаление")).toHaveClass("yk-mono-label");
  });
});

describe("Sheet", () => {
  it("те же правила доступности, что у окна", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <>
        <button>Открыть</button>
        <Sheet open onClose={onClose} title="Новый проект">
          <input aria-label="Название" data-autofocus />
        </Sheet>
      </>,
    );
    const sheet = screen.getByRole("dialog", { name: "Новый проект" });
    expect(sheet).toHaveAttribute("aria-modal", "true");
    expect(sheet).toHaveClass("yk-sheet");
    expect(screen.getByLabelText("Название")).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("есть ручка сверху, скрытая от диктора; клик по фону закрывает", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Sheet open onClose={onClose} title="Шторка">текст</Sheet>);
    expect(document.querySelector(".yk-sheet__grip")).toHaveAttribute("aria-hidden", "true");
    await user.click(screen.getByTestId("yk-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("блокирует прокрутку фона", () => {
    const { unmount } = render(<Sheet open onClose={() => {}} title="Шторка">текст</Sheet>);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
