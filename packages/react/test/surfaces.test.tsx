import { SparkleIcon } from "@phosphor-icons/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Banner, Button, Card, EmptyState, List, ListRow, Skeleton, Stat,
  Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow,
} from "../src/index.js";

describe("Card", () => {
  it("заголовок, статус справа, подпись и содержимое", () => {
    render(<Card title="Лендинг вебинара" status={<span>В работе</span>} caption="Обновлено 2 ч назад · 3/5">шаги</Card>);
    expect(screen.getByRole("heading", { name: "Лендинг вебинара" })).toBeInTheDocument();
    expect(screen.getByText("В работе")).toBeInTheDocument();
    expect(screen.getByText("Обновлено 2 ч назад · 3/5")).toHaveClass("yk-mono-label");
    expect(screen.getByText("шаги")).toBeInTheDocument();
  });
  it("без заголовка — просто поверхность", () => {
    const { container } = render(<Card>тело</Card>);
    expect(container.firstElementChild).toHaveClass("yk-card");
    expect(screen.queryByRole("heading")).toBeNull();
  });
});

describe("Stat", () => {
  it("метка, крупное моноширинное число, единица", () => {
    render(<Stat label="Задач открыто" value="27" unit="/ 64" />);
    expect(screen.getByText("Задач открыто")).toHaveClass("yk-mono-label");
    expect(screen.getByText("27")).toHaveClass("yk-stat__value");
    expect(screen.getByText("/ 64")).toHaveClass("yk-stat__unit");
  });
  it("изменение со значком: рост — успех, падение — ошибка", () => {
    const { rerender, container } = render(<Stat label="Задач" value="27" change={{ direction: "up", text: "12% за неделю" }} />);
    expect(screen.getByText("12% за неделю").closest(".yk-stat__change")).toHaveClass("yk-stat__change--up");
    expect(container.querySelector(".yk-stat__change svg")).not.toBeNull();
    rerender(<Stat label="Задач" value="27" change={{ direction: "down", text: "3%" }} />);
    expect(screen.getByText("3%").closest(".yk-stat__change")).toHaveClass("yk-stat__change--down");
  });
  it("изменение читается диктором со словами", () => {
    render(<Stat label="Задач" value="27" change={{ direction: "up", text: "12% за неделю" }} />);
    expect(screen.getByText("Рост:")).toHaveClass("yk-visually-hidden");
  });
});

describe("List и ListRow", () => {
  it("список из строк со значком, заголовком и подписью", () => {
    render(
      <List aria-label="Проекты">
        <ListRow icon={SparkleIcon} title="Идеи для рассылки" caption="8 заметок" />
        <ListRow title="Обложки курса" />
      </List>,
    );
    expect(screen.getByRole("list", { name: "Проекты" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("8 заметок")).toBeInTheDocument();
    expect(document.querySelector(".yk-list-row__icon svg")).not.toBeNull();
  });

  it("выбранная строка: aria-current и пометка для полоски акцента", () => {
    render(<List><ListRow title="Идеи" selected onClick={() => {}} /><ListRow title="Обложки" onClick={() => {}} /></List>);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveAttribute("data-selected", "true");
    expect(screen.getByRole("button", { name: "Идеи" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Обложки" })).not.toHaveAttribute("aria-current");
  });

  it("с onClick — кнопка, достижимая с клавиатуры (Enter)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<List><ListRow title="Идеи" onClick={onClick} /></List>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Идеи" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("с href — ссылка", () => {
    render(<List><ListRow title="Идеи" href="/ideas" /></List>);
    expect(screen.getByRole("link", { name: "Идеи" })).toHaveAttribute("href", "/ideas");
  });

  it("у строки-ссылки справа caret-right; точка «новое» и число", () => {
    const { container } = render(
      <List><ListRow title="Идеи" onClick={() => {}} isNew count={8} /></List>,
    );
    expect(container.querySelector(".yk-new-dot")).not.toBeNull();
    expect(screen.getByText("8")).toHaveClass("yk-mono-num");
    expect(container.querySelector(".yk-list-row__chevron svg")).not.toBeNull();
  });

  it("точка «новое» читается диктором", () => {
    render(<List><ListRow title="Идеи" onClick={() => {}} isNew /></List>);
    expect(screen.getByRole("img", { name: "Есть новое" })).toBeInTheDocument();
  });

  it("trailing заменяет caret; обычная строка не интерактивна", () => {
    const { container } = render(<List><ListRow title="Напоминания" trailing={<button>Переключатель</button>} /></List>);
    expect(container.querySelector(".yk-list-row__chevron")).toBeNull();
    expect(screen.getByRole("button", { name: "Переключатель" })).toBeInTheDocument();
    expect(container.querySelector("a, .yk-list-row__body[role=button]")).toBeNull();
  });
});

describe("Table", () => {
  function sample() {
    return (
      <Table aria-label="Проекты">
        <TableHead>
          <TableRow><TableHeaderCell>Проект</TableHeaderCell><TableHeaderCell numeric>Задачи</TableHeaderCell></TableRow>
        </TableHead>
        <TableBody>
          <TableRow selected><TableCell strong>Лендинг</TableCell><TableCell numeric>3/5</TableCell></TableRow>
          <TableRow><TableCell>Идеи</TableCell><TableCell numeric>1/5</TableCell></TableRow>
        </TableBody>
      </Table>
    );
  }
  it("настоящая таблица с шапкой-колонками", () => {
    render(sample());
    expect(screen.getByRole("table", { name: "Проекты" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Проект" })).toHaveAttribute("scope", "col");
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
  it("числа моноширинные, имя жирнее", () => {
    render(sample());
    expect(screen.getByText("3/5")).toHaveClass("yk-table__cell--numeric");
    expect(screen.getByText("Лендинг")).toHaveClass("yk-table__cell--strong");
  });
  it("выбранная строка помечена aria-current и data-selected", () => {
    render(sample());
    const row = screen.getByText("Лендинг").closest("tr")!;
    expect(row).toHaveAttribute("aria-current", "true");
    expect(row).toHaveAttribute("data-selected", "true");
    expect(screen.getByText("Идеи").closest("tr")).not.toHaveAttribute("aria-current");
  });
});

describe("Banner", () => {
  it("обычный: заголовок жирным и текст", () => {
    render(<Banner title="Сохранено.">Изменения применены.</Banner>);
    expect(screen.getByText("Сохранено.")).toHaveClass("yk-banner__title");
    expect(screen.getByText(/Изменения применены/)).toBeInTheDocument();
  });
  it("агент: сфера слева", () => {
    const { container } = render(<Banner tone="agent" title="Агент собирает план.">Можно закрыть окно.</Banner>);
    expect(container.querySelector(".yk-banner__mark canvas")).not.toBeNull();
  });
  it("ошибка: role=alert, значок warning-circle без залитого круга", () => {
    const { container } = render(<Banner tone="danger" title="Письмо не отправлено.">Сервис не отвечает.</Banner>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    const svg = container.querySelector(".yk-banner__mark svg")!;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("data-weight") ?? "regular").not.toBe("fill");
    expect(container.querySelector(".yk-banner__mark")).not.toHaveClass("yk-banner__mark--filled");
  });
  it("обычный и агентский баннеры не роли alert", () => {
    render(<Banner tone="agent" title="Агент">текст</Banner>);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("EmptyState", () => {
  it("метка, заголовок, пояснение и действия", () => {
    render(
      <EmptyState label="Проектов · 0" title="Здесь пока пусто" description="Создайте проект." actions={<Button>Создать проект</Button>} />,
    );
    expect(screen.getByText("Проектов · 0")).toHaveClass("yk-mono-label");
    expect(screen.getByRole("heading", { name: "Здесь пока пусто" })).toBeInTheDocument();
    expect(screen.getByText("Создайте проект.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Создать проект" })).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("по умолчанию три полоски, занят и с именем для диктора", () => {
    const { container } = render(<Skeleton />);
    const root = screen.getByRole("status", { name: "Загрузка" });
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll(".yk-skeleton__line")).toHaveLength(3);
  });
  it("ширины полосок задаются", () => {
    const { container } = render(<Skeleton lines={["60%", "90%"]} label="Загружаем проекты" />);
    const lines = container.querySelectorAll<HTMLElement>(".yk-skeleton__line");
    expect(lines).toHaveLength(2);
    expect(lines[0]!.style.width).toBe("60%");
    expect(screen.getByRole("status", { name: "Загружаем проекты" })).toBeInTheDocument();
  });
});
