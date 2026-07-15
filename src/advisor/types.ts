/**
 * Core domain types for the personal AI Advisor multi-agent system.
 *
 * Every agent is a pure module with a single entry point operating on these
 * shared types, so any rule-based agent can later be swapped for an
 * LLM-backed implementation without touching the orchestrator.
 */

/* ------------------------------------------------------------------ */
/* Knowledge Graph                                                     */
/* ------------------------------------------------------------------ */

export type NodeKind = "role" | "task" | "pain" | "tool" | "method" | "skill";

export interface KnowledgeNode {
  id: string;
  kind: NodeKind;
  label: string;
  description?: string;
  /** Free-form tags used for matching (e.g. "writing", "automation"). */
  tags: string[];
}

export type EdgeKind =
  | "performs" // role -> task
  | "suffers" // task -> pain
  | "solves" // tool/method -> pain
  | "requires" // tool/method -> skill
  | "teaches"; // method -> skill

export interface KnowledgeEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  /** 0..1 strength of the relation. */
  weight: number;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
}

/* ------------------------------------------------------------------ */
/* Interview                                                           */
/* ------------------------------------------------------------------ */

export type QuestionType =
  | "single-choice"
  | "multi-choice"
  | "slider"
  | "ranking"
  | "open-text"
  | "file-upload"
  | "audio-note"
  | "screenshot";

/** Profile fields the interview tries to fill. */
export type ProfileField =
  | "selfDescription"
  | "role"
  | "tasks"
  | "pains"
  | "toolsUsed"
  | "aiExperience"
  | "learningStyle"
  | "timeBudget"
  | "goals"
  | "workArtifacts";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  field: ProfileField;
  type: QuestionType;
  /** Natural, conversational phrasing (not a rigid form label). */
  text: string;
  /** Optional follow-up context shown under the question. */
  hint?: string;
  options?: QuestionOption[];
  slider?: { min: number; max: number; step: number; minLabel: string; maxLabel: string };
  /** True when this question was injected to resolve a contradiction. */
  isClarification?: boolean;
}

export interface Answer {
  questionId: string;
  field: ProfileField;
  type: QuestionType;
  /** Selected option ids, slider value, ranking order, free text, or file names. */
  value: string | number | string[];
  answeredAt: number;
  skipped?: boolean;
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

export interface InformationGap {
  field: ProfileField;
  /** 0..1 — how well the field is covered by evidence so far. */
  coverage: number;
  /** Higher = ask about this sooner. */
  priority: number;
  reason: string;
}

export interface Contradiction {
  id: string;
  fields: ProfileField[];
  description: string;
  /** Question ids of the conflicting answers. */
  evidence: string[];
  resolved: boolean;
}

export interface FieldConfidence {
  field: ProfileField;
  /** 0..1 */
  score: number;
  evidenceCount: number;
  notes: string;
}

export interface ConfidenceReport {
  overall: number;
  fields: FieldConfidence[];
}

/* ------------------------------------------------------------------ */
/* Persona                                                             */
/* ------------------------------------------------------------------ */

export type LearningStyle = "video" | "reading" | "hands-on" | "mentored";

export interface PersonaProfile {
  /** The user's own words about what they do (first interview answer). */
  selfDescription: string;
  roleId: string | null;
  roleLabel: string;
  /** Task node ids ranked by time spent (first = most). */
  taskIds: string[];
  painIds: string[];
  toolsUsed: string[];
  /** 0..10 self-reported familiarity with AI tools. */
  aiExperience: number;
  learningStyle: LearningStyle;
  /** Weekly hours available for learning. */
  timeBudgetHours: number;
  goals: string;
  /** Names of uploaded files / screenshots / audio notes. */
  artifacts: string[];
  confidence: ConfidenceReport;
  contradictions: Contradiction[];
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  painId: string;
  taskId: string | null;
  /** 1..5 */
  impact: number;
  /** 1..5, lower = easier. */
  effort: number;
  score: number;
}

export interface Recommendation {
  id: string;
  opportunityId: string;
  kind: "tool" | "skill" | "method";
  nodeId: string;
  title: string;
  rationale: string;
  /** 1..5 priority, 1 = highest. */
  priority: number;
}

export interface Exercise {
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface CurriculumPhase {
  /** 30 | 60 | 90 */
  day: 30 | 60 | 90;
  theme: string;
  items: CurriculumItem[];
  successMetrics: string[];
}

export interface CurriculumItem {
  recommendationId: string;
  title: string;
  activity: string;
  /** Matches the learner's style (video/reading/hands-on/mentored). */
  format: string;
  weeklyHours: number;
  exercises: Exercise[];
}

export interface CurriculumPlan {
  phases: CurriculumPhase[];
  totalWeeklyHours: number;
}

export interface Critique {
  passed: boolean;
  issues: string[];
}

export interface QualityReport {
  passed: boolean;
  issues: string[];
  /** 0..1 aggregate quality score. */
  score: number;
}

export interface AdvisorReport {
  persona: PersonaProfile;
  /** Personal narrative written by the LLM (present only in live-model mode). */
  narrative?: string;
  taskMap: { taskId: string; label: string; painLabels: string[] }[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  curriculum: CurriculumPlan;
  quality: QualityReport;
  criticRounds: number;
  qualityRounds: number;
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

export type AgentName =
  | "research"
  | "interview"
  | "information-gap"
  | "consistency"
  | "confidence"
  | "persona-builder"
  | "opportunity-detector"
  | "recommendation"
  | "curriculum-builder"
  | "critic"
  | "quality";

export interface AgentTrace {
  agent: AgentName;
  summary: string;
  at: number;
}

export type AdvisorPhase = "interviewing" | "synthesizing" | "done";

export interface AdvisorState {
  phase: AdvisorPhase;
  graph: KnowledgeGraph;
  answers: Answer[];
  currentQuestion: Question | null;
  questionCount: number;
  gaps: InformationGap[];
  contradictions: Contradiction[];
  confidence: ConfidenceReport;
  traces: AgentTrace[];
  report: AdvisorReport | null;
}
