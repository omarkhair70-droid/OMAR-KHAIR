"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useExhibition } from "@/components/ExhibitionProvider";
import SeraphExperience from "@/components/source/seraph/SeraphExperience";
import styles from "./SeraphCanonicalFragment.module.css";

export default function SeraphCanonicalFragment() {
  const router = useRouter();
  const {
    soundMode,
    markVisited,
    setResidue,
    roomResidues,
  } = useExhibition();

  const [contextOpen, setContextOpen] = useState(false);
  const [arriving, setArriving] = useState(
    roomResidues["first-contact"] === "warm-seam",
  );
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    markVisited("seraph");
  }, [markVisited]);

  useEffect(() => {
    document.documentElement.dataset.exhibitionSound =
      soundMode === "on" ? "on" : "off";

    const eventName =
      soundMode === "on"
        ? "omar:exhibition-sound-on"
        : "omar:exhibition-sound-off";

    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event(eventName));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.exhibitionSound;
    };
  }, [soundMode]);

  useEffect(() => {
    if (!arriving) return;

    timerRef.current = window.setTimeout(() => {
      setArriving(false);
    }, 980);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [arriving]);

  useEffect(() => () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
  }, []);

  const leave = () => {
    if (leaving) return;

    setResidue("seraph", "body-contour");
    setLeaving(true);

    timerRef.current = window.setTimeout(() => {
      router.push("/afterimage");
    }, 900);
  };

  return (
    <div
      id="main-content"
      className={[
        styles.room,
        arriving ? styles.arriving : "",
        leaving ? styles.leaving : "",
      ].filter(Boolean).join(" ")}
    >
      <div className={styles.source} data-seraph-source>
        <SeraphExperience />
      </div>

      <div className={styles.sourceMask} aria-hidden="true" />

      <div className={styles.exhibitionLabel}>
        <span>SERAPH</span>
        <strong>THE BODY</strong>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => setContextOpen((current) => !current)}
          aria-expanded={contextOpen}
        >
          CONTEXT
        </button>
        <button type="button" onClick={leave} disabled={leaving}>
          CONTINUE
        </button>
      </div>

      {contextOpen ? (
        <aside className={styles.contextPanel} aria-label="SERAPH context">
          <button
            type="button"
            className={styles.close}
            onClick={() => setContextOpen(false)}
          >
            CLOSE
          </button>

          <p className={styles.eyebrow}>SOURCE WORK / SERAPH</p>
          <h2>THE BODY</h2>
          <p>
            The canonical SERAPH chamber is shown here from a pinned source
            snapshot. Body, chamber, material, camera perception, performance
            conductor and sound remain SERAPH source work; the exhibition owns
            only the framing, arrival and exit.
          </p>
          <p className={styles.meta}>
            CANONICAL SNAPSHOT / 96ded3ad61cddf0636e05f7f427147cfdeba4798
          </p>
          <a
            href="https://github.com/omarkhair70-droid/seraph"
            target="_blank"
            rel="noreferrer"
          >
            SOURCE ↗
          </a>
        </aside>
      ) : null}

      <div className={styles.arrivalSeam} aria-hidden="true">
        <i />
      </div>

      <div className={styles.exitContour} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
