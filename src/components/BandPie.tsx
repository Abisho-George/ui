"use client";

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

/** A donut chart built by hand with stroke-dasharray circles — no charting
 * library in this project. Legend + a native hover tooltip on every slice
 * (via <title>); the center prints the total so the chart still reads with
 * color turned off. */
export function BandPie({ slices, size = 172, centerLabel = "students" }: { slices: PieSlice[]; size?: number; centerLabel?: string }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const r = size / 2;
  const stroke = size * 0.3;
  const radius = r - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${total} ${centerLabel}`}>
        <g transform={`rotate(-90 ${r} ${r})`}>
          {total === 0 ? (
            <circle cx={r} cy={r} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          ) : (
            slices
              .filter((s) => s.value > 0)
              .map((s) => {
                const frac = s.value / total;
                const dash = frac * circumference;
                const gapAdjusted = Math.max(dash - 2, 0.001);
                const el = (
                  <circle
                    key={s.label}
                    cx={r}
                    cy={r}
                    r={radius}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeLinecap="butt"
                    strokeDasharray={`${gapAdjusted} ${circumference - gapAdjusted}`}
                    strokeDashoffset={-offset}
                  >
                    <title>{`${s.label}: ${s.value} of ${total} (${Math.round(frac * 100)}%)`}</title>
                  </circle>
                );
                offset += dash;
                return el;
              })
          )}
        </g>
        <text x={r} y={r - 3} textAnchor="middle" fontSize={size * 0.15} fontWeight={700} fill="var(--text)">
          {total}
        </text>
        <text x={r} y={r + 15} textAnchor="middle" fontSize={size * 0.075} fill="var(--muted)">
          {centerLabel}
        </text>
      </svg>
      <div style={{ display: "grid", gap: 6 }}>
        {slices.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flex: "0 0 auto" }} aria-hidden="true" />
            <span className="muted" style={{ minWidth: 82 }}>
              {s.label}
            </span>
            <span className="strong">{s.value}</span>
            <span className="muted">({total ? Math.round((s.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
