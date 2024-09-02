import React, { Suspense } from "react";
import CommunityList from "@/components/CommunityList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import CommunitiesPageSkeleton from "@/components/skeletons/CommunitiesPageSkeleton";
import Spinner from "@/components/Spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, User } from "lucide-react";
import JoinedCommunityList from "@/components/JoinedCommunityList";

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<CommunitiesPageSkeleton />}>
      <main className="mt-2 w-full">
        <div className="mb-8 flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h1>Communities</h1>
          <Link href="/communities/create">
            <Button
              variant="default"
              size={"sm"}
              className="inline-flex h-9 items-center justify-center gap-1.5 px-5 py-1.5"
            >
              <PlusCircle className="-mt-0.5 size-4" /> Create A New Community
            </Button>
          </Link>
        </div>
        <Suspense fallback={<Spinner />}>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 rounded-2xl">
              <TabsTrigger
                value="all"
                className="inline-flex flex-row items-center gap-2 rounded-xl"
              >
                <Users className="size-4" /> All Communities
              </TabsTrigger>
              <TabsTrigger
                value="joined"
                className="inline-flex flex-row items-center gap-2 rounded-xl"
              >
                <User className="size-4" /> Joined Communities
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="rounded-2xl">
              <Suspense fallback={<Spinner />}>
                <CommunityList />
              </Suspense>
            </TabsContent>
            <TabsContent value="joined">
              <Suspense fallback={<Spinner />}>
                <JoinedCommunityList />
              </Suspense>
            </TabsContent>
          </Tabs>
        </Suspense>
      </main>
    </Suspense>
  );
}
