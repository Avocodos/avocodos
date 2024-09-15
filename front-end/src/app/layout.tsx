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
import { listenForMessages } from "@/lib/messages";
import { NextUIProvider } from "@nextui-org/react";
import { registerServiceWorker } from "@/registerServiceWorker";

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
  listenForMessages();
  registerServiceWorker();
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3bf019" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Avocodos" />
      </head>
      <body
        className={`${instrumentSans.className} ${instrumentSans.variable}`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />

        <ReactQueryProvider>
          <NextUIProvider>
            <Analytics />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange={false}
            >
              <main className="relative bg-cross">
                {/* <div className="absolute left-0 top-0 -z-[0] h-full w-full bg-background bg-cross"></div> */}
                <div className="fixed left-0 top-0 -z-[1] h-full w-full bg-background bg-gradient-to-b from-background from-50% to-primary/[0.03]"></div>
                {children}
              </main>
              <Toaster />
            </ThemeProvider>
          </NextUIProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
