"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Save } from "lucide-react";
import { questionSets, type RosterStudent } from "@/lib/avai-mock-data";

type MarksState = Record<string, Record<string, string>>; // studentId -> questionKey -> value

/** §5.10 / §6.3 Question-wise marks entry grid. Local state only — "Save"
 * confirms with a toast and nothing persists. Shared by Principal → Enter
 * Marks and the Teacher subject view's Enter Marks tab. */
export function MarksEntryGrid({ subject, roster, scopeLabel }: { subject: string; roster: RosterStudent[]; scopeLabel: string }) {
  const [marks, setMarks] = useState<MarksState>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const questions = questionSets[subject] ?? [];
  const maxTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0);

  function setMark(studentId: string, qKey: string, raw: string, max: number) {
    const n = Number(raw);
    const clamped = raw === "" ? "" : String(Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0)));
    setMarks((m) => ({ ...m, [studentId]: { ...m[studentId], [qKey]: clamped } }));
  }

  function totalFor(studentId: string) {
    const row = marks[studentId] ?? {};
    return questions.reduce((sum, q) => sum + (Number(row[q.key]) || 0), 0);
  }

  function save() {
    const entered = roster.filter((s) => questions.some((q) => (marks[s.id]?.[q.key] ?? "") !== "")).length;
    setToast(`Saved marks for ${entered} of ${roster.length} students · ${scopeLabel} (local only).`);
  }

  if (!questions.length) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="placeholder">
          <p>No question set defined for {subject} in this demo dataset.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card" style={{ marginTop: 16 }}>
        {roster.length === 0 ? (
          <div className="placeholder">
            <p>No students on record for this section in this demo dataset.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  {questions.map((q) => (
                    <th key={q.key} className="num">
                      {q.label}
                      <div className="muted" style={{ fontWeight: 400 }}>
                        /{q.maxMarks}
                      </div>
                    </th>
                  ))}
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => {
                  const total = totalFor(s.id);
                  return (
                    <tr key={s.id}>
                      <td className="mono">{s.rollNo}</td>
                      <td className="strong">{s.name}</td>
                      {questions.map((q) => (
                        <td key={q.key} className="num">
                          <input
                            className="input"
                            style={{ width: 56, padding: "6px 8px", textAlign: "right" }}
                            inputMode="numeric"
                            placeholder="—"
                            value={marks[s.id]?.[q.key] ?? ""}
                            onChange={(e) => setMark(s.id, q.key, e.target.value, q.maxMarks)}
                          />
                        </td>
                      ))}
                      <td className="num strong">
                        {total} <span className="muted" style={{ fontWeight: 400 }}>/{maxTotal}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="card__foot" style={{ justifyContent: "space-between" }}>
          <span className="small muted">Marks entered here are held in local state for this demo and reset on reload.</span>
          <button className="btn btn--primary btn--sm" onClick={save} disabled={roster.length === 0}>
            <Save size={13} /> Save marks
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
