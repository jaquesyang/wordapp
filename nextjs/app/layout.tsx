import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { InitThemeClient } from "@/components/init-theme-client";
import { Layout } from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "单词学习应用",
  description: "英语单词学习应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="green"
          enableSystem={false}
          disableTransitionOnChange
        >
          <InitThemeClient />
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
