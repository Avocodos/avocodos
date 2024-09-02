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

export default function Home() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0">
        <Tabs defaultValue="socialize">
          <TabsList className="mb-4 rounded-2xl">
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
              <TabsList className="mb-4 mt-2 rounded-2xl">
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
