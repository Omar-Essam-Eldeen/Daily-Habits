import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Style A "Clean Social": neutral surfaces, ONE calm-green accent, Inter /
 * system font, card radius in the 12–16px band, pill primary buttons,
 * hairline dividers, generous (>=44px) touch targets.
 */
const leaf: MantineColorsTuple = [
  '#e9f7ee',
  '#d6efdd',
  '#b2dfbe',
  '#86cc99',
  '#5db878',
  '#43ab5f',
  '#2f9e44', // primary shade 6
  '#26853a',
  '#1e6c30',
  '#175426',
];

export const theme = createTheme({
  colors: { leaf },
  primaryColor: 'leaf',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 1px 3px rgba(16, 24, 40, 0.06), 0 6px 16px rgba(16, 24, 40, 0.05)',
    md: '0 2px 6px rgba(16, 24, 40, 0.07), 0 12px 28px rgba(16, 24, 40, 0.07)',
    lg: '0 4px 10px rgba(16, 24, 40, 0.08), 0 18px 40px rgba(16, 24, 40, 0.09)',
    xl: '0 8px 16px rgba(16, 24, 40, 0.1), 0 28px 56px rgba(16, 24, 40, 0.1)',
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
      defaultProps: { radius: 'lg', withBorder: true, shadow: 'xs' }, // 16px card radius, hairline border, whisper shadow
    },
    Paper: {
      defaultProps: { radius: 'lg' },
    },
  },
});
