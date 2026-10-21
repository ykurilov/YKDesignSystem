import Foundation
import Testing
@testable import YKDesign

@Suite("Моноширинные метки при крупном шрифте")
struct MonoLabelScalingTests {
    @Test("при обычном шрифте — кегль без изменений")
    func defaultSize() {
        #expect(YKTextMetrics.monoLabelSize(base: 11, bodyScale: 1) == 11)
        #expect(YKTextMetrics.monoLabelSize(base: 10.5, bodyScale: 1) == 10.5)
    }

    @Test("растёт медленнее основного текста", arguments: [1.2, 1.6, 2.0, 2.6])
    func growsSlower(scale: Double) {
        let label = YKTextMetrics.monoLabelSize(base: 11, bodyScale: scale)
        #expect(label > 11)
        #expect(label / 11 < scale)
    }

    @Test("есть потолок", arguments: [2.0, 3.0, 4.0])
    func ceiling(scale: Double) {
        #expect(YKTextMetrics.monoLabelSize(base: 11, bodyScale: scale) <= 11 * YKTextMetrics.monoLabelMaxGrowth)
    }

    @Test("никогда не крупнее основного текста", arguments: [0.8, 0.9, 1.0, 1.4, 2.0, 3.0, 4.0])
    func neverLargerThanBody(scale: Double) {
        let body = YKTokens.Text.body.size * scale
        #expect(YKTextMetrics.monoLabelSize(base: 11, bodyScale: scale) < body)
        #expect(YKTextMetrics.monoLabelSize(base: 13, bodyScale: scale) < body)
    }
}

@Suite("Кнопка-значок")
struct IconButtonTests {
    @Test("квадратная: сторона = высота кнопки того же размера")
    func square() {
        for size in YKButtonSize.allCases {
            #expect(YKIconButtonMetrics.side(for: size) == size.metrics.height)
        }
    }

    @Test("значок растёт с размером кнопки")
    func iconSizes() {
        #expect(YKIconButtonMetrics.iconSize(for: .sm) == 14)
        #expect(YKIconButtonMetrics.iconSize(for: .md) == 16)
        #expect(YKIconButtonMetrics.iconSize(for: .lg) == 18)
    }
}

@Suite("Радио и вкладки")
struct RadioAndTabsTests {
    @Test("радио: выбранное — толстое кольцо акцента")
    func radio() {
        #expect(YKRadioAppearance.borderRole(isSelected: true) == .accent)
        #expect(YKRadioAppearance.borderRole(isSelected: false) == .borderStrong)
        #expect(YKRadioAppearance.borderWidth(isSelected: true) == 6)
        #expect(YKRadioAppearance.borderWidth(isSelected: false) == 1.5)
    }

    @Test("вкладки: активная — цвет текста, средний вес и линия акцента")
    func tabs() {
        #expect(YKTabsAppearance.titleRole(isSelected: true) == .text)
        #expect(YKTabsAppearance.titleRole(isSelected: false) == .muted)
        #expect(YKTabsAppearance.titleWeight(isSelected: true) == .medium)
        #expect(YKTabsAppearance.titleWeight(isSelected: false) == .regular)
        #expect(YKTabsAppearance.indicatorRole == .accent)
        #expect(YKTabsAppearance.indicatorHeight == 2)
        #expect(YKTabsAppearance.countRole == .muted)
    }
}

@Suite("Шторка, окна, скелет")
struct OverlayTests {
    @Test("шторка: углы 22, ручка 36×5")
    func sheet() {
        #expect(YKSheetMetrics.cornerRadius == 22)
        #expect(YKSheetMetrics.gripSize == CGSize(width: 36, height: 5))
        #expect(YKSheetMetrics.backgroundRole == .surface)
        #expect(YKSheetMetrics.gripRole == .surface3)
    }

    @Test("системные окна: кнопки цветом текста, а не синим")
    func dialogTint() {
        #expect(YKSystemDialogs.tintRole == .text)
    }

    @Test("скелет: мерцание идёт по кругу 1.4 с, при Reduce Motion — нет")
    func skeleton() {
        #expect(YKSkeletonAppearance.isShimmering(reduceMotion: false))
        #expect(!YKSkeletonAppearance.isShimmering(reduceMotion: true))
        #expect(YKSkeletonAppearance.phase(elapsed: 0) == 0)
        #expect(abs(YKSkeletonAppearance.phase(elapsed: 0.7) - 0.5) < 1e-9)
        #expect(abs(YKSkeletonAppearance.phase(elapsed: 2.1) - 0.5) < 1e-9)
        #expect(YKSkeletonAppearance.phase(elapsed: 5, reduceMotion: true) == 0)
    }
}

@Suite("Группа строк")
struct ListGroupTests {
    @Test("линия только между соседними строками")
    func dividers() {
        #expect(YKListGroupLayout.showsDivider(after: 0, count: 3))
        #expect(YKListGroupLayout.showsDivider(after: 1, count: 3))
        #expect(!YKListGroupLayout.showsDivider(after: 2, count: 3))
        #expect(!YKListGroupLayout.showsDivider(after: 0, count: 1))
    }
}

@Suite("Доступность и правки ревьюера")
struct ReviewTests {
    @Test("кнопка в загрузке: VoiceOver слышит «загрузка» и не может её нажать")
    func loadingButtonAccessibility() {
        let loading = YKButtonState(isEnabled: true, isPressed: false, isLoading: true)
        #expect(loading.accessibilityValue == "Загрузка")
        #expect(loading.isAccessibilityDisabled)
        #expect(!loading.shouldTriggerAction)

        let normal = YKButtonState(isEnabled: true, isPressed: false, isLoading: false)
        #expect(normal.accessibilityValue == nil)
        #expect(!normal.isAccessibilityDisabled)
        #expect(normal.shouldTriggerAction)

        let disabled = YKButtonState(isEnabled: false, isPressed: false, isLoading: false)
        #expect(!disabled.shouldTriggerAction)
    }

    @Test("сфера с подписью — доступный элемент-статус, без подписи — скрыта")
    func sphereAccessibility() {
        #expect(YKSphereAccessibility(label: nil).isHidden)
        let status = YKSphereAccessibility(label: "Агент работает")
        #expect(!status.isHidden)
        #expect(status.label == "Агент работает")
        #expect(YKSphereAccessibility(label: "").isHidden)
    }

    @Test("кружок переключателя прижат к краю, а не сдвинут: зеркалится справа налево")
    func switchKnob() {
        #expect(YKSwitchAppearance.knobAlignment(isOn: true) == .trailing)
        #expect(YKSwitchAppearance.knobAlignment(isOn: false) == .leading)
        #expect(YKSwitchAppearance.knobInset == 3)
        // Кружок с отступами ровно заполняет высоту дорожки
        #expect(YKSwitchAppearance.knobDiameter + 2 * YKSwitchAppearance.knobInset == YKSwitchAppearance.trackSize.height)
    }

    @Test("плейсхолдер и подсказка — muted: faint только для декора")
    func placeholderColor() {
        #expect(YKFieldState.idle.placeholderRole == .muted)
        #expect(YKFieldState.idle.hintRole == .muted)
    }
}
