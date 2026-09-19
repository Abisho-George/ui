"use client";

import { useMemo, useState } from "react";
import { latestTest, pageHeaders, rosterFor, sections, subjects, testsConducted } from "@/lib/avai-mock-data";
import { MarksEntryGrid } from "@/components/MarksEntryGrid";

/** §5.10 Enter Marks. Filters select assessment/section/subject; the grid
 * itself is the shared MarksEntryGrid (also used by the teacher subject
 * view). Answer-card upload only lights up for an analysed assessment —
 * a scheduled one has no marks yet for a scan to be checked against. */
export default function EnterMarksPage() {
  const [testKey, setTestKey] = useState(latestTest.key);
  const [section, setSection] = useState<string>(sections[0]);
  const [subject, setSubject] = useState<string>(subjects[0]);

  const test = testsConducted.find((t) => t.key === testKey);
  const roster = useMemo(() => rosterFor(section, testKey), [section, testKey]);

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
        <div className="filter">
          <label htmlFor="em-subject">Subject</label>
          <select id="em-subject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <MarksEntryGrid
        key={`${testKey}-${section}-${subject}`}
        subject={subject}
        roster={roster}
        scopeLabel={`${section} · ${subject} · ${test?.name ?? testKey}`}
        testKey={testKey}
      />
    </>
  );
}
