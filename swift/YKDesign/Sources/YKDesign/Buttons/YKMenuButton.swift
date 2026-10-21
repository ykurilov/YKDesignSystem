import PhosphorSwift
import SwiftUI

/// Системное меню (`Menu`) с кнопкой-триггером в нашем виде. Пункты — обычные `Button`,
/// опасный — `Button(role: .destructive)`; цвет пунктов — цвет текста, а не системный синий.
public struct YKMenuButton<Items: View, Label: View>: View {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let squareSide: CGFloat?
    let accessibilityTitle: String?
    let items: Items
    let label: Label

    /// Триггер с подписью: `YKMenuButton { … } label: { Text("Ещё") }`.
    public init(
        variant: YKButtonVariant = .outline, size: YKButtonSize = .md,
        @ViewBuilder items: () -> Items, @ViewBuilder label: () -> Label
    ) {
        self.variant = variant
        self.size = size
        self.squareSide = nil
        self.accessibilityTitle = nil
        self.items = items()
        self.label = label()
    }

    public var body: some View {
        Menu {
            items
        } label: {
            YKButtonChrome(
                variant: variant, size: size,
                state: YKButtonState(isEnabled: true, isPressed: false, isLoading: false),
                squareSide: squareSide
            ) { label }
        }
        .menuIndicator(.hidden)
        .tint(YKSystemDialogs.tintRole.color)
        .ykAccessibilityLabel(accessibilityTitle)
    }
}

/// Триггер меню со значком.
public enum YKMenuTrigger {
    /// Квадрат с заливкой: «···» без формы почти не виден. Прозрачный `.ghost` — только по явному выбору.
    public static let defaultIconVariant: YKButtonVariant = .secondary
}

public extension YKMenuButton where Label == YKIcon {
    /// Квадратный триггер со значком, по умолчанию «три точки». Подпись — для VoiceOver.
    init(
        icon: YKIconName = .dotsThree, label accessibilityTitle: String,
        variant: YKButtonVariant = YKMenuTrigger.defaultIconVariant, size: YKButtonSize = .md,
        @ViewBuilder items: () -> Items
    ) {
        self.variant = variant
        self.size = size
        self.squareSide = YKIconButtonMetrics.side(for: size)
        self.items = items()
        self.label = YKIcon(icon, size: YKIconButtonMetrics.iconSize(for: size))
        self.accessibilityTitle = accessibilityTitle
    }
}

extension View {
    /// Подпись для VoiceOver, только если она задана: иначе VoiceOver читает видимый текст.
    @ViewBuilder func ykAccessibilityLabel(_ title: String?) -> some View {
        if let title { accessibilityLabel(Text(title)) } else { self }
    }
}
