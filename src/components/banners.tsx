import { useEffect, useState } from 'react';
import { Alert } from '@mantine/core';
import { IconBell, IconTrophy } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { isWithinChallenge, todayDayNumber, todayISO } from '../lib/dates';
import { HABITS, MILESTONE_DAYS } from '../lib/habits';
import { dayCompletion, isDayComplete } from '../lib/stats';
import { useAppData } from '../state/AppDataContext';
import type { TranslationKey } from '../i18n/translations';

const MILESTONE_KEYS: Record<number, TranslationKey> = {
  7: 'milestone7',
  14: 'milestone14',
  21: 'milestone21',
};

/**
 * Celebration banner for a milestone day. Rule (documented in README):
 * when the viewed day is day 7, 14 or 21 AND all 10 habits are ticked for
 * that day, the milestone counts as earned and this banner celebrates it.
 */
export function MilestoneBanner({ day }: { day: number }) {
  const { data } = useAppData();
  const { t } = useLanguage();
  if (!(MILESTONE_DAYS as readonly number[]).includes(day)) return null;
  if (!isDayComplete(data, day)) return null;
  const key = MILESTONE_KEYS[day];
  if (!key) return null;
  return (
    <Alert
      color="leaf"
      variant="light"
      icon={<IconTrophy size={18} />}
      title={t('milestoneBadge')}
      className="milestone-banner"
    >
      {t(key)}
    </Alert>
  );
}

/**
 * In-app reminder (no push notifications): when a reminder time is set and
 * it has passed today while today's habits are incomplete, show a gentle
 * banner. Dismissing hides it for the rest of the day (per app session).
 */
export function ReminderBanner() {
  const { data } = useAppData();
  const { t } = useLanguage();
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [due, setDue] = useState(false);

  const reminderTime = data.settings.reminderTime;

  useEffect(() => {
    if (!reminderTime) {
      setDue(false);
      return;
    }
    const check = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = todayDayNumber(data.startDate);
      const incomplete =
        isWithinChallenge(data.startDate) && dayCompletion(data, today) < HABITS.length;
      setDue(hhmm >= reminderTime && incomplete);
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [reminderTime, data]);

  if (!reminderTime || !due || dismissedFor === todayISO()) return null;

  return (
    <Alert
      color="yellow"
      variant="light"
      icon={<IconBell size={18} />}
      title={t('reminderTitle')}
      withCloseButton
      closeButtonLabel={t('reminderDismiss')}
      onClose={() => setDismissedFor(todayISO())}
    >
      {t('reminderBody')}
    </Alert>
  );
}
