import { CalendarBlankIcon, CheckIcon } from "@phosphor-icons/react";
import { useId, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Icon } from "../icon/Icon.js";

export type CompletionItemStatus = "done" | "later";

export interface CompletionItem {
  id: string;
  label: string;
  status: CompletionItemStatus;
  /** Видимая подпись статуса от приложения, например «позже». Без неё статус слышен только диктору. */
  statusLabel?: string;
}

export interface CompletionCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** «Заказ оформлен», «Анкета заполнена», «Отчёт готов». */
  title: string;
  /** Что будет дальше. */
  description?: ReactNode;
  items?: CompletionItem[];
  /** Имена статусов для диктора, когда у пункта нет своей подписи. */
  statusNames?: Record<CompletionItemStatus, string>;
  /** Обычно `<Button>`; например, вернуть поле ввода. */
  action?: ReactNode;
  /** Мелкая подпись рядом с действием: номер, имя файла. */
  note?: ReactNode;
}

const defaultStatusNames: Record<CompletionItemStatus, string> = { done: "готово", later: "отложено" };

/** Итог в переписке: что завершилось, что отложено и что дальше. Слова задаёт приложение. */
export function CompletionCard({ title, description, items = [], statusNames = defaultStatusNames,
  action, note, className, ...rest }: CompletionCardProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className={classNames("yk-completion", className)} {...rest}>
      <div className="yk-completion__head">
        <span className="yk-completion__mark"><Icon icon={CheckIcon} size={18} /></span>
        <h2 id={titleId} className="yk-completion__title">{title}</h2>
      </div>
      <div className="yk-completion__body">
        {description != null && <p className="yk-completion__description">{description}</p>}
        {items.length > 0 && <ul className="yk-completion__items">
          {items.map(item => <li key={item.id}
            className={classNames("yk-completion__item", item.status === "later" && "yk-completion__item--later")}>
            <Icon icon={item.status === "done" ? CheckIcon : CalendarBlankIcon} size={14} />
            <span>{item.label}
              {item.statusLabel != null
                ? <span className="yk-completion__status">{item.statusLabel}</span>
                : <span className="yk-visually-hidden">, {statusNames[item.status]}</span>}</span>
          </li>)}
        </ul>}
        {(action != null || note != null) && <div className="yk-completion__foot">
          {action}{note != null && <small className="yk-completion__note">{note}</small>}
        </div>}
      </div>
    </section>
  );
}
