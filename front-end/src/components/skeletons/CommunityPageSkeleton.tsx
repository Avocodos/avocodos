import { Skeleton } from "../ui/skeleton";

export default function CommunityPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col space-y-4 rounded-2xl bg-foreground/[0.02] dark:bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-16 w-80" /> {/* Community name */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-36 rounded-md" />{" "}
          {/* Leave Community button */}
          <Skeleton className="h-10 w-36 rounded-md" />{" "}
          {/* Moderation Tools button */}
        </div>
      </div>

      {/* Tagline */}
      <Skeleton className="h-5 w-64" />

      {/* Post creation area */}
      <div className="flex items-center space-x-3 rounded-lg p-3">
        <Skeleton className="h-12 w-12 rounded-full" /> {/* User avatar */}
        <Skeleton className="h-7 flex-grow" /> {/* Post input */}
        <Skeleton className="h-10 w-10" /> {/* Image upload icon */}
        <Skeleton className="h-11 w-16 rounded-md" /> {/* Post button */}
      </div>

      {/* Posts */}
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex flex-col space-y-4 rounded-lg p-3">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" /> {/* User avatar */}
            <div className="flex flex-grow flex-col">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-32" /> {/* Username */}
                <Skeleton className="h-6 w-36" />{" "}
                {/* Community Creator badge */}
              </div>
              <Skeleton className="mt-4 h-4 w-20" /> {/* Time ago */}
            </div>
            <Skeleton className="size-8" /> {/* More options */}
          </div>
          <Skeleton className="h-5 w-3/4" /> {/* Post content */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Skeleton className="size-5" /> {/* Like icon */}
              <Skeleton className="h-5 w-10" /> {/* Like count */}
            </div>
            <div className="flex items-center space-x-1">
              <Skeleton className="size-5" /> {/* Comment icon */}
              <Skeleton className="h-5 w-10" /> {/* Comment count */}
            </div>
            <div className="flex-grow"></div>
            <Skeleton className="size-5" /> {/* Bookmark icon */}
          </div>
        </div>
      ))}
    </div>
  );
}
