import { forwardRef, type HTMLAttributes } from "react";
import { classNames } from "../classNames.js";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Имя области для клавиатуры и экранного диктора. */
  label: string;
}

/** Независимая прокрутка; полоса отделена от содержимого и при overlay-scrollbar. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { label, className, children, tabIndex = 0, ...rest }, ref,
) {
  return <div ref={ref} role="region" aria-label={label} tabIndex={tabIndex}
    className={classNames("yk-scroll-area", className)} {...rest}>{children}</div>;
});
