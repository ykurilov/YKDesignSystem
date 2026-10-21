import PhosphorSwift
import SwiftUI

/// Имя значка Phosphor: `.caretRight`, `.magnifyingGlass`, …
public typealias YKIconName = Ph

/// Значок Phosphor. Начертание `regular`; `fill` — только активный пункт навигации и кнопка «Стоп».
/// Цвет берётся из `foregroundStyle`, по умолчанию — цвет текста рядом.
public struct YKIcon: View {
    public enum Weight: Sendable { case regular, fill }

    let name: YKIconName
    let size: CGFloat
    let weight: Weight

    public init(_ name: YKIconName, size: CGFloat = 16, weight: Weight = .regular) {
        self.name = name
        self.size = size
        self.weight = weight
    }

    /// Пустое поле внутри квадрата значка: рисунок Phosphor занимает примерно 24…232 из 256.
    /// Нужен, чтобы левый край рисунка встал по краю текста: `.padding(.leading, -YKIcon.sideBearing(for: 18))`.
    public static func sideBearing(for size: CGFloat) -> CGFloat {
        size * 24 / 256
    }

    public var body: some View {
        (weight == .fill ? name.fill : name.regular)
            .renderingMode(.template)
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}
