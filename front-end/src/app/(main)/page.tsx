import { Suspense } from "react";
import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import LearningTab from "./LearningTab";
import {
  BookOpenText,
  Loader2,
  School,
  Share2,
  Sparkle,
  UserCheck2
} from "lucide-react";
import Spinner from "@/components/Spinner";
import { Metadata, Viewport } from "next";
import { getKeywords } from "@/lib/keywords";

export function generateMetadata(): Metadata {
  return {
    title: "Home",
    description:
      "Welcome to Avocodos - The Web3 Social Platform For Aspiring Developers.",
    authors: [{ name: "Harjot Singh Rana", url: "https://harjot.pro" }],
    creator: "Harjot Singh Rana",
    metadataBase: new URL("https://avocodos.com"),
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: "Home - Avocodos",
      description:
        "Explore the latest posts and connect with others on Avocodos.",
      url: "https://avocodos.com",
      siteName: "Avocodos",
      images: ["/api/og?page=home"],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Home - Avocodos",
      description:
        "Welcome to Avocodos - The Web3 Social Platform For Aspiring Developers.",
      creator: "@HarjjotSinghh",
      images: ["/auth.webp"]
    },
    category: "Web3 Social Platform",
    keywords: getKeywords("home"),
    robots: {
      index: true,
      follow: true,
      nocache: false
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

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0">
        <Tabs defaultValue="socialize">
          <TabsList className="mb-4 rounded-2xl border-2 border-muted">
            <TabsTrigger
              value="socialize"
              className="inline-flex flex-row items-center gap-2 rounded-xl"
            >
              <Share2 className="size-4" /> Socialize
            </TabsTrigger>
            <TabsTrigger
              value="learning"
              className="inline-flex flex-row items-center gap-2 rounded-xl"
            >
              <School className="size-4" /> Learning
            </TabsTrigger>
          </TabsList>
          <TabsContent value="socialize" className="rounded-2xl">
            <Tabs defaultValue="for-you">
              <PostEditor />
              <TabsList className="mb-4 mt-2 rounded-2xl border-2 border-muted">
                <TabsTrigger
                  value="for-you"
                  className="inline-flex flex-row items-center gap-2 rounded-xl"
                >
                  <Sparkle className="size-4" /> For you
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="inline-flex flex-row items-center gap-2 rounded-xl"
                >
                  <UserCheck2 className="size-4" /> Following
                </TabsTrigger>
              </TabsList>
              <TabsContent value="for-you">
                <ForYouFeed />
              </TabsContent>
              <TabsContent value="following">
                <FollowingFeed />
              </TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="learning">
            <Suspense fallback={<Spinner />}>
              <LearningTab />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </main>
  );
}
