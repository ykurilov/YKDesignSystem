import SwiftUI

/// Размеры квадратной кнопки-значка.
public enum YKIconButtonMetrics {
    /// Сторона квадрата — как высота обычной кнопки того же размера.
    public static func side(for size: YKButtonSize) -> CGFloat { size.metrics.height }

    public static func iconSize(for size: YKButtonSize) -> CGFloat {
        switch size {
        case .sm: 14
        case .md: 16
        case .lg: 18
        }
    }
}

/// Квадратная кнопка со значком. Подпись обязательна: её читает VoiceOver, на экране её нет.
public struct YKIconButton: View {
    let icon: YKIconName
    let accessibilityTitle: String
    let variant: YKButtonVariant
    let size: YKButtonSize
    let iconWeight: YKIcon.Weight
    let action: () -> Void

    public init(
        _ icon: YKIconName, label accessibilityTitle: String,
        variant: YKButtonVariant = .secondary, size: YKButtonSize = .md,
        iconWeight: YKIcon.Weight = .regular, action: @escaping () -> Void
    ) {
        self.icon = icon
        self.accessibilityTitle = accessibilityTitle
        self.variant = variant
        self.size = size
        self.iconWeight = iconWeight
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            YKIcon(icon, size: YKIconButtonMetrics.iconSize(for: size), weight: iconWeight)
        }
        .buttonStyle(YKIconButtonStyle(variant: variant, size: size))
        .accessibilityLabel(Text(accessibilityTitle))
    }
}

private struct YKIconButtonStyle: ButtonStyle {
    let variant: YKButtonVariant
    let size: YKButtonSize

    func makeBody(configuration: Configuration) -> some View {
        YKIconButtonBody(variant: variant, size: size, configuration: configuration)
    }
}

private struct YKIconButtonBody: View {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let configuration: ButtonStyleConfiguration
    @Environment(\.isEnabled) private var isEnabled

    var body: some View {
        YKButtonChrome(
            variant: variant, size: size,
            state: YKButtonState(isEnabled: isEnabled, isPressed: configuration.isPressed, isLoading: false),
            squareSide: YKIconButtonMetrics.side(for: size)
        ) {
            configuration.label
        }
        .animation(.ykOut(duration: 0.2), value: configuration.isPressed)
    }
}
