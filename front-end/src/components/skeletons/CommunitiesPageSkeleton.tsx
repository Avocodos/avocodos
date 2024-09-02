import { Skeleton } from "../ui/skeleton";

export function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-foreground/[0.02] p-8 dark:bg-card/50">
      <Skeleton className="mb-4 h-56 w-full" /> {/* Logo placeholder */}
      <Skeleton className="mb-2 h-6 w-3/4" /> {/* Community name */}
      <Skeleton className="mb-4 h-4 w-1/2" /> {/* Tagline */}
      <Skeleton className="mb-4 h-4 w-1/3" /> {/* Creation date */}
      <div className="mb-4 flex justify-start gap-8">
        <div className="flex flex-col items-center">
          <Skeleton className="mb-2 size-12" /> {/* Members count */}
          <Skeleton className="h-5 w-24" /> {/* "Members" text */}
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="mb-2 size-12" /> {/* Posts count */}
          <Skeleton className="h-5 w-24" /> {/* "Posts" text */}
        </div>
      </div>
      <Skeleton className="h-10 w-full" /> {/* View Community button */}
    </div>
  );
}

export default function CommunitiesPageSkeleton() {
  return (
    <div className="mt-2 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {[...Array(5)].map((_, index) => (
          <CommunityCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
