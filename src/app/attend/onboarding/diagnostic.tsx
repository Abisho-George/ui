"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Play, ScanLine, SkipForward, Timer } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { CountUp, EASE_OUT } from "@/components/motion";
import { diagnosticQuestions } from "../questions";
import type { StepProps } from "./steps";
import { StepCard } from "./ui";

const LETTERS = ["A", "B", "C", "D"];
const RING = 2 * Math.PI * 17;

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Step 4 — five timed items, one per subject. Nothing here is scored; the
 * summary reports effort and pace only. */
export function StepDiagnostic({ draft, patch }: StepProps) {
  const recorded = Object.keys(draft.answers).length;
  const firstUnanswered = diagnosticQuestions.findIndex((q) => !(q.id in draft.answers));
  const done = firstUnanswered === -1;

  const [phase, setPhase] = useState<"intro" | "quiz" | "summary">(done ? "summary" : "intro");
  const [index, setIndex] = useState(done ? 0 : Math.max(0, firstUnanswered));
  const [remaining, setRemaining] = useState(diagnosticQuestions[done ? 0 : Math.max(0, firstUnanswered)].seconds);
  const [chosen, setChosen] = useState<number | null>(null);

  const question = diagnosticQuestions[index];

  function record(choice: number | null) {
    const spent = Math.max(0, question.seconds - remaining);
    const next = index + 1;
    patch({
      answers: { ...draft.answers, [question.id]: choice },
      diagnosticSeconds: draft.diagnosticSeconds + spent,
    });
    setChosen(null);
    if (next >= diagnosticQuestions.length) {
      setPhase("summary");
      return;
    }
    setIndex(next);
    setRemaining(diagnosticQuestions[next].seconds);
  }

  // The countdown and the auto-skip need the *current* record(), but must not
  // restart the interval on every keystroke-free re-render.
  const recordRef = useRef(record);
  useEffect(() => {
    recordRef.current = record;
  });

  useEffect(() => {
    if (phase !== "quiz") return;
    const tick = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(tick);
  }, [phase, index]);

  useEffect(() => {
    if (phase === "quiz" && remaining === 0) recordRef.current(null);
  }, [phase, remaining]);

  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);

  function choose(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    advanceRef.current = setTimeout(() => recordRef.current(i), 320);
  }

  if (phase === "intro") {
    return (
      <StepCard
        icon={ScanLine}
        eyebrow="Step 4 of 5"
        title="A quick five-question check"
        lead="One question from each subject. It sets your starting level — it is not marked and nobody sees a score."
        accent="var(--brand-blue)"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Mascot pose="thinking" size={104} float />
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 9, minWidth: 220, flex: "1 1 240px" }}>
            {[
              `${diagnosticQuestions.length} questions, one per subject`,
              `${diagnosticQuestions[0].seconds} seconds each — the clock is visible`,
              "Not sure? Skip it. Skipping is useful information too.",
              "No score, no rank, no comparison with anyone.",
            ].map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 + i * 0.07, ease: EASE_OUT }}
                style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13.5, lineHeight: 1.45 }}
              >
                <CircleCheck size={15} style={{ color: "var(--brand-green)", flex: "0 0 auto", marginTop: 2 }} />
                {line}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.button
          type="button"
          className="btn btn--blue"
          style={{ justifyContent: "center", padding: "12px 16px", fontSize: 14.5 }}
          onClick={() => {
            setRemaining(question.seconds);
            setPhase("quiz");
          }}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <Play size={15} /> {recorded > 0 ? "Resume the check" : "Start the check"}
        </motion.button>
      </StepCard>
    );
  }

  if (phase === "summary") {
    const answered = Object.values(draft.answers).filter((a) => a !== null).length;
    const skipped = Object.values(draft.answers).filter((a) => a === null).length;

    return (
      <StepCard
        icon={CircleCheck}
        eyebrow="Step 4 of 5"
        title="Check complete"
        lead="That's all we needed. Here's how it went — remember, there is no score attached to this."
        accent="var(--brand-green)"
      >
        <div className="grid grid--3">
          {[
            { label: "Answered", value: answered, suffix: ` of ${diagnosticQuestions.length}`, accent: "var(--brand-green)" },
            { label: "Skipped", value: skipped, suffix: "", accent: "var(--brand-gold)" },
          ].map((k, i) => (
            <div key={k.label} className="kpi" style={{ "--accent": k.accent } as React.CSSProperties}>
              <span className="kpi__icon">{i === 0 ? <CircleCheck size={20} /> : <SkipForward size={20} />}</span>
              <div className="kpi__text">
                <div className="kpi__label">{k.label}</div>
                <div className="kpi__value">
                  <CountUp value={k.value} delay={0.1 + i * 0.08} />
                  {k.suffix && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{k.suffix}</span>}
                </div>
              </div>
            </div>
          ))}
          <div className="kpi" style={{ "--accent": "var(--brand-blue)" } as React.CSSProperties}>
            <span className="kpi__icon">
              <Timer size={20} />
            </span>
            <div className="kpi__text">
              <div className="kpi__label">Time taken</div>
              <div className="kpi__value">{mmss(draft.diagnosticSeconds)}</div>
              <div className="kpi__sub">across {diagnosticQuestions.length} questions</div>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            What it touched
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {diagnosticQuestions.map((q, i) => {
              const a = draft.answers[q.id];
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.06 + i * 0.05, ease: EASE_OUT }}
                  className="metric-row"
                  style={{ padding: "9px 0" }}
                >
                  <span style={{ minWidth: 0 }}>
                    <b style={{ fontWeight: 650 }}>{q.subject}</b>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {" "}
                      · {q.chapter}
                    </span>
                  </span>
                  <span className={`tag ${a === null || a === undefined ? "tag--gold" : "tag--green"}`}>
                    {a === null || a === undefined ? "Skipped" : "Answered"}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </StepCard>
    );
  }

  const progress = ((index + (chosen !== null ? 1 : 0)) / diagnosticQuestions.length) * 100;
  const urgent = remaining <= 10;

  return (
    <StepCard
      icon={ScanLine}
      eyebrow={`Question ${index + 1} of ${diagnosticQuestions.length}`}
      title={question.subject}
      lead={question.chapter}
      accent="var(--brand-blue)"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="bar" style={{ height: 8 }} role="img" aria-label={`Question ${index + 1} of ${diagnosticQuestions.length}`}>
            <div
              className="bar__fill"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #5b92ec, var(--brand-blue))",
                transition: "width .45s var(--ease-out)",
              }}
            />
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
            {diagnosticQuestions.length - index - 1} left after this one
          </div>
        </div>

        <div style={{ position: "relative", width: 44, height: 44, flex: "0 0 44px" }} aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="22" cy="22" r="17" fill="none" stroke="var(--line)" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="17"
              fill="none"
              stroke={urgent ? "var(--risk)" : "var(--brand-blue)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - remaining / question.seconds)}
              style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontSize: 12.5,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: urgent ? "var(--risk)" : "var(--brand-ink)",
            }}
          >
            {remaining}
          </span>
        </div>
        <span
          role="timer"
          aria-live="off"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}
        >
          {remaining} seconds left
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <p style={{ fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 600, lineHeight: 1.45 }}>{question.prompt}</p>

          <div role="group" aria-label="Answer options" style={{ display: "grid", gap: 10 }}>
            {question.options.map((opt, i) => {
              const on = chosen === i;
              return (
                <motion.button
                  key={opt}
                  type="button"
                  onClick={() => choose(i)}
                  aria-pressed={on}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 + i * 0.05, ease: EASE_OUT }}
                  whileHover={chosen === null ? { y: -2 } : undefined}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 13,
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 15px",
                    minHeight: 54,
                    borderRadius: "var(--radius-lg)",
                    border: `1px solid ${on ? "var(--brand-blue)" : "var(--line)"}`,
                    background: on
                      ? "linear-gradient(180deg, #eaf1fe, #dde8fc)"
                      : "linear-gradient(180deg, #ffffff, #fdfbf7)",
                    boxShadow: on ? "0 8px 20px -10px rgba(29,95,208,.8)" : "var(--shadow-xs)",
                    font: "inherit",
                    fontSize: 14.5,
                    color: "inherit",
                    cursor: chosen === null ? "pointer" : "default",
                    transition: "background .18s, border-color .18s, box-shadow .18s",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      flex: "0 0 28px",
                      borderRadius: 9,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: on ? "#fff" : "var(--brand-ink-soft)",
                      background: on ? "linear-gradient(160deg, #5b92ec, var(--brand-blue))" : "var(--surface-2)",
                      border: on ? "none" : "1px solid var(--line)",
                    }}
                  >
                    {LETTERS[i]}
                  </span>
                  <span style={{ minWidth: 0 }}>{opt}</span>
                </motion.button>
              );
            })}
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ alignSelf: "flex-start" }}
            onClick={() => record(null)}
            disabled={chosen !== null}
          >
            <SkipForward size={14} /> Skip this one
          </button>
        </motion.div>
      </AnimatePresence>
    </StepCard>
  );
}
