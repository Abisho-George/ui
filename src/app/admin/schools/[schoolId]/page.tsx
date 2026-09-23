"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, BellRing, Building2, Check, KeyRound, Mail, Phone, UserPlus, type LucideIcon } from "lucide-react";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import {
  checklistAccent,
  checklistLength,
  daysUntil,
  formatAgo,
  formatDate,
  formatINR,
  onboardingPct,
  schoolById,
  statusAccent,
  teacherRosterFor,
} from "@/lib/avai-admin-data";
import { accessKeyFor, issueKey, keyIdFor, markReminded, useAdminState } from "@/lib/adminState";
import { OpsEmpty, StatusPill, Toast, useToast } from "../../ui";

/** One school's account: who to contact, where onboarding stands, and the
 * teacher roster with key generation — the three things an ops person
 * actually needs here. No usage charts or activity feed; those added
 * depth without adding a decision. */
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
  const renewalIn = daysUntil(school.renewalDate);

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
    { label: "Onboarding", value: onboardingPct(school), sub: `${school.progress} of ${checklistLength} steps done`, accent: statusAccent(school.status), icon: Building2, suffix: "%" },
  ];

  return (
    <>
      <Link href="/admin/schools" className="btn btn--ghost btn--sm" style={{ marginBottom: 12 }}>
        <ArrowLeft size={13} /> All accounts
      </Link>

      <Reveal>
        <header className="surface surface--raised" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ minWidth: 260, flex: "1 1 340px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 22, letterSpacing: "-.01em" }}>{school.name}</h1>
                <StatusPill status={school.status} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <span className="tag mono">{school.code}</span>
                <span className="tag">{school.board}</span>
                <span className="tag">
                  {school.city}, {school.state}
                </span>
                <span className="tag tag--info">{school.plan}</span>
              </div>
            </div>

            <div style={{ flex: "0 1 280px", borderLeft: "1px solid var(--line)", paddingLeft: 18, display: "grid", gap: 2 }}>
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
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button type="button" className="btn btn--blue btn--sm" onClick={generateNextKey}>
              <KeyRound size={13} /> Generate access key
            </button>
            <button type="button" className="btn btn--sm" onClick={sendReminder}>
              <BellRing size={13} /> Send reminder
            </button>
            <span className="small muted" style={{ alignSelf: "center" }}>
              Last activity {formatAgo(school.lastActivity)}
            </span>
          </div>
        </header>
      </Reveal>

      <Stagger className="grid grid--3" gap={0.05} style={{ marginTop: 16 }}>
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

      {school.blocker && (
        <Reveal delay={0.1}>
          <div className="evidence" style={{ marginTop: 16, background: "var(--risk-soft)", borderColor: "#eec3bb", color: "#8f3226" }}>
            <AlertTriangle size={15} />
            <span>
              <span className="evidence__title">
                Blocker · {school.daysInStage} days in {school.stage}
              </span>
              {school.blocker}
            </span>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.14}>
        <section className="card" style={{ marginTop: 16 }} aria-labelledby="checklist-h">
          <div className="card__body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 id="checklist-h" style={{ fontSize: 15 }}>
                Onboarding checklist
              </h2>
              <span className="pillnum" style={{ "--accent": statusAccent(school.status) } as React.CSSProperties}>
                {school.progress} / {checklistLength}
              </span>
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
              {school.checklist.map((step) => {
                const accent = checklistAccent(step.state);
                const done = step.state === "done";
                return (
                  <div
                    key={step.key}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px dashed var(--line)" }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        flex: "0 0 auto",
                        color: step.state === "todo" ? "var(--muted)" : "#fff",
                        background: step.state === "todo" ? "var(--surface-2)" : accent,
                        border: step.state === "todo" ? "1px solid var(--line-strong)" : "none",
                      }}
                    >
                      {done ? <Check size={12} /> : step.state === "blocked" ? <AlertTriangle size={11} /> : null}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: done ? 500 : 650, color: step.state === "todo" ? "var(--muted)" : "var(--text)" }}>
                      {step.label}
                    </span>
                    {step.state === "active" && <span className="tag tag--info">In progress</span>}
                    {step.state === "blocked" && <span className="tag tag--risk">Blocked</span>}
                    {step.date && <span className="small muted">{formatDate(step.date)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.18}>
        <section className="card" style={{ marginTop: 16 }} aria-labelledby="roster-h">
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
                          <span className={`tag ${t.invite === "Accepted" ? "tag--green" : t.invite === "Sent" ? "tag--gold" : ""}`}>{t.invite}</span>
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
                              <button type="button" className="btn btn--ghost btn--sm" onClick={() => show(`Access key re-sent to ${t.name}.`)}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Reveal>

      <Toast message={message} />
    </>
  );
}
