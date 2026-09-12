"use client";

import { useId } from "react";

/**
 * AVAI mascot — inline SVG, drawn from the brand sheet: cream/ivory body,
 * swept wings running navy → teal → gold, a navy-and-gold tail streak, one
 * large dark eye and a small amber beak.
 *
 * Poses follow the brand sheet's own vocabulary. "neutral" exists so a
 * genuinely weak result is never given an upbeat pose (§7.3).
 *
 * Placement rule (§0): login, async/loading waits and student screens ONLY.
 * Never render this inside the Principal or Teacher dashboards.
 */
export type MascotPose =
  | "hello"
  | "learn"
  | "practice"
  | "improve"
  | "explore"
  | "achieve"
  | "loading"
  | "neutral";

export function Mascot({ pose = "neutral", size = 120, className }: { pose?: MascotPose; size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const wing = `wing-${uid}`;
  const tail = `tail-${uid}`;

  /* Flying poses tilt the whole bird and drop the feet. */
  const flying = pose === "achieve" || pose === "loading";
  const winking = pose === "hello" || pose === "improve";

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      role="img"
      aria-label={`AVAI mascot, ${pose} pose`}
      className={className}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={wing} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d3a8f" />
          <stop offset="45%" stopColor="var(--brand-teal)" />
          <stop offset="100%" stopColor="var(--brand-gold)" />
        </linearGradient>
        <linearGradient id={tail} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d3a8f" />
          <stop offset="60%" stopColor="#4a7fd4" />
          <stop offset="100%" stopColor="#e8763a" />
        </linearGradient>
      </defs>

      {/* Loading ring — the brand sheet's flight+ring treatment */}
      {pose === "loading" && (
        <circle cx="0" cy="0" r="53" fill="none" stroke="var(--brand-teal)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="150 183" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}

      <g transform={pose === "loading" ? "scale(0.7) translate(30 6)" : flying ? "rotate(-12) translate(0 -4)" : undefined}>
        {/* Tail — three tapered feathers sweeping back and down to the left */}
        <path d="M-10 18 C-26 24 -40 34 -50 46 C-36 40 -22 34 -8 30 Z" fill="#1d3a8f" />
        <path d="M-11 13 C-28 17 -42 24 -52 34 C-38 30 -24 26 -10 24 Z" fill="#4a7fd4" />
        <path d="M-11 9 C-27 10 -40 14 -50 21 C-37 20 -24 19 -11 19 Z" fill="#e8763a" />

        {/* Wing fan — three long feathers sweeping up and BACK over the
            shoulder, the way the brand sheet's bird carries them */}
        <g transform="rotate(-34 -4 0)">
          <path d="M-4 4 C-18 -14 -22 -34 -14 -52 C-2 -36 4 -18 6 -2 Z" fill="#1d3a8f" />
          <path d="M-1 5 C-11 -13 -12 -33 -2 -50 C6 -33 10 -16 10 0 Z" fill="var(--brand-teal)" />
          <path d="M3 6 C-3 -10 2 -28 14 -42 C16 -26 16 -11 13 2 Z" fill="var(--brand-gold)" />
        </g>

        {/* Body — a plump cream teardrop, narrowing into the head at top right */}
        <path
          d="M6 -34 C20 -34 29 -23 29 -10 C29 12 18 30 2 30 C-13 30 -22 16 -22 0 C-22 -18 -9 -34 6 -34 Z"
          fill="#FDFAF3"
          stroke="#f0e7d7"
          strokeWidth="1"
        />

        {/* Head tuft */}
        <path d="M6 -33 C4 -42 8 -49 16 -52 C13 -44 11 -38 11 -33 Z" fill="var(--brand-teal)" />
        <path d="M1 -32 C-3 -40 -1 -46 5 -50 C3 -42 4 -36 5 -32 Z" fill="#1d3a8f" />

        {/* Near wing, folded over the body */}
        <path d="M2 -8 C12 -14 24 -12 30 -2 C24 12 12 20 0 18 C-4 8 -3 -2 2 -8 Z" fill="var(--brand-teal)" opacity="0.28" />

        {/* Face */}
        <ellipse cx="14" cy="-21" rx="4.4" ry="5.2" fill="#141c3a" />
        <circle cx="15.6" cy="-22.8" r="1.4" fill="#fff" opacity="0.92" />
        {winking && <path d="M10 -21 q4.4 3 8.6 0" stroke="#141c3a" strokeWidth="2.2" fill="none" strokeLinecap="round" />}
        <path d="M27 -20 l9 3 -9 3.4 Z" fill="#e8913a" />

        {/* Feet, only when perched */}
        {!flying && (
          <>
            <path d="M0 29 l0 7 m-4.5 0 h9" stroke="#e8913a" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M12 27 l1 7 m-3.5 0 h9" stroke="#e8913a" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </>
        )}
      </g>

      {/* Pose props */}
      {pose === "hello" && (
        <g stroke="var(--brand-teal)" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M34 -40 h9" />
          <path d="M31 -31 l7 -4" />
          <path d="M40 -30 l6 -6" />
        </g>
      )}
      {pose === "learn" && (
        <g transform="translate(-2 34)">
          <path d="M-20 0 q10 -6 20 0 q10 -6 20 0 l0 10 q-10 -5 -20 0 q-10 -5 -20 0 Z" fill="#2b4a9c" />
          <path d="M0 0 v10" stroke="#fdfaf3" strokeWidth="1.4" />
        </g>
      )}
      {pose === "practice" && (
        <g transform="translate(-2 30)">
          <path d="M-18 6 h36 l4 6 h-44 Z" fill="#c9d3e4" />
          <path d="M-15 -10 h30 v16 h-30 Z" fill="#2b4a9c" />
        </g>
      )}
      {pose === "improve" && (
        <g transform="translate(-30 22)">
          <rect x="-10" y="-12" width="22" height="26" rx="3" fill="#fdfaf3" stroke="#efe6d6" />
          <text x="1" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--brand-green)" fontFamily="var(--font-display)">
            90+
          </text>
          <path d="M14 -16 l3 -5 1 6 5 1 -5 2" stroke="var(--brand-gold)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      )}
      {pose === "explore" && (
        <g transform="translate(-38 24)">
          <circle r="11" fill="#fdfaf3" stroke="#2b4a9c" strokeWidth="2" />
          <path d="M-4 4 L2 -2 L4 -6 L-2 0 Z" fill="var(--brand-gold)" stroke="var(--brand-gold)" strokeWidth="1.6" />
        </g>
      )}
      {pose === "achieve" && (
        <path d="M40 -40 l2.8 -7.4 2.8 7.4 7.4 1 -5.6 4.8 1.8 7.4-6.4-3.8-6.4 3.8 1.8-7.4-5.6-4.8z" fill="var(--brand-gold)" />
      )}
    </svg>
  );
}

/**
 * AVAI wordmark — the logo lockup, with the "Learn Grow Achieve" line from
 * the brand sheet. Not the mascot, so it is allowed on staff shells.
 */
export function Wordmark({ size = 30, tagline = false, light = false }: { size?: number; tagline?: boolean; light?: boolean }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "0.02em",
          color: light ? "#fff" : "var(--brand-ink)",
        }}
      >
        AV
        <span style={{ color: "var(--brand-teal)" }}>A</span>I
      </span>
      {tagline && (
        <span
          style={{
            fontSize: Math.max(7, size * 0.24),
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: light ? "rgba(255,255,255,0.7)" : "var(--muted)",
          }}
        >
          Learn Grow Achieve
        </span>
      )}
    </span>
  );
}

/** Compact logomark for sidebars/topbars — the wing motif from the logo. */
export function Logomark({ size = 28 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`mark-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d3a8f" />
          <stop offset="50%" stopColor="var(--brand-teal)" />
          <stop offset="100%" stopColor="var(--brand-gold)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="var(--brand-ink)" />
      <path d="M7 24 C7 13 13 6 24 5 C20 14 15 20 9 24 Z" fill={`url(#mark-${uid})`} />
      <path d="M13 25 C13 18 17 13 24 11 C21 18 18 22 14 25 Z" fill="#FDFAF3" opacity="0.9" />
    </svg>
  );
}
