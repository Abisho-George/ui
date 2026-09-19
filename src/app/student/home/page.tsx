"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { useAuth } from "@/lib/auth";
import { mockStudentUser, reportsForStudent } from "@/lib/avai-mock-data";

/** §7.2 Student home — "My Reports", grouped by assessment (newest first)
 * so a student reads one paper at a time rather than a flat list of ten. */
export default function StudentHome() {
  const { user } = useAuth();
  const studentId = user?.role === "student" ? user.id : mockStudentUser.id;

  const groups = useMemo(() => {
    const byTest = new Map<string, { assessmentName: string; sharedAgo: string; reports: ReturnType<typeof reportsForStudent> }>();
    for (const r of reportsForStudent(studentId)) {
      const g = byTest.get(r.testKey) ?? { assessmentName: r.assessmentName, sharedAgo: r.sharedAgo, reports: [] };
      g.reports.push(r);
      byTest.set(r.testKey, g);
    }
    return [...byTest.values()];
  }, [studentId]);

  const total = groups.reduce((n, g) => n + g.reports.length, 0);

  return (
    <>
      <motion.div className="student-hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Mascot pose="hello" size={110} />
        <div>
          <h1>Hello{user ? `, ${user.name.split(" ")[0]}` : ""}!</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Here are the reports your teachers have shared with you.
          </p>
        </div>
      </motion.div>

      {total === 0 ? (
        <div className="card empty-hero">
          <Mascot pose="neutral" size={90} className="" />
          <h3 style={{ marginTop: 12 }}>No reports yet</h3>
          <p>When your teacher shares a report, it will show up here.</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.assessmentName} style={{ marginBottom: 22 }}>
            <h2 className="eyebrow" style={{ marginBottom: 10 }}>
              {g.assessmentName} · shared {g.sharedAgo}
            </h2>
            {g.reports.map((r) => (
              <Link href={`/student/report/${r.id}`} key={r.id} className="report-card">
                <div>
                  <div className="report-card__subj">{r.subject}</div>
                  <div className="small muted" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span>{r.score}</span>
                    {r.trend === "up" && (
                      <span className="delta" data-dir="up">
                        <TrendingUp size={12} /> up from last time
                      </span>
                    )}
                    {r.trend === "down" && (
                      <span className="delta" data-dir="down">
                        <TrendingDown size={12} /> down from last time
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="muted" />
              </Link>
            ))}
          </section>
        ))
      )}
    </>
  );
}
