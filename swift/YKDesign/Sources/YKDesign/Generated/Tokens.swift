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
        public static let accentText = adaptive(light: 0xC9502A, dark: 0xF7A07E)
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
