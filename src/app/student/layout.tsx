"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { RoleGuard } from "@/components/Shell";
import { Logomark } from "@/components/Mascot";
import { initials, useAuth } from "@/lib/auth";

/** §7 Student shell — warm, simple, mascot-friendly. */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  return (
    <RoleGuard role="student">
      {(user) => (
        <div className="student-shell">
          <header className="student-top">
            <Link href="/student/home" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logomark />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 20, letterSpacing: ".08em" }}>AVAI</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="avatar">{initials(user.name)}</span>
              <div className="small">
                <div style={{ fontWeight: 600 }}>{user.name}</div>
                {user.role === "student" && (
                  <div className="muted">
                    {user.section} · Roll {user.rollNo}
                  </div>
                )}
              </div>
              <button
                className="btn btn--sm btn--ghost"
                onClick={() => {
                  signOut();
                  router.push("/login");
                }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </header>
          <main className="student-main">{children}</main>
        </div>
      )}
    </RoleGuard>
  );
}
