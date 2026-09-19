"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { classRosterFull, classTeacherBySection, sectionComparison, subjects, testsConducted } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { StudentRosterTable } from "@/components/StudentRosterTable";

/** Principal → Classes → one section. KPIs, the test calendar for this
 * class (each test clickable through to its own class-in-that-test page),
 * and the full student roster with test/subject/quick filters. */
export default function ClassDetailPage() {
  const { section } = useParams<{ section: string }>();
  const router = useRouter();
  const [testKey, setTestKey] = useState("unit_test_2");

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRosterFull[section] ?? [], [section]);
  const test = testsConducted.find((t) => t.key === testKey);
  const needAttentionCount = roster.filter((s) => s.attention !== "On Track").length;

  if (!summary) {
    return <EvidenceState kind="early">No class named {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <button className="btn btn--ghost btn--sm" onClick={() => router.push("/principal/classes")} style={{ marginBottom: 10 }}>
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
            <table className="table table--hover">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="num">Class average</th>
                  <th></th>
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
                    <tr key={t.key} onClick={() => router.push(`/principal/classes/${section}/tests/${t.key}`)}>
                      <td className="strong">{t.name}</td>
                      <td className="small muted">{t.date}</td>
                      <td>{t.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}</td>
                      <td className="num">{avg != null ? `${avg}%` : <span className="muted">—</span>}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className="btn--link">View →</span>
                      </td>
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
        </div>

        <div style={{ marginTop: 14 }}>
          <StudentRosterTable roster={roster} testKey={testKey} section={section} testStatus={test?.status ?? "Scheduled"} testName={test?.name} />
        </div>
      </section>
    </>
  );
}
