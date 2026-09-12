"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, BarChart3, Check, ChevronLeft, Clock } from "lucide-react";
import { AttentionPill, ConfidenceMeter, UrgencyChip } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import {
  findings,
  schoolStandards,
  sectionComparison,
  standardAssessments,
  standardEmptyStates,
  standardPerformance,
  subjectConversion,
} from "@/lib/avai-mock-data";

/**
 * Class (standard) page — the whole class in one view: attainment bands,
 * sections, subjects and the findings that carry the most Board weight,
 * plus the list of assessments. Opening an assessment is what takes the
 * principal into BoardX, which stays the assessment-level view.
 *
 * 🔧 BACKEND REQUIRED — a standard-level roll-up endpoint does not exist.
 * Class X reuses the analysed cohort figures; other standards have none.
 */
export default function ClassPage() {
  const { standard } = useParams<{ standard: string }>();
  const s = schoolStandards.find((x) => x.id === standard);

  if (!s) {
    return (
      <>
        <Link href="/principal" className="btn btn--ghost btn--sm">
          <ChevronLeft size={13} /> School overview
        </Link>
        <div style={{ marginTop: 16 }}>
          <EvidenceState kind="early">No standard with id {standard} in this school.</EvidenceState>
        </div>
      </>
    );
  }

  const assessments = standardAssessments[s.id] ?? [];
  const analysedAssessment = assessments.find((a) => a.analysed);
  const hasIntelligence = s.status === "analysed";
  const bandTotal = standardPerformance.bands.reduce((a, b) => a + b.students, 0);
  const topFindings = [...findings]
    .sort((a, b) => b.studentsAffected * b.avgMarksLost - a.studentsAffected * a.avgMarksLost)
    .slice(0, 3);

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/principal">School</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{s.label}</span>
      </nav>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        <div>
          <div className="eyebrow">{s.boardYear ? "Board-examination year" : "Standard"}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            {s.label}
          </h1>
          <p className="page-sub">
            {s.students} students · {s.sectionIds.join(", ")} · {s.subjects} subjects
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {s.attention && <AttentionPill level={s.attention} />}
          {analysedAssessment && (
            <Link
              href={`/principal/boardx?standard=${s.id}&assessment=${encodeURIComponent(analysedAssessment.name)}`}
              className="btn btn--primary btn--sm"
            >
              <BarChart3 size={13} /> Open BoardX · {analysedAssessment.name}
            </Link>
          )}
        </div>
      </div>

      {!hasIntelligence && (
        <div style={{ marginTop: 18 }}>
          <EvidenceState kind="trend">{standardEmptyStates[s.status as "awaiting_analysis" | "no_papers"]}</EvidenceState>
        </div>
      )}

      {/* Assessments — the entry point into the assessment-level view */}
      <section className="section">
        <div className="section__head">
          <div>
            <div className="section__name">Assessments</div>
            <h2 className="section-q">What has this class sat, and what has been analysed?</h2>
            <p className="section__lead">Only an analysed assessment can be opened in BoardX.</p>
          </div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Conducted</th>
                  <th>Marks</th>
                  <th>Analysis</th>
                  <th className="num">Students analysed</th>
                  <th>Diagnostic strength</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assessments.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <EvidenceState kind="trend" compact>
                        No assessment has been set up for {s.label} yet.
                      </EvidenceState>
                    </td>
                  </tr>
                )}
                {assessments.map((a) => (
                  <tr key={a.name}>
                    <td className="strong">{a.name}</td>
                    <td className="muted">{a.conductedOn}</td>
                    <td>
                      {a.marksEntered ? (
                        <span className="tag tag--green">
                          <Check size={12} /> Entered
                        </span>
                      ) : (
                        <span className="tag">Not entered</span>
                      )}
                    </td>
                    <td>
                      {a.analysed ? (
                        <span className="tag tag--teal">
                          <Check size={12} /> Analysed
                        </span>
                      ) : (
                        <span className="tag">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="num">{a.studentsAnalysed ?? <span className="muted">—</span>}</td>
                    <td>
                      {a.diagnosticStrength ? (
                        <span className="tag tag--gold">
                          {a.diagnosticStrength.charAt(0) + a.diagnosticStrength.slice(1).toLowerCase()}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {a.analysed ? (
                        <Link href={`/principal/boardx?standard=${s.id}&assessment=${encodeURIComponent(a.name)}`} className="btn btn--sm">
                          Open BoardX <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <button className="btn btn--sm" disabled title={a.marksEntered ? "Analysis has not run for this assessment yet" : "Enter marks before this can be analysed"}>
                          Open BoardX
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {hasIntelligence && (
        <>
          <section className="section">
            <div className="section__head">
              <div>
                <div className="section__name">Class attainment</div>
                <h2 className="section-q">How is the whole class performing?</h2>
                <p className="section__lead">Based on {standardPerformance.basedOn} — the one analysed assessment for this standard.</p>
              </div>
            </div>
            <div className="card">
              <div className="card__body">
                {standardPerformance.bands.map((b, i) => {
                  const fills = ["bar__fill--green", "bar__fill", "bar__fill--gold", "bar__fill--risk"];
                  return (
                    <div className="bar-row" key={b.label}>
                      <div className="bar-row__label">{b.label}</div>
                      <div className="bar">
                        <div className={`bar__fill ${fills[i]}`} style={{ width: `${(b.students / bandTotal) * 100}%` }} />
                      </div>
                      <div className="bar-row__val">
                        {b.students} <span className="muted small">({Math.round((b.students / bandTotal) * 100)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <div>
                <div className="section__name">Sections</div>
                <h2 className="section-q">Are all the sections in the same place?</h2>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th className="num">Students</th>
                      <th style={{ minWidth: 180 }}>Overall attainment</th>
                      <th className="num">High-priority findings</th>
                      <th>Attention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionComparison.map((sec) => (
                      <tr key={sec.section}>
                        <td className="strong">{sec.section}</td>
                        <td className="num">{sec.students}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="bar" style={{ flex: 1 }}>
                              <div className="bar__fill" style={{ width: `${sec.overallAttainment}%` }} />
                            </div>
                            <span className="mono strong" style={{ width: 40, textAlign: "right" }}>{sec.overallAttainment}%</span>
                          </div>
                        </td>
                        <td className="num">{sec.highPriorityFindings}</td>
                        <td>
                          <AttentionPill level={sec.attention} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card__foot">
                <p className="note" style={{ border: 0, padding: 0 }}>
                  A section gap describes tested performance on this assessment only. It is not a measure of teaching
                  quality.
                </p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <div>
                <div className="section__name">Subjects</div>
                <h2 className="section-q">Which subjects convert into Board marks?</h2>
              </div>
            </div>
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="num">Marks tested</th>
                      <th className="num">Avg attainment</th>
                      <th style={{ minWidth: 180 }}>At expected level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectConversion.map((r) => (
                      <tr key={r.subject}>
                        <td className="strong">{r.subject}</td>
                        <td className="num">{r.marksTested}</td>
                        <td className="num">
                          {r.avgAttainment.toFixed(1)} <span className="small muted">/ {r.marksTested}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="bar" style={{ flex: 1 }}>
                              <div
                                className={`bar__fill ${r.atExpectedLevelPct < 45 ? "bar__fill--risk" : r.atExpectedLevelPct < 60 ? "bar__fill--gold" : "bar__fill--green"}`}
                                style={{ width: `${r.atExpectedLevelPct}%` }}
                              />
                            </div>
                            <span className="mono strong" style={{ width: 40, textAlign: "right" }}>{r.atExpectedLevelPct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section__head">
              <div>
                <div className="section__name">Top findings</div>
                <h2 className="section-q">What is costing this class the most?</h2>
                <p className="section__lead">The three findings carrying the most marks exposure. The full ranked set lives in BoardX.</p>
              </div>
              {analysedAssessment && (
                <Link href={`/principal/boardx?standard=${s.id}&assessment=${encodeURIComponent(analysedAssessment.name)}`} className="btn btn--sm">
                  All findings <ArrowRight size={12} />
                </Link>
              )}
            </div>
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Finding</th>
                      <th className="num">Students</th>
                      <th className="num">Marks exposure</th>
                      <th>Board urgency</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFindings.map((f) => (
                      <tr key={f.id}>
                        <td>
                          <div className="strong">
                            {f.subject} · {f.topic}
                          </div>
                          <div className="small muted">{f.subskill ?? "Whole chapter"}</div>
                        </td>
                        <td className="num">{f.studentsAffected}</td>
                        <td className="num strong">{Math.round(f.studentsAffected * f.avgMarksLost)}</td>
                        <td>
                          <UrgencyChip level={f.boardUrgency} withLabel={false} withYears={f.boardRecurrence} />
                        </td>
                        <td>
                          <ConfidenceMeter level={f.confidence} short />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
