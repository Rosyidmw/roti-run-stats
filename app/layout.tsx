import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Roti Run Stats",
  description: "Strava Dashboard for Everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={pjs.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
