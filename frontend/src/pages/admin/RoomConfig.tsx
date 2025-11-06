import { api } from "@/api/axios";
import AddRoom from "@/component/admin/AddRoom";
import RoomTypeModal from "@/component/admin/RoomTypeModal";
import UpdateRoom from "@/component/admin/UpdateRoom";
import RoomGrid from "@/component/room/RoomGrid";
import RoomGridSkeleton from "@/component/skeleton/RoomGridSkeleton";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types/roomTypes";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ ADDED

const RoomConfig: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [addRoomTypeModalOpen, setAddRoomTypeModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleAddRoomClick = () => {
    setAddRoomModalOpen(true);
  };

  const handleAddRoomTypeClick = () => {
    setAddRoomTypeModalOpen(true);
  };

  const handleClosePanel = (refresh?: boolean) => {
    setAddRoomModalOpen(false);
    if (refresh) setRefreshFlag((prev) => !prev);
  };

  const location = useLocation();

  useEffect(() => {
    setViewedRoom(null);
  }, [location.pathname]);

  const handleRoomClick = (room: Room) => {
    setViewedRoom((current) =>
      current && current._id === room._id ? null : { ...room }
    );
    setAddRoomModalOpen(false)
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/room");
        setRooms(res.data);
      } catch (err) {
        toast.error("Failed to fetch rooms");
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [refreshFlag]);

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Left side: room grid */}
      <div className="col-span-3 h-full overflow-auto flex flex-col gap-4">
        <Button className="w-50 ml-2" onClick={handleAddRoomTypeClick}>
          Add Room Type
        </Button>

        {loadingRooms ? (
          <RoomGridSkeleton />
        ) : (
          <RoomGrid
            rooms={rooms}
            selectedRooms={[]}
            onRoomClick={handleRoomClick}
            readOnly={true}
            onAddRoomClick={handleAddRoomClick}
            roomConfigMode={true}
          />
        )}
      </div>

      {/* Right side: room details */}
      <div className="col-span-1 overflow-hidden">
        {addRoomModalOpen ? (
          <AddRoom onClose={handleClosePanel} />
        ) : viewedRoom ? (
          <UpdateRoom viewedRoom={viewedRoom} onClose={handleClosePanel} />
        ) : (
          <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] flex text-gray-400">
            Select a room or click “+ Add Room”
          </div>
        )}
      </div>

      {/* Add Room Type Modal */}
      {addRoomTypeModalOpen && (
        <RoomTypeModal
          open={addRoomTypeModalOpen}
          onOpenChange={setAddRoomTypeModalOpen}
          onSubmit={async (data) => {
            try {
              await api.post("/room/room-category", data);
              toast.success("Room Type added successfully");
              setRefreshFlag((prev) => !prev);
            } catch (error: any) {
              toast.error(
                error?.response?.data?.message ||
                  "Failed to add room type"
              );
              console.error(error);
            } finally {
              setAddRoomTypeModalOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default RoomConfig;
