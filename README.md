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
| Principal | `/principal/papers` | §5.9 Question Papers (simulated upload + blueprint mapping drawer, local state) |
| Principal | `/principal/enter-marks` | §5.10 Enter Marks (question-wise entry grid, local state) |
| Principal | `/principal/settings` | §5.12 School Settings (academic year, sections, subjects, local state) |
| Teacher | `/teacher/home` | §6.1 My Classes / My Subjects |
| Teacher | `/teacher/class/[section]` | §6.2 |
| Teacher | `/teacher/subject/[subject]/[section]` | §6.3, incl. Enter Marks tab (shared `MarksEntryGrid`) |
| Teacher | `/teacher/student/[studentId]` | §6.4 Issue / Share |
| Student | `/student/home` | §7.2 |
| Student | `/student/report/[reportId]` | §7.3 |

## Design system notes

- Tokens live in `src/app/globals.css` (`--brand-ink`, `--brand-teal`,
  `--brand-gold`, `--brand-green`, `--brand-cream`, `--info`, `--risk`).
- The three BoardX status dimensions are three separate components with
  three separate visual grammars (`src/components/Status.tsx`):
  Attention = solid pill, Board urgency = outlined chip with a flame,
  Confidence = three-dot meter.
- Empty / limited-evidence states are first-class (`EvidenceState`).
- The mascot (`src/components/Mascot.tsx`) is an inline SVG stand-in with the
  spec's pose vocabulary (hello / improve / achieve / neutral / thinking).
  Swap it for the real `AVAI_Mascot` artwork when available. It appears only
  on the login screen, loading states and student screens.
