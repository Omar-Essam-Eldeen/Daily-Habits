import {
  IconBike,
  IconBook2,
  IconBolt,
  IconBrush,
  IconBuildingMosque,
  IconBulb,
  IconCoffee,
  IconCode,
  IconCoin,
  IconFeather,
  IconFlame,
  IconDroplet,
  IconHeart,
  IconLanguage,
  IconLeaf,
  IconMoonStars,
  IconMusic,
  IconPencil,
  IconPhoneOff,
  IconPlant,
  IconRun,
  IconSparkles,
  IconStar,
  IconSun,
  IconSwimming,
  IconWriting,
  type Icon,
} from '@tabler/icons-react';

/**
 * Preset icon set for custom habits — a curated slice of the same Tabler
 * set the core habits use, so customs look native to the app.
 */
export const CUSTOM_ICONS: Record<string, Icon> = {
  sparkles: IconSparkles,
  star: IconStar,
  heart: IconHeart,
  flame: IconFlame,
  bolt: IconBolt,
  sun: IconSun,
  moon: IconMoonStars,
  mosque: IconBuildingMosque,
  book: IconBook2,
  pencil: IconPencil,
  writing: IconWriting,
  language: IconLanguage,
  code: IconCode,
  music: IconMusic,
  art: IconBrush,
  idea: IconBulb,
  feather: IconFeather,
  plant: IconPlant,
  leaf: IconLeaf,
  water: IconDroplet,
  coffee: IconCoffee,
  run: IconRun,
  bike: IconBike,
  swim: IconSwimming,
  coin: IconCoin,
  'phone-off': IconPhoneOff,
};

export const CUSTOM_ICON_KEYS = Object.keys(CUSTOM_ICONS);

export function customIcon(key: string): Icon {
  return CUSTOM_ICONS[key] ?? IconSparkles;
}
