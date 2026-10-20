import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  RingProgress,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from '@mantine/core';
import { IconInfoCircle, IconSend } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber, localeFor, type TranslationKey } from '../i18n/translations';
import {
  dateOfDay,
  formatDayLabel,
  formatISODate,
  isWithinChallenge,
  todayDayNumber,
} from '../lib/dates';
import { HABITS, MILESTONE_DAYS, TOTAL_DAYS } from '../lib/habits';
import { markSubmittedToday } from '../lib/push';
import { dayCompletion, isChecked, isDayComplete, submissionFor } from '../lib/stats';
import { useCountUp } from '../hooks/useCountUp';
import { useAppData } from '../state/AppDataContext';
import { Celebration } from './Celebration';
import { CustomHabitsSection } from './CustomHabitsSection';
import { HabitArt } from './HabitArt';
import { DaySelector } from './DaySelector';
import { DaySummaryCard } from './DaySummaryCard';
import { MilestoneBanner, ReminderBanner } from './banners';

function greetingKey(hour: number): TranslationKey {
  if (hour < 12) return 'greetingMorning';
  if (hour < 18) return 'greetingAfternoon';
  return 'greetingEvening';
}

function greetLineKey(done: number, total: number): TranslationKey {
  if (done === 0) return 'greetStart';
  if (done >= total) return 'greetDone';
  if (done >= total - 3) return 'greetAlmost';
  return 'greetProgress';
}

interface TodayViewProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export function TodayView({ selectedDay, onSelectDay }: TodayViewProps) {
  const { data, toggleCheck, setNote, submitDay } = useAppData();
  const { t, lang } = useLanguage();
  const locale = localeFor(lang);

  const today = todayDayNumber(data.startDate);
  const viewingToday = selectedDay === today && isWithinChallenge(data.startDate);
  const done = dayCompletion(data, selectedDay);
  const dayPct = Math.round((done / HABITS.length) * 100);
  const animatedDayPct = useCountUp(dayPct);
  const note = data.notes[String(selectedDay)] ?? '';

  // v3 daily submit (B1): a submitted day is soft-locked — visibly marked,
  // ticks paused — until it is re-opened from its summary card.
  const submission = submissionFor(data, selectedDay);
  const locked = submission !== null;
  const canSubmit = !locked && selectedDay <= today;
  const [submitBurst, setSubmitBurst] = useState(false);

  const handleSubmit = () => {
    submitDay(selectedDay);
    markSubmittedToday(); // anonymous "done today" signal — push skips tonight
    if (isDayComplete(data, selectedDay)) {
      setSubmitBurst(true);
      window.setTimeout(() => setSubmitBurst(false), 3000);
    }
  };

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
      {submitBurst && <Celebration pieces={44} />}
      <Text size="md" fw={600} aria-live="polite">
        {t(greetingKey(now.getHours()))} —{' '}
        <Text span fw={400} c="dimmed">
          {t(greetLineKey(done, HABITS.length))}
        </Text>
      </Text>
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
          <Box className="ring-glow" style={{ flexShrink: 0 }}>
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
          </Box>
        </Group>
      </Card>

      <Stack gap="xs">
        {HABITS.map((habit, index) => {
          const checked = isChecked(data, selectedDay, index);
          return (
            <UnstyledButton
              key={habit.id}
              onClick={() => !locked && toggleCheck(selectedDay, index)}
              aria-pressed={checked}
              disabled={locked}
              className="glass-surface glass-row lift"
              style={{
                width: '100%',
                minHeight: 60,
                padding: '10px 14px',
                borderRadius: 18,
                opacity: locked ? 0.75 : 1,
                border: '1px solid var(--glass-border)',
                background: checked ? 'var(--glass-row-bg-checked)' : 'var(--glass-row-bg)',
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
                {/* v3.1: original per-habit artwork (decorative; the habit
                    name text beside it is the label). */}
                <HabitArt habitId={habit.id} size={42} />
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

      <CustomHabitsSection selectedDay={selectedDay} locked={locked} />

      <Textarea
        label={t('noteLabel')}
        placeholder={t('notePlaceholder')}
        value={note}
        onChange={(event) => setNote(selectedDay, event.currentTarget.value)}
        autosize
        minRows={2}
        maxRows={6}
        disabled={locked}
      />

      {submission ? (
        <DaySummaryCard day={selectedDay} submission={submission} />
      ) : canSubmit ? (
        <Button
          size="lg"
          radius="xl"
          fullWidth
          variant="gradient"
          gradient={{ from: 'leaf.8', to: 'leaf.7', deg: 90 }}
          leftSection={<IconSend size={19} />}
          onClick={handleSubmit}
          style={{
            boxShadow:
              '0 12px 28px rgba(30, 108, 48, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
          }}
        >
          {viewingToday ? t('submitDay') : t('submitDayFor')}
        </Button>
      ) : null}

          <Text size="xs" c="dimmed" ta="center">
            {formatISODate(dateOfDay(data.startDate, selectedDay))} · {t('endDate')}:{' '}
            {formatDayLabel(end, locale)}
          </Text>
        </Stack>
      </div>
    </Stack>
  );
}
