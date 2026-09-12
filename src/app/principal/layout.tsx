"use client";

import { BarChart3, ClipboardList, FileText, Settings, Users } from "lucide-react";
import { RoleGuard, StaffShell, type NavItem } from "@/components/Shell";
import { assessmentContext } from "@/lib/avai-mock-data";

const nav: NavItem[] = [
  { href: "/principal/boardx", label: "BoardX Intelligence", icon: BarChart3, group: "Intelligence" },
  { href: "/principal/teachers", label: "Manage Teachers", icon: Users, group: "School" },
  { href: "/principal/papers", label: "Question Papers", icon: FileText },
  { href: "/principal/enter-marks", label: "Enter Marks", icon: ClipboardList },
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
          topbarRight={
            <>
              <span className="tag tag--teal">Evidence: {assessmentContext.assessmentEvidence}</span>
              <span>Academic year 2026–27</span>
            </>
          }
        >
          {children}
        </StaffShell>
      )}
    </RoleGuard>
  );
}
