import SwiftUI

/// Роли текста из шкалы переменных. Моноширинные — только метка и число.
public enum YKTextRole: CaseIterable, Sendable {
    /// Экран · 30
    case screen
    /// Раздел · 22
    case section
    /// Заголовок · 17
    case heading
    /// Текст · 15
    case body
    /// Мелкий · 13
    case small
    /// Метка · 11, моноширинный капс
    case label
    /// Число · 24, моноширинные цифры
    case number

    public var style: YKTextStyle {
        switch self {
        case .screen: YKTokens.Text.display
        case .section: YKTokens.Text.title
        case .heading: YKTokens.Text.heading
        case .body: YKTokens.Text.body
        case .small: YKTokens.Text.small
        case .label: YKTokens.Text.label
        case .number: YKTokens.Text.number
        }
    }

    /// Системный стиль, вместе с которым роль растёт при крупном шрифте (Dynamic Type).
    var dynamicTypeStyle: Font.TextStyle {
        switch self {
        case .screen: .largeTitle
        case .section: .title2
        case .heading: .headline
        case .body: .body
        case .small: .footnote
        case .label: .caption2
        case .number: .title
        }
    }
}

/// Пересчёт стиля из переменных в величины SwiftUI.
public enum YKTextMetrics {
    /// Разрядка в точках: em × кегль.
    public static func tracking(_ style: YKTextStyle, size: CGFloat) -> CGFloat {
        style.letterSpacing * size
    }

    /// Добавка между строками, чтобы получить высоту строки из переменных.
    /// У системного шрифта своя высота строки ≈ 1.2 кегля; меньше её не сжимаем.
    public static func lineSpacing(_ style: YKTextStyle, size: CGFloat) -> CGFloat {
        guard let lineHeight = style.lineHeight else { return 0 }
        return max(0, (lineHeight - systemLineHeight) * size)
    }

    public static func weight(_ value: Int) -> Font.Weight {
        switch value {
        case ..<200: .ultraLight
        case ..<300: .thin
        case ..<400: .light
        case ..<500: .regular
        case ..<600: .medium
        case ..<700: .semibold
        case ..<800: .bold
        case ..<900: .heavy
        default: .black
        }
    }

    static let systemLineHeight: CGFloat = 1.2
}

/// Применяет стиль текста: шрифт, разрядку, высоту строки и капс. Кегль растёт с Dynamic Type.
struct YKTextStyleModifier: ViewModifier {
    let style: YKTextStyle
    let weight: Int
    @ScaledMetric private var size: CGFloat

    init(style: YKTextStyle, size: CGFloat? = nil, weight: Int? = nil, relativeTo textStyle: Font.TextStyle) {
        self.style = style
        self.weight = weight ?? style.weight
        _size = ScaledMetric(wrappedValue: size ?? style.size, relativeTo: textStyle)
    }

    func body(content: Content) -> some View {
        content
            .font(.system(size: size, weight: YKTextMetrics.weight(weight), design: style.family == .mono ? .monospaced : .default))
            .tracking(YKTextMetrics.tracking(style, size: size))
            .lineSpacing(YKTextMetrics.lineSpacing(style, size: size))
            .textCase(style.uppercase ? .uppercase : nil)
    }
}

public extension View {
    /// Роль текста: `.ykText(.heading)`.
    func ykText(_ role: YKTextRole) -> some View {
        modifier(YKTextStyleModifier(style: role.style, relativeTo: role.dynamicTypeStyle))
    }

    /// Метка «Чертежа»: моноширинный капс с разрядкой, приглушённым цветом. Только для меток, не для текста.
    /// - Parameter tracking: разрядка в em; в плотных метках (статусы, сегменты) — 0.05.
    func ykMonoLabel(
        size: CGFloat = YKTokens.Text.label.size,
        tracking: CGFloat = YKTokens.Text.label.letterSpacing,
        weight: Int = YKTokens.Text.label.weight,
        color: YKColorRole = .muted
    ) -> some View {
        let label = YKTokens.Text.label
        let style = YKTextStyle(
            family: label.family, size: size, weight: weight,
            letterSpacing: tracking, lineHeight: label.lineHeight, uppercase: label.uppercase
        )
        return modifier(YKTextStyleModifier(style: style, relativeTo: .caption2))
            .foregroundStyle(color.color)
    }

    /// Моноширинные цифры. Без размера — роль «Число · 24».
    func ykMonoNum(size: CGFloat? = nil, weight: Int? = nil) -> some View {
        modifier(YKTextStyleModifier(
            style: YKTokens.Text.number,
            size: size,
            weight: weight ?? (size == nil ? YKTokens.Text.number.weight : 400),
            relativeTo: size == nil ? .title : .caption
        ))
    }
}
