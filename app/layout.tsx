import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONJI Internship",
  description:
    "A remote, self-paced AI internship built around real work and verifiable credentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
