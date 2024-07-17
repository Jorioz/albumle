import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localfont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const apple = localfont({
  src: [
    {
      path: "../../public/Apple ][.ttf",
    },
  ],
  variable: "--font-apple",
});

export const metadata: Metadata = {
  title: "albumle",
  description: "the daily album guessing game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className={`Inter ${apple.variable} `}>
      <body>{children}</body>
    </html>
  );
}
