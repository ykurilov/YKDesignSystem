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
                Text(title).font(.system(size: 14))
                if let subtitle {
                    Text(subtitle)
                        .modifier(YKTextStyleModifier(style: YKTokens.Text.small, size: 12.5, relativeTo: .footnote))
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

/// Группа строк в рамке с линиями между строками.
public struct YKListGroup<Content: View>: View {
    let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        _VariadicView.Tree(YKListDividedLayout()) { content }
            .ykSurface(cornerRadius: YKTokens.Radius.lg)
    }
}

/// Раскладка строк с линией между соседними: так строки не знают о своих соседях.
private struct YKListDividedLayout: _VariadicView_MultiViewRoot {
    func body(children: _VariadicView.Children) -> some View {
        VStack(spacing: 0) {
            ForEach(children) { child in
                child
                if child.id != children.last?.id {
                    YKColorRole.border.color.frame(height: 1)
                }
            }
        }
    }
}
