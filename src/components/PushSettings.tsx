import { useEffect, useState } from 'react';
import { Alert, Button, Card, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { IconBell, IconBellOff, IconInfoCircle } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { DEFAULT_PUSH_TIME } from '../lib/pushConfig';
import {
  disablePush,
  enablePush,
  isPushEnabled,
  pushSupport,
  refreshPushRegistration,
} from '../lib/push';
import { useAppData } from '../state/AppDataContext';

type Note = 'server' | 'denied' | 'error' | null;

/**
 * v3 phone reminders (Web Push). Priming done right: the permission prompt
 * is ONLY requested from this section's explicit button tap, after the
 * user sees their reminder time — never on first open, never automatically
 * (iOS makes a refusal sticky, so a cold prompt would burn the one ask).
 * If the free backend is not connected yet, enabling fails soft with a
 * clear note and the in-app reminder keeps doing its job.
 */
export function PushSettings() {
  const { data, setReminderTime } = useAppData();
  const { t, lang } = useLanguage();
  const support = pushSupport();
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [time, setTime] = useState<string>(data.settings.reminderTime ?? DEFAULT_PUSH_TIME);

  useEffect(() => {
    let alive = true;
    isPushEnabled()
      .then((v) => {
        if (alive) setEnabled(v);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    setNote(null);
    const chosen = /^\d{2}:\d{2}$/.test(time) ? time : DEFAULT_PUSH_TIME;
    if (data.settings.reminderTime !== chosen) setReminderTime(chosen);
    const result = await enablePush({ reminderTime: chosen, language: lang });
    setBusy(false);
    if (result.ok) {
      setEnabled(true);
      return;
    }
    if (result.reason === 'server') setNote('server');
    else if (result.reason === 'denied') setNote('denied');
    else if (result.reason === 'unsupported') setNote('error');
    else setNote('error');
  };

  const handleDisable = async () => {
    setBusy(true);
    await disablePush();
    setBusy(false);
    setEnabled(false);
    setNote(null);
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    if (!value) return;
    setReminderTime(value);
    if (enabled) {
      void refreshPushRegistration({ reminderTime: value, language: lang });
    }
  };

  return (
    <Card withBorder padding="md">
      <Stack gap="sm">
        <Group gap="xs" align="center">
          <IconBell size={18} aria-hidden />
          <Text fw={700}>{t('pushTitle')}</Text>
        </Group>
        <Text size="sm" c="dimmed">
          {t('pushHelp')}
        </Text>

        {support === 'no-api' ? (
          <Alert color="gray" variant="light" icon={<IconInfoCircle size={16} />}>
            {t('pushUnsupported')}
          </Alert>
        ) : support === 'denied' && !enabled ? (
          <Alert color="yellow" variant="light" icon={<IconInfoCircle size={16} />}>
            {t('pushDenied')}
          </Alert>
        ) : (
          <>
            <Group align="flex-end" gap="sm" wrap="wrap">
              <TextInput
                type="time"
                label={t('pushTimeLabel')}
                value={time}
                onChange={(e) => handleTimeChange(e.currentTarget.value)}
                style={{ flex: 1, minWidth: 150 }}
              />
              <Switch
                aria-label={t('pushTitle')}
                checked={enabled}
                disabled={checking || busy}
                onChange={(e) => {
                  if (e.currentTarget.checked) void handleEnable();
                  else void handleDisable();
                }}
                color="leaf"
                size="md"
              />
            </Group>

            {enabled ? (
              <Group justify="space-between" align="center" wrap="wrap">
                <Text size="sm" c="leaf" fw={600}>
                  {t('pushEnabledNote')}
                </Text>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  leftSection={<IconBellOff size={14} />}
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
                leftSection={<IconBell size={16} />}
                onClick={() => void handleEnable()}
              >
                {t('pushEnable')}
              </Button>
            )}

            {note === 'server' && (
              <Alert color="yellow" variant="light" icon={<IconInfoCircle size={16} />}>
                {t('pushServerOff')}
              </Alert>
            )}
            {note === 'denied' && (
              <Alert color="yellow" variant="light" icon={<IconInfoCircle size={16} />}>
                {t('pushDenied')}
              </Alert>
            )}
            {note === 'error' && (
              <Alert color="red" variant="light" icon={<IconInfoCircle size={16} />}>
                {t('pushGenericError')}
              </Alert>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
