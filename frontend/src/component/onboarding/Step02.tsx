import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

import RoomGrid from "../room/RoomGrid";
import RoomDetails from "../room/RoomDetails";
import type { Room } from "@/types/roomTypes";
import { addRoom } from "@/features/onboarding/onboardingSlice";
import { api } from "@/api/axios";

const SOCKET_URL = "http://localhost:4000";

const Step02 = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);
  const removedRooms = useSelector((state: RootState) => state.removedRooms.oldRooms);
  const dispatch = useDispatch();

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

  // Fetch bookingId when removedRooms changes
  useEffect(() => {
    if (removedRooms.length === 0) return;

    const firstRoomNo = removedRooms[0].roomNo;

    const fetchBooking = async () => {
      try {
        const res = await api.get(`/booking/active-rooms-with-prices/${firstRoomNo}`);
        setBookingId(res.data.bookingId);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      }
    };

    fetchBooking();
  }, [removedRooms]);

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

  const handleRemoveRoom = (roomNo: string) => {
    setSelectedRooms((prev) => prev.filter((r) => r.no !== roomNo));
    if (viewedRoom?.no === roomNo) setViewedRoom(null);
    socketRef.current?.emit("unlockRoom", roomNo);
  };

  // Booking / switch rooms
  const handleBook = async () => {
    if (selectedRooms.length === 0) return;

    try {
      // Update local room state
      setRooms((prev) =>
        prev.map((r) =>
          selectedRooms.some((s) => s.no === r.no) ? { ...r, isBooked: true } : r
        )
      );

      // Update Redux slice
      selectedRooms.forEach((room) => dispatch(addRoom(room.no)));

      // Prepare booking data
      const bookingData = {
        ...guestDetails,
        currentRooms: selectedRooms.map((r) => r.no),
        bookingDate: new Date().toISOString(),
      };

      // Decide whether to create new booking or switch rooms
      if (!bookingId) {
        // New booking
        await api.post("/booking", bookingData);
      } else {
        // Switch rooms
        const payload = {
          oldRooms: removedRooms,
          newRooms: selectedRooms.map((room) => room.no),
        };
        await api.put(`/booking/${bookingId}/switch-rooms`, payload);
      }

      // Emit unlock after booking
      selectedRooms.forEach((r) => socketRef.current?.emit("unlockRoom", r.no));

      setSelectedRooms([]);
      setViewedRoom(null);

      toast.success("Rooms booked successfully!");
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to book rooms:", err);
      toast.error("Booking failed!");
    }
  };

  const grandTotal = selectedRooms.reduce(
    (sum, room) => sum + guestDetails.lengthOfStay * room.perDayPrice,
    0
  );

  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="col-span-3">
        <RoomGrid
          rooms={rooms}
          selectedRooms={selectedRooms}
          onRoomClick={handleRoomClick}
          readOnly={false}
        />
      </div>

      <div className="col-span-1">
        <RoomDetails
          viewedRoom={viewedRoom}
          selectedRooms={selectedRooms}
          guestDetails={guestDetails}
          grandTotal={grandTotal}
          isModalOpen={isModalOpen}
          onRemoveRoom={handleRemoveRoom}
          onBookRoom={handleBook}
          onCloseModal={() => setIsModalOpen(false)}
          readOnly={false}
          checkout={false}
          invoice={false}
          switchRoom={false}
        />
      </div>
    </div>
  );
};

export default Step02;
