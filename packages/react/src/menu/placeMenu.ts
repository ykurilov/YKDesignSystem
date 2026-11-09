export interface Box { left: number; top: number; right: number; bottom: number }
export interface Size { width: number; height: number }

export interface MenuPlacement {
  vertical: "down" | "up";
  align: "start" | "end";
  /** Сдвиг по горизонтали в пикселях (вправо — плюс), когда меню не влезает ни от одного края кнопки. */
  shift?: number;
}

interface PlaceMenuInput {
  anchor: Box;
  menu: Size;
  viewport: Size;
  /** Предпочтительное выравнивание. Если с ним меню не влезает в экран, берётся другой край или меню сдвигается. */
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

  const fitsFromStart = anchor.left + menu.width <= viewport.width - margin;
  const fitsFromEnd = anchor.right - menu.width >= margin;
  const preferred = align ?? "start";
  const preferredFits = preferred === "start" ? fitsFromStart : fitsFromEnd;
  if (preferredFits) return { vertical, align: preferred };

  const other = preferred === "start" ? "end" : "start";
  if (other === "start" ? fitsFromStart : fitsFromEnd) return { vertical, align: other };

  // Не влезает ни так, ни так: остаёмся на предпочтительном краю и сдвигаем меню в пределы экрана
  const left = preferred === "start" ? anchor.left : anchor.right - menu.width;
  const maxLeft = viewport.width - margin - menu.width;
  const shift = Math.max(margin, Math.min(left, maxLeft)) - left;
  return shift === 0 ? { vertical, align: preferred } : { vertical, align: preferred, shift };
}
