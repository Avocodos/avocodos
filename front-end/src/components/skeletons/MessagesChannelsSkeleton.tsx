import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MessagesChannelsSkeleton() {
  return (
    <div className="mt-4 space-y-4 px-4 lg:px-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-row items-center gap-2">
          <Skeleton className="size-12 min-h-12 min-w-12 rounded-full" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
