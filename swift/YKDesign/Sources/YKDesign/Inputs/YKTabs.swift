import SwiftUI

/// Подчёркнутые вкладки внутри экрана: активная — цвет текста и линия акцента снизу.
/// Нижняя навигация приложения — системный `TabView`, это не он.
public enum YKTabsAppearance {
    public static func titleRole(isSelected: Bool) -> YKColorRole { isSelected ? .text : .muted }
    public static func titleWeight(isSelected: Bool) -> Font.Weight { isSelected ? .medium : .regular }
    public static let indicatorRole: YKColorRole = .accent
    public static let indicatorHeight: CGFloat = 2
    public static let countRole: YKColorRole = .muted
}

/// Вкладка: название и необязательный счётчик моноширинными цифрами.
public struct YKTab<Value: Hashable>: Hashable {
    public let value: Value
    public let title: String
    public let count: Int?

    public init(_ value: Value, _ title: String, count: Int? = nil) {
        self.value = value
        self.title = title
        self.count = count
    }
}

public struct YKTabs<Value: Hashable>: View {
    @Binding var selection: Value
    let tabs: [YKTab<Value>]
    @Namespace private var indicatorSpace

    public init(selection: Binding<Value>, tabs: [YKTab<Value>]) {
        self._selection = selection
        self.tabs = tabs
    }

    public var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 22) {
                ForEach(tabs, id: \.value) { tab in
                    tabButton(tab)
                }
            }
        }
        .scrollIndicators(.hidden)
        .overlay(alignment: .bottom) { YKColorRole.border.color.frame(height: 1) }
        .animation(.ykOut(), value: selection)
    }

    private func tabButton(_ tab: YKTab<Value>) -> some View {
        let isSelected = tab.value == selection
        return Button {
            selection = tab.value
        } label: {
            HStack(spacing: 6) {
                Text(tab.title)
                    .ykText(.body, size: 14, weight: isSelected ? 500 : 400)
                    .foregroundStyle(YKTabsAppearance.titleRole(isSelected: isSelected).color)
                if let count = tab.count {
                    Text("\(count)").ykMonoNum(size: 11).foregroundStyle(YKTabsAppearance.countRole.color)
                }
            }
            .padding(.top, 8)
            .padding(.bottom, 10)
            .overlay(alignment: .bottom) {
                if isSelected {
                    YKTabsAppearance.indicatorRole.color
                        .frame(height: YKTabsAppearance.indicatorHeight)
                        .matchedGeometryEffect(id: "indicator", in: indicatorSpace)
                }
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
