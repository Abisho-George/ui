"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { emptyStates, findingDetail, type Finding } from "@/lib/avai-mock-data";
import { useEscape } from "@/lib/use-escape";
import { ConfidenceMeter, UrgencyChip } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";

/** §5.5 Finding details drawer. */
export function FindingDrawer({ finding, onClose }: { finding: Finding | null; onClose: () => void }) {
  useEscape(Boolean(finding), onClose);
  const detail = finding ? findingDetail[finding.id] : undefined;
  return (
    <AnimatePresence>
      {finding && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${finding.topic} details`}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <div className="drawer__head">
              <div>
                <div className="finding__subject">{finding.subject}</div>
                <h3 style={{ fontSize: 20 }}>{finding.topic}</h3>
                <div className="muted">{finding.subskill ?? "Whole chapter"}</div>
              </div>
              <button className="iconbtn" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="drawer__body">
              <div className="drawer__section">
                <h4>Status</h4>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <UrgencyChip level={finding.boardUrgency} />
                  <ConfidenceMeter level={finding.confidence} />
                  <span className="tag">{finding.boardRecurrence}</span>
                </div>
                {finding.causeStatus === "not_localized" && (
                  <div style={{ marginTop: 12 }}>
                    <EvidenceState kind="cause">
                      {emptyStates.causeNotLocalized} Confidence here refers to the existence of the problem, not to a cause.
                    </EvidenceState>
                  </div>
                )}
              </div>

              <div className="drawer__section">
                <h4>What we observed</h4>
                <p>{finding.observation}</p>
              </div>

              <div className="drawer__section">
                <h4>Impact</h4>
                <dl className="kv">
                  <dt>Students affected</dt>
                  <dd className="strong">{finding.studentsAffected} of 240 analysed</dd>
                  <dt>Avg marks lost</dt>
                  <dd className="strong">{finding.avgMarksLost.toFixed(1)} per affected student</dd>
                  <dt>Questions tested</dt>
                  <dd>{detail?.questionsTested ?? "—"}</dd>
                  <dt>Board recurrence</dt>
                  <dd>{detail?.boardYears.join(", ") ?? finding.boardRecurrence}</dd>
                </dl>
              </div>

              {detail && (
                <div className="drawer__section">
                  <h4>Evidence from this paper</h4>
                  <ul className="list-plain">
                    {detail.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detail && (
                <div className="drawer__section">
                  <h4>Students affected by section</h4>
                  {detail.sectionBreakdown.map((s) => (
                    <div className="bar-row" key={s.section} style={{ gridTemplateColumns: "60px 1fr 48px" }}>
                      <div className="bar-row__label">{s.section}</div>
                      <div className="bar">
                        <div className={`bar__fill ${s.pct >= 65 ? "bar__fill--risk" : s.pct >= 50 ? "bar__fill--gold" : ""}`} style={{ width: `${s.pct}%` }} />
                      </div>
                      <div className="bar-row__val">{s.pct}%</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="drawer__section">
                <h4>Recommended intervention</h4>
                {finding.recommendedIntervention?.length ? (
                  <ul className="list-plain">
                    {finding.recommendedIntervention.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Not prescribed. Manual answer-script review is recommended before choosing an intervention.</p>
                )}
              </div>

              <div className="drawer__section">
                <EvidenceState kind="trend">{emptyStates.trendNotAvailable}</EvidenceState>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
