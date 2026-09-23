import { notFound } from "next/navigation";
import RoomGate from "@/components/RoomGate";
import { exhibitionRooms, getRoom } from "@/lib/rooms";

export function generateStaticParams() {
  return exhibitionRooms.map((room) => ({ room: room.slug }));
}

export default async function RoomPage({
  params
}: {
  params: Promise<{ room: string }>;
}) {
  const { room: slug } = await params;
  const room = getRoom(slug);

  if (!room) notFound();

  return <RoomGate room={room} />;
}
