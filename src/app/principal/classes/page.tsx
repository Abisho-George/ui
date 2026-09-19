"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { classRosterFull, classTeacherBySection, sectionComparison } from "@/lib/avai-mock-data";
import { AttentionPill } from "@/components/Status";

/** Principal → Classes overview: one card per section, drilling into the
 * class detail page (tests conducted + full student roster). */
export default function ClassesPage() {
  return (
    <>
      <h1 className="page-title">Classes</h1>
      <p className="page-sub">Tap a class to see the tests conducted and its students.</p>

      <div className="grid grid--3" style={{ marginTop: 20 }}>
        {sectionComparison.map((s) => {
          const needAttention = (classRosterFull[s.section] ?? []).filter((r) => r.attention !== "On Track").length;
          return (
            <Link href={`/principal/classes/${s.section}`} key={s.section} className="card" style={{ display: "block" }}>
              <div className="card__body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{s.section}</div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {classTeacherBySection[s.section] ?? "No class teacher assigned"}
                    </div>
                  </div>
                  <AttentionPill level={s.attention} />
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
                    <div className="stat__value stat__value--sm">{s.overallAttainment}%</div>
                  </div>
                  <div>
                    <div className="stat__label">Need attention</div>
                    <div className="stat__value stat__value--sm">{needAttention}</div>
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
          );
        })}
      </div>
    </>
  );
}
