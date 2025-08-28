import type { Room } from "@/types/roomTypes";
import React from "react";

interface RoomsDetailsCardProps {
  viewedRoom: Room;
}

const RoomsDetailsCard: React.FC<RoomsDetailsCardProps> = ({ viewedRoom }) => {
  return (
    <div className="flex flex-col mt-4 gap-1">
      <div className="grid grid-cols-3 text-gray">
        <div className="col-span-1">Beds</div>
        <div className="col-span-1">:</div>
        <div className="col-span-1">{viewedRoom.beds}</div>
      </div>
      <div className="grid grid-cols-3 text-gray">
        <div className="col-span-1">Lockers</div>
        <div className="col-span-1">:</div>
        <div className="col-span-1">{viewedRoom.lockers}</div>
      </div>
      <div className="grid grid-cols-3 text-gray">
        <div className="col-span-1">Tables</div>
        <div className="col-span-1">:</div>
        <div className="col-span-1">{viewedRoom.tables}</div>
      </div>
      <div className="grid grid-cols-3 text-gray">
        <div className="col-span-1">AC</div>
        <div className="col-span-1">:</div>
        <div className="col-span-1">{viewedRoom.ac ? "Yes" : "No"}</div>
      </div>
      <div className="grid grid-cols-3 text-gray">
        <div className="col-span-1">TV</div>
        <div className="col-span-1">:</div>
        <div className="col-span-1">{viewedRoom.tv ? "Yes" : "No"}</div>
      </div>
    </div>
  );
};

export default RoomsDetailsCard;
