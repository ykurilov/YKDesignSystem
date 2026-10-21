import SwiftUI
import YKDesign

/// Витрина YKDesign на iPhone. Аргументы запуска для снимков экрана:
/// `--section N` — открыть раздел N, `--present sheet|alert|dialog` — сразу открыть шторку или окно,
/// `--rtl` — письмо справа налево.
@main
struct YKShowcaseApp: App {
    init() {
        YKSystemDialogs.applyAppearance()
    }

    var body: some Scene {
        WindowGroup {
            YKShowcaseView(
                initialSection: Self.launchArgument("--section").flatMap(Int.init),
                presenting: Self.launchArgument("--present").flatMap(YKShowcaseView.Presentation.init(rawValue:))
            )
            // Проверка письма справа налево: переключатели, вкладки, строки должны отзеркалиться
            .environment(\.layoutDirection, Self.isRightToLeft ? .rightToLeft : .leftToRight)
        }
    }

    private static var isRightToLeft: Bool { ProcessInfo.processInfo.arguments.contains("--rtl") }

    private static func launchArgument(_ flag: String) -> String? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let index = arguments.firstIndex(of: flag), index + 1 < arguments.count else { return nil }
        return arguments[index + 1]
    }
}
