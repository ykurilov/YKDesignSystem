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
        case .danger: Palette(background: .danger, foreground: .white, border: nil)
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
}

/// Кнопка YKDesign: `.buttonStyle(.yk(.primary, size: .lg, isLoading: sending))`.
public struct YKButtonStyle: ButtonStyle {
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

public extension ButtonStyle where Self == YKButtonStyle {
    static func yk(_ variant: YKButtonVariant = .primary, size: YKButtonSize = .md, isLoading: Bool = false) -> YKButtonStyle {
        YKButtonStyle(variant, size: size, isLoading: isLoading)
    }
}

private struct YKButtonBody: View {
    let variant: YKButtonVariant
    let size: YKButtonSize
    let isLoading: Bool
    let configuration: ButtonStyleConfiguration

    @Environment(\.isEnabled) private var isEnabled
    @ScaledMetric private var height: CGFloat
    @ScaledMetric private var fontSize: CGFloat

    init(variant: YKButtonVariant, size: YKButtonSize, isLoading: Bool, configuration: ButtonStyleConfiguration) {
        self.variant = variant
        self.size = size
        self.isLoading = isLoading
        self.configuration = configuration
        _height = ScaledMetric(wrappedValue: size.metrics.height, relativeTo: .body)
        _fontSize = ScaledMetric(wrappedValue: size.metrics.fontSize, relativeTo: .body)
    }

    var body: some View {
        let state = YKButtonState(isEnabled: isEnabled, isPressed: configuration.isPressed, isLoading: isLoading)
        let palette = variant.palette
        let shape = RoundedRectangle(cornerRadius: size.metrics.cornerRadius, style: .continuous)

        HStack(spacing: YKTokens.Space.s2) {
            if state.showsSphere {
                YKSphere(size: 16, color: palette.foreground.color)
            }
            configuration.label
        }
        .font(.system(size: fontSize, weight: variant.fontWeight))
        .lineLimit(1)
        .foregroundStyle(palette.foreground.color)
        .padding(.horizontal, variant.horizontalPadding(for: size))
        .frame(minHeight: height)
        .background(palette.background.color, in: shape)
        .overlay {
            if let border = palette.border {
                shape.strokeBorder(border.color, lineWidth: 1)
            }
        }
        .contentShape(shape)
        .scaleEffect(state.scale)
        .opacity(state.opacity)
        .allowsHitTesting(state.acceptsTaps)
        .animation(.ykOut(duration: 0.2), value: configuration.isPressed)
    }
}
