import SwiftUI

/// Витрина компонентов — разделы как в наброске 09.
/// `initialSection` (1…9) сразу прокручивает к разделу, `presenting` сразу открывает окно или шторку:
/// так снимаются снимки экрана.
public struct YKShowcaseView: View {
    /// Что открыть поверх витрины при запуске.
    public enum Presentation: String, Sendable {
        case sheet, alert, dialog
    }

    let initialSection: Int?
    let presenting: Presentation?

    public init(initialSection: Int? = nil, presenting: Presentation? = nil) {
        self.initialSection = initialSection
        self.presenting = presenting
    }

    public var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("YKDesignSystem · iPhone").ykMonoLabel()
                        Text("Базовые элементы").ykText(.screen)
                    }
                    .padding(.bottom, 28)

                    ShowcaseSection(1, "Цвета", "Основа бесцветная. Оранжевый — акцент. Ошибка нарочно холоднее и темнее.") { ColorsDemo() }
                    ShowcaseSection(2, "Шрифт", "Системный шрифт для всего текста. Моноширинный капс — только метки и цифры.") { TypeDemo() }
                    ShowcaseSection(3, "Кнопки", "Главная — всегда чёрная. Одна главная кнопка на экран.") { ButtonsDemo() }
                    ShowcaseSection(4, "Поля ввода", "Рамка выбранного поля оранжевая, рамка поля с ошибкой — красная.") { FieldsDemo() }
                    ShowcaseSection(5, "Выбор", "Включённое — оранжевым.") { ChoiceDemo() }
                    ShowcaseSection(6, "Метки и приметы", "Сфера — «агент работает». Точка — «есть новое».") { MarksDemo() }
                    ShowcaseSection(7, "Карточки и списки", nil) { CardsDemo() }
                    ShowcaseSection(8, "Всплывающее", "Окно, меню, шторка снизу, уведомления. Окна и меню — системные, в нашем цвете.") {
                        OverlaysDemo(presenting: presenting)
                    }
                    ShowcaseSection(9, "Пусто и загрузка", nil) { EmptyDemo() }
                }
                .padding(.horizontal, YKTokens.Space.s5)
                .padding(.top, YKTokens.Space.s4)
                .padding(.bottom, YKTokens.Space.s10)
            }
            .background(YKColorRole.bg.color)
            // Полоса цвета фона под строкой состояния: прокрученный текст не лезет под часы
            .safeAreaInset(edge: .top, spacing: 0) {
                Color.clear.frame(height: 0).background(YKColorRole.bg.color)
            }
            .foregroundStyle(YKColorRole.text.color)
            .onAppear {
                if let initialSection { proxy.scrollTo(initialSection, anchor: .top) }
            }
        }
    }
}

// MARK: - Раздел

private struct ShowcaseSection<Content: View>: View {
    let number: Int
    let title: String
    let note: String?
    let content: Content

    init(_ number: Int, _ title: String, _ note: String?, @ViewBuilder content: () -> Content) {
        self.number = number
        self.title = title
        self.note = note
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 6) {
                Text(String(format: "%02d", number)).ykMonoLabel()
                Text(title).ykText(.heading)
                if let note {
                    Text(note).ykText(.small).foregroundStyle(YKColorRole.muted.color)
                }
            }
            content
        }
        .padding(.vertical, 28)
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(alignment: .top) { YKColorRole.border.color.frame(height: 1) }
        .id(number)
    }
}

/// Подпись слева от примеров в строке, как `.line > .mono-label` в наброске.
/// `stacksWhenCrowded` — для рядов кнопок: не помещаются в строку (крупный шрифт) — встают столбиком,
/// а не переносятся вразнобой.
private struct DemoLine<Content: View>: View {
    let label: String
    let stacksWhenCrowded: Bool
    let content: Content

    init(_ label: String, stacksWhenCrowded: Bool = false, @ViewBuilder content: () -> Content) {
        self.label = label
        self.stacksWhenCrowded = stacksWhenCrowded
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(label).ykMonoLabel()
            if stacksWhenCrowded {
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 10) { content }
                    VStack(alignment: .leading, spacing: 10) { content }
                }
            } else {
                FlowLayout(spacing: 10) { content }
            }
        }
    }
}

/// Перенос элементов на новую строку, когда не помещаются по ширине.
private struct FlowLayout: Layout {
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(width: proposal.width ?? .infinity, subviews: subviews)
        let width = rows.map { $0.width }.max() ?? 0
        let height = rows.map(\.height).reduce(0, +) + spacing * CGFloat(max(0, rows.count - 1))
        return CGSize(width: proposal.width ?? width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(width: bounds.width, subviews: subviews) {
            var x = bounds.minX
            for index in row.indices {
                // Элемент шире строки получает ширину строки, а не вылезает за край
                let ideal = subviews[index].sizeThatFits(.unspecified)
                let size = ideal.width > bounds.width
                    ? subviews[index].sizeThatFits(ProposedViewSize(width: bounds.width, height: nil))
                    : ideal
                subviews[index].place(at: CGPoint(x: x, y: y + (row.height - size.height) / 2), proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += row.height + spacing
        }
    }

    private struct Row { var indices: [Int] = []; var width: CGFloat = 0; var height: CGFloat = 0 }

    private func arrange(width: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = [Row()]
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            let needed = rows[rows.count - 1].indices.isEmpty ? size.width : rows[rows.count - 1].width + spacing + size.width
            if needed > width, !rows[rows.count - 1].indices.isEmpty {
                rows.append(Row())
            }
            let current = rows.count - 1
            rows[current].width = rows[current].indices.isEmpty ? size.width : rows[current].width + spacing + size.width
            rows[current].height = max(rows[current].height, size.height)
            rows[current].indices.append(index)
        }
        return rows
    }
}

// MARK: - 01 Цвета

private struct ColorsDemo: View {
    private let swatches: [(String, YKColorRole)] = [
        ("Фон", .bg), ("Поверхность", .surface2), ("Чернила", .ink),
        ("Акцент", .accent), ("Ошибка", .danger), ("Успех", .success),
    ]

    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 10), count: 3), spacing: 10) {
            ForEach(swatches, id: \.0) { title, role in
                VStack(alignment: .leading, spacing: 0) {
                    role.color.frame(height: 56)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(title).font(.system(size: 12, weight: .medium))
                        Text(role.rawValue).ykMonoLabel(size: 10)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 8)
                }
                .ykSurface(cornerRadius: YKTokens.Radius.md)
            }
        }
    }
}

// MARK: - 02 Шрифт

private struct TypeDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            row("Экран · 30") { Text("Проекты").ykText(.screen) }
            row("Раздел · 22") { Text("План рассылки").ykText(.section) }
            row("Заголовок · 17") { Text("Лендинг вебинара").ykText(.heading) }
            row("Текст · 15") { Text("Агент прочитал лендинг и предлагает пять писем: от анонса до напоминания в день эфира.").ykText(.body) }
            row("Мелкий · 13") { Text("Обновлено 2 часа назад").ykText(.small).foregroundStyle(YKColorRole.muted.color) }
            row("Метка · 11") { Text("Рабочее пространство · 12").ykMonoLabel() }
            row("Число · 24") { Text("27 / 64").ykMonoNum() }
        }
    }

    private func row(_ label: String, @ViewBuilder sample: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).ykMonoLabel()
            sample()
        }
    }
}

// MARK: - 03 Кнопки

private struct ButtonsDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DemoLine("Виды", stacksWhenCrowded: true) {
                Button("Создать проект") {}.buttonStyle(.yk(.primary))
                Button("Импорт") {}.buttonStyle(.yk(.secondary))
                Button("Настроить") {}.buttonStyle(.yk(.outline))
                Button("Отмена") {}.buttonStyle(.yk(.ghost))
                Button("Удалить") {}.buttonStyle(.yk(.danger))
                Button {} label: {
                    HStack(spacing: 4) { Text("Шаблоны"); YKIcon(.arrowRight, size: 14) }
                }
                .buttonStyle(.yk(.link))
            }
            DemoLine("Состояния", stacksWhenCrowded: true) {
                Button("Обычная") {}.buttonStyle(.yk(.primary))
                Button("Отключена") {}.buttonStyle(.yk(.primary)).disabled(true)
                Button("Агент пишет…") {}.buttonStyle(.yk(.primary, isLoading: true))
                Button("Думаю…") {}.buttonStyle(.yk(.secondary, isLoading: true))
            }
            DemoLine("Размеры", stacksWhenCrowded: true) {
                Button("Маленькая") {}.buttonStyle(.yk(.primary, size: .sm))
                Button("Средняя") {}.buttonStyle(.yk(.primary, size: .md))
                Button {} label: {
                    HStack(spacing: 8) { YKIcon(.plus); Text("Большая · телефон") }
                }
                .buttonStyle(.yk(.primary, size: .lg))
            }
            DemoLine("Значки") {
                YKIconButton(.arrowUp, label: "Отправить", variant: .primary) {}
                YKIconButton(.plus, label: "Добавить") {}
                YKIconButton(.pencilSimple, label: "Переименовать", variant: .outline) {}
                YKIconButton(.copy, label: "Скопировать", variant: .ghost) {}
                YKIconButton(.trash, label: "Удалить", variant: .danger, size: .sm) {}
                YKIconButton(.stop, label: "Остановить", variant: .secondary, size: .lg, iconWeight: .fill) {}
            }
            Button {} label: { Text("Создать · на всю ширину").frame(maxWidth: .infinity) }
                .buttonStyle(.yk(.primary, size: .lg))
        }
    }
}

// MARK: - 04 Поля ввода

private struct FieldsDemo: View {
    @State private var empty = ""
    @State private var email = "yuri@gmail"
    @State private var readOnly = "Только чтение"

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            YKTextField("Название", placeholder: "Например, «Марафон»", text: $empty, hint: "Видно участникам")
            YKField(label: "Название · выбрано", hint: "Видно участникам", state: .focused) {
                Text("Марафон по ИИ")
            }
            YKTextField("Почта", text: $email, error: "Похоже, не хватает «.com»")
            YKField(label: "Курс") {
                Text("Вайб-кодинг").frame(maxWidth: .infinity, alignment: .leading)
                YKIcon(.caretDown, size: 14).foregroundStyle(YKColorRole.muted.color)
            }
            YKField(label: "Поиск") {
                Group {
                    YKIcon(.magnifyingGlass)
                    Text("Найти проект")
                }
                .foregroundStyle(YKColorRole.muted.color)
            }
            YKTextField("Отключено", text: $readOnly).disabled(true)
        }
    }
}

// MARK: - 05 Выбор

private struct ChoiceDemo: View {
    @State private var remind = true
    @State private var onlyMine = false
    @State private var agentSends = true
    @State private var darkTheme = false
    @State private var filter = "all"
    @State private var period = "daily"
    @State private var tab = "overview"

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DemoLine("Флажки") {
                Toggle("Напоминать", isOn: $remind).toggleStyle(.ykCheckbox)
                Toggle("Только мои", isOn: $onlyMine).toggleStyle(.ykCheckbox)
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Переключатели").ykMonoLabel()
                Toggle("Агент может отправлять письма", isOn: $agentSends).toggleStyle(.ykSwitch)
                Toggle("Тёмная тема", isOn: $darkTheme).toggleStyle(.ykSwitch)
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Радио").ykMonoLabel()
                YKRadioGroup("Напоминания", selection: $period, options: [("daily", "Каждый день"), ("weekly", "Раз в неделю"), ("never", "Не напоминать")])
            }
            DemoLine("Сегменты") {
                YKSegmented(selection: $filter, options: [("all", "Все"), ("mine", "Мои"), ("archive", "Архив")])
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Вкладки").ykMonoLabel()
                YKTabs(selection: $tab, tabs: [
                    YKTab("overview", "Обзор"), YKTab("tasks", "Задачи", count: 27),
                    YKTab("files", "Файлы", count: 8), YKTab("history", "История"),
                ])
            }
        }
        .ykText(.body, size: 14)
    }
}

// MARK: - 06 Метки и приметы

private struct MarksDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DemoLine("Статусы") {
                YKChip("Черновик")
                YKChip("В работе", kind: .live)
                YKChip("Готово", kind: .success)
                YKChip("Ошибка", kind: .danger)
                YKChip("Новое", kind: .solid)
            }
            DemoLine("Теги") {
                YKTag("Вебинар") {}
                YKTag("Рассылка") {}
                YKTag.add()
            }
            DemoLine("Аватары") {
                YKAvatar(name: "Юрий Курилов")
                YKAvatar(name: "Мария Кравец", hasNewDot: true)
                YKAvatar.agent()
                YKAvatar(name: "Анна Иванова", size: .sm)
            }
            DemoLine("Прогресс") {
                YKSteps(total: 5, done: 2)
                YKSteps(total: 5, done: 3, isLive: true)
                Text("3/5").ykMonoNum(size: 12).foregroundStyle(YKColorRole.muted.color)
            }
            DemoLine("Сфера") {
                YKSphere(size: 12)
                YKSphere(size: 16)
                YKSphere(size: 24)
                YKSphere(size: 48)
                YKSphere(size: 96)
                YKNewDot()
            }
        }
    }
}

// MARK: - 07 Карточки и списки

private struct CardsDemo: View {
    @State private var reminders = true
    private let recentFiles = ["План рассылки.md", "Квиз по уроку 7.md", "Обложка вебинара.png"]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            YKCard {
                HStack {
                    Text("Лендинг вебинара").ykText(.heading, size: 16)
                    Spacer(minLength: 8)
                    YKChip("В работе", kind: .live)
                }
                Text("Обновлено 2 ч назад · 3/5").ykMonoLabel(size: 10.5)
                YKSteps(total: 5, done: 3, isLive: true, width: nil)
            }
            YKStat("Задач открыто", value: "27", total: "/ 64", delta: "12% за неделю")
            YKListGroup {
                YKListRow("Идеи для рассылки", subtitle: "8 заметок", icon: .sparkle, accessory: .newDotAndChevron, isSelected: true)
                YKListDivider()
                YKListRow("Обложки курса", subtitle: "14 файлов", icon: .image, accessory: .chevron)
                YKListDivider()
                YKListRow("Напоминания агенту", icon: .bell) {
                    Toggle(isOn: $reminders) { EmptyView() }.toggleStyle(.ykSwitch)
                }
                YKListDivider()
                YKListRow("Задачи", icon: .listChecks, accessory: .value("27"))
            }
            YKListGroup(recentFiles, id: \.self) { name in
                YKListRow(name, icon: .fileText, accessory: .chevron)
            }
        }
    }
}

// MARK: - 08 Всплывающее

private struct OverlaysDemo: View {
    @State private var showsSheet = false
    @State private var showsAlert = false
    @State private var showsDialog = false
    @State private var projectName = "Марафон по ИИ"
    let presenting: YKShowcaseView.Presentation?

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DemoLine("Открыть", stacksWhenCrowded: true) {
                Button("Окно") { showsAlert = true }.buttonStyle(.yk(.outline))
                Button("Выбор действия") { showsDialog = true }.buttonStyle(.yk(.outline))
                Button("Шторка") { showsSheet = true }.buttonStyle(.yk(.outline))
            }
            DemoLine("Меню", stacksWhenCrowded: true) {
                YKMenuButton {
                    projectMenuItems
                } label: {
                    HStack(spacing: 6) { Text("Действия"); YKIcon(.caretDown, size: 14) }
                }
                YKMenuButton(label: "Ещё действия") { projectMenuItems }
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Шторка · вид").ykMonoLabel()
                sheetBody
                    .background(YKSheetMetrics.backgroundRole.color, in: UnevenRoundedRectangle(
                        topLeadingRadius: YKSheetMetrics.cornerRadius, topTrailingRadius: YKSheetMetrics.cornerRadius
                    ))
                    .ykPopShadow(cornerRadius: YKSheetMetrics.cornerRadius)
                    .padding(YKTokens.Space.s4)
                    .padding(.bottom, -YKTokens.Space.s4)
                    .background(YKColorRole.surface2.color, in: RoundedRectangle(cornerRadius: YKTokens.Radius.xl))
                    .clipShape(RoundedRectangle(cornerRadius: YKTokens.Radius.xl))
            }
            YKToast("Проект удалён", actionTitle: "Вернуть") {}
            YKBanner("Агент собирает план рассылки.", message: "Можно закрыть окно — пришлём уведомление, когда будет готово.", kind: .agent)
            YKBanner("Письмо не отправлено.", message: "Почтовый сервис не отвечает. Агент повторит через 5 минут.", kind: .danger)
            YKBanner("Черновик сохранён.", message: "Его видите только вы, пока не нажмёте «Опубликовать».")
        }
        .ykSystemDialogs()
        .alert("Удалить «Квиз по уроку 7»?", isPresented: $showsAlert) {
            Button("Отмена", role: .cancel) {}
            Button("Удалить", role: .destructive) {}
        } message: {
            Text("Проект и 5 задач исчезнут. Вернуть их можно в течение 30 дней из архива.")
        }
        .confirmationDialog("Квиз по уроку 7", isPresented: $showsDialog, titleVisibility: .visible) {
            projectMenuItems
            Button("Отмена", role: .cancel) {}
        }
        .ykSheet(isPresented: $showsSheet, detents: [.height(260), .medium]) {
            // Панель инструментов внутри шторки: кнопки берут цвет текста из .ykSheet
            NavigationStack {
                sheetFields
                    .padding(.top, 4)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .background(YKSheetMetrics.backgroundRole.color)
                    .navigationTitle("Новый проект")
                    #if os(iOS)
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbarBackground(YKSheetMetrics.backgroundRole.color, for: .navigationBar)
                    #endif
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) { Button("Отмена") { showsSheet = false } }
                        ToolbarItem(placement: .confirmationAction) { Button("Готово") { showsSheet = false } }
                    }
            }
        }
        .onAppear {
            switch presenting {
            case .sheet: showsSheet = true
            case .alert: showsAlert = true
            case .dialog: showsDialog = true
            case nil: break
            }
        }
    }

    @ViewBuilder private var projectMenuItems: some View {
        // Пункты системного меню — без значков: SF Symbols не наши, а Phosphor-картинки система не уменьшает
        Button("Переименовать") {}
        Button("Дублировать") {}
        Button("Спросить агента") {}
        Button("Удалить", role: .destructive) {}
    }

    private var sheetBody: some View {
        YKSheetContent(title: "Новый проект") { sheetFields }
    }

    private var sheetFields: some View {
        VStack(spacing: 12) {
            YKTextField(text: $projectName)
            Button {} label: { Text("Создать").frame(maxWidth: .infinity) }
                .buttonStyle(.yk(.primary, size: .lg))
        }
    }
}

// MARK: - 09 Пусто и загрузка

private struct EmptyDemo: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            YKEmptyState(label: "Проектов · 0", title: "Здесь пока пусто", message: "Создайте проект сами или опишите задачу агенту — он соберёт черновик.") {
                Button("Спросить агента") {}.buttonStyle(.yk(.secondary))
                Button("Создать проект") {}.buttonStyle(.yk(.primary))
            }
            YKCard {
                Text(reduceMotion ? "Уменьшение движения · вкл" : "Уменьшение движения · выкл").ykMonoLabel(size: 10.5)
                YKSkeleton()
            }
        }
    }
}

#Preview("Светлая") { YKShowcaseView() }
#Preview("Тёмная") { YKShowcaseView().preferredColorScheme(.dark) }
