/**
 * The 10 habits, in the exact order of Mr. Magic's poster.
 * Arabic is transcribed faithfully from the poster; English is a faithful
 * translation. `title` is the habit name; `note` is the poster's sub-line.
 */
export interface Habit {
  id: string;
  title: { ar: string; en: string };
  note: { ar: string; en: string } | null;
}

export const TOTAL_DAYS = 21;
export const DEFAULT_START_DATE = '2026-10-18'; // Day 1 of the current run (Sun 2026-10-18); Day 21 = 2026-11-07.

export const HABITS: Habit[] = [
  {
    id: 'prayers',
    title: { ar: 'الفروض الخمسة', en: 'The five daily prayers' },
    note: { ar: 'وسنن ما بعد الصلاة', en: 'And the sunnahs after prayer' },
  },
  {
    id: 'morning-adhkar',
    title: { ar: 'أذكار الصباح', en: 'Morning adhkar' },
    note: null,
  },
  {
    id: 'quran-portion',
    title: { ar: 'الورد اليومي', en: "Daily Qur'an portion" },
    note: { ar: 'اقرأ لو حتى صفحة، اقرأ لو حتى آية', en: 'Even a page, even a verse' },
  },
  {
    id: 'night-prayer',
    title: { ar: 'قيام الليل', en: 'Night prayer' },
    note: { ar: 'ركعتين فقط', en: "Just 2 rak'ahs" },
  },
  {
    id: 'duha',
    title: { ar: 'صلاة الضحى', en: 'Duha prayer' },
    note: { ar: '٣٦٠ صدقة', en: '360 acts of charity' },
  },
  {
    id: 'salawat',
    title: { ar: 'الصلاة على النبي', en: 'Blessings on the Prophet' },
    note: { ar: '١٠٠ مرة فأكثر', en: '100+ times' },
  },
  {
    id: 'hawla',
    title: { ar: 'لا حول ولا قوة إلا بالله', en: 'La hawla wa la quwwata illa billah' },
    note: { ar: '١٠٠ مرة فأكثر', en: '100+ times' },
  },
  {
    id: 'baqiyat',
    title: { ar: 'الباقيات الصالحات', en: 'Al-Baqiyat al-Salihat' },
    note: {
      ar: 'سبحان الله، الحمد لله، الله أكبر، لا إله إلا الله',
      en: 'Subhan Allah, Alhamdulillah, Allahu Akbar, La ilaha illa Allah',
    },
  },
  {
    id: 'istighfar',
    title: { ar: 'ورد الاستغفار', en: 'Istighfar' },
    note: { ar: '١٠٠٠ مرة', en: '1000 times' },
  },
  {
    id: 'ikhlas',
    title: { ar: 'سورة الإخلاص', en: 'Surah Al-Ikhlas' },
    note: { ar: '٣ مرات، مع أذكار المساء', en: '3 times, with evening adhkar' },
  },
];

export const TOTAL_CHECKS = TOTAL_DAYS * HABITS.length; // 210
export const MILESTONE_DAYS = [7, 14, 21] as const;
