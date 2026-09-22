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
              {row.counts.map((c) =>
                c.count > 0 ? (
                  <td key={c.band.label} className="num">
                    <button className="btn--link" onClick={() => onOpen(row.key, c.band)}>
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
