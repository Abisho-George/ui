"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { classRosterFull, classTeacherBySection, sectionComparison, subjects, testsConducted } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

type QuickFilter = "all" | "top10" | "attention";

/** Principal → Classes → one section. KPIs, the test calendar for this
 * class, and the full student roster with test/subject/quick filters. */
export default function ClassDetailPage() {
  const { section } = useParams<{ section: string }>();
  const router = useRouter();
  const [testKey, setTestKey] = useState("unit_test_2");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRosterFull[section] ?? [], [section]);
  const test = testsConducted.find((t) => t.key === testKey);
  const needAttentionCount = roster.filter((s) => s.attention !== "On Track").length;

  const rows = useMemo(() => {
    if (!test || test.status !== "Analysed") return [];
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
    filtered = [...filtered].sort((a, b) => (quickFilter === "top10" ? b.pct - a.pct : Number(a.student.rollNo) - Number(b.student.rollNo)));
    if (quickFilter === "top10") filtered = filtered.slice(0, 10);
    return filtered;
  }, [roster, test, testKey, subjectFilter, quickFilter]);

  if (!summary) {
    return <EvidenceState kind="early">No class named {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <button className="btn btn--ghost btn--sm" onClick={() => router.back()} style={{ marginBottom: 10 }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <Link href="/principal/classes" className="btn--link">
          Classes
        </Link>
        <ChevronRight size={13} /> {section}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">Class {section}</h1>
          <p className="page-sub">Class teacher: {classTeacherBySection[section] ?? "Not assigned"}</p>
        </div>
        <AttentionPill level={summary.attention} />
      </div>

      <div className="grid grid--4" style={{ marginTop: 20 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{roster.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Overall attainment</div>
          <div className="stat__value">{summary.overallAttainment}%</div>
        </div>
        <div className="stat">
          <div className="stat__label">Need attention</div>
          <div className="stat__value">{needAttentionCount}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Tests conducted</div>
          <div className="stat__value">{testsConducted.filter((t) => t.status === "Analysed").length}</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Tests conducted</h2>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="num">Class average</th>
                </tr>
              </thead>
              <tbody>
                {testsConducted.map((t) => {
                  const avg =
                    t.status === "Analysed"
                      ? Math.round(
                          (roster.reduce((sum, s) => sum + subjects.reduce((a, subj) => a + s.scores[t.key][subj].scored / s.scores[t.key][subj].outOf, 0) / subjects.length, 0) /
                            roster.length) *
                            100
                        )
                      : null;
                  return (
                    <tr key={t.key}>
                      <td className="strong">{t.name}</td>
                      <td className="small muted">{t.date}</td>
                      <td>{t.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}</td>
                      <td className="num">{avg != null ? `${avg}%` : <span className="muted">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Students in {section}</h2>
        </div>

        <div className="filterbar" style={{ marginBottom: 0 }}>
          <div className="filter">
            <label htmlFor="test-filter">Test</label>
            <select id="test-filter" className="select" value={testKey} onChange={(e) => setTestKey(e.target.value)}>
              {testsConducted.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}
                  {t.status !== "Analysed" ? " (not yet conducted)" : ""}
                </option>
              ))}
            </select>
          </div>
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
          {(["all", "top10", "attention"] as QuickFilter[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={quickFilter === k}
              className={`tab ${quickFilter === k ? "tab--active" : ""}`}
              onClick={() => setQuickFilter(k)}
            >
              {k === "all" ? "All Students" : k === "top10" ? "Top 10" : "Need Attention"}
            </button>
          ))}
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          {!test || test.status !== "Analysed" ? (
            <div className="placeholder">
              <p>{test?.name ?? "This test"} hasn&apos;t been conducted yet — no marks to show.</p>
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
      </section>
    </>
  );
}
