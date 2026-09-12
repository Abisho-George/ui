"use client";

import { useMemo, useState } from "react";
import { Info, ListFilter } from "lucide-react";
import {
  assessmentContext,
  emptyStates,
  findings,
  marksLossFindingIds,
  sections,
  standardOptions,
  studentIntelligenceTable,
  subjects,
  type Finding,
} from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingDrawer } from "@/components/boardx/FindingDrawer";
import { StudentDrawer } from "@/components/boardx/StudentDrawer";
import {
  BandOpportunity,
  DiagnosticQuality,
  InterventionPlan,
  MarksLoss,
  PerformanceSnapshot,
  PotentialLadder,
  RiskIntelligence,
  SectionComparison,
  SectionHead,
  SubjectAnomalies,
  SubjectConversion,
  UrgencyVsImpact,
} from "@/components/boardx/Sections";

const TABS = ["Overview", "Sections", "Subjects", "Students", "Interventions"] as const;
type Tab = (typeof TABS)[number];

/** Maps the §5.3(2) band filter key to student rows. Attainment is "x/17". */
function bandOf(attainment: string) {
  const [got, of] = attainment.split("/").map(Number);
  const pct = got / of;
  if (got === of) return "full";
  if (pct >= 0.8) return "80plus";
  if (pct >= 0.6) return "60to80";
  return "below60";
}
const bandLabel: Record<string, string> = { full: "Full mastery", "80plus": "80%+ attainment", "60to80": "60–80% attainment", below60: "Below 60%" };

export default function BoardXPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [section, setSection] = useState<string>("All");
  const [subject, setSubject] = useState<string>("All");
  const [band, setBand] = useState<string | null>(null);
  const [openFinding, setOpenFinding] = useState<Finding | null>(null);
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  const visibleFindings = useMemo(() => {
    const ordered = marksLossFindingIds.map((id) => findings.find((f) => f.id === id)!).filter(Boolean);
    return ordered.filter((f) => {
      if (subject !== "All" && f.subject !== subject) return false;
      if (section !== "All" && f.mostAffectedSections && !f.mostAffectedSections.some((s) => s.section === section)) return false;
      return true;
    });
  }, [subject, section]);

  const students = useMemo(
    () =>
      studentIntelligenceTable.filter((s) => {
        if (section !== "All" && s.section !== section) return false;
        if (band && bandOf(s.attainment) !== band) return false;
        return true;
      }),
    [section, band]
  );

  const ctx = assessmentContext;

  return (
    <>
      {/* §5.2 Page header / assessment context */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">BoardX Intelligence · Class X</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            {ctx.assessmentName}
          </h1>
          <p className="page-sub">What this assessment tells us about Board readiness — and how confidently.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(5, auto)", gap: 10 }}>
          <div className="stat" style={{ padding: "10px 14px" }}>
            <div className="stat__label">Students</div>
            <div className="stat__value stat__value--sm">{ctx.studentsAnalysed}</div>
          </div>
          <div className="stat" style={{ padding: "10px 14px" }}>
            <div className="stat__label">Sections</div>
            <div className="stat__value stat__value--sm">{ctx.sectionsAnalysed}</div>
          </div>
          <div className="stat" style={{ padding: "10px 14px" }}>
            <div className="stat__label">Subjects</div>
            <div className="stat__value stat__value--sm">{ctx.subjectsAnalysed}</div>
          </div>
          <div className="stat" style={{ padding: "10px 14px" }}>
            <div className="stat__label">Blueprint</div>
            <div className="stat__value stat__value--sm">{ctx.boardBlueprintMapping}</div>
          </div>
          <div className="stat" style={{ padding: "10px 14px" }}>
            <div className="stat__label">Evidence</div>
            <div className="stat__value stat__value--sm">{ctx.assessmentEvidence}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <EvidenceState kind="trend">{ctx.pilotStatusMessage}</EvidenceState>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" style={{ marginTop: 20 }}>
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? "tab--active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Sticky filter bar */}
      <div className="filterbar">
        <div className="filter">
          <label htmlFor="f-assessment">Assessment</label>
          <select id="f-assessment" className="select" defaultValue={ctx.assessmentName}>
            {ctx.assessmentOptions.map((o) => (
              <option key={o.label} value={o.label} disabled={!o.selectable}>
                {o.label}
                {!o.selectable ? " — not yet analysed" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-standard">Standard</label>
          <select id="f-standard" className="select" defaultValue="Class X">
            {standardOptions.map((o) => (
              <option key={o.label} value={o.label} disabled={!o.selectable}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-section">Section</label>
          <select id="f-section" className="select" value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="All">All sections</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-subject">Subject</label>
          <select id="f-subject" className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="All">All subjects</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filterbar__spacer" />
        {(section !== "All" || subject !== "All" || band) && (
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => {
              setSection("All");
              setSubject("All");
              setBand(null);
            }}
          >
            <ListFilter size={13} /> Clear filters
          </button>
        )}
      </div>

      {tab === "Overview" && (
        <>
          <DiagnosticQuality />
          <PerformanceSnapshot
            onBand={(k) => {
              setBand(k);
              setTab("Students");
            }}
          />
          <SubjectConversion subjectFilter={subject} />
          <MarksLoss items={visibleFindings} onOpen={setOpenFinding} />
          <UrgencyVsImpact items={visibleFindings} onOpen={setOpenFinding} />
          <PotentialLadder />
          <BandOpportunity />
          <RiskIntelligence />
          <SubjectAnomalies subjectFilter={subject} />
          <SectionComparison
            sectionFilter={section}
            onSection={(s) => {
              setSection(s);
              setTab("Sections");
            }}
          />
          <InterventionPlan onOpen={setOpenFinding} />
        </>
      )}

      {tab === "Sections" && (
        <>
          <SectionComparison sectionFilter={section} onSection={setSection} />
          <MarksLoss items={visibleFindings} onOpen={setOpenFinding} />
          {section !== "All" && (
            <section className="section">
              <SectionHead n={12} q={`How does ${section} compare on each finding?`} />
              <div className="card">
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Finding</th>
                        <th className="num">{section} affected</th>
                        <th className="num">Best section</th>
                        <th className="num">Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings
                        .filter((f) => f.mostAffectedSections)
                        .map((f) => {
                          const mine = f.mostAffectedSections!.find((s) => s.section === section);
                          const best = [...f.mostAffectedSections!].sort((a, b) => a.pct - b.pct)[0];
                          return (
                            <tr key={f.id}>
                              <td className="strong">
                                {f.subject} · {f.topic}
                              </td>
                              <td className="num">{mine ? `${mine.pct}%` : <span className="muted">not in top 3</span>}</td>
                              <td className="num">
                                {best.section} · {best.pct}%
                              </td>
                              <td className="num">{mine ? `${mine.pct - best.pct} pts` : "—"}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {tab === "Subjects" && (
        <>
          <SubjectConversion subjectFilter={subject} />
          <MarksLoss items={visibleFindings} onOpen={setOpenFinding} />
          <SubjectAnomalies subjectFilter={subject} />
        </>
      )}

      {tab === "Students" && (
        <section className="section">
          <SectionHead
            n={12}
            q="Which students need what?"
            lead="Student Intelligence. Click a row for the individual drill-down. Attention here is a student-level signal, separate from the Board urgency and confidence of any one finding."
            right={
              band ? (
                <span className="tag tag--teal" style={{ gap: 8 }}>
                  Band: {bandLabel[band]}
                  <button className="btn--link" style={{ color: "inherit" }} onClick={() => setBand(null)} aria-label="Clear band filter">
                    ×
                  </button>
                </span>
              ) : null
            }
          />
          <div className="card">
            <div className="table-wrap">
              <table className="table table--hover">
                <thead>
                  <tr>
                    <th className="num">#</th>
                    <th>Student</th>
                    <th>Section</th>
                    <th className="num">Attainment</th>
                    <th className="num">Marks lost</th>
                    <th>Main blocker</th>
                    <th>Attention</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EvidenceState kind="early" compact>
                          No students match the current filters in this sample.
                        </EvidenceState>
                      </td>
                    </tr>
                  )}
                  {students.map((s) => (
                    <tr key={s.rank} onClick={() => setOpenStudent(s.name.split(" ")[0].toLowerCase())}>
                      <td className="num muted">{s.rank}</td>
                      <td className="strong">{s.name}</td>
                      <td>{s.section}</td>
                      <td className="num">{s.attainment}</td>
                      <td className="num">{s.marksLost}</td>
                      <td>{s.mainBlocker}</td>
                      <td>
                        <AttentionPill level={s.attention} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card__foot">
              <Info size={14} className="muted" />
              <span className="small muted">Showing a sample of {studentIntelligenceTable.length} of {ctx.studentsAnalysed} analysed students in this build.</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
          </div>
        </section>
      )}

      {tab === "Interventions" && (
        <>
          <InterventionPlan onOpen={setOpenFinding} />
          <section className="section">
            <SectionHead n={12} q="What can't we recommend yet, and why?" />
            <div className="grid grid--2">
              <EvidenceState kind="cause">{emptyStates.causeNotLocalized}</EvidenceState>
              <EvidenceState kind="paper">{emptyStates.paperUnderTests}</EvidenceState>
              <EvidenceState kind="early">{emptyStates.earlySignal}</EvidenceState>
              <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
            </div>
          </section>
        </>
      )}

      <FindingDrawer finding={openFinding} onClose={() => setOpenFinding(null)} />
      <StudentDrawer studentKey={openStudent} onClose={() => setOpenStudent(null)} />
    </>
  );
}
