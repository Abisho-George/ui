"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Save, ScanLine, Upload, X } from "lucide-react";
import { ocrMarksFor, questionSets, type RosterStudent } from "@/lib/avai-mock-data";

type MarksState = Record<string, Record<string, string>>; // studentId -> questionKey -> value
type Cell = { studentId: string; qKey: string };

/** §5.10 / §6.3 Question-wise marks entry grid. Local state only — "Save"
 * confirms with a toast and nothing persists. Shared by Principal → Enter
 * Marks and the Teacher subject view's Enter Marks tab.
 *
 * `testKey`, when given, unlocks "Upload answer card": a simulated OCR
 * read of a scanned mark-entry sheet that fills the grid automatically. A
 * few cells are deliberately left unreadable, same as a real scan, and the
 * teacher must resolve them by hand before saving. */
export function MarksEntryGrid({
  subject,
  roster,
  scopeLabel,
  testKey,
}: {
  subject: string;
  roster: RosterStudent[];
  scopeLabel: string;
  testKey?: string;
}) {
  const [marks, setMarks] = useState<MarksState>({});
  const [toast, setToast] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [review, setReview] = useState<Cell[] | null>(null);
  const [reviewValues, setReviewValues] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
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

  const enteredCount = roster.filter((s) => questions.some((q) => (marks[s.id]?.[q.key] ?? "") !== "")).length;

  function save() {
    setToast(`Saved marks for ${enteredCount} of ${roster.length} students · ${scopeLabel} (local only).`);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !testKey) return;
    setScanning(true);
    setTimeout(() => processAnswerCard(), 1400);
  }

  function processAnswerCard() {
    if (!testKey) {
      setScanning(false);
      return;
    }
    const next: MarksState = {};
    const unresolved: Cell[] = [];
    let anyGroundTruth = false;

    for (const s of roster) {
      const ocr = ocrMarksFor(s.id, testKey, subject);
      if (!ocr) continue;
      anyGroundTruth = true;
      const row: Record<string, string> = {};
      for (const q of questions) {
        // ~1 in 16 cells comes back unreadable, same as a real scan would.
        if (Math.random() < 0.06) unresolved.push({ studentId: s.id, qKey: q.key });
        else row[q.key] = String(ocr[q.key]);
      }
      next[s.id] = row;
    }

    setScanning(false);

    if (!anyGroundTruth) {
      setToast(`${subject} hasn't been analysed yet, so there's nothing on record to read from a scanned card.`);
      return;
    }

    setMarks(next);
    if (unresolved.length > 0) {
      setReview(unresolved);
      setReviewValues({});
    } else {
      setToast(`Answer card read for all ${roster.length} students · ${scopeLabel}.`);
    }
  }

  function confirmReview() {
    if (!review) return;
    setMarks((m) => {
      const next = { ...m };
      for (const cell of review) {
        const v = reviewValues[`${cell.studentId}|${cell.qKey}`];
        if (v === undefined || v === "") continue;
        next[cell.studentId] = { ...next[cell.studentId], [cell.qKey]: v };
      }
      return next;
    });
    setToast(`Answer card read, with ${review.length} mark${review.length === 1 ? "" : "s"} entered manually · ${scopeLabel}.`);
    setReview(null);
    setReviewValues({});
  }

  const reviewFilled = review ? review.every((c) => (reviewValues[`${c.studentId}|${c.qKey}`] ?? "") !== "") : false;

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
        <div className="card__head" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="small muted">Question-wise entry, or upload a filled answer card to read marks automatically.</div>
          {testKey && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" hidden onChange={onFilePicked} />
              <button className="btn btn--sm" onClick={() => fileInputRef.current?.click()} disabled={scanning}>
                {scanning ? <ScanLine size={13} className="spin" /> : <Upload size={13} />} {scanning ? "Reading answer card…" : "Upload answer card"}
              </button>
            </>
          )}
        </div>
        {roster.length === 0 ? (
          <div className="placeholder">
            <p>No students on record for this section in this demo dataset.</p>
          </div>
        ) : (
          <div className="table-wrap table-wrap--scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  {questions.map((q) => (
                    <th key={q.key} className="num" title={q.chapter}>
                      {q.label}
                      <div className="muted" style={{ fontWeight: 400 }}>
                        /{q.maxMarks}
                      </div>
                      <div className="muted" style={{ fontWeight: 400, fontSize: 10.5, maxWidth: 92, whiteSpace: "normal" }}>
                        {q.chapter}
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
          <span className="small muted">
            {enteredCount} of {roster.length} students started · held in local state for this demo and reset on reload.
          </span>
          <button className="btn btn--primary btn--sm" onClick={save} disabled={roster.length === 0}>
            <Save size={13} /> Save marks
          </button>
        </div>
      </div>

      <AnimatePresence>
        {review && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" role="dialog" aria-modal="true" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
              <div className="modal__head">
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} style={{ color: "var(--risk)" }} /> {review.length} mark{review.length === 1 ? "" : "s"} need review
                </h3>
                <button className="iconbtn" onClick={() => setReview(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="modal__body">
                <p className="small muted" style={{ margin: 0 }}>
                  The scan couldn&apos;t read these marks clearly. Enter each one by hand to finish processing this answer card.
                </p>
                <div style={{ display: "grid", gap: 10, maxHeight: 320, overflowY: "auto" }}>
                  {review.map((c) => {
                    const student = roster.find((r) => r.id === c.studentId);
                    const q = questions.find((x) => x.key === c.qKey);
                    const key = `${c.studentId}|${c.qKey}`;
                    return (
                      <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div className="small">
                          <span className="strong">{student?.name ?? c.studentId}</span> · Roll {student?.rollNo} · {q?.label}{" "}
                          <span className="muted">/{q?.maxMarks}</span>
                        </div>
                        <input
                          className="input"
                          style={{ width: 64, padding: "6px 8px", textAlign: "right" }}
                          inputMode="numeric"
                          placeholder="—"
                          value={reviewValues[key] ?? ""}
                          onChange={(e) => {
                            const max = q?.maxMarks ?? 0;
                            const n = Number(e.target.value);
                            const clamped = e.target.value === "" ? "" : String(Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0)));
                            setReviewValues((v) => ({ ...v, [key]: clamped }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal__foot">
                <button className="btn" onClick={() => setReview(null)}>
                  Finish later
                </button>
                <button className="btn btn--primary" disabled={!reviewFilled} onClick={confirmReview}>
                  <Save size={14} /> Confirm marks
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
