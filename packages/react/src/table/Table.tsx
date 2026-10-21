import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { classNames } from "../classNames.js";

/** Таблица в рамке с умеренным углом. Имя для диктора — `aria-label`. */
export function Table({ className, children, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="yk-table-wrap">
      <table className={classNames("yk-table", className)} {...rest}>{children}</table>
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Выбранная строка: полоска акцента слева и мягкая подсветка. */
  selected?: boolean;
}

export function TableRow({ selected = false, ...rest }: TableRowProps) {
  return <tr data-selected={selected || undefined} aria-current={selected ? "true" : undefined} {...rest} />;
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Колонка с числами: выравнивание вправо. */
  numeric?: boolean;
}

/** Ячейка шапки: моноширинный капс. */
export function TableHeaderCell({ numeric = false, className, ...rest }: TableHeaderCellProps) {
  return <th scope="col" className={classNames("yk-table__head-cell", numeric && "yk-table__head-cell--numeric", className)} {...rest} />;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Число или дата: моноширинным серым. */
  numeric?: boolean;
  /** Название строки: чуть жирнее. */
  strong?: boolean;
}

export function TableCell({ numeric = false, strong = false, className, ...rest }: TableCellProps) {
  return (
    <td
      className={classNames("yk-table__cell", numeric && "yk-table__cell--numeric", strong && "yk-table__cell--strong", className)}
      {...rest}
    />
  );
}
