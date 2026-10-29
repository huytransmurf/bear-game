/**
 * BearMascot.tsx
 * Centralized SVG mascot definitions for Sun Bear (Gấu Chó) and Moon Bear (Gấu Ngựa).
 * Based on the user-provided high-fidelity cartoon SVGs.
 */

interface BearProps {
  size?: number;
  className?: string;
}

// ─────────────────────────────────────────────
// SUN BEAR – Gấu Chó (orange horseshoe chest patch)
// ─────────────────────────────────────────────
export function SunBearSVG({ size = 100, className = '' }: BearProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ears */}
      <circle cx="28" cy="25" r="11" fill="#2a1f1d" stroke="#120c0b" strokeWidth="2" />
      <circle cx="28" cy="25" r="6" fill="#ca8a04" opacity="0.4" />
      <circle cx="72" cy="25" r="11" fill="#2a1f1d" stroke="#120c0b" strokeWidth="2" />
      <circle cx="72" cy="25" r="6" fill="#ca8a04" opacity="0.4" />

      {/* Head Base */}
      <ellipse cx="50" cy="45" rx="32" ry="28" fill="#382923" stroke="#120c0b" strokeWidth="2.5" />

      {/* Snout / Muzzle */}
      <ellipse cx="50" cy="52" rx="16" ry="12" fill="#eab308" opacity="0.9" />
      <ellipse cx="50" cy="46" rx="6" ry="4" fill="#18181b" />

      {/* Cheerful Mouth & Tongue */}
      <path d="M 44 52 Q 50 57 56 52" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M 48 54 Q 50 63 53 54" fill="#f43f5e" stroke="#9f1239" strokeWidth="1" />

      {/* Cute Eyes */}
      <circle cx="38" cy="38" r="4.5" fill="#18181b" />
      <circle cx="39.5" cy="36.5" r="1.5" fill="#ffffff" />
      <circle cx="62" cy="38" r="4.5" fill="#18181b" />
      <circle cx="63.5" cy="36.5" r="1.5" fill="#ffffff" />

      {/* Rosy Cheeks */}
      <circle cx="29" cy="47" r="4" fill="#f43f5e" opacity="0.3" />
      <circle cx="71" cy="47" r="4" fill="#f43f5e" opacity="0.3" />

      {/* Body */}
      <path
        d="M 26 62 C 20 75 22 92 32 95 C 42 97 58 97 68 95 C 78 92 80 75 74 62 Z"
        fill="#2a1f1d"
        stroke="#120c0b"
        strokeWidth="2.5"
      />

      {/* SUN BEAR CHEST – Iconic Orange/Yellow Horseshoe Crescent */}
      <path
        d="M 36 68 C 42 84 58 84 64 68 C 60 76 40 76 36 68 Z"
        fill="#f97316"
        stroke="#ea580c"
        strokeWidth="1.5"
      />

      {/* Paws */}
      <ellipse cx="28" cy="92" rx="8" ry="5" fill="#18181b" />
      <ellipse cx="72" cy="92" rx="8" ry="5" fill="#18181b" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// MOON BEAR – Gấu Ngựa (white V-shape chest patch)
// ─────────────────────────────────────────────
export function MoonBearSVG({ size = 100, className = '' }: BearProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fluffy Big Round Ears */}
      <circle cx="22" cy="22" r="13" fill="#111827" stroke="#030712" strokeWidth="2.5" />
      <circle cx="22" cy="22" r="7" fill="#374151" opacity="0.5" />
      <circle cx="78" cy="22" r="13" fill="#111827" stroke="#030712" strokeWidth="2.5" />
      <circle cx="78" cy="22" r="7" fill="#374151" opacity="0.5" />

      {/* Fluffy Head Base */}
      <ellipse cx="50" cy="45" rx="34" ry="29" fill="#1f2937" stroke="#030712" strokeWidth="2.5" />

      {/* Cheek Fluff */}
      <path d="M 16 48 Q 10 52 18 58" fill="none" stroke="#111827" strokeWidth="2" />
      <path d="M 84 48 Q 90 52 82 58" fill="none" stroke="#111827" strokeWidth="2" />

      {/* Snout */}
      <ellipse cx="50" cy="52" rx="15" ry="11" fill="#d1d5db" />
      <ellipse cx="50" cy="46" rx="6.5" ry="4.5" fill="#030712" />

      {/* Smiling Mouth */}
      <path d="M 43 52 Q 50 58 57 52" fill="none" stroke="#030712" strokeWidth="2" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="37" cy="38" r="4.5" fill="#030712" />
      <circle cx="38.5" cy="36.5" r="1.5" fill="#ffffff" />
      <circle cx="63" cy="38" r="4.5" fill="#030712" />
      <circle cx="64.5" cy="36.5" r="1.5" fill="#ffffff" />

      {/* Body */}
      <path
        d="M 24 62 C 18 76 20 94 30 96 C 42 98 58 98 70 96 C 80 94 82 76 76 62 Z"
        fill="#111827"
        stroke="#030712"
        strokeWidth="2.5"
      />

      {/* MOON BEAR CHEST – Iconic Pure White V-Shape */}
      <path
        d="M 34 66 L 50 86 L 66 66 L 58 66 L 50 76 L 42 66 Z"
        fill="#f8fafc"
        stroke="#e2e8f0"
        strokeWidth="1"
      />

      {/* Paws */}
      <ellipse cx="28" cy="93" rx="8" ry="5" fill="#030712" />
      <ellipse cx="72" cy="93" rx="8" ry="5" fill="#030712" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Generic BearMascot (switch by type)
// ─────────────────────────────────────────────
export type BearMascotType = 'sunbear' | 'blackbear';

export function BearMascot({
  type,
  size = 100,
  className = '',
}: {
  type: BearMascotType;
} & BearProps) {
  return type === 'sunbear' ? (
    <SunBearSVG size={size} className={className} />
  ) : (
    <MoonBearSVG size={size} className={className} />
  );
}
