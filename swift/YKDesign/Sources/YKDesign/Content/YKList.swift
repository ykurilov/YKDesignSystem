import SwiftUI

/// Что стоит у строки справа.
public enum YKListRowAccessory {
    case none
    case chevron
    case newDot
    /// Точка «новое» и стрелка.
    case newDotAndChevron
    case value(String)
}

/// Строка списка: значок в плашке 30×30, название, подпись, справа — стрелка, точка или своё.
public struct YKListRow<Trailing: View>: View {
    let icon: YKIconName?
    let title: String
    let subtitle: String?
    let accessory: YKListRowAccessory
    let isSelected: Bool
    let trailing: Trailing

    public init(
        _ title: String, subtitle: String? = nil, icon: YKIconName? = nil,
        accessory: YKListRowAccessory = .none, isSelected: Bool = false,
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.accessory = accessory
        self.isSelected = isSelected
        self.trailing = trailing()
    }

    public var body: some View {
        HStack(spacing: YKTokens.Space.s3) {
            if let icon {
                YKIcon(icon, size: 16)
                    .frame(width: 30, height: 30)
                    .background(YKColorRole.surface2.color, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title).ykText(.body, size: 14)
                if let subtitle {
                    Text(subtitle)
                        .ykText(.small, size: 12.5)
                        .foregroundStyle(YKColorRole.muted.color)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            trailing
            accessoryView
        }
        .foregroundStyle(YKColorRole.text.color)
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .frame(minHeight: 52)
        .background {
            if isSelected {
                YKColorRole.accentSoft.color.opacity(0.55)
                    .overlay(alignment: .leading) { YKColorRole.accent.color.frame(width: 2) }
            }
        }
        .contentShape(Rectangle())
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }

    @ViewBuilder private var accessoryView: some View {
        switch accessory {
        case .none: EmptyView()
        case .chevron: chevron
        case .newDot: YKNewDot()
        case .newDotAndChevron: YKNewDot(); chevron
        case .value(let text): Text(text).ykMonoNum(size: 12).foregroundStyle(YKColorRole.muted.color)
        }
    }

    private var chevron: some View {
        YKIcon(.caretRight, size: 14).foregroundStyle(YKColorRole.faint.color)
    }
}

public extension YKListRow where Trailing == EmptyView {
    init(
        _ title: String, subtitle: String? = nil, icon: YKIconName? = nil,
        accessory: YKListRowAccessory = .none, isSelected: Bool = false
    ) {
        self.init(title, subtitle: subtitle, icon: icon, accessory: accessory, isSelected: isSelected) { EmptyView() }
    }
}

/// Где в группе строк нужна линия.
public enum YKListGroupLayout {
    /// Линия — только между соседними строками, не после последней.
    public static func showsDivider(after index: Int, count: Int) -> Bool {
        index < count - 1
    }
}

/// Группа строк в рамке.
/// Из данных линии между строками ставятся сами: `YKListGroup(projects, id: \.id) { YKListRow($0.title) }`.
/// Для постоянного набора строк линии ставятся явно: `YKListRow(…); YKListDivider(); YKListRow(…)`.
public struct YKListGroup<Content: View>: View {
    let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) { content }
            .ykSurface(cornerRadius: YKTokens.Radius.lg)
    }
}

public extension YKListGroup {
    init<Data: RandomAccessCollection, ID: Hashable, Row: View>(
        _ data: Data, id: KeyPath<Data.Element, ID>, @ViewBuilder row: @escaping (Data.Element) -> Row
    ) where Content == YKListRows<Data.Element, ID, Row> {
        self.init { YKListRows(Array(data), id: id, row: row) }
    }
}

/// Строки из данных с линией между соседними.
public struct YKListRows<Element, ID: Hashable, Row: View>: View {
    private struct Item: Identifiable {
        let id: ID
        let index: Int
        let element: Element
    }

    private let items: [Item]
    private let row: (Element) -> Row

    init(_ elements: [Element], id: KeyPath<Element, ID>, row: @escaping (Element) -> Row) {
        self.items = elements.enumerated().map { Item(id: $0.element[keyPath: id], index: $0.offset, element: $0.element) }
        self.row = row
    }

    public var body: some View {
        ForEach(items) { item in
            row(item.element)
            if YKListGroupLayout.showsDivider(after: item.index, count: items.count) {
                YKListDivider()
            }
        }
    }
}

/// Линия между строками группы.
public struct YKListDivider: View {
    public init() {}

    public var body: some View {
        YKColorRole.border.color.frame(height: 1).accessibilityHidden(true)
    }
}
