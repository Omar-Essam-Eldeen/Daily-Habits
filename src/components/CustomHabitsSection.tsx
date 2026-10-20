import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconArchive, IconFlame, IconPencil, IconPlus, IconRestore } from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  CUSTOM_HABIT_COLORS,
  type CustomHabit,
} from '../lib/storage';
import { activeCustomHabits, customCurrentStreak, isCustomChecked } from '../lib/stats';
import { todayDayNumber } from '../lib/dates';
import { formatNumber } from '../i18n/translations';
import { useAppData, type CustomHabitDraft } from '../state/AppDataContext';
import { CUSTOM_ICON_KEYS, customIcon } from './customIcons';

interface Props {
  selectedDay: number;
  /** True when the day is submitted (soft lock) — ticking is paused. */
  locked: boolean;
}

type EditorState = { mode: 'add' } | { mode: 'edit'; habit: CustomHabit } | null;

/**
 * v3 "My habits": the user's own habits, kept fully separate from the
 * core challenge score. Rows mirror the core habit rows; each custom has
 * its own icon/colour, and habits are archived (never hard-deleted) so
 * history is never lost.
 */
export function CustomHabitsSection({ selectedDay, locked }: Props) {
  const { data, toggleCustomCheck, addCustomHabit, updateCustomHabit, setCustomArchived } =
    useAppData();
  const { t, lang } = useLanguage();
  const [editor, setEditor] = useState<EditorState>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const actives = activeCustomHabits(data);
  const archived = data.customHabits.filter((h) => h.archived);
  const today = todayDayNumber(data.startDate);

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Text fw={700}>{t('myHabits')}</Text>
          <Text size="xs" c="dimmed">
            {t('myHabitsHint')}
          </Text>
        </Stack>
        <Button
          size="xs"
          radius="xl"
          variant="light"
          color="leaf"
          leftSection={<IconPlus size={14} />}
          onClick={() => setEditor({ mode: 'add' })}
        >
          {t('addHabit')}
        </Button>
      </Group>

      {actives.length === 0 && (
        <Box
          style={{
            border: '1.5px dashed var(--mantine-color-leaf-4)',
            borderRadius: 18,
            padding: '14px 16px',
            background: 'var(--mantine-color-leaf-light)',
          }}
        >
          <Text size="sm">{t('noCustomHabits')}</Text>
        </Box>
      )}

      {actives.map((habit) => {
        const checked = isCustomChecked(data, selectedDay, habit.id);
        const Icon = customIcon(habit.icon);
        const streak = customCurrentStreak(data, habit.id, today);
        return (
          <Group
            key={habit.id}
            wrap="nowrap"
            gap="xs"
            align="stretch"
            style={{
              border: '1px solid var(--mantine-color-default-border)',
              borderRadius: 18,
              boxShadow: 'var(--mantine-shadow-xs)',
              background: checked ? 'var(--mantine-color-leaf-light)' : 'var(--mantine-color-body)',
              transition: 'background 200ms ease',
              overflow: 'hidden',
            }}
          >
            <UnstyledButton
              onClick={() => !locked && toggleCustomCheck(selectedDay, habit.id)}
              aria-pressed={checked}
              aria-label={habit.title}
              disabled={locked}
              style={{ flex: 1, minWidth: 0, minHeight: 60, padding: '10px 6px 10px 14px' }}
            >
              <Group wrap="nowrap" gap="sm" align="center">
                <span key={String(checked)} className={checked ? 'check-pop' : undefined}>
                  <Checkbox
                    checked={checked}
                    readOnly
                    tabIndex={-1}
                    size="lg"
                    radius="md"
                    color={habit.color}
                    style={{ pointerEvents: 'none' }}
                    aria-hidden
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
                    background: `var(--mantine-color-${habit.color}-light)`,
                    color: `var(--mantine-color-${habit.color}-7)`,
                  }}
                >
                  <Icon size={21} stroke={1.9} />
                </Box>
                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} lh={1.3} td={checked ? 'line-through' : undefined}>
                    {habit.title}
                  </Text>
                  {habit.note && (
                    <Text size="sm" c="dimmed" lh={1.35}>
                      {habit.note}
                    </Text>
                  )}
                </Stack>
                {streak > 1 && (
                  <Badge
                    color="orange"
                    variant="light"
                    size="sm"
                    leftSection={<IconFlame size={12} />}
                    style={{ flexShrink: 0 }}
                  >
                    {formatNumber(streak, lang)}
                  </Badge>
                )}
              </Group>
            </UnstyledButton>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label={`${t('edit')}: ${habit.title}`}
              onClick={() => setEditor({ mode: 'edit', habit })}
              style={{ alignSelf: 'center', marginInlineEnd: 6, flexShrink: 0 }}
            >
              <IconPencil size={17} />
            </ActionIcon>
          </Group>
        );
      })}

      {archived.length > 0 && (
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconArchive size={14} />}
          onClick={() => setArchivedOpen(true)}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('archivedHabits')} ({formatNumber(archived.length, lang)})
        </Button>
      )}

      <HabitEditor
        state={editor}
        onClose={() => setEditor(null)}
        onSave={(draft) => {
          if (editor?.mode === 'edit') updateCustomHabit(editor.habit.id, draft);
          else addCustomHabit(draft);
          setEditor(null);
        }}
        onArchive={(id) => {
          setCustomArchived(id, true);
          setEditor(null);
        }}
      />

      <Modal opened={archivedOpen} onClose={() => setArchivedOpen(false)} title={t('archivedHabits')} centered>
        <Stack gap="xs">
          {archived.map((habit) => {
            const Icon = customIcon(habit.icon);
            return (
              <Group key={habit.id} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Box
                    aria-hidden
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `var(--mantine-color-${habit.color}-light)`,
                      color: `var(--mantine-color-${habit.color}-7)`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </Box>
                  <Text fw={500} lineClamp={1}>
                    {habit.title}
                  </Text>
                </Group>
                <Button
                  size="xs"
                  variant="light"
                  color="leaf"
                  leftSection={<IconRestore size={14} />}
                  onClick={() => setCustomArchived(habit.id, false)}
                >
                  {t('restoreHabit')}
                </Button>
              </Group>
            );
          })}
        </Stack>
      </Modal>
    </Stack>
  );
}

function HabitEditor({
  state,
  onClose,
  onSave,
  onArchive,
}: {
  state: EditorState;
  onClose: () => void;
  onSave: (draft: CustomHabitDraft) => void;
  onArchive: (id: string) => void;
}) {
  const { t } = useLanguage();
  const editing = state?.mode === 'edit' ? state.habit : null;
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [icon, setIcon] = useState('sparkles');
  const [color, setColor] = useState('leaf');
  const [seededFor, setSeededFor] = useState<string | null>(null);

  // Seed the form when the editor opens for a habit (or for "add").
  const seedKey = state === null ? null : state.mode === 'edit' ? state.habit.id : 'new';
  if (state !== null && seededFor !== seedKey) {
    setSeededFor(seedKey);
    setTitle(editing?.title ?? '');
    setNote(editing?.note ?? '');
    setIcon(editing?.icon ?? 'sparkles');
    setColor(editing?.color ?? 'leaf');
  }
  if (state === null && seededFor !== null) setSeededFor(null);

  return (
    <Modal
      opened={state !== null}
      onClose={onClose}
      title={editing ? t('editHabit') : t('addHabit')}
      centered
    >
      <Stack gap="md">
        <TextInput
          label={t('habitNameLabel')}
          placeholder={t('habitNamePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          maxLength={80}
          data-autofocus
        />
        <TextInput
          label={t('habitNoteLabel')}
          placeholder={t('habitNotePlaceholder')}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          maxLength={160}
        />
        <Stack gap={6}>
          <Text size="sm" fw={600}>
            {t('habitIconLabel')}
          </Text>
          <SimpleGrid cols={6} spacing={6}>
            {CUSTOM_ICON_KEYS.map((key) => {
              const Icon = customIcon(key);
              const selected = icon === key;
              return (
                <UnstyledButton
                  key={key}
                  onClick={() => setIcon(key)}
                  aria-pressed={selected}
                  aria-label={key}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: selected
                      ? '2px solid var(--mantine-color-leaf-6)'
                      : '1px solid var(--mantine-color-default-border)',
                    background: selected ? 'var(--mantine-color-leaf-light)' : undefined,
                    color: 'var(--mantine-color-text)',
                  }}
                >
                  <Icon size={20} />
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Stack>
        <Stack gap={6}>
          <Text size="sm" fw={600}>
            {t('habitColorLabel')}
          </Text>
          <Group gap={8}>
            {CUSTOM_HABIT_COLORS.map((c) => {
              const selected = color === c;
              return (
                <UnstyledButton
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={selected}
                  aria-label={c}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: `var(--mantine-color-${c}-6)`,
                    border: selected
                      ? '3px solid var(--mantine-color-text)'
                      : '3px solid transparent',
                    boxShadow: 'var(--mantine-shadow-xs)',
                  }}
                />
              );
            })}
          </Group>
        </Stack>
        <Group justify="space-between">
          {editing ? (
            <Button
              variant="subtle"
              color="red"
              leftSection={<IconArchive size={15} />}
              onClick={() => onArchive(editing.id)}
            >
              {t('archiveHabit')}
            </Button>
          ) : (
            <span />
          )}
          <Group>
            <Button variant="default" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              color="leaf"
              disabled={!title.trim()}
              onClick={() =>
                onSave({ title, note: note.trim() ? note : null, icon, color })
              }
            >
              {t('save')}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
