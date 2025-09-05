import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/roomTypes";
import React from "react";

interface HeaderBadgeProps {
  viewedRoom: Room;
}

const HeaderBadge: React.FC<HeaderBadgeProps> = ({ viewedRoom }) => {
  // Derive status
  let status = "Empty";
  if (viewedRoom.isMaintenance) {
    status = "Maintenance";
  } else if (viewedRoom.isBooked) {
    status = "Reserved";
  }

  return (
    <div className="flex items-center justify-between text-gray">
      <h2 className="text-lg font-medium">{viewedRoom.no}</h2>
      <Badge
        variant="secondary"
        className={`text-sm text-gray ${
          status === "Reserved"
            ? "bg-quaternary"
            : status === "Empty"
            ? "bg-tertiary"
            : status === "Maintenance"
            ? "bg-quinary"
            : "border-2 border-black bg-tertiary"
        }`}
      >
        {status}
      </Badge>
    </div>
  );
};

export default HeaderBadge;
