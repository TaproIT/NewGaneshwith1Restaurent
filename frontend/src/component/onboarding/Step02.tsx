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
import { useLocation } from "react-router-dom";
import RoomGridSkeleton from "../skeleton/RoomGridSkeleton";

const SOCKET_URL = import.meta.env.SOCKET_URL;

const Step02 = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [whatsAppBookingId, setWhatsAppBookingId] = useState<string>("");
  const dispatch = useDispatch();
  const location = useLocation();
  const daysStayed = location.state?.daysStayed;
  const removedRooms = location.state?.oldRooms
  const [loadingBooking, setLoadingBooking] = useState(false);
const guestDetails = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );
  // const removedRooms = useSelector(
  //   (state: RootState) => state.removedRooms.oldRooms
  // );

  const socketRef = useRef<Socket | null>(null);

  // Fetch all rooms on mount
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
  if (!removedRooms || removedRooms.length === 0) return; // no removed rooms

  const firstRoomNo = removedRooms[0]?.roomNo;

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/booking/active-rooms-with-prices/${firstRoomNo}`);
      setBookingId(res.data.bookingId);
    } catch (err) {
      console.error("Failed to fetch booking:", err);
    }
  };

  // Only fetch if bookingId is empty
  if (!bookingId) {
    fetchBooking();
  }
}, [removedRooms, bookingId]);

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
  const handleBook = async (roomIds: string[]) => {
  if (loadingBooking || roomIds.length === 0) return;
  setLoadingBooking(true);

  try {
    const selectedRoomsData = rooms.filter((room) => roomIds.includes(room._id || ""));

    setRooms((prev) =>
      prev.map((r) =>
        roomIds.includes(r._id || "") ? { ...r, isBooked: true } : r
      )
    );

    selectedRoomsData.forEach((room) => dispatch(addRoom(room.no)));

    const bookingData = {
      ...guestDetails,
      currentRooms: selectedRoomsData.map((r) => r.no),
      bookingDate: new Date().toISOString(),
    };

    if (!bookingId) {
      const booking = await api.post("/booking", bookingData);
      setWhatsAppBookingId(booking.data.bookingId);
    } else {
      const payload = {
        oldRooms: removedRooms,
        newRooms: selectedRoomsData.map((room) => room.no),
      };
      await api.put(`/booking/${bookingId}/switch-rooms`, payload);
    }

    roomIds.forEach((id) => socketRef.current?.emit("unlockRoom", id));

    setSelectedRooms([]);
    setViewedRoom(null);
    toast.success("Rooms booked successfully!");
    setIsModalOpen(true);
  } catch (err) {
    console.error("Failed to book rooms:", err);
    toast.error("Booking failed!");
  } finally {
    setTimeout(() => setLoadingBooking(false), 1500);
  }
};


  const grandTotal = selectedRooms.reduce(
    (sum, room) =>
      sum + (guestDetails.lengthOfStay || daysStayed) * room.perDayPrice,
    0
  );

  const handleCloseModal = () => {
  setIsModalOpen(false); // close the modal

  // Refresh page after a short delay
  setTimeout(() => {
    window.location.reload();
  }, 100); // 100ms delay ensures modal visually closes first
};


  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="col-span-3 h-screen overflow-x-hidden">
        {loadingRooms ? (
          <RoomGridSkeleton />
        ) : (
          <RoomGrid
            rooms={rooms}
            selectedRooms={selectedRooms}
            onRoomClick={handleRoomClick}
            readOnly={false}
          />
        )}
      </div>

      <div className="col-span-1 overflow-hidden">
        <RoomDetails
          viewedRoom={viewedRoom}
          selectedRooms={selectedRooms}
          guestDetails={guestDetails}
          grandTotal={grandTotal}
          isModalOpen={isModalOpen}
          onRemoveRoom={handleRemoveRoom}
          onBookRoom={handleBook}
          onCloseModal={handleCloseModal}
          readOnly={false}
          checkout={false}
          invoice={false}
          switchRoom={false}
          totalDays={daysStayed}
          whatsAppId={whatsAppBookingId}
          loadingBooking={loadingBooking}
        />
      </div>
    </div>
  );
};

export default Step02;
