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

    /// Во сколько раз крупнее обычного может стать моноширинная метка.
    public static let monoLabelMaxGrowth: CGFloat = 1.5

    /// Кегль моноширинной метки при крупном шрифте: растёт вдвое медленнее основного текста
    /// и не больше чем в полтора раза — так метка всегда мельче текста рядом.
    /// - Parameter bodyScale: во сколько раз система увеличила основной текст (1 — обычный размер).
    public static func monoLabelSize(base: CGFloat, bodyScale: CGFloat) -> CGFloat {
        min(base * (1 + (bodyScale - 1) * 0.5), base * monoLabelMaxGrowth)
    }
}

/// Как кегль подстраивается под крупный шрифт системы.
enum YKTextScaling {
    /// Как системный стиль (Dynamic Type).
    case relativeTo(Font.TextStyle)
    /// Медленно и с потолком — моноширинные метки и мелкие цифры.
    case monoLabel
}

/// Применяет стиль текста: шрифт, разрядку, высоту строки и капс. Кегль растёт с крупным шрифтом системы.
struct YKTextStyleModifier: ViewModifier {
    let style: YKTextStyle
    let weight: Int
    let baseSize: CGFloat
    let isMonoLabel: Bool
    @ScaledMetric private var scaledSize: CGFloat
    @ScaledMetric(relativeTo: .body) private var bodyScale: CGFloat = 1

    init(style: YKTextStyle, size: CGFloat? = nil, weight: Int? = nil, scaling: YKTextScaling) {
        self.style = style
        self.weight = weight ?? style.weight
        self.baseSize = size ?? style.size
        switch scaling {
        case .relativeTo(let textStyle):
            isMonoLabel = false
            _scaledSize = ScaledMetric(wrappedValue: baseSize, relativeTo: textStyle)
        case .monoLabel:
            isMonoLabel = true
            _scaledSize = ScaledMetric(wrappedValue: baseSize, relativeTo: .body)
        }
    }

    func body(content: Content) -> some View {
        let size = isMonoLabel ? YKTextMetrics.monoLabelSize(base: baseSize, bodyScale: bodyScale) : scaledSize
        content
            .font(.system(size: size, weight: YKTextMetrics.weight(weight), design: style.family == .mono ? .monospaced : .default))
            .tracking(YKTextMetrics.tracking(style, size: size))
            .lineSpacing(YKTextMetrics.lineSpacing(style, size: size))
            .textCase(style.uppercase ? .uppercase : nil)
    }
}

public extension View {
    /// Роль текста: `.ykText(.heading)`. `size` и `weight` — для плотных мест (строка списка 14, плашка 14);
    /// кегль всё равно растёт вместе с крупным шрифтом системы. Метка (`.label`) растёт медленно, как `ykMonoLabel`.
    func ykText(_ role: YKTextRole, size: CGFloat? = nil, weight: Int? = nil) -> some View {
        let scaling: YKTextScaling = role == .label ? .monoLabel : .relativeTo(role.dynamicTypeStyle)
        return modifier(YKTextStyleModifier(style: role.style, size: size, weight: weight, scaling: scaling))
    }

    /// Метка «Чертежа»: моноширинный капс с разрядкой, приглушённым цветом. Только для меток, не для текста.
    /// При крупном шрифте растёт медленнее текста и с потолком.
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
        return modifier(YKTextStyleModifier(style: style, scaling: .monoLabel))
            .foregroundStyle(color.color)
    }

    /// Моноширинные цифры. Без размера — роль «Число · 24». Мелкие (до 13) — счётчики, растут как метки.
    func ykMonoNum(size: CGFloat? = nil, weight: Int? = nil) -> some View {
        let isCounter = (size ?? YKTokens.Text.number.size) <= 13
        return modifier(YKTextStyleModifier(
            style: YKTokens.Text.number,
            size: size,
            weight: weight ?? (size == nil ? YKTokens.Text.number.weight : 400),
            scaling: isCounter ? .monoLabel : .relativeTo(.title)
        ))
    }
}
