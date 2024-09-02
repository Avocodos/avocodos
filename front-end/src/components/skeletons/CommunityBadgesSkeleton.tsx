import { Skeleton } from "../ui/skeleton";

export default function CommunityBadgesSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-foreground/[0.02] dark:bg-card/50">
      <div className="flex flex-col gap-4">
        <div>
          <h5 className="mb-2 inline-flex items-center gap-2">
            <Skeleton className="size-8" />
            <Skeleton className="h-8 w-40" />
          </h5>
          <ul className="space-y-2">
            {[...Array(1)].map((_, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-64" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="size-10" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
