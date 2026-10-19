import { ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber, localeFor } from '../i18n/translations';
import { dateOfDay, formatShortDate, todayDayNumber } from '../lib/dates';
import { TOTAL_DAYS } from '../lib/habits';
import { isDayComplete } from '../lib/stats';
import { useAppData } from '../state/AppDataContext';

interface DaySelectorProps {
  selectedDay: number;
  onSelect: (day: number) => void;
}

export function DaySelector({ selectedDay, onSelect }: DaySelectorProps) {
  const { data } = useAppData();
  const { t, lang } = useLanguage();
  const locale = localeFor(lang);
  const today = todayDayNumber(data.startDate);

  return (
    <Stack gap={6}>
      <Text size="sm" fw={600}>
        {t('selectDay')}
      </Text>
      <ScrollArea type="auto" scrollbarSize={6} offsetScrollbars={false}>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 4, width: 'max-content' }}>
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
            const selected = day === selectedDay;
            const complete = isDayComplete(data, day);
            return (
              <UnstyledButton
                key={day}
                onClick={() => onSelect(day)}
                aria-pressed={selected}
                style={{
                  minWidth: 58,
                  minHeight: 56,
                  padding: '6px 8px',
                  borderRadius: 14,
                  textAlign: 'center',
                  transition: 'background 180ms ease, box-shadow 180ms ease, transform 120ms ease',
                  border: selected
                    ? '1px solid var(--mantine-color-leaf-6)'
                    : '1px solid var(--mantine-color-default-border)',
                  background: selected
                    ? 'var(--mantine-color-leaf-6)'
                    : 'var(--mantine-color-body)',
                  color: selected ? '#fff' : undefined,
                  boxShadow: selected ? '0 6px 16px rgba(47, 158, 68, 0.35)' : undefined,
                }}
              >
                <Text size="lg" fw={700} lh={1.1} c={selected ? 'white' : undefined}>
                  {formatNumber(day, lang)}
                </Text>
                <Text
                  size="xs"
                  lh={1.2}
                  c={selected ? 'white' : 'dimmed'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {formatShortDate(dateOfDay(data.startDate, day), locale)}
                </Text>
                <Text size="xs" lh={1} h={14} c={selected ? 'white' : 'leaf'}>
                  {day === today ? '●' : complete ? '✓' : ''}
                </Text>
              </UnstyledButton>
            );
          })}
        </div>
      </ScrollArea>
    </Stack>
  );
}
