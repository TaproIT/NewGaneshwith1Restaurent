import React from "react";

const AddItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-pulse">
      {/* Content */}
      <div className="flex-1 mt-4 flex flex-col gap-4">
        <div className="h-5 w-24 bg-gray-200 rounded"></div>

        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="grid grid-cols-3 text-sm text-gray items-center"
            >
              <div className="col-span-1 h-4 w-20 bg-gray-200 rounded"></div>
              <div className="col-span-1">:</div>
              <div className="col-span-1 h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer fixed at bottom */}
      <div className="border-t p-4 flex flex-col gap-3 bg-white">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default AddItemSkeleton;
