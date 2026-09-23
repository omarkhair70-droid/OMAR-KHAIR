import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import ExhibitionShell from "@/components/ExhibitionShell";
import { ExhibitionProvider } from "@/components/ExhibitionProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: {
    default: "Omar Khair — Selected Works",
    template: "%s — Omar Khair"
  },
  description: "Selected works / living exhibition by Omar Khair.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ExhibitionProvider>
          <ExhibitionShell />
          {children}
        </ExhibitionProvider>
      </body>
    </html>
  );
}
