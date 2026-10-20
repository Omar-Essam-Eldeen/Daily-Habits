/**
 * v3.1 "Cinematic Layers" — per-habit colour art (PRESENTATION ONLY).
 *
 * Turns a Mantine colour name into gradient art for heatmap tiles and icon
 * chips. The gradient stop pairs were chosen from the real Mantine palette
 * luminances so a filled tile's day numeral keeps ≥ 4.5:1 contrast on EVERY
 * stop of its gradient (WCAG AA for text):
 *  - deep families (violet/indigo): white numeral on 7→9
 *    (worst stop: indigo-7, 4.98:1)
 *  - leaf/pink/grape: white numeral on 8→9 (worst stop: pink-8, ~5.6:1 —
 *    deepened after rendered sampling showed the 7-stop margin too thin)
 *  - red/blue: white numeral on 8→9 (worst stop: red-8, 4.51:1)
 *  - bright families (cyan/teal/green/lime/yellow/orange/sun): warm-dark
 *    numeral #2e2118 on 5→7 (worst stop: cyan-5, 4.54:1)
 * Unknown colour names fall back to the leaf recipe.
 */

const DARK_NUMERAL = '#2e2118';

interface Recipe {
  from: number;
  to: number;
  darkText: boolean;
}

const RECIPES: Record<string, Recipe> = {
  leaf: { from: 8, to: 9, darkText: false },
  pink: { from: 8, to: 9, darkText: false },
  grape: { from: 8, to: 9, darkText: false },
  violet: { from: 7, to: 9, darkText: false },
  indigo: { from: 7, to: 9, darkText: false },
  red: { from: 8, to: 9, darkText: false },
  blue: { from: 8, to: 9, darkText: false },
  cyan: { from: 5, to: 7, darkText: true },
  teal: { from: 5, to: 7, darkText: true },
  green: { from: 5, to: 7, darkText: true },
  lime: { from: 5, to: 7, darkText: true },
  yellow: { from: 5, to: 7, darkText: true },
  orange: { from: 5, to: 7, darkText: true },
  sun: { from: 5, to: 7, darkText: true },
};

const FALLBACK: Recipe = RECIPES.leaf as Recipe;

function recipeFor(color: string): Recipe {
  return RECIPES[color] ?? FALLBACK;
}

export interface TileArt {
  background: string;
  color: string;
  borderColor: string;
  boxShadow?: string;
}

/** Gradient fill for a heatmap tile (filled) or a faint habit-tinted glass (empty). */
export function heatTileArt(color: string, filled: boolean): TileArt {
  if (!filled) {
    return {
      background: `linear-gradient(160deg, color-mix(in srgb, var(--mantine-color-${color}-6) 10%, transparent), color-mix(in srgb, var(--mantine-color-${color}-6) 3%, transparent))`,
      color: 'var(--mantine-color-dimmed)',
      borderColor: `color-mix(in srgb, var(--mantine-color-${color}-6) 32%, transparent)`,
    };
  }
  const r = recipeFor(color);
  return {
    background: `linear-gradient(135deg, var(--mantine-color-${color}-${r.from}), var(--mantine-color-${color}-${r.to}))`,
    color: r.darkText ? DARK_NUMERAL : '#ffffff',
    borderColor: `var(--mantine-color-${color}-${r.to})`,
    boxShadow: `0 3px 10px color-mix(in srgb, var(--mantine-color-${color}-6) 38%, transparent)`,
  };
}

export interface ChipArt {
  background: string;
  color: string;
  boxShadow: string;
}

/**
 * Gradient icon chip. The icon itself is decorative (aria-hidden — the habit
 * name beside it carries the meaning); its tint follows the same recipe as
 * the tiles so a habit looks consistent everywhere.
 */
export function chipArt(color: string): ChipArt {
  const r = recipeFor(color);
  return {
    background: `linear-gradient(135deg, var(--mantine-color-${color}-${r.from === 8 ? 6 : r.from}), var(--mantine-color-${color}-${r.to}))`,
    color: r.darkText ? DARK_NUMERAL : '#ffffff',
    boxShadow: `0 4px 12px color-mix(in srgb, var(--mantine-color-${color}-6) 42%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.35)`,
  };
}
