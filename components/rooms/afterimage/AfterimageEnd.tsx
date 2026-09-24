"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useExhibition } from "@/components/ExhibitionProvider";
import SeraraAfterimageBody, {
  type SeraraExhibitionMemory,
} from "./SeraraAfterimageBody";
import styles from "./AfterimageEnd.module.css";

const FALLBACK_MEMORY: SeraraExhibitionMemory = {
  phase: "aftermath",
  grace: 0.18,
  tension: 0.18,
  fall: 0.72,
  recognition: 0.28,
  stillness: 0.5,
  afterimage: 0.52,
  residue: 0.42,
  heat: 0.34,
  attentionX: 0,
  attentionY: 0,
};

function readMemory(value: string | number | boolean | undefined) {
  if (typeof value !== "string") return FALLBACK_MEMORY;

  try {
    const parsed = JSON.parse(value) as Partial<SeraraExhibitionMemory>;
    return {
      ...FALLBACK_MEMORY,
      ...parsed,
    };
  } catch {
    return FALLBACK_MEMORY;
  }
}

export default function AfterimageEnd() {
  const router = useRouter();
  const { markVisited, clearSession, roomResidues } = useExhibition();
  const [settled, setSettled] = useState(false);
  const inheritedContour = roomResidues.seraph === "body-contour";
  const memory = useMemo(
    () => readMemory(roomResidues["seraph-memory"]),
    [roomResidues],
  );

  useEffect(() => {
    markVisited("afterimage");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = window.setTimeout(
      () => setSettled(true),
      reducedMotion ? 1800 : 8600
    );

    return () => window.clearTimeout(timer);
  }, [markVisited]);

  const reenter = () => {
    clearSession();
    router.push("/");
  };

  const openIndex = () => {
    window.dispatchEvent(new Event("omar:open-index"));
  };

  return (
    <main
      id="main-content"
      className={styles.room}
      data-inherited={inheritedContour ? "seraph" : "direct"}
      data-settled={settled ? "true" : "false"}
      aria-label="Exhibition final trace"
    >
      <div className={styles.blackField} aria-hidden="true">
        <div
          className={styles.residualLight}
          style={{
            opacity: Math.max(
              0.12,
              memory.afterimage * 0.42 + memory.residue * 0.16,
            ),
          }}
        />
        <div className={styles.memoryBody}>
          <SeraraAfterimageBody memory={memory} />
        </div>
        <div className={styles.grain} />
      </div>

      <p className={styles.screenReaderOnly}>
        The body is gone. Its remembered form remains briefly, then the room clears.
      </p>

      {settled ? (
        <section className={styles.endState} aria-label="End of exhibition">
          <div className={styles.identity}>
            <span>OMAR KHAIR</span>
            <strong>SELECTED WORKS / 2026</strong>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={openIndex}>
              INDEX
            </button>
            <button type="button" onClick={reenter}>
              RE-ENTER
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
