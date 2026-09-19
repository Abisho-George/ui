"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Download, Send, X } from "lucide-react";
import {
  analysedTests,
  attentionFor,
  classAveragePct,
  classRosterFull,
  classTeacherBySection,
  latestTest,
  sectionComparison,
  testsConducted,
  topGapFor,
} from "@/lib/avai-mock-data";
import { downloadClassReport } from "@/lib/downloadReport";
import { AttentionPill } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { DeltaCell, StudentRosterTable } from "@/components/StudentRosterTable";

/** Principal → Classes → one section. KPIs, the test calendar for this
 * class (each test clickable through to its own class-in-that-test page),
 * and the full student roster with test/subject/quick filters.
 *
 * Every KPI follows the selected test, so the headline figure can never
 * disagree with the table underneath it. */
export default function ClassDetailPage() {
  const { section } = useParams<{ section: string }>();
  const router = useRouter();
  const [testKey, setTestKey] = useState(latestTest.key);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTestKey, setShareTestKey] = useState(latestTest.key);
  // Which tests' reports have already been sent to this class's students —
  // local to this session, same as every other "resets on reload" action
  // in this demo (Enter Marks, Question Papers, Help & Contact).
  const [sharedTests, setSharedTests] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRosterFull[section] ?? [], [section]);
  const test = testsConducted.find((t) => t.key === testKey);
  const analysed = test?.status === "Analysed";
  const lastSharedTest = [...sharedTests]
    .map((k) => testsConducted.find((t) => t.key === k))
    .filter((t): t is (typeof testsConducted)[number] => Boolean(t))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];

  function sendReport() {
    setSharedTests((s) => new Set(s).add(shareTestKey));
    setShareOpen(false);
    const t = testsConducted.find((x) => x.key === shareTestKey);
    setToast(`Report sent to ${roster.length} students in ${section} via WhatsApp (demo only) · ${t?.name ?? shareTestKey}.`);
  }

  const kpis = useMemo(() => {
    if (!analysed) return null;
    const i = analysedTests.findIndex((t) => t.key === testKey);
    const prev = i > 0 ? analysedTests[i - 1].key : null;
    const avg = classAveragePct(section, testKey);
    return {
      attainment: Math.round(avg),
      delta: prev ? Math.round(avg - classAveragePct(section, prev)) : null,
      needAttention: roster.filter((s) => attentionFor(s, testKey) !== "On Track").length,
      critical: roster.filter((s) => attentionFor(s, testKey) === "Intervention").length,
      topGap: topGapFor(section, testKey),
    };
  }, [section, testKey, roster, analysed]);

  if (!summary) {
    return <EvidenceState kind="early">No class named {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <button className="btn btn--ghost btn--sm" onClick={() => router.push("/principal/classes")} style={{ marginBottom: 10 }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <Link href="/principal/classes" className="btn--link">
          Classes
        </Link>
        <ChevronRight size={13} /> {section}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">Class {section}</h1>
          <p className="page-sub">
            Class teacher: {classTeacherBySection[section] ?? "Not assigned"} · showing {test?.name ?? "—"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn btn--sm" disabled={!analysed} onClick={() => downloadClassReport(section, testKey)}>
            <Download size={13} /> Download report
          </button>
          <button
            className="btn btn--sm btn--primary"
            disabled={!analysedTests.length}
            onClick={() => {
              setShareTestKey(testKey);
              setShareOpen(true);
            }}
          >
            <Send size={13} /> Share report
          </button>
          <AttentionPill level={summary.attention} label={`${summary.attention} risk`} />
        </div>
      </div>

      <div className="grid grid--5" style={{ marginTop: 20 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{roster.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Overall attainment</div>
          <div className="stat__value" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            {kpis ? `${kpis.attainment}%` : <span className="muted">—</span>}
            {kpis && <DeltaCell delta={kpis.delta} />}
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Need attention</div>
          <div className="stat__value">
            {kpis ? kpis.needAttention : <span className="muted">—</span>}
            {kpis && kpis.critical > 0 && (
              <span className="small muted" style={{ fontWeight: 400 }}>
                {" "}
                · {kpis.critical} critical
              </span>
            )}
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Biggest gap</div>
          <div className="stat__value stat__value--sm">{kpis ? kpis.topGap : <span className="muted">—</span>}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Reports shared</div>
          <div className="stat__value stat__value--sm">
            {lastSharedTest ? (
              <>
                {roster.length} of {roster.length}
                <span className="small muted" style={{ fontWeight: 400 }}> · {lastSharedTest.name}</span>
              </>
            ) : (
              <span className="muted">Not sent yet</span>
            )}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Tests conducted</h2>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table table--hover">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="num">Class average</th>
                  <th className="num">vs previous</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {testsConducted.map((t) => {
                  const i = analysedTests.findIndex((a) => a.key === t.key);
                  const avg = t.status === "Analysed" ? Math.round(classAveragePct(section, t.key)) : null;
                  const delta = i > 0 ? Math.round(classAveragePct(section, t.key) - classAveragePct(section, analysedTests[i - 1].key)) : null;
                  return (
                    <tr key={t.key} onClick={() => router.push(`/principal/classes/${section}/tests/${t.key}`)}>
                      <td className="strong">{t.name}</td>
                      <td className="small muted">{t.date}</td>
                      <td>{t.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}</td>
                      <td className="num">{avg != null ? `${avg}%` : <span className="muted">—</span>}</td>
                      <td className="num">{t.status === "Analysed" ? <DeltaCell delta={delta} /> : <span className="muted">—</span>}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className="btn--link">View →</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Students in {section}</h2>
        </div>

        <div style={{ marginTop: 14 }}>
          <StudentRosterTable
            roster={roster}
            testKey={testKey}
            section={section}
            testStatus={test?.status ?? "Scheduled"}
            testName={test?.name}
            leadingFilters={
              <div className="filter">
                <label htmlFor="test-filter">Test</label>
                <select id="test-filter" className="select" value={testKey} onChange={(e) => setTestKey(e.target.value)}>
                  {testsConducted.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                      {t.status !== "Analysed" ? " (not yet conducted)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            }
          />
        </div>
      </section>

      <AnimatePresence>
        {shareOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareOpen(false)}>
            <motion.div
              className="modal"
              role="dialog"
              aria-modal="true"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__head">
                <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Send size={16} /> Share report with {section}
                </h3>
                <button className="iconbtn" onClick={() => setShareOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="modal__body">
                <p className="small muted" style={{ margin: 0 }}>
                  Sends every student in {section} their own one-page report for the assessment you pick, directly to WhatsApp.
                </p>
                <div className="field">
                  <label htmlFor="share-test">Assessment</label>
                  <select id="share-test" className="select" value={shareTestKey} onChange={(e) => setShareTestKey(e.target.value)}>
                    {analysedTests.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal__foot">
                <button className="btn" onClick={() => setShareOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn--primary" onClick={sendReport}>
                  <Send size={14} /> Send to {roster.length} students
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
