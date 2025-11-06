import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { api } from "@/api/axios";
import type { RootState } from "@/app/store";
import type { Room } from "@/types/roomTypes";
import InvoiceForm from "@/component/invoice/InvoiceForm";
import RoomDetails from "@/component/room/RoomDetails";
import RoomGrid from "@/component/room/RoomGrid";
import RoomGridSkeleton from "@/component/skeleton/RoomGridSkeleton";
import InvoiceList from "@/component/invoice/InvoiceList";

const SOCKET_URL = import.meta.env.SOCKET_URL;

const Invoice = () => {
  const [view, setView] = useState<"create" | "list">("create");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const formRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);

  // Fetch rooms and init socket
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

  // Handlers
  const handleInvoiceSuccess = () => {
    setSelectedRooms([]);
    setViewedRoom(null);
    setIsFormComplete(false);

    selectedRooms.forEach((room) => {
      socketRef.current?.emit("unlockRoom", room.no);
    });

    formRef.current?.resetForm?.();
  };

  const handleRemoveRoom = (roomNo: string) => {
    setSelectedRooms((prev) => prev.filter((r) => r.no !== roomNo));
    if (viewedRoom?.no === roomNo) setViewedRoom(null);
    socketRef.current?.emit("unlockRoom", roomNo);
  };

  const handleRoomClick = (room: Room) => {
    if (room.isBooked || room.isMaintenance) return;

    setViewedRoom(room);
    setSelectedRooms((prev) =>
      prev.find((r) => r.no === room.no)
        ? prev.filter((r) => r.no !== room.no)
        : [...prev, room]
    );

    if (selectedRooms.find((r) => r.no === room.no)) {
      socketRef.current?.emit("unlockRoom", room.no);
    } else {
      socketRef.current?.emit("lockRoom", room.no);
    }
  };

  const handleFormStatus = (status: boolean) => {
    setIsFormComplete(status);
  };

  return (
    <div className={`grid gap-5 ${view === "create" ? "grid-cols-4" : "grid-cols-1"}`}>
      {/* Left side */}
      <div
        className={`${
          view === "create" ? "col-span-3 overflow-auto" : "col-span-1 overflow-hidden"
        } h-[calc(100vh-140px)]`}
      >
        {/* Toggle Buttons */}
        <div className="flex items-center gap-3 mb-5 ml-2">
          <Button
            variant={view === "create" ? "default" : "outline"}
            onClick={() => setView("create")}
          >
            Create Invoice
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            Invoice List
          </Button>
        </div>

        {/* Content */}
        {view === "create" ? (
          <>
            <InvoiceForm onFormStatus={handleFormStatus} ref={formRef} />
            {loadingRooms ? (
              <RoomGridSkeleton />
            ) : (
              isFormComplete && (
                <RoomGrid
                  rooms={rooms}
                  selectedRooms={selectedRooms}
                  onRoomClick={handleRoomClick}
                  readOnly={false}
                />
              )
            )}
          </>
        ) : (
          <InvoiceList />
        )}
      </div>

      {/* Right side (only show when creating invoice) */}
      {view === "create" && (
        <div className="col-span-1 h-screen overflow-hidden">
          <RoomDetails
            viewedRoom={viewedRoom}
            selectedRooms={selectedRooms}
            guestDetails={guestDetails}
            grandTotal={0}
            isModalOpen={false}
            onRemoveRoom={handleRemoveRoom}
            onBookRoom={() => {}}
            onCloseModal={() => {}}
            readOnly={false}
            checkout={false}
            invoice={true}
            switchRoom={false}
            totalDays={0}
            whatsAppId=""
            onInvoiceSuccess={handleInvoiceSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default Invoice;
