import CoreGraphics
import Foundation

/// Геометрия сферы из точек — тот же расчёт, что в sketches/shared/sphere.js.
public enum YKSphereGeometry {
    public struct Point3: Sendable, Equatable {
        public let x: Double
        public let y: Double
        public let z: Double
    }

    /// Точка на холсте: центр и радиус в точках, прозрачность 0.25…1 (ближние ярче).
    public struct Dot: Sendable, Equatable {
        public let center: CGPoint
        public let radius: CGFloat
        public let opacity: Double
    }

    public static let pointCount = 46
    /// Наклон оси к зрителю, радианы.
    static let tilt = 0.45
    /// Сколько секунд на один радиан поворота.
    static let secondsPerRadian = 1.4
    static let goldenAngle = 2.39996

    /// Точки ровным слоем по сфере (спираль с шагом золотого угла), от верхнего полюса к нижнему.
    public static let points: [Point3] = (0..<pointCount).map { i in
        let y = 1 - Double(i) / Double(pointCount - 1) * 2
        let ringRadius = (1 - y * y).squareRoot()
        let longitude = Double(i) * goldenAngle
        return Point3(x: cos(longitude) * ringRadius, y: y, z: sin(longitude) * ringRadius)
    }

    /// Угол поворота через `elapsed` секунд. При Reduce Motion — всегда начальный кадр.
    public static func angle(elapsed: TimeInterval, reduceMotion: Bool) -> Double {
        reduceMotion ? 0 : elapsed / secondsPerRadian
    }

    /// Точки для холста размером `size`, от дальних к ближним — в этом порядке их и рисовать.
    public static func dots(size: CGFloat, angle: Double) -> [Dot] {
        let center = Double(size) / 2
        let sphereRadius = Double(size) * 0.375
        let dotUnit = Double(size) / 96

        return points
            .map { p -> Point3 in
                let x1 = p.x * cos(angle) + p.z * sin(angle)
                let z1 = -p.x * sin(angle) + p.z * cos(angle)
                return Point3(x: x1, y: p.y * cos(tilt) - z1 * sin(tilt), z: p.y * sin(tilt) + z1 * cos(tilt))
            }
            .sorted { $0.z < $1.z }
            .map { p in
                let depth = (p.z + 1) / 2
                return Dot(
                    center: CGPoint(x: center + p.x * sphereRadius, y: center + p.y * sphereRadius),
                    radius: dotUnit * (2 + depth * 3.2),
                    opacity: 0.25 + depth * 0.75
                )
            }
    }
}
