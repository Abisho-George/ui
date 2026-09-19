"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { classRosterFull, sectionComparison, subjects, testsConducted } from "@/lib/avai-mock-data";
import { EvidenceState } from "@/components/EvidenceState";
import { StudentRosterTable } from "@/components/StudentRosterTable";

/** Principal → Classes → section → one test. Overall class performance in
 * that test, a subject-wise breakdown, then the same student roster table
 * (with the Test fixed to this one) used on the class detail page. */
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
      <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/principal/classes/${section}`)} style={{ marginBottom: 10 }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <Link href="/principal/classes" className="btn--link">
          Classes
        </Link>
        <ChevronRight size={13} />
        <Link href={`/principal/classes/${section}`} className="btn--link">
          {section}
        </Link>
        <ChevronRight size={13} /> {test.name}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">
            {section} · {test.name}
          </h1>
          <p className="page-sub">Conducted {test.date}</p>
        </div>
        {test.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}
      </div>

      {test.status !== "Analysed" ? (
        <div style={{ marginTop: 20 }}>
          <EvidenceState kind="early">{test.name} hasn&apos;t been conducted yet for {section} — no marks to show.</EvidenceState>
        </div>
      ) : (
        <>
          <div className="grid grid--3" style={{ marginTop: 20 }}>
            <div className="stat">
              <div className="stat__label">Class average</div>
              <div className="stat__value">{overallAvg}%</div>
            </div>
            <div className="stat">
              <div className="stat__label">Students</div>
              <div className="stat__value">{roster.length}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Need attention</div>
              <div className="stat__value">{needAttentionCount}</div>
            </div>
          </div>

          <section className="section">
            <div className="section__head">
              <h2 className="section-q">Subject-wise performance</h2>
            </div>
            <div className="card">
              <div className="card__body" style={{ display: "grid", gap: 12 }}>
                {subjectAverages.map((s) => (
                  <div className="bar-row" key={s.subject}>
                    <div className="bar-row__label">{s.subject}</div>
                    <div className="bar">
                      <div className={`bar__fill ${s.pct >= 78 ? "bar__fill--green" : s.pct >= 65 ? "bar__fill--gold" : "bar__fill--risk"}`} style={{ width: `${s.pct}%` }} />
                    </div>
                    <div className="bar-row__val">{s.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <h2 className="section-q">Students in {section} · {test.name}</h2>
            </div>
            <StudentRosterTable roster={roster} testKey={testKey} section={section} testStatus="Analysed" testName={test.name} />
          </section>
        </>
      )}
    </>
  );
}
