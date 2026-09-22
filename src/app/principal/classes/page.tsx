"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BookX, ChevronRight, Download, Sparkles, TrendingDown, TrendingUp, Trophy, X } from "lucide-react";
import {
  anomalyInsights,
  classRosterFull,
  lateBloomers,
  latestTest,
  overallPctFor,
  pctFor,
  schoolSnapshot,
  sectionComparison,
  sections,
  studentsInSubjectBand,
  studentsInTotalBand,
  subjectBandCounts,
  subjectMarkBands,
  subjects,
  subjectsByAverage,
  topGapFor,
  topStudents,
  totalBandCounts,
  totalMarkBands,
  type FullRosterStudent,
  type MarkBand,
} from "@/lib/avai-mock-data";
import { downloadSectionsComparisonReport } from "@/lib/downloadReport";
import { usePageHeader } from "@/lib/pageHeader";
import { SUBJECT_BAND_COLORS, TOTAL_BAND_COLORS } from "@/lib/bandColors";
import { BandPie } from "@/components/BandPie";
import { MarkBandTable, type BandTableRow } from "@/components/MarkBandTable";

type BandDrawer = { title: string; subtitle: string; students: FullRosterStudent[] } | null;
type IntelPanel = "toppers" | "lateBloomers" | "weakestClass" | "weakestSubject" | null;

function StudentRow({ student, showSection, meta }: { student: FullRosterStudent; showSection: boolean; meta?: string }) {
  return (
    <Link href={`/principal/classes/${student.section}/${student.id}`} className="subject-row">
      <div>
        <div className="strong">{student.name}</div>
        <div className="small muted">
          Roll {student.rollNo}
          {showSection ? ` · ${student.section}` : ""}
        </div>
      </div>
      {meta && <div className="strong">{meta}</div>}
    </Link>
  );
}

/** Principal's default landing page (§ "Class X" dashboard) — Board-mark
 * distribution for the whole grade and by subject with student-level
 * drill-down, section/subject-filterable pies, and the intelligence layer
 * (toppers, late bloomers, weakest class/subject, anomalies). Everything
 * here reads from the same roster every other screen reads, so nothing
 * shown here can disagree with a class or student page. */
export default function ClassXDashboard() {
  usePageHeader({ title: "Class X" });

  const [bandDrawer, setBandDrawer] = useState<BandDrawer>(null);
  const [intelPanel, setIntelPanel] = useState<IntelPanel>(null);
  const [pieSubject, setPieSubject] = useState<string>("All");
  const [pieSection, setPieSection] = useState<string>(sections[0]);

  const testKey = latestTest.key;

  // ---------- Board mark distribution ----------
  const overallRow: BandTableRow = {
    key: "overall",
    label: "Class X overall",
    counts: totalBandCounts("All", testKey),
  };
  const subjectRows: BandTableRow[] = subjects.map((subject) => ({
    key: subject,
    label: subject,
    counts: subjectBandCounts("All", testKey, subject),
  }));

  function openTotalBand(band: MarkBand) {
    setBandDrawer({
      title: `Class X overall — ${band.label}`,
      subtitle: `Projected Board total out of 500, based on ${latestTest.name}.`,
      students: studentsInTotalBand("All", testKey, band),
    });
  }
  function openSubjectBand(subject: string, band: MarkBand) {
    setBandDrawer({
      title: `${subject} — ${band.label}`,
      subtitle: `Projected Board marks out of 100, based on ${latestTest.name}.`,
      students: studentsInSubjectBand("All", testKey, subject, band),
    });
  }

  // ---------- Filters + pies ----------
  const pieBands = pieSubject === "All" ? totalMarkBands : subjectMarkBands;
  const pieColors = pieSubject === "All" ? TOTAL_BAND_COLORS : SUBJECT_BAND_COLORS;
  const overallCounts = pieSubject === "All" ? totalBandCounts("All", testKey) : subjectBandCounts("All", testKey, pieSubject);
  const sectionCounts = pieSubject === "All" ? totalBandCounts(pieSection, testKey) : subjectBandCounts(pieSection, testKey, pieSubject);

  // ---------- Intelligence layer ----------
  const schoolToppers = topStudents(10, testKey);
  const bloomers = lateBloomers(10);
  const weakestSection = [...sectionComparison].sort((a, b) => a.overallAttainment - b.overallAttainment)[0];
  const subjectStandings = subjectsByAverage(testKey);
  const weakestSubject = subjectStandings[0];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <p className="page-sub" style={{ marginTop: 0 }}>
          After {latestTest.name} · {schoolSnapshot.students} students across {sections.length} sections of Class X.
        </p>
        <button className="btn btn--sm" onClick={() => downloadSectionsComparisonReport(testKey)}>
          <Download size={13} /> Download report
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: 16, marginTop: 20 }}>
        {sections.map((s) => (
          <div className="stat" key={s}>
            <div className="stat__label">{s} students</div>
            <div className="stat__value">{classRosterFull[s]?.length ?? 0}</div>
          </div>
        ))}
        <div className="stat" style={{ background: "var(--brand-teal-soft)", borderColor: "transparent" }}>
          <div className="stat__label">Class X total</div>
          <div className="stat__value">{schoolSnapshot.students}</div>
        </div>
      </div>

      {/* Board mark distribution */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section-q">Projected Board mark distribution</h2>
            <p className="section__lead">
              {latestTest.name} scores projected onto the Board scale (100 marks a subject, 500 overall). Click a number to see who&apos;s in that band.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card__body" style={{ paddingBottom: 0 }}>
            <div className="eyebrow">Overall — out of 500</div>
          </div>
          <MarkBandTable bands={totalMarkBands} rows={[overallRow]} colors={TOTAL_BAND_COLORS} onOpen={(_key, band) => openTotalBand(band)} />
          <div className="card__body" style={{ paddingBottom: 0, paddingTop: 4 }}>
            <div className="eyebrow">By subject — out of 100 each</div>
          </div>
          <MarkBandTable bands={subjectMarkBands} rows={subjectRows} colors={SUBJECT_BAND_COLORS} onOpen={(key, band) => openSubjectBand(key, band)} />
        </div>
      </section>

      {/* Filters + pies */}
      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Where the marks land</h2>
        </div>
        <div className="filterbar">
          <div className="filter">
            <label htmlFor="pie-subject">Subject</label>
            <select id="pie-subject" className="select" value={pieSubject} onChange={(e) => setPieSubject(e.target.value)}>
              <option value="All">All subjects (overall)</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="pie-section">Compare section</label>
            <select id="pie-section" className="select" value={pieSection} onChange={(e) => setPieSection(e.target.value)}>
              {sections.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid--2" style={{ marginTop: 16, alignItems: "start" }}>
          <div className="card">
            <div className="card__head">
              <h3 style={{ fontSize: 15 }}>Class X overall</h3>
              <span className="small muted">{pieSubject === "All" ? "All subjects" : pieSubject}</span>
            </div>
            <div className="card__body">
              <BandPie slices={pieBands.map((b, i) => ({ label: b.label, value: overallCounts[i].count, color: pieColors[i] }))} />
            </div>
          </div>
          <div className="card">
            <div className="card__head">
              <h3 style={{ fontSize: 15 }}>{pieSection}</h3>
              <span className="small muted">{pieSubject === "All" ? "All subjects" : pieSubject}</span>
            </div>
            <div className="card__body">
              <BandPie slices={pieBands.map((b, i) => ({ label: b.label, value: sectionCounts[i].count, color: pieColors[i] }))} />
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence layer */}
      <section className="section">
        <div className="section__head">
          <div>
            <h2 className="section-q">
              <Sparkles size={17} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Intelligence layer
            </h2>
            <p className="section__lead">Live, drawn from the same roster as everything above — not separate claims.</p>
          </div>
        </div>

        <div className="card intel-band">
          <button className="intel-band__seg" style={{ "--accent": "#e0a62a" } as React.CSSProperties} onClick={() => setIntelPanel("toppers")}>
            <span className="intel-band__icon">
              <Trophy size={15} />
            </span>
            <div className="stat__label">Toppers</div>
            <div className="strong" style={{ fontSize: 16, marginTop: 6 }}>
              {schoolToppers[0]?.name ?? "—"}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {schoolToppers[0] ? `${Math.round(overallPctFor(schoolToppers[0], testKey))}% overall — highest in Class X` : "Not enough data"}
            </div>
            <ChevronRight size={15} className="intel-band__arrow" />
          </button>

          <button className="intel-band__seg" style={{ "--accent": "#3a9d6a" } as React.CSSProperties} disabled={bloomers.length === 0} onClick={() => setIntelPanel("lateBloomers")}>
            <span className="intel-band__icon">
              <TrendingUp size={15} />
            </span>
            <div className="stat__label">Late bloomers</div>
            <div className="strong" style={{ fontSize: 16, marginTop: 6 }}>
              {bloomers.length > 0 ? `${bloomers.length} climbing` : "None this term"}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {bloomers[0] ? `Led by ${bloomers[0].student.name}, +${bloomers[0].gain}pt since the previous test` : "Needs a second analysed test"}
            </div>
            <ChevronRight size={15} className="intel-band__arrow" />
          </button>

          <button className="intel-band__seg" style={{ "--accent": "#c94a3a" } as React.CSSProperties} onClick={() => setIntelPanel("weakestClass")}>
            <span className="intel-band__icon">
              <TrendingDown size={15} />
            </span>
            <div className="stat__label">Weakest class</div>
            <div className="strong" style={{ fontSize: 16, marginTop: 6 }}>
              {weakestSection?.section}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {weakestSection?.overallAttainment}% overall attainment — lowest of {sections.length} sections
            </div>
            <ChevronRight size={15} className="intel-band__arrow" />
          </button>

          <button className="intel-band__seg" style={{ "--accent": "#2f6fd3" } as React.CSSProperties} onClick={() => setIntelPanel("weakestSubject")}>
            <span className="intel-band__icon">
              <BookX size={15} />
            </span>
            <div className="stat__label">Weakest subject</div>
            <div className="strong" style={{ fontSize: 16, marginTop: 6 }}>
              {weakestSubject?.subject}
            </div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {weakestSubject?.avgPct}% school average — lowest of {subjects.length} subjects
            </div>
            <ChevronRight size={15} className="intel-band__arrow" />
          </button>
        </div>

        {/* Anomalies */}
        <div className="section__head" style={{ marginTop: 28 }}>
          <div>
            <h3 className="section-q" style={{ fontSize: 16 }}>
              Anomalies worth a look
            </h3>
            <p className="section__lead">Real, numbers-backed surprises the averages above don&apos;t show on their own.</p>
          </div>
        </div>
        {anomalyInsights.length === 0 ? (
          <p className="small muted">No anomalies stand out against this assessment&apos;s data.</p>
        ) : (
          <div className="grid grid--2">
            {anomalyInsights.slice(0, 8).map((a) => (
              <div className="card card--flat" key={a.id}>
                <div className="card__body">
                  <div className="finding__subject">{a.subject ?? a.section ?? "School-wide"}</div>
                  <div className="strong" style={{ marginTop: 2 }}>
                    {a.headline}
                  </div>
                  <p className="small muted" style={{ marginTop: 6 }}>
                    {a.detail}
                  </p>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 10 }}>
                    {a.numbers.map((n) => (
                      <div key={n.label}>
                        <div className="stat__label">{n.label}</div>
                        <div className="strong">{n.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {a.studentId && (
                  <div className="card__foot" style={{ justifyContent: "flex-end" }}>
                    <Link href={`/principal/classes/${a.section}/${a.studentId}`} className="btn btn--sm">
                      View student
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Band drill-down drawer */}
      <AnimatePresence>
        {bandDrawer && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBandDrawer(null)} />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={bandDrawer.title}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="drawer__head">
                <div>
                  <h3 style={{ fontSize: 18 }}>{bandDrawer.title}</h3>
                  <div className="muted small">{bandDrawer.subtitle}</div>
                </div>
                <button className="iconbtn" onClick={() => setBandDrawer(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="drawer__body">
                <div className="small muted" style={{ marginBottom: 10 }}>
                  {bandDrawer.students.length} student{bandDrawer.students.length === 1 ? "" : "s"} — tap one to open their report.
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {bandDrawer.students.map((s) => (
                    <StudentRow key={s.id} student={s} showSection />
                  ))}
                  {bandDrawer.students.length === 0 && <p className="small muted">No students in this band.</p>}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Intelligence layer drawer */}
      <AnimatePresence>
        {intelPanel && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIntelPanel(null)} />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-modal="true"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="drawer__head">
                <h3 style={{ fontSize: 18 }}>
                  {intelPanel === "toppers" && "Toppers"}
                  {intelPanel === "lateBloomers" && "Late bloomers"}
                  {intelPanel === "weakestClass" && "Sections, weakest first"}
                  {intelPanel === "weakestSubject" && "Subjects, weakest first"}
                </h3>
                <button className="iconbtn" onClick={() => setIntelPanel(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="drawer__body">
                {intelPanel === "toppers" && (
                  <>
                    <p className="small muted" style={{ marginTop: 0 }}>
                      Ranked by overall % across all {subjects.length} subjects, {latestTest.name}.
                    </p>
                    <div className="drawer__section" style={{ marginTop: 0 }}>
                      <h4>School-wide top 10</h4>
                      <div style={{ display: "grid", gap: 8 }}>
                        {schoolToppers.map((s, i) => (
                          <StudentRow key={s.id} student={s} showSection meta={`#${i + 1} · ${Math.round(overallPctFor(s, testKey))}%`} />
                        ))}
                      </div>
                    </div>
                    {sections.map((sec) => (
                      <div className="drawer__section" key={sec}>
                        <h4>Top 3 in {sec}</h4>
                        <div style={{ display: "grid", gap: 8 }}>
                          {topStudents(3, testKey, sec).map((s, i) => (
                            <StudentRow key={s.id} student={s} showSection={false} meta={`#${i + 1}`} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {intelPanel === "lateBloomers" && (
                  <div className="drawer__section" style={{ marginTop: 0 }}>
                    <h4>
                      {bloomers.length} student{bloomers.length === 1 ? "" : "s"} gained ground since {latestTest.name}&apos;s previous test
                    </h4>
                    <div style={{ display: "grid", gap: 8 }}>
                      {bloomers.map((b) => (
                        <StudentRow key={b.student.id} student={b.student} showSection meta={`${b.prevPct}% → ${b.nowPct}% (+${b.gain}pt)`} />
                      ))}
                      {bloomers.length === 0 && <p className="small muted">Needs a second analysed test to show movement.</p>}
                    </div>
                  </div>
                )}
                {intelPanel === "weakestClass" && (
                  <div className="drawer__section" style={{ marginTop: 0 }}>
                    <h4>Overall attainment — average % across all 5 subjects, {latestTest.name}</h4>
                    <div style={{ display: "grid", gap: 14 }}>
                      {[...sectionComparison]
                        .sort((a, b) => a.overallAttainment - b.overallAttainment)
                        .map((s) => (
                          <div key={s.section}>
                            <div className="bar-row" style={{ gridTemplateColumns: "70px 1fr 50px" }}>
                              <div className="bar-row__label strong">{s.section}</div>
                              <div className="bar">
                                <div
                                  className={`bar__fill ${s.overallAttainment >= 78 ? "bar__fill--green" : s.overallAttainment >= 70 ? "bar__fill--gold" : "bar__fill--risk"}`}
                                  style={{ width: `${s.overallAttainment}%` }}
                                />
                              </div>
                              <div className="bar-row__val">{s.overallAttainment}%</div>
                            </div>
                            <div className="small muted" style={{ marginTop: 2 }}>
                              Biggest gap: <strong>{topGapFor(s.section, testKey)}</strong> · {s.needAttention} of {s.students} need attention
                              {s.critical > 0 ? ` (${s.critical} critical)` : ""}.
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {intelPanel === "weakestSubject" && (
                  <div className="drawer__section" style={{ marginTop: 0 }}>
                    <h4>School average per subject, {latestTest.name}</h4>
                    <div style={{ display: "grid", gap: 6 }}>
                      {subjectStandings.map((s) => (
                        <div className="bar-row" key={s.subject} style={{ gridTemplateColumns: "140px 1fr 50px" }}>
                          <div className="bar-row__label strong">{s.subject}</div>
                          <div className="bar">
                            <div
                              className={`bar__fill ${s.avgPct >= 78 ? "bar__fill--green" : s.avgPct >= 70 ? "bar__fill--gold" : "bar__fill--risk"}`}
                              style={{ width: `${s.avgPct}%` }}
                            />
                          </div>
                          <div className="bar-row__val">{s.avgPct}%</div>
                        </div>
                      ))}
                    </div>
                    <h4 style={{ marginTop: 22 }}>Where — each subject, broken down by section</h4>
                    <p className="small muted" style={{ marginTop: -4, marginBottom: 10 }}>
                      Every subject&apos;s weakest section is highlighted, so a low school average never hides which class is actually pulling it down.
                    </p>
                    <div className="table-wrap">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            {sections.map((sec) => (
                              <th key={sec} className="num">
                                {sec}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {subjectStandings.map((s) => {
                            const bySection = sections.map((sec) => {
                              const roster = classRosterFull[sec] ?? [];
                              const avg = roster.length ? roster.reduce((sum, st) => sum + pctFor(st, testKey, s.subject), 0) / roster.length : 0;
                              return { section: sec, pct: Math.round(avg) };
                            });
                            const min = Math.min(...bySection.map((b) => b.pct));
                            return (
                              <tr key={s.subject}>
                                <td className="strong">{s.subject}</td>
                                {bySection.map((b) => (
                                  <td key={b.section} className="num" style={b.pct === min ? { color: "var(--risk)", fontWeight: 700 } : undefined}>
                                    {b.pct}%
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
