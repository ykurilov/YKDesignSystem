import SwiftUI

/// Тень всплывающих слоёв (тост, окно, меню) — своя для каждой темы.
/// Слой без размытия с растяжением (тёмная тема) рисуется тонкой обводкой: SwiftUI-тень растягиваться не умеет.
struct YKShadowModifier: ViewModifier {
    let shadow: YKShadow
    let cornerRadius: CGFloat
    @Environment(\.colorScheme) private var colorScheme

    func body(content: Content) -> some View {
        let layers = colorScheme == .dark ? shadow.dark : shadow.light
        layers.reduce(AnyView(content)) { view, layer in
            if layer.blur == 0 && layer.spread > 0 {
                AnyView(view.overlay(
                    RoundedRectangle(cornerRadius: cornerRadius + layer.spread)
                        .strokeBorder(layer.color.color, lineWidth: layer.spread)
                        .padding(-layer.spread)
                        .allowsHitTesting(false)
                ))
            } else {
                AnyView(view.shadow(color: layer.color.color, radius: layer.blur / 2, x: layer.x, y: layer.y))
            }
        }
    }
}

public extension View {
    func ykPopShadow(cornerRadius: CGFloat = YKTokens.Radius.lg) -> some View {
        modifier(YKShadowModifier(shadow: YKTokens.Shadow.pop, cornerRadius: cornerRadius))
    }
}
