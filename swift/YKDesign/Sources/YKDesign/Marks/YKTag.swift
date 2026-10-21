import SwiftUI

/// Тег-капсула. С `onRemove` — крестик, `YKTag.add` — «+ тег».
public struct YKTag: View {
    let title: String
    let leadingIcon: YKIconName?
    let onRemove: (() -> Void)?

    public init(_ title: String, onRemove: (() -> Void)? = nil) {
        self.title = title
        self.leadingIcon = nil
        self.onRemove = onRemove
    }

    init(title: String, leadingIcon: YKIconName?) {
        self.title = title
        self.leadingIcon = leadingIcon
        self.onRemove = nil
    }

    /// Тег-кнопка «добавить».
    public static func add(_ title: String = "тег") -> YKTag {
        YKTag(title: title, leadingIcon: .plus)
    }

    public var body: some View {
        HStack(spacing: 6) {
            if let leadingIcon { YKIcon(leadingIcon, size: 12) }
            Text(title)
            if let onRemove {
                Button(action: onRemove) {
                    YKIcon(.x, size: 12).foregroundStyle(YKColorRole.faint.color)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text("Убрать «\(title)»"))
            }
        }
        .ykText(.small)
        .foregroundStyle(YKColorRole.text.color)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(YKColorRole.surface2.color, in: Capsule())
        .fixedSize()
    }
}
