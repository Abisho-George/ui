"use client";

import Link from "next/link";
import { ArrowRight, Download, Users } from "lucide-react";
import { classTeacherBySection, latestTest, schoolSnapshot, sectionComparison } from "@/lib/avai-mock-data";
import { downloadSectionsComparisonReport } from "@/lib/downloadReport";
import { AttentionPill } from "@/components/Status";
import { DeltaCell } from "@/components/StudentRosterTable";

/** Principal → Classes overview: where the school stands, then one card
 * per section, drilling into the class detail page (tests conducted +
 * full student roster). */
export default function ClassesPage() {
  // Worst-performing class first: the overview's job is to point at the
  // class that needs the principal today, not to list sections in order.
  const ordered = [...sectionComparison].sort((a, b) => a.overallAttainment - b.overallAttainment);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">Classes</h1>
          <p className="page-sub">
            After {latestTest.name} · {schoolSnapshot.students} students across {schoolSnapshot.sections} sections. Tap a class to see the tests conducted
            and its students.
          </p>
        </div>
        <button className="btn btn--sm" onClick={() => downloadSectionsComparisonReport(latestTest.key)}>
          <Download size={13} /> Download report
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card__body" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div className="stat__label">School attainment</div>
            <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              {schoolSnapshot.overallAttainment}%
              <DeltaCell delta={schoolSnapshot.delta} />
            </div>
          </div>
          <div>
            <div className="stat__label">Need attention</div>
            <div className="stat__value stat__value--sm">
              {schoolSnapshot.needAttention}
              <span className="small muted" style={{ fontWeight: 400 }}>
                {" "}
                of {schoolSnapshot.students}
              </span>
            </div>
          </div>
          <div>
            <div className="stat__label">Critical</div>
            <div className="stat__value stat__value--sm">{schoolSnapshot.critical}</div>
          </div>
          <div>
            <div className="stat__label">Weakest class</div>
            <div className="stat__value stat__value--sm">{ordered[0]?.section}</div>
          </div>
        </div>
      </div>

      <div className="grid grid--3" style={{ marginTop: 20 }}>
        {ordered.map((s) => (
          <Link href={`/principal/classes/${s.section}`} key={s.section} className="card" style={{ display: "block" }}>
            <div className="card__body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{s.section}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>
                    {classTeacherBySection[s.section] ?? "No class teacher assigned"}
                  </div>
                </div>
                <AttentionPill level={s.attention} label={`${s.attention} risk`} />
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 16 }}>
                <div>
                  <div className="stat__label">Students</div>
                  <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={14} className="muted" /> {s.students}
                  </div>
                </div>
                <div>
                  <div className="stat__label">Attainment</div>
                  <div className="stat__value stat__value--sm" style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    {s.overallAttainment}%
                    <DeltaCell delta={s.delta} />
                  </div>
                </div>
                <div>
                  <div className="stat__label">Need attention</div>
                  <div className="stat__value stat__value--sm">
                    {s.needAttention}
                    {s.critical > 0 && (
                      <span className="small muted" style={{ fontWeight: 400 }}>
                        {" "}
                        · {s.critical} critical
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="bar" style={{ marginTop: 14 }}>
                <div
                  className={`bar__fill ${s.overallAttainment >= 78 ? "bar__fill--green" : s.overallAttainment >= 70 ? "bar__fill--gold" : "bar__fill--risk"}`}
                  style={{ width: `${s.overallAttainment}%` }}
                />
              </div>
            </div>
            <div className="card__foot" style={{ justifyContent: "flex-end" }}>
              <span className="btn--link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                View class <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
