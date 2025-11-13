import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import QrCodeModal from "../modal/QrCodeModal";
import type { Room } from "@/types/roomTypes";
import { useCurrency } from "@/context/CurrencyContext";
import { useRates } from "@/context/RateContext";
import { convertAndFormatPrice } from "@/util/priceConverter";
import { useLocation, useNavigate } from "react-router-dom";
import type { BookedRoom } from "@/types/guestDataTypes";

interface InvoiceFooterProps {
  readOnly?: boolean;
  checkout?: boolean;
  switchRoom?: boolean;
  invoice?: boolean;
  selectedRooms: Room[];
  updatedRooms?: BookedRoom[];
  isWhatsappAvailable?: boolean;
  isEmailAvailable?: boolean;
  totalOldRoomsPrice?: number;

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
  loadingBooking,
  loading,
  updatedRooms,
  isEmailAvailable,
  isWhatsappAvailable,
  totalOldRoomsPrice,
}) => {
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  const navigate = useNavigate();

  const { rates } = useRates();
  const { displayCurrency } = useCurrency();

  if (readOnly && !checkout) return null;

  // Helper to convert amounts
  const convertAmount = (amount: number) =>
    convertAndFormatPrice(amount, rates, displayCurrency);

  // Book invoice handler

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

      {/* Old Rooms Bill */}
      {totalOldRoomsPrice && (
        <div className="mt-4 ">
          <div className="grid grid-cols-3 items-center text-gray-700 whitespace-nowrap text-sm font-medium">
            <div>Old Rooms Bill</div>
            <div className="text-center">:</div>
            <div className="text-left font-semibold text-gray-800">
              {checkout ? (
                convertAmount(totalBill)
              ) : invoice ? (
                convertAmount(invoiceFinalBill)
              ) : switchRoom ? (
                convertAmount(totalPrice)
              ) : (
                <div>
                  {updatedRooms?.[0]?.currency === "USD"
                    ? `$ ${totalOldRoomsPrice}`
                    : updatedRooms?.[0]?.currency === "EUR"
                    ? `€ ${totalOldRoomsPrice}`
                    : updatedRooms?.[0]?.currency === "LKR"
                    ? `LKR ${totalOldRoomsPrice}`
                    : totalOldRoomsPrice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Total Bill */}
      {!switchRoom && (
        <div className={`${totalOldRoomsPrice ? "" : "mt-2"}`}>
          <div className="grid grid-cols-3 items-center text-gray-700 whitespace-nowrap text-sm font-medium">
            <div>Total Bill</div>
            <div className="text-center">:</div>
            <div className="text-left font-semibold text-gray-800">
              {checkout ? (
                convertAmount(totalBill)
              ) : invoice ? (
                convertAmount(invoiceFinalBill)
              ) : switchRoom ? (
                convertAmount(totalPrice)
              ) : (
                <div>
                  {updatedRooms?.[0]?.currency === "USD"
                    ? `$ ${grandTotal + (totalOldRoomsPrice || 0)}`
                    : updatedRooms?.[0]?.currency === "EUR"
                    ? `€ ${grandTotal + (totalOldRoomsPrice || 0)}`
                    : updatedRooms?.[0]?.currency === "LKR"
                    ? `LKR ${grandTotal + (totalOldRoomsPrice || 0)}`
                    : grandTotal + (totalOldRoomsPrice || 0)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <QrCodeModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onWhatsApp={handleWhatsApp}
        onEmail={handleEmail}
        loading={loading}
        isWhatsappAvailable={isWhatsappAvailable}
        isEmailAvailable={isEmailAvailable}
      />

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

      {checkout && !switchRoom && (
        <Button
          className="w-full"
          onClick={() => navigate("/checkout-details")}
        >
          Checkout
        </Button>
      )}

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
