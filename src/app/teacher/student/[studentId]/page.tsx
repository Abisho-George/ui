"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, Send, Share2 } from "lucide-react";
import { classRoster, teacherFacingStudentReport } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

type ReportState = { issued: boolean; sharedWithStudent: boolean };

/**
 * §6.4 Teacher-facing student report. Issue/Share toggle state locally:
 * Issue → disables itself and enables Share; Share → marks shared.
 * Nothing is persisted (🔧 share is BACKEND REQUIRED).
 */
export default function StudentReportPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const roster = classRoster.find((s) => s.id === studentId);
  const base = teacherFacingStudentReport;
  const isAditi = studentId === "student_aditi";

  const [state, setState] = useState<ReportState[]>(() =>
    base.subjectReports.map((r) => (isAditi ? { issued: r.issued, sharedWithStudent: r.sharedWithStudent } : { issued: false, sharedWithStudent: false }))
  );

  if (!roster) return <EvidenceState kind="early">No student with id {studentId} in this dataset.</EvidenceState>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="eyebrow">Student report · {roster.section}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            {roster.name}
          </h1>
          <p className="page-sub">Roll no. {roster.rollNo} · Main blocker: {roster.mainBlocker}</p>
        </div>
        <AttentionPill level={roster.attention} />
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 22 }}>
        {base.subjectReports.map((r, i) => {
          const st = state[i];
          return (
            <div className="card" key={r.subject}>
              <div className="card__head">
                <div>
                  <div className="eyebrow">{r.assessment}</div>
                  <h3 style={{ fontSize: 18, marginTop: 4 }}>{r.subject}</h3>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{roster.attainment[r.subject] ? roster.attainment[r.subject] : r.score}</div>
              </div>
              <div className="card__body">
                <div className="grid grid--2">
                  <div>
                    <div className="eyebrow">Strengths</div>
                    <ul className="list-plain" style={{ marginTop: 6 }}>
                      {r.strengths.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="eyebrow">Focus areas</div>
                    <ul className="list-plain" style={{ marginTop: 6 }}>
                      {r.focusAreas.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="card__foot" style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {st.issued ? <span className="tag tag--green"><Check size={12} /> Issued</span> : <span className="tag">Draft</span>}
                  {st.sharedWithStudent ? <span className="tag tag--teal"><Check size={12} /> Shared with student</span> : <span className="tag">Not shared</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    disabled={st.issued}
                    onClick={() => setState((s) => s.map((x, j) => (j === i ? { ...x, issued: true } : x)))}
                  >
                    <Send size={13} /> {st.issued ? "Issued" : "Issue"}
                  </button>
                  <button
                    className="btn btn--primary"
                    disabled={!st.issued || st.sharedWithStudent}
                    onClick={() => setState((s) => s.map((x, j) => (j === i ? { ...x, sharedWithStudent: true } : x)))}
                  >
                    <Share2 size={13} /> {st.sharedWithStudent ? "Shared" : "Share with student"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <EvidenceState kind="early">Issue and share are demo-only in this build: state resets on reload and nothing reaches the student account.</EvidenceState>
      </div>
    </>
  );
}
