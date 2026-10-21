import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tab, TabList, TabPanel, Tabs } from "../src/index.js";

function Project(props: Partial<Parameters<typeof Tabs>[0]> = {}) {
  return (
    <Tabs defaultValue="overview" {...props}>
      <TabList aria-label="Проект">
        <Tab value="overview">Обзор</Tab>
        <Tab value="tasks" count={27}>Задачи</Tab>
        <Tab value="files" disabled>Файлы</Tab>
        <Tab value="history">История</Tab>
      </TabList>
      <TabPanel value="overview">Обзор проекта</TabPanel>
      <TabPanel value="tasks">Список задач</TabPanel>
      <TabPanel value="files">Файлы</TabPanel>
      <TabPanel value="history">Журнал</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("tablist, tab и tabpanel по правилам доступности", () => {
    render(<Project />);
    expect(screen.getByRole("tablist", { name: "Проект" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    const overview = screen.getByRole("tab", { name: "Обзор" });
    expect(overview).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Задачи/ })).toHaveAttribute("aria-selected", "false");
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Обзор проекта");
    expect(panel).toHaveAttribute("aria-labelledby", overview.id);
    expect(overview).toHaveAttribute("aria-controls", panel.id);
  });

  it("показывается только панель выбранной вкладки", () => {
    render(<Project />);
    expect(screen.queryByText("Список задач")).not.toBeVisible();
    expect(screen.getByText("Обзор проекта")).toBeVisible();
  });

  it("клик переключает вкладку и панель, зовёт onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<Project onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("tab", { name: /Задачи/ }));
    expect(screen.getByRole("tab", { name: /Задачи/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Список задач");
    expect(onValueChange).toHaveBeenCalledWith("tasks");
  });

  it("под управлением снаружи вкладка сама не переключается", async () => {
    render(<Project value="overview" />);
    await userEvent.click(screen.getByRole("tab", { name: /Задачи/ }));
    expect(screen.getByRole("tab", { name: "Обзор" })).toHaveAttribute("aria-selected", "true");
  });

  it("счётчик — моноширинное число внутри вкладки", () => {
    render(<Project />);
    const count = screen.getByText("27");
    expect(count).toHaveClass("yk-mono-num");
    expect(screen.getByRole("tab", { name: "Задачи 27" })).toBeInTheDocument();
  });

  it("в фокусе только выбранная вкладка", () => {
    render(<Project />);
    expect(screen.getByRole("tab", { name: "Обзор" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: /Задачи/ })).toHaveAttribute("tabindex", "-1");
  });

  it("Tab из списка вкладок попадает на панель", async () => {
    render(<Project />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Обзор" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("tabpanel")).toHaveFocus();
  });

  it("стрелки двигают фокус и вкладку, пропуская недоступные, по кругу", async () => {
    render(<Project />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Задачи/ })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Список задач");
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "История" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Обзор" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "История" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Журнал");
  });

  it("Home и End", async () => {
    render(<Project defaultValue="tasks" />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "История" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Обзор" })).toHaveFocus();
  });

  it("недоступная вкладка отключена", () => {
    render(<Project />);
    expect(screen.getByRole("tab", { name: "Файлы" })).toBeDisabled();
  });
});
