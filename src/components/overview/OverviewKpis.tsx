"use client";

import { AlertCircle, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { CountUp, Stagger, StaggerItem } from "@/components/motion";
import { percentShares, type AttentionBreakdown } from "@/lib/avai-mock-data";

/** The four headline tiles on the Class X overview. The three tier tiles
 * are the attention tiers relabelled for a principal — On Track / Watch /
 * Intervention read here as On Track / Need Support / At Risk — and their
 * shares are rounded together so they add to exactly 100%. */
export function OverviewKpis({ breakdown, sectionCount }: { breakdown: AttentionBreakdown; sectionCount: number }) {
  const [onTrackShare, supportShare, riskShare] = percentShares([breakdown.onTrack, breakdown.watch, breakdown.intervention]);

  const tiles = [
    {
      key: "total",
      label: "Total Students",
      value: breakdown.total,
      sub: `Across ${sectionCount} sections`,
      accent: "var(--brand-blue)",
      icon: <Users size={21} />,
    },
    {
      key: "ontrack",
      label: "On Track",
      value: breakdown.onTrack,
      sub: `${onTrackShare}% of students`,
      accent: "var(--brand-green)",
      icon: <TrendingUp size={21} />,
    },
    {
      key: "support",
      label: "Need Support",
      value: breakdown.watch,
      sub: `${supportShare}% of students`,
      accent: "var(--brand-gold)",
      icon: <AlertTriangle size={21} />,
    },
    {
      key: "risk",
      label: "At Risk",
      value: breakdown.intervention,
      sub: `${riskShare}% of students`,
      accent: "var(--risk)",
      icon: <AlertCircle size={21} />,
    },
  ];

  return (
    <Stagger className="grid grid--4" gap={0.07} style={{ marginTop: 20 }}>
      {tiles.map((tile, i) => (
        <StaggerItem key={tile.key}>
          <div className="kpi" style={{ "--accent": tile.accent, height: "100%" } as React.CSSProperties}>
            <span className="kpi__icon">{tile.icon}</span>
            <div className="kpi__text">
              <div className="kpi__label">{tile.label}</div>
              <div className="kpi__value">
                <CountUp value={tile.value} delay={0.12 + i * 0.07} />
              </div>
              <div className="kpi__sub">{tile.sub}</div>
            </div>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
