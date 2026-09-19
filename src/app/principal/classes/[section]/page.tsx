"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { classRoster, classTeacherBySection, findings, sectionComparison } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";
import { FindingCard } from "@/components/FindingCard";
import { FindingDrawer } from "@/components/boardx/FindingDrawer";
import { EvidenceState } from "@/components/EvidenceState";

/** Principal → Classes → one section. KPIs + findings + a searchable
 * student roster, each row drilling into that student's test-wise report. */
export default function ClassDetailPage() {
  const { section } = useParams<{ section: string }>();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [attentionFilter, setAttentionFilter] = useState<string>("All");
  const [openFindingId, setOpenFindingId] = useState<string | null>(null);

  const summary = sectionComparison.find((s) => s.section === section);
  const roster = useMemo(() => classRoster.filter((s) => s.section === section), [section]);
  const sectionFindings = useMemo(() => findings.filter((f) => f.mostAffectedSections?.some((m) => m.section === section)), [section]);
  const openFinding = sectionFindings.find((f) => f.id === openFindingId) ?? null;

  const filteredRoster = roster.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase()) || s.rollNo.includes(query);
    const matchesAttention = attentionFilter === "All" || s.attention === attentionFilter;
    return matchesQuery && matchesAttention;
  });

  if (!summary) {
    return <EvidenceState kind="early">No class named {section} in this demo dataset.</EvidenceState>;
  }

  return (
    <>
      <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <Link href="/principal/classes" className="btn--link">
          Classes
        </Link>
        <ChevronRight size={13} /> {section}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">Class {section}</h1>
          <p className="page-sub">Class teacher: {classTeacherBySection[section] ?? "Not assigned"}</p>
        </div>
        <AttentionPill level={summary.attention} />
      </div>

      <div className="grid grid--4" style={{ marginTop: 20 }}>
        <div className="stat">
          <div className="stat__label">Students</div>
          <div className="stat__value">{summary.students}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Overall attainment</div>
          <div className="stat__value">{summary.overallAttainment}%</div>
        </div>
        <div className="stat">
          <div className="stat__label">Attention</div>
          <div className="stat__value stat__value--sm">{summary.attention}</div>
        </div>
        <div className="stat">
          <div className="stat__label">High-priority findings</div>
          <div className="stat__value">{summary.highPriorityFindings}</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Findings affecting {section}</h2>
        </div>
        {sectionFindings.length ? (
          <div className="grid grid--2">
            {sectionFindings.map((f) => (
              <FindingCard key={f.id} finding={f} compact onOpen={() => setOpenFindingId(f.id)} />
            ))}
          </div>
        ) : (
          <EvidenceState kind="early">No findings rise above the evidence threshold for {section} from a single test.</EvidenceState>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">Students in {section}</h2>
        </div>
        <div className="filterbar" style={{ marginBottom: 0 }}>
          <div className="filter" style={{ flex: 1, maxWidth: 280 }}>
            <label htmlFor="roster-search">Search</label>
            <input id="roster-search" className="input" placeholder="Name or roll no." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="filter">
            <label htmlFor="roster-attention">Attention</label>
            <select id="roster-attention" className="select" value={attentionFilter} onChange={(e) => setAttentionFilter(e.target.value)}>
              {["All", "On Track", "Watch", "Intervention"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="table-wrap">
            <table className="table table--hover">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student</th>
                  <th>Main blocker</th>
                  <th>Attention</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EvidenceState kind="early" compact>
                        No students match this filter in this sample roster.
                      </EvidenceState>
                    </td>
                  </tr>
                )}
                {filteredRoster.map((s) => (
                  <tr key={s.id} onClick={() => router.push(`/principal/classes/${section}/${s.id}`)}>
                    <td className="muted">{s.rollNo}</td>
                    <td className="strong">{s.name}</td>
                    <td>{s.mainBlocker}</td>
                    <td>
                      <AttentionPill level={s.attention} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/principal/classes/${section}/${s.id}`} className="btn btn--sm" onClick={(e) => e.stopPropagation()}>
                        Report <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card__foot small muted">Showing a sample of {roster.length} of {summary.students} students in this build.</div>
        </div>
      </section>

      <FindingDrawer finding={openFinding} onClose={() => setOpenFindingId(null)} />
    </>
  );
}
