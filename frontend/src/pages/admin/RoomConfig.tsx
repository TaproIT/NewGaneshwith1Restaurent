import { api } from '@/api/axios';
import AddRoom from '@/component/admin/AddRoom';
import UpdateRoom from '@/component/admin/UpdateRoom';
import RoomGrid from '@/component/room/RoomGrid'
import RoomGridSkeleton from '@/component/skeleton/RoomGridSkeleton'
import type { Room } from '@/types/roomTypes';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

const RoomConfig: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleAddRoomClick = () => {
    setAddRoomModalOpen(true);
  };

  const handleClosePanel = (refresh?: boolean) => {
    setAddRoomModalOpen(false);
    if (refresh) setRefreshFlag((prev) => !prev);
};

  const location = useLocation(); // detect route change

  useEffect(() => {
    setViewedRoom(null); // reset whenever route changes
  }, [location.pathname]);

  const handleRoomClick = (room: Room) => {
  setViewedRoom((current) =>
    current && current._id === room._id ? null : { ...room }
  );
};


  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/room");
        setRooms(res.data);
      } catch (err) {
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
      <div className="col-span-3 h-full overflow-auto">
        {loadingRooms ? (
          <RoomGridSkeleton />
        ) : (
          <RoomGrid
            rooms={rooms}
            selectedRooms={[]} // no selected rooms needed
            onRoomClick={handleRoomClick} // only for viewing
            readOnly={true}
            onAddRoomClick={handleAddRoomClick}
          />
        )}
      </div>

      {/* Right side: room details */}
      <div className="col-span-1 overflow-hidden">
        {addRoomModalOpen ? <AddRoom onClose={handleClosePanel} /> : viewedRoom ? <UpdateRoom viewedRoom={viewedRoom} onClose={handleClosePanel} /> : <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] flex text-gray-400">
            Select a room or click “+ Add Room”
          </div>}
      </div>
    </div>
  )
}

export default RoomConfig