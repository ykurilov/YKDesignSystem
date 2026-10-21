import { BellIcon, ImageIcon, SparkleIcon } from "@phosphor-icons/react";
import { Card, Chip, List, ListRow, Stat, StatGroup, Steps, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Avatar } from "@ykurilov/ds-react";
import { useState } from "react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function CardsDemo() {
  const [selected, setSelected] = useState("ideas");
  return (
    <DemoStack>
      <div className="sc-cols">
        <Card
          title="Лендинг вебинара"
          status={<Chip tone="live">В работе</Chip>}
          caption="Обновлено 2 ч назад · 3/5"
        >
          <Steps total={5} done={3} tone="live" label="Шаги проекта" />
        </Card>
        <Card>
          <Stat label="Задач открыто" value="27" unit="/ 64" change={{ direction: "up", text: "12% за неделю" }} />
        </Card>
        <List aria-label="Разделы">
          <ListRow icon={SparkleIcon} title="Идеи для рассылки" caption="8 заметок" isNew selected={selected === "ideas"} onClick={() => setSelected("ideas")} />
          <ListRow icon={ImageIcon} title="Обложки курса" caption="14 файлов" selected={selected === "covers"} onClick={() => setSelected("covers")} />
          <ListRow icon={BellIcon} title="Напоминания агенту" count={3} />
        </List>
      </div>
      <DemoLine label="Счётчики">
        <StatGroup className="sc-wide">
          <Stat label="В работе" value="04" accent />
          <Stat label="Задач открыто" value="27" unit="/ 64" />
          <Stat label="Сделано за неделю" value="18" change={{ direction: "down", text: "3%" }} />
          <Stat label="Агент сэкономил" value="6,5" unit="ч" />
        </StatGroup>
      </DemoLine>
      <DemoLine label="Таблица">
        <div className="sc-wide">
          <Table aria-label="Проекты">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Проект</TableHeaderCell>
                <TableHeaderCell>Статус</TableHeaderCell>
                <TableHeaderCell>Прогресс</TableHeaderCell>
                <TableHeaderCell numeric>Задачи</TableHeaderCell>
                <TableHeaderCell numeric>Обновлён</TableHeaderCell>
                <TableHeaderCell><span className="yk-visually-hidden">Владелец</span></TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow selected>
                <TableCell strong>Лендинг вебинара</TableCell>
                <TableCell><Chip tone="live">В работе</Chip></TableCell>
                <TableCell><Steps total={5} done={3} tone="live" label="3 из 5" /></TableCell>
                <TableCell numeric>3/5</TableCell>
                <TableCell numeric>2 ч назад</TableCell>
                <TableCell><Avatar name="Юрий Курилов" size="sm" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell strong>Идеи для рассылки</TableCell>
                <TableCell><Chip>Черновик</Chip></TableCell>
                <TableCell><Steps total={5} done={1} label="1 из 5" /></TableCell>
                <TableCell numeric>1/5</TableCell>
                <TableCell numeric>вчера</TableCell>
                <TableCell><Avatar name="Анна Иванова" size="sm" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell strong>Марафон по ИИ — неделя 2</TableCell>
                <TableCell><Chip tone="success">Готово</Chip></TableCell>
                <TableCell><Steps total={5} done={5} label="5 из 5" /></TableCell>
                <TableCell numeric>5/5</TableCell>
                <TableCell numeric>12 окт</TableCell>
                <TableCell><Avatar name="Мария Ким" size="sm" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 7,
  title: "Карточки, списки, таблица",
  description: "Выбранная строка — тонкая полоска акцента слева и мягкая подсветка.",
  Demo: CardsDemo,
} satisfies ShowcaseSection;
