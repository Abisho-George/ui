"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Mascot } from "@/components/Mascot";

/** Catches a crash anywhere in the Student section. Uses the mascot
 * (student screens are one of its sanctioned placements) rather than the
 * plain staff error card, so a crash still feels like part of this app
 * rather than a generic browser error. The student-top header comes from
 * student/layout.tsx, one level up, so Sign out stays reachable. */
export default function StudentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card empty-hero">
      <Mascot pose="neutral" size={90} />
      <h3 style={{ marginTop: 12 }}>Something went wrong</h3>
      <p>This page hit an error. Try again, or head back to My Reports.</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
        <button className="btn btn--primary" onClick={reset}>
          <RotateCcw size={14} /> Try again
        </button>
        <a className="btn" href="/student/home">
          My Reports
        </a>
      </div>
    </div>
  );
}
