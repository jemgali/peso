import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Content area */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          {/* Toolbar skeleton */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Table skeleton */}
          <div className="rounded-md border">
            <div className="border-b bg-muted/50 p-3">
              <div className="flex gap-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-b p-3 last:border-b-0">
                <div className="flex gap-6 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}