"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarClock, ChevronDown } from "lucide-react";
import { classAveragePct, sectionComparison, sections, testsConducted } from "@/lib/avai-mock-data";
import { usePageHeader } from "@/lib/pageHeader";

/** Principal → Exams. A read-only calendar of every test: conducted (with
 * a school average) and upcoming. Papers and marks are entered by subject
 * teachers now — this is where the principal sees the assessment calendar
 * and opens a test's own class-by-class report, the page we already built
 * for that (per-section, per-test "sheet"). */
export default function ExamsPage() {
  usePageHeader({ title: "Exams" });
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const conducted = testsConducted.filter((t) => t.status === "Analysed");
  const upcoming = testsConducted.filter((t) => t.status === "Scheduled");

  function toggle(key: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function schoolAverage(testKey: string) {
    const vals = sections.map((s) => classAveragePct(s, testKey));
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  return (
    <>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Every test on the calendar — conducted and upcoming. Open one to see its class-by-class report.
      </p>

      <div className="grid grid--2" style={{ marginTop: 20 }}>
        <div className="stat">
          <div className="stat__label">Conducted</div>
          <div className="stat__value">{conducted.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Upcoming</div>
          <div className="stat__value">{upcoming.length}</div>
        </div>
      </div>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">
            <CalendarCheck size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Conducted
          </h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {conducted.map((t) => {
            const isOpen = expanded.has(t.key);
            const avg = schoolAverage(t.key);
            return (
              <div className="card" key={t.key}>
                <button
                  onClick={() => toggle(t.key)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  aria-expanded={isOpen}
                >
                  <div className="card__head">
                    <div>
                      <div className="strong" style={{ fontSize: 15 }}>
                        {t.name}
                      </div>
                      <div className="small muted" style={{ marginTop: 2 }}>
                        {t.date}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ textAlign: "right" }}>
                        <div className="stat__label">School average</div>
                        <div className="strong">{avg}%</div>
                      </div>
                      <ChevronDown size={16} className="muted" style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .15s" }} />
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="card__body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sections.map((s) => {
                      const summary = sectionComparison.find((sc) => sc.section === s);
                      return (
                        <Link key={s} href={`/principal/classes/${s}/tests/${t.key}`} className="btn btn--sm">
                          {s} · {summary ? `${Math.round(classAveragePct(s, t.key))}%` : "—"}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {conducted.length === 0 && <p className="small muted">No tests conducted yet.</p>}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section-q">
            <CalendarClock size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} /> Upcoming
          </h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {upcoming.map((t) => {
            const isOpen = expanded.has(t.key);
            return (
              <div className="card" key={t.key}>
                <button
                  onClick={() => toggle(t.key)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  aria-expanded={isOpen}
                >
                  <div className="card__head">
                    <div>
                      <div className="strong" style={{ fontSize: 15 }}>
                        {t.name}
                      </div>
                      <div className="small muted" style={{ marginTop: 2 }}>
                        {t.date}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="tag">Scheduled</span>
                      <ChevronDown size={16} className="muted" style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .15s" }} />
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="card__body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sections.map((s) => (
                      <Link key={s} href={`/principal/classes/${s}/tests/${t.key}`} className="btn btn--sm">
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {upcoming.length === 0 && <p className="small muted">Nothing scheduled.</p>}
        </div>
      </section>
    </>
  );
}
