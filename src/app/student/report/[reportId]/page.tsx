"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Download, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Mascot, type MascotPose } from "@/components/Mascot";
import { studentReportDetail } from "@/lib/avai-mock-data";

/**
 * §7.3 pose rule: "Improve" when this attempt is stronger than the last one on
 * file, "Achieve" only for a standout result, and a neutral treatment
 * otherwise — the mascot must never force upbeat framing onto a weak result.
 */
function poseFor(trend: string, score: string): MascotPose {
  const [got, of] = score.split("/").map((n) => Number(n.trim()));
  const standout = of > 0 && got / of >= 0.95;
  if (trend === "up") return standout ? "achieve" : "improve";
  return "neutral";
}

/** §7.3 Student report — plain-language exam feedback; mascot pose driven by `trend`. */
export default function StudentReport() {
  const { reportId } = useParams<{ reportId: string }>();
  const r = studentReportDetail[reportId];

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

  const pose = poseFor(r.trend, r.score);

  return (
    <>
      <Link href="/student/home" className="btn btn--ghost btn--sm" style={{ marginBottom: 14 }}>
        <ArrowLeft size={13} /> My Reports
      </Link>
      <motion.div className="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="feedback__hero">
          <Mascot pose={pose} size={120} />
          <div>
            <div className="eyebrow">
              {r.subject} · {r.term}
            </div>
            <div className="feedback__score">
              {r.score}
              {r.trend === "up" && <TrendingUp size={22} className="feedback__trend feedback__trend--up" aria-label="Better than last time" />}
              {r.trend === "down" && <TrendingDown size={22} className="feedback__trend feedback__trend--down" aria-label="Lower than last time" />}
              {r.trend === "flat" && <ArrowRight size={22} className="feedback__trend feedback__trend--flat" aria-label="About the same as last time" />}
            </div>
            <p style={{ marginTop: 6, fontSize: 15 }}>{r.encouragingLine}</p>
          </div>
        </div>
        <div className="feedback__body">
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>What you&apos;re doing well</h3>
            <ul className="feedback__list feedback__list--well">
              {r.doingWell.map((d: string) => (
                <li key={d}>
                  <Check size={16} style={{ color: "var(--brand-green)", flex: "0 0 auto", marginTop: 2 }} /> {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>What to work on next</h3>
            <ul className="feedback__list feedback__list--next">
              {r.workOnNext.map((d: string) => (
                <li key={d}>
                  <Sparkles size={16} style={{ color: "var(--brand-gold)", flex: "0 0 auto", marginTop: 2 }} /> {d}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <button className="btn">
              <Download size={13} /> Download PDF
            </button>
            <span className="small muted">Shared by your teacher. Ask them if you want to go through any of this together.</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
