import SwiftUI

/// Карточка: поверхность, тонкая рамка, угол 12, поля 16.
public struct YKCard<Content: View>: View {
    let spacing: CGFloat
    let content: Content

    public init(spacing: CGFloat = 10, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: spacing) { content }
            .padding(YKTokens.Space.s4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .ykSurface(cornerRadius: YKTokens.Radius.lg)
    }
}

/// Показатель: метка, крупное число с итогом и изменение за период.
public struct YKStat: View {
    let label: String
    let value: String
    let total: String?
    let delta: String?
    let deltaRole: YKColorRole

    public init(_ label: String, value: String, total: String? = nil, delta: String? = nil, deltaRole: YKColorRole = .success) {
        self.label = label
        self.value = value
        self.total = total
        self.delta = delta
        self.deltaRole = deltaRole
    }

    public var body: some View {
        YKCard {
            Text(label).ykMonoLabel()
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(value).ykMonoNum(size: 26, weight: 500).tracking(26 * -0.02)
                if let total {
                    Text(total).ykMonoNum(size: 12).foregroundStyle(YKColorRole.muted.color)
                }
            }
            .foregroundStyle(YKColorRole.text.color)
            if let delta {
                HStack(spacing: 4) {
                    YKIcon(deltaRole == .danger ? .trendDown : .trendUp, size: 13)
                    Text(delta).ykMonoNum(size: 11)
                }
                .foregroundStyle(deltaRole.color)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

extension View {
    /// Поверхность с рамкой — общая основа карточки и группы строк.
    func ykSurface(cornerRadius: CGFloat) -> some View {
        let shape = RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        return background(YKColorRole.surface.color, in: shape)
            .overlay { shape.strokeBorder(YKColorRole.border.color, lineWidth: 1) }
            .clipShape(shape)
    }
}
