export type ResearchStatus =
  | "VALIDATING"
  | "WAITING_FOR_USER"
  | "PLANNING"
  | "SEARCHING"
  | "SYNTHESIZING"
  | "CRITIC"
  | "COMPLETED"
  | "FAILED"
  | "INTERRUPTED"
  | "DRAFT"
  | "IN_PROGRESS";

export type StageKey =
  | "validating"
  | "clarification"
  | "planning"
  | "searching"
  | "synthesizing"
  | "critic";

export interface StageMessage {
  id: string;
  text: string;
  ts: number;
}

export interface ResearchStage {
  key: StageKey;
  label: string;
  status: "pending" | "active" | "done";
  messages: StageMessage[];
}

export interface Source {
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface Critic {
  overall_score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface Report {
  id: string;
  topic: string;
  title?: string;
  report: string;
  sources: Source[];
  critic_score?: number;
  critic_feedback?: Critic;
  clarification_questions?: string[];
  clarification_answers?: Record<string, string>;
  status: ResearchStatus;
  meta?: Record<string, any>;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  title?: string;
  status: ResearchStatus;
  meta?: Record<string, any>;
  critic_score?: number;
  created_at: string;
}

export type SSEEvent =
  | { event: "start"; message: string; report_id: string }
  | { event: "node_start"; node: string; display: string; message: string }
  | { event: "thinking"; node: string; message: string }
  | { event: "clarification_needed"; questions: string[]; report_id: string }
  | { event: "complete"; report: string; sources: Source[]; sub_questions: string[]; critic_feedback?: Critic; critic_score?: number; report_id: string }
  | { event: "summary"; stats: Record<string, any> }
  | { event: "error"; message: string };

export interface StatusResponse {
  id: string;
  status: ResearchStatus;
  clarification_questions?: string[];
}

export interface ResearchRequest {
  topic: string;
}

export interface ClarificationSubmit {
  answers: Record<string, string>;
}
