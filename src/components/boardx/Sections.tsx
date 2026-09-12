"use client";

import { AlertTriangle, ArrowUpRight, ChevronRight, Target } from "lucide-react";
import {
  diagnosticQuality,
  emptyStates,
  findings,
  interventionPlan,
  performanceBandOpportunity,
  potentialLadder,
  riskIntelligence,
  sectionComparison,
  sectionComparisonInsight,
  standardPerformance,
  subjectAnomalies,
  subjectConversion,
  type Finding,
} from "@/lib/avai-mock-data";
import { AttentionPill, ConfidenceMeter, UrgencyChip } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { FindingCard } from "@/components/FindingCard";

/* Shared section header with numbered, principal-facing question heading (§5.3) */
export function SectionHead({ n, name, q, lead, right }: { n: number; name?: string; q: string; lead?: string; right?: React.ReactNode }) {
  return (
    <div className="section__head">
      <div>
        {name && <div className="section__name">{name}</div>}
        <h2 className="section-q">
          <span className="section-q__num">{n}</span>
          {q}
        </h2>
        {lead && <p className="section__lead">{lead}</p>}
      </div>
      {right}
    </div>
  );
}

const strengthTone: Record<typeof diagnosticQuality.strength, string> = { STRONG: "tag--green", MODERATE: "tag--gold", LIMITED: "tag--risk" };

/* (1) Assessment Diagnostic Quality */
export function DiagnosticQuality() {
  const d = diagnosticQuality;
  const underTestsApplication = d.applicationQuestionsPct < d.applicationExpectationPct;
  return (
    <section className="section" id="s1">
      <SectionHead n={1} name="Assessment Diagnostic Quality" q="Can I trust this test to tell me enough?" lead="Diagnostic quality of the paper itself, before any student findings." />
      <div className="card">
        <div className="card__body">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span className={`tag ${strengthTone[d.strength]}`} style={{ fontSize: 13, padding: "4px 12px" }}>
              {d.strength.charAt(0) + d.strength.slice(1).toLowerCase()} diagnostic strength
            </span>
            <span className="muted small">Based on blueprint coverage and cognitive-level mix</span>
          </div>
          <div className="grid grid--3">
            <div className="stat">
              <div className="stat__label">Blueprint coverage</div>
              <div className="stat__value">{d.blueprintCoveragePct}%</div>
              <div className="small muted">
                {d.chaptersCovered} of {d.chaptersTotal} chapters
              </div>
              <div className="bar" style={{ marginTop: 8 }}>
                <div className="bar__fill" style={{ width: `${d.blueprintCoveragePct}%` }} />
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">Application questions</div>
              <div className="stat__value">
                {d.applicationQuestionsPct}% <span className="small muted" style={{ fontWeight: 500 }}>vs {d.applicationExpectationPct}% expected</span>
              </div>
              <div className="bar" style={{ marginTop: 8 }}>
                <div className="bar__fill bar__fill--gold" style={{ width: `${(d.applicationQuestionsPct / d.applicationExpectationPct) * 100}%` }} />
              </div>
            </div>
            <div className="stat">
              <div className="stat__label">Higher-order questions</div>
              <div className="stat__value">
                {d.higherOrderQuestionsPct}% <span className="small muted" style={{ fontWeight: 500 }}>vs {d.higherOrderExpectationPct}% expected</span>
              </div>
              <div className="bar" style={{ marginTop: 8 }}>
                <div className="bar__fill bar__fill--gold" style={{ width: `${(d.higherOrderQuestionsPct / d.higherOrderExpectationPct) * 100}%` }} />
              </div>
            </div>
          </div>
          <p style={{ marginTop: 16 }}>{d.interpretation}</p>
          {underTestsApplication && (
            <div style={{ marginTop: 14 }}>
              <EvidenceState kind="paper">{emptyStates.paperUnderTests}</EvidenceState>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* (2) Standard Performance Snapshot */
export function PerformanceSnapshot({ onBand }: { onBand: (key: string) => void }) {
  const total = standardPerformance.bands.reduce((a, b) => a + b.students, 0);
  const fills = ["bar__fill--green", "bar__fill", "bar__fill--gold", "bar__fill--risk"];
  return (
    <section className="section" id="s2">
      <SectionHead n={2} name="Standard Performance Snapshot" q="How is my entire Class X performing?" lead={`Based on ${standardPerformance.basedOn}. Click a band to see those students.`} />
      <div className="card">
        <div className="card__body">
          {standardPerformance.bands.map((b, i) => (
            <button
              key={b.filterKey}
              className="bar-row"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left", padding: "8px 0" }}
              onClick={() => onBand(b.filterKey)}
            >
              <div className="bar-row__label">{b.label}</div>
              <div className="bar">
                <div className={`bar__fill ${fills[i]}`} style={{ width: `${(b.students / total) * 100}%` }} />
              </div>
              <div className="bar-row__val">
                {b.students} <span className="small muted">({Math.round((b.students / total) * 100)}%)</span>
              </div>
            </button>
          ))}
        </div>
        <div className="card__foot">
          <EvidenceState kind="trend" compact>
            {emptyStates.trendNotAvailable}
          </EvidenceState>
        </div>
      </div>
    </section>
  );
}

/* (3) Subject Board Conversion Intelligence */
export function SubjectConversion({ subjectFilter }: { subjectFilter: string }) {
  const rows = subjectConversion.filter((r) => subjectFilter === "All" || r.subject === subjectFilter);
  return (
    <section className="section" id="s3">
      <SectionHead n={3} name="Subject Board Conversion" q="Across subjects, how much of the Board requirement are my students demonstrating?" lead="Average attainment against marks tested per subject, with how many students sit at the expected level." />
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th className="num">Marks tested</th>
                <th className="num">Avg attainment</th>
                <th style={{ minWidth: 200 }}>At expected level</th>
                <th className="num">Full marks</th>
                <th className="num">80%+</th>
                <th className="num">Below expected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject}>
                  <td className="strong">{r.subject}</td>
                  <td className="num">{r.marksTested}</td>
                  <td className="num">
                    {r.avgAttainment.toFixed(1)} <span className="small muted">/ {r.marksTested}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="bar" style={{ flex: 1 }}>
                        <div className={`bar__fill ${r.atExpectedLevelPct < 45 ? "bar__fill--risk" : r.atExpectedLevelPct < 60 ? "bar__fill--gold" : "bar__fill--green"}`} style={{ width: `${r.atExpectedLevelPct}%` }} />
                      </div>
                      <span className="mono strong" style={{ width: 40, textAlign: "right" }}>{r.atExpectedLevelPct}%</span>
                    </div>
                  </td>
                  <td className="num">{r.fullMarksCount}</td>
                  <td className="num">{r.eightyPlusCount}</td>
                  <td className="num">{r.belowExpectedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* (4) Marks Loss — finding cards */
export function MarksLoss({ items, onOpen }: { items: Finding[]; onOpen: (f: Finding) => void }) {
  return (
    <section className="section" id="s4">
      <SectionHead n={4} name="Marks Loss Intelligence" q="What is stopping students from scoring higher?" lead="Each card is one finding: what, how many students, how urgent for the Board, and how sure we are. The three statuses are independent." />
      <p className="hero-line">Lost Marks = Lost Board Potential</p>
      {items.length === 0 ? (
        <EvidenceState kind="early">No findings match the current filters. Widen the subject filter to see all findings.</EvidenceState>
      ) : (
        <div className="grid grid--2">
          {items.map((f) => (
            <FindingCard key={f.id} finding={f} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}

/* (5) Urgency vs Impact */
export function UrgencyVsImpact({ items, onOpen }: { items: Finding[]; onOpen: (f: Finding) => void }) {
  const sorted = [...items].sort((a, b) => b.studentsAffected * b.avgMarksLost - a.studentsAffected * a.avgMarksLost);
  return (
    <section className="section" id="s5">
      <SectionHead n={5} name="Board Urgency vs. Board Impact" q="Even if students are weak here, how much should I care for the Board?" lead="Board urgency and student impact are shown side by side so the trade-off is visible rather than collapsed into one score." />
      <div className="card">
        <div className="table-wrap">
          <table className="table table--hover">
            <thead>
              <tr>
                <th>Finding</th>
                <th className="num">Students</th>
                <th className="num">Avg lost</th>
                <th className="num">Marks exposure</th>
                <th>Board urgency</th>
                <th>Confidence</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => (
                <tr key={f.id} onClick={() => onOpen(f)}>
                  <td>
                    <div className="strong">
                      {f.subject} · {f.topic}
                    </div>
                    <div className="small muted">{f.subskill ?? "Whole chapter"}</div>
                  </td>
                  <td className="num">{f.studentsAffected}</td>
                  <td className="num">{f.avgMarksLost.toFixed(1)}</td>
                  <td className="num strong">{Math.round(f.studentsAffected * f.avgMarksLost)}</td>
                  <td>
                    <UrgencyChip level={f.boardUrgency} withLabel={false} />
                  </td>
                  <td>
                    <ConfidenceMeter level={f.confidence} short />
                  </td>
                  <td>
                    <ChevronRight size={14} className="muted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* (6) Student Potential Ladder */
export function PotentialLadder() {
  const p = potentialLadder;
  return (
    <section className="section" id="s6">
      <SectionHead n={6} name="Student Potential Ladder" q="Who is close to the next level?" lead="Students close to full attainment on tested Board marks, and the most common thing holding them back." />
      <div className="grid grid--4">
        <div className="stat">
          <div className="stat__label">Ladder</div>
          <div className="stat__value stat__value--sm">{p.potentialLabel}</div>
        </div>
        <div className="stat">
          <div className="stat__label">At potential</div>
          <div className="stat__value">{p.atPotential}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Within 1 mark</div>
          <div className="stat__value">{p.within1Mark}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Within 2 marks</div>
          <div className="stat__value">{p.within2Marks}</div>
        </div>
      </div>
      <div className="card card--soft card--flat" style={{ marginTop: 12 }}>
        <div className="card__body" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Target size={16} className="muted" />
          <span>
            Most common blocker for near-potential students: <strong>{p.mostCommonBlocker}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

/* (7) Performance Band Opportunity */
export function BandOpportunity() {
  return (
    <section className="section" id="s7">
      <SectionHead n={7} name="Performance Band Opportunity" q="What is stopping each band from moving higher?" />
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Band</th>
                <th className="num">Students</th>
                <th className="num">Near next band</th>
                <th>Common blocker</th>
              </tr>
            </thead>
            <tbody>
              {performanceBandOpportunity.map((b) => (
                <tr key={b.band}>
                  <td className="strong">{b.band}</td>
                  <td className="num">{b.students}</td>
                  <td className="num">{b.nearNextBand === null ? <span className="muted">—</span> : b.nearNextBand}</td>
                  <td>
                    {b.nearNextBand === null ? (
                      <span className="muted">Top band</span>
                    ) : b.commonBlocker ? (
                      <span className="tag tag--teal">{b.commonBlocker}</span>
                    ) : (
                      <span className="tag">No dominant common blocker</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* (8) Risk Intelligence */
export function RiskIntelligence() {
  const r = riskIntelligence;
  return (
    <section className="section" id="s8">
      <SectionHead n={8} name="Risk Intelligence" q="Who requires intervention?" />
      <div className="grid grid--2">
        <div className="card">
          <div className="card__head">
            <div>
              <div className="eyebrow">High-potential gap</div>
              <h3 style={{ fontSize: 18, marginTop: 4 }}>
                {r.highPotentialGap.students} students <ArrowUpRight size={16} style={{ verticalAlign: "-2px", color: "var(--brand-teal)" }} />
              </h3>
            </div>
            <ConfidenceMeter level={r.highPotentialGap.confidence} />
          </div>
          <div className="card__body">
            <dl className="kv">
              <dt>Performance</dt>
              <dd>{r.highPotentialGap.performance}</dd>
              <dt>Common pattern</dt>
              <dd>{r.highPotentialGap.commonPattern}</dd>
              <dt>Top blockers</dt>
              <dd style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {r.highPotentialGap.topBlockers.map((b) => (
                  <span className="tag tag--teal" key={b}>
                    {b}
                  </span>
                ))}
              </dd>
            </dl>
          </div>
        </div>
        <div className="card">
          <div className="card__head">
            <div>
              <div className="eyebrow">High academic risk</div>
              <h3 style={{ fontSize: 18, marginTop: 4 }}>
                {r.highAcademicRisk.students} students <AlertTriangle size={16} style={{ verticalAlign: "-2px", color: "var(--risk)" }} />
              </h3>
            </div>
            <ConfidenceMeter level={r.highAcademicRisk.confidence} />
          </div>
          <div className="card__body">
            <dl className="kv">
              <dt>Performance</dt>
              <dd>{r.highAcademicRisk.performance}</dd>
              <dt>Common gaps</dt>
              <dd style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {r.highAcademicRisk.commonGaps.map((b) => (
                  <span className="tag tag--risk" key={b}>
                    {b}
                  </span>
                ))}
              </dd>
            </dl>
            <div style={{ marginTop: 14 }}>
              <EvidenceState kind="early" compact>
                {emptyStates.earlySignal}
              </EvidenceState>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* (9) Subject Anomaly Intelligence */
export function SubjectAnomalies({ subjectFilter }: { subjectFilter: string }) {
  const rows = subjectAnomalies.filter((a) => subjectFilter === "All" || a.subject === subjectFilter);
  return (
    <section className="section" id="s9">
      <SectionHead n={9} name="Subject Anomaly Intelligence" q="Where is my batch struggling in an unusual or concentrated way?" lead="Patterns that stand out against the rest of the subject. Pattern labels are descriptive, not diagnoses." />
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Pattern</th>
                <th style={{ minWidth: 180 }}>% affected</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.subject + a.topic}>
                  <td className="strong">{a.subject}</td>
                  <td>{a.topic}</td>
                  <td>
                    <span className="tag">{a.pattern}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="bar" style={{ flex: 1 }}>
                        <div className="bar__fill bar__fill--ink" style={{ width: `${a.pctAffected}%` }} />
                      </div>
                      <span className="mono strong" style={{ width: 40, textAlign: "right" }}>{a.pctAffected}%</span>
                    </div>
                  </td>
                  <td>
                    <ConfidenceMeter level={a.confidence} short />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* (10) Section Comparison */
export function SectionComparison({ sectionFilter, onSection }: { sectionFilter: string; onSection?: (s: string) => void }) {
  return (
    <section className="section" id="s10">
      <SectionHead n={10} name="Section Comparison" q="Are all my sections facing the same problem?" lead="Attention is a section-level signal. It is separate from Board urgency and confidence." />
      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>
        <div className="card">
          <div className="table-wrap">
            <table className={`table ${onSection ? "table--hover" : ""}`}>
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
                {sectionComparison.map((s) => {
                  const dim = sectionFilter !== "All" && sectionFilter !== s.section;
                  return (
                    <tr key={s.section} style={{ opacity: dim ? 0.45 : 1 }} onClick={() => onSection?.(s.section)}>
                      <td className="strong">{s.section}</td>
                      <td className="num">{s.students}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div className="bar" style={{ flex: 1 }}>
                            <div className="bar__fill" style={{ width: `${s.overallAttainment}%` }} />
                          </div>
                          <span className="mono strong" style={{ width: 40, textAlign: "right" }}>{s.overallAttainment}%</span>
                        </div>
                      </td>
                      <td className="num">{s.highPriorityFindings}</td>
                      <td>
                        <AttentionPill level={s.attention} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card__body">
            <div className="eyebrow">Insight</div>
            <h3 style={{ fontSize: 17, margin: "6px 0 8px" }}>{sectionComparisonInsight.headline}</h3>
            <p className="muted">{sectionComparisonInsight.detail}</p>
            <div style={{ marginTop: 12 }}>
              <ConfidenceMeter level={sectionComparisonInsight.confidence} />
            </div>
            <p className="note" style={{ marginTop: 14 }}>
              A section gap describes tested performance on this assessment only. It is not a measure of
              teaching quality, and BoardX does not attribute it to any teacher.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* (11) Recommended Intervention Plan */
export function InterventionPlan({ onOpen }: { onOpen: (f: Finding) => void }) {
  return (
    <section className="section" id="s11">
      <SectionHead n={11} name="Recommended Intervention Plan" q="What should my school act on now?" lead="Priority combines student impact, marks exposure, Board recurrence and confidence. A confirmed problem without a localized cause is routed to investigation, not to an intervention." />
      <div style={{ display: "grid", gap: 12 }}>
        {interventionPlan.map((p) => {
          const f = findings.find((x) => x.id === p.findingId)!;
          const investigate = p.priority === "investigation_required";
          return (
            <div className={`card ${investigate ? "card--soft card--flat" : ""}`} key={p.findingId}>
              <div className="card__body" style={{ display: "grid", gridTemplateColumns: "96px 1fr auto", gap: 18, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  {investigate ? (
                    <span className="tag tag--gold" style={{ whiteSpace: "normal", textAlign: "center", lineHeight: 1.2 }}>
                      Investigate
                    </span>
                  ) : (
                    <>
                      <div className="eyebrow">Priority</div>
                      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{p.priority}</div>
                    </>
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 15 }}>
                      {f.subject} · {f.topic}
                      {f.subskill ? ` — ${f.subskill}` : ""}
                    </strong>
                    <UrgencyChip level={f.boardUrgency} withLabel={false} />
                    <ConfidenceMeter level={f.confidence} short />
                  </div>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {p.why}
                  </p>
                  {f.recommendedIntervention && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {f.recommendedIntervention.map((r) => (
                        <span className="tag tag--teal" key={r}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn--sm" onClick={() => onOpen(f)}>
                  Open finding <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
