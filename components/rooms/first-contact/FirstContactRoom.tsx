"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useExhibition } from "@/components/ExhibitionProvider";
import { createFirstContactSound } from "./FirstContactSound";
import type { FirstContactPhase } from "./types";
import styles from "./FirstContactRoom.module.css";

const FirstContactCanvas = dynamic(() => import("./FirstContactCanvas"), {
  ssr: false,
  loading: () => <div className={styles.canvasFallback} aria-hidden="true" />,
});

const COPY: Record<FirstContactPhase, { index: string; title: string; whisper?: string }> = {
  object: {
    index: "OBJECT / 001",
    title: "OBJECT 001",
    whisper: "TAP / ONLY IF CURIOUS",
  },
  gap: {
    index: "DISTANCE / 01",
    title: "SMALL DISTANCE.",
    whisper: "UNKNOWN MEANING.",
  },
  angle: {
    index: "ANGLE / 02",
    title: "THE THING DIDN'T CHANGE.",
    whisper: "THE ANGLE DID.",
  },
  signal: {
    index: "SIGNAL / 03",
    title: "A SIGNAL CAN EXIST",
    whisper: "WITHOUT ARRIVING.",
  },
  third: {
    index: "BETWEEN / 04",
    title: "SOMETHING THIRD",
    whisper: "BEGINS IN THE GAP.",
  },
  residue: {
    index: "RESIDUE / 05",
    title: "NOT EVERYTHING",
    whisper: "HAS TO CROSS.",
  },
};

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export default function FirstContactRoom() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { soundMode, audioContext, markVisited, setResidue } = useExhibition();

  const [phase, setPhase] = useState<FirstContactPhase>("object");
  const [aligned, setAligned] = useState(false);
  const [signalProgress, setSignalProgress] = useState(0.12);
  const [signalCrossed, setSignalCrossed] = useState(false);
  const [warm, setWarm] = useState(false);
  const [holding, setHolding] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const soundRef = useRef<ReturnType<typeof createFirstContactSound> | null>(null);
  const holdStartRef = useRef(0);
  const progressStartRef = useRef(0.12);
  const leaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    markVisited("first-contact");
  }, [markVisited]);

  useEffect(() => {
    if (soundMode !== "on" || !audioContext) {
      soundRef.current?.dispose();
      soundRef.current = null;
      return;
    }

    const sound = createFirstContactSound(audioContext);
    soundRef.current = sound;
    sound.setPhase(phase);

    return () => {
      sound.dispose();
      if (soundRef.current === sound) soundRef.current = null;
    };
  }, [audioContext, soundMode]);

  useEffect(() => {
    soundRef.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => {
    if (!holding || phase !== "signal" || signalCrossed) return;

    holdStartRef.current = performance.now();
    progressStartRef.current = signalProgress;
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - holdStartRef.current;
      const next = Math.min(1, progressStartRef.current + elapsed / 1250);
      setSignalProgress(next);

      if (next >= 1) {
        setSignalCrossed(true);
        setHolding(false);
        soundRef.current?.accent("signal");
        if (navigator.vibrate) navigator.vibrate([10, 22, 18]);

        window.setTimeout(() => {
          setPhase("third");
          soundRef.current?.accent("third");
        }, reducedMotion ? 120 : 650);
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [holding, phase, reducedMotion, signalCrossed, signalProgress]);

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
  }, []);

  const haptic = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const wake = useCallback(() => {
    soundRef.current?.accent("object");
    haptic(10);
    setPhase("gap");
  }, [haptic]);

  const continueGap = useCallback(() => {
    setPhase("angle");
  }, []);

  const handleAngle = useCallback(() => {
    if (!aligned) {
      setAligned(true);
      soundRef.current?.accent("angle");
      haptic([10, 34, 10]);
      return;
    }
    setPhase("signal");
  }, [aligned, haptic]);

  const startSignal = useCallback(() => {
    if (signalCrossed) return;
    setHolding(true);
  }, [signalCrossed]);

  const stopSignal = useCallback(() => {
    if (signalCrossed) return;
    setHolding(false);
    if (signalProgress < 0.72) {
      soundRef.current?.accent("signal");
    }
  }, [signalCrossed, signalProgress]);

  const keyboardSignal = useCallback(() => {
    if (signalCrossed) return;
    setSignalProgress(1);
    setSignalCrossed(true);
    soundRef.current?.accent("signal");
    haptic([10, 22, 18]);
    window.setTimeout(() => {
      setPhase("third");
      soundRef.current?.accent("third");
    }, reducedMotion ? 120 : 650);
  }, [haptic, reducedMotion, signalCrossed]);

  const touchThird = useCallback(() => {
    if (!warm) {
      setWarm(true);
      soundRef.current?.accent("third");
      haptic(22);
      return;
    }

    setPhase("residue");
    setResidue("first-contact", "warm-seam");
    soundRef.current?.accent("residue");
    setLeaving(true);

    leaveTimerRef.current = window.setTimeout(() => {
      router.push("/seraph");
    }, reducedMotion ? 300 : 1150);
  }, [haptic, reducedMotion, router, setResidue, warm]);

  const copy = COPY[phase];

  const actionLabel =
    phase === "object" ? "TOUCH TO WAKE"
      : phase === "gap" ? "CONTINUE"
        : phase === "angle" ? (aligned ? "CONTINUE" : "CHANGE THE ANGLE")
          : phase === "signal" ? (signalCrossed ? "CROSSED" : "HOLD THE SIGNAL")
            : phase === "third" ? (warm ? "FOLLOW THE SEAM" : "TOUCH THE SPACE BETWEEN")
              : "SERAPH";

  return (
    <main
      className={[
        styles.room,
        styles[`phase_${phase}`],
        warm ? styles.warm : "",
        leaving ? styles.leaving : "",
      ].filter(Boolean).join(" ")}
      id="main-content"
    >
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.canvas}>
        <FirstContactCanvas
          phase={phase}
          aligned={aligned}
          signalProgress={signalProgress}
          signalCrossed={signalCrossed}
          warm={warm}
          reducedMotion={reducedMotion}
        />
      </div>

      <section className={styles.narrative} aria-live="polite">
        <p className={styles.kicker}>{copy.index}</p>
        <h1>{copy.title}</h1>
        {copy.whisper ? <p className={styles.whisper}>{copy.whisper}</p> : null}
      </section>

      {phase === "signal" ? (
        <div className={styles.signalMeter} aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.08, signalProgress)})` }} />
        </div>
      ) : null}

      <div className={styles.interaction}>
        {phase !== "residue" ? (
          <button
            type="button"
            className={styles.action}
            onClick={
              phase === "object" ? wake
                : phase === "gap" ? continueGap
                  : phase === "angle" ? handleAngle
                    : phase === "third" ? touchThird
                      : undefined
            }
            onPointerDown={phase === "signal" ? startSignal : undefined}
            onPointerUp={phase === "signal" ? stopSignal : undefined}
            onPointerCancel={phase === "signal" ? stopSignal : undefined}
            onPointerLeave={phase === "signal" ? stopSignal : undefined}
            onKeyDown={(event) => {
              if (phase === "signal" && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                keyboardSignal();
              }
            }}
            disabled={phase === "signal" && signalCrossed}
          >
            {actionLabel}
          </button>
        ) : (
          <p className={styles.transitionLabel}>THE SEAM CONTINUES.</p>
        )}

        {phase === "signal" && !signalCrossed ? (
          <p className={styles.hint}>release early and it stalls / hold and one signal crosses</p>
        ) : null}
      </div>

      <button
        className={styles.contextToggle}
        type="button"
        onClick={() => setContextOpen((current) => !current)}
        aria-expanded={contextOpen}
      >
        CONTEXT
      </button>

      {contextOpen ? (
        <aside className={styles.contextPanel} aria-label="First Contact context">
          <button type="button" onClick={() => setContextOpen(false)} className={styles.contextClose}>
            CLOSE
          </button>
          <p className={styles.contextEyebrow}>SOURCE WORK / FIRST CONTACT</p>
          <p>
            A physical-digital first-contact protocol built around OBJECT 001, signal,
            reinterpretation, sound, haptics and recipient agency. This exhibition cut removes
            the original neighbour-specific deployment and keeps the relational mechanism.
          </p>
          <p className={styles.contextMeta}>WEB / 3D / SOUND / PHYSICAL OBJECT / NFC</p>
          <a
            href="https://github.com/omarkhair70-droid/FIRST-CONTACT"
            target="_blank"
            rel="noreferrer"
          >
            SOURCE ↗
          </a>
        </aside>
      ) : null}
    </main>
  );
}
