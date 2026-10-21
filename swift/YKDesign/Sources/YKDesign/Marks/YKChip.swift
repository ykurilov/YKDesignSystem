import SwiftUI

/// Вид метки статуса.
public enum YKChipKind: CaseIterable, Sendable {
    /// Черновик и прочее спокойное.
    case neutral
    /// В работе — со сферой.
    case live
    case success
    case danger
    /// Залитая чернилами — «Новое».
    case solid

    public struct Palette: Equatable, Sendable {
        public let background: YKColorRole
        public let foreground: YKColorRole
        public let border: YKColorRole?
    }

    public enum LeadingMark: Equatable, Sendable { case none, sphere, check }

    public var palette: Palette {
        switch self {
        case .neutral: Palette(background: .clear, foreground: .muted, border: .border)
        case .live: Palette(background: .accentSoft, foreground: .accentText, border: nil)
        case .success: Palette(background: .successSoft, foreground: .success, border: nil)
        case .danger: Palette(background: .dangerSoft, foreground: .danger, border: nil)
        case .solid: Palette(background: .ink, foreground: .onInk, border: nil)
        }
    }

    public var leadingMark: LeadingMark {
        switch self {
        case .live: .sphere
        case .success: .check
        default: .none
        }
    }
}

/// Метка статуса: моноширинный капс в плашке. `YKChip("В работе", kind: .live)`.
public struct YKChip: View {
    let title: String
    let kind: YKChipKind

    public init(_ title: String, kind: YKChipKind = .neutral) {
        self.title = title
        self.kind = kind
    }

    public var body: some View {
        let palette = kind.palette
        let shape = RoundedRectangle(cornerRadius: YKTokens.Radius.sm, style: .continuous)
        HStack(spacing: 6) {
            switch kind.leadingMark {
            case .sphere: YKSphere(size: 12, color: YKColorRole.accent.color)
            case .check: YKIcon(.check, size: 12)
            case .none: EmptyView()
            }
            Text(title)
                .ykMonoLabel(size: 10.5, tracking: 0.05, color: palette.foreground)
        }
        .foregroundStyle(palette.foreground.color)
        .lineLimit(1)
        .padding(.horizontal, 8)
        .padding(.vertical, 3)
        .background(palette.background.color, in: shape)
        .overlay {
            if let border = palette.border { shape.strokeBorder(border.color, lineWidth: 1) }
        }
        .fixedSize()
    }
}
