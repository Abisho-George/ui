/**
 * AVAI mascot & logo — real brand artwork (public/mascot, public/brand).
 *
 * Placement rule (spec §0) still applies: <Mascot> only appears on login,
 * loading states and student screens — never inside the Principal or
 * Teacher shells. <Logomark> is the compact app-icon glyph and is allowed
 * everywhere, including the staff sidebars.
 */
export type MascotPose = "hello" | "improve" | "achieve" | "neutral" | "thinking";

const poseSrc: Record<MascotPose, string> = {
  hello: "/mascot/hello.png",
  improve: "/mascot/improve.png",
  achieve: "/mascot/achieve.png",
  neutral: "/mascot/practice.png",
  thinking: "/mascot/loading.png",
};

export function Mascot({ pose = "neutral", size = 120, className }: { pose?: MascotPose; size?: number; className?: string }) {
  const inset = Math.round(size * (pose === "thinking" ? 0.03 : 0.14));
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#fbfbfa",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        flex: "0 0 auto",
        padding: inset,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poseSrc[pose]}
        alt={`AVAI mascot, ${pose} pose`}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    </span>
  );
}

/** Compact app-icon logomark used in sidebars/topbars/login. Self-contained artwork. */
export function Logomark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-icon.png"
      width={size}
      height={size}
      alt="AVAI"
      style={{ display: "block", borderRadius: size * 0.28, flex: "0 0 auto" }}
    />
  );
}
