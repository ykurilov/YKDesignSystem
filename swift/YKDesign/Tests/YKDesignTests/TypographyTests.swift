import Testing
@testable import YKDesign

@Suite("Типографика")
struct TypographyTests {
    @Test("роли — кегли как в наброске 09")
    func roleSizes() {
        let sizes = YKTextRole.allCases.map { $0.style.size }
        #expect(sizes == [30, 22, 17, 15, 13, 11, 24])
    }

    @Test("моноширинные только метка и число")
    func monoRoles() {
        let mono = YKTextRole.allCases.filter { $0.style.family == .mono }
        #expect(mono == [.label, .number])
        #expect(YKTextRole.label.style.uppercase)
    }

    @Test("разрядка в точках = em × кегль")
    func tracking() {
        #expect(abs(YKTextMetrics.tracking(YKTokens.Text.label, size: 11) - 0.88) < 0.0001)
        #expect(abs(YKTextMetrics.tracking(YKTokens.Text.display, size: 30) + 0.75) < 0.0001)
        // Крупный шрифт Dynamic Type — разрядка растёт вместе с кеглем
        #expect(abs(YKTextMetrics.tracking(YKTokens.Text.label, size: 22) - 1.76) < 0.0001)
    }

    @Test("межстрочный интервал добавляется только у ролей с высотой строки")
    func lineSpacing() {
        #expect(YKTextMetrics.lineSpacing(YKTokens.Text.small, size: 13) == 0)
        let body = YKTextMetrics.lineSpacing(YKTokens.Text.body, size: 15)
        #expect(body > 3 && body < 6)
        #expect(YKTextMetrics.lineSpacing(YKTokens.Text.display, size: 30) == 0)
    }

    @Test("вес из шкалы 100–900")
    func weights() {
        #expect(YKTextMetrics.weight(600) == .semibold)
        #expect(YKTextMetrics.weight(500) == .medium)
        #expect(YKTextMetrics.weight(400) == .regular)
        #expect(YKTextMetrics.weight(700) == .bold)
    }
}
