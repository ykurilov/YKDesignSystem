import SwiftUI

/// Цвет по смыслу. Компоненты описывают своё оформление ролями, а не готовыми `Color`:
/// так оформление можно проверить тестом, а цвет всегда берётся из переменных.
public enum YKColorRole: String, CaseIterable, Sendable {
    case bg, surface, surface2, surface3, sidebar
    case text, muted, faint, border, borderStrong
    case ink, onInk
    case accent, accentText, accentSoft
    case danger, dangerSoft, onDanger
    case success, successSoft
    /// Белый в обеих темах — галочка флажка, кружок переключателя.
    case white
    case clear

    /// Роли, у которых есть переменная в packages/tokens.
    public static let tokenRoles: [YKColorRole] = allCases.filter { $0 != .white && $0 != .clear }

    public var color: Color {
        switch self {
        case .bg: YKTokens.Colors.bg
        case .surface: YKTokens.Colors.surface
        case .surface2: YKTokens.Colors.surface2
        case .surface3: YKTokens.Colors.surface3
        case .sidebar: YKTokens.Colors.sidebar
        case .text: YKTokens.Colors.text
        case .muted: YKTokens.Colors.muted
        case .faint: YKTokens.Colors.faint
        case .border: YKTokens.Colors.border
        case .borderStrong: YKTokens.Colors.borderStrong
        case .ink: YKTokens.Colors.ink
        case .onInk: YKTokens.Colors.onInk
        case .accent: YKTokens.Colors.accent
        case .accentText: YKTokens.Colors.accentText
        case .accentSoft: YKTokens.Colors.accentSoft
        case .danger: YKTokens.Colors.danger
        case .dangerSoft: YKTokens.Colors.dangerSoft
        case .onDanger: YKTokens.Colors.onDanger
        case .success: YKTokens.Colors.success
        case .successSoft: YKTokens.Colors.successSoft
        case .white: .white
        case .clear: .clear
        }
    }
}

public extension YKRGBA {
    var color: Color {
        Color(.sRGB, red: Double(red) / 255, green: Double(green) / 255, blue: Double(blue) / 255, opacity: alpha)
    }
}
