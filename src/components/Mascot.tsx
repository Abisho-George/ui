/**
 * AVAI mascot — inline SVG placeholder.
 *
 * The brand reference image (AVAI_Mascot.jpeg) was not available in this
 * build, so this is a swappable stand-in that carries the pose vocabulary the
 * spec uses: "hello" (login / student home), "improve" (trend down/flat),
 * "achieve" (trend up), "neutral", and "thinking" (loading states).
 *
 * Placement rule (spec §0): login, loading states and student screens ONLY.
 * Never render this inside the Principal or Teacher shells.
 */
export type MascotPose = "hello" | "improve" | "achieve" | "neutral" | "thinking";

export function Mascot({ pose = "neutral", size = 120, className }: { pose?: MascotPose; size?: number; className?: string }) {
  const eye = pose === "thinking" ? "M-9 -4 h6" : undefined;
  const mouth =
    pose === "achieve" ? "M-12 8 q12 12 24 0" : pose === "improve" ? "M-10 10 q10 4 20 0" : pose === "thinking" ? "M-6 10 h12" : "M-10 8 q10 8 20 0";
  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      role="img"
      aria-label={`AVAI mascot, ${pose} pose`}
      className={className}
      style={{ display: "block" }}
    >
      {/* body */}
      <ellipse cx="0" cy="22" rx="34" ry="28" fill="var(--brand-teal)" />
      <ellipse cx="0" cy="26" rx="20" ry="16" fill="var(--brand-cream)" opacity="0.9" />
      {/* head */}
      <circle cx="0" cy="-12" r="30" fill="var(--brand-teal)" />
      <circle cx="0" cy="-8" r="22" fill="var(--brand-cream)" />
      {/* cap / gold crest */}
      <path d="M-30 -30 q30 -24 60 0 l-6 4 q-24 -16 -48 0z" fill="var(--brand-gold)" />
      <circle cx="0" cy="-44" r="4" fill="var(--brand-gold)" />
      {/* eyes */}
      {eye ? (
        <>
          <path d={eye} transform="translate(0 -4)" stroke="var(--brand-ink)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="9" cy="-8" r="3" fill="var(--brand-ink)" />
        </>
      ) : (
        <>
          <circle cx="-9" cy="-8" r="3" fill="var(--brand-ink)" />
          <circle cx="9" cy="-8" r="3" fill="var(--brand-ink)" />
          {pose === "achieve" && (
            <>
              <path d="M-14 -14 q5 -4 10 0" stroke="var(--brand-ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M4 -14 q5 -4 10 0" stroke="var(--brand-ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}
        </>
      )}
      {/* cheeks */}
      <circle cx="-15" cy="0" r="3.5" fill="var(--brand-gold)" opacity="0.55" />
      <circle cx="15" cy="0" r="3.5" fill="var(--brand-gold)" opacity="0.55" />
      {/* mouth */}
      <path d={mouth} transform="translate(0 -6)" stroke="var(--brand-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* arms by pose */}
      {pose === "hello" && (
        <>
          <path d="M30 10 q18 -22 22 -40" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="-32" r="7" fill="var(--brand-gold)" />
          <path d="M-30 16 q-14 6 -18 18" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
        </>
      )}
      {pose === "achieve" && (
        <>
          <path d="M30 10 q16 -16 16 -36" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M-30 10 q-16 -16 -16 -36" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M46 -30 l3 -8 3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5z" fill="var(--brand-gold)" />
          <path d="M-46 -30 l3 -8 3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5z" fill="var(--brand-gold)" />
        </>
      )}
      {pose === "improve" && (
        <>
          <path d="M30 14 q14 0 20 -14" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M-30 16 q-14 6 -18 18" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="40" y="-12" width="16" height="20" rx="2" fill="var(--brand-cream)" stroke="var(--brand-ink)" strokeWidth="1.5" />
          <path d="M43 -6 h10 M43 -1 h10 M43 4 h6" stroke="var(--brand-ink)" strokeWidth="1.5" />
        </>
      )}
      {(pose === "neutral" || pose === "thinking") && (
        <>
          <path d="M30 16 q14 6 18 18" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M-30 16 q-14 6 -18 18" stroke="var(--brand-teal)" strokeWidth="9" fill="none" strokeLinecap="round" />
        </>
      )}
      {pose === "thinking" && (
        <>
          <circle cx="38" cy="-40" r="3" fill="var(--brand-gold)" />
          <circle cx="46" cy="-48" r="4" fill="var(--brand-gold)" />
          <circle cx="56" cy="-56" r="5" fill="var(--brand-gold)" />
        </>
      )}
    </svg>
  );
}

/** Compact logomark used in sidebars/topbars. Not the mascot — it is allowed on staff shells. */
export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand-teal)" />
      <path d="M8 23 L16 8 L24 23 H20.5 L16 14.5 L11.5 23 Z" fill="var(--brand-cream)" />
      <circle cx="16" cy="24.5" r="2" fill="var(--brand-gold)" />
    </svg>
  );
}
