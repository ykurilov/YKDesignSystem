import { CheckIcon, HouseIcon, PlusIcon, SparkleIcon, StopIcon } from "@phosphor-icons/react";
import { Avatar, Chip, Icon, MonoNum, NewDot, Sphere, Steps, Tag } from "@ykurilov/ds-react";
import { useState } from "react";
import { DemoLine, DemoStack } from "../layout/Demo.js";
import type { ShowcaseSection } from "../layout/sectionRegistry.js";

function TagsDemo() {
  const [tags, setTags] = useState(["Вебинар", "Рассылка"]);
  return (
    <>
      {tags.map((tag) => (
        <Tag key={tag} onRemove={() => setTags(tags.filter((t) => t !== tag))}>{tag}</Tag>
      ))}
      <Tag icon={PlusIcon} onClick={() => setTags([...tags, `Тег ${tags.length + 1}`])}>тег</Tag>
    </>
  );
}

function MarksDemo() {
  return (
    <DemoStack>
      <DemoLine label="Статусы">
        <Chip>Черновик</Chip>
        <Chip tone="live">В работе</Chip>
        <Chip tone="success" icon={CheckIcon}>Готово</Chip>
        <Chip tone="danger">Ошибка</Chip>
        <Chip tone="solid">Новое</Chip>
      </DemoLine>
      <DemoLine label="Теги">
        <TagsDemo />
      </DemoLine>
      <DemoLine label="Аватары">
        <Avatar name="Юрий Курилов" />
        <Avatar name="Мария Ким" hasNew />
        <Avatar name="Агент" agent />
        <Avatar name="Анна Иванова" size="sm" />
        <Avatar name="Агент" agent size="sm" />
      </DemoLine>
      <DemoLine label="Прогресс">
        <Steps total={5} done={2} label="Шаги проекта" />
        <Steps total={5} done={3} tone="live" label="Агент собирает план" />
        <MonoNum className="sc-muted-num">3/5</MonoNum>
      </DemoLine>
      <DemoLine label="Сфера">
        <Sphere size={12} />
        <Sphere size={16} />
        <Sphere size={24} />
        <Sphere size={48} />
        <Sphere size={96} label="Агент работает" />
      </DemoLine>
      <DemoLine label="Точка">
        <NewDot label="Есть новое" />
        <span className="sc-inline">Идеи для рассылки <NewDot /></span>
      </DemoLine>
      <DemoLine label="Значки">
        <Icon icon={SparkleIcon} />
        <Icon icon={HouseIcon} />
        <Icon icon={HouseIcon} weight="fill" />
        <Icon icon={StopIcon} weight="fill" size={20} />
        <Icon icon={SparkleIcon} size={24} />
      </DemoLine>
    </DemoStack>
  );
}

export default {
  order: 6,
  title: "Метки и приметы",
  description: "Сфера — «агент работает». Точка — «есть новое». Залитый значок — только активный пункт и «Стоп».",
  Demo: MarksDemo,
} satisfies ShowcaseSection;
