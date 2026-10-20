import {
  Box,
  Group,
  RingProgress,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber } from '../i18n/translations';
import { useCountUp } from '../hooks/useCountUp';
import { todayDayNumber } from '../lib/dates';
import { TOTAL_DAYS } from '../lib/habits';
import { overallPercent } from '../lib/stats';
import { useAppData } from '../state/AppDataContext';

export function AppHeader() {
  const { t, lang, setLang } = useLanguage();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { data } = useAppData();
  const today = todayDayNumber(data.startDate);
  const challengePct = overallPercent(data);
  const animatedChallengePct = useCountUp(challengePct);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <Box
            aria-hidden
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: 'var(--mantine-color-leaf-6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconCheck size={28} stroke={2.5} />
          </Box>
          <Stack gap={0}>
            <Title order={1} size="h3" lh={1.15}>
              {t('appTitle')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('appSubtitle')} · {t('day')} {formatNumber(today, lang)} {t('of')}{' '}
              {formatNumber(TOTAL_DAYS, lang)}
            </Text>
          </Stack>
          {/* v3: challenge progress ring — the whole 21 days at a glance. */}
          <Tooltip label={t('challengeRingLabel')} position="bottom" withArrow>
            <Box
              role="img"
              aria-label={`${t('challengeRingLabel')}: ${challengePct}%`}
              style={{ flexShrink: 0 }}
            >
              <RingProgress
                size={52}
                thickness={6}
                roundCaps
                sections={[{ value: challengePct, color: 'leaf' }]}
                label={
                  <Text ta="center" size="xs" fw={700}>
                    {formatNumber(animatedChallengePct, lang)}%
                  </Text>
                }
              />
            </Box>
          </Tooltip>
        </Group>

        <Group gap="xs" wrap="wrap">
          <SegmentedControl
            aria-label={t('language')}
            size="sm"
            value={lang}
            onChange={(value) => setLang(value === 'ar' ? 'ar' : 'en')}
            data={[
              { value: 'en', label: 'EN' },
              { value: 'ar', label: 'عربي' },
            ]}
          />
          <SegmentedControl
            aria-label={t('theme')}
            size="sm"
            value={colorScheme}
            onChange={(value) => setColorScheme(value as MantineColorScheme)}
            data={[
              {
                value: 'light',
                label: (
                  <span title={t('themeLight')}>
                    <IconSun size={16} style={{ display: 'block' }} />
                  </span>
                ),
              },
              {
                value: 'dark',
                label: (
                  <span title={t('themeDark')}>
                    <IconMoon size={16} style={{ display: 'block' }} />
                  </span>
                ),
              },
              {
                value: 'auto',
                label: (
                  <span title={t('themeAuto')}>
                    <IconDeviceDesktop size={16} style={{ display: 'block' }} />
                  </span>
                ),
              },
            ]}
          />
        </Group>
      </Group>
    </Stack>
  );
}
