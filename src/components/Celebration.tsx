import { useMemo } from 'react';

/* Warm sunrise palette (v3.1) — leaf, gold, coral, with pink for pop. */
const COLORS = ['#2f9e44', '#ffb300', '#ff8a5c', '#ffd54f', '#57b43c', '#f783ac', '#ffa94d'];

interface Piece {
  left: number;
  delay: number;
  size: number;
  color: string;
  round: boolean;
  duration: number;
  /** Depth layer: 'back' pieces are smaller, blurred, slower (v3.1). */
  layer: 'back' | 'front';
}

/**
 * Lightweight CSS celebration for milestone moments — no dependencies.
 * v3.1 "Cinematic Layers": rotating light rays + a warm flash behind two
 * confetti depths (blurred slow background pieces, sharp fast foreground
 * pieces). Hidden entirely under prefers-reduced-motion (see styles.css).
 */
export function Celebration({ pieces: count = 28 }: { pieces?: number }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const front = i % 2 === 1;
        return {
          left: (i * 37 + 13) % 100,
          delay: ((i * 53) % 40) / 100,
          size: front ? 8 + ((i * 29) % 6) : 4 + ((i * 17) % 4),
          color: COLORS[i % COLORS.length] ?? '#2f9e44',
          round: i % 3 === 0,
          duration: front ? 1.9 + ((i * 31) % 8) / 10 : 2.7 + ((i * 41) % 8) / 10,
          layer: front ? 'front' : 'back',
        };
      }),
    [count],
  );

  return (
    <div className="confetti-wrap" aria-hidden>
      <div className="celebration-rays" />
      <div className="celebration-flash" />
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece ${p.layer}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
