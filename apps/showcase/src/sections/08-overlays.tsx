import { CopyIcon, DotsThreeIcon, PencilSimpleIcon, SparkleIcon, TrashIcon } from "@phosphor-icons/react";
import { Banner, Button, Dialog, Menu, Sheet, ToastProvider, useToast } from "@ykurilov/ds-react";
import { useState } from "react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

const MENU_ENTRIES = [
  { label: "Переименовать", icon: PencilSimpleIcon, shortcut: "R", onSelect: () => {} },
  { label: "Дублировать", icon: CopyIcon, shortcut: "⌘D", onSelect: () => {} },
  { label: "Спросить агента", icon: SparkleIcon, shortcut: "⌘J", onSelect: () => {} },
  "separator" as const,
  { label: "Удалить", icon: TrashIcon, shortcut: "⌫", danger: true, onSelect: () => {} },
];

function ToastButton() {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => toast.show({ message: "Проект удалён", actionLabel: "Вернуть", onAction: () => toast.show({ message: "Проект возвращён" }) })}
    >
      Показать уведомление
    </Button>
  );
}

function OverlaysDemo() {
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  return (
    <ToastProvider>
      <DemoStack>
        <DemoLine label="Открыть">
          <Button variant="outline" onClick={() => setDialog(true)}>Окно</Button>
          <Menu label="Действия" trigger={<Button variant="outline">Меню</Button>} entries={MENU_ENTRIES} />
          <Button variant="outline" onClick={() => setSheet(true)}>Шторка</Button>
          <ToastButton />
        </DemoLine>
        <DemoLine label="У края экрана">
          <div className="sc-edge">
            <Menu label="Действия у края" trigger={<Button variant="outline" icon={DotsThreeIcon} aria-label="Действия у края" />} entries={MENU_ENTRIES} />
          </div>
        </DemoLine>
        <div className="sc-stage">
          <div className="sc-static yk-dialog sc-static--dialog" aria-hidden="true">
            <span className="yk-mono-label">Удаление</span>
            <h3 className="yk-dialog__title">Удалить «Квиз по уроку 7»?</h3>
            <div className="yk-dialog__body">Проект и 5 задач исчезнут. Вернуть их можно в течение 30 дней из архива.</div>
            <div className="yk-dialog__actions"><Button variant="ghost" tabIndex={-1}>Отмена</Button><Button variant="danger" tabIndex={-1}>Удалить</Button></div>
          </div>
          <div className="yk-menu sc-static sc-static--menu" aria-hidden="true">
            {MENU_ENTRIES.map((entry, i) =>
              entry === "separator" ? <hr key={i} className="yk-menu__separator" /> : (
                <span key={i} className={`yk-menu__item yk-menu__item--with-icon${entry.danger ? " yk-menu__item--danger" : ""}${i === 0 ? " sc-hover" : ""}`}>
                  <entry.icon size={16} className="yk-icon" />{entry.label}<kbd className="yk-menu__kbd">{entry.shortcut}</kbd>
                </span>
              ))}
          </div>
          <div className="yk-sheet sc-static sc-static--sheet" aria-hidden="true">
            <i className="yk-sheet__grip" />
            <h3 className="yk-sheet__title">Новый проект</h3>
            <Button size="lg" tabIndex={-1}>Создать</Button>
          </div>
        </div>
        <DemoLine label="Уведомление">
          <div className="yk-toast sc-static">
            <span className="yk-toast__message">Проект удалён</span>
            <button type="button" className="yk-toast__action" tabIndex={-1}>Вернуть</button>
          </div>
        </DemoLine>
        <DemoLine label="Баннеры">
          <div className="sc-banners">
            <Banner tone="agent" title="Агент собирает план рассылки.">Можно закрыть окно — пришлём уведомление, когда будет готово.</Banner>
            <Banner tone="danger" title="Письмо не отправлено.">Почтовый сервис не отвечает. Агент повторит через 5 минут.</Banner>
            <Banner title="Черновик сохранён.">Изменения видны только вам, пока вы не опубликуете проект.</Banner>
          </div>
        </DemoLine>
      </DemoStack>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        eyebrow="Удаление"
        title="Удалить «Квиз по уроку 7»?"
        actions={<><Button variant="ghost" onClick={() => setDialog(false)}>Отмена</Button><Button variant="danger" onClick={() => setDialog(false)}>Удалить</Button></>}
      >
        Проект и 5 задач исчезнут. Вернуть их можно в течение 30 дней из архива.
      </Dialog>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Новый проект">
        <input className="sc-input" defaultValue="Марафон по ИИ" aria-label="Название проекта" data-autofocus />
        <Button size="lg" onClick={() => setSheet(false)}>Создать</Button>
      </Sheet>
    </ToastProvider>
  );
}

export default {
  order: 8,
  title: "Всплывающее",
  description: "Окно, меню, шторка снизу на телефоне, уведомления. Ниже — статичный показ, сверху — живое.",
  Demo: OverlaysDemo,
} satisfies ShowcaseSection;
