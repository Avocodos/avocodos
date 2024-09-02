import { useQuery } from "@tanstack/react-query";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FollowingFeed from "./FollowingFeed";
import ForYouFeed from "./ForYouFeed";
import kyInstance from "@/lib/ky";
import Spinner from "@/components/Spinner";
import { Course } from "@prisma/client";

export default function SocializeTab() {
  const { data: socializeData, isLoading } = useQuery({
    queryKey: ["socialize"],
    queryFn: async () => {
      const response = await kyInstance.get("/api/courses").json<Course[]>();
      return response;
    },
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Tabs defaultValue="for-you">
      <PostEditor />
      <TabsList className="mb-4 mt-2 rounded-2xl">
        <TabsTrigger value="for-you" className="rounded-xl">
          For you
        </TabsTrigger>
        <TabsTrigger value="following" className="rounded-xl">
          Following
        </TabsTrigger>
      </TabsList>
      <TabsContent value="for-you">
        <ForYouFeed />
      </TabsContent>
      <TabsContent value="following">
        <FollowingFeed />
      </TabsContent>
    </Tabs>
  );
}
