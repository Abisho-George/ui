"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { BoardXReportView } from "@/components/BoardXReportView";
import { getStudentReport } from "@/lib/avai-mock-data";
import { useAuth } from "@/lib/auth";

/** §7.3 Student report — the one-page BoardX hand-off. */
export default function StudentReport() {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const r = getStudentReport(reportId);

  if (!r) {
    return (
      <div className="card empty-hero">
        <Mascot pose="neutral" size={90} />
        <h3 style={{ marginTop: 12 }}>We couldn&apos;t find that report</h3>
        <p>
          <Link href="/student/home" className="btn--link">
            Back to My Reports
          </Link>
        </p>
      </div>
    );
  }

  const studentName = user?.role === "student" ? user.name : "You";
  const section = user?.role === "student" ? user.section : "";

  return (
    <>
      <Link href="/student/home" className="btn btn--ghost btn--sm" style={{ marginBottom: 14 }}>
        <ArrowLeft size={13} /> My Reports
      </Link>
      <BoardXReportView report={r} studentName={studentName} section={section} />
    </>
  );
}
