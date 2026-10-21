import SwiftUI

/// Радио 20×20: выбранное — толстое кольцо акцента, невыбранное — тонкая рамка.
public enum YKRadioAppearance {
    public static func borderRole(isSelected: Bool) -> YKColorRole { isSelected ? .accent : .borderStrong }
    public static func borderWidth(isSelected: Bool) -> CGFloat { isSelected ? 6 : 1.5 }
}

/// Что VoiceOver говорит о пункте радио кроме названия.
public enum YKRadioAccessibility {
    /// «1 из 3».
    public static func position(index: Int, count: Int) -> String {
        "\(index + 1) из \(count)"
    }
}

/// Группа выбора одного из нескольких:
/// `YKRadioGroup("Напоминания", selection: $period, options: [(.daily, "Каждый день"), …])`.
/// VoiceOver читает название группы, у пункта — «выбрано» и позицию «1 из 3».
public struct YKRadioGroup<Value: Hashable>: View {
    @Binding var selection: Value
    let label: String
    let choices: [(value: Value, title: String)]
    let axis: Axis

    /// - Parameters:
    ///   - label: название группы для VoiceOver.
    ///   - axis: `.vertical` — столбиком (по умолчанию), `.horizontal` — в строку.
    public init(_ label: String, selection: Binding<Value>, options: [(value: Value, title: String)], axis: Axis = .vertical) {
        self.label = label
        self._selection = selection
        self.choices = options
        self.axis = axis
    }

    /// Варианты из `Identifiable`-значений: выбор хранит их `id`.
    public init<Item: Identifiable>(
        _ label: String, selection: Binding<Value>, items: [Item], title: KeyPath<Item, String>, axis: Axis = .vertical
    ) where Item.ID == Value {
        self.init(label, selection: selection, options: Self.options(items, title: title), axis: axis)
    }

    nonisolated static func options<Item: Identifiable>(_ items: [Item], title: KeyPath<Item, String>) -> [(value: Value, title: String)]
    where Item.ID == Value {
        items.map { (value: $0.id, title: $0[keyPath: title]) }
    }

    public var body: some View {
        let layout = axis == .vertical
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12))
            : AnyLayout(HStackLayout(spacing: 16))
        layout {
            ForEach(Array(choices.enumerated()), id: \.offset) { index, option in
                YKRadio(option.title, isSelected: option.value == selection) {
                    selection = option.value
                }
                .accessibilityValue(Text(YKRadioAccessibility.position(index: index, count: choices.count)))
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(label))
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
