import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نوبت‌زیبا | رزرو سالن زیبایی",
  description: "رزرو آنلاین آرایشگاه و سالن زیبایی",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} min-h-screen antialiased`}>
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
