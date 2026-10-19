import type { Lang } from '../lib/storage';

/**
 * UI string dictionary. English is the primary language; Arabic is a full
 * translation. Habit names/notes live in src/lib/habits.ts (bilingual there).
 */
export const en = {
  appTitle: '21 Habits',
  appSubtitle: '21-day challenge',
  tabToday: 'Today',
  tabProgress: 'Progress',
  tabSettings: 'Settings',
  day: 'Day',
  of: 'of',
  today: 'Today',
  dayComplete: 'Day complete — well done!',
  dayProgress: 'done today',
  habitsForDay: "Today's habits",
  noteLabel: 'Note for this day',
  notePlaceholder: 'How did today go? (saved on this device)',
  overallProgress: 'Overall progress',
  ofChecks: 'of',
  checksLabel: 'habits ticked',
  perHabit: 'Per habit',
  streak: 'day streak',
  streakLabel: 'Current streak',
  completion: 'completed',
  heatmapHint: 'Tap any tile to tick or untick that day.',
  milestone7: 'One week complete! Day 7 is fully done — the first milestone is yours.',
  milestone14: 'Two weeks complete! Day 14 is fully done — halfway is behind you.',
  milestone21: 'Challenge complete! Day 21 is fully done. 21 days, 10 habits — you did it.',
  reminderTitle: 'Gentle reminder',
  reminderBody: "Your reminder time has passed and today's habits aren't finished yet. A little progress still counts.",
  reminderDismiss: 'Dismiss',
  settingsTitle: 'Settings',
  startDateLabel: 'Challenge start date (Day 1)',
  startDateHelp: 'Day 21 is 20 days after the start date. Changing this keeps your ticks — they belong to day numbers, not dates.',
  reminderLabel: 'Daily reminder time (in-app)',
  reminderHelp:
    'While the app is open, if this time passes and today is incomplete you will see a gentle banner. No push notifications in this version.',
  reminderOff: 'Off',
  backupTitle: 'Backup',
  exportLabel: 'Export backup (JSON)',
  importLabel: 'Import backup',
  importConfirmTitle: 'Replace all data with this backup?',
  importConfirmBody:
    'The file looks like a valid 21 Habits backup. Importing will replace your current start date, ticks, notes and settings. This cannot be undone.',
  importInvalid: 'That file is not a valid 21 Habits backup.',
  importDone: 'Backup imported.',
  cancel: 'Cancel',
  replace: 'Replace my data',
  resetLabel: 'Reset all ticks & notes',
  resetConfirmTitle: 'Reset everything?',
  resetConfirmBody:
    'All ticks and day notes will be cleared and the start date returns to the default. Your language and reminder settings are kept. Consider exporting a backup first.',
  resetDone: 'Everything was reset.',
  reset: 'Reset',
  language: 'Language',
  theme: 'Appearance',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeAuto: 'Auto',
  footerPrivacy:
    'Your data never leaves this device: ticks, notes and settings are stored only in this browser (localStorage). No account, no uploads, no tracking.',
  endDate: 'Day 21',
  beforeStart: 'Your challenge has not started yet — this is Day 1, ready when you are.',
  afterEnd: 'The 21 days are over. You can still backfill or review any day, or start a new run from Settings.',
  selectDay: 'Choose a day',
  milestoneBadge: 'Milestone',
  prefsTitle: 'Preferences',
  challengeTitle: 'Challenge',
  dangerTitle: 'Danger zone',
  weeklySummary: 'Weekly summary',
  week: 'Week',
  bestDay: 'Best day',
  tileDone: 'Done',
  tilePending: 'Not yet',
};

export type TranslationKey = keyof typeof en;

export const ar: Record<TranslationKey, string> = {
  appTitle: 'عادات ٢١',
  appSubtitle: 'تحدي ٢١ يوم',
  tabToday: 'اليوم',
  tabProgress: 'التقدم',
  tabSettings: 'الإعدادات',
  day: 'اليوم',
  of: 'من',
  today: 'اليوم الحالي',
  dayComplete: 'أكملت اليوم — أحسنت!',
  dayProgress: 'أُنجز اليوم',
  habitsForDay: 'عادات هذا اليوم',
  noteLabel: 'ملاحظة هذا اليوم',
  notePlaceholder: 'كيف كان يومك؟ (تُحفظ على هذا الجهاز)',
  overallProgress: 'التقدم الكلي',
  ofChecks: 'من',
  checksLabel: 'عادة تم إنجازها',
  perHabit: 'حسب العادة',
  streak: 'يوم متتالٍ',
  streakLabel: 'السلسلة الحالية',
  completion: 'أُنجز',
  heatmapHint: 'اضغط أي مربع لتحديده أو إلغاء تحديده لذلك اليوم.',
  milestone7: 'أسبوع كامل! أنجزت اليوم السابع بالكامل — أول إنجاز مرحلي لك.',
  milestone14: 'أسبوعان كاملان! أنجزت اليوم الرابع عشر بالكامل — تجاوزت المنتصف.',
  milestone21: 'أكملت التحدي! أنجزت اليوم الحادي والعشرين بالكامل. ٢١ يومًا، ١٠ عادات — لقد فعلتها.',
  reminderTitle: 'تذكير لطيف',
  reminderBody: 'مرّ وقت التذكير وعادات اليوم لم تكتمل بعد. أي تقدم بسيط يُحتسب.',
  reminderDismiss: 'إخفاء',
  settingsTitle: 'الإعدادات',
  startDateLabel: 'تاريخ بدء التحدي (اليوم الأول)',
  startDateHelp: 'اليوم ٢١ يأتي بعد ٢٠ يومًا من تاريخ البدء. تغيير التاريخ لا يمسح علاماتك — فهي مرتبطة بأرقام الأيام لا بالتواريخ.',
  reminderLabel: 'وقت التذكير اليومي (داخل التطبيق)',
  reminderHelp:
    'أثناء فتح التطبيق، إذا مرّ هذا الوقت ولم تكتمل عادات اليوم، سترى تنبيهًا لطيفًا. لا توجد إشعارات فورية في هذا الإصدار.',
  reminderOff: 'إيقاف',
  backupTitle: 'النسخ الاحتياطي',
  exportLabel: 'تصدير نسخة احتياطية (JSON)',
  importLabel: 'استيراد نسخة احتياطية',
  importConfirmTitle: 'استبدال كل البيانات بهذه النسخة؟',
  importConfirmBody:
    'يبدو أن الملف نسخة احتياطية صحيحة لتطبيق عادات ٢١. الاستيراد سيستبدل تاريخ البدء والعلامات والملاحظات والإعدادات الحالية. لا يمكن التراجع عن هذا.',
  importInvalid: 'هذا الملف ليس نسخة احتياطية صحيحة.',
  importDone: 'تم استيراد النسخة الاحتياطية.',
  cancel: 'إلغاء',
  replace: 'استبدال بياناتي',
  resetLabel: 'مسح كل العلامات والملاحظات',
  resetConfirmTitle: 'مسح كل شيء؟',
  resetConfirmBody:
    'ستُمسح كل العلامات وملاحظات الأيام، وسيعود تاريخ البدء إلى القيمة الافتراضية. ستبقى اللغة وإعدادات التذكير كما هي. فكّر في تصدير نسخة احتياطية أولًا.',
  resetDone: 'تمت إعادة التعيين.',
  reset: 'مسح',
  language: 'اللغة',
  theme: 'المظهر',
  themeLight: 'فاتح',
  themeDark: 'داكن',
  themeAuto: 'تلقائي',
  footerPrivacy:
    'بياناتك لا تغادر هذا الجهاز أبدًا: العلامات والملاحظات والإعدادات تُحفظ فقط في هذا المتصفح (localStorage). لا حساب، لا رفع، لا تتبع.',
  endDate: 'اليوم ٢١',
  beforeStart: 'لم يبدأ تحديك بعد — هذا هو اليوم الأول، جاهز متى ما بدأت.',
  afterEnd: 'انتهت الأيام الـ٢١. ما زال بإمكانك إكمال أو مراجعة أي يوم، أو بدء جولة جديدة من الإعدادات.',
  selectDay: 'اختر يومًا',
  milestoneBadge: 'إنجاز مرحلي',
  prefsTitle: 'التفضيلات',
  challengeTitle: 'التحدي',
  dangerTitle: 'منطقة الخطر',
  weeklySummary: 'ملخص الأسابيع',
  week: 'الأسبوع',
  bestDay: 'أفضل يوم',
  tileDone: 'تم',
  tilePending: 'ليس بعد',
};

export const translations: Record<Lang, Record<TranslationKey, string>> = { en, ar };

/** BCP-47 locale used for dates and numbers per language. */
export function localeFor(lang: Lang): string {
  return lang === 'ar' ? 'ar-EG' : 'en-GB';
}

/** Localised digits/numbers (Arabic uses Arabic-Indic digits via ar-EG). */
export function formatNumber(value: number, lang: Lang): string {
  return new Intl.NumberFormat(localeFor(lang)).format(value);
}
