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
- Teacher — Mrs. Lakshmi (class teacher X-A, Maths X-A/X-B) → `/teacher/home`
- Teacher — Mr. Ravi (Physics + Chemistry, X-A/X-C) → `/teacher/home`
- Student — Aditi R. → `/student/home`

The chosen role is kept in `localStorage` so reloads stay signed in.

## Routes

| Role | Route | Spec |
| --- | --- | --- |
| Principal | `/principal/classes` | Classes overview — a school-wide snapshot, then one card per section (students, attainment + movement, need-attention/critical counts), worst class first |
| Principal | `/principal/classes/[section]` | Class detail: KPIs, the clickable test calendar for this class, and the full 48-student roster (shared `StudentRosterTable`: subject filter + All Students/Top 10/Need Attention/Critical presets, scrollable in a fixed-height table) |
| Principal | `/principal/classes/[section]/tests/[testKey]` | One test, one class, as a single-screen sheet (no page-level scroll): the school topbar is hidden, replaced by a compact right-aligned title + KPI row; subject-wise performance as compact tiles; then `StudentRosterTable` in `fillHeight` mode taking the rest of the viewport |
| Principal | `/principal/classes/[section]/[studentId]` | Student detail: assessment + subject pickers, KPIs (overall, against the class, marks lost), the subject-by-subject gap table, and the same one-page BoardX report the student sees. Works for every one of the 240 students |
| Principal | `/principal/teachers` | §5.11 Manage Teachers (add / edit / revoke, local state) |
| Principal | `/principal/papers` | §5.9 Question Papers — one paper per test × subject; create a test (choosing its subjects), upload/map each subject's paper independently, then generate and download that subject's blank answer card |
| Principal | `/principal/enter-marks` | §5.10 Enter Marks — question-wise entry grid, or upload a filled answer card to read marks automatically (OCR simulated); any mark it can't read opens a manual-entry review before it can be confirmed |
| Principal | `/principal/help` | Help & Contact — replaces School Settings; support details, a message form, and FAQs (all local state) |
| Teacher | `/teacher/home` | §6.1 My Classes / My Subjects |
| Teacher | `/teacher/class/[section]` | §6.2 |
| Teacher | `/teacher/subject/[subject]/[section]` | §6.3, incl. Enter Marks tab (shared `MarksEntryGrid`, same answer-card upload) |
| Teacher | `/teacher/student/[studentId]` | §6.4 Issue / Share |
| Student | `/student/home` | §7.2 — reports grouped by assessment, each with its score and direction |
| Student | `/student/report/[reportId]` | §7.3 — one-page BoardX report (where you stand, pattern seen, where marks went, what to do next). `reportId` is `studentId~testKey~subject` |

## Design system notes

- Tokens live in `src/app/globals.css` (`--brand-ink`, `--brand-teal`,
  `--brand-gold`, `--brand-green`, `--brand-cream`, `--info`, `--risk`).
- The three BoardX status dimensions are three separate components with
  three separate visual grammars (`src/components/Status.tsx`):
  Attention = solid pill, Board urgency = outlined chip with a flame,
  Confidence = three-dot meter. Movement against the previous assessment
  is a fourth, deliberately quieter grammar (`DeltaCell`, `.delta`) so it
  never reads as a status.
- Empty / limited-evidence states are first-class (`EvidenceState`).
- The standalone "BoardX Intelligence" page has been removed — the Classes
  flow (Overview → Class → Student) is the one navigation into this data now.
- Every "← Back" button navigates to an explicit parent route (not
  `router.back()`), so it works even when the page was opened directly
  (a fresh tab, a shared link, a reload) with no in-app history to pop.
- The mascot and logo (`src/components/Mascot.tsx`) use the real AVAI brand
  artwork (`public/mascot/`, `public/brand/`), cropped from the brand sheet.
  `<Mascot>` keeps the spec's pose vocabulary (hello / improve / achieve /
  neutral / thinking) and appears only on the login screen, loading states
  and student screens. `<Logomark>` is the compact app-icon glyph and is
  used everywhere, including the staff sidebars; it also doubles as the
  site favicon (`src/app/icon.png`).

## How the mock data hangs together

`src/lib/avai-mock-data.ts` is built as one derivation chain rather than a
pile of separately-authored numbers, because separately-authored numbers
disagreed with each other on screen. Nothing downstream states a figure
that isn't computed from the layer above it.

1. **`testsConducted`** — the test calendar. Only `status: "Analysed"`
   tests have marks behind them. Adding one here lights it up everywhere.
2. **`subjectChapters`** — the chapter blueprint: each chapter's marks and
   its typical weight in the 80-mark Board paper, plus a `difficulty`
   multiplier. `subjectMaxMarks` is derived from it, so a subject's total
   can never drift from the chapters that make it up.
3. **`classRosterFull`** — 240 students (48 × 5 sections), deterministically
   generated (seeded per section; never `Math.random` at render time). Each
   student gets one skill level plus a per-student drift across the term, so
   overall attainment spreads realistically instead of collapsing toward the
   section mean, and classes move by different amounts between tests.
4. **Everything else is a function of 1–3**: `overallPctFor`, `pctFor`,
   `attentionFor`, `classAveragePct`, `sectionComparison`, `schoolSnapshot`,
   `rosterFor`, `classSummary`, `subjectSnapshotFor`, `topGapFor`.

`attentionFor(student, testKey)` takes the test being viewed, so the
attention flag can never contradict the percentage next to it — the old
baked-in `attention` field said "Intervention" beside a 78% in an earlier
test.

### Reports

`buildStudentReport(student, testKey, subject)` splits that student's real
subject score across the subject's chapters (largest-remainder allocation
weighted by chapter size × difficulty × a stable per-student draw) and
returns the one-page `BoardXStudentReport`. The split always sums back to
the score shown everywhere else — verified across all 2,400
student × test × subject combinations. The pedagogy (pattern label,
headline, insight, NCERT practice) is curated per chapter in
`chapterPatterns`; the arithmetic is generated.

A report id is `studentId~testKey~subject`, so every student drills down to
a real report — previously only one of the 240 did, and the other 239 hit
"not yet available in this build". `getStudentReport(id)`,
`reportsForStudent(id)` and `studentIntelligenceFor(student, testKey)` are
the entry points.

### Papers

Question papers are managed per **(test, subject)** — `SubjectPaper` in
`initialSubjectPapers` — because that's how a school actually runs it:
different subject teachers hand theirs in on their own schedule, so
Mathematics for Unit Test 2 can be "Mapped" while Chemistry for the same
test is still "Not uploaded". "Create test" adds a new test with only the
subjects the principal picks; the two analysed tests start with every
subject already mapped (marks couldn't exist otherwise).

`paperChapterMapping`, `paperQuestions` and `questionSets` are generated
from `subjectChapters` and keyed by **subject only** — the blueprint a
subject's paper tests doesn't vary by which test it belongs to — so the
"View mapping" drawer, the Enter Marks grid, the answer card and a
student's report all describe the same paper. Blueprint coverage is
measured against the whole Board blueprint (`blueprintExtras` holds the
chapters no paper reaches yet), which is why a unit test covers well
under 100%.

Once a subject's paper is "Mapped", "Generate answer card" produces a
blank, printable mark-entry sheet for one section (`downloadAnswerCard` in
`src/lib/downloadReport.ts`) — one row per student, one column per
question, 8 students per printed sheet. Scanning it back in is simulated
by `ocrMarksFor(studentId, testKey, subject)`: it splits the student's
*real* subject score across that paper's questions (the same
largest-remainder technique as the chapter breakdown), so an "uploaded"
answer card always reconciles with the score already on record. A few
cells are deliberately left unread on each upload, opening a manual-review
modal the teacher must fill before the marks are confirmed — because only
analysed tests have a real score to check a scan against, the upload
button only does anything for those.

### Reports

Every "Download report" button (Classes overview, Class detail, Student
detail) builds a small self-contained HTML file client-side —
`src/lib/downloadReport.ts` — and saves it via a Blob: no PDF library,
genuinely downloadable, and printable to PDF from the browser. Class
detail also has "Share report", which "sends" every student in that
section their report for a chosen test (to WhatsApp, per the product
spec) — simulated with local state, surfaced as a "Reports shared" KPI on
the same page.
