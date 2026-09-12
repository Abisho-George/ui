# AVAI — front-end (UI-only build)

Standalone Next.js (App Router) front-end for AVAI, a school diagnostics
platform. **There is no backend.** Every screen renders from
`src/lib/avai-mock-data.ts`; nothing in the codebase calls a network endpoint.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Sign in

`/login` shows the real login form design (School Staff / Student tabs) and a
clearly labelled **DEV LOGIN** block. Only the DEV LOGIN buttons sign you in:

- Principal — Mrs. Kavitha Rajan → `/principal/boardx`
- Teacher — Mrs. Lakshmi (class X-A, Maths X-A/X-B) → `/teacher/home`
- Teacher — Mr. Ravi (Science X-A/X-C) → `/teacher/home`
- Student — Aditi R. → `/student/home`

The chosen role is kept in `localStorage` so reloads stay signed in.

## Routes

| Role | Route | Spec |
| --- | --- | --- |
| Principal | `/principal/boardx` | §5 BoardX: tabs, sticky filters, 11 sections, finding cards, drawers |
| Principal | `/principal/teachers` | §5.11 Manage Teachers (add / edit / revoke, local state) |
| Principal | `/principal/papers`, `/principal/enter-marks`, `/principal/settings` | placeholders |
| Teacher | `/teacher/home` | §6.1 My Classes / My Subjects |
| Teacher | `/teacher/class/[section]` | §6.2 |
| Teacher | `/teacher/subject/[subject]/[section]` | §6.3 |
| Teacher | `/teacher/student/[studentId]` | §6.4 Issue / Share |
| Student | `/student/home` | §7.2 |
| Student | `/student/report/[reportId]` | §7.3 |

## Design system notes

Built against `avai-frontend-design-spec.md`. The spec is the authority on
layout, copy and navigation; section references appear in comments throughout.

- **Tokens** (`src/app/globals.css`) use the §0 brand hexes: `--brand-ink`
  `#14213D`, `--brand-teal` `#2FB8C6`, `--brand-gold` `#F2A93B`,
  `--brand-green` `#1E9E7E`, `--brand-cream` `#FBF6EF`, plus `--info` and
  `--risk`. `--warn` (amber = caution) is deliberately **split** from
  `--brand-gold` (gold = celebrate) — they look alike and mean opposite
  things.
- **Typography** is Manrope (display) / Source Sans 3 (body), loaded via
  `next/font`.
- **The three BoardX status dimensions** (§5.8) are three components with
  three visual grammars (`src/components/Status.tsx`): Attention = solid pill
  across all five states (Immediate Attention / Watch / On Track /
  Investigation Required / Insufficient Evidence), Board urgency = outlined
  chip with a flame, Confidence = three-dot meter. Never one colour scale.
- **Empty / limited-evidence states** are first-class, not errors
  (`EvidenceState`); all four §5.7 states are reachable on the Interventions
  tab.
- **The mascot** (`src/components/Mascot.tsx`) is an inline SVG drawn from the
  brand sheet — cream body, navy→teal→gold wing, orange tail streak — with the
  sheet's pose vocabulary (hello / learn / practice / improve / explore /
  achieve / loading, plus `neutral`). Per §0 it appears **only** on the login
  screen, async wait states and student screens; the Principal and Teacher
  dashboards carry the logomark alone. Swap the SVG for real artwork when it
  is available — nothing else needs to change.
- **§7.3 pose rule:** Improve when an attempt is stronger than the last,
  Achieve only for a standout result, neutral otherwise, so a weak result is
  never given upbeat framing.
