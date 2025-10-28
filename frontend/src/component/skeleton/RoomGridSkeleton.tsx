import React from "react";

const RoomGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  );
};

export default RoomGridSkeleton;
