import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCart",
  description: "Personalized grocery planning built around your goals and your budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
