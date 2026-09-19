"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { subjects, type FullRosterStudent } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

type QuickFilter = "all" | "top10" | "attention" | "critical";

const quickFilterLabel: Record<QuickFilter, string> = {
  all: "All Students",
  top10: "Top 10",
  attention: "Need Attention",
  critical: "Critical",
};

/** The student roster table shared by Class detail and the per-test class
 * page: subject filter, quick presets (All / Top 10 / Need Attention /
 * Critical), and a fixed-height, sticky-header, internally-scrolling table
 * of the full roster (not a sample, not paginated). */
export function StudentRosterTable({
  roster,
  testKey,
  section,
  testStatus,
  testName,
}: {
  roster: FullRosterStudent[];
  testKey: string;
  section: string;
  testStatus: "Analysed" | "Scheduled";
  testName?: string;
}) {
  const router = useRouter();
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const rows = useMemo(() => {
    if (testStatus !== "Analysed") return [];
    const withScore = roster.map((s) => {
      const testScores = s.scores[testKey];
      const pct =
        subjectFilter === "All"
          ? (subjects.reduce((sum, subj) => sum + testScores[subj].scored / testScores[subj].outOf, 0) / subjects.length) * 100
          : (testScores[subjectFilter].scored / testScores[subjectFilter].outOf) * 100;
      return { student: s, pct: Math.round(pct) };
    });
    let filtered = withScore;
    if (quickFilter === "attention") filtered = filtered.filter((r) => r.student.attention !== "On Track");
    if (quickFilter === "critical") filtered = filtered.filter((r) => r.student.attention === "Intervention");
    filtered = [...filtered].sort((a, b) => (quickFilter === "top10" ? b.pct - a.pct : Number(a.student.rollNo) - Number(b.student.rollNo)));
    if (quickFilter === "top10") filtered = filtered.slice(0, 10);
    return filtered;
  }, [roster, testKey, testStatus, subjectFilter, quickFilter]);

  return (
    <>
      <div className="filterbar" style={{ marginBottom: 0 }}>
        <div className="filter">
          <label htmlFor="subject-filter">Subject</label>
          <select id="subject-filter" className="select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="All">All subjects</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="tabs" role="tablist" style={{ marginTop: 14 }}>
        {(["all", "top10", "attention", "critical"] as QuickFilter[]).map((k) => (
          <button key={k} role="tab" aria-selected={quickFilter === k} className={`tab ${quickFilter === k ? "tab--active" : ""}`} onClick={() => setQuickFilter(k)}>
            {quickFilterLabel[k]}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        {testStatus !== "Analysed" ? (
          <div className="placeholder">
            <p>{testName ?? "This test"} hasn&apos;t been conducted yet — no marks to show.</p>
          </div>
        ) : (
          <div className="table-wrap table-wrap--scroll">
            <table className="table table--hover">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  <th className="num">{subjectFilter === "All" ? "Overall" : subjectFilter}</th>
                  <th>Main blocker</th>
                  <th>Attention</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EvidenceState kind="early" compact>
                        No students match this filter.
                      </EvidenceState>
                    </td>
                  </tr>
                )}
                {rows.map(({ student: s, pct }) => (
                  <tr key={s.id} onClick={() => router.push(`/principal/classes/${section}/${s.id}`)}>
                    <td className="muted">{s.rollNo}</td>
                    <td className="strong">{s.name}</td>
                    <td className="num">{pct}%</td>
                    <td>{s.mainBlocker}</td>
                    <td>
                      <AttentionPill level={s.attention} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/principal/classes/${section}/${s.id}`} className="btn btn--sm" onClick={(e) => e.stopPropagation()}>
                        Report <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card__foot small muted">
          {quickFilter === "top10" ? `Top ${rows.length} of ${roster.length}` : `Showing ${rows.length} of ${roster.length} students.`}
        </div>
      </div>
    </>
  );
}
