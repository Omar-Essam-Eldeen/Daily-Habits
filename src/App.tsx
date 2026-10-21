import { useEffect, useState } from 'react';
import { Container, Stack, Tabs, Text } from '@mantine/core';
import { IconChartBar, IconListCheck, IconSettings } from '@tabler/icons-react';
import { AppHeader } from './components/AppHeader';
import { HeatmapView } from './components/HeatmapView';
import { SettingsView } from './components/SettingsView';
import { TodayView } from './components/TodayView';
import { useLanguage } from './i18n/LanguageContext';
import { todayDayNumber } from './lib/dates';
import { TOTAL_DAYS } from './lib/habits';
import { useAppData } from './state/AppDataContext';

export default function App() {
  const { data } = useAppData();
  const { t } = useLanguage();

  // Open on today's day (computed from the start date, clamped 1..21).
  const [selectedDay, setSelectedDay] = useState<number>(() => todayDayNumber(data.startDate));

  // If the start date changes, re-anchor the selection to the new "today".
  useEffect(() => {
    setSelectedDay(todayDayNumber(data.startDate));
  }, [data.startDate]);

  useEffect(() => {
    setSelectedDay((d) => Math.min(TOTAL_DAYS, Math.max(1, d)));
  }, []);

  return (
    <>
      {/* v3.1 Cinematic Layers: drifting sunrise glow field behind the app
          (pure decoration — fixed, pointer-transparent, aria-hidden). */}
      <div className="cinematic-field" aria-hidden="true" />
      <Container size="sm" px="sm" py="md">
      <Stack gap="md">
        {/* v3.1.2 landmarks: exactly one banner, one main, one contentinfo —
            every piece of page content lives inside one of them (axe
            "landmark-one-main" / "region"). */}
        <header>
          <AppHeader />
        </header>

        <main>
        <Tabs defaultValue="today" color="leaf">
          <Tabs.List grow>
            <Tabs.Tab value="today" leftSection={<IconListCheck size={16} />}>
              {t('tabToday')}
            </Tabs.Tab>
            <Tabs.Tab value="progress" leftSection={<IconChartBar size={16} />}>
              {t('tabProgress')}
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              {t('tabSettings')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="today" pt="md">
            <TodayView selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          </Tabs.Panel>
          <Tabs.Panel value="progress" pt="md">
            <HeatmapView />
          </Tabs.Panel>
          <Tabs.Panel value="settings" pt="md">
            <SettingsView />
          </Tabs.Panel>
        </Tabs>
        </main>

        <footer>
          <Text size="xs" c="dimmed" ta="center" pb="sm">
            {t('footerPrivacy')}
          </Text>
        </footer>
      </Stack>
      </Container>
    </>
  );
}
