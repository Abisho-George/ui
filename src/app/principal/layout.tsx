"use client";

import { BarChart3, ClipboardList, FileText, School, Settings, Users } from "lucide-react";
import { RoleGuard, StaffShell, type NavItem } from "@/components/Shell";

/* §5.1 — BoardX is the default landing page and the sidebar reads
   BoardX · Papers · Enter Marks · Manage Teachers · Settings. The old flat
   /admin counts dashboard is no longer a peer item; it lives in Settings as
   an Operations summary. */
const nav: NavItem[] = [
  {
    href: "/principal",
    label: "School",
    icon: School,
    // Only the landing page and the class pages beneath it, not every /principal/* route.
    match: (path) => path === "/principal" || path.startsWith("/principal/class"),
  },
  { href: "/principal/boardx", label: "BoardX", icon: BarChart3 },
  { href: "/principal/papers", label: "Papers", icon: FileText },
  { href: "/principal/enter-marks", label: "Enter Marks", icon: ClipboardList },
  { href: "/principal/teachers", label: "Manage Teachers", icon: Users },
  { href: "/principal/settings", label: "Settings", icon: Settings },
];

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="principal">
      {(user) => (
        <StaffShell
          user={user}
          nav={nav}
          roleLabel="Principal"
          topbarRight={<span>Academic year 2026–27</span>}
        >
          {children}
        </StaffShell>
      )}
    </RoleGuard>
  );
}
