import { api } from "@/api/axios";
import type { RootState } from "@/app/store";
import InvoiceForm from "@/component/invoice/InvoiceForm";
import RoomDetails from "@/component/room/RoomDetails";
import RoomGrid from "@/component/room/RoomGrid";
import type { Room } from "@/types/roomTypes";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

const Invoice = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);

  const socketRef = useRef<Socket | null>(null);

  // Fetch all rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/room");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();

    // Initialize socket
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("roomLocked", (roomNo: string) => {
      setRooms((prev) =>
        prev.map((r) => (r.no === roomNo ? { ...r, isBooked: true } : r))
      );
    });

    socketRef.current.on("roomUnlocked", (roomNo: string) => {
      setRooms((prev) =>
        prev.map((r) => (r.no === roomNo ? { ...r, isBooked: false } : r))
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Handle selecting/unselecting rooms
  const handleRoomClick = (room: Room) => {
    if (room.isBooked || room.isMaintenance) return;

    setViewedRoom(room);

    setSelectedRooms((prev) =>
      prev.find((r) => r.no === room.no)
        ? prev.filter((r) => r.no !== room.no)
        : [...prev, room]
    );

    // Lock/unlock room via socket
    if (selectedRooms.find((r) => r.no === room.no)) {
      socketRef.current?.emit("unlockRoom", room.no);
    } else {
      socketRef.current?.emit("lockRoom", room.no);
    }
  };


  return (
    <div className="grid grid-cols-4 gap-5">
      <div className=" col-span-3">
        <InvoiceForm />
        { (
          <RoomGrid
            rooms={rooms}
            selectedRooms={selectedRooms}
            onRoomClick={handleRoomClick}
            readOnly={false}
          />
        )}
      </div>

      <div className="col-span-1">
        <RoomDetails
          viewedRoom={viewedRoom}
          selectedRooms={selectedRooms}
          guestDetails={guestDetails}
          grandTotal={0} // not used
          isModalOpen={false} // no modal
          onRemoveRoom={() => {}} // do nothing
          onBookRoom={() => {}} // do nothing
          onCloseModal={() => {}} // do nothing
          readOnly={false}
          checkout={false}
          invoice={true}
          switchRoom={false}
          totalDays={0}
        />
      </div>
    </div>
  );
};

export default Invoice;
