"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Check, Copy, Send, Share2, X } from "lucide-react";
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

  /* §6.4 Share flow: confirm modal → one-time PIN, shown once. */
  const [confirmShare, setConfirmShare] = useState<number | null>(null);
  const [pin, setPin] = useState<{ subject: string; pin: string } | null>(null);

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
                    title={st.issued ? "This report is already issued" : "Freezes the live diagnosis for this report"}
                    onClick={() => setState((s) => s.map((x, j) => (j === i ? { ...x, issued: true } : x)))}
                  >
                    <Send size={13} /> {st.issued ? "Issued" : "Issue"}
                  </button>
                  <button
                    className="btn btn--primary"
                    disabled={!st.issued || st.sharedWithStudent}
                    title={st.sharedWithStudent ? "Already shared" : st.issued ? "Generates a one-time PIN for the student" : "Issue this report first"}
                    onClick={() => setConfirmShare(i)}
                  >
                    <Share2 size={13} /> {st.sharedWithStudent ? "Shared" : "Share with student"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* §6.4 confirmation — never a single-click share (§9) */}
      {confirmShare !== null && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Confirm share">
          <div className="modal">
            <div className="modal__head">
              <h3 style={{ fontSize: 17 }}>Share with {roster.name.split(" ")[0]}?</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => setConfirmShare(null)} aria-label="Close">
                <X size={14} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                This lets {roster.name.split(" ")[0]} sign in and see this {base.subjectReports[confirmShare].subject} report.
                Continue?
              </p>
            </div>
            <div className="modal__foot">
              <button className="btn" onClick={() => setConfirmShare(null)}>
                Cancel
              </button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  const i = confirmShare;
                  setState((s) => s.map((x, j) => (j === i ? { ...x, sharedWithStudent: true } : x)));
                  setPin({ subject: base.subjectReports[i].subject, pin: "4827" });
                  setConfirmShare(null);
                }}
              >
                Share and generate PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-time PIN, shown once — same pattern as staff key issuance */}
      {pin && (
        <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Student PIN">
          <div className="modal">
            <div className="modal__head">
              <h3 style={{ fontSize: 17 }}>PIN for {roster.name}</h3>
            </div>
            <div className="modal__body">
              <p className="small muted">
                Hand this to the student or parent. It is shown once and cannot be retrieved again.
              </p>
              <div className="pin">
                <span className="pin__value">{pin.pin}</span>
                <button className="btn btn--sm" onClick={() => navigator.clipboard?.writeText(pin.pin)}>
                  <Copy size={12} /> Copy
                </button>
              </div>
              <p className="small muted">
                With roll no. {roster.rollNo} and the school code, this signs {roster.name.split(" ")[0]} in to the{" "}
                {pin.subject} report only.
              </p>
            </div>
            <div className="modal__foot">
              <button className="btn btn--primary" onClick={() => setPin(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <EvidenceState kind="early">Issue and share are demo-only in this build: state resets on reload and nothing reaches the student account.</EvidenceState>
      </div>
    </>
  );
}
