import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/roomTypes";
import React from "react";

interface HeaderBadgeProps {
  viewedRoom: Room;
}

const HeaderBadge: React.FC<HeaderBadgeProps> = ({ viewedRoom }) => {
  return (
    <div className="flex items-center justify-between text-gray">
      <h2 className="text-lg font-medium">{viewedRoom.number}</h2>
      <Badge
        variant="secondary"
        className={`text-sm text-gray ${
          viewedRoom.status === "reserved"
            ? "bg-quaternary"
            : viewedRoom.status === "empty"
            ? "bg-tertiary"
            : viewedRoom.status === "maintain"
            ? "bg-quinary"
            : "border-2 border-black bg-tertiary"
        }`}
      >
        {viewedRoom.status.charAt(0).toUpperCase() + viewedRoom.status.slice(1)}
      </Badge>
    </div>
  );
};

export default HeaderBadge;
