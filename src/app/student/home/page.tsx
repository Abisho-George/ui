"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Mascot } from "@/components/Mascot";
import { useAuth } from "@/lib/auth";
import { studentMyReports } from "@/lib/avai-mock-data";

/** §7.2 Student home — "My Reports" list with mascot "Hello" pose, plus empty state. */
export default function StudentHome() {
  const { user } = useAuth();
  const reports = studentMyReports;
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

      <h2 className="eyebrow" style={{ marginBottom: 10 }}>
        My Reports
      </h2>
      {reports.length === 0 ? (
        <div className="card empty-hero">
          <Mascot pose="hello" size={90} />
          <h3 style={{ marginTop: 12 }}>Nothing shared with you yet</h3>
          <p>Nothing shared with you yet — your teacher will let you know when a report is ready.</p>
        </div>
      ) : (
        reports.map((r) => (
          <Link href={`/student/report/${r.id}`} key={r.id} className="report-card">
            <div>
              <div className="report-card__subj">{r.subject}</div>
              <div className="small muted">
                {r.term} · shared {r.sharedAgo}
              </div>
            </div>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))
      )}
    </>
  );
}
