import SwiftUI

public extension Animation {
    /// Плавное торможение из переменных (`easing.out`) — для нажатий, переключателей, сегментов.
    static func ykOut(duration: TimeInterval = 0.25) -> Animation {
        let curve = YKTokens.Easing.out
        return .timingCurve(curve.x1, curve.y1, curve.x2, curve.y2, duration: duration)
    }
}
