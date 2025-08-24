import type { RootState } from "@/app/store";
import InvoiceForm from "@/component/invoice/InvoiceForm";
import { mockRooms } from "@/component/onboarding/step02/mockRooms";
import RoomDetails from "@/component/onboarding/step02/RoomDetails";
import RoomGrid from "@/component/onboarding/step02/RoomGrid";
import type { Room } from "@/types/roomTypes";
import { useState } from "react";
import { useSelector } from "react-redux";

const Invoice = () => {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const invoiceData = useSelector((state: RootState) => state.invoice.invoiceFormData);

  const guestDetails = useSelector((state: RootState) => state.onboarding.step01Data);

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room);
    if (room.status !== "empty") return;

    setRooms(prev =>
      prev.map(r => r.id === room.id ? { ...r, status: r.status === "selected" ? "empty" : "selected" } : r)
    );

    setSelectedRooms(prev =>
      prev.find(r => r.id === room.id)
        ? prev.filter(r => r.id !== room.id)
        : [...prev, { ...room, status: room.status === "selected" ? "empty" : "selected" }]
    );
  };

  return (
    <div className="grid grid-cols-4 gap-5">
      <div className=" col-span-3">
        <InvoiceForm />
      { invoiceData.lengthOfStay > 0 && <RoomGrid rooms={rooms} selectedRooms={selectedRooms} onRoomClick={handleRoomClick} readOnly={false}/>}
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
      />
      </div>
    </div>
  );
};

export default Invoice;
