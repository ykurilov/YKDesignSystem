import SwiftUI

/// Сфера из точек — «агент работает». Одна и та же в крупном и мелком размере.
/// При включённом «Уменьшении движения» стоит на месте.
public struct YKSphere: View {
    let size: CGFloat
    let color: Color?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameter color: по умолчанию — акцент.
    public init(size: CGFloat = 16, color: Color? = nil) {
        self.size = size
        self.color = color
    }

    public var body: some View {
        TimelineView(.animation(paused: reduceMotion)) { timeline in
            let angle = YKSphereGeometry.angle(
                elapsed: timeline.date.timeIntervalSinceReferenceDate,
                reduceMotion: reduceMotion
            )
            Canvas { context, canvasSize in
                let shading = GraphicsContext.Shading.color(color ?? YKColorRole.accent.color)
                for dot in YKSphereGeometry.dots(size: canvasSize.width, angle: angle) {
                    var dotContext = context
                    dotContext.opacity = dot.opacity
                    let rect = CGRect(
                        x: dot.center.x - dot.radius, y: dot.center.y - dot.radius,
                        width: dot.radius * 2, height: dot.radius * 2
                    )
                    dotContext.fill(Path(ellipseIn: rect), with: shading)
                }
            }
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}

/// Точка «есть новое, не просмотрено». Не анимируется.
public struct YKNewDot: View {
    let ringColor: YKColorRole?

    /// - Parameter ringColor: обводка цветом фона, когда точка лежит поверх аватара.
    public init(ringColor: YKColorRole? = nil) {
        self.ringColor = ringColor
    }

    public var body: some View {
        Circle()
            .fill(YKColorRole.accent.color)
            .frame(width: 7, height: 7)
            .background {
                if let ringColor {
                    Circle().fill(ringColor.color).padding(-2)
                }
            }
            .accessibilityLabel(Text("Новое"))
    }
}
