"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { assessmentContext, classSummary, subjectSectionSnapshot } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

/** §6.1 Teacher home — "My Classes" / "My Subjects" split, scoped to the signed-in teacher. */
export default function TeacherHome() {
  const { user } = useAuth();
  if (!user || user.role !== "teacher") return null;

  const classes = user.assignments.filter((a) => a.type === "class");
  const subjectAssignments = user.assignments.filter((a) => a.type === "subject");

  return (
    <>
      <h1 className="page-title">Welcome, {user.name}</h1>
      <p className="page-sub">
        {assessmentContext.assessmentName} has been analysed. Here is what it says about your classes and subjects.
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
                        <AttentionPill level={s.attention} />
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
                const snap = subjectSectionSnapshot[a.subject];
                return (
                  <div className="card" key={a.subject}>
                    <div className="card__body">
                      <h3 style={{ fontSize: 18 }}>{a.subject}</h3>
                      {snap && (
                        <div className="small muted" style={{ marginTop: 4 }}>
                          {snap.marksTested} marks tested · avg {snap.avgAttainment} · {snap.atExpectedLevelPct}% at expected level
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {a.sections.map((s) => (
                          <Link key={s} href={`/teacher/subject/${encodeURIComponent(a.subject)}/${s}`} className="btn btn--sm">
                            {s} <ArrowRight size={12} />
                          </Link>
                        ))}
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
