"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Download, Info, ListFilter, Search } from "lucide-react";
import {
  assessmentContext,
  emptyStates,
  findings,
  marksLossFindingIds,
  sections,
  schoolStandards,
  standardAssessments,
  studentFilterOptions,
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
/* Risk level and intervention status are derived from the student's Attention
   signal and main blocker for this build — 🔧 both are BACKEND REQUIRED as
   real per-student fields (§5.6). */
function riskOf(attention: string) {
  if (attention === "Intervention") return "High";
  if (attention === "Watch") return "Medium";
  return "Low";
}
function interventionOf(s: { attention: string; mainBlocker: string }) {
  if (s.mainBlocker === "—") return "None";
  if (s.attention === "Intervention") return "Recommended";
  return "Under investigation";
}

const bandLabel: Record<string, string> = { full: "Full mastery", "80plus": "80%+ attainment", "60to80": "60–80% attainment", below60: "Below 60%" };

export default function BoardXPage() {
  /* BoardX is the assessment-level view: which standard and assessment it is
     showing comes from the class page that opened it. */
  const params = useSearchParams();
  const standardId = params.get("standard") ?? "X";
  const standard = schoolStandards.find((s) => s.id === standardId) ?? schoolStandards.find((s) => s.id === "X")!;
  const assessments = standardAssessments[standard.id] ?? [];
  const requested = params.get("assessment");
  const assessmentName = assessments.find((a) => a.analysed && a.name === requested)?.name ?? assessmentContext.assessmentName;

  const [tab, setTab] = useState<Tab>("Overview");
  const [section, setSection] = useState<string>("All");
  const [subject, setSubject] = useState<string>("All");
  const [band, setBand] = useState<string | null>(null);
  const [openFinding, setOpenFinding] = useState<Finding | null>(null);
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  /* §5.6 student-table filters */
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const [interventionStatus, setInterventionStatus] = useState("All");

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
        if (query.trim() && !s.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
        if (risk !== "All" && riskOf(s.attention) !== risk) return false;
        if (interventionStatus !== "All" && interventionOf(s) !== interventionStatus) return false;
        return true;
      }),
    [section, band, query, risk, interventionStatus]
  );

  const ctx = assessmentContext;

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/principal">School</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/principal/class/${standard.id}`}>{standard.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{assessmentName}</span>
      </nav>

      {/* §5.2 Page header / assessment context */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
        <div>
          <div className="eyebrow">BoardX Intelligence · {standard.label}</div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            {assessmentName}
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

      <div style={{ marginTop: 14 }}>
        <Link href={`/principal/class/${standard.id}`} className="btn btn--ghost btn--sm">
          <ChevronLeft size={13} /> Back to {standard.label}
        </Link>
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
          <select id="f-assessment" className="select" value={assessmentName} disabled title={`Pick the assessment on the ${standard.label} page — BoardX shows one analysed assessment at a time`}>
            {(assessments.length ? assessments.map((a) => ({ label: a.name, selectable: a.analysed })) : ctx.assessmentOptions).map((o) => (
              <option key={o.label} value={o.label} disabled={!o.selectable}>
                {o.label}
                {!o.selectable ? " — not yet analysed" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="f-standard">Standard</label>
          <select id="f-standard" className="select" value={standard.label} disabled title="Pick the standard on the school overview — BoardX shows one standard at a time">
            {schoolStandards.map((o) => (
              <option key={o.id} value={o.label} disabled={o.status !== "analysed"}>
                {o.label}
                {o.status !== "analysed" ? " — not analysed yet" : ""}
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
        <button className="btn btn--sm" title="Generates a Board-readiness summary for this filter combination">
          <Download size={13} /> Export / Generate Principal Report
        </button>
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
          <div className="studentfilters">
            <div className="filter filter--grow">
              <label htmlFor="f-student">Search student</label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)" }} />
                <input
                  id="f-student"
                  className="input input--sm"
                  style={{ paddingLeft: 30 }}
                  placeholder="Name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="filter">
              <label htmlFor="f-risk">Risk level</label>
              <select id="f-risk" className="select" value={risk} onChange={(e) => setRisk(e.target.value)}>
                {studentFilterOptions.riskLevels.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="filter">
              <label htmlFor="f-intervention">Intervention status</label>
              <select id="f-intervention" className="select" value={interventionStatus} onChange={(e) => setInterventionStatus(e.target.value)}>
                {studentFilterOptions.interventionStatuses.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
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
