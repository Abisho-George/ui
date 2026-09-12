"use client";

import Link from "next/link";
import { ArrowRight, Building2, ChevronRight, FileText } from "lucide-react";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import {
  school,
  schoolStandards,
  standardAssessments,
  standardEmptyStates,
  type SchoolStandard,
} from "@/lib/avai-mock-data";

/**
 * School overview — the principal's landing screen, one level above any
 * single assessment. Every standard in the school, then a class, then an
 * assessment: BoardX itself stays the assessment-level view.
 */
export default function SchoolOverview() {
  const analysed = schoolStandards.filter((s) => s.status === "analysed");
  // A standard carrying intelligence leads; the rest follow in seniority order.
  const boardYears = schoolStandards
    .filter((s) => s.boardYear)
    .sort((a, b) => Number(b.status === "analysed") - Number(a.status === "analysed"));
  const totalStudents = schoolStandards.reduce((a, s) => a + s.students, 0);

  return (
    <>
      <div className="eyebrow">School overview</div>
      <h1 className="page-title" style={{ marginTop: 4 }}>
        {school.name}
      </h1>
      <p className="page-sub">
        {school.board} · {school.state} · academic year 2026–27. Open a standard to see the whole class, then an
        assessment to open its Board intelligence.
      </p>

      <div className="grid grid--4" style={{ marginTop: 22 }}>
        <div className="stat">
          <div className="stat__label">Standards</div>
          <div className="stat__value">{schoolStandards.length}</div>
          <div className="small muted">{boardYears.length} Board-examination years</div>
        </div>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{totalStudents}</div>
          <div className="small muted">across all standards</div>
        </div>
        <div className="stat">
          <div className="stat__label">Standards analysed</div>
          <div className="stat__value">
            {analysed.length}
            <span className="small muted" style={{ fontWeight: 500 }}> / {schoolStandards.length}</span>
          </div>
          <div className="small muted">at least one assessment</div>
        </div>
        <div className="stat">
          <div className="stat__label">Papers stored</div>
          <div className="stat__value">{schoolStandards.reduce((a, s) => a + s.papersUploaded, 0)}</div>
          <div className="small muted">mapped to the blueprint</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__name">Board-examination years</div>
            <h2 className="section-q">Where does each standard stand?</h2>
            <p className="section__lead">
              Class X and Class XII sit the Board examination, so they lead. A standard with no analysed assessment
              shows its real state rather than borrowed numbers.
            </p>
          </div>
        </div>
        <div className="grid grid--2">
          {boardYears.map((s) => (
            <StandardCard standard={s} key={s.id} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__name">Other standards</div>
            <h2 className="section-q">What else is set up?</h2>
          </div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table table--hover">
              <thead>
                <tr>
                  <th>Standard</th>
                  <th className="num">Students</th>
                  <th className="num">Sections</th>
                  <th className="num">Papers</th>
                  <th>Intelligence</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schoolStandards
                  .filter((s) => !s.boardYear)
                  .map((s) => (
                    <tr key={s.id}>
                      <td className="strong">{s.label}</td>
                      <td className="num">{s.students}</td>
                      <td className="num">{s.sectionIds.length}</td>
                      <td className="num">{s.papersUploaded}</td>
                      <td className="muted">
                        {s.status === "no_papers" ? "No paper uploaded yet" : "Awaiting first analysis"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/principal/class/${s.id}`} className="btn btn--sm">
                          Open <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function StandardCard({ standard: s }: { standard: SchoolStandard }) {
  const assessments = standardAssessments[s.id] ?? [];
  const openable = assessments.find((a) => a.analysed);

  return (
    <article className="standard">
      <header className="standard__head">
        <div>
          <div className="eyebrow">
            <Building2 size={12} style={{ verticalAlign: "-2px" }} /> Board year
          </div>
          <h3 className="standard__title">{s.label}</h3>
          <div className="small muted">
            {s.students} students · {s.sectionIds.length} sections · {s.subjects} subjects
          </div>
        </div>
        {s.attention && <AttentionPill level={s.attention} />}
      </header>

      {s.status === "analysed" ? (
        <div className="standard__stats">
          <div className="metric">
            <div className="metric__label">Board-mapped attainment</div>
            <div className="metric__value">
              {s.overallAttainment}%<small>of tested marks</small>
            </div>
          </div>
          <div className="metric">
            <div className="metric__label">High-priority findings</div>
            <div className="metric__value">
              {s.highPriorityFindings}
              <small>across sections</small>
            </div>
          </div>
          <div className="metric">
            <div className="metric__label">Assessments analysed</div>
            <div className="metric__value">
              {s.assessmentsAnalysed}
              <small>{s.latestAssessment}</small>
            </div>
          </div>
        </div>
      ) : null}

      {s.status === "analysed" ? (
        <div className="standard__body" style={{ paddingTop: 14 }}>
          <div className="small muted">
            <FileText size={12} style={{ verticalAlign: "-2px" }} /> {s.papersUploaded} papers uploaded · latest
            analysis {s.latestAssessment}
            {openable?.studentsAnalysed ? `, ${openable.studentsAnalysed} students` : ""}
            {openable?.diagnosticStrength
              ? ` · ${openable.diagnosticStrength.charAt(0) + openable.diagnosticStrength.slice(1).toLowerCase()} diagnostic strength`
              : ""}
          </div>
        </div>
      ) : (
        <div className="standard__body">
          <EvidenceState kind="trend" compact>
            {standardEmptyStates[s.status as "awaiting_analysis" | "no_papers"]}
          </EvidenceState>
          <div className="small muted" style={{ marginTop: 10 }}>
            <FileText size={12} style={{ verticalAlign: "-2px" }} /> {s.papersUploaded} paper
            {s.papersUploaded === 1 ? "" : "s"} uploaded · {assessments.filter((a) => a.marksEntered).length} with marks
            entered
          </div>
        </div>
      )}

      <footer className="standard__foot">
        <Link href={`/principal/class/${s.id}`} className="btn btn--sm">
          Open {s.label} <ChevronRight size={13} />
        </Link>
        {openable && (
          <Link href={`/principal/boardx?standard=${s.id}&assessment=${encodeURIComponent(openable.name)}`} className="btn btn--primary btn--sm">
            BoardX · {openable.name} <ArrowRight size={13} />
          </Link>
        )}
      </footer>
    </article>
  );
}
