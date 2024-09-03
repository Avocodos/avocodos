import { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";

export function generateMetadata(): Metadata {
  return {
    title: "Log In",
    description:
      "Access your Avocodos account - The Web3 Social Platform for Aptos enthusiasts. Connect, share, and learn in the world of blockchain and cryptocurrency.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/login"
    },
    openGraph: {
      title: "Log In to Avocodos",
      description:
        "Access your Avocodos account and continue your Web3 journey on the Aptos blockchain.",
      url: "https://avocodos.com/login",
      siteName: "Avocodos",
      images: ["/api/og?page=login"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Log In to Avocodos",
      description:
        "Access your Avocodos account and continue your Web3 journey on the Aptos blockchain.",
      creator: "@HarjjotSinghh",
      images: ["/api/og?page=login"]
    },
    category: "Web3 Social Platform",
    keywords: [
      "Avocodos",
      "Log In",
      "Sign In",
      "Web3 Social",
      "Aptos Blockchain",
      "Cryptocurrency",
      "Blockchain Community",
      "Decentralized Social Network",
      "Crypto Social Platform",
      "Web3 Account Access",
      "Aptos Ecosystem",
      "Blockchain Social Media",
      "DeFi Community",
      "NFT Social Network",
      "Crypto Enthusiasts",
      "Web3 Networking",
      "Blockchain Education",
      "Aptos Development",
      "Decentralized Identity",
      "Crypto Content Creation"
    ],
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    applicationName: "Avocodos",
    referrer: "origin-when-cross-origin",
    appLinks: {
      web: {
        url: "https://avocodos.com",
        should_fallback: true
      }
    }
  };
}

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#2fbe13" },
      { media: "(prefers-color-scheme: dark)", color: "#3bf019" }
    ]
  };
}

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-background">
        <div className="w-full max-w-lg space-y-10 overflow-y-auto p-4 md:p-16">
          <div className="flex flex-col items-start justify-start space-y-1 text-left">
            <h3 className="text-3xl font-bold capitalize">Welcome back</h3>
            <p className="max-w-[400px] text-pretty text-left text-foreground/80">
              Log in to your Avocodos account and continue your Web3 journey.
            </p>
          </div>
          <div className="h-full space-y-2 overflow-y-scroll md:h-[460px]">
            <LoginForm />
            <Link href="/signup" className="block text-center">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
        <div className="relative hidden w-full md:block">
          <div className="absolute inset-0 z-10 h-full w-full bg-gradient-to-l from-transparent from-60% to-background"></div>
          <Image
            src={"/auth.webp"}
            alt=""
            width={1280}
            height={720}
            draggable={false}
            className="hidden h-screen w-full flex-1 select-none object-cover dark:hidden dark:md:block"
          />
          <Image
            src={"/auth-light.webp"}
            alt=""
            width={1280}
            height={720}
            draggable={false}
            className="hidden h-screen w-full flex-1 select-none object-cover dark:hidden md:block"
          />
        </div>
      </div>
    </main>
  );
}
