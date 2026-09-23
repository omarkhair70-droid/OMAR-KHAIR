"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { useExhibition } from "@/components/ExhibitionProvider";
import styles from "./WallOfEyes.module.css";

type EyeSpec = {
  id: string;
  layout: string;
  kind: "eye" | "signal" | "shadow";
  skinA?: string;
  skinB?: string;
  sclera?: string;
  iris?: string;
  irisSize?: string;
  eyeScale?: string;
  eyeY?: string;
  tilt?: string;
  track?: number;
  blinkDelay?: string;
  blinkDuration?: string;
  accent?: string;
  label?: string;
  exitDelay?: string;
};

const PANELS: EyeSpec[] = [
  {
    id: "witness-01",
    layout: "panelA",
    kind: "eye",
    skinA: "#7c3e25",
    skinB: "#e2a158",
    sclera: "#ead6b3",
    iris: "#16120f",
    irisSize: "32%",
    eyeScale: "1.25",
    eyeY: "53%",
    tilt: "-3deg",
    track: 0.95,
    blinkDelay: "-1.7s",
    blinkDuration: "6.8s",
    accent: "#ffbb47",
    exitDelay: "0ms",
  },
  {
    id: "witness-02",
    layout: "panelB",
    kind: "eye",
    skinA: "#2b2420",
    skinB: "#b1683f",
    sclera: "#c8aa83",
    iris: "#090908",
    irisSize: "40%",
    eyeScale: "1.48",
    eyeY: "48%",
    tilt: "5deg",
    track: 0.58,
    blinkDelay: "-4.1s",
    blinkDuration: "9.2s",
    accent: "#ef7a40",
    exitDelay: "80ms",
  },
  {
    id: "witness-03",
    layout: "panelC",
    kind: "eye",
    skinA: "#a9743f",
    skinB: "#e2c78f",
    sclera: "#f2e4c2",
    iris: "#272018",
    irisSize: "26%",
    eyeScale: "1.12",
    eyeY: "51%",
    tilt: "1deg",
    track: 1.1,
    blinkDelay: "-2.8s",
    blinkDuration: "7.7s",
    accent: "#fff1c1",
    exitDelay: "20ms",
  },
  {
    id: "signal-01",
    layout: "panelD",
    kind: "signal",
    accent: "#d51d16",
    label: "SIGNAL / NO SOURCE",
    exitDelay: "110ms",
  },
  {
    id: "signal-02",
    layout: "panelE",
    kind: "signal",
    accent: "#ff2d20",
    label: "FIELD / 02",
    exitDelay: "50ms",
  },
  {
    id: "witness-04",
    layout: "panelF",
    kind: "eye",
    skinA: "#4b241c",
    skinB: "#d4773f",
    sclera: "#f0d4a8",
    iris: "#11100e",
    irisSize: "36%",
    eyeScale: "1.62",
    eyeY: "54%",
    tilt: "-1deg",
    track: 0.76,
    blinkDelay: "-5.4s",
    blinkDuration: "8.4s",
    accent: "#ff9c44",
    exitDelay: "130ms",
  },
  {
    id: "witness-05",
    layout: "panelG",
    kind: "eye",
    skinA: "#8e4936",
    skinB: "#cf8771",
    sclera: "#ead1ba",
    iris: "#251b16",
    irisSize: "30%",
    eyeScale: "1.18",
    eyeY: "49%",
    tilt: "7deg",
    track: 0.42,
    blinkDelay: "-0.9s",
    blinkDuration: "10.1s",
    accent: "#eb5c3c",
    exitDelay: "160ms",
  },
  {
    id: "witness-06",
    layout: "panelH",
    kind: "eye",
    skinA: "#171513",
    skinB: "#7d3527",
    sclera: "#b99174",
    iris: "#080808",
    irisSize: "44%",
    eyeScale: "1.5",
    eyeY: "56%",
    tilt: "-6deg",
    track: 1.15,
    blinkDelay: "-6.1s",
    blinkDuration: "11.3s",
    accent: "#a92e22",
    exitDelay: "90ms",
  },
  {
    id: "witness-07",
    layout: "panelI",
    kind: "eye",
    skinA: "#b27849",
    skinB: "#e4b56c",
    sclera: "#f0d9ad",
    iris: "#13100d",
    irisSize: "29%",
    eyeScale: "1.32",
    eyeY: "48%",
    tilt: "3deg",
    track: 0.9,
    blinkDelay: "-3.4s",
    blinkDuration: "7.1s",
    accent: "#ffc45a",
    exitDelay: "40ms",
  },
  {
    id: "signal-03",
    layout: "panelJ",
    kind: "signal",
    accent: "#aa160f",
    label: "CHANNEL / 00",
    exitDelay: "140ms",
  },
  {
    id: "witness-08",
    layout: "panelK",
    kind: "eye",
    skinA: "#32201a",
    skinB: "#9c5e44",
    sclera: "#d9b890",
    iris: "#0b0a09",
    irisSize: "34%",
    eyeScale: "1.42",
    eyeY: "52%",
    tilt: "-2deg",
    track: 0.66,
    blinkDelay: "-7.2s",
    blinkDuration: "12s",
    accent: "#d57947",
    exitDelay: "70ms",
  },
  {
    id: "shadow-01",
    layout: "panelL",
    kind: "shadow",
    accent: "#e72b1f",
    label: "OFF AIR",
    exitDelay: "180ms",
  },
];

type PanelStyle = CSSProperties & {
  "--skin-a"?: string;
  "--skin-b"?: string;
  "--sclera"?: string;
  "--iris"?: string;
  "--iris-size"?: string;
  "--eye-scale"?: string;
  "--eye-y"?: string;
  "--tilt"?: string;
  "--blink-delay"?: string;
  "--blink-duration"?: string;
  "--accent"?: string;
  "--exit-delay"?: string;
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

function EyePanel({ spec }: { spec: EyeSpec }) {
  const style: PanelStyle = {
    "--skin-a": spec.skinA,
    "--skin-b": spec.skinB,
    "--sclera": spec.sclera,
    "--iris": spec.iris,
    "--iris-size": spec.irisSize,
    "--eye-scale": spec.eyeScale,
    "--eye-y": spec.eyeY,
    "--tilt": spec.tilt,
    "--blink-delay": spec.blinkDelay,
    "--blink-duration": spec.blinkDuration,
    "--accent": spec.accent,
    "--exit-delay": spec.exitDelay,
  };

  if (spec.kind === "signal") {
    return (
      <div
        className={`${styles.panel} ${styles[spec.layout]} ${styles.signalPanel}`}
        style={style}
      >
        <span className={styles.signalBar} />
        <span className={styles.signalBar} />
        <span className={styles.signalBar} />
        <small>{spec.label}</small>
      </div>
    );
  }

  if (spec.kind === "shadow") {
    return (
      <div
        className={`${styles.panel} ${styles[spec.layout]} ${styles.shadowPanel}`}
        style={style}
      >
        <div className={styles.shadowFigure} />
        <small>{spec.label}</small>
      </div>
    );
  }

  return (
    <div
      className={`${styles.panel} ${styles[spec.layout]} ${styles.eyePanel}`}
      style={style}
      data-eye=""
      data-track={spec.track ?? 0.8}
    >
      <div className={styles.eyeStage}>
        <div className={styles.eyeShape}>
          <div className={styles.iris}>
            <span className={styles.pupil} />
            <span className={styles.catchlight} />
          </div>
          <span className={styles.eyeWetline} />
        </div>
        <div className={styles.lidTop} />
        <div className={styles.lidBottom} />
      </div>
      <span className={styles.phosphorBloom} />
    </div>
  );
}

export default function WallOfEyes() {
  const router = useRouter();
  const wallRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const { enterWithSound, enterInSilence } = useExhibition();
  const [entering, setEntering] = useState<"sound" | "silence" | null>(null);

  const centerEyes = useCallback(() => {
    const wall = wallRef.current;
    if (!wall) return;
    wall.querySelectorAll<HTMLElement>("[data-eye]").forEach((eye) => {
      eye.style.setProperty("--eye-x", "0px");
      eye.style.setProperty("--eye-y", "0px");
    });
  }, []);

  const trackEyes = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || entering) return;

    const wall = wallRef.current;
    if (!wall) return;

    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;

    wall.querySelectorAll<HTMLElement>("[data-eye]").forEach((eye) => {
      const strength = Number(eye.dataset.track ?? "0.8");
      eye.style.setProperty("--eye-x", `${x * strength * 13}px`);
      eye.style.setProperty("--eye-y", `${y * strength * 7}px`);
    });
  }, [entering, reducedMotion]);

  const enter = useCallback(async (mode: "sound" | "silence") => {
    if (entering) return;

    setEntering(mode);
    centerEyes();

    if (mode === "sound") {
      await enterWithSound();
    } else {
      await enterInSilence();
    }

    timerRef.current = window.setTimeout(() => {
      router.push("/first-contact");
    }, reducedMotion ? 120 : 980);
  }, [
    centerEyes,
    enterInSilence,
    enterWithSound,
    entering,
    reducedMotion,
    router,
  ]);

  return (
    <main
      className={`${styles.opening} ${entering ? styles.departing : ""}`}
      id="main-content"
      onPointerMove={trackEyes}
      onPointerLeave={centerEyes}
      ref={wallRef}
    >
      <div className={styles.wall} aria-hidden="true">
        {PANELS.map((panel) => <EyePanel key={panel.id} spec={panel} />)}
        <div className={styles.vignette} />
        <div className={styles.scanVeil} />
      </div>

      <div className={styles.identity}>
        <p>EXHIBITION 01 / 2026</p>
        <h1>OMAR KHAIR</h1>
        <span>SELECTED WORKS</span>
      </div>

      <div className={styles.entryControls} aria-label="Enter exhibition">
        <p>THE ROOM IS ALREADY LOOKING.</p>
        <div>
          <button
            type="button"
            disabled={Boolean(entering)}
            onClick={() => void enter("sound")}
          >
            ENTER WITH SOUND
          </button>
          <button
            type="button"
            disabled={Boolean(entering)}
            onClick={() => void enter("silence")}
          >
            ENTER IN SILENCE
          </button>
        </div>
      </div>

      <div className={styles.departureTrace} aria-hidden="true">
        <i />
        <span />
        <i />
      </div>

      <p className={styles.a11yNote}>
        A procedural wall of abstract eyes and broadcast frames forms the exhibition entrance.
      </p>
    </main>
  );
}
