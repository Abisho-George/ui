"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { classRosterFull, sectionComparison, subjects, testsConducted } from "@/lib/avai-mock-data";
import { EvidenceState } from "@/components/EvidenceState";
import { StudentRosterTable } from "@/components/StudentRosterTable";

/** Principal → Classes → section → one test. A single-screen "sheet": a
 * compact header (title + tiny KPI row, top right), a compact subject-wise
 * strip, then the student roster table filling the rest of the viewport
 * with its own internal scroll. No page-level scrolling. */
export default function ClassTestPage() {
  const { section, testKey } = useParams<{ section: string; testKey: string }>();
  const router = useRouter();

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRosterFull[section] ?? [], [section]);
  const test = testsConducted.find((t) => t.key === testKey);

  const subjectAverages = useMemo(() => {
    if (!test || test.status !== "Analysed" || roster.length === 0) return [];
    return subjects.map((subj) => {
      const pct = Math.round((roster.reduce((sum, s) => sum + s.scores[testKey][subj].scored / s.scores[testKey][subj].outOf, 0) / roster.length) * 100);
      return { subject: subj, pct };
    });
  }, [roster, test, testKey]);

  const overallAvg = subjectAverages.length ? Math.round(subjectAverages.reduce((sum, s) => sum + s.pct, 0) / subjectAverages.length) : null;
  const needAttentionCount = roster.filter((s) => s.attention !== "On Track").length;

  if (!summary || !test) {
    return <EvidenceState kind="early">No such test for {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flex: "0 0 auto" }}>
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/principal/classes/${section}`)}>
            <ArrowLeft size={13} /> Back
          </button>
          <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <Link href="/principal/classes" className="btn--link">
              Classes
            </Link>
            <ChevronRight size={13} />
            <Link href={`/principal/classes/${section}`} className="btn--link">
              {section}
            </Link>
            <ChevronRight size={13} /> {test.name}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
            <h1 className="page-title" style={{ fontSize: 19 }}>
              {section} · {test.name}
            </h1>
            {test.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}
          </div>
          <div className="small muted">Conducted {test.date}</div>
          {test.status === "Analysed" && (
            <div style={{ display: "flex", gap: 18, marginTop: 8, justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Class average</div>
                <div className="stat__value stat__value--sm">{overallAvg}%</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Students</div>
                <div className="stat__value stat__value--sm">{roster.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Need attention</div>
                <div className="stat__value stat__value--sm">{needAttentionCount}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {test.status !== "Analysed" ? (
        <div style={{ marginTop: 20 }}>
          <EvidenceState kind="early">{test.name} hasn&apos;t been conducted yet for {section} — no marks to show.</EvidenceState>
        </div>
      ) : (
        <>
          <div className="grid grid--5" style={{ marginTop: 14, flex: "0 0 auto" }}>
            {subjectAverages.map((s) => (
              <div className="stat" key={s.subject}>
                <div className="stat__label">{s.subject}</div>
                <div className="stat__value stat__value--sm">{s.pct}%</div>
                <div className="bar" style={{ marginTop: 6 }}>
                  <div className={`bar__fill ${s.pct >= 78 ? "bar__fill--green" : s.pct >= 65 ? "bar__fill--gold" : "bar__fill--risk"}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <StudentRosterTable roster={roster} testKey={testKey} section={section} testStatus="Analysed" testName={test.name} fillHeight />
          </div>
        </>
      )}
    </>
  );
}
