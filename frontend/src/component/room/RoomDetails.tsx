import React, { useEffect, useState } from "react";
import type { Room } from "@/types/roomTypes";
import type { Step01FormData } from "@/types/guestDataTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearBooking,
  fetchRoomBooking,
} from "@/features/booking/bookingSlice";
import SwitchRoomCollection from "./room_details/SwitchRoomCollection";
import { addOldRoom } from "@/features/switch-rooms/removedRooms";
import { nextStep } from "@/features/onboarding/onboardingSlice";
import { api } from "@/api/axios";
import InvoiceFooter from "../footer/InvoiceFooter";
import SelectedRoomsList from "./room_details/SelectedRoomsList";
import RoomDetailsPanel from "./room_details/RoomDetailsPanel";
import { toast } from "react-toastify";
import { setSelectedRooms } from "@/features/rooms/selectedRoomsSlice";

interface RoomDetailsProps {
  viewedRoom: Room | null;
  selectedRooms: Room[];
  guestDetails: Step01FormData;
  grandTotal: number;
  isModalOpen: boolean;
  onRemoveRoom: (roomId: string) => void;
  onBookRoom: (roomId: string, price: number) => void;
  onCloseModal: () => void;
  readOnly: boolean;
  checkout: boolean;
  invoice: boolean;
  switchRoom: boolean;
  totalDays: number;
  whatsAppId: string;
  loadingBooking?: boolean;
  onInvoiceSuccess?: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  viewedRoom,
  selectedRooms,
  guestDetails,
  grandTotal,
  isModalOpen,
  onRemoveRoom,
  onBookRoom,
  onCloseModal,
  readOnly,
  checkout,
  invoice,
  switchRoom,
  totalDays,
  whatsAppId,
  loadingBooking,
  onInvoiceSuccess,
}) => {
  const invoiceData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const bookingDetails = useSelector((state: RootState) => state.booking);
  const location = useLocation(); // detect route change
  const [removedRooms, setRemovedRooms] = useState<
    { roomNo: string; discountPrice: number; finalRoomTotalPrice: number }[]
  >([]);
  const [daysStayed, setDaysStayed] = useState(0);

  const roomNumbers = useSelector((state: RootState) =>
    state.rooms.roomNumbers.join(", ")
  );

  useEffect(() => {
    if (viewedRoom?.no && !invoice) {
      dispatch(clearBooking());
      dispatch(fetchRoomBooking(viewedRoom.no));
    }
  }, [viewedRoom?.no, dispatch, checkout, location.pathname]);

  // checkout calculations
  useEffect(() => {
    if (!checkout || !viewedRoom) {
      setTotalPrice(0);
      setDiscountAmount(0);
      setTotalBill(0);
      return;
    }

    const total = totalPrice;

    const discount = (total * discountPercent) / 100;
    setTotalPrice(total);
    setDiscountAmount(discount);
    setTotalBill(total - discount);
  }, [
    viewedRoom?._id,
    checkout,
    guestDetails,
    discountPercent,
    setTotalPrice,
    totalPrice,
    setDaysStayed,
    daysStayed,
  ]);

  const invoiceSubTotal = selectedRooms.reduce(
    (sum, room) => sum + invoiceData.lengthOfStay * room.perDayPrice,
    0
  );
  const invoiceDiscount = (invoiceSubTotal * discountPercent) / 100;
  const invoiceFinalBill = invoiceSubTotal - invoiceDiscount;

  useEffect(() => {
    setRemovedRooms([]);
  }, [viewedRoom?.no]);

  const handleRemoveRoom = (removedRoom: {
    roomNo: string;
    discountPrice: number;
    finalRoomTotalPrice: number;
  }) => {
    setRemovedRooms((prev) => [...prev, removedRoom]);
  };

  const handleSwitchRoom = () => {
    if (removedRooms.length === 0) {
      toast.error("No rooms to switch.");
      return;
    }

    // Add rooms to Redux slice
    removedRooms.forEach((room) => dispatch(addOldRoom(room)));

    // Navigate and pass data
    navigate("/onboarding", {
      state: {
        daysStayed,
        oldRooms: removedRooms, // pass the array directly
      },
    });

    dispatch(nextStep());
  };

  useEffect(() => {
    if (selectedRooms.length > 0) {
      const roomNos = selectedRooms.map((room) => room.no).filter(Boolean);
      dispatch(setSelectedRooms(roomNos));
    }
  }, [selectedRooms, dispatch]);

  const handleBookRooms = () => {
    if (selectedRooms.length === 0) return;

    selectedRooms.forEach((room) => {
      if (room._id) {
        onBookRoom(room._id, room.perDayPrice);
      }
    });
  };

  const handleWhatsApp = async () => {
    const message = `This is your room number(s): ${roomNumbers}`;

    try {
      const res = await api.post(`/booking/${whatsAppId}/send-whatsapp`, {
        message,
      });

      if (res.data?.whatsappLink) {
        // Redirect to WhatsApp link
        window.location.href = res.data.whatsappLink;
      }
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error));
      toast.error(errMsg || "Error sending WhatsApp");
    }
  };

  const handleEmail = async () => {
    const message = `This is your room number(s): ${roomNumbers}`;

    try {
      const res = await api.post(`/booking/${whatsAppId}/send-email`, {
        message,
      });
      toast.success("Email sent successfully!");
    } catch (error) {
      const errMsg =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : String(error));
      toast.error(errMsg || "Error sending email");
    } finally {
      onCloseModal();
    }
  };

  return (
    <div className="col-span-1 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden relative">
      <div
        className={`flex-1 p-6 h-[calc(100vh-140px)] overflow-auto ${
          checkout || invoice ? "pb-40" : "pb-40"
        }`}
      >
        {/* Read-only room details */}
        <RoomDetailsPanel
          viewedRoom={viewedRoom}
          readOnly={readOnly}
          checkout={checkout}
          bookingDetails={bookingDetails}
          selectedRooms={selectedRooms}
          onDaysCalculated={(days) => setDaysStayed(days)}
        />

        {/* Selected / Booked Rooms */}
        <SelectedRoomsList
          selectedRooms={selectedRooms}
          checkout={checkout}
          guestDetails={guestDetails}
          invoiceData={invoiceData}
          totalDays={totalDays}
          onRemoveRoom={onRemoveRoom}
        />

        {checkout && viewedRoom?.no && (
          <SwitchRoomCollection
            guestDetails={bookingDetails.roomData}
            onTotalChange={setTotalPrice}
            onRemoveRoom={handleRemoveRoom}
          />
        )}
      </div>

      {/* Footer */}
      <InvoiceFooter
        readOnly={readOnly}
        checkout={checkout}
        switchRoom={switchRoom}
        invoice={invoice}
        totalPrice={totalPrice}
        discountPercent={discountPercent}
        discountAmount={discountAmount}
        totalBill={totalBill}
        invoiceSubTotal={invoiceSubTotal}
        invoiceDiscount={invoiceDiscount}
        invoiceFinalBill={invoiceFinalBill}
        grandTotal={grandTotal}
        isModalOpen={isModalOpen}
        onCloseModal={onCloseModal}
        handleWhatsApp={handleWhatsApp}
        handleEmail={handleEmail}
        setDiscountPercent={setDiscountPercent}
        handleBookRooms={handleBookRooms}
        handleSwitchRoom={handleSwitchRoom}
        selectedRooms={selectedRooms}
        loadingBooking={loadingBooking}
        onInvoiceSuccess={onInvoiceSuccess}
      />
    </div>
  );
};

export default RoomDetails;
