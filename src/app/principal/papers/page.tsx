"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileUp, Sparkles, Upload, X } from "lucide-react";
import {
  assessmentContext,
  paperChapterMapping,
  papersList,
  pageHeaders,
  subjects,
  type PaperRecord,
  type PaperStatus,
} from "@/lib/avai-mock-data";
import { useAuth } from "@/lib/auth";

function StatusTag({ status }: { status: PaperStatus }) {
  if (status === "Mapped") return <span className="tag tag--green">Mapped</span>;
  if (status === "Processing") return <span className="tag tag--gold">Processing</span>;
  return <span className="tag tag--risk">Needs mapping</span>;
}

const emptyDraft = { assessmentName: assessmentContext.assessmentOptions[0].label, subject: "All subjects", fileName: "" };

/** §5.9 Question Papers. Upload is simulated: a new row appears as
 * "Processing" and flips to "Needs mapping" after a short delay — nothing
 * is actually parsed. Local state only, resets on reload. */
export default function PapersPage() {
  const { user } = useAuth();
  const [papers, setPapers] = useState<PaperRecord[]>(() => papersList.map((p) => ({ ...p })));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [mappingFor, setMappingFor] = useState<PaperRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.files?.[0]?.name;
    if (name) setDraft((d) => ({ ...d, fileName: name }));
  }

  function upload() {
    const id = `paper_${Date.now()}`;
    const record: PaperRecord = {
      id,
      assessmentName: draft.assessmentName,
      subject: draft.subject,
      fileName: draft.fileName || "untitled-paper.pdf",
      uploadedBy: user?.name ?? "You",
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: "Processing",
      blueprintCoveragePct: null,
      chaptersCovered: null,
      chaptersTotal: null,
    };
    setPapers((ps) => [record, ...ps]);
    setUploadOpen(false);
    setToast(`Uploaded ${record.fileName}. Mapping against the Board blueprint…`);
    setDraft(emptyDraft);
    setTimeout(() => {
      setPapers((ps) => ps.map((p) => (p.id === id ? { ...p, status: "Needs mapping" } : p)));
    }, 1800);
  }

  const canUpload = draft.assessmentName.trim().length > 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">{pageHeaders.papers.title}</h1>
          <p className="page-sub">{pageHeaders.papers.blurb}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setUploadOpen(true)}>
          <Upload size={15} /> Upload paper
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Subject</th>
                <th>File</th>
                <th>Uploaded</th>
                <th>Blueprint coverage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => (
                <tr key={p.id}>
                  <td className="strong">{p.assessmentName}</td>
                  <td>{p.subject}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <FileUp size={13} style={{ color: "var(--muted)" }} />
                      <span className="small">{p.fileName}</span>
                    </div>
                  </td>
                  <td className="small muted">
                    {p.uploadedAt} · {p.uploadedBy}
                  </td>
                  <td style={{ minWidth: 140 }}>
                    {p.blueprintCoveragePct != null ? (
                      <div className="bar-row" style={{ gridTemplateColumns: "1fr 40px", padding: 0 }}>
                        <div className="bar">
                          <div className="bar__fill" style={{ width: `${p.blueprintCoveragePct}%` }} />
                        </div>
                        <div className="bar-row__val">{p.blueprintCoveragePct}%</div>
                      </div>
                    ) : (
                      <span className="muted small">Not yet available</span>
                    )}
                  </td>
                  <td>
                    <StatusTag status={p.status} />
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="btn btn--sm" disabled={p.status === "Processing"} onClick={() => setMappingFor(p)}>
                      View mapping
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card__foot small muted">Uploads are simulated for this demo — nothing is parsed or stored, and the list resets on reload.</div>
      </div>

      <AnimatePresence>
        {uploadOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUploadOpen(false)}>
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
                  <Upload size={16} /> Upload paper
                </h3>
                <button className="iconbtn" onClick={() => setUploadOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="modal__body">
                <div className="field">
                  <label htmlFor="p-assessment">Assessment</label>
                  <select
                    id="p-assessment"
                    className="select"
                    style={{ minWidth: 0 }}
                    value={draft.assessmentName}
                    onChange={(e) => setDraft({ ...draft, assessmentName: e.target.value })}
                  >
                    {assessmentContext.assessmentOptions.map((o) => (
                      <option key={o.label}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="p-subject">Subject</label>
                  <select id="p-subject" className="select" style={{ minWidth: 0 }} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })}>
                    <option>All subjects</option>
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="p-file">Paper file</label>
                  <input id="p-file" className="input" type="file" accept=".pdf,.doc,.docx" onChange={onFilePicked} />
                  {draft.fileName && (
                    <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <CheckCircle2 size={13} style={{ color: "var(--brand-green)" }} /> {draft.fileName}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal__foot">
                <button className="btn" onClick={() => setUploadOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn--primary" disabled={!canUpload} onClick={upload}>
                  <Sparkles size={14} /> Upload &amp; map to blueprint
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mappingFor && (
          <>
            <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMappingFor(null)} />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-modal="true"
              aria-label={`${mappingFor.assessmentName} blueprint mapping`}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="drawer__head">
                <div>
                  <div className="finding__subject">{mappingFor.subject}</div>
                  <h3 style={{ fontSize: 20 }}>{mappingFor.assessmentName}</h3>
                  <div className="muted small">{mappingFor.fileName}</div>
                </div>
                <button className="iconbtn" onClick={() => setMappingFor(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="drawer__body">
                <div className="drawer__section">
                  <h4>Blueprint coverage</h4>
                  {mappingFor.blueprintCoveragePct != null ? (
                    <dl className="kv">
                      <dt>Coverage</dt>
                      <dd className="strong">{mappingFor.blueprintCoveragePct}%</dd>
                      <dt>Chapters covered</dt>
                      <dd>
                        {mappingFor.chaptersCovered} of {mappingFor.chaptersTotal}
                      </dd>
                    </dl>
                  ) : (
                    <p className="muted">Mapping not yet run for this paper.</p>
                  )}
                </div>
                {paperChapterMapping[mappingFor.id] ? (
                  <div className="drawer__section">
                    <h4>Chapter-by-chapter</h4>
                    {paperChapterMapping[mappingFor.id].map((c) => (
                      <div className="bar-row" key={c.chapter} style={{ gridTemplateColumns: "1fr 90px" }}>
                        <div className="bar-row__label">{c.chapter}</div>
                        <div className="small" style={{ textAlign: "right" }}>
                          {c.covered ? (
                            <span className="tag tag--green">{c.questionsMapped} Q mapped</span>
                          ) : (
                            <span className="tag">Not tested</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="drawer__section">
                    <p className="muted">No chapter-level mapping available yet for this paper.</p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
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
