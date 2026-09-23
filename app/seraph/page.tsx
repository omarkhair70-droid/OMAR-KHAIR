import type { Metadata } from "next";
import SeraphCanonicalFragment from "@/components/rooms/seraph/SeraphCanonicalFragment";

export const metadata: Metadata = {
  title: "SERAPH — The Body",
  description: "SERAPH / THE BODY presented inside Omar Khair — Selected Works.",
};

export default function SeraphPage() {
  return <SeraphCanonicalFragment />;
}
