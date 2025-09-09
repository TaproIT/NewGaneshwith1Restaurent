import React from "react";

const InventoryItemsSkeleton: React.FC = () => {
  // mimic 6 placeholders
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="grid grid-cols-4 gap-2 pb-4 overflow-y-auto animate-pulse">
      {/* Add button skeleton (still visible even while loading) */}
      <div className="col-span-1 rounded-lg flex justify-center items-center border-2 border-[#CECECE] cursor-pointer">
        <div className="w-6 h-6 bg-gray-300 rounded" />
      </div>

      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="col-span-1 rounded-lg flex flex-col border-2 border-[#CECECE] gap-1 p-1"
        >
          <div className="bg-bg flex flex-col p-2 justify-center items-center gap-2">
            <div className="w-20 h-4 bg-gray-300 rounded" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
          <div className="bg-bg flex gap-5 p-1 justify-center items-center">
            <div className="w-16 h-4 bg-gray-300 rounded" />
            <div className="w-6 h-6 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryItemsSkeleton;
