import { useEffect, useRef, useState } from 'react';
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
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber } from '../i18n/translations';
import { useCountUp } from '../hooks/useCountUp';
import { todayDayNumber } from '../lib/dates';
import { TOTAL_DAYS } from '../lib/habits';
import { overallPercent } from '../lib/stats';
import { useAppData } from '../state/AppDataContext';
import { LogoMark } from './Logo';

export function AppHeader() {
  const { t, lang, setLang } = useLanguage();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { data } = useAppData();
  const today = todayDayNumber(data.startDate);
  const challengePct = overallPercent(data);
  const animatedChallengePct = useCountUp(challengePct);

  // v3.1: the ring gives one gentle glow pulse when progress actually
  // changes — never a constant animation. (Pure presentation state.)
  const [ringPulsing, setRingPulsing] = useState(false);
  const prevChallengePct = useRef(challengePct);
  useEffect(() => {
    if (prevChallengePct.current === challengePct) return;
    prevChallengePct.current = challengePct;
    setRingPulsing(true);
    const id = window.setTimeout(() => setRingPulsing(false), 950);
    return () => window.clearTimeout(id);
  }, [challengePct]);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          {/* v3.1 identity: logo mark + wordmark lockup. */}
          <LogoMark size={46} />
          <Stack gap={0}>
            <Title order={1} size="h3" lh={1.15}>
              {t('appTitle')}
            </Title>
            <Text size="sm" c="dimmed">
              {t('appSubtitle')} · {t('day')} {formatNumber(today, lang)} {t('of')}{' '}
              {formatNumber(TOTAL_DAYS, lang)}
            </Text>
          </Stack>
          {/* v3: challenge progress ring — the whole 21 days at a glance.
              v3.1: sunrise-gradient stroke + warm glow (see .ring-glow). */}
          <Tooltip label={t('challengeRingLabel')} position="bottom" withArrow>
            <Box
              role="img"
              aria-label={`${t('challengeRingLabel')}: ${challengePct}%`}
              className={`ring-glow${ringPulsing ? ' pulsing' : ''}`}
              style={{ flexShrink: 0 }}
            >
              {/* Gradient stops for the ring stroke (referenced from CSS). */}
              <svg aria-hidden width={0} height={0} style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="habits-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#57b43c" />
                    <stop offset="55%" stopColor="#2f9e44" />
                    <stop offset="100%" stopColor="#ffb300" />
                  </linearGradient>
                </defs>
              </svg>
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
