"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { analysedTests, classAveragePct, classRosterFull, classSummary, emptyStates, findings, latestTest, overallPctFor, rosterFor, subjects } from "@/lib/avai-mock-data";
import { usePageHeader } from "@/lib/pageHeader";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingCard } from "@/components/FindingCard";
import { DeltaCell } from "@/components/StudentRosterTable";

/** §6.2 Class view — all subjects for one section. */
export default function ClassView() {
  const { section } = useParams<{ section: string }>();
  usePageHeader({ title: `Class ${section}`, backHref: "/teacher/home" });
  const { user } = useAuth();
  const summary = classSummary[section];
  const roster = useMemo(() => rosterFor(section, latestTest.key), [section]);
  const allowed = user?.role === "teacher" && user.assignments.some((a) => a.type === "class" && a.section === section);

  // Movement since the previous analysed test, at class and student level.
  const trend = useMemo(() => {
    if (analysedTests.length < 2) return null;
    const prev = analysedTests[analysedTests.length - 2];
    const full = classRosterFull[section] ?? [];
    let improved = 0;
    let declined = 0;
    for (const s of full) {
      const d = overallPctFor(s, latestTest.key) - overallPctFor(s, prev.key);
      if (d >= 2) improved += 1;
      else if (d <= -2) declined += 1;
    }
    return {
      prevName: prev.name,
      prevPct: Math.round(classAveragePct(section, prev.key)),
      nowPct: Math.round(classAveragePct(section, latestTest.key)),
      delta: Math.round(classAveragePct(section, latestTest.key) - classAveragePct(section, prev.key)),
      improved,
      declined,
      steady: full.length - improved - declined,
    };
  }, [section]);

  if (!summary) return <EvidenceState kind="early">Section {section} is not in this dataset.</EvidenceState>;
  if (!allowed) return <EvidenceState kind="cause">You are not assigned as class teacher for {section}.</EvidenceState>;

  const sectionFindings = findings.filter((f) => f.mostAffectedSections?.some((s) => s.section === section) || !f.mostAffectedSections);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <p className="page-sub" style={{ marginTop: 0 }}>Class view · all subjects</p>
        <AttentionPill level={summary.attention} label={`${summary.attention} risk`} />
      </div>

      <div className="grid grid--3" style={{ marginTop: 18 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{summary.students}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Overall attainment</div>
          <div className="stat__value" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            {summary.overallAttainment}%
            <DeltaCell delta={trend?.delta ?? null} />
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Top finding</div>
          <div className="stat__value stat__value--sm">{summary.topFinding}</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Students in {section}</h2>
          <span className="small muted">All {roster.length} students · {latestTest.name}</span>
        </div>
        <div className="card">
          <div className="table-wrap table-wrap--scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  {subjects.map((s) => (
                    <th key={s} className="num">
                      {s}
                    </th>
                  ))}
                  <th>Main blocker</th>
                  <th>Attention</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id}>
                    <td className="muted">{s.rollNo}</td>
                    <td className="strong">{s.name}</td>
                    {subjects.map((sub) => (
                      <td key={sub} className="num">
                        {s.attainment[sub] ?? "—"}
                      </td>
                    ))}
                    <td>{s.mainBlocker}</td>
                    <td>
                      <AttentionPill level={s.attention} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/teacher/student/${s.id}`} className="btn btn--sm">
                        Report <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section-q">Since {trend?.prevName ?? "the previous assessment"}</h2>
            <p className="section__lead">Movement between the two analysed assessments, student by student.</p>
          </div>
        </div>
        {trend ? (
          <div className="grid grid--4">
            <div className="stat">
              <div className="stat__label">{trend.prevName}</div>
              <div className="stat__value stat__value--sm">{trend.prevPct}%</div>
            </div>
            <div className="stat">
              <div className="stat__label">{latestTest.name}</div>
              <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                {trend.nowPct}%
                <DeltaCell delta={trend.delta} />
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">Improved</div>
              <div className="stat__value stat__value--sm">{trend.improved}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Declined</div>
              <div className="stat__value stat__value--sm">{trend.declined}</div>
            </div>
          </div>
        ) : (
          <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
        )}
        {trend && (
          <p className="small muted" style={{ marginTop: 10 }}>
            {emptyStates.trendTwoPoints}
          </p>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section-q">Findings that touch {section}</h2>
            <p className="section__lead">The same finding unit the principal sees, scoped to this section.</p>
          </div>
        </div>
        <div className="grid grid--2">
          {sectionFindings.map((f) => (
            <FindingCard key={f.id} finding={f} compact />
          ))}
        </div>
      </section>
    </>
  );
}
