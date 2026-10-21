import SwiftUI
import YKDesign

/// Витрина YKDesign на iPhone. Аргумент запуска `--section N` открывает раздел N (для снимков экрана).
@main
struct YKShowcaseApp: App {
    var body: some Scene {
        WindowGroup {
            YKShowcaseView(initialSection: Self.sectionFromLaunchArguments())
        }
    }

    private static func sectionFromLaunchArguments() -> Int? {
        let arguments = ProcessInfo.processInfo.arguments
        guard let flag = arguments.firstIndex(of: "--section"), flag + 1 < arguments.count else { return nil }
        return Int(arguments[flag + 1])
    }
}
