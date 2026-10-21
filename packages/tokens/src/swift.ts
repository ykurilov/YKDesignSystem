import { fileURLToPath } from "node:url";
import type { Tokens } from "./tokens.js";

/** Куда кладётся сгенерированный файл Swift-пакета YKDesign. */
export const SWIFT_TOKENS_PATH = fileURLToPath(
  new URL("../../../swift/YKDesign/Sources/YKDesign/Generated/Tokens.swift", import.meta.url),
);

/** Tokens.swift: цвета с автоматической сменой темы, радиусы, отступы, размеры шрифта. */
export function renderTokensSwift(tokens: Tokens): string {
  const colors = Object.entries(tokens.color.light).map(([name, light]) => {
    const dark = tokens.color.dark[name as keyof typeof tokens.color.dark];
    return `public static let ${name} = adaptive(light: ${hex(light)}, dark: ${hex(dark)})`;
  });
  const radii = Object.entries(tokens.radius).map(([name, px]) => constant(name, px));
  const spaces = Object.entries(tokens.space).map(([step, px]) => constant(`s${step}`, px));
  const fontSizes = Object.entries(tokens.text).map(([name, style]) => constant(name, style.size));

  return `// Сгенерировано @ykurilov/ds-tokens из packages/tokens/src/tokens.ts. Не править вручную.
import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

public enum YKTokens {
${namespace("Colors", "Цвета: светлая и тёмная тема, переключаются вместе с системой.", colors)}

${namespace("Radius", "Радиусы углов в точках: карточки — lg, кнопки и поля — md.", radii)}

${namespace("Space", "Отступы в точках, шаг 4: s1 = 4 … s10 = 40.", spaces)}

${namespace("FontSize", "Размеры шрифта в точках. label и number — моноширинные.", fontSizes)}
}

/// Цвет, который сам меняется при смене светлой и тёмной темы.
private func adaptive(light: UInt32, dark: UInt32) -> Color {
#if canImport(UIKit)
    return Color(UIColor { traits in
        traits.userInterfaceStyle == .dark ? platformColor(dark) : platformColor(light)
    })
#elseif canImport(AppKit)
    return Color(NSColor(name: nil) { appearance in
        appearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua ? platformColor(dark) : platformColor(light)
    })
#endif
}

#if canImport(UIKit)
private func platformColor(_ rgb: UInt32) -> UIColor {
    UIColor(red: channel(rgb, 16), green: channel(rgb, 8), blue: channel(rgb, 0), alpha: 1)
}
#elseif canImport(AppKit)
private func platformColor(_ rgb: UInt32) -> NSColor {
    NSColor(srgbRed: channel(rgb, 16), green: channel(rgb, 8), blue: channel(rgb, 0), alpha: 1)
}
#endif

private func channel(_ rgb: UInt32, _ shift: UInt32) -> CGFloat {
    CGFloat((rgb >> shift) & 0xFF) / 255
}
`;
}

function namespace(name: string, doc: string, members: string[]): string {
  return [`    /// ${doc}`, `    public enum ${name} {`, ...members.map((m) => `        ${m}`), "    }"].join("\n");
}

function constant(name: string, value: number): string {
  return `public static let ${name}: CGFloat = ${value}`;
}

function hex(value: string): string {
  return `0x${value.slice(1).toUpperCase()}`;
}
