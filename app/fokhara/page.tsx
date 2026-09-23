import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import FokharaCanonicalFragment from "@/components/rooms/fokhara/FokharaCanonicalFragment";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Fokhara — The Form Remembers",
  description: "Fokhara's canonical object-first Home fragment inside Omar Khair — Selected Works.",
};

export default function FokharaPage() {
  return (
    <div className={instrumentSans.variable}>
      <FokharaCanonicalFragment />
    </div>
  );
}
