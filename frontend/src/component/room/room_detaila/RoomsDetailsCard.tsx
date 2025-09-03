import type { Room } from "@/types/roomTypes";
import React from "react";

interface RoomsDetailsCardProps {
  viewedRoom: Room;
}

const RoomsDetailsCard: React.FC<RoomsDetailsCardProps> = ({ viewedRoom }) => {
  return (
    <div className="mt-4 text-sm text-gray">
      <span className="font-medium">Facilities:</span>
      {viewedRoom.facilities?.length > 0 ? (
        <ul className="list-disc list-inside ml-4 mt-1 text-gray text-">
          {viewedRoom.facilities.map((facility, index) => (
            <li key={index}>{facility}</li>
          ))}
        </ul>
      ) : (
        <span className="ml-2">None</span>
      )}
    </div>
  );
};

export default RoomsDetailsCard;
