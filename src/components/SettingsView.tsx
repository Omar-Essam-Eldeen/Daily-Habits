import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  FileButton,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCheck,
  IconDeviceDesktop,
  IconDownload,
  IconInfoCircle,
  IconMoon,
  IconSun,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { dateOfDay, formatDayLabel, todayISO } from '../lib/dates';
import { localeFor } from '../i18n/translations';
import { TOTAL_DAYS } from '../lib/habits';
import { sanitizeAppData, type AppData } from '../lib/storage';
import { useAppData } from '../state/AppDataContext';

/**
 * Settings (v2): grouped into Preferences (language + appearance),
 * Challenge (start date), Reminder, Backup, and a Danger zone (reset).
 * Import keeps v1's validate → confirm → replace flow.
 */
export function SettingsView() {
  const { data, setStartDate, setReminderTime, replaceAll, resetProgress } = useAppData();
  const { t, lang, setLang } = useLanguage();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const locale = localeFor(lang);

  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [resetOpened, resetModal] = useDisclosure(false);
  const resetFileRef = useRef<() => void>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-backup-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File | null) => {
    resetFileRef.current?.();
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const clean = sanitizeAppData(parsed);
      if (!clean) {
        setStatus({ kind: 'err', text: t('importInvalid') });
        return;
      }
      setStatus(null);
      setPendingImport(clean); // Ask for confirmation before replacing anything.
    } catch {
      setStatus({ kind: 'err', text: t('importInvalid') });
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    replaceAll(pendingImport);
    setPendingImport(null);
    setStatus({ kind: 'ok', text: t('importDone') });
  };

  const confirmReset = () => {
    resetProgress();
    resetModal.close();
    setStatus({ kind: 'ok', text: t('resetDone') });
  };

  return (
    <Stack gap="md">
      <Card withBorder padding="md">
        <Stack gap="md">
          <Text fw={700}>{t('prefsTitle')}</Text>
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {t('language')}
            </Text>
            <SegmentedControl
              aria-label={t('language')}
              fullWidth
              value={lang}
              onChange={(value) => setLang(value === 'ar' ? 'ar' : 'en')}
              data={[
                { value: 'en', label: 'English' },
                { value: 'ar', label: 'العربية' },
              ]}
            />
          </Stack>
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {t('theme')}
            </Text>
            <SegmentedControl
              aria-label={t('theme')}
              fullWidth
              value={colorScheme}
              onChange={(value) => setColorScheme(value as MantineColorScheme)}
              data={[
                {
                  value: 'light',
                  label: (
                    <span
                      title={t('themeLight')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconSun size={16} /> {t('themeLight')}
                    </span>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <span
                      title={t('themeDark')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconMoon size={16} /> {t('themeDark')}
                    </span>
                  ),
                },
                {
                  value: 'auto',
                  label: (
                    <span
                      title={t('themeAuto')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconDeviceDesktop size={16} /> {t('themeAuto')}
                    </span>
                  ),
                },
              ]}
            />
          </Stack>
        </Stack>
      </Card>

      <Card withBorder padding="md">
        <Stack gap="sm">
          <Text fw={700}>{t('challengeTitle')}</Text>
          <TextInput
            type="date"
            label={t('startDateLabel')}
            description={t('startDateHelp')}
            value={data.startDate}
            onChange={(event) => {
              const v = event.currentTarget.value;
              if (v) setStartDate(v);
            }}
          />
          <Text size="sm" c="dimmed">
            {t('endDate')}: {formatDayLabel(dateOfDay(data.startDate, TOTAL_DAYS), locale)}
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding="md">
        <Stack gap="sm">
          <Text fw={700}>{t('reminderTitle')}</Text>
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              type="time"
              label={t('reminderLabel')}
              value={data.settings.reminderTime ?? ''}
              onChange={(event) => {
                const v = event.currentTarget.value;
                setReminderTime(v ? v : null);
              }}
              style={{ flex: 1, minWidth: 160 }}
            />
            {data.settings.reminderTime && (
              <Button variant="subtle" color="gray" onClick={() => setReminderTime(null)}>
                {t('reminderOff')}
              </Button>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {t('reminderHelp')}
          </Text>
        </Stack>
      </Card>

      <Card withBorder padding="md">
        <Stack gap="sm">
          <Text fw={700}>{t('backupTitle')}</Text>
          <Group wrap="wrap">
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              variant="light"
              color="leaf"
            >
              {t('exportLabel')}
            </Button>
            <FileButton
              onChange={(file) => void handleImportFile(file)}
              accept="application/json,.json"
              resetRef={resetFileRef}
            >
              {(props) => (
                <Button {...props} leftSection={<IconUpload size={16} />} variant="light" color="leaf">
                  {t('importLabel')}
                </Button>
              )}
            </FileButton>
          </Group>
          {status && (
            <Alert
              color={status.kind === 'ok' ? 'leaf' : 'red'}
              variant="light"
              icon={status.kind === 'ok' ? <IconCheck size={16} /> : <IconX size={16} />}
            >
              {status.text}
            </Alert>
          )}
        </Stack>
      </Card>

      <Card withBorder padding="md" style={{ borderColor: 'var(--mantine-color-red-3)' }}>
        <Stack gap="sm">
          <Text fw={700} c="red">
            {t('dangerTitle')}
          </Text>
          <Group>
            <Button
              leftSection={<IconTrash size={16} />}
              onClick={resetModal.open}
              variant="light"
              color="red"
            >
              {t('resetLabel')}
            </Button>
          </Group>
        </Stack>
      </Card>

      <Alert color="gray" variant="light" icon={<IconInfoCircle size={16} />}>
        {t('footerPrivacy')}
      </Alert>

      {/* Import confirmation */}
      <Modal
        opened={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        title={t('importConfirmTitle')}
        centered
      >
        <Stack>
          <Text size="sm">{t('importConfirmBody')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPendingImport(null)}>
              {t('cancel')}
            </Button>
            <Button color="leaf" onClick={confirmImport}>
              {t('replace')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reset confirmation */}
      <Modal opened={resetOpened} onClose={resetModal.close} title={t('resetConfirmTitle')} centered>
        <Stack>
          <Text size="sm">{t('resetConfirmBody')}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={resetModal.close}>
              {t('cancel')}
            </Button>
            <Button color="red" onClick={confirmReset}>
              {t('reset')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
