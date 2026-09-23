"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useExhibition } from "./ExhibitionProvider";

export default function Entrance() {
  const router = useRouter();
  const { enterWithSound, enterInSilence } = useExhibition();
  const [entering, setEntering] = useState<"sound" | "silence" | null>(null);

  const enter = async (mode: "sound" | "silence") => {
    if (entering) return;
    setEntering(mode);

    if (mode === "sound") {
      await enterWithSound();
    } else {
      await enterInSilence();
    }

    router.push("/first-contact");
  };

  return (
    <main className="entrance" id="main-content">
      <div className="entrance__field" aria-hidden="true">
        <span className="entrance__point entrance__point--a" />
        <span className="entrance__point entrance__point--b" />
        <span className="entrance__relation" />
      </div>

      <div className="entrance__content">
        <p className="entrance__index">EXHIBITION 01 / 2026</p>
        <h1>
          <span>OMAR KHAIR</span>
          <em>SELECTED WORKS</em>
        </h1>
        <p className="entrance__descriptor">LIVING EXHIBITION</p>

        <div className="entrance__choices" aria-label="Enter exhibition">
          <button type="button" onClick={() => void enter("sound")} disabled={Boolean(entering)}>
            ENTER WITH SOUND
          </button>
          <button type="button" onClick={() => void enter("silence")} disabled={Boolean(entering)}>
            ENTER IN SILENCE
          </button>
        </div>
      </div>
    </main>
  );
}
