import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// Системные окна (`.alert`, `.confirmationDialog`) и пункты `Menu`.
/// Их вид рисует система; в нашей власти только цвет кнопок — делаем его цветом текста вместо синего.
/// Опасное действие — `Button(role: .destructive)`, система покрасит его в красный.
public enum YKSystemDialogs {
    public static let tintRole: YKColorRole = .text

    #if canImport(UIKit)
    /// Один раз при запуске приложения: кнопки всех системных окон — цветом текста.
    /// Нужно потому, что окна живут вне дерева SwiftUI и не всегда видят `.tint`.
    @MainActor public static func applyAppearance() {
        UIView.appearance(whenContainedInInstancesOf: [UIAlertController.self]).tintColor = UIColor(tintRole.color)
    }
    #endif
}

public extension View {
    /// Цвет кнопок системных окон и меню внутри этого экрана.
    func ykSystemDialogs() -> some View {
        tint(YKSystemDialogs.tintRole.color)
    }
}
