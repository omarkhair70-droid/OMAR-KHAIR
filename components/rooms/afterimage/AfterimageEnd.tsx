"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useExhibition } from "@/components/ExhibitionProvider";
import styles from "./AfterimageEnd.module.css";

export default function AfterimageEnd() {
  const router = useRouter();
  const { markVisited, clearSession, roomResidues } = useExhibition();
  const [settled, setSettled] = useState(false);
  const inheritedContour = roomResidues.seraph === "body-contour";

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
      aria-label="Exhibition final trace"
    >
      <div className={styles.blackField} aria-hidden="true">
        <div className={styles.residualLight} />
        <div className={styles.trace}>
          <span className={styles.outer} />
          <span className={styles.middle} />
          <span className={styles.inner} />
          <i className={styles.coolBurn} />
        </div>
        <div className={styles.grain} />
      </div>

      <p className={styles.screenReaderOnly}>
        The body is gone. Its outline remains briefly, then the room clears.
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
