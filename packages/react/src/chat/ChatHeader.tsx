import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Sphere } from "../sphere/Sphere.js";

export interface ChatHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: string;
  /** Начинка справа: индикатор хода, статус, кнопка. Что положить, решает приложение. */
  aside?: ReactNode;
  /** Переписку прокрутили — под шапкой появляется тень. */
  scrolled?: boolean;
  headingLevel?: 1 | 2 | 3;
}

/** Шапка чата по ширине колонки переписки. */
export function ChatHeader({ title, aside, scrolled = false, headingLevel = 1, className, ...rest }: ChatHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header className={classNames("yk-chat-header", scrolled && "yk-chat-header--scrolled", className)} {...rest}>
      <div className="yk-chat-column yk-chat-header__inner">
        <Sphere size={24} />
        <Heading className="yk-chat-header__title">{title}</Heading>
        {aside != null && <div className="yk-chat-header__aside">{aside}</div>}
      </div>
    </header>
  );
}
