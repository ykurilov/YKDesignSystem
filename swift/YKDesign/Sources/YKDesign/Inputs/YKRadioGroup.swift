import SwiftUI

/// Радио 20×20: выбранное — толстое кольцо акцента, невыбранное — тонкая рамка.
public enum YKRadioAppearance {
    public static func borderRole(isSelected: Bool) -> YKColorRole { isSelected ? .accent : .borderStrong }
    public static func borderWidth(isSelected: Bool) -> CGFloat { isSelected ? 6 : 1.5 }
}

/// Группа выбора одного из нескольких: `YKRadioGroup(selection: $period, options: [(.daily, "Каждый день"), …])`.
public struct YKRadioGroup<Value: Hashable>: View {
    @Binding var selection: Value
    let options: [(value: Value, title: String)]
    let axis: Axis

    /// - Parameter axis: `.vertical` — столбиком (по умолчанию), `.horizontal` — в строку.
    public init(selection: Binding<Value>, options: [(value: Value, title: String)], axis: Axis = .vertical) {
        self._selection = selection
        self.options = options
        self.axis = axis
    }

    public var body: some View {
        let layout = axis == .vertical
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12))
            : AnyLayout(HStackLayout(spacing: 16))
        layout {
            ForEach(options, id: \.value) { option in
                YKRadio(option.title, isSelected: option.value == selection) {
                    selection = option.value
                }
            }
        }
        .accessibilityElement(children: .contain)
    }
}

/// Один пункт радио с подписью.
public struct YKRadio: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    public init(_ title: String, isSelected: Bool, action: @escaping () -> Void) {
        self.title = title
        self.isSelected = isSelected
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Circle()
                    .fill(YKColorRole.surface.color)
                    .overlay {
                        Circle().strokeBorder(
                            YKRadioAppearance.borderRole(isSelected: isSelected).color,
                            lineWidth: YKRadioAppearance.borderWidth(isSelected: isSelected)
                        )
                    }
                    .frame(width: 20, height: 20)
                    .animation(.ykOut(), value: isSelected)
                Text(title).foregroundStyle(YKColorRole.text.color)
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isSelected ? [.isSelected] : [])
    }
}
