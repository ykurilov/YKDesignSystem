import { describe, expect, it } from "vitest";
import { placeMenu } from "../src/menu/placeMenu.js";

const viewport = { width: 1000, height: 800 };
const menu = { width: 220, height: 200 };
const anchorAt = (left: number, top: number, width = 80, height = 40) => ({ left, top, right: left + width, bottom: top + height });

describe("placeMenu", () => {
  it("места хватает — вниз и от левого края кнопки", () => {
    expect(placeMenu({ anchor: anchorAt(100, 100), menu, viewport })).toEqual({ vertical: "down", align: "start" });
  });

  it("снизу не помещается, а сверху помещается — открывается вверх", () => {
    expect(placeMenu({ anchor: anchorAt(100, 700), menu, viewport }).vertical).toBe("up");
  });

  it("не помещается ни там ни там — остаётся вниз, где места больше или поровну", () => {
    const tall = { width: 220, height: 700 };
    expect(placeMenu({ anchor: anchorAt(100, 300), menu: tall, viewport }).vertical).toBe("down");
    expect(placeMenu({ anchor: anchorAt(100, 500), menu: tall, viewport }).vertical).toBe("up");
  });

  it("справа не помещается — по правому краю кнопки", () => {
    expect(placeMenu({ anchor: anchorAt(900, 100), menu, viewport }).align).toBe("end");
  });

  it("справа не помещается, но и слева не поместится — остаётся от левого края", () => {
    expect(placeMenu({ anchor: anchorAt(30, 100, 40), menu: { width: 220, height: 100 }, viewport: { width: 150, height: 800 } }).align).toBe("start");
  });

  it("заданное выравнивание — предпочтение: влезает — остаётся", () => {
    expect(placeMenu({ anchor: anchorAt(500, 100), menu, viewport, align: "end" }).align).toBe("end");
    expect(placeMenu({ anchor: anchorAt(400, 100), menu, viewport, align: "start" }).align).toBe("start");
  });

  it("заданное выравнивание не влезает, а другой край влезает — переворачивается", () => {
    // телефон 390: кнопка у левого края, align=end вывел бы меню за левый край
    const phone = { width: 390, height: 800 };
    expect(placeMenu({ anchor: anchorAt(20, 100, 40), menu, viewport: phone, align: "end" }).align).toBe("start");
    expect(placeMenu({ anchor: anchorAt(900, 100), menu, viewport, align: "start" }).align).toBe("end");
  });

  it("не влезает ни так ни так — сдвигается в пределы экрана с отступом", () => {
    const narrow = { width: 240, height: 800 };
    const result = placeMenu({ anchor: anchorAt(100, 100, 40), menu, viewport: narrow, align: "end" });
    const left = result.align === "end" ? 140 - menu.width + (result.shift ?? 0) : 100 + (result.shift ?? 0);
    expect(left).toBeGreaterThanOrEqual(8);
    expect(left + menu.width).toBeLessThanOrEqual(240 - 8);
  });

  it("отступ от края экрана учитывается", () => {
    // 1000 - 780 = 220: влезает впритык, но отступ в 8px не оставляет
    expect(placeMenu({ anchor: anchorAt(780, 100), menu, viewport }).align).toBe("end");
    expect(placeMenu({ anchor: anchorAt(760, 100), menu, viewport }).align).toBe("start");
  });
});
