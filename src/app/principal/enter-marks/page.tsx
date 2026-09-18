"use client";

import { useMemo, useState } from "react";
import { assessmentContext, classRoster, pageHeaders, sections, subjects } from "@/lib/avai-mock-data";
import { MarksEntryGrid } from "@/components/MarksEntryGrid";

/** §5.10 Enter Marks. Filters select assessment/section/subject; the grid
 * itself is the shared MarksEntryGrid (also used by the teacher subject view). */
export default function EnterMarksPage() {
  const [assessment, setAssessment] = useState(assessmentContext.assessmentOptions[0].label);
  const [section, setSection] = useState<string>(sections[0]);
  const [subject, setSubject] = useState<string>(subjects[0]);

  const roster = useMemo(() => classRoster.filter((s) => s.section === section), [section]);

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
      </div>

      <MarksEntryGrid key={`${section}-${subject}`} subject={subject} roster={roster} scopeLabel={`${section} · ${subject}`} />
    </>
  );
}
