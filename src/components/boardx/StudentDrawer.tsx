"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { emptyStates, individualStudentIntelligence, type BoardUrgency, type Confidence } from "@/lib/avai-mock-data";
import { ConfidenceMeter, UrgencyChip } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

interface SubjectRow {
  subject: string;
  lost: number;
  topic: string;
  subskill?: string;
  cause?: string;
  boardUrgency?: BoardUrgency;
  confidence: Confidence;
}

/** §5.6 Student row drill-down. */
export function StudentDrawer({ studentKey, onClose }: { studentKey: string | null; onClose: () => void }) {
  const data = studentKey ? individualStudentIntelligence[studentKey] : undefined;
  return (
    <AnimatePresence>
      {studentKey && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
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
              <div>
                <div className="eyebrow">Student intelligence</div>
                <h3 style={{ fontSize: 20 }}>{data?.name ?? studentKey}</h3>
                {data && <div className="muted">Section {data.section}</div>}
              </div>
              <button className="iconbtn" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="drawer__body">
              {!data ? (
                <EvidenceState kind="early">Individual analysis for this student is not yet available in this build.</EvidenceState>
              ) : (
                <>
                  <div className="grid grid--3">
                    <div className="stat">
                      <div className="stat__label">Unit Test 2</div>
                      <div className="stat__value stat__value--sm">{data.unitTestAttainment}</div>
                    </div>
                    <div className="stat">
                      <div className="stat__label">Marks lost</div>
                      <div className="stat__value stat__value--sm">{data.marksLost}</div>
                    </div>
                    <div className="stat">
                      <div className="stat__label">Recoverable</div>
                      <div className="stat__value stat__value--sm">{data.recoverableOpportunity}</div>
                    </div>
                  </div>

                  <div className="drawer__section">
                    <h4>Where marks were lost</h4>
                    <div className="card card--flat">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Topic</th>
                            <th className="num">Lost</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.subjects as SubjectRow[]).map((s) => (
                            <tr key={s.subject + s.topic}>
                              <td className="strong">{s.subject}</td>
                              <td>
                                {s.topic}
                                <div className="small muted">{s.subskill ?? s.cause}</div>
                              </td>
                              <td className="num">{s.lost}</td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                                  {s.boardUrgency && <UrgencyChip level={s.boardUrgency} withLabel={false} />}
                                  <ConfidenceMeter level={s.confidence} short />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="drawer__section">
                    <h4>BoardX summary</h4>
                    <p>{data.boardXSummary}</p>
                  </div>

                  <div className="drawer__section">
                    <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
