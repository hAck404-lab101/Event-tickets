import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tixly | Discover events",
  description: "Discover events, reserve tickets, and pay through secure invoice checkout.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
