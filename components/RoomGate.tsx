"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { ExhibitionRoom } from "@/lib/rooms";
import { useExhibition } from "./ExhibitionProvider";

export default function RoomGate({ room }: { room: ExhibitionRoom }) {
  const { markVisited } = useExhibition();

  useEffect(() => {
    markVisited(room.slug);
  }, [markVisited, room.slug]);

  return (
    <main className="room-gate" id="main-content">
      <div className="room-gate__content">
        <p className="room-gate__number">{room.number}</p>
        <p className="room-gate__work">{room.work}</p>
        <h1>{room.exhibitionTitle}</h1>
        <p className="room-gate__status">
          ROOM AUTHORSHIP LOCKED / IMPLEMENTATION NOT STARTED
        </p>
        <Link className="room-gate__return" href="/">
          RETURN TO ENTRANCE
        </Link>
      </div>
    </main>
  );
}
