import { useState } from 'react';
import { Badge, Button, Card, Group, RingProgress, Stack, Text } from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconLockOpen,
  IconShare,
  IconTrophy,
} from '@tabler/icons-react';
import { useLanguage } from '../i18n/LanguageContext';
import { formatNumber } from '../i18n/translations';
import { HABITS, TOTAL_DAYS } from '../lib/habits';
import { progressStreak } from '../lib/stats';
import type { DaySubmission } from '../lib/storage';
import { useAppData } from '../state/AppDataContext';
import { LogoMark } from './Logo';

interface Props {
  day: number;
  submission: DaySubmission;
}

/**
 * v3 daily-submit summary card (B1): the screenshot/shareable record of a
 * submitted day — core score (core 10 only), customs listed separately,
 * showed-up streak, and the day note. Soft lock: "Re-open day" undoes the
 * submission with no penalty, so a bedtime mistake is never punished.
 */
export function DaySummaryCard({ day, submission }: Props) {
  const { data, reopenDay } = useAppData();
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const streak = progressStreak(data, day);
  const pct = Math.round((submission.coreDone / HABITS.length) * 100);
  const submittedTime = submission.submittedAt
    ? new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(submission.submittedAt))
    : '';

  const summaryText = [
    `${t('appTitle')} — ${t('day')} ${day}/${TOTAL_DAYS}`,
    `${t('summaryCore')}: ${submission.coreDone}/${HABITS.length}`,
    ...(submission.customTotal > 0
      ? [`${t('summaryCustoms')}: ${submission.customDone}/${submission.customTotal}`]
      : []),
    `${t('summaryStreak')}: ${streak}`,
    ...(submission.note ? [`“${submission.note}”`] : []),
  ].join('\n');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: t('summaryTitle'), text: summaryText });
        return;
      }
      throw new Error('no-share');
    } catch {
      try {
        await navigator.clipboard.writeText(summaryText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable (permissions) — the card itself stays on screen.
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — see handleShare note
    }
  };

  /**
   * Download the summary as a PNG image (dependency-free: render a small
   * SVG card to a canvas). Made for sharing the day in chat apps that
   * don't take text shares well.
   */
  const handleDownloadImage = () => {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const rtl = lang === 'ar';
    const W = 880;
    const noteLines: string[] = [];
    if (submission.note) {
      const words = submission.note.split(/\s+/);
      let line = '';
      for (const w of words) {
        if ((line + ' ' + w).trim().length > 38 && line) {
          noteLines.push(line);
          line = w;
        } else {
          line = (line + ' ' + w).trim();
        }
        if (noteLines.length >= 2) break;
      }
      if (line && noteLines.length < 2) noteLines.push(line);
    }
    const rows: { label: string; value: string }[] = [
      { label: t('summaryCore'), value: `${submission.coreDone}/${HABITS.length}` },
      ...(submission.customTotal > 0
        ? [{ label: t('summaryCustoms'), value: `${submission.customDone}/${submission.customTotal}` }]
        : []),
      { label: t('summaryStreak'), value: String(streak) },
    ];
    const H = 400 + noteLines.length * 40;
    const x = rtl ? W - 56 : 56;
    const anchor = rtl ? 'end' : 'start';
    const cx = rtl ? 84 : W - 84; // logo disc centre (top corner)
    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0" stop-color="#1e6c30"/><stop offset="1" stop-color="#2f9e44"/>',
      '</linearGradient></defs>',
      `<rect width="${W}" height="${H}" rx="36" fill="url(#g)"/>`,
      // v3.1 logo motif in the corner: gold sun disc, cream leaf, green check vein.
      `<circle cx="${cx}" cy="86" r="42" fill="#ffc107" opacity="0.9"/>`,
      `<path d="M${cx - 21} 103 C${cx - 21} 88 ${cx - 9} 79 ${cx + 17} 77 C${cx + 19} 92 ${cx + 12} 103 ${cx - 6} 105 C${cx - 15} 106 ${cx - 21} 107 ${cx - 21} 103 Z" fill="#fff8e1"/>`,
      `<path d="M${cx - 13} 97 L${cx - 4} 103 L${cx + 13} 83" fill="none" stroke="#1e6c30" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<text x="${x}" y="96" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="${anchor}">${esc(t('appTitle'))}</text>`,
      `<text x="${x}" y="142" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-size="27" fill="#dcf2d5" text-anchor="${anchor}">${esc(t('day'))} ${day}/${TOTAL_DAYS} · ${esc(t('submittedBadge'))}${submittedTime ? ' · ' + esc(submittedTime) : ''}</text>`,
      `<text x="${x}" y="262" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-size="110" font-weight="800" fill="#ffffff" text-anchor="${anchor}">${submission.coreDone}<tspan font-size="52" fill="#dcf2d5">/${HABITS.length}</tspan></text>`,
      ...rows.map(
        (r, i) =>
          `<text x="${x}" y="${322 + i * 44}" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-size="28" fill="#ffffff" text-anchor="${anchor}">${esc(r.label)}: <tspan font-weight="700">${esc(r.value)}</tspan></text>`,
      ),
      ...noteLines.map(
        (l, i) =>
          `<text x="${x}" y="${330 + rows.length * 44 + i * 40}" font-family="system-ui, 'Segoe UI', Arial, sans-serif" font-size="25" font-style="italic" fill="#eff9e9" text-anchor="${anchor}">“${esc(l)}”</text>`,
      ),
      '</svg>',
    ].join('');
    try {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = W * 2;
        canvas.height = H * 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `habits-day-${day}-summary.png`;
          a.click();
          window.setTimeout(() => URL.revokeObjectURL(pngUrl), 4000);
        }, 'image/png');
      };
      img.src = url;
    } catch {
      // Image export is a bonus — the on-screen card + text share remain.
    }
  };

  return (
    <Card
      withBorder
      padding="md"
      radius="xl"
      className="glass-surface rise-in"
      style={{
        borderColor: 'var(--glass-border-gold)',
        background: 'var(--glass-summary-bg)',
      }}
    >
      <Stack gap="sm">
        {/* v3.1 identity: brand lockup at the top of the shareable card. */}
        <Group gap="xs" align="center">
          <LogoMark size={26} />
          <Text size="sm" fw={700}>
            {t('appTitle')}
          </Text>
        </Group>
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconTrophy size={20} color="var(--mantine-color-leaf-7)" aria-hidden />
            <Text fw={700}>{t('summaryTitle')}</Text>
          </Group>
          <Badge color="leaf" variant="filled" leftSection={<IconCheck size={12} />}>
            {t('submittedBadge')}
          </Badge>
        </Group>

        <Group gap="lg" align="center" wrap="nowrap">
          <RingProgress
            size={86}
            thickness={9}
            roundCaps
            sections={[{ value: pct, color: 'leaf' }]}
            label={
              <Text ta="center" fw={700}>
                {formatNumber(submission.coreDone, lang)}/{formatNumber(HABITS.length, lang)}
              </Text>
            }
          />
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text size="sm">
              <b>
                {t('summaryCore')}: {formatNumber(submission.coreDone, lang)}/
                {formatNumber(HABITS.length, lang)}
              </b>
            </Text>
            {submission.customTotal > 0 && (
              <Text size="sm">
                {t('summaryCustoms')}: {formatNumber(submission.customDone, lang)}/
                {formatNumber(submission.customTotal, lang)}
              </Text>
            )}
            <Text size="sm">
              {t('summaryStreak')}: {formatNumber(streak, lang)}
            </Text>
            {submittedTime && (
              <Text size="xs" c="dimmed">
                {t('summarySubmittedAt')} {submittedTime}
              </Text>
            )}
          </Stack>
        </Group>

        {submission.note && (
          <Text size="sm" fs="italic" lineClamp={3}>
            “{submission.note}”
          </Text>
        )}

        <Text size="xs" c="dimmed">
          {t('submittedLockedNote')}
        </Text>

        <Group gap="xs" wrap="wrap">
          <Button
            size="sm"
            radius="xl"
            color="leaf"
            leftSection={<IconShare size={15} />}
            onClick={() => void handleShare()}
          >
            {t('shareSummary')}
          </Button>
          <Button
            size="sm"
            radius="xl"
            variant="light"
            color="leaf"
            leftSection={copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
            onClick={() => void handleCopy()}
          >
            {copied ? t('copied') : t('copySummary')}
          </Button>
          <Button
            size="sm"
            radius="xl"
            variant="light"
            color="leaf"
            leftSection={<IconDownload size={15} />}
            onClick={handleDownloadImage}
          >
            {t('downloadImage')}
          </Button>
          <Button
            size="sm"
            radius="xl"
            variant="subtle"
            color="gray"
            leftSection={<IconLockOpen size={15} />}
            onClick={() => reopenDay(day)}
          >
            {t('reopenDay')}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
