import * as THREE from "three";
import type { SeraphPerformanceSnapshot, SeraphPhase } from "./types";

type Runtime = {
  phase: SeraphPhase;
  phaseStartedAt: number;
  encounterStartedAt: number;
  recognition: number;
  strain: number;
  residue: number;
  aftermathStartedAt: number;
  reformStartedAt: number;
  calmSince: number;
};

type Input = {
  now: number;
  presence: number;
  movement: number;
  touchImpulse: number;
  attentionX: number;
  attentionY: number;
};

const runtime: Runtime = {
  phase: "dormant",
  phaseStartedAt: 0,
  encounterStartedAt: 0,
  recognition: 0,
  strain: 0,
  residue: 0,
  aftermathStartedAt: 0,
  reformStartedAt: 0,
  calmSince: 0,
};

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function damp(current: number, target: number, speed: number, delta: number) {
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function movePhase(next: SeraphPhase, now: number) {
  if (runtime.phase === next) return;
  runtime.phase = next;
  runtime.phaseStartedAt = now;

  if (next === "aftermath") runtime.aftermathStartedAt = now;
  if (next === "reform") runtime.reformStartedAt = now;
}

export function resetSeraphPerformance(now = 0) {
  runtime.phase = "dormant";
  runtime.phaseStartedAt = now;
  runtime.encounterStartedAt = now;
  runtime.recognition = 0;
  runtime.strain = 0;
  runtime.residue = 0;
  runtime.aftermathStartedAt = 0;
  runtime.reformStartedAt = 0;
  runtime.calmSince = 0;
}

export function updateSeraphPerformance(
  input: Input,
  delta: number,
): SeraphPerformanceSnapshot {
  if (runtime.encounterStartedAt === 0) {
    runtime.encounterStartedAt = input.now;
    runtime.phaseStartedAt = input.now;
  }

  const stillness = clamp01(
    1 - input.movement * 1.22 - input.touchImpulse * 0.32,
  );

  const recognitionTarget =
    input.presence > 0.22
      ? clamp01(
          stillness * 0.72 +
            input.presence * 0.33 -
            input.movement * 0.34,
        )
      : 0;

  runtime.recognition = damp(
    runtime.recognition,
    recognitionTarget,
    recognitionTarget > runtime.recognition ? 0.7 : 0.25,
    delta,
  );

  const agitation = clamp01(
    input.movement * 0.72 +
      input.touchImpulse * 0.72 +
      (1 - stillness) * input.presence * 0.24,
  );

  const strainTarget =
    runtime.phase === "aftermath" || runtime.phase === "reform"
      ? 0
      : clamp01(agitation * input.presence * 1.18);

  runtime.strain = clamp01(
    runtime.strain +
      (strainTarget > 0.42 ? delta * (0.09 + strainTarget * 0.17) : -delta * 0.055),
  );

  runtime.residue = damp(
    runtime.residue,
    runtime.phase === "aftermath"
      ? 1
      : runtime.phase === "reform"
        ? 0.48
        : runtime.strain * 0.28,
    runtime.phase === "aftermath" ? 1.7 : 0.34,
    delta,
  );

  const phaseAge = Math.max(0, input.now - runtime.phaseStartedAt);
  const encounterAge = Math.max(0, input.now - runtime.encounterStartedAt);

  if (runtime.phase === "dormant" && encounterAge > 1.1) {
    movePhase("notice", input.now);
  }

  if (runtime.phase === "notice") {
    if (runtime.strain > 0.28) {
      movePhase("strain", input.now);
    } else if (runtime.recognition > 0.42) {
      movePhase("attune", input.now);
    }
  }

  if (runtime.phase === "attune") {
    if (runtime.recognition > 0.56 && stillness > 0.66) {
      if (runtime.calmSince === 0) runtime.calmSince = input.now;
    } else {
      runtime.calmSince = 0;
    }

    if (runtime.strain > 0.36) {
      runtime.calmSince = 0;
      movePhase("strain", input.now);
    } else if (input.presence < 0.1 && runtime.recognition < 0.12) {
      runtime.calmSince = 0;
      movePhase("notice", input.now);
    }
  }

  if (runtime.phase === "strain") {
    runtime.calmSince = 0;

    if (runtime.strain > 0.82 && phaseAge > 1.65) {
      movePhase("fracture", input.now);
      runtime.residue = Math.max(runtime.residue, 0.48);
    } else if (runtime.strain < 0.18 && runtime.recognition > 0.46) {
      movePhase("attune", input.now);
    } else if (runtime.strain < 0.12 && runtime.recognition < 0.25) {
      movePhase("notice", input.now);
    }
  }

  if (runtime.phase === "fracture" && phaseAge > 1.15) {
    movePhase("aftermath", input.now);
    runtime.residue = 1;
  }

  if (runtime.phase === "aftermath" && phaseAge > 3.4) {
    movePhase("reform", input.now);
  }

  if (runtime.phase === "reform" && phaseAge > 4.8) {
    runtime.recognition = Math.max(runtime.recognition, 0.34);
  }

  const currentAge = Math.max(0, input.now - runtime.phaseStartedAt);
  const fracture =
    runtime.phase === "fracture"
      ? THREE.MathUtils.smoothstep(currentAge, 0.05, 0.72)
      : runtime.phase === "aftermath"
        ? 0.8
        : runtime.phase === "reform"
          ? clamp01(1 - currentAge / 3.8) * 0.52
          : 0;

  const calmExitReady =
    runtime.phase === "attune" &&
    runtime.calmSince > 0 &&
    input.now - runtime.calmSince > 3.1;

  const consequenceExitReady =
    runtime.phase === "reform" &&
    currentAge > 3.2;

  return {
    phase: runtime.phase,
    phaseAge: currentAge,
    presence: clamp01(input.presence),
    movement: clamp01(input.movement),
    stillness,
    recognition: clamp01(runtime.recognition),
    strain: clamp01(runtime.strain),
    fracture: clamp01(fracture),
    residue: clamp01(runtime.residue),
    attentionX: THREE.MathUtils.clamp(input.attentionX, -1, 1),
    attentionY: THREE.MathUtils.clamp(input.attentionY, -1, 1),
    calmExitReady,
    consequenceExitReady,
  };
}
