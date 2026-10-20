import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Style A "Clean Social" structure, warmed up for v3 (the siblings'
 * "plain / sad vibes" fix): the same calm-green anchor (#2f9e44 at shade 6
 * — the app's brand colour, also the manifest theme colour), but lighter
 * shades carry a golden tint, a warm amber "sun" joins for celebrations
 * and gradients, cards round out to 20px, and shadows use a warm
 * brown-grey instead of v2's cold blue-grey.
 */
const leaf: MantineColorsTuple = [
  '#eff9e9',
  '#ddf2d5',
  '#c0e7ae',
  '#98d67f',
  '#72c457',
  '#57b43c',
  '#2f9e44', // primary shade 6 — brand anchor (unchanged from v1/v2)
  '#26853a',
  '#1e6c30',
  '#175426',
];

const sun: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffca28',
  '#ffc107',
  '#ffb300',
  '#ffa000',
  '#ff8f00',
  '#ff6f00',
];

export const theme = createTheme({
  colors: { leaf, sun },
  primaryColor: 'leaf',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'lg',
  shadows: {
    xs: '0 1px 2px rgba(66, 52, 20, 0.06)',
    sm: '0 1px 3px rgba(66, 52, 20, 0.07), 0 6px 16px rgba(66, 52, 20, 0.06)',
    md: '0 2px 6px rgba(66, 52, 20, 0.09), 0 14px 32px rgba(66, 52, 20, 0.1)',
    lg: '0 4px 12px rgba(66, 52, 20, 0.1), 0 22px 46px rgba(66, 52, 20, 0.12)',
    xl: '0 10px 20px rgba(66, 52, 20, 0.12), 0 34px 64px rgba(66, 52, 20, 0.13)',
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Kufi Arabic', 'Noto Sans Arabic', sans-serif",
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: { radius: 'xl' }, // pill buttons
    },
    Card: {
      defaultProps: { radius: 'xl', withBorder: true, shadow: 'xs' }, // 20px card radius (v3 warmth), hairline border, whisper shadow
    },
    Paper: {
      defaultProps: { radius: 'xl' },
    },
  },
});
