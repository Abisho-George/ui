"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { assessmentContext, classSummary, latestTest, subjectSnapshotFor } from "@/lib/avai-mock-data";
import { usePageHeader } from "@/lib/pageHeader";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

/** §6.1 Teacher home — "My Classes" / "My Subjects" split, scoped to the signed-in teacher. */
export default function TeacherHome() {
  usePageHeader({ title: "Teacher Home" });
  const { user } = useAuth();
  if (!user || user.role !== "teacher") return null;

  const classes = user.assignments.filter((a) => a.type === "class");
  const subjectAssignments = user.assignments.filter((a) => a.type === "subject");

  return (
    <>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Welcome, {user.name} · {assessmentContext.assessmentName} has been analysed. Here is what it says about your classes and subjects.
      </p>

      <div className="grid grid--2" style={{ marginTop: 24, alignItems: "start" }}>
        <section>
          <div className="section__head">
            <h2 className="section-q">
              <Users size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} /> My Classes
            </h2>
          </div>
          {classes.length === 0 ? (
            <EvidenceState kind="early">You are not a class teacher this year. Your subject views are on the right.</EvidenceState>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {classes.map((a) => {
                if (a.type !== "class") return null;
                const s = classSummary[a.section];
                return (
                  <Link href={`/teacher/class/${a.section}`} key={a.section} className="card" style={{ display: "block" }}>
                    <div className="card__body">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: 18 }}>Class {a.section}</h3>
                        <AttentionPill level={s.attention} label={`${s.attention} risk`} />
                      </div>
                      <div className="grid grid--2" style={{ marginTop: 12 }}>
                        <div>
                          <div className="eyebrow">Students</div>
                          <div style={{ fontSize: 20, fontWeight: 650 }}>{s.students}</div>
                        </div>
                        <div>
                          <div className="eyebrow">Overall attainment</div>
                          <div style={{ fontSize: 20, fontWeight: 650 }}>{s.overallAttainment}%</div>
                        </div>
                      </div>
                      <div className="small muted" style={{ marginTop: 10 }}>
                        Top finding: {s.topFinding}
                      </div>
                    </div>
                    <div className="card__foot" style={{ justifyContent: "flex-end" }}>
                      <span className="btn--link">
                        Open class view <ArrowRight size={13} style={{ verticalAlign: "-2px" }} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="section__head">
            <h2 className="section-q">
              <BookOpen size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} /> My Subjects
            </h2>
          </div>
          {subjectAssignments.length === 0 ? (
            <EvidenceState kind="early">No subject assignments yet.</EvidenceState>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {subjectAssignments.map((a) => {
                if (a.type !== "subject") return null;
                return (
                  <div className="card" key={a.subject}>
                    <div className="card__body">
                      <h3 style={{ fontSize: 18 }}>{a.subject}</h3>
                      {/* One row per section: a subject average only means
                          something against the class it was scored in. */}
                      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                        {a.sections.map((sec) => {
                          const snap = subjectSnapshotFor(a.subject, sec, latestTest.key);
                          return (
                            <Link
                              key={sec}
                              href={`/teacher/subject/${encodeURIComponent(a.subject)}/${sec}`}
                              className="subject-row"
                            >
                              <div>
                                <div className="strong">{sec}</div>
                                <div className="small muted">
                                  avg {snap.avgAttainment} / {snap.marksTested} · {snap.atExpectedLevelPct}% at expected level · {snap.topGap}
                                </div>
                              </div>
                              <ArrowRight size={14} className="muted" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
