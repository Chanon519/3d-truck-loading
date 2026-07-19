import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบบริหารงานขนส่ง | TMS Demo",
  description:
    "Demo ระบบบริหารงานขนส่ง งานตู้คอนเทนเนอร์ Depot Ranking และการวางแผน Optimize",
  icons: {
    icon: "/compattana-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${googleSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-charcoal-ink">{children}</body>
    </html>
  );
}
