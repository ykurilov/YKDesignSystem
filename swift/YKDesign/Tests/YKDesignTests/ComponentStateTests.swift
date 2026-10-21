import Testing
@testable import YKDesign

@Suite("Кнопки")
struct ButtonTests {
    @Test("цвета видов")
    func palettes() {
        #expect(YKButtonVariant.primary.palette == .init(background: .ink, foreground: .onInk, border: nil))
        #expect(YKButtonVariant.secondary.palette == .init(background: .surface2, foreground: .text, border: nil))
        #expect(YKButtonVariant.outline.palette == .init(background: .clear, foreground: .text, border: .borderStrong))
        #expect(YKButtonVariant.ghost.palette == .init(background: .clear, foreground: .text, border: nil))
        #expect(YKButtonVariant.danger.palette == .init(background: .danger, foreground: .onDanger, border: nil))
        #expect(YKButtonVariant.link.palette == .init(background: .clear, foreground: .accentText, border: nil))
    }

    @Test("размеры sm / md / lg")
    func sizes() {
        #expect(YKButtonSize.sm.metrics == .init(height: 32, horizontalPadding: 12, fontSize: 13, cornerRadius: 8))
        #expect(YKButtonSize.md.metrics == .init(height: 40, horizontalPadding: 16, fontSize: 14, cornerRadius: 10))
        #expect(YKButtonSize.lg.metrics == .init(height: 48, horizontalPadding: 22, fontSize: 15, cornerRadius: 10))
    }

    @Test("ссылка — узкие поля и средний вес")
    func link() {
        #expect(YKButtonVariant.link.horizontalPadding(for: .md) == 4)
        #expect(YKButtonVariant.primary.horizontalPadding(for: .md) == 16)
        #expect(YKButtonVariant.link.fontWeight == .medium)
        #expect(YKButtonVariant.primary.fontWeight == .semibold)
    }

    @Test("состояния: нажата, отключена, загрузка")
    func states() {
        let normal = YKButtonState(isEnabled: true, isPressed: false, isLoading: false)
        #expect(normal.scale == 1 && normal.opacity == 1 && normal.acceptsTaps && !normal.showsSphere)

        let pressed = YKButtonState(isEnabled: true, isPressed: true, isLoading: false)
        #expect(pressed.scale == 0.97)

        let disabled = YKButtonState(isEnabled: false, isPressed: true, isLoading: false)
        #expect(disabled.opacity == 0.4 && disabled.scale == 1 && !disabled.acceptsTaps)

        let loading = YKButtonState(isEnabled: true, isPressed: false, isLoading: true)
        #expect(loading.showsSphere && !loading.acceptsTaps && loading.opacity == 1)
    }
}

@Suite("Метки, шаги, аватары")
struct MarkTests {
    @Test("виды метки статуса")
    func chips() {
        #expect(YKChipKind.neutral.palette == .init(background: .clear, foreground: .muted, border: .border))
        #expect(YKChipKind.live.palette == .init(background: .accentSoft, foreground: .accentText, border: nil))
        #expect(YKChipKind.success.palette == .init(background: .successSoft, foreground: .success, border: nil))
        #expect(YKChipKind.danger.palette == .init(background: .dangerSoft, foreground: .danger, border: nil))
        #expect(YKChipKind.solid.palette == .init(background: .ink, foreground: .onInk, border: nil))
        #expect(YKChipKind.live.leadingMark == .sphere)
        #expect(YKChipKind.success.leadingMark == .check)
        #expect(YKChipKind.neutral.leadingMark == .none)
    }

    @Test("шаги: сделанные слева, лишнее обрезается")
    func steps() {
        #expect(YKStepsModel(total: 5, done: 3).segments == [true, true, true, false, false])
        #expect(YKStepsModel(total: 3, done: 7).segments == [true, true, true])
        #expect(YKStepsModel(total: 4, done: -1).segments == [false, false, false, false])
        #expect(YKStepsModel(total: 0, done: 0).segments.isEmpty)
        #expect(YKStepsModel.doneRole(isLive: true) == .accent)
        #expect(YKStepsModel.doneRole(isLive: false) == .text)
    }

    @Test("буквы аватара из имени")
    func initials() {
        #expect(YKAvatar.initials(from: "Юрий Курилов") == "ЮК")
        #expect(YKAvatar.initials(from: "мария кравец") == "МК")
        #expect(YKAvatar.initials(from: "  Анна  Игоревна Иванова ") == "АИ")
        #expect(YKAvatar.initials(from: "Агент") == "АГ")
        #expect(YKAvatar.initials(from: "") == "")
    }

    @Test("размеры аватара")
    func avatarSizes() {
        #expect(YKAvatar.Size.md.diameter == 32 && YKAvatar.Size.md.fontSize == 12)
        #expect(YKAvatar.Size.sm.diameter == 24 && YKAvatar.Size.sm.fontSize == 10)
    }
}

@Suite("Поля и выбор")
struct InputTests {
    @Test("рамка поля: обычная, фокус, ошибка, отключено")
    func fieldStates() {
        let idle = YKFieldState(isFocused: false, hasError: false, isEnabled: true)
        #expect(idle.borderRole == .borderStrong && idle.ringRole == nil && idle.backgroundRole == .surface)

        let focused = YKFieldState(isFocused: true, hasError: false, isEnabled: true)
        #expect(focused.borderRole == .accent && focused.ringRole == .accentSoft)

        let error = YKFieldState(isFocused: true, hasError: true, isEnabled: true)
        #expect(error.borderRole == .danger && error.ringRole == .dangerSoft)
        #expect(error.hintRole == .danger && idle.hintRole == .muted)

        let disabled = YKFieldState(isFocused: false, hasError: false, isEnabled: false)
        #expect(disabled.backgroundRole == .surface2 && disabled.textRole == .muted)
    }

    @Test("переключатель и флажок включённые — акцент")
    func toggles() {
        #expect(YKSwitchAppearance.trackRole(isOn: true) == .accent)
        #expect(YKSwitchAppearance.trackRole(isOn: false) == .surface3)
        #expect(YKCheckboxAppearance.fillRole(isOn: true) == .accent)
        #expect(YKCheckboxAppearance.borderRole(isOn: true) == .accent)
        #expect(YKCheckboxAppearance.fillRole(isOn: false) == .surface)
        #expect(YKCheckboxAppearance.borderRole(isOn: false) == .borderStrong)
    }

    @Test("сегменты: активный — текст акцента")
    func segments() {
        #expect(YKSegmentAppearance.foregroundRole(isSelected: true) == .accentText)
        #expect(YKSegmentAppearance.foregroundRole(isSelected: false) == .muted)
        #expect(YKSegmentAppearance.selectedBackgroundRole(isDark: false) == .surface)
        #expect(YKSegmentAppearance.selectedBackgroundRole(isDark: true) == .surface3)
    }
}

@Suite("Сообщения")
struct MessageTests {
    @Test("плашка: обычная, ошибка, агент")
    func banners() {
        #expect(YKBannerKind.info.backgroundRole == .surface && YKBannerKind.info.mark == .none)
        #expect(YKBannerKind.danger.backgroundRole == .dangerSoft && YKBannerKind.danger.mark == .warning)
        #expect(YKBannerKind.agent.mark == .sphere)
    }
}
