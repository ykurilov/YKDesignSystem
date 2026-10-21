import SwiftUI

/// Сегменты: моноширинный капс, активный — текст акцента на светлой плашке.
public enum YKSegmentAppearance {
    public static func foregroundRole(isSelected: Bool) -> YKColorRole { isSelected ? .accentText : .muted }
    /// В тёмной теме плашка активного сегмента светлее дорожки.
    public static func selectedBackgroundRole(isDark: Bool) -> YKColorRole { isDark ? .surface3 : .surface }
}

/// `YKSegmented(selection: $filter, options: [(.all, "Все"), (.mine, "Мои")])`.
public struct YKSegmented<Value: Hashable>: View {
    @Binding var selection: Value
    let options: [(value: Value, title: String)]
    @Environment(\.colorScheme) private var colorScheme
    @Namespace private var selectionSpace

    public init(selection: Binding<Value>, options: [(value: Value, title: String)]) {
        self._selection = selection
        self.options = options
    }

    public var body: some View {
        HStack(spacing: 0) {
            ForEach(options, id: \.value) { option in
                let isSelected = option.value == selection
                Button {
                    selection = option.value
                } label: {
                    Text(option.title)
                        .ykMonoLabel(
                            tracking: 0.05,
                            weight: isSelected ? 600 : 400,
                            color: YKSegmentAppearance.foregroundRole(isSelected: isSelected)
                        )
                        .padding(.horizontal, 14)
                        .padding(.vertical, 6)
                        .background {
                            if isSelected {
                                RoundedRectangle(cornerRadius: 8, style: .continuous)
                                    .fill(YKSegmentAppearance.selectedBackgroundRole(isDark: colorScheme == .dark).color)
                                    .shadow(color: .black.opacity(0.08), radius: 1, y: 1)
                                    .matchedGeometryEffect(id: "selection", in: selectionSpace)
                            }
                        }
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isSelected ? .isSelected : [])
            }
        }
        .padding(3)
        .background(YKColorRole.surface2.color, in: RoundedRectangle(cornerRadius: YKTokens.Radius.md, style: .continuous))
        .animation(.ykOut(), value: selection)
        .fixedSize()
    }
}
