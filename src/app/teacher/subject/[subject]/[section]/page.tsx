"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ClipboardList, MoreVertical, Share2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { classRoster, findings, subjectSectionSnapshot, teacherFacingStudentReport } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingCard } from "@/components/FindingCard";
import { Mascot } from "@/components/Mascot";

const subjectFamily: Record<string, string[]> = { Science: ["Physics", "Chemistry", "Science"] };

/* Mock issuance state: only the fixture student has issued reports (§6.4). */
const issued = (studentId: string) =>
  studentId === "student_aditi" && teacherFacingStudentReport.subjectReports.some((r) => r.issued);

/** §6.3 Subject view — one subject, one section, with an Enter Marks tab placeholder. */
export default function SubjectView() {
  const params = useParams<{ subject: string; section: string }>();
  const subject = decodeURIComponent(params.subject);
  const section = params.section;
  const [tab, setTab] = useState<"insights" | "marks">("insights");
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [marksJob, setMarksJob] = useState<"idle" | "processing">("idle");
  const { user } = useAuth();

  const allowed = user?.role === "teacher" && user.assignments.some((a) => a.type === "subject" && a.subject === subject && a.sections.includes(section));
  if (!allowed) return <EvidenceState kind="cause">You are not assigned to {subject} for {section}.</EvidenceState>;

  const snap = subjectSectionSnapshot[subject];
  const family = subjectFamily[subject] ?? [subject];
  const subjectFindings = findings.filter((f) => family.includes(f.subject));
  const roster = classRoster.filter((s) => s.section === section);

  return (
    <>
      <div className="eyebrow">Subject view</div>
      <h1 className="page-title" style={{ marginTop: 4 }}>
        {subject} · {section}
      </h1>
      <p className="page-sub">{snap ? `Top gap: ${snap.topGap}` : "No subject snapshot in this dataset."}</p>

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
          {snap && (
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
                <div className="stat__value">{snap.atExpectedLevelPct}%</div>
              </div>
            </div>
          )}

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
              <div className="table-wrap">
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
                          <div className="rowactions">
                            <Link href={`/teacher/student/${s.id}`} className="btn btn--sm">
                              Report <ArrowRight size={12} />
                            </Link>
                            <button
                              className="btn btn--sm btn--ghost"
                              aria-label={`Actions for ${s.name}`}
                              aria-expanded={rowMenu === s.id}
                              onClick={() => setRowMenu(rowMenu === s.id ? null : s.id)}
                            >
                              <MoreVertical size={13} />
                            </button>
                            {rowMenu === s.id && (
                              <div className="rowmenu" role="menu">
                                {/* §6.3 + §9: only available once the report is issued, and a
                                    disabled action always states its reason. */}
                                <button
                                  role="menuitem"
                                  className="rowmenu__item"
                                  disabled={!issued(s.id)}
                                  title={issued(s.id) ? "Generates the student's one-time PIN" : "Issue this report first"}
                                >
                                  <Share2 size={13} /> Share with student
                                </button>
                                {!issued(s.id) && <div className="rowmenu__why">Issue this report first.</div>}
                              </div>
                            )}
                          </div>
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
        <div className="placeholder" style={{ marginTop: 20 }}>
          {marksJob === "processing" ? (
            <>
              {/* §6.3: a staff screen, but a wait state — the mascot's Loading
                  pose replaces a bare spinner while the job polls. */}
              <Mascot pose="loading" size={96} />
              <h3 style={{ marginTop: 14, color: "var(--brand-ink)" }}>Processing marks for {subject} · {section}</h3>
              <p style={{ marginTop: 6 }}>Getting you to your next step…</p>
              <button className="btn btn--sm" style={{ marginTop: 14 }} onClick={() => setMarksJob("idle")}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <ClipboardList size={28} style={{ color: "var(--brand-gold)" }} />
              <h3 style={{ marginTop: 10, color: "var(--brand-ink)" }}>Question-wise marks entry</h3>
              <p style={{ marginTop: 6 }}>
                Enter marks for {subject} · {section} question by question. The entry grid itself is not part of
                this build pass.
              </p>
              <button className="btn btn--primary btn--sm" style={{ marginTop: 14 }} onClick={() => setMarksJob("processing")}>
                Preview the processing state
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
