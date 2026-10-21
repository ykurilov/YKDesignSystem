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

function Nested({ onCloseOuter, onCloseInner }: { onCloseOuter: () => void; onCloseInner: () => void }) {
  const [outer, setOuter] = useState(true);
  const [inner, setInner] = useState(false);
  return (
    <>
      <main>Страница</main>
      <Dialog open={outer} onClose={() => { setOuter(false); onCloseOuter(); }} title="Внешнее">
        <button onClick={() => setInner(true)}>Подробнее</button>
        <Dialog open={inner} onClose={() => { setInner(false); onCloseInner(); }} title="Внутреннее">
          <button>Понятно</button>
        </Dialog>
      </Dialog>
    </>
  );
}

describe("вложенные окна и фон", () => {
  it("Esc закрывает только верхнее окно", async () => {
    const user = userEvent.setup();
    const onCloseOuter = vi.fn();
    const onCloseInner = vi.fn();
    render(<Nested onCloseOuter={onCloseOuter} onCloseInner={onCloseInner} />);
    await user.click(screen.getByRole("button", { name: "Подробнее" }));
    expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);
    await user.keyboard("{Escape}");
    expect(onCloseInner).toHaveBeenCalledTimes(1);
    expect(onCloseOuter).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Внешнее" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onCloseOuter).toHaveBeenCalledTimes(1);
  });

  it("Tab в верхнем окне не уходит в нижнее", async () => {
    const user = userEvent.setup();
    render(<Nested onCloseOuter={() => {}} onCloseInner={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Подробнее" }));
    expect(screen.getByRole("button", { name: "Понятно" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Понятно" })).toHaveFocus();
  });

  it("фон под открытым окном недоступен (inert), после закрытия снова доступен", async () => {
    const user = userEvent.setup();
    const { container } = render(<Host />);
    expect(container).not.toHaveAttribute("inert");
    await user.click(screen.getByText("Открыть"));
    expect(container).toHaveAttribute("inert");
    expect(screen.getByTestId("yk-overlay")).not.toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(container).not.toHaveAttribute("inert");
  });

  it("во вложенных окнах inert получает и нижнее окно; живёт, пока открыто верхнее", async () => {
    const user = userEvent.setup();
    const { container } = render(<Nested onCloseOuter={() => {}} onCloseInner={() => {}} />);
    const [outerOverlay] = screen.getAllByTestId("yk-overlay");
    expect(container).toHaveAttribute("inert");
    expect(outerOverlay).not.toHaveAttribute("inert");
    await user.click(screen.getByRole("button", { name: "Подробнее" }));
    const [first, second] = screen.getAllByTestId("yk-overlay");
    expect(first).toHaveAttribute("inert");
    expect(second).not.toHaveAttribute("inert");
    await user.keyboard("{Escape}");
    expect(screen.getByTestId("yk-overlay")).not.toHaveAttribute("inert");
    expect(container).toHaveAttribute("inert");
  });

  it("чужой inert на элементе страницы не снимается", async () => {
    const user = userEvent.setup();
    const other = document.createElement("aside");
    other.setAttribute("inert", "");
    document.body.append(other);
    render(<Host />);
    await user.click(screen.getByText("Открыть"));
    await user.keyboard("{Escape}");
    expect(other).toHaveAttribute("inert");
    other.remove();
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
