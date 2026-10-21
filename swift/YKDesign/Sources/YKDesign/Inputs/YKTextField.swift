import SwiftUI

/// Оформление поля по состоянию: выбранное — оранжевая рамка, с ошибкой — красная.
public struct YKFieldState: Equatable, Sendable {
    public let isFocused: Bool
    public let hasError: Bool
    public let isEnabled: Bool

    public init(isFocused: Bool, hasError: Bool, isEnabled: Bool) {
        self.isFocused = isFocused
        self.hasError = hasError
        self.isEnabled = isEnabled
    }

    public static let idle = YKFieldState(isFocused: false, hasError: false, isEnabled: true)
    public static let focused = YKFieldState(isFocused: true, hasError: false, isEnabled: true)
    public static let error = YKFieldState(isFocused: false, hasError: true, isEnabled: true)
    public static let disabled = YKFieldState(isFocused: false, hasError: false, isEnabled: false)

    /// Ошибка важнее фокуса.
    public var borderRole: YKColorRole {
        if hasError { return .danger }
        return isFocused ? .accent : .borderStrong
    }

    /// Мягкое кольцо в 3 точки вокруг рамки.
    public var ringRole: YKColorRole? {
        if hasError { return .dangerSoft }
        return isFocused ? .accentSoft : nil
    }

    public var backgroundRole: YKColorRole { isEnabled ? .surface : .surface2 }
    /// Отключённое поле узнаётся по серому фону; текст остаётся читаемым — muted, не faint.
    public var textRole: YKColorRole { isEnabled ? .text : .muted }
    public var hintRole: YKColorRole { hasError ? .danger : .muted }
    /// Плейсхолдер — текст, поэтому muted: faint только для декора.
    public var placeholderRole: YKColorRole { .muted }
}

/// Рамка поля: рисует состояние вокруг любого содержимого (строка ввода, выбор из списка, поиск).
public struct YKFieldBox<Content: View>: View {
    let state: YKFieldState
    let content: Content
    @ScaledMetric(relativeTo: .body) private var minHeight: CGFloat = 40

    public init(state: YKFieldState, @ViewBuilder content: () -> Content) {
        self.state = state
        self.content = content()
    }

    public var body: some View {
        let shape = RoundedRectangle(cornerRadius: YKTokens.Radius.md, style: .continuous)
        HStack(spacing: YKTokens.Space.s2) { content }
            .ykText(.body)
            .lineSpacing(0)
            .foregroundStyle(state.textRole.color)
            .padding(.horizontal, YKTokens.Space.s3)
            .frame(maxWidth: .infinity, minHeight: minHeight, alignment: .leading)
            .background(state.backgroundRole.color, in: shape)
            .overlay { shape.strokeBorder(state.borderRole.color, lineWidth: 1) }
            .background {
                if let ring = state.ringRole {
                    shape.fill(ring.color).padding(-3)
                }
            }
            .animation(.ykOut(duration: 0.15), value: state)
    }
}

/// Подпись, поле и подсказка под ним. Подсказка с ошибкой — красная.
public struct YKTextField: View {
    let label: String?
    let placeholder: String
    @Binding var text: String
    let hint: String?
    let error: String?
    @Environment(\.isEnabled) private var isEnabled
    @FocusState private var isFocused: Bool

    public init(_ label: String? = nil, placeholder: String = "", text: Binding<String>, hint: String? = nil, error: String? = nil) {
        self.label = label
        self.placeholder = placeholder
        self._text = text
        self.hint = hint
        self.error = error
    }

    public var body: some View {
        let state = YKFieldState(isFocused: isFocused, hasError: error != nil, isEnabled: isEnabled)
        YKField(label: label, hint: error ?? hint, state: state) {
            TextField(text: $text, prompt: Text(placeholder).foregroundStyle(state.placeholderRole.color)) {
                Text(label ?? placeholder)
            }
            .focused($isFocused)
            .tint(YKColorRole.accent.color)
        }
    }
}

/// Подпись + рамка + подсказка вокруг произвольного содержимого — для своих полей (выбор, поиск).
public struct YKField<Content: View>: View {
    let label: String?
    let hint: String?
    let state: YKFieldState
    let content: Content

    public init(label: String? = nil, hint: String? = nil, state: YKFieldState = .idle, @ViewBuilder content: () -> Content) {
        self.label = label
        self.hint = hint
        self.state = state
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let label {
                Text(label).ykMonoLabel(size: 10.5)
            }
            YKFieldBox(state: state) { content }
            if let hint {
                Text(hint)
                    .ykText(.small, size: 12.5)
                    .foregroundStyle(state.hintRole.color)
            }
        }
    }
}
