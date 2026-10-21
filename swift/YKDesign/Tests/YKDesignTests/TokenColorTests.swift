import Foundation
import SwiftUI
import Testing
@testable import YKDesign
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

/// Цвета Swift сверяются с JSON-образцом, который генератор пишет прямо из packages/tokens/src/tokens.ts.
@Suite("Цвета совпадают с источником")
struct TokenColorTests {
    struct Fixture: Decodable {
        struct ColorThemes: Decodable {
            let light: [String: String]
            let dark: [String: String]
        }
        let color: ColorThemes
    }

    static let fixture: Fixture = {
        let url = Bundle.module.url(forResource: "tokens", withExtension: "json", subdirectory: "Fixtures")!
        return try! JSONDecoder().decode(Fixture.self, from: Data(contentsOf: url))
    }()

    @Test("у каждого цвета источника есть роль, и лишних ролей нет")
    func everyTokenHasRole() {
        let sourceNames = Set(Self.fixture.color.light.keys)
        let roleNames = Set(YKColorRole.tokenRoles.map(\.rawValue))
        #expect(roleNames == sourceNames)
    }

    @Test("светлая тема", arguments: YKColorRole.tokenRoles)
    func lightTheme(role: YKColorRole) throws {
        let expected = try #require(Self.fixture.color.light[role.rawValue])
        #expect(hex(of: role.color, dark: false) == expected)
    }

    @Test("тёмная тема", arguments: YKColorRole.tokenRoles)
    func darkTheme(role: YKColorRole) throws {
        let expected = try #require(Self.fixture.color.dark[role.rawValue])
        #expect(hex(of: role.color, dark: true) == expected)
    }

    @Test("цвет тени из переменных переводится без потерь")
    func shadowColor() {
        let ring = YKTokens.Shadow.pop.dark.last!.color
        #expect(hex(of: ring.color, dark: true) == "#2A2A2A")
    }
}

/// Цвет, вычисленный для светлой или тёмной темы, как «#RRGGBB».
func hex(of color: Color, dark: Bool) -> String {
    #if canImport(UIKit)
    let traits = UITraitCollection(userInterfaceStyle: dark ? .dark : .light)
    let resolved = UIColor(color).resolvedColor(with: traits)
    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
    resolved.getRed(&r, green: &g, blue: &b, alpha: &a)
    #else
    var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0
    NSAppearance(named: dark ? .darkAqua : .aqua)!.performAsCurrentDrawingAppearance {
        let resolved = NSColor(color).usingColorSpace(.sRGB)!
        r = resolved.redComponent; g = resolved.greenComponent; b = resolved.blueComponent
    }
    #endif
    let channel = { (value: CGFloat) in String(format: "%02X", Int((value * 255).rounded())) }
    return "#" + channel(r) + channel(g) + channel(b)
}
