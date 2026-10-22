import { fileURLToPath } from "node:url";
import type { ShadowLayer, TextStyle, Tokens } from "./tokens.js";

/** Куда кладётся сгенерированный файл Swift-пакета YKDesign. */
export const SWIFT_TOKENS_PATH = fileURLToPath(
  new URL("../../../swift/YKDesign/Sources/YKDesign/Generated/Tokens.swift", import.meta.url),
);

/** JSON-образец переменных: по нему тесты Swift сверяют цвета с источником. */
export const SWIFT_FIXTURE_PATH = fileURLToPath(
  new URL("../../../swift/YKDesign/Tests/YKDesignTests/Fixtures/tokens.json", import.meta.url),
);

export function renderTokensFixture(tokens: Tokens): string {
  return JSON.stringify(tokens, null, 2) + "\n";
}

/** Tokens.swift: цвета с автоматической сменой темы, радиусы, отступы, размеры шрифта. */
export function renderTokensSwift(tokens: Tokens): string {
  const colors = Object.entries(tokens.color.light).map(([name, light]) => {
    const dark = tokens.color.dark[name as keyof typeof tokens.color.dark];
    return `public static let ${name} = adaptive(light: ${hex(light)}, dark: ${hex(dark)})`;
  });
  const radii = Object.entries(tokens.radius).map(([name, px]) => constant(name, px));
  const spaces = Object.entries(tokens.space).map(([step, px]) => constant(`s${step}`, px));
  const studio = Object.entries(tokens.studio).map(([name, value]) => constant(name, value));
  const fontSizes = Object.entries(tokens.text).map(([name, style]) => constant(name, style.size));
  const textStyles = Object.entries(tokens.text).map(([name, style]) => `public static let ${name} = ${textStyle(style)}`);
  const shadows = Object.entries(tokens.shadow).map(
    ([name, themes]) => `public static let ${name} = YKShadow(light: ${shadowLayers(themes.light)}, dark: ${shadowLayers(themes.dark)})`,
  );
  const easings = Object.entries(tokens.easing).map(([name, curve]) => `public static let ${name} = ${cubicBezier(curve)}`);

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

${namespace("Studio", "Компоновка Студия: размеры в точках; bodyLineHeight — множитель.", studio)}

${namespace("FontSize", "Размеры шрифта в точках. label и number — моноширинные.", fontSizes)}

${namespace("Text", "Роли шрифта. Разрядка — в долях кегля (em), высота строки — множитель кегля.", textStyles)}

${namespace("Shadow", "Тени: слои для светлой и тёмной темы.", shadows)}

${namespace("Easing", "Кривые плавности анимаций.", easings)}
}

/// Стиль текста: системный или моноширинный шрифт, кегль, вес (100–900), разрядка в em.
public struct YKTextStyle: Sendable, Equatable {
    public enum Family: Sendable { case sans, mono }
    public let family: Family
    public let size: CGFloat
    public let weight: Int
    public let letterSpacing: CGFloat
    public let lineHeight: CGFloat?
    public let uppercase: Bool
}

/// Цвет каналами 0–255 и прозрачностью 0–1.
public struct YKRGBA: Sendable, Equatable {
    public let red: Int
    public let green: Int
    public let blue: Int
    public let alpha: Double
}

/// Один слой тени: смещение, размытие и растяжение в точках.
public struct YKShadowLayer: Sendable, Equatable {
    public let x: CGFloat
    public let y: CGFloat
    public let blur: CGFloat
    public let spread: CGFloat
    public let color: YKRGBA
}

/// Тень для двух тем.
public struct YKShadow: Sendable, Equatable {
    public let light: [YKShadowLayer]
    public let dark: [YKShadowLayer]
}

/// Кривая плавности как в CSS cubic-bezier().
public struct YKCubicBezier: Sendable, Equatable {
    public let x1: Double
    public let y1: Double
    public let x2: Double
    public let y2: Double
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

function textStyle(style: TextStyle): string {
  const lineHeight = style.lineHeight ?? "nil";
  return `YKTextStyle(family: .${style.family}, size: ${style.size}, weight: ${style.weight}, letterSpacing: ${style.letterSpacing}, lineHeight: ${lineHeight}, uppercase: ${style.uppercase ?? false})`;
}

function shadowLayers(layers: readonly ShadowLayer[]): string {
  const items = layers.map(
    ({ x, y, blur, spread, color }) => `YKShadowLayer(x: ${x}, y: ${y}, blur: ${blur}, spread: ${spread}, color: ${rgba(color)})`,
  );
  return `[${items.join(", ")}]`;
}

/** "rgba(0,0,0,.12)" или "#2A2A2A" → YKRGBA(...) */
function rgba(color: string): string {
  const hexMatch = /^#([0-9a-f]{6})$/i.exec(color);
  const rgbaMatch = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i.exec(color);
  let channels: number[];
  if (hexMatch) {
    const rgb = parseInt(hexMatch[1], 16);
    channels = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff, 1];
  } else if (rgbaMatch) {
    channels = rgbaMatch.slice(1).map(Number);
  } else {
    throw new Error(`Цвет тени не разобран: ${color}`);
  }
  const [red, green, blue, alpha] = channels;
  return `YKRGBA(red: ${red}, green: ${green}, blue: ${blue}, alpha: ${alpha})`;
}

/** "cubic-bezier(.22, 1, .36, 1)" → YKCubicBezier(...) */
function cubicBezier(css: string): string {
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(css);
  if (!match) throw new Error(`Кривая не разобрана: ${css}`);
  const [x1, y1, x2, y2] = match[1].split(",").map((v) => Number(v.trim()));
  return `YKCubicBezier(x1: ${x1}, y1: ${y1}, x2: ${x2}, y2: ${y2})`;
}

function hex(value: string): string {
  return `0x${value.slice(1).toUpperCase()}`;
}
