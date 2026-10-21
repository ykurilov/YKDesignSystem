import SwiftUI

/// Пустое состояние: пунктирная рамка, метка со счётчиком, заголовок, пояснение и действия.
public struct YKEmptyState<Actions: View>: View {
    let label: String?
    let title: String
    let message: String
    let actions: Actions

    public init(label: String? = nil, title: String, message: String, @ViewBuilder actions: () -> Actions) {
        self.label = label
        self.title = title
        self.message = message
        self.actions = actions()
    }

    public var body: some View {
        VStack(spacing: 10) {
            if let label { Text(label).ykMonoLabel() }
            Text(title).ykText(.heading).foregroundStyle(YKColorRole.text.color)
            Text(message)
                .font(.system(size: 14))
                .lineSpacing(14 * 0.3)
                .foregroundStyle(YKColorRole.muted.color)
                .frame(maxWidth: 320)
            HStack(spacing: YKTokens.Space.s3) { actions }
                .padding(.top, 6)
        }
        .multilineTextAlignment(.center)
        .padding(36)
        .frame(maxWidth: .infinity)
        .overlay {
            RoundedRectangle(cornerRadius: YKTokens.Radius.xl, style: .continuous)
                .strokeBorder(YKColorRole.borderStrong.color, style: StrokeStyle(lineWidth: 1, dash: [4, 3]))
        }
    }
}

public extension YKEmptyState where Actions == EmptyView {
    init(label: String? = nil, title: String, message: String) {
        self.init(label: label, title: title, message: message) { EmptyView() }
    }
}
