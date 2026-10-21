export interface Box { left: number; top: number; right: number; bottom: number }
export interface Size { width: number; height: number }

export interface MenuPlacement {
  vertical: "down" | "up";
  align: "start" | "end";
}

interface PlaceMenuInput {
  anchor: Box;
  menu: Size;
  viewport: Size;
  /** Ручное выравнивание: сильнее автоматики. */
  align?: "start" | "end";
  /** Зазор между кнопкой и меню. */
  gap?: number;
  /** Минимальный отступ меню от края экрана. */
  margin?: number;
}

/** Решает, куда открыть меню: вниз или вверх, от левого или от правого края кнопки. */
export function placeMenu({ anchor, menu, viewport, align, gap = 6, margin = 8 }: PlaceMenuInput): MenuPlacement {
  const roomBelow = viewport.height - anchor.bottom - gap - margin;
  const roomAbove = anchor.top - gap - margin;
  const vertical = menu.height > roomBelow && roomAbove > roomBelow ? "up" : "down";

  if (align) return { vertical, align };

  const fitsFromStart = anchor.left + menu.width <= viewport.width - margin;
  const fitsFromEnd = anchor.right - menu.width >= margin;
  return { vertical, align: !fitsFromStart && fitsFromEnd ? "end" : "start" };
}
