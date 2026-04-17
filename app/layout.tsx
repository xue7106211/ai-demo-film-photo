import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Film Diary",
  description: "Pixel-perfect reconstruction of Michelle Liu's film page with placeholder media.",
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
