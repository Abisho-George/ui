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

- Principal — Mrs. Kavitha Rajan → `/principal/classes`
- Teacher — Mrs. Lakshmi (class X-A, Maths X-A/X-B) → `/teacher/home`
- Teacher — Mr. Ravi (Science X-A/X-C) → `/teacher/home`
- Student — Aditi R. → `/student/home`

The chosen role is kept in `localStorage` so reloads stay signed in.

## Routes

| Role | Route | Spec |
| --- | --- | --- |
| Principal | `/principal/classes` | Classes overview — one card per section (students, attainment, need-attention count) |
| Principal | `/principal/classes/[section]` | Class detail: KPIs, the clickable test calendar for this class, and the full 48-student roster (shared `StudentRosterTable`: subject filter + All Students/Top 10/Need Attention/Critical presets, scrollable in a fixed-height table) |
| Principal | `/principal/classes/[section]/tests/[testKey]` | One test, one class, as a single-screen sheet (no page-level scroll): the school topbar is hidden, replaced by a compact right-aligned title + KPI row; subject-wise performance as compact tiles; then `StudentRosterTable` in `fillHeight` mode taking the rest of the viewport |
| Principal | `/principal/classes/[section]/[studentId]` | Student detail with a test-wise assessment/subject picker, rendering the same one-page BoardX report a student sees themselves (falls back to summary intelligence, then an honest empty state) |
| Principal | `/principal/teachers` | §5.11 Manage Teachers (add / edit / revoke, local state) |
| Principal | `/principal/papers` | §5.9 Question Papers (simulated upload + blueprint mapping drawer, local state) |
| Principal | `/principal/enter-marks` | §5.10 Enter Marks (question-wise entry grid, local state) |
| Principal | `/principal/settings` | §5.12 School Settings (academic year, sections, subjects, local state) |
| Teacher | `/teacher/home` | §6.1 My Classes / My Subjects |
| Teacher | `/teacher/class/[section]` | §6.2 |
| Teacher | `/teacher/subject/[subject]/[section]` | §6.3, incl. Enter Marks tab (shared `MarksEntryGrid`) |
| Teacher | `/teacher/student/[studentId]` | §6.4 Issue / Share |
| Student | `/student/home` | §7.2 |
| Student | `/student/report/[reportId]` | §7.3 — one-page BoardX report (where you stand, pattern seen, where marks went, what to do next) |

## Design system notes

- Tokens live in `src/app/globals.css` (`--brand-ink`, `--brand-teal`,
  `--brand-gold`, `--brand-green`, `--brand-cream`, `--info`, `--risk`).
- The three BoardX status dimensions are three separate components with
  three separate visual grammars (`src/components/Status.tsx`):
  Attention = solid pill, Board urgency = outlined chip with a flame,
  Confidence = three-dot meter.
- Empty / limited-evidence states are first-class (`EvidenceState`).
- The standalone "BoardX Intelligence" page has been removed — the Classes
  flow (Overview → Class → Student) is the one navigation into this data
  now. The Classes → Class detail roster is a full, deterministically
  generated 240-student dataset (`classRosterFull` in the mock-data file,
  48 per section) rather than a hand-authored sample; a handful of students
  (Aditi, Divya, Riya) are pinned at their original roll numbers so their
  richer report / intelligence drill-downs keep working.
- Every "← Back" button navigates to an explicit parent route (not
  `router.back()`), so it works even when the page was opened directly
  (a fresh tab, a shared link, a reload) with no in-app history to pop.
- Question Papers' "View mapping" drawer shows the question-by-question
  breakdown behind each chapter's count (`paperQuestions` in the
  mock-data file) — question number, chapter, marks, and a running total —
  for papers that have it (Unit Test 2, Unit Test 1 Maths).
- The mascot and logo (`src/components/Mascot.tsx`) use the real AVAI brand
  artwork (`public/mascot/`, `public/brand/`), cropped from the brand sheet.
  `<Mascot>` keeps the spec's pose vocabulary (hello / improve / achieve /
  neutral / thinking) and appears only on the login screen, loading states
  and student screens. `<Logomark>` is the compact app-icon glyph and is
  used everywhere, including the staff sidebars; it also doubles as the
  site favicon (`src/app/icon.png`).
