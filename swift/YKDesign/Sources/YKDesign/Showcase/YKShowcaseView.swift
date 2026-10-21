import SwiftUI

/// Витрина компонентов — разделы как в наброске 09.
/// `initialSection` (1…9) сразу прокручивает к разделу: так снимаются снимки экрана.
public struct YKShowcaseView: View {
    let initialSection: Int?

    public init(initialSection: Int? = nil) {
        self.initialSection = initialSection
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
                    ShowcaseSection(8, "Уведомления", "Плашки в потоке экрана и всплывающее уведомление.") { NoticesDemo() }
                    ShowcaseSection(9, "Пусто", nil) { EmptyDemo() }
                }
                .padding(.horizontal, YKTokens.Space.s5)
                .padding(.top, YKTokens.Space.s4)
                .padding(.bottom, YKTokens.Space.s10)
            }
            .background(YKColorRole.bg.color)
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
private struct DemoLine<Content: View>: View {
    let label: String
    let content: Content

    init(_ label: String, @ViewBuilder content: () -> Content) {
        self.label = label
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(label).ykMonoLabel()
            FlowLayout(spacing: 10) { content }
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
                let size = subviews[index].sizeThatFits(.unspecified)
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
            Text(label).ykMonoLabel(color: .faint)
            sample()
        }
    }
}

// MARK: - 03 Кнопки

private struct ButtonsDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            DemoLine("Виды") {
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
            DemoLine("Состояния") {
                Button("Обычная") {}.buttonStyle(.yk(.primary))
                Button("Отключена") {}.buttonStyle(.yk(.primary)).disabled(true)
                Button("Агент пишет…") {}.buttonStyle(.yk(.primary, isLoading: true))
                Button("Думаю…") {}.buttonStyle(.yk(.secondary, isLoading: true))
            }
            DemoLine("Размеры") {
                Button("Маленькая") {}.buttonStyle(.yk(.primary, size: .sm))
                Button("Средняя") {}.buttonStyle(.yk(.primary, size: .md))
                Button {} label: {
                    HStack(spacing: 8) { YKIcon(.plus); Text("Большая · телефон") }
                }
                .buttonStyle(.yk(.primary, size: .lg))
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
                .foregroundStyle(YKColorRole.faint.color)
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
            DemoLine("Сегменты") {
                YKSegmented(selection: $filter, options: [("all", "Все"), ("mine", "Мои"), ("archive", "Архив")])
            }
        }
        .font(.system(size: 14))
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

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            YKCard {
                HStack {
                    Text("Лендинг вебинара").font(.system(size: 16, weight: .semibold)).tracking(-0.16)
                    Spacer(minLength: 8)
                    YKChip("В работе", kind: .live)
                }
                Text("Обновлено 2 ч назад · 3/5").ykMonoLabel(size: 10.5)
                YKSteps(total: 5, done: 3, isLive: true, width: nil)
            }
            YKStat("Задач открыто", value: "27", total: "/ 64", delta: "12% за неделю")
            YKListGroup {
                YKListRow("Идеи для рассылки", subtitle: "8 заметок", icon: .sparkle, accessory: .newDotAndChevron, isSelected: true)
                YKListRow("Обложки курса", subtitle: "14 файлов", icon: .image, accessory: .chevron)
                YKListRow("Напоминания агенту", icon: .bell) {
                    Toggle(isOn: $reminders) { EmptyView() }.toggleStyle(.ykSwitch)
                }
                YKListRow("Задачи", icon: .listChecks, accessory: .value("27"))
            }
        }
    }
}

// MARK: - 08 Уведомления

private struct NoticesDemo: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            YKToast("Проект удалён", actionTitle: "Вернуть") {}
            YKBanner("Агент собирает план рассылки.", message: "Можно закрыть окно — пришлём уведомление, когда будет готово.", kind: .agent)
            YKBanner("Письмо не отправлено.", message: "Почтовый сервис не отвечает. Агент повторит через 5 минут.", kind: .danger)
            YKBanner("Черновик сохранён.", message: "Его видите только вы, пока не нажмёте «Опубликовать».")
        }
    }
}

// MARK: - 09 Пусто

private struct EmptyDemo: View {
    var body: some View {
        YKEmptyState(label: "Проектов · 0", title: "Здесь пока пусто", message: "Создайте проект сами или опишите задачу агенту — он соберёт черновик.") {
            Button("Спросить агента") {}.buttonStyle(.yk(.secondary))
            Button("Создать проект") {}.buttonStyle(.yk(.primary))
        }
    }
}

#Preview("Светлая") { YKShowcaseView() }
#Preview("Тёмная") { YKShowcaseView().preferredColorScheme(.dark) }
