"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ClipboardEdit } from "lucide-react";
import { latestTest, pageHeaders, questionSets, rosterFor, sections, subjects, testsConducted } from "@/lib/avai-mock-data";
import { usePageHeader } from "@/lib/pageHeader";
import { MarksEntryGrid } from "@/components/MarksEntryGrid";

type Progress = { entered: number; total: number; reviewPending: number };

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone?: "green" | "gold" | "risk" }) {
  const color = tone === "green" ? "var(--brand-green)" : tone === "gold" ? "#8a6410" : tone === "risk" ? "var(--risk)" : "var(--text)";
  return (
    <div style={{ textAlign: "right", minWidth: 64 }}>
      <div className="small muted" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

/** §5.10 Enter Marks. Pick an assessment and section, then open each
 * subject in turn — same test → subject structure as Question Papers,
 * since a subject's marks are entered independently of the others.
 * Nothing is expanded until you click it, and every subject row carries
 * real numbers (students, mapped, empty, review needed) so the state of
 * the whole assessment is visible without opening a single one. */
export default function EnterMarksPage() {
  usePageHeader({ title: pageHeaders.enterMarks.title });
  const [testKey, setTestKey] = useState(latestTest.key);
  const [section, setSection] = useState<string>(sections[0]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [progress, setProgress] = useState<Record<string, Progress>>({});

  const test = testsConducted.find((t) => t.key === testKey);
  const roster = useMemo(() => rosterFor(section, testKey), [section, testKey]);

  function toggle(subject: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  }

  function progressKey(subject: string) {
    return `${testKey}|${section}|${subject}`;
  }

  const rows = subjects.map((subject) => {
    const key = progressKey(subject);
    const p = progress[key];
    const entered = p?.entered ?? 0;
    const total = p?.total ?? roster.length;
    const reviewPending = p?.reviewPending ?? 0;
    const empty = Math.max(0, total - entered);
    return { subject, key, entered, total, empty, reviewPending, questionCount: questionSets[subject]?.length ?? 0 };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      mapped: acc.mapped + (r.entered >= r.total && r.total > 0 ? 1 : 0),
      empty: acc.empty + r.empty,
      review: acc.review + r.reviewPending,
    }),
    { mapped: 0, empty: 0, review: 0 }
  );

  return (
    <>
      <p className="page-sub" style={{ marginTop: 0 }}>{pageHeaders.enterMarks.blurb}</p>

      <div className="filterbar" style={{ marginTop: 20 }}>
        <div className="filter">
          <label htmlFor="em-assessment">Assessment</label>
          <select id="em-assessment" className="select" value={testKey} onChange={(e) => setTestKey(e.target.value)}>
            {testsConducted.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
                {t.status !== "Analysed" ? " (not yet analysed)" : ""}
              </option>
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
      </div>

      <div className="grid grid--4" style={{ marginTop: 18 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{roster.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Subjects fully mapped</div>
          <div className="stat__value">
            {totals.mapped}
            <span className="small muted" style={{ fontWeight: 400 }}> of {subjects.length}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Empty entries</div>
          <div className="stat__value">{totals.empty}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Need manual review</div>
          <div className="stat__value" style={{ color: totals.review > 0 ? "var(--risk)" : undefined }}>
            {totals.review}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, marginTop: 20 }}>
        {rows.map(({ subject, key, entered, total, empty, reviewPending, questionCount }) => {
          const isOpen = expanded.has(subject);
          const fullyMapped = entered >= total && total > 0;
          return (
            <div className="card" key={subject} style={{ minWidth: 0 }}>
              <button
                onClick={() => toggle(subject)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                aria-expanded={isOpen}
              >
                <div className="card__head" style={{ flexWrap: "wrap", rowGap: 10 }}>
                  <div>
                    <div className="strong" style={{ fontSize: 15 }}>
                      {subject}
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {questionCount} questions
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                    <MiniStat label="Students" value={total} />
                    <MiniStat label="Mapped" value={entered} tone={fullyMapped ? "green" : entered > 0 ? "gold" : undefined} />
                    <MiniStat label="Empty" value={empty} tone={empty === 0 ? "green" : undefined} />
                    <MiniStat label="Review" value={reviewPending} tone={reviewPending > 0 ? "risk" : undefined} />
                    <ChevronDown size={16} className="muted" style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .15s" }} />
                  </div>
                </div>
              </button>

              {/* Always mounted (never unmounted by collapsing) so marks already
                  typed in aren't lost when you close a subject to check another,
                  and so every row's numbers above are live from the moment the
                  assessment loads, not just for subjects you've opened. */}
              <div style={{ padding: "0 22px 18px", display: isOpen ? undefined : "none" }}>
                <MarksEntryGrid
                  key={key}
                  subject={subject}
                  roster={roster}
                  scopeLabel={`${section} · ${subject} · ${test?.name ?? testKey}`}
                  testKey={testKey}
                  onProgress={(p) => setProgress((prev) => ({ ...prev, [key]: p }))}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="small muted" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardEdit size={13} /> Each subject&apos;s marks are entered independently — upload its answer card or enter them by hand, then move to the
        next.
      </p>
      {totals.review > 0 && (
        <p className="small" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, color: "var(--risk)" }}>
          <AlertTriangle size={13} /> {totals.review} mark{totals.review === 1 ? "" : "s"} across this assessment still need manual review.
        </p>
      )}
    </>
  );
}
