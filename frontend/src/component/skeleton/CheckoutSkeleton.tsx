import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const CheckoutSkeleton: React.FC = () => {
  return (
    <div className="h-[calc(100vh-140px)] bg-white p-8 overflow-y-auto">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section */}
        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Booking Info Section */}
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />

            {/* Tabs Section */}
            <div className="mt-6 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-mainWhite rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Additional Charges */}
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />

            {/* Total Summary */}
            <div className="mt-6 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>

          {/* Button */}
          <div className="mt-6">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;
