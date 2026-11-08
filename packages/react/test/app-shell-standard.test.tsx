import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HouseIcon, NotePencilIcon, FolderSimpleIcon, GraduationCapIcon } from "@phosphor-icons/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell, type AppShellAccount, type AppNavigationGroup } from "../src/index.js";

const navigation = [{ id: "home", label: "Обзор", icon: HouseIcon, active: true }];
const account = (extra: Partial<AppShellAccount> = {}): AppShellAccount => ({
  name: "Юрий Курилов", email: "yury@example.com", plan: "Тариф «Про»",
  menu: [{ label: "Профиль", onSelect: vi.fn() }, { label: "Выйти", onSelect: vi.fn() }], ...extra,
});
const chats: AppNavigationGroup = {
  id: "recent", label: "Недавние",
  items: ["План эфира", "Письмо", "Квиз", "Расписание"].map(label => ({ id: label, label, onSelect: vi.fn() })),
};
const originalDialogMethods = ["showModal", "close"].map(name => [name, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name)] as const);
afterEach(() => { vi.restoreAllMocks(); for (const [name, d] of originalDialogMethods) { if (d) Object.defineProperty(HTMLDialogElement.prototype, name, d); else delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)[name]; } });

describe("стандартная панель: верх и главное действие", () => {
  it("поиск появляется, только если приложение передало onSearch", async () => {
    const search = vi.fn(), user = userEvent.setup();
    const { rerender } = render(<AppShell brand={{ label: "Агент" }} navigation={navigation}>x</AppShell>);
    expect(screen.queryByRole("button", { name: "Поиск" })).toBeNull();
    rerender(<AppShell brand={{ label: "Агент" }} navigation={navigation} onSearch={search}>x</AppShell>);
    await user.click(screen.getByRole("button", { name: "Поиск" }));
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("главное действие стоит перед разделами и остаётся значком с именем в свёрнутом виде", async () => {
    const create = vi.fn(), user = userEvent.setup();
    render(<AppShell brand={{ label: "Агент" }} navigation={navigation} primaryAction={{ label: "Новый чат", icon: NotePencilIcon, onSelect: create }}>x</AppShell>);
    const nav = screen.getByRole("navigation", { name: "Навигация приложения" });
    const buttons = within(nav).getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("Новый чат");
    await user.click(buttons[0]);
    expect(create).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(screen.getByRole("button", { name: "Новый чат" })).toHaveAttribute("title", "Новый чат");
  });

  it("без главного действия его блока нет", () => {
    const { container } = render(<AppShell brand={{ label: "Кабинет" }} navigation={navigation}>x</AppShell>);
    expect(container.querySelector(".yk-app-shell__primary")).toBeNull();
  });

  it("называет новое в разделе для экранного диктора", () => {
    render(<AppShell brand={{ label: "Агент" }} navigation={[{ ...navigation[0], hasNew: true }]}>x</AppShell>);
    expect(screen.getByRole("button", { name: /Обзор.*есть новое/ })).toBeInTheDocument();
  });
});

describe("стандартная панель: группы", () => {
  it("рисует группу с подзаголовком; строки без значков — история чатов", async () => {
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Агент" }} navigation={navigation} groups={[chats]}>x</AppShell>);
    const group = screen.getByRole("region", { name: "Недавние" });
    expect(within(group).getAllByRole("button")).toHaveLength(4);
    expect(within(group).getByRole("button", { name: "Письмо" }).querySelector("svg")).toBeNull();
    await user.click(within(group).getByRole("button", { name: "Квиз" }));
    expect(chats.items[2].onSelect).toHaveBeenCalledTimes(1);
  });

  it("прячет лишнее под «Ещё N» и раскрывает по нажатию", async () => {
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Агент" }} navigation={navigation} groups={[{ ...chats, visibleCount: 2 }]}>x</AppShell>);
    const group = screen.getByRole("region", { name: "Недавние" });
    expect(within(group).queryByRole("button", { name: "Квиз" })).toBeNull();
    const more = within(group).getByRole("button", { name: "Ещё 2" });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(within(group).getByRole("button", { name: "Квиз" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Свернуть" })).toHaveAttribute("aria-expanded", "true");
  });

  it("не прячет выбранный пункт под «Ещё»", () => {
    const items = chats.items.map((i, n) => ({ ...i, active: n === 3 }));
    render(<AppShell brand={{ label: "Агент" }} navigation={navigation} groups={[{ ...chats, items, visibleCount: 2 }]}>x</AppShell>);
    expect(screen.getByRole("button", { name: "Расписание" })).toHaveAttribute("aria-current", "page");
  });

  it("в свёрнутом виде списки скрыты, группы разделов остаются значками", async () => {
    const user = userEvent.setup();
    const learning: AppNavigationGroup = { id: "learn", label: "Обучение", iconsWhenCollapsed: true, items: [{ id: "courses", label: "Курсы", icon: GraduationCapIcon }] };
    const projects: AppNavigationGroup = { id: "p", label: "Проекты", items: [{ id: "p1", label: "Сайт школы", icon: FolderSimpleIcon }] };
    render(<AppShell brand={{ label: "Школа" }} navigation={navigation} groups={[learning, projects, chats]}>x</AppShell>);
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(screen.getByRole("button", { name: "Курсы" })).toHaveAttribute("title", "Курсы");
    expect(screen.queryByRole("button", { name: "Сайт школы" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Письмо" })).toBeNull();
  });

  it("выбор в группе закрывает мобильную панель", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function(this: HTMLDialogElement) { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function(this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event("close")); } });
    const user = userEvent.setup();
    render(<AppShell brand={{ label: "Агент" }} navigation={navigation} groups={[chats]}>x</AppShell>);
    await user.click(screen.getByRole("button", { name: "Открыть навигацию" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Письмо" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("стандартная панель: блок аккаунта", () => {
  const footerText = () => screen.getByRole("button", { name: /Аккаунт/ }).textContent;

  it("по умолчанию под именем почта", () => {
    render(<AppShell brand={{ label: "А" }} navigation={navigation} account={account()}>x</AppShell>);
    expect(footerText()).toContain("Юрий Курилов");
    expect(footerText()).toContain("yury@example.com");
    expect(footerText()).not.toContain("Тариф");
  });

  it("вид «Тариф» показывает тариф вместо почты", () => {
    render(<AppShell brand={{ label: "А" }} navigation={navigation} account={account({ show: "plan" })}>x</AppShell>);
    expect(footerText()).toContain("Тариф «Про»");
    expect(footerText()).not.toContain("yury@example.com");
  });

  it("вид «Только имя» и вид без данных оставляют одно имя", () => {
    const { rerender } = render(<AppShell brand={{ label: "А" }} navigation={navigation} account={account({ show: "name" })}>x</AppShell>);
    expect(footerText()).toBe("ЮКЮрий Курилов");
    rerender(<AppShell brand={{ label: "А" }} navigation={navigation} account={account({ email: undefined })}>x</AppShell>);
    expect(footerText()).toBe("ЮКЮрий Курилов");
  });

  it("нажатие на аккаунт открывает его меню", async () => {
    const user = userEvent.setup(), a = account();
    render(<AppShell brand={{ label: "А" }} navigation={navigation} account={a}>x</AppShell>);
    await user.click(screen.getByRole("button", { name: /Аккаунт/ }));
    await user.click(screen.getByRole("menuitem", { name: "Профиль" }));
    expect((a.menu[0] as { onSelect: () => void }).onSelect).toHaveBeenCalledTimes(1);
  });

  it("шестерёнка открывает настройки; в свёрнутом виде остаётся только аватар", async () => {
    const settings = vi.fn(), user = userEvent.setup();
    render(<AppShell brand={{ label: "А" }} navigation={navigation} account={account()} onSettings={settings}>x</AppShell>);
    await user.click(screen.getByRole("button", { name: "Настройки" }));
    expect(settings).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Свернуть навигацию" }));
    expect(screen.queryByRole("button", { name: "Настройки" })).toBeNull();
    expect(screen.getByRole("button", { name: "Аккаунт: Юрий Курилов" })).toHaveTextContent("ЮК");
  });

  it("свой footer по-прежнему работает, если account не передан", () => {
    render(<AppShell brand={{ label: "А" }} navigation={navigation} footer={() => "Свой блок"}>x</AppShell>);
    expect(screen.getByText("Свой блок")).toBeInTheDocument();
  });
});
