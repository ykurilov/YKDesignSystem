import SwiftUI

/// Вид кнопки. Главная (`primary`) — всегда чёрная (в тёмной теме светлая), одна на экран.
public enum YKButtonVariant: CaseIterable, Sendable {
    case primary, secondary, outline, ghost, danger, link

    public struct Palette: Equatable, Sendable {
        public let background: YKColorRole
        public let foreground: YKColorRole
        /// Внутренняя обводка в 1 точку.
        public let border: YKColorRole?
    }

    public var palette: Palette {
        switch self {
        case .primary: Palette(background: .ink, foreground: .onInk, border: nil)
        case .secondary: Palette(background: .surface2, foreground: .text, border: nil)
        case .outline: Palette(background: .clear, foreground: .text, border: .borderStrong)
        case .ghost: Palette(background: .clear, foreground: .text, border: nil)
        case .danger: Palette(background: .danger, foreground: .onDanger, border: nil)
        case .link: Palette(background: .clear, foreground: .accentText, border: nil)
        }
    }

    public var fontWeight: Font.Weight { self == .link ? .medium : .semibold }

    public func horizontalPadding(for size: YKButtonSize) -> CGFloat {
        self == .link ? 4 : size.metrics.horizontalPadding
    }
}

/// Размер кнопки. `lg` — для телефона.
public enum YKButtonSize: CaseIterable, Sendable {
    case sm, md, lg

    public struct Metrics: Equatable, Sendable {
        public let height: CGFloat
        public let horizontalPadding: CGFloat
        public let fontSize: CGFloat
        public let cornerRadius: CGFloat
    }

    public var metrics: Metrics {
        switch self {
        case .sm: Metrics(height: 32, horizontalPadding: 12, fontSize: 13, cornerRadius: 8)
        case .md: Metrics(height: 40, horizontalPadding: 16, fontSize: 14, cornerRadius: YKTokens.Radius.md)
        case .lg: Metrics(height: 48, horizontalPadding: 22, fontSize: 15, cornerRadius: YKTokens.Radius.md)
        }
    }
}

/// Что видно у кнопки в данный момент: сжатие при нажатии, приглушение, сфера загрузки.
public struct YKButtonState: Equatable, Sendable {
    public let isEnabled: Bool
    public let isPressed: Bool
    public let isLoading: Bool

    public init(isEnabled: Bool, isPressed: Bool, isLoading: Bool) {
        self.isEnabled = isEnabled
        self.isPressed = isPressed
        self.isLoading = isLoading
    }

    public var scale: CGFloat { isEnabled && isPressed ? 0.97 : 1 }
    public var opacity: Double { isEnabled ? 1 : 0.4 }
    public var showsSphere: Bool { isLoading }
    /// Во время загрузки повторное нажатие не принимается.
    public var acceptsTaps: Bool { isEnabled && !isLoading }
    /// Срабатывает ли действие — и от пальца, и от VoiceOver.
    public var shouldTriggerAction: Bool { acceptsTaps }
    /// Для VoiceOver кнопка в загрузке недоступна («недоступно»), хотя выглядит обычной.
    public var isAccessibilityDisabled: Bool { !acceptsTaps }
    /// Что VoiceOver скажет после названия кнопки.
    public var accessibilityValue: String? { isLoading ? "Загрузка" : nil }
}

/// Кнопка YKDesign: `.buttonStyle(.yk(.primary, size: .lg, isLoading: sending))`.
/// Стиль сам решает, вызывать ли действие: во время загрузки оно не срабатывает ни от касания, ни от VoiceOver.
public struct YKButtonStyle: PrimitiveButtonStyle {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let isLoading: Bool

    public init(_ variant: YKButtonVariant = .primary, size: YKButtonSize = .md, isLoading: Bool = false) {
        self.variant = variant
        self.size = size
        self.isLoading = isLoading
    }

    public func makeBody(configuration: Configuration) -> some View {
        YKButtonBody(variant: variant, size: size, isLoading: isLoading, configuration: configuration)
    }
}

public extension PrimitiveButtonStyle where Self == YKButtonStyle {
    static func yk(_ variant: YKButtonVariant = .primary, size: YKButtonSize = .md, isLoading: Bool = false) -> YKButtonStyle {
        YKButtonStyle(variant, size: size, isLoading: isLoading)
    }
}

private struct YKButtonBody: View {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let isLoading: Bool
    let configuration: PrimitiveButtonStyleConfiguration
    @Environment(\.isEnabled) private var isEnabled

    var body: some View {
        let state = YKButtonState(isEnabled: isEnabled, isPressed: false, isLoading: isLoading)
        Button {
            if state.shouldTriggerAction { configuration.trigger() }
        } label: {
            configuration.label
        }
        .buttonStyle(YKPressableChromeStyle(variant: variant, size: size, isEnabled: isEnabled, isLoading: isLoading))
        // Отключаем только внутреннюю кнопку: вид задаёт isEnabled снаружи, VoiceOver слышит «недоступно»
        .disabled(state.isAccessibilityDisabled)
        .ykAccessibilityValue(state.accessibilityValue)
    }
}

/// Нажатие и вид; доступность и действие решает YKButtonBody.
private struct YKPressableChromeStyle: ButtonStyle {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let isEnabled: Bool
    let isLoading: Bool

    func makeBody(configuration: Configuration) -> some View {
        YKButtonChrome(
            variant: variant, size: size,
            state: YKButtonState(isEnabled: isEnabled, isPressed: configuration.isPressed, isLoading: isLoading)
        ) {
            configuration.label
        }
        .animation(.ykOut(duration: 0.2), value: configuration.isPressed)
    }
}

extension View {
    @ViewBuilder func ykAccessibilityValue(_ value: String?) -> some View {
        if let value { accessibilityValue(Text(value)) } else { self }
    }
}

/// Внешний вид кнопки без поведения — общий для `YKButtonStyle`, кнопки-значка и кнопки меню.
struct YKButtonChrome<Label: View>: View {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let state: YKButtonState
    /// Ширина квадратной кнопки-значка; `nil` — по содержимому.
    var squareSide: CGFloat? = nil
    @ViewBuilder let label: Label

    @ScaledMetric private var scale: CGFloat = 1

    var body: some View {
        let palette = variant.palette
        let metrics = size.metrics
        let shape = RoundedRectangle(cornerRadius: metrics.cornerRadius, style: .continuous)

        HStack(spacing: YKTokens.Space.s2) {
            if state.showsSphere {
                YKSphere(size: 16, color: palette.foreground.color)
            }
            label
        }
        .font(.system(size: metrics.fontSize * scale, weight: variant.fontWeight))
        .lineLimit(1)
        .foregroundStyle(palette.foreground.color)
        .padding(.horizontal, squareSide == nil ? variant.horizontalPadding(for: size) : 0)
        .frame(minWidth: squareSide.map { $0 * scale }, minHeight: metrics.height * scale)
        .background(palette.background.color, in: shape)
        .overlay {
            if let border = palette.border {
                shape.strokeBorder(border.color, lineWidth: 1)
            }
        }
        .contentShape(shape)
        .scaleEffect(state.scale)
        .opacity(state.opacity)
    }
}
