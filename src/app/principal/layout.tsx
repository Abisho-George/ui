"use client";

import { CalendarClock, HelpCircle, LayoutGrid } from "lucide-react";
import { RoleGuard, StaffShell, type NavItem } from "@/components/Shell";
import { assessmentContext } from "@/lib/avai-mock-data";

const nav: NavItem[] = [
  { href: "/principal/classes", label: "Class X", icon: LayoutGrid },
  { href: "/principal/exams", label: "Exams", icon: CalendarClock },
  { href: "/principal/help", label: "Help & Contact", icon: HelpCircle },
];

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="principal">
      {(user) => (
        <StaffShell
          user={user}
          nav={nav}
          roleLabel="Principal"
          sidebarMeta={<span className="sidebar__evidence">Evidence: {assessmentContext.assessmentEvidence}</span>}
        >
          {children}
        </StaffShell>
      )}
    </RoleGuard>
  );
}
