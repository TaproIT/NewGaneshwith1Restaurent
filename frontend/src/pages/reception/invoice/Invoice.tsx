import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { api } from "@/api/axios";
import type { RootState } from "@/app/store";
import type { Room } from "@/types/roomTypes";
import InvoiceForm from "@/component/invoice/InvoiceForm";
import InvoiceList from "@/component/invoice/InvoiceList";

const SOCKET_URL = import.meta.env.SOCKET_URL;

const Invoice = () => {
  const [view, setView] = useState<"create" | "list">("create");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const formRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

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

  return (
    <div className={`grid gap-5`}>
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
            <InvoiceForm />
            {/* {loadingRooms ? (
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
            )} */}
          </>
        ) : (
          <InvoiceList />
        )}
      </div>

      {/* Right side (only show when creating invoice) */}
      {/* {view === "create" && (
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
      )} */}
    </div>
  );
};

export default Invoice;
