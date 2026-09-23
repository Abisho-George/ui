"use client";

import {
  Bot,
  BookOpen,
  Briefcase,
  Camera,
  Code2,
  Drama,
  Dumbbell,
  Gamepad2,
  Headphones,
  HeartHandshake,
  Hourglass,
  Landmark,
  Lightbulb,
  Mic,
  Moon,
  Music,
  NotebookPen,
  Palette,
  PenLine,
  Rocket,
  Stethoscope,
  Sun,
  Sunrise,
  Sunset,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface Option {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const interestOptions: Option[] = [
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "music", label: "Music", icon: Music },
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "art", label: "Art & design", icon: Palette },
  { id: "debate", label: "Debate", icon: Mic },
  { id: "robotics", label: "Robotics", icon: Bot },
  { id: "theatre", label: "Theatre", icon: Drama },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "volunteering", label: "Volunteering", icon: HeartHandshake },
];

export const studyHourOptions: Option[] = [
  { id: "under1", label: "Under 1 hour", icon: Hourglass },
  { id: "1to2", label: "1–2 hours", icon: Hourglass },
  { id: "2to3", label: "2–3 hours", icon: Hourglass },
  { id: "over3", label: "More than 3", icon: Hourglass },
];

export const studyWhenOptions: Option[] = [
  { id: "early", label: "Early morning", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Sunset },
  { id: "night", label: "Late night", icon: Moon },
];

export const learnStyleOptions: Option[] = [
  { id: "video", label: "Watching videos", icon: Video },
  { id: "notes", label: "Reading notes", icon: NotebookPen },
  { id: "practice", label: "Solving problems", icon: PenLine },
  { id: "explain", label: "Explaining it to someone", icon: Users },
  { id: "listen", label: "Listening in class", icon: Headphones },
];

export const afterTenthOptions: Option[] = [
  { id: "engineering", label: "Engineering", icon: Rocket },
  { id: "medicine", label: "Medicine", icon: Stethoscope },
  { id: "commerce", label: "Commerce", icon: Briefcase },
  { id: "design", label: "Design", icon: Palette },
  { id: "civil", label: "Civil services", icon: Landmark },
  { id: "undecided", label: "Not decided yet", icon: Lightbulb },
];

export const supportOptions: Option[] = [
  { id: "practice", label: "More practice papers", icon: PenLine },
  { id: "stepwise", label: "Step-by-step explanations", icon: NotebookPen },
  { id: "doubts", label: "Doubt-clearing time", icon: Mic },
  { id: "timing", label: "Managing time in exams", icon: Hourglass },
  { id: "revision", label: "A revision plan", icon: BookOpen },
  { id: "feedback", label: "Someone checking my answers", icon: Users },
];

export function labelFor(options: Option[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? "";
}

export function labelsFor(options: Option[], ids: string[]): string[] {
  return ids.map((id) => labelFor(options, id)).filter(Boolean);
}
