"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock, Users } from "lucide-react";
import { AnimatedBar, CountUp, Reveal } from "@/components/motion";
import {
  adminSchools,
  formatAgo,
  onboardingPct,
  pipelineBoard,
  stageHints,
  statusAccent,
} from "@/lib/avai-admin-data";
import { OpsEmpty } from "../ui";

/** Where an AVAI ops person starts the day: every account mid-onboarding,
 * one column per stage, blockers first. */
export default function AdminOnboardingPage() {
  const onboarding = adminSchools.filter((s) => s.status === "Onboarding");
  const blocked = onboarding.filter((s) => s.blocker).length;
  const waiting = onboarding.reduce((n, s) => n + (s.students - s.studentsOnboarded), 0);

  return (
    <>
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Onboarding pipeline</h1>
            <p className="page-sub">
              {onboarding.length} schools between contract and first analysis. A school only reaches its principal once the
              students have onboarded and one paper is mapped.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="pillnum pillnum--solid" style={{ "--accent": "var(--brand-blue)" } as React.CSSProperties}>
              <CountUp value={onboarding.length} /> in flight
            </span>
            <span className="pillnum" style={{ "--accent": "var(--risk)" } as React.CSSProperties}>
              <CountUp value={blocked} /> blocked
            </span>
            <span className="pillnum" style={{ "--accent": "var(--brand-gold)" } as React.CSSProperties}>
              <CountUp value={waiting} /> students waiting
            </span>
          </div>
        </div>
      </Reveal>

      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 20,
          overflowX: "auto",
          paddingBottom: 12,
          alignItems: "flex-start",
        }}
      >
        {pipelineBoard.map((col, ci) => (
          <section
            key={col.stage}
            aria-label={`${col.stage}: ${col.schools.length} schools`}
            className="reveal"
            style={
              {
                "--d": `${ci * 70}ms`,
                flex: "1 0 268px",
                minWidth: 268,
                maxWidth: 340,
                borderRadius: "var(--radius-lg)",
                border: "1px solid #dde4f1",
                background: "linear-gradient(180deg, rgba(255,255,255,.9), rgba(255,255,255,.62))",
                boxShadow: "var(--shadow-xs)",
                padding: 12,
              } as React.CSSProperties
            }
          >
            <header style={{ padding: "2px 2px 10px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <h2 style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: ".01em" }}>{col.stage}</h2>
                <span className="pillnum" style={{ "--accent": "var(--brand-blue)" } as React.CSSProperties}>
                  {col.schools.length}
                </span>
              </div>
              <p className="small muted" style={{ marginTop: 4, lineHeight: 1.35 }}>
                {stageHints[col.stage]}
              </p>
              <div className="small muted mono" style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Users size={11} /> {col.students} students
              </div>
            </header>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {col.schools.length === 0 ? (
                <OpsEmpty>Nothing in this stage.</OpsEmpty>
              ) : (
                col.schools.map((s, i) => {
                  const slow = s.daysInStage >= 8;
                  return (
                    <Link
                      key={s.id}
                      href={`/admin/schools/${s.id}`}
                      className="card card--hover reveal"
                      style={
                        {
                          "--d": `${ci * 70 + 120 + i * 60}ms`,
                          "--accent": slow ? "var(--risk)" : "var(--brand-blue)",
                          display: "block",
                          color: "inherit",
                        } as React.CSSProperties
                      }
                    >
                      <div className="card__body" style={{ padding: "14px 15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.25 }}>{s.name}</div>
                            <div className="small muted mono">
                              {s.code} · {s.city}
                            </div>
                          </div>
                          <span
                            className="tag"
                            style={{
                              whiteSpace: "nowrap",
                              color: slow ? "var(--risk)" : "var(--muted)",
                              borderColor: slow ? "color-mix(in srgb, var(--risk) 35%, transparent)" : undefined,
                              background: slow ? "var(--risk-soft)" : undefined,
                            }}
                          >
                            <Clock size={11} /> {s.daysInStage}d
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                          <div style={{ flex: 1 }}>
                            <AnimatedBar
                              value={onboardingPct(s)}
                              accent={statusAccent(s.status)}
                              height={6}
                              delay={0.2 + i * 0.06}
                              label={`${s.name} onboarding ${onboardingPct(s)} percent complete`}
                            />
                          </div>
                          <span className="small mono muted">{onboardingPct(s)}%</span>
                        </div>

                        {s.blocker ? (
                          <div
                            className="small"
                            style={{
                              display: "flex",
                              gap: 7,
                              alignItems: "flex-start",
                              marginTop: 12,
                              padding: "8px 10px",
                              borderRadius: "var(--radius-sm)",
                              background: "var(--risk-soft)",
                              color: "#8f3226",
                            }}
                          >
                            <AlertTriangle size={13} style={{ flex: "0 0 auto", marginTop: 1 }} />
                            <span>{s.blocker}</span>
                          </div>
                        ) : (
                          <div className="small muted" style={{ marginTop: 12 }}>
                            No blocker · moving on schedule
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            marginTop: 12,
                            paddingTop: 10,
                            borderTop: "1px dashed var(--line)",
                          }}
                        >
                          <span className="small muted">
                            {s.owner} · {formatAgo(s.lastActivity)}
                          </span>
                          <ArrowRight size={14} className="muted" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>

      <Reveal delay={0.25}>
        <p className="small muted" style={{ marginTop: 6 }}>
          Stages are derived from the account checklist, so a card moves the moment its step is ticked off on the account
          page — there is no separate pipeline to keep in sync.
        </p>
      </Reveal>
    </>
  );
}
