import { useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconBell, IconBellOff, IconInfoCircle } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  cancelNativeReminder,
  nativeNotificationPermission,
  nativeRemindersEnabled,
  requestNativeNotificationPermission,
  setNativeRemindersEnabled,
} from '../lib/native';
import { DEFAULT_PUSH_TIME } from '../lib/pushConfig';
import { useAppData } from '../state/AppDataContext';

/**
 * v3.3.0 — the Phone reminders card inside the native Android app.
 *
 * Same card, same shared reminder time as the web build, but the mechanism
 * is on-device scheduling instead of Web Push: a WebView has no PushManager,
 * and a native app needs no server to remind its owner anyway. The on/off
 * flag is the native bridge's own (mirroring Web Push's separate state);
 * the actual notification is (re)armed by App.tsx whenever state changes.
 * The permission prompt is requested ONLY from an explicit tap here —
 * never automatically.
 */
export function NativeReminderSettings() {
  const { data, setReminderTime } = useAppData();
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState<boolean>(() => nativeRemindersEnabled());
  const [time, setTime] = useState<string>(data.settings.reminderTime ?? DEFAULT_PUSH_TIME);
  const [permission, setPermission] = useState<string>('unknown');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<'denied' | 'error' | null>(null);

  useEffect(() => {
    let cancelled = false;
    void nativeNotificationPermission().then((display) => {
      if (!cancelled) setPermission(display);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTimeChange = (value: string) => {
    setTime(value);
    if (!value) return;
    // Same contract as the web card: the picked time is the shared reminder
    // time; App.tsx re-arms the on-device notification when it changes.
    setReminderTime(value);
  };

  const handleEnable = async () => {
    setNote(null);
    setBusy(true);
    try {
      const granted = await requestNativeNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
      if (!granted) {
        setNote('denied');
        return;
      }
      if (!data.settings.reminderTime) setReminderTime(time || DEFAULT_PUSH_TIME);
      setNativeRemindersEnabled(true);
      setEnabled(true);
    } catch {
      setNote('error');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setNote(null);
    setNativeRemindersEnabled(false);
    setEnabled(false);
    await cancelNativeReminder();
  };

  return (
    <Card withBorder padding="md">
      <Stack gap="sm">
        <Group gap="xs">
          <IconBell size={18} aria-hidden="true" />
          <Text fw={700}>{t('pushTitle')}</Text>
        </Group>
        <Text size="sm" c="dimmed">
          {t('pushNativeHelp')}
        </Text>

        <Group align="flex-end" gap="sm" wrap="wrap">
          <TextInput
            type="time"
            label={t('pushTimeLabel')}
            value={time}
            onChange={(event) => handleTimeChange(event.currentTarget.value)}
            style={{ flex: 1, minWidth: 150 }}
          />
          <Switch
            aria-label={t('pushTitle')}
            checked={enabled}
            disabled={busy}
            onChange={(event) => {
              if (event.currentTarget.checked) void handleEnable();
              else void handleDisable();
            }}
            color="leaf"
            size="md"
          />
        </Group>

        {enabled ? (
          <Group justify="space-between" align="center" wrap="wrap">
            <Text size="sm" c="leaf" fw={600}>
              {t('pushNativeNote')}
            </Text>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconBellOff size={14} aria-hidden="true" />}
              loading={busy}
              onClick={() => void handleDisable()}
            >
              {t('pushDisable')}
            </Button>
          </Group>
        ) : (
          <Button
            color="leaf.8"
            radius="xl"
            loading={busy}
            leftSection={<IconBell size={16} aria-hidden="true" />}
            onClick={() => void handleEnable()}
          >
            {t('pushEnable')}
          </Button>
        )}

        {enabled && permission !== 'granted' && permission !== 'unknown' && (
          <Alert color="red" variant="light" icon={<IconInfoCircle size={16} aria-hidden="true" />}>
            {t('pushNativeDenied')}
          </Alert>
        )}
        {note === 'denied' && (
          <Alert color="red" variant="light" icon={<IconInfoCircle size={16} aria-hidden="true" />}>
            {t('pushNativeDenied')}
          </Alert>
        )}
        {note === 'error' && (
          <Alert color="red" variant="light" icon={<IconInfoCircle size={16} aria-hidden="true" />}>
            {t('pushGenericError')}
          </Alert>
        )}
      </Stack>
    </Card>
  );
}
