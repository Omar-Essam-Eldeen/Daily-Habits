import {
  Badge,
  Box,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconFlame } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber, localeFor } from '../i18n/translations';
import { dateOfDay, formatShortDate, todayDayNumber } from '../lib/dates';
import { HABITS, TOTAL_CHECKS, TOTAL_DAYS } from '../lib/habits';
import { habitMeta } from '../lib/habitMeta';
import {
  bestDay,
  currentStreak,
  habitCompletion,
  isChecked,
  overallPercent,
  percent,
  totalCompletion,
  weekCompletion,
} from '../lib/stats';
import { useCountUp } from '../hooks/useCountUp';
import { useAppData } from '../state/AppDataContext';

/**
 * Progress view (v2): animated overall completion, a weekly summary card,
 * and per-habit 3x7 tile heatmaps with per-habit icon/colour accents.
 * Tiles carry a tooltip (full date + state) and pop when toggled.
 * Tapping a tile toggles that day for that habit.
 */
export function HeatmapView() {
  const { data, toggleCheck } = useAppData();
  const { t, lang } = useLanguage();
  const locale = localeFor(lang);
  const today = todayDayNumber(data.startDate);
  const total = totalCompletion(data);
  const pct = overallPercent(data);
  const animatedPct = useCountUp(pct);
  const best = bestDay(data);

  return (
    <Stack gap="md">
      <Card withBorder padding="md" shadow="sm" className="rise-in">
        <Stack gap="xs">
          <Group justify="space-between" align="baseline">
            <Text fw={700} size="lg">
              {t('overallProgress')}
            </Text>
            <Text fw={700} size="xl" c="leaf">
              {formatNumber(animatedPct, lang)}%
            </Text>
          </Group>
          <Progress value={pct} color="leaf" size="lg" radius="xl" />
          <Text size="sm" c="dimmed">
            {formatNumber(total, lang)} {t('of')} {formatNumber(TOTAL_CHECKS, lang)}{' '}
            {t('checksLabel')}
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding="md" shadow="sm">
        <Stack gap="sm">
          <Text fw={700}>{t('weeklySummary')}</Text>
          {[0, 1, 2].map((week) => {
            const { done, total: weekTotal } = weekCompletion(data, week);
            const weekPct = percent(done, weekTotal);
            const firstDay = week * 7 + 1;
            const lastDay = Math.min(firstDay + 6, TOTAL_DAYS);
            return (
              <Stack key={week} gap={4}>
                <Group justify="space-between" align="baseline" wrap="nowrap">
                  <Text size="sm" fw={600}>
                    {t('week')} {formatNumber(week + 1, lang)}
                    <Text span c="dimmed" fw={400}>
                      {' '}
                      · {formatShortDate(dateOfDay(data.startDate, firstDay), locale)} –{' '}
                      {formatShortDate(dateOfDay(data.startDate, lastDay), locale)}
                    </Text>
                  </Text>
                  <Text size="sm" c="dimmed">
                    {formatNumber(done, lang)}/{formatNumber(weekTotal, lang)} ·{' '}
                    {formatNumber(weekPct, lang)}%
                  </Text>
                </Group>
                <Progress value={weekPct} color="leaf" size="md" radius="xl" />
              </Stack>
            );
          })}
          {best.done > 0 && (
            <Text size="sm" c="dimmed">
              {t('bestDay')}: {t('day')} {formatNumber(best.day, lang)} (
              {formatNumber(best.done, lang)} {t('of')} {formatNumber(HABITS.length, lang)})
            </Text>
          )}
        </Stack>
      </Card>

      <Text size="sm" c="dimmed">
        {t('heatmapHint')}
      </Text>

      <Stack gap="sm">
        {HABITS.map((habit, index) => {
          const done = habitCompletion(data, index);
          const habitPct = percent(done, TOTAL_DAYS);
          const streak = currentStreak(data, index, today);
          const meta = habitMeta(habit.id);
          const MetaIcon = meta.icon;
          return (
            <Card key={habit.id} withBorder padding="md">
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                    <Box
                      aria-hidden
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `var(--mantine-color-${meta.color}-light)`,
                        color: `var(--mantine-color-${meta.color}-7)`,
                      }}
                    >
                      <MetaIcon size={20} stroke={1.9} />
                    </Box>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text fw={600} lh={1.3}>
                        <Text span c="dimmed" fw={500}>
                          <bdi>{formatNumber(index + 1, lang)}.</bdi>
                        </Text>{' '}
                        {habit.title[lang]}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {formatNumber(done, lang)} {t('of')} {formatNumber(TOTAL_DAYS, lang)}{' '}
                        {t('completion')} · {formatNumber(habitPct, lang)}%
                      </Text>
                    </Stack>
                  </Group>
                  {streak > 0 && (
                    <Badge
                      color="orange"
                      variant="light"
                      leftSection={<IconFlame size={13} />}
                      title={t('streakLabel')}
                      style={{ flexShrink: 0 }}
                    >
                      {formatNumber(streak, lang)} {t('streak')}
                    </Badge>
                  )}
                </Group>

                <Progress value={habitPct} color={meta.color} size="sm" radius="xl" />

                <SimpleGrid cols={7} spacing={6}>
                  {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
                    const filled = isChecked(data, day, index);
                    const isToday = day === today;
                    const dateLabel = new Intl.DateTimeFormat(locale, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    }).format(dateOfDay(data.startDate, day));
                    return (
                      <Tooltip
                        key={day}
                        label={`${dateLabel} · ${t('day')} ${formatNumber(day, lang)} · ${filled ? t('tileDone') : t('tilePending')}`}
                        position="top"
                        withArrow
                        openDelay={350}
                        closeDelay={50}
                        events={{ hover: true, focus: true, touch: false }}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCheck(day, index)}
                          aria-pressed={filled}
                          aria-label={`${habit.title[lang]} — ${t('day')} ${day} — ${filled ? t('tileDone') : t('tilePending')}`}
                          className={filled ? 'tile-pop' : undefined}
                          style={{
                            height: 40,
                            minWidth: 0,
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            transition: 'background 180ms ease, border-color 180ms ease',
                            border: filled
                              ? '1px solid var(--mantine-color-leaf-6)'
                              : '1px solid var(--mantine-color-default-border)',
                            background: filled
                              ? 'var(--mantine-color-leaf-6)'
                              : 'var(--mantine-color-body)',
                            color: filled ? '#fff' : 'var(--mantine-color-dimmed)',
                            boxShadow: isToday
                              ? '0 0 0 2px var(--mantine-color-body), 0 0 0 4px var(--mantine-color-leaf-5)'
                              : undefined,
                          }}
                        >
                          {formatNumber(day, lang)}
                        </button>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
