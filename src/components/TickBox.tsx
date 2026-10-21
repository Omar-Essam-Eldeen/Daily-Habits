import type { CSSProperties } from 'react';

/**
 * v3.1.2: pure-visual tick box for habit rows.
 *
 * Replaces the decorative Mantine <Checkbox> that used to sit inside the
 * row <button>. A real <input> nested in a button is invalid interactive
 * nesting (axe "nested-interactive") and previously needed an aria-hidden
 * wrapper to stay out of the accessibility tree. This span reproduces the
 * measured Mantine lg checkbox rendering exactly — 30x30 box, 8px radius,
 * 1px border; unchecked white/gray-3 (light) or dark-6/dark-4 (dark);
 * checked filled with the habit colour (shade 6 in light, shade 5 in
 * dark, exactly like Mantine's --checkbox-color) and the same white check
 * glyph (same viewBox + path) — with no form element at all. The row
 * button remains the one and only real control.
 */
export function TickBox({ checked, color = 'leaf' }: { checked: boolean; color?: string }) {
  return (
    <span
      className="tick-box"
      data-checked={checked || undefined}
      style={
        {
          '--tick-fill-6': `var(--mantine-color-${color}-6)`,
          '--tick-fill-5': `var(--mantine-color-${color}-5)`,
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 10 7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}
