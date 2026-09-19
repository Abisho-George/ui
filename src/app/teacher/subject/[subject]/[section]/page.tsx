"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { findings, latestTest, rosterFor, subjectSnapshotFor } from "@/lib/avai-mock-data";
import { usePageHeader } from "@/lib/pageHeader";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingCard } from "@/components/FindingCard";
import { MarksEntryGrid } from "@/components/MarksEntryGrid";

/** §6.3 Subject view — one subject, one section, with an Enter Marks tab. */
export default function SubjectView() {
  const params = useParams<{ subject: string; section: string }>();
  const subject = decodeURIComponent(params.subject);
  const section = params.section;
  usePageHeader({ title: `${subject} · ${section}`, backHref: "/teacher/home" });
  const [tab, setTab] = useState<"insights" | "marks">("insights");
  const { user } = useAuth();

  const allowed = user?.role === "teacher" && user.assignments.some((a) => a.type === "subject" && a.subject === subject && a.sections.includes(section));
  if (!allowed) return <EvidenceState kind="cause">You are not assigned to {subject} for {section}.</EvidenceState>;

  const snap = subjectSnapshotFor(subject, section, latestTest.key);
  const subjectFindings = findings.filter((f) => f.subject === subject);
  const roster = rosterFor(section, latestTest.key);

  return (
    <>
      <p className="page-sub" style={{ marginTop: 0 }}>
        After {latestTest.name} · top gap: {snap.topGap}
      </p>

      <div className="tabs" role="tablist" style={{ marginTop: 18 }}>
        <button role="tab" aria-selected={tab === "insights"} className={`tab ${tab === "insights" ? "tab--active" : ""}`} onClick={() => setTab("insights")}>
          Insights
        </button>
        <button role="tab" aria-selected={tab === "marks"} className={`tab ${tab === "marks" ? "tab--active" : ""}`} onClick={() => setTab("marks")}>
          Enter marks
        </button>
      </div>

      {tab === "insights" ? (
        <>
          <div className="grid grid--3" style={{ marginTop: 18 }}>
            <div className="stat">
              <div className="stat__label">Marks tested</div>
              <div className="stat__value">{snap.marksTested}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Avg attainment</div>
              <div className="stat__value">
                {snap.avgAttainment} <span className="small muted" style={{ fontWeight: 500 }}>/ {snap.marksTested}</span>
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">At expected level</div>
              <div className="stat__value">
                {snap.atExpectedLevelPct}%
                <span className="small muted" style={{ fontWeight: 400 }}> of {roster.length}</span>
              </div>
            </div>
          </div>

          <section className="section">
            <div className="section__head">
              <h2 className="section-q">Findings in {subject}</h2>
            </div>
            {subjectFindings.length ? (
              <div className="grid grid--2">
                {subjectFindings.map((f) => (
                  <FindingCard key={f.id} finding={f} compact />
                ))}
              </div>
            ) : (
              <EvidenceState kind="early">No findings in {subject} rise above the evidence threshold from a single test.</EvidenceState>
            )}
          </section>

          <section className="section">
            <div className="section__head">
              <h2 className="section-q">
                {section} students in {subject}
              </h2>
            </div>
            <div className="card">
              <div className="table-wrap table-wrap--scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Student</th>
                      <th className="num">{subject}</th>
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
                        <td className="num">{s.attainment[subject] ?? "—"}</td>
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
        </>
      ) : (
        <MarksEntryGrid key={`${subject}-${section}`} subject={subject} roster={roster} scopeLabel={`${subject} · ${section}`} testKey={latestTest.key} />
      )}
    </>
  );
}
