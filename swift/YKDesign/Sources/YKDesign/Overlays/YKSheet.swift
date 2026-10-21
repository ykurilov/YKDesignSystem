import SwiftUI

/// Шторка снизу: фон поверхности, углы 22, своя ручка 36×5 вместо системной.
public enum YKSheetMetrics {
    public static let cornerRadius: CGFloat = 22
    public static let gripSize = CGSize(width: 36, height: 5)
    public static let backgroundRole: YKColorRole = .surface
    public static let gripRole: YKColorRole = .surface3
    /// Кнопки внутри шторки (в том числе на панели инструментов) — цветом текста, не системным синим.
    public static let tintRole: YKColorRole = .text
}

/// Содержимое шторки: ручка сверху и поля как в наброске. Можно показать и без `.sheet` — в витрине.
public struct YKSheetContent<Content: View>: View {
    let title: String?
    let content: Content

    public init(title: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Capsule()
                .fill(YKSheetMetrics.gripRole.color)
                .frame(width: YKSheetMetrics.gripSize.width, height: YKSheetMetrics.gripSize.height)
                .frame(maxWidth: .infinity)
                .accessibilityHidden(true)
            if let title {
                Text(title).ykText(.heading).foregroundStyle(YKColorRole.text.color)
            }
            content
        }
        .padding(.top, 8)
        .padding(.horizontal, 18)
        .padding(.bottom, 22)
        .frame(maxWidth: .infinity, alignment: .topLeading)
    }
}

public extension View {
    /// Шторка в нашем виде: `.ykSheet(isPresented: $show, title: "Новый проект") { … }`.
    func ykSheet<Content: View>(
        isPresented: Binding<Bool>,
        title: String? = nil,
        detents: Set<PresentationDetent> = [.medium, .large],
        @ViewBuilder content: @escaping () -> Content
    ) -> some View {
        sheet(isPresented: isPresented) {
            YKSheetContent(title: title, content: content)
                .presentationDetents(detents)
                .presentationDragIndicator(.hidden)
                .presentationCornerRadius(YKSheetMetrics.cornerRadius)
                .presentationBackground(YKSheetMetrics.backgroundRole.color)
                .tint(YKSheetMetrics.tintRole.color)
        }
    }
}
