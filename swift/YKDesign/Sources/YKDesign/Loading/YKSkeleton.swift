import SwiftUI

/// Скелет загрузки: серые полосы с бегущим бликом. При «Уменьшении движения» блика нет.
public enum YKSkeletonAppearance {
    /// Один проход блика, секунды.
    public static let period: TimeInterval = 1.4

    public static func isShimmering(reduceMotion: Bool) -> Bool { !reduceMotion }

    /// Положение блика 0…1 через `elapsed` секунд.
    public static func phase(elapsed: TimeInterval, reduceMotion: Bool = false) -> Double {
        guard isShimmering(reduceMotion: reduceMotion) else { return 0 }
        return elapsed.truncatingRemainder(dividingBy: period) / period
    }
}

/// `YKSkeleton(lines: [0.6, 0.9, 0.75, 0.4])` — ширина каждой полосы долей от строки.
public struct YKSkeleton: View {
    let lines: [CGFloat]
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(lines: [CGFloat] = [0.6, 0.9, 0.75, 0.4]) {
        self.lines = lines
    }

    public var body: some View {
        TimelineView(.animation(paused: !YKSkeletonAppearance.isShimmering(reduceMotion: reduceMotion))) { timeline in
            let phase = YKSkeletonAppearance.phase(
                elapsed: timeline.date.timeIntervalSinceReferenceDate, reduceMotion: reduceMotion
            )
            VStack(alignment: .leading, spacing: 10) {
                ForEach(Array(lines.enumerated()), id: \.offset) { _, fraction in
                    // Доля от ширины своего места, а не экрана: иначе полоса вылезает из карточки
                    GeometryReader { proxy in
                        RoundedRectangle(cornerRadius: 4)
                            .fill(fill(phase: phase))
                            .frame(width: proxy.size.width * fraction)
                    }
                    .frame(height: 12)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .accessibilityElement()
        .accessibilityLabel(Text("Загрузка"))
    }

    private func fill(phase: Double) -> AnyShapeStyle {
        guard !reduceMotion else { return AnyShapeStyle(YKColorRole.surface2.color) }
        // Блик проходит слева направо: градиент вдвое шире полосы и сдвигается по фазе
        let start = UnitPoint(x: 1 - phase * 2, y: 0.5)
        let end = UnitPoint(x: 3 - phase * 2, y: 0.5)
        let gradient = Gradient(colors: [YKColorRole.surface2.color, YKColorRole.surface3.color, YKColorRole.surface2.color])
        return AnyShapeStyle(LinearGradient(gradient: gradient, startPoint: start, endPoint: end))
    }
}
