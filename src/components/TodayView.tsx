import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Card,
  Checkbox,
  Group,
  RingProgress,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber, localeFor } from '../i18n/translations';
import {
  dateOfDay,
  formatDayLabel,
  formatISODate,
  isWithinChallenge,
  todayDayNumber,
} from '../lib/dates';
import { HABITS, MILESTONE_DAYS, TOTAL_DAYS } from '../lib/habits';
import { habitMeta } from '../lib/habitMeta';
import { dayCompletion, isChecked, isDayComplete } from '../lib/stats';
import { useCountUp } from '../hooks/useCountUp';
import { useAppData } from '../state/AppDataContext';
import { Celebration } from './Celebration';
import { DaySelector } from './DaySelector';
import { MilestoneBanner, ReminderBanner } from './banners';

interface TodayViewProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export function TodayView({ selectedDay, onSelectDay }: TodayViewProps) {
  const { data, toggleCheck, setNote } = useAppData();
  const { t, lang } = useLanguage();
  const locale = localeFor(lang);

  const today = todayDayNumber(data.startDate);
  const viewingToday = selectedDay === today && isWithinChallenge(data.startDate);
  const done = dayCompletion(data, selectedDay);
  const dayPct = Math.round((done / HABITS.length) * 100);
  const animatedDayPct = useCountUp(dayPct);
  const note = data.notes[String(selectedDay)] ?? '';

  // Milestone celebration moment: when the viewed day is a milestone day and
  // it is (or becomes) fully ticked, burst confetti once for ~2.8s.
  const milestoneDone =
    (MILESTONE_DAYS as readonly number[]).includes(selectedDay) && isDayComplete(data, selectedDay);
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    if (!milestoneDone) return;
    setCelebrating(true);
    const id = window.setTimeout(() => setCelebrating(false), 2800);
    return () => window.clearTimeout(id);
  }, [milestoneDone, selectedDay]);

  const now = new Date();
  const start = dateOfDay(data.startDate, 1);
  const end = dateOfDay(data.startDate, TOTAL_DAYS);
  const beforeStart = now < start;
  const afterEnd = now > end;

  return (
    <Stack gap="md">
      {celebrating && <Celebration />}
      <DaySelector selectedDay={selectedDay} onSelect={onSelectDay} />

      <div key={selectedDay} className="day-enter">
        <Stack gap="md">

      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text fw={700} size="lg">
            {t('day')} {formatNumber(selectedDay, lang)} {t('of')} {formatNumber(TOTAL_DAYS, lang)}
          </Text>
          <Text size="sm" c="dimmed">
            {formatDayLabel(dateOfDay(data.startDate, selectedDay), locale)}
          </Text>
        </Stack>
        {viewingToday && <Badge color="leaf">{t('today')}</Badge>}
      </Group>

      {beforeStart && (
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
          {t('beforeStart')}
        </Alert>
      )}
      {afterEnd && !beforeStart && (
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
          {t('afterEnd')}
        </Alert>
      )}

      {viewingToday && <ReminderBanner />}
      <MilestoneBanner day={selectedDay} />

      <Card withBorder padding="md">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text fw={600}>{t('habitsForDay')}</Text>
            <Text size="sm" c="dimmed">
              {formatNumber(done, lang)} {t('of')} {formatNumber(HABITS.length, lang)}{' '}
              {t('dayProgress')}
            </Text>
            {done === HABITS.length && (
              <Text size="sm" c="leaf" fw={600}>
                {t('dayComplete')}
              </Text>
            )}
          </Stack>
          <RingProgress
            size={76}
            thickness={8}
            roundCaps
            sections={[{ value: dayPct, color: 'leaf' }]}
            label={
              <Text ta="center" size="sm" fw={700}>
                {formatNumber(animatedDayPct, lang)}%
              </Text>
            }
          />
        </Group>
      </Card>

      <Stack gap="xs">
        {HABITS.map((habit, index) => {
          const checked = isChecked(data, selectedDay, index);
          const meta = habitMeta(habit.id);
          const MetaIcon = meta.icon;
          return (
            <UnstyledButton
              key={habit.id}
              onClick={() => toggleCheck(selectedDay, index)}
              aria-pressed={checked}
              style={{
                width: '100%',
                minHeight: 60,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid var(--mantine-color-default-border)',
                boxShadow: 'var(--mantine-shadow-xs)',
                transition: 'background 200ms ease, border-color 200ms ease',
                background: checked
                  ? 'var(--mantine-color-leaf-light)'
                  : 'var(--mantine-color-body)',
              }}
            >
              <Group wrap="nowrap" gap="sm" align="center">
                <span key={String(checked)} className={checked ? 'check-pop' : undefined}>
                  <Checkbox
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    size="lg"
                    radius="md"
                    color="leaf"
                    style={{ pointerEvents: 'none' }}
                  />
                </span>
                <Box
                  aria-hidden
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `var(--mantine-color-${meta.color}-light)`,
                    color: `var(--mantine-color-${meta.color}-7)`,
                  }}
                >
                  <MetaIcon size={21} stroke={1.9} />
                </Box>
                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} lh={1.3} td={checked ? 'line-through' : undefined}>
                    <Text span c="dimmed" fw={500}>
                      <bdi>{formatNumber(index + 1, lang)}.</bdi>
                    </Text>{' '}
                    {habit.title[lang]}
                  </Text>
                  {habit.note && (
                    <Text size="sm" c="dimmed" lh={1.35}>
                      {habit.note[lang]}
                    </Text>
                  )}
                </Stack>
              </Group>
            </UnstyledButton>
          );
        })}
      </Stack>

      <Textarea
        label={t('noteLabel')}
        placeholder={t('notePlaceholder')}
        value={note}
        onChange={(event) => setNote(selectedDay, event.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={6}
      />

          <Text size="xs" c="dimmed" ta="center">
            {formatISODate(dateOfDay(data.startDate, selectedDay))} · {t('endDate')}:{' '}
            {formatDayLabel(end, locale)}
          </Text>
        </Stack>
      </div>
    </Stack>
  );
}
