"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Building2,
  CalendarClock,
  Check,
  FileCheck2,
  KeyRound,
  Mail,
  Phone,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AnimatedBar, CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import {
  activityFeedFor,
  checklistAccent,
  checklistLength,
  daysUntil,
  eventAccent,
  formatAgo,
  formatDate,
  formatINR,
  onboardingPct,
  schoolById,
  statusAccent,
  teacherRosterFor,
  type ChecklistStep,
} from "@/lib/avai-admin-data";
import { accessKeyFor, issueKey, keyIdFor, markReminded, useAdminState } from "@/lib/adminState";
import { MiniArea, MiniColumns, OpsEmpty, StatusPill, Toast, useToast } from "../../ui";

export default function AdminSchoolDetailPage() {
  const params = useParams<{ schoolId: string }>();
  const school = schoolById(params.schoolId);
  const { keys } = useAdminState();
  const { message, show } = useToast();

  if (!school) {
    return (
      <div className="placeholder" style={{ marginTop: 24 }}>
        <p>No account with that id.</p>
        <Link href="/admin/schools" className="btn btn--sm" style={{ marginTop: 12 }}>
          <ArrowLeft size={13} /> Back to the portfolio
        </Link>
      </div>
    );
  }

  const roster = teacherRosterFor(school.id);
  const feed = activityFeedFor(school.id);
  const renewalIn = daysUntil(school.renewalDate);
  const onboardedWeeks = school.onboardingSeries.filter((w) => !w.future).map((w) => ({ label: w.label, value: w.cumulative }));

  function generateNextKey() {
    if (!school) return;
    const next = roster.find((t) => t.keyStatus === "Not issued" && !keys[keyIdFor(school.id, t.id)]);
    if (!next) {
      const idle = roster.find((t) => t.keyStatus !== "Active");
      show(idle ? `Every key is issued — ${idle.name} has not used theirs yet.` : "Every teacher here has an active key.");
      return;
    }
    const key = issueKey(school.id, next.id);
    show(`Key ${key} generated for ${next.name} — invite email queued.`);
  }

  function sendReminder() {
    if (!school) return;
    markReminded(school.id);
    show(`Reminder sent to ${school.contact.name} at ${school.contact.email}.`);
  }

  const headline: { label: string; value: number; sub: string; accent: string; icon: LucideIcon; suffix?: string }[] = [
    { label: "Students onboarded", value: school.studentsOnboarded, sub: `of ${school.students} enrolled`, accent: "var(--brand-blue)", icon: UserPlus },
    { label: "Teachers activated", value: school.teachersActivated, sub: `of ${school.teachersInvited} invited`, accent: "var(--brand-gold)", icon: KeyRound },
    { label: "Assessments analysed", value: school.assessmentsAnalysed, sub: school.analysedDates.length ? `last on ${formatDate(school.analysedDates[school.analysedDates.length - 1])}` : "none yet", accent: "var(--brand-teal)", icon: FileCheck2 },
    { label: "Onboarding", value: onboardingPct(school), sub: `${school.progress} of ${checklistLength} steps done`, accent: statusAccent(school.status), icon: Building2, suffix: "%" },
  ];

  return (
    <>
      <Link href="/admin/schools" className="btn btn--ghost btn--sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={13} /> All accounts
      </Link>

      <Reveal>
        <header className="surface surface--raised" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ minWidth: 260, flex: "1 1 340px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 24, letterSpacing: "-.01em" }}>{school.name}</h1>
                <StatusPill status={school.status} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <span className="tag mono">{school.code}</span>
                <span className="tag">{school.board}</span>
                <span className="tag">
                  {school.city}, {school.state}
                </span>
                <span className="tag tag--info">{school.plan}</span>
                <span className="tag">{school.sections} sections · Class X</span>
              </div>
              <p className="small" style={{ marginTop: 12, color: "var(--brand-ink-soft)", maxWidth: 620 }}>
                {school.note}
              </p>
            </div>

            <div
              style={{
                flex: "0 1 300px",
                borderLeft: "1px solid var(--line)",
                paddingLeft: 18,
                display: "grid",
                gap: 2,
              }}
            >
              <div className="eyebrow">Primary contact</div>
              <div style={{ fontWeight: 650 }}>{school.contact.name}</div>
              <div className="small muted">{school.contact.role}</div>
              <a className="small" href={`mailto:${school.contact.email}`} style={{ display: "inline-flex", gap: 6, alignItems: "center", marginTop: 6 }}>
                <Mail size={12} /> {school.contact.email}
              </a>
              <span className="small muted" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <Phone size={12} /> {school.contact.phone}
              </span>
              <div className="metric-row" style={{ marginTop: 10 }}>
                <span className="muted">Renewal</span>
                <b style={{ color: renewalIn > 0 && renewalIn <= 60 ? "var(--risk)" : undefined }}>
                  {formatDate(school.renewalDate)}
                  {renewalIn > 0 ? ` · ${renewalIn}d` : " · lapsed"}
                </b>
              </div>
              <div className="metric-row">
                <span className="muted">Contract</span>
                <b>{formatINR(school.contractValue)}</b>
              </div>
              <div className="metric-row">
                <span className="muted">AVAI owner</span>
                <b>{school.owner}</b>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
            <button type="button" className="btn btn--blue btn--sm" onClick={generateNextKey}>
              <KeyRound size={13} /> Generate access key
            </button>
            <button type="button" className="btn btn--sm" onClick={sendReminder}>
              <BellRing size={13} /> Send reminder
            </button>
            <span className="small muted" style={{ alignSelf: "center" }}>
              Last activity {formatAgo(school.lastActivity)} · {formatDate(school.lastActivity)}
            </span>
          </div>
        </header>
      </Reveal>

      <Stagger className="grid" gap={0.05} style={{ marginTop: 16, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        {headline.map((k, i) => {
          const Icon = k.icon;
          return (
            <StaggerItem key={k.label}>
              <div className="kpi" style={{ "--accent": k.accent } as React.CSSProperties}>
                <span className="kpi__icon">
                  <Icon size={21} />
                </span>
                <div className="kpi__text">
                  <div className="kpi__label">{k.label}</div>
                  <div className="kpi__value">
                    <CountUp value={k.value} delay={0.12 + i * 0.05} suffix={k.suffix ?? ""} />
                  </div>
                  <div className="kpi__sub">{k.sub}</div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="grid" style={{ marginTop: 18, gridTemplateColumns: "minmax(0, 1.55fr) minmax(0, 1fr)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
          <Reveal delay={0.08}>
            <section className="card" aria-labelledby="checklist-h">
              <div className="card__body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <h2 id="checklist-h" style={{ fontSize: 15 }}>
                    Onboarding checklist
                  </h2>
                  <span className="pillnum" style={{ "--accent": statusAccent(school.status) } as React.CSSProperties}>
                    {school.progress} / {checklistLength}
                  </span>
                </div>
                <p className="small muted" style={{ marginTop: 2, marginBottom: 16 }}>
                  AVAI owns teacher invites and access keys — the school never generates them.
                </p>
                <ol style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
                  {school.checklist.map((step, i) => (
                    <TimelineStep key={step.key} step={step} index={i} last={i === school.checklist.length - 1} />
                  ))}
                </ol>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.14}>
            <section className="card" aria-labelledby="usage-h">
              <div className="card__body">
                <h2 id="usage-h" style={{ fontSize: 15 }}>
                  Usage
                </h2>
                <p className="small muted" style={{ marginTop: 2, marginBottom: 16 }}>
                  What this account has actually run since kick-off on {formatDate(school.onboardingStart)}.
                </p>

                <div className="grid grid--2" style={{ gap: 20 }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>
                      Assessments analysed
                    </div>
                    {school.assessmentsAnalysed === 0 ? (
                      <OpsEmpty>No assessment analysed yet — that is the last onboarding step.</OpsEmpty>
                    ) : (
                      <MiniColumns data={school.analysedByMonth} accent="var(--brand-blue)" />
                    )}
                  </div>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 10 }}>
                      Students onboarded, cumulative
                    </div>
                    {school.studentsOnboarded === 0 ? (
                      <OpsEmpty>Student onboarding has not started. Slips go out at the class-teacher briefing.</OpsEmpty>
                    ) : (
                      <MiniArea data={onboardedWeeks} accent="var(--brand-teal)" />
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>
                    Section coverage
                  </div>
                  {school.studentsOnboarded === 0 ? (
                    <OpsEmpty>Nothing to show until the first section attends.</OpsEmpty>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {school.sectionCoverage.map((c, i) => {
                        const pct = Math.round((c.onboarded / c.total) * 100);
                        return (
                          <div key={c.section} style={{ display: "grid", gridTemplateColumns: "58px 1fr 76px", gap: 12, alignItems: "center" }}>
                            <span className="small" style={{ fontWeight: 650 }}>
                              {c.section}
                            </span>
                            <AnimatedBar
                              value={pct}
                              accent={pct >= 80 ? "var(--brand-green)" : pct >= 40 ? "var(--brand-gold)" : "var(--risk)"}
                              delay={0.1 + i * 0.06}
                              label={`${c.section}: ${c.onboarded} of ${c.total} onboarded`}
                            />
                            <span className="small mono muted" style={{ textAlign: "right" }}>
                              {c.onboarded} / {c.total}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.2}>
            <section className="card" aria-labelledby="roster-h">
              <div className="card__body" style={{ paddingBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 id="roster-h" style={{ fontSize: 15 }}>
                      Teacher roster
                    </h2>
                    <p className="small muted" style={{ marginTop: 2 }}>
                      {school.teachersActivated} of {roster.length} teachers are using their key.
                    </p>
                  </div>
                  <button type="button" className="btn btn--sm" onClick={generateNextKey}>
                    <KeyRound size={13} /> Generate next key
                  </button>
                </div>
              </div>

              {roster.length === 0 ? (
                <div className="card__body">
                  <OpsEmpty>No staff list yet. The school has not shared one.</OpsEmpty>
                </div>
              ) : (
                <div className="table-wrap table-wrap--scroll" style={{ maxHeight: 420 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Teacher</th>
                        <th scope="col">Subjects &amp; classes</th>
                        <th scope="col">Invite</th>
                        <th scope="col">Access key</th>
                        <th scope="col">Last seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((t) => {
                        const stored = keys[keyIdFor(school.id, t.id)];
                        const shownKey = stored ?? (t.keyStatus === "Issued" ? accessKeyFor(school.id, t.id) : null);
                        return (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{t.name}</td>
                            <td>
                              <div className="small">{t.subjects.length ? t.subjects.join(", ") : "Class teacher"}</div>
                              <div className="small muted">{t.classes.join(" · ")}</div>
                            </td>
                            <td>
                              <span
                                className={`tag ${t.invite === "Accepted" ? "tag--green" : t.invite === "Sent" ? "tag--gold" : ""}`}
                              >
                                {t.invite}
                              </span>
                            </td>
                            <td style={{ minWidth: 190 }}>
                              {t.keyStatus === "Active" ? (
                                <span className="tag tag--teal">
                                  <Check size={11} /> Active
                                </span>
                              ) : shownKey ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span className="mono small" style={{ fontWeight: 650, color: "var(--brand-blue)" }}>
                                    {shownKey}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => show(`Access key re-sent to ${t.name}.`)}
                                  >
                                    Resend
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn--sm"
                                  onClick={() => {
                                    const key = issueKey(school.id, t.id);
                                    show(`Key ${key} generated for ${t.name} — invite email queued.`);
                                  }}
                                >
                                  <KeyRound size={12} /> Generate key
                                </button>
                              )}
                            </td>
                            <td className="small muted" style={{ whiteSpace: "nowrap" }}>
                              {t.lastSeen ? formatAgo(t.lastSeen) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </Reveal>
        </div>

        <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
          <Reveal delay={0.12}>
            <section className="card" aria-labelledby="facts-h">
              <div className="card__body">
                <h2 id="facts-h" style={{ fontSize: 15, marginBottom: 8 }}>
                  Account facts
                </h2>
                <div className="metric-row">
                  <span className="muted">
                    <Users size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
                    Enrolled students
                  </span>
                  <b>{school.students}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Sections</span>
                  <b>{school.sections}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Students onboarded</span>
                  <b>
                    {school.studentsOnboarded} / {school.students}
                  </b>
                </div>
                <div className="metric-row">
                  <span className="muted">Teachers invited</span>
                  <b>{school.teachersInvited}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Teachers activated</span>
                  <b>{school.teachersActivated}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Assessments analysed</span>
                  <b>{school.assessmentsAnalysed}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">
                    <CalendarClock size={12} style={{ verticalAlign: "-1px", marginRight: 6 }} />
                    Kick-off
                  </span>
                  <b>{formatDate(school.onboardingStart)}</b>
                </div>
                {school.blocker && (
                  <div className="evidence" style={{ marginTop: 12, background: "var(--risk-soft)", borderColor: "#eec3bb", color: "#8f3226" }}>
                    <AlertTriangle size={15} />
                    <span>
                      <span className="evidence__title">Blocker · {school.daysInStage} days in {school.stage}</span>
                      {school.blocker}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.18}>
            <section className="card" aria-labelledby="feed-h">
              <div className="card__body">
                <h2 id="feed-h" style={{ fontSize: 15 }}>
                  Recent activity
                </h2>
                <p className="small muted" style={{ marginTop: 2, marginBottom: 14 }}>
                  Account events, newest first.
                </p>
                {feed.length === 0 ? (
                  <OpsEmpty>Nothing has happened on this account yet.</OpsEmpty>
                ) : (
                  <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
                    {feed.map((e, i) => (
                      <li
                        key={e.id}
                        className="reveal"
                        style={{ "--d": `${120 + i * 50}ms`, display: "flex", gap: 10, padding: "9px 0", borderBottom: i === feed.length - 1 ? "none" : "1px dashed var(--line)" } as React.CSSProperties}
                      >
                        <span className="healthdot" style={{ "--accent": eventAccent(e.kind), marginTop: 6 } as React.CSSProperties} />
                        <span style={{ minWidth: 0 }}>
                          <span className="small" style={{ display: "block", color: "var(--brand-ink-soft)" }}>
                            {e.text}
                          </span>
                          <span className="small muted" style={{ display: "block", marginTop: 2 }}>
                            {formatDate(e.date)} · {e.actor}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      <Toast message={message} />
    </>
  );
}

/** One step of the vertical onboarding timeline. */
function TimelineStep({ step, index, last }: { step: ChecklistStep; index: number; last: boolean }) {
  const accent = checklistAccent(step.state);
  const done = step.state === "done";
  return (
    <li
      className="reveal"
      style={{ "--d": `${80 + index * 55}ms`, display: "grid", gridTemplateColumns: "26px 1fr", gap: 12, position: "relative" } as React.CSSProperties}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
            fontSize: 11,
            fontWeight: 700,
            color: done || step.state !== "todo" ? "#fff" : "var(--muted)",
            background:
              step.state === "todo"
                ? "var(--surface-2)"
                : `linear-gradient(180deg, color-mix(in srgb, ${accent} 78%, #fff), ${accent})`,
            border: step.state === "todo" ? "1px solid var(--line-strong)" : "1px solid transparent",
            boxShadow: step.state === "todo" ? "none" : `0 6px 14px -8px ${accent}, inset 0 1px 0 rgba(255,255,255,.3)`,
          }}
        >
          {done ? <Check size={13} /> : step.state === "blocked" ? <AlertTriangle size={12} /> : index + 1}
        </span>
        {!last && (
          <span
            style={{
              flex: 1,
              width: 2,
              minHeight: 22,
              margin: "4px 0",
              borderRadius: 2,
              background: done ? "color-mix(in srgb, var(--brand-green) 45%, #fff)" : "var(--line)",
            }}
          />
        )}
      </div>

      <div style={{ paddingBottom: last ? 0 : 14, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 650, fontSize: 13.5, color: step.state === "todo" ? "var(--muted)" : "var(--text)" }}>{step.label}</span>
          {step.state === "active" && (
            <span className="tag tag--info">
              <span className="pulse-dot" style={{ "--accent": "var(--brand-blue)" } as React.CSSProperties} /> In progress
            </span>
          )}
          {step.state === "blocked" && <span className="tag tag--risk">Blocked</span>}
          {step.date && <span className="small muted">{formatDate(step.date)}</span>}
        </div>
        <div className="small muted" style={{ marginTop: 2 }}>
          {step.detail}
        </div>
      </div>
    </li>
  );
}
