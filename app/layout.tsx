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
  metadataBase: new URL("https://omar-khair.vercel.app"),
  title: {
    default: "Omar Khair — Selected Works",
    template: "%s — Omar Khair"
  },
  description:
    "A browser-based exhibition by Omar Khair in which gaze becomes contact, contact becomes presence, and presence leaves a trace.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Omar Khair — Selected Works",
    description:
      "A browser-based exhibition in which gaze becomes contact, contact becomes presence, and presence leaves a trace.",
    url: "/",
    siteName: "Omar Khair — Selected Works",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
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
