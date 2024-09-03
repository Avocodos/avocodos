import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const RewardsSkeleton = () => {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, categoryIndex) => (
        <div key={categoryIndex}>
          <Skeleton className="mb-4 h-6 w-48" />
          <div className="space-y-4">
            {[...Array(3)].map((_, rewardIndex) => (
              <div key={rewardIndex} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RewardsSkeleton;
