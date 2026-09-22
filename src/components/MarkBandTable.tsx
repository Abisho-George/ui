"use client";

import type { MarkBand } from "@/lib/avai-mock-data";

export interface BandTableRow {
  key: string;
  label: string;
  counts: { band: MarkBand; count: number }[];
}

/** A row-per-cohort, column-per-band table with a clickable count in every
 * cell — the click is what opens the student list for that (row, band). A
 * zero renders muted and unclickable rather than a dead link. */
/** Mixes a band's hue into white so every count sits on its own tinted
 * chip — the distinction the plain-number version was missing — without
 * needing a legend to say which column is which. */
function tint(hex: string, amount = 0.85) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function MarkBandTable({
  bands,
  rows,
  colors,
  onOpen,
}: {
  bands: MarkBand[];
  rows: BandTableRow[];
  colors: string[];
  onOpen: (rowKey: string, band: MarkBand) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            {bands.map((b, i) => (
              <th key={b.label} className="num">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], flex: "0 0 auto" }} aria-hidden="true" />
                  {b.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="strong">{row.label}</td>
              {row.counts.map((c, i) =>
                c.count > 0 ? (
                  <td key={c.band.label} className="num">
                    <button
                      onClick={() => onOpen(row.key, c.band)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 999,
                        padding: "4px 12px",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        background: tint(colors[i]),
                        color: colors[i],
                      }}
                    >
                      {c.count}
                    </button>
                  </td>
                ) : (
                  <td key={c.band.label} className="num muted">
                    0
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
