"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Save, ScanLine, X } from "lucide-react";
import { FilePickButtons } from "@/components/FilePickButtons";
import { ocrMarksFor, questionSets, type RosterStudent } from "@/lib/avai-mock-data";

type MarksState = Record<string, Record<string, string>>; // studentId -> questionKey -> value

// A paper can run 15-20+ single-mark questions; cycling a small palette by
// chapter (rather than one colour per question) groups them visually
// without needing as many colours as there are chapters.
const CHAPTER_PALETTE = ["var(--brand-teal)", "var(--brand-gold)", "var(--brand-green)", "var(--info)", "var(--risk)", "var(--brand-ink-soft)"];

/** §5.10 / §6.3 Question-wise marks entry grid. Local state only, "Save"
 * confirms with a toast and nothing persists. Shared by Principal → Enter
 * Marks and the Teacher subject view's Enter Marks tab.
 *
 * `testKey`, when given, unlocks "Upload answer card": a simulated OCR
 * read of a scanned mark-entry sheet that fills the grid automatically. A
 * few cells are deliberately left unreadable, same as a real scan; those stay
 * highlighted in place until the teacher types the mark in. Roll and Student stay
 * pinned to the left as the question columns scroll, so a paper with many
 * questions never loses track of who a row belongs to. */
export function MarksEntryGrid({
  subject,
  roster,
  scopeLabel,
  testKey,
  onProgress,
}: {
  subject: string;
  roster: RosterStudent[];
  scopeLabel: string;
  testKey?: string;
  /** Called whenever the entered/total count changes, so a parent screen
   * can show progress without owning the grid's state itself. */
  onProgress?: (progress: { entered: number; total: number; reviewPending: number }) => void;
}) {
  const [marks, setMarks] = useState<MarksState>({});
  const [toast, setToast] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [photo, setPhoto] = useState<{ url: string | null; name: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => () => {
    if (photo?.url) URL.revokeObjectURL(photo.url);
  }, [photo]);

  const questions = useMemo(() => questionSets[subject] ?? [], [subject]);
  const maxTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0);

  const chapterOrder = useMemo(() => {
    const seen: string[] = [];
    for (const q of questions) if (!seen.includes(q.chapter)) seen.push(q.chapter);
    return seen;
  }, [questions]);
  const colorForChapter = (chapter: string) => CHAPTER_PALETTE[chapterOrder.indexOf(chapter) % CHAPTER_PALETTE.length];

  function setMark(studentId: string, qKey: string, raw: string, max: number) {
    const n = Number(raw);
    const clamped = raw === "" ? "" : String(Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0)));
    setMarks((m) => ({ ...m, [studentId]: { ...m[studentId], [qKey]: clamped } }));
    const key = `${studentId}|${qKey}`;
    if (clamped !== "" && flagged.has(key)) {
      setFlagged((f) => {
        const next = new Set(f);
        next.delete(key);
        if (next.size === 0) setOnlyFlagged(false);
        return next;
      });
    }
  }

  function totalFor(studentId: string) {
    const row = marks[studentId] ?? {};
    return questions.reduce((sum, q) => sum + (Number(row[q.key]) || 0), 0);
  }

  const enteredCount = roster.filter((s) => questions.some((q) => (marks[s.id]?.[q.key] ?? "") !== "")).length;
  const reviewPending = flagged.size;
  const flaggedFor = (studentId: string) => questions.filter((q) => flagged.has(`${studentId}|${q.key}`)).length;
  const shownRoster = onlyFlagged ? roster.filter((s) => flaggedFor(s.id) > 0) : roster;

  useEffect(() => {
    onProgress?.({ entered: enteredCount, total: roster.length, reviewPending });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enteredCount, roster.length, reviewPending]);

  function save() {
    if (reviewPending > 0) {
      setToast(`${reviewPending} mark${reviewPending === 1 ? "" : "s"} still need checking before saving.`);
      setOnlyFlagged(true);
      return;
    }
    setToast(`Saved marks for ${enteredCount} of ${roster.length} students · ${scopeLabel} (local only).`);
  }

  function onPicked(file: File) {
    if (!testKey) return;
    if (photo?.url) URL.revokeObjectURL(photo.url);
    setPhoto({ url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null, name: file.name });
    setScanning(true);
    setTimeout(() => processAnswerCard(), 1400);
  }

  function processAnswerCard() {
    if (!testKey) {
      setScanning(false);
      return;
    }
    const next: MarksState = {};
    const unresolved = new Set<string>();
    let anyGroundTruth = false;

    for (const s of roster) {
      const ocr = ocrMarksFor(s.id, testKey, subject);
      if (!ocr) continue;
      anyGroundTruth = true;
      const row: Record<string, string> = {};
      for (const q of questions) {
        // ~1 in 16 cells comes back unreadable, same as a real scan would.
        if (Math.random() < 0.06) unresolved.add(`${s.id}|${q.key}`);
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
    setFlagged(unresolved);
    setOnlyFlagged(unresolved.size > 0);
    setToast(
      unresolved.size > 0
        ? `Marks read. ${unresolved.size} could not be read, shown in red.`
        : `Answer card read for all ${roster.length} students · ${scopeLabel}.`,
    );
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

  function markInput(s: RosterStudent, q: (typeof questions)[number], className: string) {
    const isFlagged = flagged.has(`${s.id}|${q.key}`);
    return (
      <input
        className={`input ${className} ${isFlagged ? "input--flag" : ""}`}
        inputMode="numeric"
        placeholder={isFlagged ? "?" : "-"}
        aria-label={`${s.name}, ${q.label}, out of ${q.maxMarks}${isFlagged ? ", needs checking" : ""}`}
        value={marks[s.id]?.[q.key] ?? ""}
        onChange={(e) => setMark(s.id, q.key, e.target.value, q.maxMarks)}
      />
    );
  }

  return (
    <>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card__head marks-head">
          <div className="small muted">
            {questions.length} questions, {maxTotal} marks total. Photograph or upload the filled answer card to read marks, or type them in.
          </div>
          {testKey && (
            <div className="marks-head__upload">
              {scanning ? (
                <span className="btn btn--sm" aria-live="polite">
                  <ScanLine size={13} className="spin" /> Reading answer card…
                </span>
              ) : (
                <FilePickButtons size="sm" accept="image/*,.pdf" fileLabel="Upload file" onPick={onPicked} />
              )}
            </div>
          )}
        </div>

        {photo && !scanning && (
          <div className="scanned">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimisable asset */}
            {photo.url ? <img src={photo.url} alt="Scanned answer card" className="scanned__img" /> : <span className="scanned__img scanned__img--doc">PDF</span>}
            <div style={{ minWidth: 0 }}>
              <div className="strong small" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.name}</div>
              <div className="small muted">Marks below were read from this card.</div>
            </div>
          </div>
        )}

        {reviewPending > 0 ? (
          <div className="flagbar" role="status">
            <AlertTriangle size={16} />
            <span>
              <b>{reviewPending}</b> mark{reviewPending === 1 ? "" : "s"} could not be read. Type them in the red boxes.
            </span>
            <button className="btn btn--sm" onClick={() => setOnlyFlagged((v) => !v)}>
              {onlyFlagged ? "Show all students" : "Show only these"}
            </button>
          </div>
        ) : (
          photo &&
          !scanning &&
          enteredCount > 0 && (
            <div className="flagbar flagbar--ok" role="status">
              <CheckCircle2 size={16} /> <span>All marks read. Check them and save.</span>
            </div>
          )
        )}

        {chapterOrder.length > 1 && (
          <div className="marks-grid__legend">
            {chapterOrder.map((c) => (
              <span className="marks-grid__legend-item" key={c}>
                <span className="marks-grid__legend-dot" style={{ background: colorForChapter(c) }} />
                {c}
              </span>
            ))}
          </div>
        )}
        {roster.length === 0 ? (
          <div className="placeholder">
            <p>No students on record for this section in this demo dataset.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap table-wrap--scroll marks-grid marks-desktop">
              <table className="table">
                <colgroup>
                  <col style={{ width: 52 }} />
                  <col style={{ width: 150 }} />
                  {questions.map((q) => (
                    <col key={q.key} style={{ width: 46 }} />
                  ))}
                  <col style={{ width: 76 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Roll</th>
                    <th>Student</th>
                    {questions.map((q) => (
                      <th key={q.key} className="num" title={q.chapter} style={{ borderTop: `3px solid ${colorForChapter(q.chapter)}` }}>
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
                  {shownRoster.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">{s.rollNo}</td>
                      <td className="strong">{s.name}</td>
                      {questions.map((q) => (
                        <td key={q.key} className="num">
                          {markInput(s, q, "marks-cell")}
                        </td>
                      ))}
                      <td className="num strong">
                        {totalFor(s.id)} <span className="muted" style={{ fontWeight: 400 }}>/{maxTotal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="marks-mobile">
              {shownRoster.map((s) => {
                const nFlag = flaggedFor(s.id);
                return (
                  <div key={s.id} className={`mcard ${nFlag ? "mcard--flag" : ""}`}>
                    <div className="mcard__head">
                      <span className="mcard__roll mono">{s.rollNo}</span>
                      <span className="mcard__name">{s.name}</span>
                      {nFlag > 0 && (
                        <span className="tag tag--risk">
                          <AlertTriangle size={11} /> {nFlag} to check
                        </span>
                      )}
                      <span className="mcard__total mono">
                        {totalFor(s.id)}
                        <small>/{maxTotal}</small>
                      </span>
                    </div>
                    <div className="mcard__qs">
                      {questions.map((q) => (
                        <label key={q.key} className="mq" style={{ "--chap": colorForChapter(q.chapter) } as React.CSSProperties}>
                          <span className="mq__label">
                            {q.label}
                            <small>/{q.maxMarks}</small>
                          </span>
                          {markInput(s, q, "mq__input")}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className="card__foot marks-foot">
          <span className="small muted">
            {enteredCount} of {roster.length} students entered{reviewPending > 0 ? `, ${reviewPending} marks to check` : ""}.
          </span>
          <button className="btn btn--primary btn--sm" onClick={save} disabled={roster.length === 0}>
            <Save size={13} /> Save marks
          </button>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toast}
            <button className="iconbtn" style={{ color: "inherit", padding: 2, marginLeft: 6 }} onClick={() => setToast(null)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
