import Foundation
import Testing
@testable import YKDesign

/// Геометрия сферы повторяет sketches/shared/sphere.js.
@Suite("Сфера из точек")
struct SphereGeometryTests {
    @Test("46 точек на единичной сфере, от полюса до полюса")
    func points() {
        let points = YKSphereGeometry.points
        #expect(points.count == 46)
        for p in points {
            #expect(abs((p.x * p.x + p.y * p.y + p.z * p.z).squareRoot() - 1) < 1e-9)
        }
        #expect(points.first!.y == 1)
        #expect(points.last!.y == -1)
    }

    @Test("шаг по долготе — золотой угол 2.39996")
    func goldenAngle() {
        let p = YKSphereGeometry.points[1]
        let longitude = atan2(p.z, p.x)
        #expect(abs(longitude - 2.39996) < 1e-9)
    }

    @Test("поворот: 1400 мс на радиан; при Reduce Motion — неподвижный кадр")
    func angle() {
        #expect(abs(YKSphereGeometry.angle(elapsed: 1.4, reduceMotion: false) - 1) < 1e-9)
        #expect(YKSphereGeometry.angle(elapsed: 1.4, reduceMotion: true) == 0)
        #expect(YKSphereGeometry.angle(elapsed: 99, reduceMotion: true) == 0)
    }

    @Test("проекция верхнего полюса с наклоном 0.45")
    func projectionOfPole() throws {
        let dots = YKSphereGeometry.dots(size: 96, angle: 0)
        #expect(dots.count == 46)
        // Полюс (0, 1, 0): y' = cos .45, z' = sin .45
        let depth = (sin(0.45) + 1) / 2
        let pole = dots.first { abs($0.center.y - (48 + cos(0.45) * 36)) < 1e-6 && abs($0.center.x - 48) < 1e-6 }
        let found = try #require(pole)
        #expect(abs(found.opacity - (0.25 + depth * 0.75)) < 1e-9)
        #expect(abs(found.radius - (2 + depth * 3.2)) < 1e-9)
    }

    @Test("точки рисуются от дальних к ближним, все внутри холста")
    func depthOrderAndBounds() {
        for angle in [0.0, 0.7, 2.1] {
            let dots = YKSphereGeometry.dots(size: 16, angle: angle)
            #expect(dots.map(\.opacity) == dots.map(\.opacity).sorted())
            for dot in dots {
                #expect(dot.opacity >= 0.25 && dot.opacity <= 1)
                #expect(dot.center.x - dot.radius >= 0 && dot.center.x + dot.radius <= 16)
                #expect(dot.center.y - dot.radius >= 0 && dot.center.y + dot.radius <= 16)
            }
        }
    }

    @Test("размер масштабирует картинку целиком")
    func scale() {
        let small = YKSphereGeometry.dots(size: 12, angle: 0.3)
        let big = YKSphereGeometry.dots(size: 96, angle: 0.3)
        for (s, b) in zip(small, big) {
            #expect(abs(b.center.x - s.center.x * 8) < 1e-9)
            #expect(abs(b.radius - s.radius * 8) < 1e-9)
        }
    }
}
