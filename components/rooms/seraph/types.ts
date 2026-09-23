export type SeraphPhase =
  | "dormant"
  | "notice"
  | "attune"
  | "strain"
  | "fracture"
  | "aftermath"
  | "reform";

export type SeraphPerformanceSnapshot = {
  phase: SeraphPhase;
  phaseAge: number;
  presence: number;
  movement: number;
  stillness: number;
  recognition: number;
  strain: number;
  fracture: number;
  residue: number;
  attentionX: number;
  attentionY: number;
  calmExitReady: boolean;
  consequenceExitReady: boolean;
};
