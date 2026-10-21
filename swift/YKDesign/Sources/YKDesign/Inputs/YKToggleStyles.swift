import SwiftUI

/// Переключатель: дорожка 42×26, кружок 20. Включённый — акцент.
public enum YKSwitchAppearance {
    public static let trackSize = CGSize(width: 42, height: 26)
    public static let knobDiameter: CGFloat = 20

    public static func trackRole(isOn: Bool) -> YKColorRole { isOn ? .accent : .surface3 }

    /// Отступ кружка от левого края дорожки.
    public static func knobOffset(isOn: Bool) -> CGFloat {
        isOn ? trackSize.width - knobDiameter - 3 : 3
    }
}

/// Флажок 20×20: включённый — залит акцентом с галочкой.
public enum YKCheckboxAppearance {
    public static func fillRole(isOn: Bool) -> YKColorRole { isOn ? .accent : .surface }
    public static func borderRole(isOn: Bool) -> YKColorRole { isOn ? .accent : .borderStrong }
}

public struct YKSwitchToggleStyle: ToggleStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        Button {
            configuration.isOn.toggle()
        } label: {
            HStack(spacing: 10) {
                ZStack(alignment: .leading) {
                    Capsule().fill(YKSwitchAppearance.trackRole(isOn: configuration.isOn).color)
                    Circle()
                        .fill(Color.white)
                        .shadow(color: .black.opacity(0.2), radius: 1.5, y: 1)
                        .frame(width: YKSwitchAppearance.knobDiameter, height: YKSwitchAppearance.knobDiameter)
                        .offset(x: YKSwitchAppearance.knobOffset(isOn: configuration.isOn))
                }
                .frame(width: YKSwitchAppearance.trackSize.width, height: YKSwitchAppearance.trackSize.height)
                .animation(.ykOut(), value: configuration.isOn)
                configuration.label
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityRepresentation { Toggle(isOn: configuration.$isOn) { configuration.label } }
    }
}

public struct YKCheckboxToggleStyle: ToggleStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        Button {
            configuration.isOn.toggle()
        } label: {
            HStack(spacing: 10) {
                let shape = RoundedRectangle(cornerRadius: 5, style: .continuous)
                ZStack {
                    shape.fill(YKCheckboxAppearance.fillRole(isOn: configuration.isOn).color)
                    shape.strokeBorder(YKCheckboxAppearance.borderRole(isOn: configuration.isOn).color, lineWidth: 1.5)
                    if configuration.isOn {
                        YKIcon(.check, size: 13).foregroundStyle(Color.white)
                    }
                }
                .frame(width: 20, height: 20)
                configuration.label
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityRepresentation { Toggle(isOn: configuration.$isOn) { configuration.label } }
    }
}

public extension ToggleStyle where Self == YKSwitchToggleStyle {
    static var ykSwitch: YKSwitchToggleStyle { YKSwitchToggleStyle() }
}

public extension ToggleStyle where Self == YKCheckboxToggleStyle {
    static var ykCheckbox: YKCheckboxToggleStyle { YKCheckboxToggleStyle() }
}
