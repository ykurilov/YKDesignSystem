import SwiftUI

/// Прогресс шагами, а не сплошной полосой.
public struct YKStepsModel: Equatable, Sendable {
    public let total: Int
    public let done: Int

    public init(total: Int, done: Int) {
        self.total = max(0, total)
        self.done = min(max(0, done), self.total)
    }

    /// Сделанные шаги слева: `true` — шаг пройден.
    public var segments: [Bool] { (0..<total).map { $0 < done } }

    /// Пока агент работает, пройденные шаги — акцентом; в покое — цветом текста.
    public static func doneRole(isLive: Bool) -> YKColorRole { isLive ? .accent : .text }
}

/// `YKSteps(total: 5, done: 3, isLive: true)`. Без ширины растягивается на всю строку.
public struct YKSteps: View {
    let model: YKStepsModel
    let isLive: Bool
    let width: CGFloat?

    public init(total: Int, done: Int, isLive: Bool = false, width: CGFloat? = 140) {
        self.model = YKStepsModel(total: total, done: done)
        self.isLive = isLive
        self.width = width
    }

    public var body: some View {
        HStack(spacing: 3) {
            ForEach(Array(model.segments.enumerated()), id: \.offset) { _, isDone in
                RoundedRectangle(cornerRadius: 2)
                    .fill((isDone ? YKStepsModel.doneRole(isLive: isLive) : .surface2).color)
                    .frame(height: 5)
            }
        }
        .frame(width: width)
        .frame(maxWidth: width == nil ? .infinity : nil)
        .accessibilityElement()
        .accessibilityLabel(Text("Шаг \(model.done) из \(model.total)"))
    }
}
