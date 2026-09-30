import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-6 flex gap-3 pt-2">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
