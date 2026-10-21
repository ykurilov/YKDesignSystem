import SwiftUI

/// Аватар: буквы имени, точка «есть новое» или агент со сферой.
public struct YKAvatar: View {
    public enum Size: Sendable {
        case sm, md
        public var diameter: CGFloat { self == .sm ? 24 : 32 }
        public var fontSize: CGFloat { self == .sm ? 10 : 12 }
    }

    public enum Content: Sendable {
        case initials(String)
        case agent
    }

    let content: Content
    let size: Size
    let hasNewDot: Bool

    public init(name: String, size: Size = .md, hasNewDot: Bool = false) {
        self.content = .initials(Self.initials(from: name))
        self.size = size
        self.hasNewDot = hasNewDot
    }

    /// Аватар агента: чернильный круг со сферой.
    public static func agent(size: Size = .md) -> YKAvatar {
        YKAvatar(content: .agent, size: size)
    }

    init(content: Content, size: Size, hasNewDot: Bool = false) {
        self.content = content
        self.size = size
        self.hasNewDot = hasNewDot
    }

    /// Первые буквы двух первых слов; у одного слова — две первые буквы. Всегда прописные.
    nonisolated public static func initials(from name: String) -> String {
        let words = name.split(whereSeparator: \.isWhitespace)
        let letters: String
        switch words.count {
        case 0: letters = ""
        case 1: letters = String(words[0].prefix(2))
        default: letters = String(words[0].prefix(1)) + String(words[1].prefix(1))
        }
        return letters.uppercased()
    }

    public var body: some View {
        ZStack {
            switch content {
            case .initials(let letters):
                Circle().fill(YKColorRole.surface2.color)
                Text(letters)
                    .font(.system(size: size.fontSize, weight: .semibold))
                    .foregroundStyle(YKColorRole.text.color)
            case .agent:
                Circle().fill(YKColorRole.ink.color)
                YKSphere(size: size.diameter * 18 / 32)
            }
        }
        .frame(width: size.diameter, height: size.diameter)
        .overlay(alignment: .topTrailing) {
            if hasNewDot {
                YKNewDot(ringColor: .bg).offset(x: 1, y: -1)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(accessibilityText))
    }

    private var accessibilityText: String {
        switch content {
        case .initials(let letters): hasNewDot ? "\(letters), есть новое" : letters
        case .agent: "Агент"
        }
    }
}
