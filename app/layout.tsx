import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APEXSYS - AI-Powered Fitness RPG",
  description: "Transform your fitness journey into a calibrated progression system with AI-guided training.",
  keywords: ["fitness", "workout", "rpg", "gamification", "ai trainer", "exercise"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-body antialiased bg-shadow-900 text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
