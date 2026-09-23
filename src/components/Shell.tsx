"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { ArrowLeft, LogOut, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { homeFor, initials, useAuth, type CurrentUser } from "@/lib/auth";
import { academicYear, school, type Role } from "@/lib/avai-mock-data";
import { PAGE_HEADER_ACTIONS_ID, PageHeaderProvider, useCurrentPageHeader } from "@/lib/pageHeader";
import { Logomark, Mascot } from "./Mascot";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group?: string;
  match?: (path: string) => boolean;
}

/** Gate a shell to one role. Redirects to /login (or the right home) otherwise. */
export function RoleGuard({ role, children }: { role: Role; children: (user: CurrentUser) => React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const examsOnly = user?.role === "teacher" && user.examsOnly;
  const offLimits = examsOnly && !pathname.startsWith("/teacher/papers");

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user));
    else if (offLimits) router.replace("/teacher/papers");
  }, [ready, user, role, router, offLimits]);

  if (!ready || !user || user.role !== role || offLimits) return <LoadingScreen />;
  return <>{children(user)}</>;
}

/** Loading state, one of the sanctioned mascot placements (§0). */
export function LoadingScreen({ label = "Loading AVAI…" }: { label?: string }) {
  return (
    <div className="loading">
      <Mascot pose="thinking" size={112} float />
      <motion.div
        className="small"
        style={{ fontWeight: 600, letterSpacing: ".01em" }}
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        {label}
      </motion.div>
      <div className="shimmer" style={{ width: 140, height: 4, minHeight: 0, borderRadius: 999 }} />
    </div>
  );
}

/** The sticky "which page am I on" bar: current page title + a back
 * button, pinned to the top of the content area through any scroll. Fed
 * by whichever page is mounted, via usePageHeader(). Skipped on the
 * single-screen test sheet, which has its own compact header built in. */
function PageHeaderBar() {
  const header = useCurrentPageHeader();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Published as a CSS var so any sticky element further down the page
  // (.roster-sticky, a standalone .filterbar) can sit right below this bar
  // instead of guessing its height or sticking underneath it at the same
  // top:0. Reset to 0 when there's no header so nothing sticks to a gap.
  // header is a fresh object whenever title/subtitle/backHref change, so a
  // subtitle appearing (which makes the bar taller) re-measures too.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--page-header-h", header && ref.current ? `${ref.current.offsetHeight}px` : "0px");
    return () => document.documentElement.style.setProperty("--page-header-h", "0px");
  }, [header, header?.subtitle]);

  if (!header) return null;
  return (
    <div className="page-header-bar" ref={ref}>
      {header.backHref && (
        <button className="btn btn--ghost btn--sm" onClick={() => router.push(header.backHref!)}>
          <ArrowLeft size={13} /> Back
        </button>
      )}
      <div className="page-header-bar__text">
        <h1 className="page-header-bar__title">{header.title}</h1>
        {header.subtitle && <div className="page-header-bar__sub">{header.subtitle}</div>}
      </div>
      {/* Filled by <HeaderActions> via a portal, see src/lib/pageHeader.tsx. */}
      <div className="page-header-bar__actions" id={PAGE_HEADER_ACTIONS_ID} />
    </div>
  );
}

/** Staff shell (Principal + Teacher). Deliberately mascot-free. */
export function StaffShell({
  user,
  nav,
  roleLabel,
  children,
  sidebarMeta,
}: {
  user: CurrentUser;
  nav: NavItem[];
  roleLabel: string;
  children: React.ReactNode;
  /** Extra content (e.g. an evidence badge) shown under the school/academic
   * year line at the top of the sidebar. */
  sidebarMeta?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  let lastGroup: string | undefined;
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Logomark />
          <div>
            <div className="sidebar__brand-name">AVAI</div>
            <div className="sidebar__brand-sub">{roleLabel}</div>
          </div>
        </div>
        <div className="sidebar__meta">
          <div className="sidebar__meta-school">{school.name}</div>
          <div className="sidebar__meta-sub">
            {school.board} · {school.state} · Academic year {academicYear}
          </div>
          {sidebarMeta}
        </div>
        <nav className="sidebar__nav" aria-label="Primary">
          {nav.map((item) => {
            const groupHeader = item.group && item.group !== lastGroup ? <div className="sidebar__group" key={`g-${item.group}`}>{item.group}</div> : null;
            lastGroup = item.group ?? lastGroup;
            const active = item.match ? item.match(pathname) : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <div key={item.href} style={{ display: "contents" }}>
                {groupHeader}
                <Link href={item.href} className={`navlink ${active ? "navlink--active" : ""}`} aria-current={active ? "page" : undefined}>
                  <Icon size={16} /> {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <span className="avatar">{initials(user.name)}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: "#a9b6bf", fontSize: 11.5 }}>{roleLabel}</div>
            </div>
          </div>
          <button
            className="sidebar__signout"
            onClick={() => {
              signOut();
              router.push("/login");
            }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <PageHeaderProvider>
          <PageHeaderBar />
          <main className="content">{children}</main>
        </PageHeaderProvider>
      </div>
    </div>
  );
}
