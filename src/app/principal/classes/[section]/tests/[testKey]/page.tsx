"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Check, Send } from "lucide-react";
import { analysedTests, attentionFor, classAveragePct, classRosterFull, sectionComparison, subjects, testsConducted, topGapFor } from "@/lib/avai-mock-data";
import { markReportShared, useReportShared } from "@/lib/shareState";
import { EvidenceState } from "@/components/EvidenceState";
import { DeltaCell, StudentRosterTable } from "@/components/StudentRosterTable";

/** Principal → Classes → section → one test. A single-screen "sheet": a
 * compact header (title + tiny KPI row, top right), a compact subject-wise
 * strip, then the student roster table filling the rest of the viewport
 * with its own internal scroll. No page-level scrolling. */
export default function ClassTestPage() {
  const { section, testKey } = useParams<{ section: string; testKey: string }>();
  const router = useRouter();

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRosterFull[section] ?? [], [section]);
  const test = testsConducted.find((t) => t.key === testKey);
  const alreadyShared = useReportShared(section, testKey);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  function shareReport() {
    markReportShared(section, testKey);
    setToast(`Report sent to ${roster.length} students in ${section} via WhatsApp (demo only) · ${test?.name ?? testKey}.`);
  }

  // The test before this one, so every figure on this sheet can show
  // movement rather than a standing number with nothing to compare to.
  const prevTestKey = useMemo(() => {
    const i = analysedTests.findIndex((t) => t.key === testKey);
    return i > 0 ? analysedTests[i - 1].key : null;
  }, [testKey]);

  const subjectAvgFor = useMemo(
    () => (key: string, subj: string) =>
      roster.length ? Math.round((roster.reduce((sum, s) => sum + s.scores[key][subj].scored / s.scores[key][subj].outOf, 0) / roster.length) * 100) : 0,
    [roster]
  );

  const subjectAverages = useMemo(() => {
    if (!test || test.status !== "Analysed" || roster.length === 0) return [];
    return subjects.map((subj) => ({
      subject: subj,
      pct: subjectAvgFor(testKey, subj),
      delta: prevTestKey ? subjectAvgFor(testKey, subj) - subjectAvgFor(prevTestKey, subj) : null,
    }));
  }, [roster, test, testKey, prevTestKey, subjectAvgFor]);

  const overallAvg = test?.status === "Analysed" ? Math.round(classAveragePct(section, testKey)) : null;
  const overallDelta = prevTestKey ? Math.round(classAveragePct(section, testKey) - classAveragePct(section, prevTestKey)) : null;
  const needAttentionCount = roster.filter((s) => attentionFor(s, testKey) !== "On Track").length;
  const criticalCount = roster.filter((s) => attentionFor(s, testKey) === "Intervention").length;
  const weakest = [...subjectAverages].sort((a, b) => a.pct - b.pct)[0];

  if (!summary || !test) {
    return <EvidenceState kind="early">No such test for {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flex: "0 0 auto" }}>
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/principal/classes/${section}`)}>
            <ArrowLeft size={13} /> Back
          </button>
          <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <Link href="/principal/classes" className="btn--link">
              Classes
            </Link>
            <ChevronRight size={13} />
            <Link href={`/principal/classes/${section}`} className="btn--link">
              {section}
            </Link>
            <ChevronRight size={13} /> {test.name}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
            <h1 className="page-title" style={{ fontSize: 19 }}>
              {section} · {test.name}
            </h1>
            {test.status === "Analysed" ? <span className="tag tag--green">Analysed</span> : <span className="tag">Scheduled</span>}
            {test.status === "Analysed" && (
              <button className="btn btn--sm btn--primary" disabled={alreadyShared} onClick={shareReport}>
                {alreadyShared ? <Check size={13} /> : <Send size={13} />} {alreadyShared ? "Shared" : "Share report"}
              </button>
            )}
          </div>
          <div className="small muted">Conducted {test.date}</div>
          {test.status === "Analysed" && (
            <div style={{ display: "flex", gap: 18, marginTop: 8, justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Class average</div>
                <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 6 }}>
                  {overallAvg}%
                  <DeltaCell delta={overallDelta} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Students</div>
                <div className="stat__value stat__value--sm">{roster.length}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Need attention</div>
                <div className="stat__value stat__value--sm">{needAttentionCount}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat__label">Critical</div>
                <div className="stat__value stat__value--sm">{criticalCount}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {test.status !== "Analysed" ? (
        <div style={{ marginTop: 20 }}>
          <EvidenceState kind="early">{test.name} hasn&apos;t been conducted yet for {section} — no marks to show.</EvidenceState>
        </div>
      ) : (
        <>
          <div className="grid grid--5" style={{ marginTop: 14, flex: "0 0 auto" }}>
            {subjectAverages.map((s) => (
              <div className="stat" key={s.subject}>
                <div className="stat__label">{s.subject}</div>
                <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  {s.pct}%
                  <DeltaCell delta={s.delta} />
                </div>
                <div className="bar" style={{ marginTop: 6 }}>
                  <div className={`bar__fill ${s.pct >= 78 ? "bar__fill--green" : s.pct >= 65 ? "bar__fill--gold" : "bar__fill--risk"}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {weakest && (
            <p className="small muted" style={{ marginTop: 10, flex: "0 0 auto" }}>
              Weakest subject in this paper: <strong>{weakest.subject}</strong> at {weakest.pct}%. Biggest gap across the class:{" "}
              <strong>{topGapFor(section, testKey)}</strong>.
            </p>
          )}

          <div style={{ marginTop: 10, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <StudentRosterTable roster={roster} testKey={testKey} section={section} testStatus="Analysed" testName={test.name} fillHeight />
          </div>
        </>
      )}

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
