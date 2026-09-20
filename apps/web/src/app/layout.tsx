import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نوبتی | رزرو سالن زیبایی",
  description: "رزرو آنلاین آرایشگاه و سالن زیبایی",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} antialiased`}>{children}</body>
    </html>
  );
}
