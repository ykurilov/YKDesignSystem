// Сгенерировано @ykurilov/ds-tokens из packages/tokens/src/tokens.ts. Не править вручную.
import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

public enum YKTokens {
    /// Цвета: светлая и тёмная тема, переключаются вместе с системой.
    public enum Colors {
        public static let bg = adaptive(light: 0xFFFFFF, dark: 0x0F0F0F)
        public static let surface = adaptive(light: 0xFFFFFF, dark: 0x161616)
        public static let surface2 = adaptive(light: 0xF4F4F3, dark: 0x222222)
        public static let surface3 = adaptive(light: 0xEBEBE9, dark: 0x2C2C2C)
        public static let sidebar = adaptive(light: 0xFAFAF9, dark: 0x121212)
        public static let text = adaptive(light: 0x141414, dark: 0xF2F2F0)
        public static let muted = adaptive(light: 0x6E6E6B, dark: 0x9B9B97)
        public static let faint = adaptive(light: 0xA3A3A0, dark: 0x5E5E5B)
        public static let border = adaptive(light: 0xE9E9E6, dark: 0x262626)
        public static let borderStrong = adaptive(light: 0xD6D6D2, dark: 0x3A3A3A)
        public static let ink = adaptive(light: 0x141414, dark: 0xF2F2F0)
        public static let onInk = adaptive(light: 0xFFFFFF, dark: 0x0F0F0F)
        public static let accent = adaptive(light: 0xEE6A3C, dark: 0xF27D52)
        public static let accentText = adaptive(light: 0xBE4824, dark: 0xF7A07E)
        public static let accentSoft = adaptive(light: 0xFCEBE3, dark: 0x3A2219)
        public static let danger = adaptive(light: 0xC8283A, dark: 0xFF5C6C)
        public static let dangerSoft = adaptive(light: 0xFBE7E9, dark: 0x3D1A1E)
        public static let success = adaptive(light: 0x1E8A55, dark: 0x4CC88A)
        public static let successSoft = adaptive(light: 0xE3F4EA, dark: 0x16301F)
    }

    /// Радиусы углов в точках: карточки — lg, кнопки и поля — md.
    public enum Radius {
        public static let sm: CGFloat = 6
        public static let md: CGFloat = 10
        public static let lg: CGFloat = 12
        public static let xl: CGFloat = 16
    }

    /// Отступы в точках, шаг 4: s1 = 4 … s10 = 40.
    public enum Space {
        public static let s1: CGFloat = 4
        public static let s2: CGFloat = 8
        public static let s3: CGFloat = 12
        public static let s4: CGFloat = 16
        public static let s5: CGFloat = 20
        public static let s6: CGFloat = 24
        public static let s8: CGFloat = 32
        public static let s10: CGFloat = 40
    }

    /// Размеры шрифта в точках. label и number — моноширинные.
    public enum FontSize {
        public static let display: CGFloat = 30
        public static let title: CGFloat = 22
        public static let heading: CGFloat = 17
        public static let body: CGFloat = 15
        public static let small: CGFloat = 13
        public static let label: CGFloat = 11
        public static let number: CGFloat = 24
    }

    /// Роли шрифта. Разрядка — в долях кегля (em), высота строки — множитель кегля.
    public enum Text {
        public static let display = YKTextStyle(family: .sans, size: 30, weight: 600, letterSpacing: -0.025, lineHeight: 1.1, uppercase: false)
        public static let title = YKTextStyle(family: .sans, size: 22, weight: 600, letterSpacing: -0.02, lineHeight: nil, uppercase: false)
        public static let heading = YKTextStyle(family: .sans, size: 17, weight: 600, letterSpacing: -0.01, lineHeight: nil, uppercase: false)
        public static let body = YKTextStyle(family: .sans, size: 15, weight: 400, letterSpacing: 0, lineHeight: 1.5, uppercase: false)
        public static let small = YKTextStyle(family: .sans, size: 13, weight: 400, letterSpacing: 0, lineHeight: nil, uppercase: false)
        public static let label = YKTextStyle(family: .mono, size: 11, weight: 400, letterSpacing: 0.08, lineHeight: nil, uppercase: true)
        public static let number = YKTextStyle(family: .mono, size: 24, weight: 500, letterSpacing: -0.02, lineHeight: nil, uppercase: false)
    }

    /// Тени: слои для светлой и тёмной темы.
    public enum Shadow {
        public static let pop = YKShadow(light: [YKShadowLayer(x: 0, y: 12, blur: 32, spread: 0, color: YKRGBA(red: 0, green: 0, blue: 0, alpha: 0.12)), YKShadowLayer(x: 0, y: 2, blur: 6, spread: 0, color: YKRGBA(red: 0, green: 0, blue: 0, alpha: 0.06))], dark: [YKShadowLayer(x: 0, y: 12, blur: 32, spread: 0, color: YKRGBA(red: 0, green: 0, blue: 0, alpha: 0.5)), YKShadowLayer(x: 0, y: 0, blur: 0, spread: 1, color: YKRGBA(red: 42, green: 42, blue: 42, alpha: 1))])
    }

    /// Кривые плавности анимаций.
    public enum Easing {
        public static let out = YKCubicBezier(x1: 0.22, y1: 1, x2: 0.36, y2: 1)
    }
}

/// Стиль текста: системный или моноширинный шрифт, кегль, вес (100–900), разрядка в em.
public struct YKTextStyle: Sendable, Equatable {
    public enum Family: Sendable { case sans, mono }
    public let family: Family
    public let size: CGFloat
    public let weight: Int
    public let letterSpacing: CGFloat
    public let lineHeight: CGFloat?
    public let uppercase: Bool
}

/// Цвет каналами 0–255 и прозрачностью 0–1.
public struct YKRGBA: Sendable, Equatable {
    public let red: Int
    public let green: Int
    public let blue: Int
    public let alpha: Double
}

/// Один слой тени: смещение, размытие и растяжение в точках.
public struct YKShadowLayer: Sendable, Equatable {
    public let x: CGFloat
    public let y: CGFloat
    public let blur: CGFloat
    public let spread: CGFloat
    public let color: YKRGBA
}

/// Тень для двух тем.
public struct YKShadow: Sendable, Equatable {
    public let light: [YKShadowLayer]
    public let dark: [YKShadowLayer]
}

/// Кривая плавности как в CSS cubic-bezier().
public struct YKCubicBezier: Sendable, Equatable {
    public let x1: Double
    public let y1: Double
    public let x2: Double
    public let y2: Double
}

/// Цвет, который сам меняется при смене светлой и тёмной темы.
private func adaptive(light: UInt32, dark: UInt32) -> Color {
#if canImport(UIKit)
    return Color(UIColor { traits in
        traits.userInterfaceStyle == .dark ? platformColor(dark) : platformColor(light)
    })
#elseif canImport(AppKit)
    return Color(NSColor(name: nil) { appearance in
        appearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? platformColor(dark) : platformColor(light)
    })
#endif
}

#if canImport(UIKit)
private func platformColor(_ rgb: UInt32) -> UIColor {
    UIColor(red: channel(rgb, 16), green: channel(rgb, 8), blue: channel(rgb, 0), alpha: 1)
}
#elseif canImport(AppKit)
private func platformColor(_ rgb: UInt32) -> NSColor {
    NSColor(srgbRed: channel(rgb, 16), green: channel(rgb, 8), blue: channel(rgb, 0), alpha: 1)
}
#endif

private func channel(_ rgb: UInt32, _ shift: UInt32) -> CGFloat {
    CGFloat((rgb >> shift) & 0xFF) / 255
}
