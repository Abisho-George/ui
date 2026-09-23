"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronRight,
  FileCheck2,
  KeyRound,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { AnimatedBar, CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import {
  accountStatuses,
  adminSchools,
  boards,
  formatAgo,
  formatINR,
  needsAttention,
  onboardingPct,
  portfolioKpis,
  statusAccent,
  statusMix,
  accountsNeedingAttention,
  type AdminSchool,
} from "@/lib/avai-admin-data";
import { OpsEmpty, SortHeader, StatusPill, type SortDir } from "../ui";

type SortField = "name" | "students" | "activation" | "progress" | "analysed" | "activity" | "value";

const kpis = [
  {
    label: "Schools live",
    value: portfolioKpis.schoolsLive,
    sub: `of ${portfolioKpis.schoolsTotal} accounts on the books`,
    accent: "var(--brand-green)",
    icon: Building2,
  },
  {
    label: "Students under analysis",
    value: portfolioKpis.studentsUnderAnalysis,
    sub: "in schools with at least one analysed paper",
    accent: "var(--brand-teal)",
    icon: Users,
  },
  {
    label: "Teachers activated",
    value: portfolioKpis.teachersActivated,
    sub: `of ${portfolioKpis.teachersInvited} invited by AVAI`,
    accent: "var(--brand-gold)",
    icon: KeyRound,
  },
  {
    label: "Assessments analysed",
    value: portfolioKpis.assessmentsThisTerm,
    sub: "this term, across the portfolio",
    accent: "var(--brand-blue)",
    icon: FileCheck2,
  },
  {
    label: "Onboarded this week",
    value: portfolioKpis.onboardedThisWeek,
    sub: "students who finished the onboarding test",
    accent: "var(--brand-orange)",
    icon: UserPlus,
  },
  {
    label: "Needs attention",
    value: accountsNeedingAttention,
    sub: `${needsAttention.length} open flags`,
    accent: "var(--risk)",
    icon: AlertTriangle,
  },
];

function sortValue(s: AdminSchool, field: SortField): number | string {
  switch (field) {
    case "students":
      return s.students;
    case "activation":
      return s.teachersInvited ? s.teachersActivated / s.teachersInvited : -1;
    case "progress":
      return s.progress;
    case "analysed":
      return s.assessmentsAnalysed;
    case "activity":
      return Date.parse(s.lastActivity);
    case "value":
      return s.contractValue;
    default:
      return s.name;
  }
}

export default function AdminSchoolsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [board, setBoard] = useState("All");
  const [sort, setSort] = useState<SortField>("activity");
  const [dir, setDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = adminSchools.filter((s) => {
      if (status !== "All" && s.status !== status) return false;
      if (board !== "All" && s.board !== board) return false;
      if (!q) return true;
      return [s.name, s.code, s.state, s.city].some((f) => f.toLowerCase().includes(q));
    });
    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sort);
      const bv = sortValue(b, sort);
      const cmp = typeof av === "string" && typeof bv === "string" ? av.localeCompare(bv) : Number(av) - Number(bv);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [query, status, board, sort, dir]);

  function onSort(field: SortField) {
    if (field === sort) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(field);
      setDir(field === "name" ? "asc" : "desc");
    }
  }

  return (
    <>
      <Reveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="page-title">Book of business</h1>
            <p className="page-sub">
              Every school AVAI has signed, where it sits in onboarding, and what it is actually using. Open an account for
              its checklist, teacher keys and usage.
            </p>
          </div>
          <span className="tag tag--info" style={{ whiteSpace: "nowrap" }}>
            {formatINR(portfolioKpis.contractedValue)} contracted
          </span>
        </div>
      </Reveal>

      <Stagger
        className="grid"
        gap={0.05}
        style={{ marginTop: 20, gridTemplateColumns: "repeat(auto-fit, minmax(212px, 1fr))" }}
      >
        {kpis.map((k, i) => {
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
                    <CountUp value={k.value} delay={0.1 + i * 0.05} />
                  </div>
                  <div className="kpi__sub">{k.sub}</div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="grid" style={{ marginTop: 18, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr)", alignItems: "start" }}>
        <Reveal delay={0.1}>
          <section className="card" aria-labelledby="mix-h">
            <div className="card__body">
              <h2 id="mix-h" style={{ fontSize: 15 }}>
                Portfolio mix
              </h2>
              <p className="small muted" style={{ marginTop: 2 }}>
                {portfolioKpis.schoolsTotal} accounts by lifecycle stage.
              </p>

              <div className="segbar" style={{ marginTop: 14 }}>
                {statusMix.map((m) => (
                  <div
                    key={m.status}
                    className="segbar__seg"
                    style={{ flex: `${m.count} 1 0`, "--seg": statusAccent(m.status) } as React.CSSProperties}
                  >
                    {m.count}
                  </div>
                ))}
              </div>
              <div className="segbar__legend">
                {statusMix.map((m) => (
                  <div
                    key={m.status}
                    className="segbar__legend-item"
                    style={{ flex: `${m.count} 1 0`, "--seg": statusAccent(m.status) } as React.CSSProperties}
                  >
                    {m.status} <b>{m.count}</b>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="metric-row">
                  <span className="muted">Contracted value</span>
                  <b>{formatINR(portfolioKpis.contractedValue)}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Students on the platform</span>
                  <b>{portfolioKpis.studentsOnPlatform}</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Teacher activation</span>
                  <b>{Math.round((portfolioKpis.teachersActivated / portfolioKpis.teachersInvited) * 100)}%</b>
                </div>
                <div className="metric-row">
                  <span className="muted">Accounts in onboarding</span>
                  <b>{portfolioKpis.onboardingCount}</b>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.16}>
          <section className="card" aria-labelledby="attn-h">
            <div className="card__body">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <h2 id="attn-h" style={{ fontSize: 15 }}>
                  Needs attention today
                </h2>
                <span className="pillnum" style={{ "--accent": "var(--risk)" } as React.CSSProperties}>
                  {needsAttention.length}
                </span>
              </div>
              <p className="small muted" style={{ marginTop: 2, marginBottom: 12 }}>
                Stalled onboardings, quiet accounts and renewals inside 60 days.
              </p>

              {needsAttention.length === 0 ? (
                <OpsEmpty>Nothing flagged. Every account moved in the last fortnight.</OpsEmpty>
              ) : (
                <div style={{ display: "grid", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                  {needsAttention.map((item, i) => {
                    const accent = item.severity === "high" ? "var(--risk)" : "var(--brand-gold)";
                    return (
                      <Link
                        key={item.id}
                        href={`/admin/schools/${item.schoolId}`}
                        className="reveal hoverlift"
                        style={
                          {
                            "--d": `${i * 45}ms`,
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--line)",
                            background: `linear-gradient(180deg, #fff, color-mix(in srgb, ${accent} 5%, #fff))`,
                            color: "inherit",
                          } as React.CSSProperties
                        }
                      >
                        <span className="healthdot" style={{ "--accent": accent, marginTop: 5 } as React.CSSProperties} />
                        <span style={{ minWidth: 0, flex: 1 }}>
                          <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                            <b style={{ fontSize: 13.5, fontWeight: 650 }}>{item.schoolName}</b>
                            <span className="small muted">{item.code}</span>
                          </span>
                          <span className="small" style={{ display: "block", color: "var(--brand-ink-soft)", marginTop: 2 }}>
                            {item.reason}
                          </span>
                          <span style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                            <span className="tag" style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 35%, transparent)` }}>
                              {item.metric}
                            </span>
                            <span className="tag">{item.owner}</span>
                          </span>
                        </span>
                        <ChevronRight size={15} className="muted" style={{ marginTop: 3 }} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </Reveal>
      </div>

      <section className="section" aria-labelledby="table-h">
        <div className="section__head">
          <div>
            <h2 id="table-h" className="section-q" style={{ fontSize: 17 }}>
              All accounts
            </h2>
            <p className="section__lead">
              {rows.length} of {adminSchools.length} shown. Sort by any column; click a row to open the account.
            </p>
          </div>
        </div>

        <div className="filterbar" style={{ position: "static", background: "transparent", backdropFilter: "none" }}>
          <div className="filter" style={{ flex: "1 1 260px", maxWidth: 360 }}>
            <label htmlFor="school-search">Search</label>
            <span style={{ position: "relative", display: "block" }}>
              <Search size={14} className="muted" style={{ position: "absolute", left: 10, top: 9 }} />
              <input
                id="school-search"
                className="input"
                style={{ paddingLeft: 32 }}
                placeholder="Name, code or state"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </span>
          </div>

          <div className="filter">
            <label htmlFor="status-filter">Status</label>
            <select id="status-filter" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              {accountStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label htmlFor="board-filter">Board</label>
            <select id="board-filter" className="select" value={board} onChange={(e) => setBoard(e.target.value)}>
              <option>All</option>
              {boards.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filterbar__spacer" />

          {(query || status !== "All" || board !== "All") && (
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => {
                setQuery("");
                setStatus("All");
                setBoard("All");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="card" style={{ marginTop: 12, overflow: "hidden" }}>
          {rows.length === 0 ? (
            <div className="card__body">
              <OpsEmpty>No account matches those filters. Try clearing the board or status filter.</OpsEmpty>
            </div>
          ) : (
            <div className="table-wrap table-wrap--scroll" style={{ maxHeight: 620 }}>
              <table className="table table--hover">
                <thead>
                  <tr>
                    <SortHeader label="School" field="name" sort={sort} dir={dir} onSort={onSort} />
                    <th scope="col">Board</th>
                    <th scope="col">Location</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Status</th>
                    <SortHeader label="Students" field="students" sort={sort} dir={dir} onSort={onSort} align="right" />
                    <SortHeader label="Teachers" field="activation" sort={sort} dir={dir} onSort={onSort} align="right" />
                    <SortHeader label="Onboarding" field="progress" sort={sort} dir={dir} onSort={onSort} />
                    <SortHeader label="Analysed" field="analysed" sort={sort} dir={dir} onSort={onSort} align="right" />
                    <SortHeader label="Last activity" field="activity" sort={sort} dir={dir} onSort={onSort} />
                    <th scope="col" aria-label="Open account" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const pct = onboardingPct(s);
                    return (
                      <tr key={s.id} onClick={() => router.push(`/admin/schools/${s.id}`)}>
                        <td style={{ minWidth: 220 }}>
                          <Link href={`/admin/schools/${s.id}`} style={{ color: "inherit", fontWeight: 650 }} onClick={(e) => e.stopPropagation()}>
                            {s.name}
                          </Link>
                          <div className="small muted mono">{s.code}</div>
                        </td>
                        <td>
                          <span className="tag">{s.board}</span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {s.city}
                          <div className="small muted">{s.state}</div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {s.plan}
                          <div className="small muted mono">{formatINR(s.contractValue)}</div>
                        </td>
                        <td>
                          <StatusPill status={s.status} size="sm" />
                        </td>
                        <td className="num">{s.students}</td>
                        <td className="num mono" style={{ whiteSpace: "nowrap" }}>
                          {s.teachersActivated} / {s.teachersInvited}
                        </td>
                        <td style={{ minWidth: 150 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, minWidth: 70 }}>
                              <AnimatedBar
                                value={pct}
                                accent={statusAccent(s.status)}
                                height={6}
                                label={`${s.name} onboarding ${pct} percent complete`}
                              />
                            </div>
                            <span className="small mono muted" style={{ width: 34, textAlign: "right" }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="num">{s.assessmentsAnalysed}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{formatAgo(s.lastActivity)}</td>
                        <td style={{ width: 34 }}>
                          <ChevronRight size={15} className="muted" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
