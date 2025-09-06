import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QrCodeModal from "../modal/QrCodeModal";

interface InvoiceFooterProps {
  readOnly?: boolean;
  checkout?: boolean;
  switchRoom?: boolean;
  invoice?: boolean;

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
}) => {
  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  if (readOnly && !checkout) return null;

  // Wrapper for Book button
  const handleBookClick = () => {
    setLoadingBook(true);
    setTimeout(() => {
      handleBookRooms();
      setLoadingBook(false);
    }, 1500); // simulate 1.5s loading
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
