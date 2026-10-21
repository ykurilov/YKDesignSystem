import SwiftUI

/// Вид плашки: обычная, ошибка, агент работает.
public enum YKBannerKind: CaseIterable, Sendable {
    case info, danger, agent

    public enum Mark: Equatable, Sendable { case none, warning, sphere }

    public var mark: Mark {
        switch self {
        case .info: .none
        case .danger: .warning
        case .agent: .sphere
        }
    }

    public var backgroundRole: YKColorRole { self == .danger ? .dangerSoft : .surface }
}

/// Плашка в потоке экрана: жирное начало и пояснение одной фразой.
public struct YKBanner: View {
    let kind: YKBannerKind
    let title: String
    let message: String

    public init(_ title: String, message: String, kind: YKBannerKind = .info) {
        self.kind = kind
        self.title = title
        self.message = message
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: YKTokens.Radius.lg, style: .continuous)
        HStack(alignment: .top, spacing: YKTokens.Space.s3) {
            switch kind.mark {
            case .warning:
                YKIcon(.warningCircle, size: 20).foregroundStyle(YKColorRole.danger.color)
            case .sphere:
                YKSphere(size: 18).frame(width: 20, height: 20)
            case .none:
                EmptyView()
            }
            Text("\(Text(title).fontWeight(.semibold)) \(message)")
                .font(.system(size: 14))
                .lineSpacing(14 * 0.25)
                .foregroundStyle(YKColorRole.text.color)
                .frame(maxWidth: .infinity, alignment: .leading)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, YKTokens.Space.s3)
        .background(kind.backgroundRole.color, in: shape)
        .overlay {
            shape.strokeBorder(kind == .danger ? YKColorRole.danger.color.opacity(0.35) : YKColorRole.border.color, lineWidth: 1)
        }
        .accessibilityElement(children: .combine)
    }
}

/// Уведомление поверх экрана: чернильная плашка и необязательное действие («Вернуть»).
public struct YKToast: View {
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?

    public init(_ message: String, actionTitle: String? = nil, action: (() -> Void)? = nil) {
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }

    public var body: some View {
        HStack(spacing: YKTokens.Space.s3) {
            Text(message)
                .font(.system(size: 14))
                .frame(maxWidth: .infinity, alignment: .leading)
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .buttonStyle(YKToastActionStyle())
            }
        }
        .foregroundStyle(YKColorRole.onInk.color)
        .padding(.leading, 14)
        .padding([.vertical, .trailing], 10)
        .frame(minHeight: 50)
        .background(YKColorRole.ink.color, in: RoundedRectangle(cornerRadius: YKTokens.Radius.lg, style: .continuous))
        .ykPopShadow()
        .accessibilityElement(children: .contain)
    }
}

private struct YKToastActionStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        let shape = RoundedRectangle(cornerRadius: 8, style: .continuous)
        configuration.label
            .font(.system(size: 13, weight: .semibold))
            .padding(.horizontal, 10)
            .frame(minHeight: 30)
            .overlay { shape.strokeBorder(YKColorRole.onInk.color.opacity(0.3), lineWidth: 1) }
            .contentShape(shape)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.ykOut(duration: 0.2), value: configuration.isPressed)
    }
}
