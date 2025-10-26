import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QrCodeModal from "../modal/QrCodeModal";
import { api } from "@/api/axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import type { Room } from "@/types/roomTypes";
import { toast } from "react-toastify";
import axios from "axios";

interface InvoiceFooterProps {
  readOnly?: boolean;
  checkout?: boolean;
  switchRoom?: boolean;
  invoice?: boolean;
  selectedRooms: Room[];

  // values
  totalPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalBill: number;
  invoiceSubTotal: number;
  invoiceDiscount: number;
  invoiceFinalBill: number;
  grandTotal: number;

  // modal
  isModalOpen: boolean;
  onCloseModal: () => void;
  handleWhatsApp: () => void;

  // handlers
  setDiscountPercent: (value: number) => void;
  handleBookRooms: () => void;
  handleSwitchRoom: () => void;
}

const InvoiceFooter: React.FC<InvoiceFooterProps> = ({
  readOnly,
  checkout,
  switchRoom,
  invoice,
  totalPrice,
  discountPercent,
  discountAmount,
  totalBill,
  invoiceSubTotal,
  invoiceDiscount,
  invoiceFinalBill,
  grandTotal,
  isModalOpen,
  onCloseModal,
  handleWhatsApp,
  setDiscountPercent,
  handleBookRooms,
  handleSwitchRoom,
  selectedRooms,
}) => {
  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const invoiceData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );

  if (readOnly && !checkout) return null;

  // Wrapper for Book button
  const handleBookClick = async () => {
  setLoadingBook(true);
  try {
    const payload = {
      checkInDate: new Date(invoiceData.checkIn).toISOString(),
      checkOutDate: new Date(invoiceData.checkOut).toISOString(),
      customerName: invoiceData.name,
      numberOfMembers: invoiceData.totalGuests,
      roomIds: selectedRooms.map((room) => room._id),
      subTotal: invoiceSubTotal,
      tax: 0, // or your tax value
      discount: invoiceDiscount,
      total: invoiceFinalBill,
    };

    await api.post("/invoice", payload);
    // await axios.post("http://localhost:4000/api/v1/invoice", payload);
    toast.success("Rooms booked successfully!");
  } catch (error) {
    toast.error("Failed to book rooms.");
    console.error("Failed to book rooms:", error);
  } finally {
    setTimeout(() => {
      handleBookRooms();
      setLoadingBook(false);
    }, 1500);
  }
};


  // Wrapper for Switch Room button
  const handleSwitchClick = () => {
    setLoadingSwitch(true);
    setTimeout(() => {
      handleSwitchRoom();
      setLoadingSwitch(false);
    }, 1500); // simulate 1.5s loading
  };

  return (
    <footer className="border-t px-6 py-3 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
      {invoice && (
        <div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Subtotal</div>
            <div>:</div>
            <div>LKR {checkout ? totalPrice : invoiceSubTotal}</div>
          </div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Tax</div>
            <div>:</div>
            <div>LKR 0</div>
          </div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Discount %</div>
            <div>:</div>
            <input
              type="number"
              value={discountPercent}
              min={0}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="border px-2 rounded w-20 text-right"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Discounts</div>
            <div>:</div>
            <div>
              LKR {checkout ? discountAmount.toLocaleString() : invoiceDiscount}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap">
        <div>Total Bill</div>
        <div>:</div>
        <div>
          LKR{" "}
          {checkout
            ? totalBill
            : invoice
            ? invoiceFinalBill
            : switchRoom
            ? totalPrice
            : grandTotal.toLocaleString()}
        </div>
      </div>

      {/* Modal */}
      <QrCodeModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onWhatsApp={handleWhatsApp}
      />

      {!checkout && (
        <Button className="w-full" onClick={handleBookClick} disabled={loadingBook}>
          {loadingBook ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Book"}
        </Button>
      )}

      {checkout && !switchRoom && <Button className="w-full">Checkout</Button>}

      {switchRoom && (
        <Button className="w-full" onClick={handleSwitchClick} disabled={loadingSwitch}>
          {loadingSwitch ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : "Switch Room"}
        </Button>
      )}
    </footer>
  );
};

export default InvoiceFooter;
