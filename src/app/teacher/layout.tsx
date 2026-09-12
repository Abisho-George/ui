"use client";

import { BookOpen, Home, Users } from "lucide-react";
import { RoleGuard, StaffShell, type NavItem } from "@/components/Shell";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="teacher">
      {(user) => {
        const nav: NavItem[] = [{ href: "/teacher/home", label: "My Home", icon: Home }];
        if (user.role === "teacher") {
          for (const a of user.assignments) {
            if (a.type === "class") nav.push({ href: `/teacher/class/${a.section}`, label: `Class ${a.section}`, icon: Users, group: "My classes" });
          }
          for (const a of user.assignments) {
            if (a.type === "subject")
              for (const s of a.sections) nav.push({ href: `/teacher/subject/${encodeURIComponent(a.subject)}/${s}`, label: `${a.subject} · ${s}`, icon: BookOpen, group: "My subjects" });
          }
        }
        return (
          <StaffShell user={user} nav={nav} roleLabel="Teacher">
            {children}
          </StaffShell>
        );
      }}
    </RoleGuard>
  );
}
