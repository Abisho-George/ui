/**
 * AVAI — Mock data for a fully-mocked, backend-free UI build.
 *
 * Every page in the app should import from here. NOTHING in this project
 * should call fetch()/axios/etc. against a real server. When the real
 * backend exists later, these exports get replaced by real API calls with
 * the same shapes — that's the whole point of keeping this in one file.
 *
 * Shapes here follow avai-frontend-design-spec.md exactly (section refs in
 * comments). Where a shape represents something that doesn't exist in any
 * backend yet (🔧 BACKEND REQUIRED items), that's noted inline too.
 */

// ============================================================
// School / org context
// ============================================================

export const school = {
  id: "sch_001",
  name: "Bharat International Sr. Sec. School",
  board: "CBSE",
  state: "Tamil Nadu",
};

export const sections = ["X-A", "X-B", "X-C", "X-D", "X-E"] as const;
export const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Social Science",
] as const;

// ============================================================
// Auth / role mocks (§4 login flow — dev-only role switcher)
// 🔧 Teacher + Student are BACKEND REQUIRED (Index #1, #2) — this is a
// stand-in for real sign-in until those exist.
// ============================================================

export type Role = "principal" | "teacher" | "student";

export const mockPrincipal = {
  id: "staff_principal_1",
  name: "Mrs. Kavitha Rajan",
  role: "principal" as const,
};

export type TeacherAssignment =
  | { type: "class"; section: string }
  | { type: "subject"; subject: string; sections: string[] };

export const mockTeachers: Array<{
  id: string;
  name: string;
  role: "teacher";
  assignments: TeacherAssignment[];
}> = [
  {
    id: "staff_teacher_1",
    name: "Mrs. Lakshmi",
    role: "teacher",
    assignments: [
      { type: "class", section: "X-A" },
      { type: "subject", subject: "Mathematics", sections: ["X-A", "X-B"] },
    ],
  },
  {
    id: "staff_teacher_2",
    name: "Mr. Ravi",
    role: "teacher",
    assignments: [
      { type: "subject", subject: "Science", sections: ["X-A", "X-C"] },
    ],
  },
];

export const mockStudentUser = {
  id: "student_aditi",
  name: "Aditi R.",
  rollNo: "01",
  section: "X-A",
};

// ============================================================
// §5.2 Page header / assessment context
// ============================================================

export const assessmentContext = {
  assessmentName: "Unit Test 2",
  studentsAnalysed: 240,
  sectionsAnalysed: 5,
  subjectsAnalysed: 5,
  boardBlueprintMapping: "Enabled",
  assessmentEvidence: "1 Test",
  pilotStatusMessage:
    "Early Intelligence: This analysis is based on Unit Test 2. Trend, consistency and multi-test prediction insights will become available after additional assessments are analysed.",
  assessmentOptions: [
    { label: "Unit Test 2", selectable: true },
    { label: "Unit Test 1", selectable: false },
    { label: "Quarterly Exam", selectable: false },
    { label: "Half Yearly Exam", selectable: false },
    { label: "Pre-Board 1", selectable: false },
    { label: "Pre-Board 2", selectable: false },
  ],
};

// Subject -> marks tested on Unit Test 2, used as the max for generated roster scores.
const subjectMaxMarks: Record<string, number> = { Mathematics: 17, Physics: 10, Chemistry: 10, English: 15, "Social Science": 20 };

// ============================================================
// The reusable "finding" unit (§5.4) — used across Marks Loss,
// Urgency vs Impact, Anomalies, and Interventions.
// confidence: ✅ exists at question level (QuestionTier.confidence) —
// aggregation to cohort level should be verified before real wiring.
// causeStatus "not_localized": 🔧 BACKEND REQUIRED (Index #3)
// ============================================================

export type Confidence = "HIGH" | "MEDIUM" | "EMERGING";
export type BoardUrgency = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";
export type CauseStatus = "localized" | "not_localized";

export interface Finding {
  id: string;
  subject: string;
  topic: string;
  subskill: string;
  studentsAffected: number;
  avgMarksLost: number;
  boardUrgency: BoardUrgency;
  boardRecurrence: string; // e.g. "4/4 recent Board years"
  confidence: Confidence;
  causeStatus: CauseStatus;
  observation: string;
  mostAffectedSections?: { section: string; pct: number }[];
  recommendedIntervention?: string[];
}

export const findings: Finding[] = [
  {
    id: "find_quadratics",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    subskill: "Application Problems",
    studentsAffected: 146,
    avgMarksLost: 4.2,
    boardUrgency: "VERY_HIGH",
    boardRecurrence: "4/4 recent Board years",
    confidence: "HIGH",
    causeStatus: "localized",
    observation:
      "61% of analysed students demonstrate the underlying concept but lose marks when the same concept appears in application-style questions.",
    mostAffectedSections: [
      { section: "X-D", pct: 72 },
      { section: "X-B", pct: 66 },
      { section: "X-A", pct: 41 },
    ],
    recommendedIntervention: ["Application-focused revision", "Board-style question practice"],
  },
  {
    id: "find_electricity",
    subject: "Physics",
    topic: "Electricity",
    subskill: "Numericals",
    studentsAffected: 122,
    avgMarksLost: 3.8,
    boardUrgency: "HIGH",
    boardRecurrence: "3/4 recent Board years",
    confidence: "HIGH",
    causeStatus: "localized",
    observation:
      "Students consistently lose marks converting the concept into a numerical answer, though the underlying law is generally understood.",
    recommendedIntervention: ["Numerical-practice drill sets", "Worked-example walkthroughs"],
  },
  {
    id: "find_light",
    subject: "Physics",
    topic: "Light",
    subskill: undefined as unknown as string,
    studentsAffected: 84,
    avgMarksLost: 2.7,
    boardUrgency: "HIGH",
    boardRecurrence: "3/4 years",
    confidence: "HIGH", // confidence a problem exists — NOT confidence in a cause
    causeStatus: "not_localized", // 🔧 BACKEND REQUIRED (Index #3)
    observation:
      "Students are consistently losing marks across this chapter, but no single subtopic, competency or question pattern explains enough of the loss to identify a reliable cause.",
  },
  {
    id: "find_carbon",
    subject: "Chemistry",
    topic: "Carbon Compounds",
    subskill: "Reasoning",
    studentsAffected: 71,
    avgMarksLost: 1.4,
    boardUrgency: "LOW",
    boardRecurrence: "1/4 years",
    confidence: "MEDIUM",
    causeStatus: "localized",
    observation:
      "A smaller, lower-urgency pattern — included to show contrast against high-urgency findings in the Urgency vs. Impact table.",
  },
];

// ============================================================
// §5.3 (10) Section Comparison — still used by the Classes overview/detail
// ============================================================

export const sectionComparison = [
  { section: "X-A", students: 48, overallAttainment: 81, highPriorityFindings: 1, attention: "Low" },
  { section: "X-B", students: 48, overallAttainment: 74, highPriorityFindings: 3, attention: "Medium" },
  { section: "X-C", students: 48, overallAttainment: 78, highPriorityFindings: 2, attention: "Medium" },
  { section: "X-D", students: 48, overallAttainment: 68, highPriorityFindings: 5, attention: "High" },
  { section: "X-E", students: 48, overallAttainment: 76, highPriorityFindings: 3, attention: "Medium" },
];

// ============================================================
// §5.7 Empty / limited-evidence states — reusable copy
// ============================================================

export const emptyStates = {
  trendNotAvailable:
    "Trend and consistency insights require at least one additional analysed assessment.",
  earlySignal:
    "A possible pattern is visible, but there is not yet enough evidence for a strong conclusion.",
  causeNotLocalized:
    "Problem confirmed. Cause not localized. Manual review recommended.",
  paperUnderTests:
    "This assessment included too few application questions to confidently assess application readiness.",
};

// ============================================================
// Individual student drill-down (summary tier — used when a full
// one-page report isn't available for that student).
// ============================================================

export const individualStudentIntelligence: Record<string, any> = {
  rahul: {
    name: "Rahul",
    section: "X-B",
    unitTestAttainment: "12 / 17",
    marksLost: 5,
    recoverableOpportunity: 3, // 🔧 BACKEND REQUIRED (Index #4)
    subjects: [
      {
        subject: "Mathematics",
        lost: 2,
        topic: "Quadratic Equations",
        subskill: "Application Questions",
        boardUrgency: "VERY_HIGH" as BoardUrgency,
        confidence: "HIGH" as Confidence,
      },
      {
        subject: "Physics",
        lost: 2,
        topic: "Electricity",
        cause: "Numerical application",
        confidence: "HIGH" as Confidence,
      },
    ],
    boardXSummary:
      "Rahul demonstrates adequate conceptual understanding but loses disproportionately in application-based questions. His highest-priority gap is Mathematics Quadratics because it combines repeated loss with very high Board urgency.",
  },
};

// ============================================================
// §5.11 Manage Teachers screen — reuses mockTeachers above
// (🔧 BACKEND REQUIRED, Index #1)
// ============================================================

export const manageTeachersList = mockTeachers;

// ============================================================
// §6.4 Student report page (Teacher-facing view of one student)
// "issue"/"share" actions: issue is ✅ real shape, share is
// 🔧 BACKEND REQUIRED (Index #2)
// ============================================================

export const teacherFacingStudentReport = {
  studentName: "Aditi R.",
  rollNo: "01",
  section: "X-A",
  subjectReports: [
    {
      subject: "Mathematics",
      assessment: "Term 2 Assessment",
      score: "78/80",
      strengths: ["Recall", "Algebra basics"],
      focusAreas: ["Applying-tier — Quadratic Equations"],
      issued: true,
      sharedWithStudent: true,
    },
    {
      subject: "Science",
      assessment: "Term 2 Assessment",
      score: "65/80",
      strengths: ["Diagrams", "Definitions"],
      focusAreas: ["Numerical application — Electricity"],
      issued: true,
      sharedWithStudent: false,
    },
  ],
};

// ============================================================
// §7 Student-facing experience — 🔧 entire section BACKEND REQUIRED
// (Index #2). This is what the Student login/home/report screens render.
// ============================================================

export const studentMyReports = [
  {
    id: "report_maths_t2",
    subject: "Mathematics",
    term: "Term 2",
    sharedAgo: "3 days ago",
  },
  {
    id: "report_science_t1",
    subject: "Science",
    term: "Term 1",
    sharedAgo: "2 months ago",
  },
];

// §7.3 One-page BoardX student report — mirrors the real
// "AVAI BoardX — Your One-Page Assessment Report" hand-off design:
// where you stand, how you handled questions, where marks went, and
// what to practise next. Evidence-first: nothing here invents a score
// or a pattern the underlying paper doesn't support.

export interface ReportStandingRow {
  chapter: string;
  scored: number;
  outOf: number;
  notScored: number;
  boardImportance: string; // e.g. "10 / 80" or "Not enough evidence"
}

export interface ReportMarksLostItem {
  chapter: string;
  scoreLabel: string; // "6 / 7"
  scored: number;
  outOf: number;
  subLabel: string; // "1 / 1 application mark not scored"
  insight: string;
}

export interface ReportActionGroup {
  heading: string;
  items: string[];
}

export interface BoardXStudentReport {
  subject: string;
  assessmentName: string; // "Unit Test 2"
  score: string; // "16 / 17" — headline for the report list / hero
  trend: "up" | "down" | "flat"; // drives Improve/Achieve mascot pose
  encouragingLine: string;
  totalBoardMarks: number;
  boardExposureMarks: number;
  boardScoreImpact: "NOT_CALIBRATED" | string;
  standing: ReportStandingRow[];
  patternLabel: string;
  patternHeadline: string;
  patternBody: string;
  marksLost: ReportMarksLostItem[];
  noPatternNote: { chapter: string; scoreLabel: string; note: string } | null;
  actionPlan: ReportActionGroup[];
  practiceRule: string;
  takeaway: string;
  evidenceNote: string;
}

export const studentReportDetail: Record<string, BoardXStudentReport> = {
  report_maths_t2: {
    subject: "Mathematics",
    assessmentName: "Unit Test 2",
    score: "16 / 17",
    trend: "up",
    encouragingLine: "Keep going. You're on the right path.",
    totalBoardMarks: 80,
    boardExposureMarks: 30,
    boardScoreImpact: "NOT_CALIBRATED",
    standing: [
      { chapter: "Quadratic Equations", scored: 6, outOf: 7, notScored: 1, boardImportance: "12 / 80" },
      { chapter: "Arithmetic Progressions", scored: 4, outOf: 4, notScored: 0, boardImportance: "8 / 80" },
      { chapter: "Trigonometry", scored: 3, outOf: 3, notScored: 0, boardImportance: "10 / 80" },
      { chapter: "Coordinate Geometry", scored: 3, outOf: 3, notScored: 0, boardImportance: "Not enough evidence" },
    ],
    patternLabel: "MULTI-STEP APPLICATION",
    patternHeadline: "You scored higher on questions asking you to state a rule than on questions asking you to apply it in a new situation.",
    patternBody: "The clearest pattern in this paper is on multi-step application questions in Quadratic Equations — the same pattern BoardX sees across Class X.",
    marksLost: [
      {
        chapter: "Quadratic Equations",
        scoreLabel: "6 / 7",
        scored: 6,
        outOf: 7,
        subLabel: "1 / 1 application mark not scored",
        insight: "Your one lost mark is on a multi-step application question — consistent with the class-wide pattern in this chapter.",
      },
    ],
    noPatternNote: {
      chapter: "Coordinate Geometry",
      scoreLabel: "3 / 3",
      note: "Full marks here — there isn't a loss to explain, so no pattern is shown for this chapter.",
    },
    actionPlan: [
      {
        heading: "START WITH: Quadratic Equations — application",
        items: ["Ex 4.3 Q7 — word problem leading to a quadratic", "Ex 4.4 Q2 — two-step \"nature of roots\" application", "Ex 4.4 Q5 — forming the equation from a story sum"],
      },
    ],
    practiceRule:
      "For every wrong answer, mark the error: reading the condition, choosing the method, setting up the steps, calculation, or the final answer.",
    takeaway: "See where the marks went, the pattern behind them, the Board importance, and the exact practice to do next.",
    evidenceNote: "Evidence note: one assessment only; this does not predict your final Board score.",
  },
  report_science_t1: {
    subject: "Science",
    assessmentName: "Unit Test 1",
    score: "15 / 20",
    trend: "flat",
    encouragingLine: "Solid foundations — a bit more practice will help.",
    totalBoardMarks: 80,
    boardExposureMarks: 16,
    boardScoreImpact: "NOT_CALIBRATED",
    standing: [
      { chapter: "Electricity", scored: 5, outOf: 8, notScored: 3, boardImportance: "9 / 80" },
      { chapter: "Light", scored: 6, outOf: 7, notScored: 1, boardImportance: "7 / 80" },
      { chapter: "Carbon Compounds", scored: 4, outOf: 5, notScored: 1, boardImportance: "Not enough evidence" },
    ],
    patternLabel: "NUMERICAL CONVERSION",
    patternHeadline: "You scored higher on questions asking you to state a law than on questions asking you to calculate a numerical answer.",
    patternBody: "The clearest pattern in this paper is on numerical questions in Electricity.",
    marksLost: [
      {
        chapter: "Electricity",
        scoreLabel: "5 / 8",
        scored: 5,
        outOf: 8,
        subLabel: "3 / 3 numerical marks not scored",
        insight: "All of your lost marks in this chapter are on questions that ask you to calculate a value, not state a rule.",
      },
    ],
    noPatternNote: {
      chapter: "Light",
      scoreLabel: "6 / 7",
      note: "No additional pattern is shown because this paper does not provide enough evidence to issue one confidently for this chapter.",
    },
    actionPlan: [
      {
        heading: "START WITH: Electricity — numerical conversion",
        items: ["V = IR — single-step numericals, practice set A", "Power (P = VI) — two-step problems", "Series + parallel combination circuits"],
      },
    ],
    practiceRule:
      "For every wrong answer, mark the error: reading the condition, choosing the method, setting up the steps, calculation, or the final answer.",
    takeaway: "See where the marks went, the pattern behind them, the Board importance, and the exact practice to do next.",
    evidenceNote: "Evidence note: one assessment only; this does not predict your final Board score.",
  },
};

// ============================================================
// ADDITIONS for the UI-only build (same shapes/style as above).
// Everything below is 🔧 BACKEND REQUIRED — no real endpoint yet.
// ============================================================

// §4 login form — dev-only switcher entries
export const devLoginOptions = [
  { key: "principal", label: "Sign in as Principal", sub: mockPrincipal.name, role: "principal" as Role, userId: mockPrincipal.id },
  { key: "teacher_1", label: "Sign in as Teacher", sub: "Mrs. Lakshmi · X-A class · Maths", role: "teacher" as Role, userId: "staff_teacher_1" },
  { key: "teacher_2", label: "Sign in as Teacher", sub: "Mr. Ravi · Science", role: "teacher" as Role, userId: "staff_teacher_2" },
  { key: "student", label: "Sign in as Student", sub: "Aditi R. · X-A · Roll 01", role: "student" as Role, userId: mockStudentUser.id },
];

// §6.2 / §6.3 Teacher class & subject views — roster per section
export interface RosterStudent {
  id: string;
  rollNo: string;
  name: string;
  section: string;
  attainment: Record<string, string>; // subject -> "x/y"
  attention: "On Track" | "Watch" | "Intervention";
  mainBlocker: string;
}

export const classRoster: RosterStudent[] = [
  { id: "student_aditi", rollNo: "01", name: "Aditi R.", section: "X-A", attainment: { Mathematics: "16/17", Science: "9/10", English: "14/15", "Social Science": "18/20" }, attention: "On Track", mainBlocker: "—" },
  { id: "student_aarav", rollNo: "02", name: "Aarav", section: "X-A", attainment: { Mathematics: "17/17", Science: "10/10", English: "15/15", "Social Science": "20/20" }, attention: "On Track", mainBlocker: "—" },
  { id: "student_meera", rollNo: "03", name: "Meera", section: "X-A", attainment: { Mathematics: "13/17", Science: "7/10", English: "12/15", "Social Science": "16/20" }, attention: "Watch", mainBlocker: "Maths Application" },
  { id: "student_karthik", rollNo: "04", name: "Karthik", section: "X-A", attainment: { Mathematics: "11/17", Science: "6/10", English: "11/15", "Social Science": "13/20" }, attention: "Intervention", mainBlocker: "Electricity Numericals" },
  { id: "student_rahul", rollNo: "07", name: "Rahul", section: "X-B", attainment: { Mathematics: "12/17", Science: "7/10", English: "13/15", "Social Science": "15/20" }, attention: "Intervention", mainBlocker: "Maths Application" },
  { id: "student_sneha", rollNo: "12", name: "Sneha", section: "X-B", attainment: { Mathematics: "15/17", Science: "9/10", English: "14/15", "Social Science": "17/20" }, attention: "On Track", mainBlocker: "—" },
  { id: "student_riya", rollNo: "05", name: "Riya", section: "X-C", attainment: { Mathematics: "16/17", Science: "8/10", English: "14/15", "Social Science": "18/20" }, attention: "Watch", mainBlocker: "Physics" },
  { id: "student_vikram", rollNo: "09", name: "Vikram", section: "X-C", attainment: { Mathematics: "14/17", Science: "8/10", English: "12/15", "Social Science": "16/20" }, attention: "On Track", mainBlocker: "—" },
  { id: "student_divya", rollNo: "14", name: "Divya", section: "X-D", attainment: { Mathematics: "10/17", Science: "5/10", English: "11/15", "Social Science": "14/20" }, attention: "Intervention", mainBlocker: "Electricity Numericals" },
];

// Class-level summary per section (teacher class view header)
export const classSummary: Record<string, { students: number; overallAttainment: number; attention: "Low" | "Medium" | "High"; topFinding: string }> = Object.fromEntries(
  sectionComparison.map((s) => [
    s.section,
    {
      students: s.students,
      overallAttainment: s.overallAttainment,
      attention: s.attention as "Low" | "Medium" | "High",
      topFinding: s.section === "X-D" ? "Electricity — Numericals" : "Quadratic Equations — Application",
    },
  ])
);

// §6.3 Subject view — per-section subject snapshot
export const subjectSectionSnapshot: Record<string, { marksTested: number; avgAttainment: number; atExpectedLevelPct: number; topGap: string }> = {
  Mathematics: { marksTested: 17, avgAttainment: 12.4, atExpectedLevelPct: 36, topGap: "Quadratic Equations — Application" },
  Science: { marksTested: 20, avgAttainment: 15.3, atExpectedLevelPct: 50, topGap: "Electricity — Numericals" },
  Physics: { marksTested: 10, avgAttainment: 7.1, atExpectedLevelPct: 42, topGap: "Electricity — Numericals" },
  Chemistry: { marksTested: 10, avgAttainment: 8.2, atExpectedLevelPct: 58, topGap: "Carbon Compounds — Reasoning" },
  English: { marksTested: 15, avgAttainment: 12.6, atExpectedLevelPct: 71, topGap: "Unseen passage — Inference" },
  "Social Science": { marksTested: 20, avgAttainment: 16.8, atExpectedLevelPct: 68, topGap: "Map work" },
};

// §5.6 — student drill-down keyed by table row name (lower-case)
individualStudentIntelligence.divya = {
  name: "Divya",
  section: "X-D",
  unitTestAttainment: "10 / 17",
  marksLost: 7,
  recoverableOpportunity: 4,
  subjects: [
    { subject: "Physics", lost: 4, topic: "Electricity", subskill: "Numericals", boardUrgency: "HIGH", confidence: "HIGH" },
    { subject: "Mathematics", lost: 3, topic: "Quadratic Equations", subskill: "Application Questions", boardUrgency: "VERY_HIGH", confidence: "MEDIUM" },
  ],
  boardXSummary:
    "Divya's loss is concentrated in numerical conversion in Physics. Her Mathematics application gap is secondary but carries very high Board urgency, so both should be addressed together.",
};
individualStudentIntelligence.riya = {
  name: "Riya",
  section: "X-C",
  unitTestAttainment: "16 / 17",
  marksLost: 1,
  recoverableOpportunity: 1,
  subjects: [{ subject: "Physics", lost: 1, topic: "Light", cause: "Not localized", confidence: "EMERGING" }],
  boardXSummary: "Riya is performing at a high level. The single mark lost in Light does not yet form a pattern; no intervention is recommended at this stage.",
};

// §5.9 Papers / §5.10 Enter marks / §5.12 Settings — page headers
export const pageHeaders = {
  papers: { title: "Question Papers", blurb: "Upload and map assessment papers to the Board blueprint. Paper diagnostics feed the Assessment Diagnostic Quality section of BoardX." },
  enterMarks: { title: "Enter Marks", blurb: "Question-wise marks entry for analysed assessments. Teachers can also enter marks from their Subject view." },
  settings: { title: "School Settings", blurb: "School profile, academic year, sections and subject configuration." },
};

// ============================================================
// §5.9 Question Papers — upload + blueprint mapping
// 🔧 BACKEND REQUIRED — upload/mapping is simulated with a timed
// status transition; nothing is actually parsed or stored.
// ============================================================

export type PaperStatus = "Mapped" | "Needs mapping" | "Processing";

export interface PaperRecord {
  id: string;
  assessmentName: string;
  subject: string; // "All subjects" for a combined paper
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  status: PaperStatus;
  blueprintCoveragePct: number | null;
  chaptersCovered: number | null;
  chaptersTotal: number | null;
}

export const papersList: PaperRecord[] = [
  {
    id: "paper_ut2_all",
    assessmentName: "Unit Test 2",
    subject: "All subjects",
    fileName: "unit-test-2-question-paper.pdf",
    uploadedBy: "Mrs. Kavitha Rajan",
    uploadedAt: "2026-08-14",
    status: "Mapped",
    blueprintCoveragePct: 82,
    chaptersCovered: 8,
    chaptersTotal: 9,
  },
  {
    id: "paper_ut1_maths",
    assessmentName: "Unit Test 1",
    subject: "Mathematics",
    fileName: "unit-test-1-maths.pdf",
    uploadedBy: "Mrs. Lakshmi",
    uploadedAt: "2026-06-02",
    status: "Mapped",
    blueprintCoveragePct: 74,
    chaptersCovered: 6,
    chaptersTotal: 9,
  },
  {
    id: "paper_qe_science",
    assessmentName: "Quarterly Exam",
    subject: "Science",
    fileName: "quarterly-exam-science-draft.pdf",
    uploadedBy: "Mr. Ravi",
    uploadedAt: "2026-09-10",
    status: "Needs mapping",
    blueprintCoveragePct: null,
    chaptersCovered: null,
    chaptersTotal: null,
  },
];

// Per-paper chapter mapping shown in the "View mapping" drawer. Falls back to
// a generic message when a paper has no chapter-level detail yet.
export const paperChapterMapping: Record<string, { chapter: string; covered: boolean; questionsMapped: number }[]> = {
  paper_ut2_all: [
    { chapter: "Quadratic Equations", covered: true, questionsMapped: 4 },
    { chapter: "Arithmetic Progressions", covered: true, questionsMapped: 2 },
    { chapter: "Electricity", covered: true, questionsMapped: 3 },
    { chapter: "Light", covered: true, questionsMapped: 3 },
    { chapter: "Carbon Compounds", covered: true, questionsMapped: 1 },
    { chapter: "Acids, Bases and Salts", covered: true, questionsMapped: 2 },
    { chapter: "Life Processes", covered: true, questionsMapped: 2 },
    { chapter: "Trigonometry", covered: true, questionsMapped: 1 },
    { chapter: "Coordinate Geometry", covered: false, questionsMapped: 0 },
  ],
  paper_ut1_maths: [
    { chapter: "Real Numbers", covered: true, questionsMapped: 2 },
    { chapter: "Polynomials", covered: true, questionsMapped: 2 },
    { chapter: "Pair of Linear Equations", covered: true, questionsMapped: 3 },
    { chapter: "Quadratic Equations", covered: true, questionsMapped: 2 },
    { chapter: "Arithmetic Progressions", covered: true, questionsMapped: 1 },
    { chapter: "Triangles", covered: true, questionsMapped: 1 },
    { chapter: "Coordinate Geometry", covered: false, questionsMapped: 0 },
    { chapter: "Trigonometry", covered: false, questionsMapped: 0 },
    { chapter: "Circles", covered: false, questionsMapped: 0 },
  ],
};

export interface PaperQuestion {
  no: string;
  chapter: string;
  marks: number;
}

/** Question-by-question mapping shown when a paper is opened — the detail
 * behind each chapter's questionsMapped count in paperChapterMapping. */
export const paperQuestions: Record<string, PaperQuestion[]> = {
  paper_ut2_all: [
    { no: "Q1", chapter: "Quadratic Equations", marks: 2 },
    { no: "Q2", chapter: "Arithmetic Progressions", marks: 2 },
    { no: "Q3", chapter: "Electricity", marks: 2 },
    { no: "Q4", chapter: "Light", marks: 2 },
    { no: "Q5", chapter: "Acids, Bases and Salts", marks: 2 },
    { no: "Q6", chapter: "Carbon Compounds", marks: 2 },
    { no: "Q7", chapter: "Quadratic Equations", marks: 3 },
    { no: "Q8", chapter: "Arithmetic Progressions", marks: 3 },
    { no: "Q9", chapter: "Electricity", marks: 3 },
    { no: "Q10", chapter: "Light", marks: 3 },
    { no: "Q11", chapter: "Acids, Bases and Salts", marks: 3 },
    { no: "Q12", chapter: "Quadratic Equations", marks: 4 },
    { no: "Q13", chapter: "Life Processes", marks: 2 },
    { no: "Q14", chapter: "Trigonometry", marks: 3 },
    { no: "Q15", chapter: "Electricity", marks: 5 },
    { no: "Q16", chapter: "Light", marks: 3 },
    { no: "Q17", chapter: "Life Processes", marks: 3 },
    { no: "Q18", chapter: "Quadratic Equations", marks: 3 },
  ],
  paper_ut1_maths: [
    { no: "Q1", chapter: "Real Numbers", marks: 2 },
    { no: "Q2", chapter: "Polynomials", marks: 2 },
    { no: "Q3", chapter: "Pair of Linear Equations", marks: 2 },
    { no: "Q4", chapter: "Quadratic Equations", marks: 2 },
    { no: "Q5", chapter: "Triangles", marks: 2 },
    { no: "Q6", chapter: "Real Numbers", marks: 3 },
    { no: "Q7", chapter: "Polynomials", marks: 3 },
    { no: "Q8", chapter: "Pair of Linear Equations", marks: 3 },
    { no: "Q9", chapter: "Quadratic Equations", marks: 3 },
    { no: "Q10", chapter: "Arithmetic Progressions", marks: 3 },
    { no: "Q11", chapter: "Pair of Linear Equations", marks: 5 },
  ],
};

// ============================================================
// §5.10 Enter Marks — question-wise entry grid
// 🔧 BACKEND REQUIRED — marks are held in React state only; "Save"
// does not persist anything.
// ============================================================

export interface QuestionSpec {
  key: string;
  label: string;
  maxMarks: number;
}

export const questionSets: Record<string, QuestionSpec[]> = {
  Mathematics: [
    { key: "q1", label: "Q1", maxMarks: 2 },
    { key: "q2", label: "Q2", maxMarks: 3 },
    { key: "q3", label: "Q3", maxMarks: 2 },
    { key: "q4", label: "Q4", maxMarks: 5 },
    { key: "q5", label: "Q5", maxMarks: 5 },
  ],
  Physics: [
    { key: "q1", label: "Q1", maxMarks: 2 },
    { key: "q2", label: "Q2", maxMarks: 3 },
    { key: "q3", label: "Q3", maxMarks: 5 },
  ],
  Chemistry: [
    { key: "q1", label: "Q1", maxMarks: 2 },
    { key: "q2", label: "Q2", maxMarks: 3 },
    { key: "q3", label: "Q3", maxMarks: 5 },
  ],
  English: [
    { key: "q1", label: "Q1 — Reading", maxMarks: 5 },
    { key: "q2", label: "Q2 — Writing", maxMarks: 5 },
    { key: "q3", label: "Q3 — Grammar", maxMarks: 5 },
  ],
  "Social Science": [
    { key: "q1", label: "Q1", maxMarks: 5 },
    { key: "q2", label: "Q2", maxMarks: 5 },
    { key: "q3", label: "Q3", maxMarks: 5 },
    { key: "q4", label: "Q4", maxMarks: 5 },
  ],
  // Combined Physics + Chemistry paper, matching Mr. Ravi's "Science" assignment.
  Science: [
    { key: "q1", label: "Q1 — Physics", maxMarks: 5 },
    { key: "q2", label: "Q2 — Physics", maxMarks: 5 },
    { key: "q3", label: "Q3 — Chemistry", maxMarks: 5 },
    { key: "q4", label: "Q4 — Chemistry", maxMarks: 5 },
  ],
};

// ============================================================
// §5.12 School Settings — profile, academic year, sections/subjects
// 🔧 BACKEND REQUIRED — held in local state; nothing persists.
// ============================================================

export const academicYears = ["2024–25", "2025–26", "2026–27"];

export const schoolSettings = {
  academicYear: "2026–27",
  boardBlueprintMappingEnabled: true,
};

// ============================================================
// Principal → Classes (classwise drill-down: Overview → Class →
// Student, with a test-wise report picker on the student page).
// Reuses sectionComparison / classRoster / studentReportDetail —
// no new cohort-level numbers are invented here.
// ============================================================

/** studentId -> report ids available for that student (from studentReportDetail). */
export const studentReportsByStudent: Record<string, string[]> = {
  student_aditi: ["report_maths_t2", "report_science_t1"],
};

/** Section -> class teacher's display name, derived from mockTeachers' assignments. */
export const classTeacherBySection: Record<string, string> = Object.fromEntries(
  mockTeachers.flatMap((t) => t.assignments.filter((a) => a.type === "class").map((a) => [(a as { section: string }).section, t.name]))
);

// ============================================================
// Full class rosters (48 students × 5 sections = 240) with two tests'
// worth of per-subject scores, for the Classes → student table.
// Deterministically generated (seeded per section, not Math.random on
// every render) so the same names/numbers show up on every visit.
// 🔧 BACKEND REQUIRED — this whole roster is dummy data.
// ============================================================

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

const firstNamePool = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan",
  "Kabir", "Aryan", "Dhruv", "Karthik", "Rahul", "Nikhil", "Varun", "Yash", "Aniket", "Siddharth",
  "Aditi", "Ananya", "Diya", "Ishita", "Kavya", "Meera", "Priya", "Riya", "Sneha", "Tanvi",
  "Aarohi", "Anika", "Divya", "Gauri", "Isha", "Kritika", "Lavanya", "Nandini", "Pooja", "Shreya",
  "Manoj", "Sanjay", "Farhan", "Aisha", "Zara", "Vikram", "Naveen", "Ritika",
];
const lastInitialPool = ["R.", "K.", "S.", "M.", "P.", "N.", "V.", "T.", "G.", "D.", "B.", "J.", "A.", "L."];

const sectionMeanPct: Record<string, number> = { "X-A": 81, "X-B": 74, "X-C": 78, "X-D": 68, "X-E": 76 };

const blockerPool: Record<string, string[]> = {
  Mathematics: ["Quadratic Equations — Application", "Arithmetic Progressions", "Trigonometry Identities"],
  Physics: ["Electricity — Numericals", "Light — Ray Diagrams"],
  Chemistry: ["Chemical Equations", "Carbon Compounds"],
  English: ["Reading Comprehension", "Grammar — Tenses"],
  "Social Science": ["Map Work", "Economics — Numericals"],
};

export interface TestScore {
  scored: number;
  outOf: number;
}
export interface FullRosterStudent {
  id: string;
  rollNo: string;
  name: string;
  section: string;
  attention: "On Track" | "Watch" | "Intervention";
  mainBlocker: string;
  scores: Record<string, Record<string, TestScore>>; // testKey -> subject -> score
}

function attentionFor(pct: number): FullRosterStudent["attention"] {
  if (pct >= 75) return "On Track";
  if (pct >= 55) return "Watch";
  return "Intervention";
}

function generateSectionRoster(section: string, count: number): FullRosterStudent[] {
  const rnd = mulberry32(seedFromString(section));
  const mean = sectionMeanPct[section] ?? 75;
  const used = new Set<string>();
  const students: FullRosterStudent[] = [];

  for (let i = 1; i <= count; i++) {
    const rollNo = String(i).padStart(2, "0");
    let name = "";
    do {
      const fn = firstNamePool[Math.floor(rnd() * firstNamePool.length)];
      const ln = lastInitialPool[Math.floor(rnd() * lastInitialPool.length)];
      name = `${fn} ${ln}`;
    } while (used.has(name));
    used.add(name);

    // Each student has their own skill level (wide spread around the
    // section mean) so overall attainment doesn't collapse toward the
    // mean the way averaging independently-random subjects would.
    const studentSkill = mean + (rnd() - 0.5) * 44;

    const scores: FullRosterStudent["scores"] = {};
    let ut2Ratio = 0;
    for (const testKey of ["unit_test_1", "unit_test_2"]) {
      const testSkill = testKey === "unit_test_1" ? studentSkill - 3 : studentSkill;
      scores[testKey] = {};
      for (const subject of subjects) {
        const max = subjectMaxMarks[subject];
        const pct = Math.min(100, Math.max(20, testSkill + (rnd() - 0.5) * 16));
        const scored = Math.max(0, Math.round((pct / 100) * max));
        scores[testKey][subject] = { scored, outOf: max };
        if (testKey === "unit_test_2") ut2Ratio += scored / max;
      }
    }
    const overallPct = (ut2Ratio / subjects.length) * 100;
    const attention = attentionFor(overallPct);

    let mainBlocker = "—";
    if (attention !== "On Track") {
      let worstSubject: string = subjects[0];
      let worstRatio = Infinity;
      for (const subject of subjects) {
        const s = scores.unit_test_2[subject];
        const ratio = s.scored / s.outOf;
        if (ratio < worstRatio) {
          worstRatio = ratio;
          worstSubject = subject;
        }
      }
      const options = blockerPool[worstSubject] ?? [worstSubject];
      mainBlocker = options[Math.floor(rnd() * options.length)];
    }

    students.push({ id: `student_${section.replace("-", "")}_${rollNo}`, rollNo, name, section, attention, mainBlocker, scores });
  }
  return students;
}

export const classRosterFull: Record<string, FullRosterStudent[]> = Object.fromEntries(sections.map((s) => [s, generateSectionRoster(s, 48)]));

// Keep the hand-authored students (who have a real one-page report or an
// individual-intelligence drill-down) at their original roll numbers, so
// those flows keep working inside the full roster table.
function overrideStudent(section: string, rollNo: string, patch: Partial<FullRosterStudent>) {
  const roster = classRosterFull[section];
  const idx = roster.findIndex((s) => s.rollNo === rollNo);
  if (idx >= 0) roster[idx] = { ...roster[idx], ...patch };
}
overrideStudent("X-A", "01", { id: "student_aditi", name: "Aditi R.", attention: "On Track", mainBlocker: "—" });
overrideStudent("X-C", "05", { id: "student_riya", name: "Riya", attention: "Watch", mainBlocker: "Physics — Light" });
overrideStudent("X-D", "14", { id: "student_divya", name: "Divya", attention: "Intervention", mainBlocker: "Electricity — Numericals" });

export interface ConductedTest {
  key: string;
  name: string;
  date: string;
  status: "Analysed" | "Scheduled";
}

/** Same test calendar for every section — only Unit Test 1 & 2 have marks entered so far. */
export const testsConducted: ConductedTest[] = [
  { key: "unit_test_1", name: "Unit Test 1", date: "2026-06-02", status: "Analysed" },
  { key: "unit_test_2", name: "Unit Test 2", date: "2026-08-14", status: "Analysed" },
  { key: "quarterly", name: "Quarterly Exam", date: "2026-09-25", status: "Scheduled" },
  { key: "half_yearly", name: "Half Yearly Exam", date: "2026-11-10", status: "Scheduled" },
  { key: "pre_board_1", name: "Pre-Board 1", date: "2027-01-15", status: "Scheduled" },
  { key: "pre_board_2", name: "Pre-Board 2", date: "2027-02-10", status: "Scheduled" },
];
