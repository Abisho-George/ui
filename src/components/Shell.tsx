"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { homeFor, initials, useAuth, type CurrentUser } from "@/lib/auth";
import { school, type Role } from "@/lib/avai-mock-data";
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

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(homeFor(user.role));
  }, [ready, user, role, router]);

  if (!ready || !user || user.role !== role) return <LoadingScreen />;
  return <>{children(user)}</>;
}

/** Loading state — one of the sanctioned mascot placements (§0). */
export function LoadingScreen({ label = "Loading AVAI…" }: { label?: string }) {
  return (
    <div className="loading">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
        <Mascot pose="thinking" size={96} />
      </motion.div>
      <div className="small">{label}</div>
    </div>
  );
}

/** Staff shell (Principal + Teacher). Deliberately mascot-free. */
export function StaffShell({
  user,
  nav,
  roleLabel,
  children,
  topbarRight,
}: {
  user: CurrentUser;
  nav: NavItem[];
  roleLabel: string;
  children: React.ReactNode;
  topbarRight?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  // The single-test page is a dense, one-screen "sheet" — its own compact
  // header replaces the school topbar so the whole thing fits without
  // scrolling the page itself.
  const hideTopbar = /^\/principal\/classes\/[^/]+\/tests\/[^/]+\/?$/.test(pathname);

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
        {!hideTopbar && (
          <header className="topbar">
            <div className="topbar__school">
              <strong>{school.name}</strong> · {school.board} · {school.state}
            </div>
            <div className="topbar__right">{topbarRight ?? <span>Academic year 2026–27</span>}</div>
          </header>
        )}
        <main className={`content ${hideTopbar ? "content--sheet" : ""}`}>{children}</main>
      </div>
    </div>
  );
}
