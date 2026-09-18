"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Save } from "lucide-react";
import { assessmentContext, classRoster, pageHeaders, questionSets, sections, subjects } from "@/lib/avai-mock-data";

type MarksState = Record<string, Record<string, string>>; // studentId -> questionKey -> value

/** §5.10 Enter Marks. Question-wise entry grid held entirely in local state;
 * "Save" only confirms with a toast — nothing is persisted. */
export default function EnterMarksPage() {
  const [assessment, setAssessment] = useState(assessmentContext.assessmentOptions[0].label);
  const [section, setSection] = useState<string>(sections[0]);
  const [subject, setSubject] = useState<string>(subjects[0]);
  const [marks, setMarks] = useState<MarksState>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const questions = questionSets[subject] ?? [];
  const maxTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0);
  const roster = useMemo(() => classRoster.filter((s) => s.section === section), [section]);

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
    setToast(`Saved marks for ${entered} of ${roster.length} students · ${section} · ${subject} (local only).`);
  }

  return (
    <>
      <h1 className="page-title">{pageHeaders.enterMarks.title}</h1>
      <p className="page-sub">{pageHeaders.enterMarks.blurb}</p>

      <div className="filterbar" style={{ marginTop: 20 }}>
        <div className="filter">
          <label htmlFor="em-assessment">Assessment</label>
          <select id="em-assessment" className="select" value={assessment} onChange={(e) => setAssessment(e.target.value)}>
            {assessmentContext.assessmentOptions.map((o) => (
              <option key={o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="em-section">Section</label>
          <select id="em-section" className="select" value={section} onChange={(e) => setSection(e.target.value)}>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="em-subject">Subject</label>
          <select id="em-subject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filterbar__spacer" />
        <button className="btn btn--primary" onClick={save} disabled={roster.length === 0}>
          <Save size={15} /> Save marks
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {roster.length === 0 ? (
          <div className="placeholder">
            <p>No students on record for {section} in this demo dataset. Try X-A, X-B, X-C or X-D.</p>
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
        <div className="card__foot small muted">Marks entered here are held in local state for this demo and reset on reload.</div>
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
