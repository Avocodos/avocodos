import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <Skeleton className="h-[300px] w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-9 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 h-20 w-full" />
            <div className="mb-4 flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <Skeleton className="mb-2 h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="mb-2 h-6 w-32" />
            <div className="space-y-2">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="mb-4 h-9 w-24" />
            <Skeleton className="mb-4 h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
