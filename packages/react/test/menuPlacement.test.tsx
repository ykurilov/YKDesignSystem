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

  it("ручное выравнивание сильнее автоматики", () => {
    expect(placeMenu({ anchor: anchorAt(900, 100), menu, viewport, align: "start" }).align).toBe("start");
    expect(placeMenu({ anchor: anchorAt(100, 100), menu, viewport, align: "end" }).align).toBe("end");
  });

  it("отступ от края экрана учитывается", () => {
    // 1000 - 780 = 220: влезает впритык, но отступ в 8px не оставляет
    expect(placeMenu({ anchor: anchorAt(780, 100), menu, viewport }).align).toBe("end");
    expect(placeMenu({ anchor: anchorAt(760, 100), menu, viewport }).align).toBe("start");
  });
});
