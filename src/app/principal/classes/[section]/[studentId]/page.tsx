"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { classRosterFull, individualStudentIntelligence, studentReportDetail, studentReportsByStudent, type BoardUrgency, type Confidence } from "@/lib/avai-mock-data";
import { AttentionPill, ConfidenceMeter, UrgencyChip } from "@/components/Status";
import { EvidenceState } from "@/components/EvidenceState";
import { BoardXReportView } from "@/components/BoardXReportView";

interface SubjectRow {
  subject: string;
  lost: number;
  topic: string;
  subskill?: string;
  cause?: string;
  boardUrgency?: BoardUrgency;
  confidence: Confidence;
}

/** Principal → Classes → section → student. Test-wise report picker: pick
 * which analysed assessment/subject to view, then render the same one-page
 * BoardX report a student sees themselves. Falls back gracefully when a
 * student has only summary-level intelligence, or none yet. */
export default function PrincipalStudentPage() {
  const { section, studentId } = useParams<{ section: string; studentId: string }>();
  const router = useRouter();
  const student = (classRosterFull[section] ?? []).find((s) => s.id === studentId);

  const reportIds = studentReportsByStudent[studentId] ?? [];
  const reports = reportIds.map((id) => ({ id, report: studentReportDetail[id] })).filter((r) => r.report);
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id ?? "");
  const selected = reports.find((r) => r.id === selectedReportId);

  const intelKey = student?.name.split(" ")[0].toLowerCase() ?? "";
  const intel = individualStudentIntelligence[intelKey];

  const studentName = student?.name ?? studentId;

  return (
    <>
      <button className="btn btn--ghost btn--sm" onClick={() => router.push(`/principal/classes/${section}`)} style={{ marginBottom: 10 }}>
        <ArrowLeft size={13} /> Back
      </button>
      <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <Link href="/principal/classes" className="btn--link">
          Classes
        </Link>
        <ChevronRight size={13} />
        <Link href={`/principal/classes/${section}`} className="btn--link">
          {section}
        </Link>
        <ChevronRight size={13} /> {studentName}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">{studentName}</h1>
          <p className="page-sub">
            {section} {student ? `· Roll ${student.rollNo}` : ""}
          </p>
        </div>
        {student && <AttentionPill level={student.attention} />}
      </div>

      {reports.length > 0 && (
        <div className="filterbar" style={{ marginTop: 20 }}>
          <div className="filter">
            <label htmlFor="report-picker">Assessment · Subject</label>
            <select id="report-picker" className="select" value={selectedReportId} onChange={(e) => setSelectedReportId(e.target.value)}>
              {reports.map(({ id, report }) => (
                <option key={id} value={id}>
                  {report.assessmentName} · {report.subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selected ? (
        <div style={{ marginTop: 16 }}>
          <BoardXReportView report={selected.report} studentName={studentName} section={section} />
        </div>
      ) : intel ? (
        <div style={{ marginTop: 20 }}>
          <div className="grid grid--3">
            <div className="stat">
              <div className="stat__label">Unit Test 2</div>
              <div className="stat__value stat__value--sm">{intel.unitTestAttainment}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Marks lost</div>
              <div className="stat__value stat__value--sm">{intel.marksLost}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Recoverable</div>
              <div className="stat__value stat__value--sm">{intel.recoverableOpportunity}</div>
            </div>
          </div>

          <section className="section">
            <h2 className="section-q">Where marks were lost</h2>
            <div className="card card--flat" style={{ marginTop: 12 }}>
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
                  {(intel.subjects as SubjectRow[]).map((s) => (
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
          </section>

          <section className="section">
            <h2 className="section-q">BoardX summary</h2>
            <p style={{ marginTop: 8 }}>{intel.boardXSummary}</p>
          </section>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          <EvidenceState kind="early">Individual analysis for this student is not yet available in this build.</EvidenceState>
          {student && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card__body">
                <dl className="kv">
                  <dt>Main blocker</dt>
                  <dd>{student.mainBlocker}</dd>
                  <dt>Attention</dt>
                  <dd>
                    <AttentionPill level={student.attention} />
                  </dd>
                </dl>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
