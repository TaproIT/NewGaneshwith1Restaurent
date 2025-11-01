import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QrCodeModal from "../modal/QrCodeModal";
import { api } from "@/api/axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import type { Room } from "@/types/roomTypes";
import { toast } from "react-toastify";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { useNavigate } from "react-router-dom";

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
  loadingBooking?: boolean;
  onInvoiceSuccess?: () => void;
  loading?: boolean;

  // modal
  isModalOpen: boolean;
  onCloseModal: () => void;
  handleWhatsApp: () => void;
  handleEmail: () => void;

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
  handleEmail,
  setDiscountPercent,
  handleBookRooms,
  handleSwitchRoom,
  selectedRooms,
  loadingBooking,
  onInvoiceSuccess,
  loading,
}) => {
  const [loadingBook, setLoadingBook] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  const invoiceData = useSelector(
    (state: RootState) => state.invoice.invoiceFormData
  );
  const navigate = useNavigate();

  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  if (readOnly && !checkout) return null;

  // Helper to convert amounts
  const convertAmount = (amount: number) =>
    convertAndFormatPrice(amount, rates, displayCurrency);

  // Book invoice handler
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
        tax: 0, // add tax if needed
        discount: invoiceDiscount,
        total: invoiceFinalBill,
      };

      await api.post("/invoice", payload);
      toast.success("Invoice generated & rooms booked successfully!");
      if (onInvoiceSuccess) onInvoiceSuccess();
    } catch (error) {
      toast.error("Failed to generate invoice. Please try again later.");
      console.error("Failed to generate invoice:", error);
    } finally {
      setTimeout(() => {
        setLoadingBook(false);
      }, 1500);
    }
  };

  // Switch room handler
  const handleSwitchClick = () => {
    setLoadingSwitch(true);
    setTimeout(() => {
      handleSwitchRoom();
      setLoadingSwitch(false);
    }, 1500);
  };

  return (
    <footer className="border-t px-6 py-3 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
      {invoice && (
        <div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Subtotal</div>
            <div>:</div>
            <div>{convertAmount(checkout ? totalPrice : invoiceSubTotal)}</div>
          </div>
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
            <div>Tax</div>
            <div>:</div>
            <div>{convertAmount(0)}</div>
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
              {convertAmount(checkout ? discountAmount : invoiceDiscount)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap text-sm">
        <div>Total Bill</div>
        <div>:</div>
        <div className="text-left">
          {checkout
            ? convertAmount(totalBill)
            : invoice
            ? convertAmount(invoiceFinalBill)
            : switchRoom
            ? convertAmount(totalPrice)
            : convertAmount(grandTotal)}
        </div>
      </div>

      {/* Modal */}
      <QrCodeModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        loading={loading}
      />

      {invoice && (
        <Button
          className="w-full"
          onClick={handleBookClick}
          disabled={loadingBook}
        >
          {loadingBook ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Generate Invoice"
          )}
        </Button>
      )}

      {!invoice && !checkout && (
        <Button
          className="w-full"
          onClick={handleBookRooms}
          disabled={loadingBooking}
        >
          {loadingBooking ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Book"
          )}
        </Button>
      )}

      {checkout && !switchRoom && <Button className="w-full" onClick={() =>navigate('/checkout-details')}>Checkout</Button>}

      {switchRoom && (
        <Button
          className="w-full"
          onClick={handleSwitchClick}
          disabled={loadingSwitch}
        >
          {loadingSwitch ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Switch Room"
          )}
        </Button>
      )}
    </footer>
  );
};

export default InvoiceFooter;
