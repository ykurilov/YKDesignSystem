import { CheckCircleIcon, ListIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Button, Checkbox, Radio, RadioGroup, SegmentedControl, Switch, Tab, TabList, TabPanel, Tabs } from "@ykurilov/ds-react";
import { useState } from "react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

const SCOPE = [
  { value: "all", label: "Все" },
  { value: "mine", label: "Мои" },
  { value: "archive", label: "Архив" },
];

function SelectAll() {
  const [items, setItems] = useState([true, false, false]);
  const count = items.filter(Boolean).length;
  const toggleAll = () => setItems(items.map(() => count !== items.length));
  return (
    <div className="sc-stack" style={{ gap: 10 }}>
      <Checkbox checked={count === items.length} indeterminate={count > 0 && count < items.length} onChange={toggleAll}>
        Выбрать все
      </Checkbox>
      {["Письмо-анонс", "Письмо-напоминание", "Письмо-дожим"].map((title, i) => (
        <Checkbox key={title} checked={items[i]} onChange={(e) => setItems(items.map((on, j) => (j === i ? e.target.checked : on)))}>
          {title}
        </Checkbox>
      ))}
    </div>
  );
}

function ChoiceDemo() {
  return (
    <DemoStack>
      <DemoLine label="Флажки">
        <Checkbox defaultChecked>Напоминать</Checkbox>
        <Checkbox>Только мои</Checkbox>
        <Checkbox indeterminate>Частично</Checkbox>
        <Checkbox disabled>Отключён</Checkbox>
        <Checkbox disabled defaultChecked>Отключён, выбран</Checkbox>
      </DemoLine>
      <DemoLine label="Радио">
        <RadioGroup aria-label="Как часто" orientation="horizontal" defaultValue="day">
          <Radio value="day">Каждый день</Radio>
          <Radio value="week">Раз в неделю</Radio>
          <Radio value="month" disabled>Раз в месяц</Radio>
        </RadioGroup>
      </DemoLine>
      <DemoLine label="Переключ.">
        <Switch defaultChecked>Агент может отправлять письма</Switch>
        <Switch>Тёмная тема</Switch>
        <Switch disabled>Отключён</Switch>
      </DemoLine>
      <DemoLine label="Сегменты">
        <SegmentedControl aria-label="Показать" options={SCOPE} defaultValue="all" />
        <SegmentedControl
          aria-label="Вид"
          size="sm"
          defaultValue="list"
          options={[
            { value: "list", label: "Список", icon: ListIcon },
            { value: "grid", label: "Плитка", icon: SquaresFourIcon },
            { value: "done", label: "Готово", icon: CheckCircleIcon, disabled: true },
          ]}
        />
      </DemoLine>
      <DemoLine label="Вкладки">
        <Tabs defaultValue="overview" className="sc-tabs-demo">
          <TabList aria-label="Проект">
            <Tab value="overview">Обзор</Tab>
            <Tab value="tasks" count={27}>Задачи</Tab>
            <Tab value="files" count={8}>Файлы</Tab>
            <Tab value="history">История</Tab>
          </TabList>
          <TabPanel value="overview">Обзор проекта. Стрелки ← → переключают вкладки.</TabPanel>
          <TabPanel value="tasks">27 задач в работе.</TabPanel>
          <TabPanel value="files">8 файлов.</TabPanel>
          <TabPanel value="history">Журнал изменений.</TabPanel>
        </Tabs>
      </DemoLine>
      <DemoLine label="Список">
        <SelectAll />
      </DemoLine>
      <DemoLine label="Ссылка">
        <Button href="#section-5" variant="link">Кнопка-ссылка</Button>
        <Button href="#section-5" variant="outline">Ссылка видом outline</Button>
        <Button href="#section-5" disabled variant="secondary">Ссылка отключена</Button>
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 5,
  title: "Выбор",
  description: "Включённое — оранжевым. Стрелки работают в радио, сегментах и вкладках, пробел — в флажке и переключателе.",
  Demo: ChoiceDemo,
} satisfies ShowcaseSection;
