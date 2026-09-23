"use client";

import { motion } from "framer-motion";
import {
  Atom,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Heart,
  Sparkles,
  Target,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { EASE_OUT } from "@/components/motion";
import { school, subjects } from "@/lib/avai-mock-data";
import type { AttendDraft } from "@/lib/attendState";
import {
  afterTenthOptions,
  interestOptions,
  learnStyleOptions,
  studyHourOptions,
  studyWhenOptions,
  supportOptions,
  type Option,
} from "../options";
import { ChipGroup, LockedField, Question, StepCard } from "./ui";

const subjectIcons: Record<string, LucideIcon> = {
  Mathematics: Calculator,
  Physics: Atom,
  Chemistry: FlaskConical,
  English: BookOpen,
  "Social Science": Globe2,
};

export const subjectOptions: Option[] = subjects.map((s) => ({ id: s, label: s, icon: subjectIcons[s] ?? BookOpen }));

const MAX_HARD_SUBJECTS = 3;

export interface StepProps {
  draft: AttendDraft;
  patch: (patch: Partial<AttendDraft>) => void;
  showErrors: boolean;
}

function FieldError({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      style={{ fontSize: 12.5, fontWeight: 600, color: "var(--risk)" }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------- step 1

export const contactValid = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, ""));

export function StepIdentity({ draft, patch, showErrors }: StepProps) {
  const id = draft.identity;
  if (!id) return null;

  return (
    <StepCard
      icon={UserCheck}
      eyebrow="Step 1 of 5"
      title="Let's check this is you"
      lead={`${school.name} gave us these details. Add two of your own and we're done with the boring part.`}
    >
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <LockedField label="Name" value={id.name} />
        <LockedField label="Class & section" value={`Class ${id.section.split("-")[0]} · ${id.section}`} />
        <LockedField label="Roll number" value={id.rollNo} />
        <LockedField label="Student ID" value={id.loginId} />
      </div>
      <p className="muted small" style={{ marginTop: -10 }}>
        Something wrong above? Tell your class teacher — only the school can change it.
      </p>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <div className="field">
          <label htmlFor="dob">Date of birth</label>
          <input
            id="dob"
            className="input"
            type="date"
            min="2006-01-01"
            max="2014-12-31"
            value={draft.dob}
            aria-invalid={showErrors && !draft.dob}
            onChange={(e) => patch({ dob: e.target.value })}
          />
          <FieldError show={showErrors && !draft.dob}>Pick your date of birth.</FieldError>
        </div>

        <div className="field">
          <label htmlFor="contact">Contact number</label>
          <input
            id="contact"
            className="input"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={draft.contact}
            aria-invalid={showErrors && !contactValid(draft.contact)}
            onChange={(e) => patch({ contact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          />
          <FieldError show={showErrors && !contactValid(draft.contact)}>
            Enter a 10-digit mobile number starting with 6, 7, 8 or 9.
          </FieldError>
        </div>
      </div>
    </StepCard>
  );
}

// ---------------------------------------------------------------- step 2

export function StepAbout({ draft, patch, showErrors }: StepProps) {
  return (
    <StepCard
      icon={Heart}
      eyebrow="Step 2 of 5"
      title="A bit about you"
      lead="There are no right answers here. It helps AVAI explain things the way you actually learn."
      accent="var(--brand-orange)"
    >
      <Question label="What are you into?" hint="Pick as many as you like — at least one.">
        <ChipGroup
          groupLabel="Interests"
          options={interestOptions}
          selected={draft.interests}
          multi
          accent="var(--brand-orange)"
          onChange={(interests) => patch({ interests })}
        />
        <FieldError show={showErrors && draft.interests.length === 0}>Pick at least one interest.</FieldError>
      </Question>

      <Question label="On a normal day, how long do you study at home?">
        <ChipGroup
          groupLabel="Study hours per day"
          options={studyHourOptions}
          selected={draft.studyHours ? [draft.studyHours] : []}
          accent="var(--brand-teal)"
          onChange={([studyHours]) => patch({ studyHours })}
        />
        <FieldError show={showErrors && !draft.studyHours}>Choose one.</FieldError>
      </Question>

      <Question label="When do you concentrate best?">
        <ChipGroup
          groupLabel="Best time to study"
          options={studyWhenOptions}
          selected={draft.studyWhen ? [draft.studyWhen] : []}
          accent="var(--brand-gold)"
          onChange={([studyWhen]) => patch({ studyWhen })}
        />
        <FieldError show={showErrors && !draft.studyWhen}>Choose one.</FieldError>
      </Question>

      <Question label="How do you understand a new topic fastest?">
        <ChipGroup
          groupLabel="Preferred way to learn"
          options={learnStyleOptions}
          selected={draft.learnStyle ? [draft.learnStyle] : []}
          accent="var(--brand-blue)"
          onChange={([learnStyle]) => patch({ learnStyle })}
        />
        <FieldError show={showErrors && !draft.learnStyle}>Choose one.</FieldError>
      </Question>
    </StepCard>
  );
}

// ---------------------------------------------------------------- step 3

function targetNote(pct: number): string {
  if (pct >= 95) return "Top of the board. Every paper has to be near-perfect — AVAI will be strict with you.";
  if (pct >= 85) return "A strong distinction. Very reachable with steady work on your two weakest chapters.";
  if (pct >= 70) return "A solid first goal. We'll aim to move this up once your first paper is analysed.";
  return "A safe starting line. Tell us the subjects that worry you and we'll start there.";
}

export function StepGoals({ draft, patch, showErrors }: StepProps) {
  const atMax = draft.hardSubjects.length >= MAX_HARD_SUBJECTS;

  return (
    <StepCard
      icon={Target}
      eyebrow="Step 3 of 5"
      title="What are you aiming for?"
      lead="Your target is yours — your teachers see it, nobody is graded on it."
      accent="var(--brand-green)"
    >
      <Question label="Target percentage in the Class X boards" htmlFor="target">
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <motion.div
            key={draft.targetPct}
            initial={{ scale: 0.94, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="gradient-text"
            style={
              {
                "--from": "var(--brand-green)",
                "--to": "var(--brand-teal)",
                fontFamily: "var(--font-display)",
                fontSize: 46,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                minWidth: 96,
              } as React.CSSProperties
            }
          >
            {draft.targetPct}%
          </motion.div>
          <input
            id="target"
            type="range"
            min={50}
            max={100}
            step={5}
            value={draft.targetPct}
            onChange={(e) => patch({ targetPct: Number(e.target.value) })}
            style={{ flex: "1 1 220px", accentColor: "var(--brand-green)", height: 26, cursor: "pointer" }}
          />
        </div>
        <div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
          <span>50%</span>
          <span>100%</span>
        </div>
        <div
          className="surface surface--tinted"
          style={{ "--accent": "var(--brand-green)", padding: "10px 13px", fontSize: 13, lineHeight: 1.45 } as React.CSSProperties}
        >
          {targetNote(draft.targetPct)}
        </div>
      </Question>

      <Question label="After Class X, you are leaning towards…">
        <ChipGroup
          groupLabel="Path after Class X"
          options={afterTenthOptions}
          selected={draft.afterTenth ? [draft.afterTenth] : []}
          accent="var(--brand-blue)"
          onChange={([afterTenth]) => patch({ afterTenth })}
        />
        <FieldError show={showErrors && !draft.afterTenth}>Choose one — &quot;not decided yet&quot; is a real answer.</FieldError>
      </Question>

      <Question label="Which subjects feel hardest right now?" hint={`Up to ${MAX_HARD_SUBJECTS}.`}>
        <ChipGroup
          groupLabel="Hardest subjects"
          options={subjectOptions}
          selected={draft.hardSubjects}
          multi
          accent="var(--risk)"
          onChange={(next) =>
            patch({ hardSubjects: next.length > MAX_HARD_SUBJECTS ? next.slice(next.length - MAX_HARD_SUBJECTS) : next })
          }
        />
        {atMax && (
          <div className="muted" style={{ fontSize: 12 }}>
            That&apos;s {MAX_HARD_SUBJECTS} — picking another will replace the first.
          </div>
        )}
        <FieldError show={showErrors && draft.hardSubjects.length === 0}>Pick at least one.</FieldError>
      </Question>

      <Question label="What would help you most?" hint="Pick as many as apply.">
        <ChipGroup
          groupLabel="Support wanted"
          options={supportOptions}
          selected={draft.support}
          multi
          accent="var(--brand-teal)"
          onChange={(support) => patch({ support })}
        />
        <FieldError show={showErrors && draft.support.length === 0}>Pick at least one.</FieldError>
      </Question>

      <div className="evidence evidence--neutral">
        <Sparkles size={16} />
        <div>
          <div className="evidence__title">Why we ask</div>
          Your targets and your hardest subjects decide which findings your teacher sees first about you.
        </div>
      </div>
    </StepCard>
  );
}

// ---------------------------------------------------------------- gating

export function isStepValid(step: number, draft: AttendDraft, quizDone: boolean): boolean {
  if (step === 0) return Boolean(draft.identity) && Boolean(draft.dob) && contactValid(draft.contact);
  if (step === 1) return draft.interests.length > 0 && Boolean(draft.studyHours) && Boolean(draft.studyWhen) && Boolean(draft.learnStyle);
  if (step === 2) return Boolean(draft.afterTenth) && draft.hardSubjects.length > 0 && draft.support.length > 0;
  if (step === 3) return quizDone;
  return true;
}
