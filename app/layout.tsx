import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/hooks/use-toast";
import { AppQueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Sherix Admin Auth",
  description: "Sherix admin authentication setup"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <AppQueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
