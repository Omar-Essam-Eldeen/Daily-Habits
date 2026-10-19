import {
  IconBolt,
  IconBook2,
  IconBuildingMosque,
  IconHeart,
  IconMoonStars,
  IconRepeat,
  IconSparkles,
  IconStar,
  IconSun,
  IconSunrise,
  type Icon,
} from '@tabler/icons-react';

/**
 * v2 polish: every habit gets a subtle icon + colour accent (Style A keeps
 * one primary accent — leaf — for heatmaps and checks; these colours show
 * up in the icon chips and per-habit progress bars only).
 */
export interface HabitMeta {
  icon: Icon;
  /** Mantine colour name used for the chip / progress accent. */
  color: string;
}

export const HABIT_META: Record<string, HabitMeta> = {
  prayers: { icon: IconBuildingMosque, color: 'leaf' },
  'morning-adhkar': { icon: IconSunrise, color: 'orange' },
  'quran-portion': { icon: IconBook2, color: 'indigo' },
  'night-prayer': { icon: IconMoonStars, color: 'violet' },
  duha: { icon: IconSun, color: 'yellow' },
  salawat: { icon: IconHeart, color: 'pink' },
  hawla: { icon: IconBolt, color: 'teal' },
  baqiyat: { icon: IconSparkles, color: 'grape' },
  istighfar: { icon: IconRepeat, color: 'cyan' },
  ikhlas: { icon: IconStar, color: 'blue' },
};

export function habitMeta(habitId: string): HabitMeta {
  return HABIT_META[habitId] ?? { icon: IconSparkles, color: 'leaf' };
}
