import React from "react";

const RoomDetailsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col mt-4 gap-2 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
        <div className="h-4 w-32 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default RoomDetailsSkeleton;
