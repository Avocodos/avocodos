import { Toaster } from "@/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const instrumentSans = Archivo({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-instrument-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    template: "%s | Avocodos",
    default: "Avocodos"
  },
  description: "Completely web3-based social media and learning platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSans.className} ${instrumentSans.variable}`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <ReactQueryProvider>
          <Analytics />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            <main className="relative">
              <div className="absolute left-0 top-0 -z-20 h-full w-full bg-background bg-cross"></div>
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
