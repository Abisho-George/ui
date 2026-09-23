"use client";

/**
 * The five-item onboarding check — one question per subject, pitched at the
 * start of Class X. It is a levelling exercise, not an exam: nothing here is
 * scored or shown back as a mark, so no answer keys are stored.
 */

export interface DiagnosticQuestion {
  id: string;
  subject: string;
  chapter: string;
  prompt: string;
  options: string[];
  /** Seconds on the clock for this item. */
  seconds: number;
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "q_math",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    prompt: "For the equation x² − 5x + 6 = 0, which pair of values satisfies it?",
    options: ["x = 1 and x = 6", "x = 2 and x = 3", "x = −2 and x = −3", "x = 0 and x = 5"],
    seconds: 45,
  },
  {
    id: "q_phy",
    subject: "Physics",
    chapter: "Electricity",
    prompt: "Two 6 Ω resistors are joined in parallel. What is the resistance of the combination?",
    options: ["12 Ω", "6 Ω", "3 Ω", "0.33 Ω"],
    seconds: 45,
  },
  {
    id: "q_chem",
    subject: "Chemistry",
    chapter: "Chemical Reactions & Equations",
    prompt: "In the reaction Fe₂O₃ + 3CO → 2Fe + 3CO₂, what is happening to the iron oxide?",
    options: ["It is being oxidised", "It is being reduced", "It is acting as a catalyst", "Nothing — it is a spectator"],
    seconds: 45,
  },
  {
    id: "q_eng",
    subject: "English",
    chapter: "Unseen Passage",
    prompt: "\"The village had grown used to the silence of the mill.\" What does this sentence mainly suggest?",
    options: [
      "The mill has been shut for some time",
      "The mill is unusually loud today",
      "The villagers built the mill",
      "The mill is about to reopen",
    ],
    seconds: 45,
  },
  {
    id: "q_sst",
    subject: "Social Science",
    chapter: "Power Sharing & Federalism",
    prompt: "Which of these is the clearest example of vertical power sharing in India?",
    options: [
      "Union, state and local governments",
      "Legislature, executive and judiciary",
      "Two parties forming a coalition",
      "Reserved seats for communities",
    ],
    seconds: 45,
  },
];

export const totalDiagnosticSeconds = diagnosticQuestions.reduce((n, q) => n + q.seconds, 0);
