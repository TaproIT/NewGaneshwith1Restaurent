import React from "react";

const StatGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white rounded-2xl shadow animate-pulse flex flex-col gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default StatGridSkeleton;
