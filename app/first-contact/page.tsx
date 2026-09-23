import type { Metadata } from "next";
import FirstContactRoom from "@/components/rooms/first-contact/FirstContactRoom";

export const metadata: Metadata = {
  title: "First Contact — A Signal Can Exist Without Arriving",
  description: "First Contact exhibition room by Omar Khair.",
};

export default function FirstContactPage() {
  return <FirstContactRoom />;
}
