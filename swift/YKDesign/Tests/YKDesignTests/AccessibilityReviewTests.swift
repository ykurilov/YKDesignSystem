import Testing
@testable import YKDesign

@Suite("Повторное ревью: доступность и вид")
struct AccessibilityReviewTests {
    @Test("радио: позиция «N из M» для VoiceOver")
    func radioPosition() {
        #expect(YKRadioAccessibility.position(index: 0, count: 3) == "1 из 3")
        #expect(YKRadioAccessibility.position(index: 2, count: 3) == "3 из 3")
    }

    @Test("радио из Identifiable-значений: варианты и выбор по id")
    func radioIdentifiable() {
        struct Period: Identifiable { let id: Int; let name: String }
        let periods = [Period(id: 1, name: "Каждый день"), Period(id: 7, name: "Раз в неделю")]
        let options = YKRadioGroup<Int>.options(periods, title: \.name)
        #expect(options.map(\.value) == [1, 7])
        #expect(options.map(\.title) == ["Каждый день", "Раз в неделю"])
    }

    @Test("вкладка: подпись со счётчиком, ряд — панель вкладок")
    func tabsAccessibility() {
        #expect(YKTabsAccessibility.label(title: "Задачи", count: 27) == "Задачи, 27")
        #expect(YKTabsAccessibility.label(title: "Обзор", count: nil) == "Обзор")
        #expect(YKTabsAccessibility.rowTraits.contains(.isTabBar))
    }

    @Test("меню со значком: видимая квадратная кнопка по умолчанию, ghost — только явно")
    func menuIconTrigger() {
        #expect(YKMenuTrigger.defaultIconVariant == .secondary)
        #expect(YKMenuTrigger.defaultIconVariant.palette.background != .clear)
    }

    @Test("шторка: кнопки панели инструментов цветом текста, не системным синим")
    func sheetTint() {
        #expect(YKSheetMetrics.tintRole == .text)
    }

    @Test("скелет при Reduce Motion — ровная плашка без градиента")
    func skeletonReduceMotion() {
        #expect(YKSkeletonAppearance.fill(reduceMotion: true) == .flat(.surface2))
        #expect(YKSkeletonAppearance.fill(reduceMotion: false) == .shimmer(base: .surface2, highlight: .surface3))
    }
}
