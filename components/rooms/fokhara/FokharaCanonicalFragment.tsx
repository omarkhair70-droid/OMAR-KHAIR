"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HomeObjectEntry } from "@/components/source/fokhara/HomeObjectEntry";
import type { Product } from "@/lib/source/fokhara/products";
import { useExhibition } from "@/components/ExhibitionProvider";
import styles from "./FokharaCanonicalFragment.module.css";

const FOKHARA_SOURCE_URL = "https://fokhara.vercel.app";

const nebulaEspresso: Product = {
  id: "nebula-espresso",
  wooId: 4848,
  slug: "nebula-espresso-cup",
  name: "Nebula Espresso Cup",
  priceEgp: 300,
  stock: "in_stock",
  collection: "Nebula",
  collectionSource: "name_prefix",
  form: "espresso",
  accent: "#65677f",
  accentInk: "#f5f2ea",
  sourceUrl: "https://fokharastudioandshop.com/",
  image: {
    src: "/exhibition/fokhara/nebula-espresso-cup.webp",
    alt: "Nebula Espresso Cup by Fokhara"
  }
};

export default function FokharaCanonicalFragment() {
  const router = useRouter();
  const { markVisited, roomResidues, setResidue } = useExhibition();
  const [contextOpen, setContextOpen] = useState(false);
  const [arriving, setArriving] = useState(
    roomResidues["seraph"] === "body-contour",
  );
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    markVisited("fokhara");
  }, [markVisited]);

  useEffect(() => {
    if (!arriving) return;

    timerRef.current = window.setTimeout(() => {
      setArriving(false);
      timerRef.current = null;
    }, 760);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [arriving]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const leave = () => {
    if (leaving) return;

    setResidue("fokhara", "nebula-material-points");
    setLeaving(true);

    timerRef.current = window.setTimeout(() => {
      router.push("/habba");
    }, 820);
  };

  return (
    <main
      id="main-content"
      className={[
        styles.room,
        arriving ? styles.arriving : "",
        leaving ? styles.leaving : "",
      ].filter(Boolean).join(" ")}
    >
      <div className={styles.source} data-fokhara-source>
        <HomeObjectEntry product={nebulaEspresso} />
      </div>

      <div className={styles.roomLabel}>
        <span>FOKHARA</span>
        <strong>THE FORM REMEMBERS</strong>
      </div>

      <div className={styles.actions}>
        <a href={FOKHARA_SOURCE_URL} target="_blank" rel="noreferrer">
          OPEN FULL WORK ↗
        </a>
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
        <aside className={styles.contextPanel} aria-label="Fokhara context">
          <button
            type="button"
            className={styles.close}
            onClick={() => setContextOpen(false)}
          >
            CLOSE
          </button>

          <p className={styles.eyebrow}>SOURCE WORK / FOKHARA</p>
          <h2>THE FORM REMEMBERS</h2>
          <p>
            This room presents the accepted Fokhara Home object-first thesis from
            a pinned production snapshot. The real product image, source material
            state, typography and composition remain Fokhara source work. The
            exhibition owns only the arrival, framing and exit.
          </p>
          <p className={styles.meta}>
            SOURCE SNAPSHOT / F66BBD8C85BB6C4129E7E348EE6124CC56B6C665
          </p>
          <a href={FOKHARA_SOURCE_URL} target="_blank" rel="noreferrer">
            FULL WORK ↗
          </a>
        </aside>
      ) : null}

      <div className={styles.arrivalTrace} aria-hidden="true">
        <span />
        <span />
      </div>

      <div className={styles.exitField} aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <i key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>
    </main>
  );
}
