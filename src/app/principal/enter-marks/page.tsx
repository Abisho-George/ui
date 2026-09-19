"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ClipboardEdit } from "lucide-react";
import { latestTest, pageHeaders, questionSets, rosterFor, sections, subjects, testsConducted } from "@/lib/avai-mock-data";
import { MarksEntryGrid } from "@/components/MarksEntryGrid";

/** §5.10 Enter Marks. Pick an assessment and section, then open each
 * subject in turn — same test → subject structure as Question Papers,
 * since a subject's marks are entered independently of the others. Each
 * subject row shows how many students are entered before you open it, so
 * you can see at a glance what's left without expanding every one. */
export default function EnterMarksPage() {
  const [testKey, setTestKey] = useState(latestTest.key);
  const [section, setSection] = useState<string>(sections[0]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([subjects[0]]));
  const [progress, setProgress] = useState<Record<string, { entered: number; total: number }>>({});

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

  return (
    <>
      <h1 className="page-title">{pageHeaders.enterMarks.title}</h1>
      <p className="page-sub">{pageHeaders.enterMarks.blurb}</p>

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

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, marginTop: 20 }}>
        {subjects.map((subject) => {
          const isOpen = expanded.has(subject);
          const key = progressKey(subject);
          const p = progress[key];
          const entered = p?.entered ?? 0;
          const total = p?.total ?? roster.length;
          const pending = Math.max(0, total - entered);
          const questionCount = questionSets[subject]?.length ?? 0;
          return (
            <div className="card" key={subject} style={{ minWidth: 0 }}>
              <button
                onClick={() => toggle(subject)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                aria-expanded={isOpen}
              >
                <div className="card__head">
                  <div>
                    <div className="strong" style={{ fontSize: 15 }}>
                      {subject}
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {questionCount} questions ·{" "}
                      {entered === 0 ? (
                        <span>not started</span>
                      ) : entered >= total && total > 0 ? (
                        <span style={{ color: "var(--brand-green)" }}>all {total} students entered</span>
                      ) : (
                        <span>
                          {entered} of {total} students entered · {pending} pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {entered > 0 && (
                      <div className="bar" style={{ width: 100 }}>
                        <div
                          className={`bar__fill ${entered >= total ? "bar__fill--green" : "bar__fill--gold"}`}
                          style={{ width: `${total ? Math.round((entered / total) * 100) : 0}%` }}
                        />
                      </div>
                    )}
                    <ChevronDown size={16} className="muted" style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .15s" }} />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 22px 18px" }}>
                  <MarksEntryGrid
                    key={key}
                    subject={subject}
                    roster={roster}
                    scopeLabel={`${section} · ${subject} · ${test?.name ?? testKey}`}
                    testKey={testKey}
                    onProgress={(e, t) => setProgress((prev) => ({ ...prev, [key]: { entered: e, total: t } }))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="small muted" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <ClipboardEdit size={13} /> Each subject&apos;s marks are entered independently — upload its answer card or enter them by hand, then move to the next.
      </p>
    </>
  );
}
