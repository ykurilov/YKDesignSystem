import { render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import userEvent from "@testing-library/user-event";
import { HouseIcon, FolderSimpleIcon } from "@phosphor-icons/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../src/index.js";
const navigation = [{ id: "home", label: "Обзор", icon: HouseIcon, active: true }, { id: "projects", label: "Проекты", icon: FolderSimpleIcon, href: "/projects" }];
const originalDialogMethods = ["showModal", "close"].map(name => [name, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name)] as const);
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); for (const [name, descriptor] of originalDialogMethods) { if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor); else delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)[name]; } });
describe("навигация приложения", () => {
  it("сворачивает подписи, сохраняя выбранный раздел, ссылки и доступные имена", async () => {
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Приложение" }} navigation={navigation} footer={rail => rail ? "ЮК" : "Юрий"}>Содержимое</AppShell>);
    expect(screen.getByRole("link", { name: "Проекты" })).toHaveAttribute("href", "/projects");
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(screen.getByRole("button", { name: "Обзор" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Проекты" })).toHaveAttribute("title", "Проекты");
    expect(screen.getByRole("button", { name: "Обзор" })).toHaveTextContent("");
    expect(screen.getByText("ЮК")).toBeVisible();
    expect(screen.getByRole("main")).toHaveTextContent("Содержимое");
    await user.click(screen.getByRole("button", { name: "Развернуть навигацию" }));
    expect(screen.getByRole("button", { name: "Обзор" })).toHaveTextContent("Обзор");
  });
  it("сохраняет предпочтение только в явно заданный ключ", async () => {
    localStorage.setItem("my-app-navigation", "collapsed");
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Приложение" }} navigation={navigation} storageKey="my-app-navigation">Содержимое</AppShell>);
    await user.click(screen.getByRole("button", { name: "Развернуть навигацию" }));
    expect(localStorage.getItem("my-app-navigation")).toBe("expanded");
  });
  it("контролируемое состояние не заменяет решением из localStorage", async () => {
    localStorage.setItem("my-app-navigation", "collapsed");
    const change = vi.fn(); const user = userEvent.setup();
    render(<AppShell brand={{ label: "Приложение" }} navigation={navigation} collapsed={false} onCollapsedChange={change} storageKey="my-app-navigation">Содержимое</AppShell>);
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Свернуть навигацию" })).toBeVisible();
  });
  it("мобильная навигация монтируется один раз и закрывается после выбора", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event("close")); } });
    const select = vi.fn(), user = userEvent.setup();
    render(<AppShell brand={{ label: "Приложение" }} navigation={[{ ...navigation[0], onSelect: select }]}>Содержимое</AppShell>);
    const trigger = screen.getByRole("button", { name: "Открыть навигацию" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Навигация приложения" });
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    await user.click(within(dialog).getByRole("button", { name: "Обзор" }));
    expect(select).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });
  it("показывает счётчик раздела и в свёрнутом виде называет его в имени значка", async () => {
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Приложение" }} navigation={[{ ...navigation[1], badge: { value: 3, label: "3 без ответа" } }]}>Содержимое</AppShell>);
    expect(screen.getByRole("link", { name: "Проекты, 3 без ответа" })).toHaveTextContent("3");
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(screen.getByRole("link", { name: "Проекты, 3 без ответа" })).toHaveTextContent("3");
  });
  it("рисует ссылки разделов и названия компонентом роутера приложения", () => {
    const RouterLink = vi.fn(({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a data-router="" {...props}>{children}</a>);
    render(<AppShell brand={{ label: "Приложение", href: "/" }} navigation={navigation} linkComponent={RouterLink}>Содержимое</AppShell>);
    expect(screen.getByRole("link", { name: "Проекты" })).toHaveAttribute("data-router");
    expect(screen.getByRole("link", { name: "Приложение" })).toHaveAttribute("data-router");
    expect(screen.getByRole("button", { name: "Обзор" })).not.toHaveAttribute("data-router");
  });
});

describe("название приложения в шапке на телефоне", () => {
  const mockPhone = (matches: boolean) => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; } });
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
  };
  it("на телефоне рядом с кнопкой меню стоит название, и оно после кнопки", () => {
    mockPhone(true);
    const { container } = render(<AppShell brand={{ label: "Живые лидмагниты" }} navigation={navigation}>Содержимое</AppShell>);
    const header = container.querySelector("header.yk-app-shell__header")!;
    const title = header.querySelector(".yk-app-shell__header-title");
    expect(title).toHaveTextContent("Живые лидмагниты");
    expect(title).toHaveAttribute("title", "Живые лидмагниты");
    expect(header.firstElementChild).toBe(screen.getByRole("button", { name: "Открыть навигацию" }));
  });
  it("кнопки приложения из header стоят справа от названия", () => {
    mockPhone(true);
    const { container } = render(<AppShell brand={{ label: "Приложение" }} navigation={navigation} header={<button type="button">Делиться</button>}>Содержимое</AppShell>);
    const children = [...container.querySelector("header.yk-app-shell__header")!.children];
    expect(children.map(el => el.textContent || el.getAttribute("aria-label"))).toEqual(["Открыть навигацию", "Приложение", "Делиться"]);
  });
  it("на широком экране шапки с названием нет", () => {
    mockPhone(false);
    const { container } = render(<AppShell brand={{ label: "Приложение" }} navigation={navigation}>Содержимое</AppShell>);
    expect(container.querySelector(".yk-app-shell__header-title")).toBeNull();
    expect(container.querySelector("header")).toBeNull();
  });
});
