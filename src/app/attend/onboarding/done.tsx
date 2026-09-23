"use client";

import { motion } from "framer-motion";
import { ClipboardList, FileText, PartyPopper, ScanLine, ShieldCheck } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { EASE_OUT, Reveal } from "@/components/motion";
import { classTeacherBySection, school } from "@/lib/avai-mock-data";
import { ageFrom, ONBOARDING_DATE, type AttendDraft } from "@/lib/attendState";
import {
  careersKnownOptions,
  class11GroupOptions,
  confidenceOptions,
  decisionHelperOptions,
  futureConcernOptions,
  genderOptions,
  groupReasonOptions,
  interestOptions,
  labelFor,
  labelsFor,
  learningTypeOptions,
  livesInOptions,
  newLearningOptions,
  responsibilitiesOptions,
  workInterestOptions,
} from "../options";

/** Step 6 — confirmation. Everything on this screen is read back from the
 * saved run, so a student can see exactly what the school now has. */
export function StepDone({ draft }: { draft: AttendDraft }) {
  const id = draft.identity;
  if (!id) return null;

  const first = id.name.split(" ")[0];
  const classTeacher = classTeacherBySection[id.section];
  const age = ageFrom(draft.dob);

  const summary: Array<[string, string]> = [
    ["Name", `${id.name} · ${id.section} · Roll ${id.rollNo}`],
    ["Date of birth", draft.dob ? `${draft.dob}${age !== null ? ` (age ${age})` : ""}` : "—"],
    ["Gender", labelFor(genderOptions, draft.gender) || "—"],
    ["Where you live", labelFor(livesInOptions, draft.livesIn) || "—"],
    ["Who helps with study decisions", labelFor(decisionHelperOptions, draft.decisionHelper) || "—"],
    ["Responsibilities outside school", labelFor(responsibilitiesOptions, draft.hasResponsibilities) || "—"],
    ["Enjoys learning most", draft.favoriteSubject || "—"],
    ["Most comfortable subject", draft.comfortableSubject || "—"],
    ["Preferred type of learning", labelFor(learningTypeOptions, draft.learningType) || "—"],
    ["Interests", labelsFor(interestOptions, draft.interests).join(", ") || "—"],
    ["Kind of work of interest", labelFor(workInterestOptions, draft.workInterest) || "—"],
    ["Enjoys most when learning something new", labelFor(newLearningOptions, draft.newLearning) || "—"],
    ["Future plan", draft.futurePlanUnsure ? "Not sure yet" : draft.futurePlan || "—"],
    ["Class 11 group", labelFor(class11GroupOptions, draft.class11Group) || "—"],
    ["Reasons for this group", labelsFor(groupReasonOptions, draft.groupReasons).join(", ") || "—"],
    ["How sure about this choice", labelFor(confidenceOptions, draft.groupConfidence) || "—"],
    ["Careers or exams heard about", labelsFor(careersKnownOptions, draft.careersKnown).join(", ") || "—"],
    ["May affect future study choice", labelsFor(futureConcernOptions, draft.futureConcerns).join(", ") || "—"],
  ];

  const timeline: Array<{ icon: typeof ClipboardList; title: string; body: string }> = [
    {
      icon: ClipboardList,
      title: `${classTeacher ?? "Your class teacher"} maps your next paper`,
      body: `Every question in your next ${school.board} unit test gets tagged to a chapter and a skill.`,
    },
    {
      icon: ScanLine,
      title: "AVAI reads your answers",
      body: "Not just the total — which chapters cost you marks, and whether it was the concept or the presentation.",
    },
    {
      icon: FileText,
      title: "Your report reaches you",
      body: "A plain-language report with two or three things to fix first. It lands in your AVAI home page.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <motion.div
        className="surface surface--raised"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        style={{
          padding: "clamp(22px, 5vw, 32px) clamp(18px, 4vw, 28px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(14px, 4vw, 26px)",
          flexWrap: "wrap",
          background:
            "radial-gradient(520px 320px at 88% -10%, rgba(58,157,106,.16), transparent 66%), radial-gradient(420px 300px at -6% 110%, rgba(224,166,42,.16), transparent 64%), linear-gradient(180deg, #ffffff, #fdfbf7)",
        }}
      >
        <Mascot pose="achieve" size={132} float />
        <div style={{ minWidth: 200, flex: "1 1 240px" }}>
          <span className="tag tag--green" style={{ marginBottom: 8 }}>
            <PartyPopper size={12} /> Onboarding complete
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(25px, 6vw, 34px)", fontWeight: 500, lineHeight: 1.15 }}>
            You&apos;re all set, {first}.
          </h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 7 }}>
            Saved on {ONBOARDING_DATE}. You can close this page — you won&apos;t have to do it again.
          </p>
        </div>
      </motion.div>

      <Reveal delay={0.12}>
        <div className="surface" style={{ padding: "clamp(16px, 4vw, 22px) clamp(16px, 4vw, 24px)" }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            What AVAI knows about you now
          </div>
          <div>
            {summary.map(([label, value], i) => (
              <motion.div
                key={label}
                className="metric-row"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.16 + i * 0.035, ease: EASE_OUT }}
                style={{ alignItems: "flex-start", gap: 18 }}
              >
                <span className="muted" style={{ flex: "0 0 auto" }}>
                  {label}
                </span>
                <b style={{ textAlign: "right", minWidth: 0, lineHeight: 1.4 }}>{value}</b>
              </motion.div>
            ))}
          </div>
          <div className="evidence evidence--neutral" style={{ marginTop: 14 }}>
            <ShieldCheck size={16} />
            <div>Only your teachers and your principal see this. It is never shown to the rest of the class.</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="surface" style={{ padding: "clamp(16px, 4vw, 22px) clamp(16px, 4vw, 24px)" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            What happens next
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
            {timeline.map((t, i) => (
              <motion.li
                key={t.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.26 + i * 0.1, ease: EASE_OUT }}
                style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i === timeline.length - 1 ? 0 : 18 }}
              >
                {i < timeline.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 18,
                      top: 40,
                      bottom: 4,
                      width: 2,
                      borderRadius: 2,
                      background: "linear-gradient(180deg, var(--brand-teal-soft), var(--line))",
                    }}
                  />
                )}
                <span
                  aria-hidden="true"
                  style={{
                    width: 38,
                    height: 38,
                    flex: "0 0 38px",
                    borderRadius: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    background: "linear-gradient(160deg, #35a3a3, var(--brand-teal))",
                    boxShadow: "0 8px 18px -9px rgba(31,138,138,.95), inset 0 1px 0 rgba(255,255,255,.4)",
                  }}
                >
                  <t.icon size={17} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: 14.5, fontWeight: 650 }}>{t.title}</strong>
                  <span className="muted" style={{ display: "block", fontSize: 13, lineHeight: 1.45, marginTop: 2 }}>
                    {t.body}
                  </span>
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <div
          className="surface surface--tinted"
          style={
            {
              "--accent": "var(--brand-gold)",
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "14px 16px",
            } as React.CSSProperties
          }
        >
          <FileText size={18} style={{ color: "#8a6410", flex: "0 0 auto" }} />
          <span style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 13.5, fontWeight: 650 }}>That is everything we need</strong>
            <small className="muted" style={{ display: "block", fontSize: 12, lineHeight: 1.35 }}>
              You can close this page. Your report goes to your class teacher, who will hand it to you after the next assessment.
            </small>
          </span>
        </div>
      </Reveal>
    </div>
  );
}
