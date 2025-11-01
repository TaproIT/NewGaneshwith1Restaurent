// src/components/skeletons/SidebarSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SidebarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col p-4 w-64 h-screen border-r bg-white">
      {/* Header/Profile Section */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-20 w-10 rounded-full" />
        <div className="flex flex-col">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

export default SidebarSkeleton;
