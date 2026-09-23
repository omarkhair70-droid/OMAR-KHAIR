"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { exhibitionRooms } from "@/lib/rooms";
import { useExhibition } from "./ExhibitionProvider";

export default function ExhibitionShell() {
  const pathname = usePathname();
  const [indexOpen, setIndexOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { soundMode, toggleSound, visitedRooms } = useExhibition();

  useEffect(() => {
    if (!indexOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIndexOpen(false);
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [indexOpen]);

  const currentSlug = pathname === "/" ? "" : pathname.slice(1).split("/")[0];
  const darkShell = pathname === "/" || pathname.startsWith("/seraph");

  return (
    <>
      <header className={`exhibition-shell${pathname === "/" ? " exhibition-shell--opening" : ""}${darkShell ? " exhibition-shell--dark" : ""}`}>
        <Link href="/" className="exhibition-mark" aria-label="Omar Khair — exhibition entrance">
          OMAR KHAIR
        </Link>

        <div className="exhibition-shell__actions">
          {soundMode !== "undecided" ? (
            <button className="shell-action" type="button" onClick={() => void toggleSound()}>
              SOUND {soundMode === "on" ? "ON" : "OFF"}
            </button>
          ) : null}
          <button className="shell-action" type="button" onClick={() => setIndexOpen(true)}>
            INDEX
          </button>
        </div>
      </header>

      {indexOpen ? (
        <div className="index-layer" role="presentation">
          <div
            className="index-panel"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exhibition-index-title"
          >
            <div className="index-panel__top">
              <div>
                <p className="index-kicker">OMAR KHAIR / 2026</p>
                <h2 id="exhibition-index-title">SELECTED WORKS</h2>
              </div>
              <button className="shell-action" type="button" onClick={() => setIndexOpen(false)}>
                CLOSE
              </button>
            </div>

            <nav className="room-index" aria-label="Exhibition rooms">
              {exhibitionRooms.map((room) => {
                const active = currentSlug === room.slug;
                const visited = visitedRooms.includes(room.slug);
                return (
                  <Link
                    className="room-index__item"
                    href={`/${room.slug}`}
                    key={room.slug}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIndexOpen(false)}
                  >
                    <span className="room-index__number">{room.number}</span>
                    <span className="room-index__work">{room.work}</span>
                    <span className="room-index__title">{room.exhibitionTitle}</span>
                    <span className="room-index__state">
                      {active ? "NOW" : visited ? "SEEN" : ""}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <p className="index-note">
              The index is orientation, not the exhibition. The authored sequence begins at the entrance.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
