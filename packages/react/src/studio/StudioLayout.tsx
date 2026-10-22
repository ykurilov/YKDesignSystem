import { useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "../classNames.js";
import { Sheet } from "../sheet/Sheet.js";

export interface StudioInspector {
  title: string;
  content: ReactNode;
  /** На телефоне журнал открывается как Sheet. На компьютере виден постоянно. */
  open: boolean;
  onClose: () => void;
}

export interface StudioLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  navigation?: ReactNode;
  navigationLabel?: string;
  header: ReactNode;
  contentLabel?: string;
  inspector?: StudioInspector;
}

const compactQuery = "(max-width: 700px)";
function subscribeCompact(listener: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
const compactSnapshot = () => window.matchMedia(compactQuery).matches;
const serverSnapshot = () => false;

/** Композиция рабочего экрана. Поведение настоящего чата предоставляет Agent Chat SDK. */
export function StudioLayout({ navigation, navigationLabel = "Навигация", header,
  contentLabel = "Рабочая область", inspector, className, children, ...rest }: StudioLayoutProps) {
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, serverSnapshot);
  const showInspector = inspector != null && !compact;
  return (
    <div className={classNames("yk-studio", !navigation && "yk-studio--without-navigation",
      !showInspector && "yk-studio--without-inspector", className)} {...rest}>
      {navigation && <nav className="yk-studio__navigation" aria-label={navigationLabel}>{navigation}</nav>}
      <header className="yk-studio__header">{header}</header>
      <div className="yk-studio__body">
        <section className="yk-studio__main" aria-label={contentLabel}>{children}</section>
        {showInspector && <aside className="yk-studio__inspector" aria-label={inspector.title}>
          <h2 className="yk-studio__panel-heading">{inspector.title}</h2>{inspector.content}
        </aside>}
      </div>
      {compact && inspector && <Sheet open={inspector.open} onClose={inspector.onClose} title={inspector.title}>
        <div className="yk-studio__mobile-inspector">{inspector.content}</div>
      </Sheet>}
    </div>
  );
}
