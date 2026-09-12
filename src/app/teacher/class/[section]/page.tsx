"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { classRoster, classSummary, emptyStates, findings } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingCard } from "@/components/FindingCard";

const rosterSubjects = ["Mathematics", "Science", "English", "Social Science"];

/** §6.2 Class view — all subjects for one section. */
export default function ClassView() {
  const { section } = useParams<{ section: string }>();
  const { user } = useAuth();
  const summary = classSummary[section];
  const roster = classRoster.filter((s) => s.section === section);
  const allowed = user?.role === "teacher" && user.assignments.some((a) => a.type === "class" && a.section === section);

  if (!summary) return <EvidenceState kind="early">Section {section} is not in this dataset.</EvidenceState>;
  if (!allowed) return <EvidenceState kind="cause">You are not assigned as class teacher for {section}.</EvidenceState>;

  const sectionFindings = findings.filter((f) => f.mostAffectedSections?.some((s) => s.section === section) || !f.mostAffectedSections);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="eyebrow">Class view · all subjects</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            Class {section}
          </h1>
        </div>
        <AttentionPill level={summary.attention} />
      </div>

      <div className="grid grid--3" style={{ marginTop: 18 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{summary.students}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Overall attainment</div>
          <div className="stat__value">{summary.overallAttainment}%</div>
        </div>
        <div className="stat">
          <div className="stat__label">Top finding</div>
          <div className="stat__value stat__value--sm">{summary.topFinding}</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Students in {section}</h2>
          <span className="small muted">Sample of {roster.length} shown in this build</span>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  {rosterSubjects.map((s) => (
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
                    {rosterSubjects.map((sub) => (
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
            <h2 className="section-q">Findings that touch {section}</h2>
            <p className="section__lead">The same finding unit the principal sees, scoped to this section.</p>
          </div>
        </div>
        <div className="grid grid--2">
          {sectionFindings.map((f) => (
            <FindingCard key={f.id} finding={f} compact />
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
        </div>
      </section>
    </>
  );
}
