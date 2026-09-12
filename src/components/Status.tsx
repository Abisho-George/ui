import { Flame } from "lucide-react";
import type { BoardUrgency, Confidence } from "@/lib/avai-mock-data";

/**
 * The three status dimensions of BoardX (spec §5.4). They are kept as three
 * separate components with three separate visual grammars so they can never
 * be read as one colour scale:
 *   Attention  → solid pill (green / gold / red)
 *   Urgency    → outlined chip with a flame glyph, warm ramp
 *   Confidence → 3-dot meter, cool blue ramp
 */

export function AttentionPill({ level }: { level: string }) {
  const key = level.toLowerCase().replace(/\s+/g, "");
  return <span className={`attn attn--${key}`}>{level}</span>;
}

const urgencyLabel: Record<BoardUrgency, string> = {
  VERY_HIGH: "Very high",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

/**
 * Board urgency. Spec §12 requires the recurrence to travel with the level —
 * a topic appearing 4/4 Board years must never read like one appearing 1/4 —
 * so `withYears` appends it wherever the chip stands alone in a table.
 */
export function UrgencyChip({ level, withLabel = true, withYears }: { level: BoardUrgency; withLabel?: boolean; withYears?: string }) {
  const years = withYears ? withYears.replace(/recent Board years?/i, "yrs").replace(/years?/i, "yrs") : null;
  return (
    <span className={`urg urg--${level.toLowerCase()}`} title="Board urgency — how often this competency recurs in recent Board papers">
      <Flame />
      {withLabel ? `Board urgency: ${urgencyLabel[level]}` : urgencyLabel[level]}
      {years && <span className="urg__years">· {years}</span>}
    </span>
  );
}

const confidenceLabel: Record<Confidence, string> = { HIGH: "High confidence", MEDIUM: "Medium confidence", EMERGING: "Emerging signal" };

export function ConfidenceMeter({ level, short = false }: { level: Confidence; short?: boolean }) {
  return (
    <span className={`conf conf--${level.toLowerCase()}`} title="High confidence: supported by sufficient student responses and a consistent performance pattern in this assessment. Confidence is about the evidence, not about how urgent the finding is.">
      <span className="conf__dots" aria-hidden="true">
        <span className="conf__dot" />
        <span className="conf__dot" />
        <span className="conf__dot" />
      </span>
      {short ? level.charAt(0) + level.slice(1).toLowerCase() : confidenceLabel[level]}
    </span>
  );
}
