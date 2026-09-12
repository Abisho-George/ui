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

// ============================================================
// §5.3 (1) Assessment Diagnostic Quality — ✅ shape matches
// GET /reports/paper/{assessment_id}
// ============================================================

export const diagnosticQuality = {
  strength: "MODERATE" as "STRONG" | "MODERATE" | "LIMITED",
  blueprintCoveragePct: 82,
  chaptersCovered: 8,
  chaptersTotal: 9,
  applicationQuestionsPct: 22,
  applicationExpectationPct: 30,
  higherOrderQuestionsPct: 10,
  higherOrderExpectationPct: 20,
  interpretation:
    "This paper provides strong evidence for conceptual understanding, but application readiness is under-tested. Application-related findings should therefore be interpreted with greater caution.",
};

// ============================================================
// §5.3 (2) Standard Performance Snapshot — ✅ shape matches
// GET /reports/cohort/{assessment_id} band_counts/band_pct
// ============================================================

export const standardPerformance = {
  basedOn: "Unit Test 2",
  bands: [
    { label: "Full mastery of tested Board marks", students: 18, filterKey: "full" },
    { label: "80%+ attainment", students: 62, filterKey: "80plus" },
    { label: "60–80% attainment", students: 96, filterKey: "60to80" },
    { label: "Below 60%", students: 64, filterKey: "below60" },
  ],
};

// ============================================================
// §5.3 (3) Subject Board Conversion Intelligence — ✅ shape matches
// GET /reports/cohort/{assessment_id} subject_bars
// ============================================================

export const subjectConversion = [
  { subject: "Mathematics", marksTested: 17, avgAttainment: 12.4, fullMarksCount: 12, eightyPlusCount: 74, belowExpectedCount: 154, atExpectedLevelPct: 36 },
  { subject: "Physics", marksTested: 10, avgAttainment: 7.1, fullMarksCount: 9, eightyPlusCount: 58, belowExpectedCount: 130, atExpectedLevelPct: 42 },
  { subject: "Chemistry", marksTested: 10, avgAttainment: 8.2, fullMarksCount: 14, eightyPlusCount: 71, belowExpectedCount: 101, atExpectedLevelPct: 58 },
  { subject: "English", marksTested: 15, avgAttainment: 12.6, fullMarksCount: 22, eightyPlusCount: 96, belowExpectedCount: 70, atExpectedLevelPct: 71 },
  { subject: "Social Science", marksTested: 20, avgAttainment: 16.8, fullMarksCount: 19, eightyPlusCount: 88, belowExpectedCount: 77, atExpectedLevelPct: 68 },
];

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
// §5.3 (6) Student Potential Ladder — 🔧 BACKEND REQUIRED (Index #4)
// ============================================================

export const potentialLadder = {
  potentialLabel: "17 / 17 Potential",
  atPotential: 12,
  within1Mark: 28,
  within2Marks: 41,
  mostCommonBlocker: "Quadratic Equations — Application",
};

// ============================================================
// §5.3 (7) Performance Band Opportunity — 🔧 BACKEND REQUIRED (Index #4)
// Includes the required "no dominant common blocker" state.
// ============================================================

export const performanceBandOpportunity = [
  { band: "Full mastery", students: 18, nearNextBand: null, commonBlocker: null },
  { band: "80%+ attainment", students: 62, nearNextBand: 14, commonBlocker: "Quadratics Application" },
  { band: "60–80% attainment", students: 96, nearNextBand: 22, commonBlocker: null }, // "No dominant common blocker"
  { band: "Below 60%", students: 64, nearNextBand: 9, commonBlocker: "Algebra foundations" },
];

// ============================================================
// §5.3 (8) Risk Intelligence
// ============================================================

export const riskIntelligence = {
  highPotentialGap: {
    students: 34,
    performance: "Close to next attainment band",
    commonPattern: "Students know the concept but lose application marks",
    topBlockers: ["Mathematics Application", "Physics Numericals"],
    confidence: "HIGH" as Confidence,
  },
  highAcademicRisk: {
    students: 28,
    performance: "Repeated loss across tested areas",
    commonGaps: ["Algebra foundations", "Physics application", "Chemistry reasoning"],
    confidence: "MEDIUM" as Confidence,
  },
};

// ============================================================
// §5.3 (9) Subject Anomaly Intelligence — 🔧 pattern labels are
// BACKEND REQUIRED (Index #6); % affected / confidence are real shapes.
// ============================================================

export const subjectAnomalies = [
  { subject: "Physics", topic: "Electricity", pattern: "Application failure", pctAffected: 62, confidence: "HIGH" as Confidence },
  { subject: "Chemistry", topic: "Acids & Bases", pattern: "Concept gap", pctAffected: 54, confidence: "HIGH" as Confidence },
  { subject: "Mathematics", topic: "Quadratics", pattern: "Problem solving", pctAffected: 48, confidence: "MEDIUM" as Confidence },
  { subject: "Physics", topic: "Light", pattern: "Loss spread across topic", pctAffected: 35, confidence: "HIGH" as Confidence },
];

// ============================================================
// §5.3 (10) Section Comparison
// ============================================================

export const sectionComparison = [
  { section: "X-A", students: 48, overallAttainment: 81, highPriorityFindings: 1, attention: "Low" },
  { section: "X-B", students: 48, overallAttainment: 74, highPriorityFindings: 3, attention: "Medium" },
  { section: "X-C", students: 48, overallAttainment: 78, highPriorityFindings: 2, attention: "Medium" },
  { section: "X-D", students: 48, overallAttainment: 68, highPriorityFindings: 5, attention: "High" },
  { section: "X-E", students: 48, overallAttainment: 76, highPriorityFindings: 3, attention: "Medium" },
];

export const sectionComparisonInsight = {
  headline: "X-D Requires Attention",
  detail:
    "Electricity Application performance is 31 percentage points below X-A on the same tested competency.",
  confidence: "HIGH" as Confidence,
};

// ============================================================
// §5.3 (11) Recommended Intervention Plan — 🔧 priority ranking/score
// is BACKEND REQUIRED (Index #5); the underlying findings are real.
// ============================================================

export const interventionPlan = [
  { priority: 1, findingId: "find_quadratics", why: "Large number of students affected + meaningful marks exposure + strong Board recurrence + high-confidence evidence." },
  { priority: 2, findingId: "find_electricity", why: "High student impact and strong, consistent Board recurrence." },
  { priority: "investigation_required", findingId: "find_light", why: "Problem confirmed, cause not localized — recommend manual answer-script review before prescribing an intervention." },
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
// §5.6 Student Intelligence table + individual drill-down
// ============================================================

export const studentIntelligenceTable = [
  { rank: 1, name: "Aarav", section: "X-A", attainment: "17/17", marksLost: 0, mainBlocker: "—", attention: "On Track" },
  { rank: 2, name: "Riya", section: "X-C", attainment: "16/17", marksLost: 1, mainBlocker: "Physics", attention: "Watch" },
  { rank: 3, name: "Rahul", section: "X-B", attainment: "12/17", marksLost: 5, mainBlocker: "Maths Application", attention: "Intervention" },
  { rank: 4, name: "Aditi R.", section: "X-A", attainment: "16/17", marksLost: 1, mainBlocker: "—", attention: "On Track" },
  { rank: 5, name: "Divya", section: "X-D", attainment: "10/17", marksLost: 7, mainBlocker: "Electricity Numericals", attention: "Intervention" },
];

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

export const studentReportDetail: Record<string, any> = {
  report_maths_t2: {
    subject: "Mathematics",
    term: "Term 2 Assessment",
    score: "78 / 80",
    trend: "up", // "up" | "down" | "flat" — drives Improve/Achieve/neutral mascot pose
    encouragingLine: "Keep going. You're on the right path.",
    doingWell: ["Recall-based questions", "Basic algebra"],
    workOnNext: ["Quadratic equations — application-style questions"],
  },
  report_science_t1: {
    subject: "Science",
    term: "Term 1 Assessment",
    score: "65 / 80",
    trend: "flat",
    encouragingLine: "Solid foundations — a bit more practice will help.",
    doingWell: ["Diagrams", "Key definitions"],
    workOnNext: ["Numerical questions in Electricity"],
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

// §5.3 filter bar options
export const standardOptions = [{ label: "Class X", selectable: true }, { label: "Class IX", selectable: false }, { label: "Class XII", selectable: false }];

// §5.3 (4) Marks loss — ordering of the finding cards for the overview
export const marksLossFindingIds = ["find_quadratics", "find_electricity", "find_light", "find_carbon"];

// §5.5 finding drawer — extra detail that is only needed in the drawer
export const findingDetail: Record<string, { evidence: string[]; sectionBreakdown: { section: string; pct: number }[]; boardYears: string[]; questionsTested: number }> = {
  find_quadratics: {
    evidence: ["Q7 (3 marks) — 58% partial credit", "Q12 (4 marks) — 41% attempted, 19% full marks", "Concept MCQ Q2 — 87% correct"],
    sectionBreakdown: [{ section: "X-A", pct: 41 }, { section: "X-B", pct: 66 }, { section: "X-C", pct: 55 }, { section: "X-D", pct: 72 }, { section: "X-E", pct: 58 }],
    boardYears: ["2022", "2023", "2024", "2025"],
    questionsTested: 3,
  },
  find_electricity: {
    evidence: ["Q9 (3 marks) — 52% full marks on law statement", "Q9(b) numerical — 23% full marks", "Q15 numerical (5 marks) — avg 2.1"],
    sectionBreakdown: [{ section: "X-A", pct: 38 }, { section: "X-B", pct: 49 }, { section: "X-C", pct: 52 }, { section: "X-D", pct: 69 }, { section: "X-E", pct: 47 }],
    boardYears: ["2023", "2024", "2025"],
    questionsTested: 2,
  },
  find_light: {
    evidence: ["Loss distributed across Q4, Q8, Q11 with no dominant question", "No subtopic exceeds 30% of total loss", "No competency tier explains >25% of loss"],
    sectionBreakdown: [{ section: "X-A", pct: 30 }, { section: "X-B", pct: 36 }, { section: "X-C", pct: 33 }, { section: "X-D", pct: 41 }, { section: "X-E", pct: 35 }],
    boardYears: ["2022", "2024", "2025"],
    questionsTested: 3,
  },
  find_carbon: {
    evidence: ["Q6 reasoning (2 marks) — 61% partial credit"],
    sectionBreakdown: [{ section: "X-A", pct: 22 }, { section: "X-B", pct: 31 }, { section: "X-C", pct: 28 }, { section: "X-D", pct: 35 }, { section: "X-E", pct: 30 }],
    boardYears: ["2024"],
    questionsTested: 1,
  },
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

// §5.9 Papers / §5.10 Enter marks / §5.12 Settings — placeholder page copy
export const placeholderPages = {
  papers: { title: "Question Papers", blurb: "Upload and map assessment papers to the Board blueprint. Paper diagnostics feed the Assessment Diagnostic Quality section of BoardX.", status: "Coming in the next build pass" },
  enterMarks: { title: "Enter Marks", blurb: "Question-wise marks entry for analysed assessments. Teachers can also enter marks from their Subject view.", status: "Coming in the next build pass" },
  settings: { title: "School Settings", blurb: "School profile, academic year, sections and subject configuration.", status: "Coming in the next build pass" },
};

// §5.1 Operations summary — the old flat /admin counts dashboard, demoted out
// of the sidebar and folded into Settings. ✅ these counts exist today.
export const operationsSummary = [
  { label: "Papers stored", value: 14 },
  { label: "Answer scripts stored", value: 1_186 },
  { label: "Reports issued", value: 212 },
  { label: "Reports shared with students", value: 96 },
  { label: "Active staff keys", value: 7 },
];

// §5.6 Student Intelligence filter options. Risk level and intervention status
// are derived in the UI from `attention` / `mainBlocker` for this build —
// 🔧 BACKEND REQUIRED as real per-student fields before wiring.
export const studentFilterOptions = {
  riskLevels: ["All", "High", "Medium", "Low"],
  interventionStatuses: ["All", "Recommended", "Under investigation", "None"],
};
