import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Trash2 } from "lucide-react";
import type { Room } from "@/types/roomTypes";
import QR from "@/assets/Images/qr.webp";
//import { Badge } from "@/components/ui/badge";
import type { Step01FormData } from "@/types/guestDataTypes";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderBadge from "./room_detaila/HeaderBadge";
import GuestDetailsCard from "./room_detaila/GuestDetailsCard";
import RoomsDetailsCard from "./room_detaila/RoomsDetailsCard";
import {
  clearBooking,
  fetchRoomBooking,
} from "@/features/booking/bookingSlice";
import SwitchRoomCollection from "./room_detaila/SwitchRoomCollection";
import { addOldRoom } from "@/features/switch-rooms/removedRooms";
import { nextStep } from "@/features/onboarding/onboardingSlice";

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
  

  useEffect(() => {
    if (viewedRoom?.no) {
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

    // const bookedRoom = guestDetails.bookedRooms.find(
    //   (r) => r._id === viewedRoom._id
    // );

    // if (!bookedRoom) {
    //   setTotalPrice(0);
    //   setDiscountAmount(0);
    //   setTotalBill(0);
    //   return;
    // }


    const total = 
    totalPrice

    const discount = (total * discountPercent) / 100;
    setTotalPrice(total);
    setDiscountAmount(discount);
    setTotalBill(total - discount);
  }, [viewedRoom?._id, checkout, guestDetails, discountPercent]);

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
    removedRooms.forEach((room) => {
      dispatch(addOldRoom(room));
    });
    dispatch(nextStep())
    navigate("/onboarding");
  };

  const handleBookRooms = () => {
  if (selectedRooms.length === 0) return;

  selectedRooms.forEach((room) => {
    if (room._id) {
      onBookRoom(room._id, room.perDayPrice);
    }
  });
};

  return (
    <div className="col-span-1 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden relative">
      <div
        className={`flex-1 p-6 h-[calc(100vh-140px)] overflow-auto ${
          checkout || invoice ? "pb-40" : "pb-40"
        }`}
      >
        {/* Read-only room details */}
        {viewedRoom && readOnly ? (
          <>
            {!checkout && <HeaderBadge viewedRoom={viewedRoom} />}

            {bookingDetails && (
              <GuestDetailsCard guestDetails={bookingDetails.roomData} />
            )}

            {!checkout && <RoomsDetailsCard viewedRoom={viewedRoom} />}

            <div className="absolute bottom-5 left-[25%] text-gray font-medium text-lg">
              <div className="flex justify-center items-center">
                LKR {viewedRoom.perDayPrice}
                <span className="px-2 font-normal text-sm">Per Day</span>
              </div>
            </div>
          </>
        ) : (
          selectedRooms.length <= 0 && (
            <p className="text-gray-500 mb-4">Select a room to view details</p>
          )
        )}

        {/* Selected / Booked Rooms */}
        {selectedRooms.length > 0 && (
          <ul className="flex flex-col gap-5 mt">
            {selectedRooms.map((room) => (
              <li
                key={room._id}
                className={`border rounded-lg p-3 bg-gray-50 shadow-sm ${
                  checkout && "mt-5"
                }`}
              >
                <div className="flex items-center justify-between text-gray">
                  <h2 className="text-lg font-medium">Room {room.no}</h2>
                  <div className="text-lg font-medium">
                    LKR {room.perDayPrice}
                  </div>
                </div>
                <div className="text-sm text-right text-gray">Per Day</div>

                {/* Facilities */}
                <div className="mt-4 text-sm text-gray">
                  <span className="font-medium">Facilities:</span>
                  {room.facilities?.length > 0 ? (
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {room.facilities.map((facility, index) => (
                        <li key={index}>{facility}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="ml-2">None</span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 text-gray">
                  <span className="col-span-1">Total</span>
                  <span className="col-span-1">:</span>
                  <span className="col-span-1">
                    {(guestDetails.lengthOfStay || invoiceData.lengthOfStay) *
                      room.perDayPrice}
                  </span>
                </div>

                {!checkout && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRoom(room.no)}
                    >
                      <Trash2 color="red" />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {checkout && viewedRoom?.no  && <SwitchRoomCollection guestDetails={bookingDetails.roomData} onTotalChange={setTotalPrice} onRemoveRoom={handleRemoveRoom}/>}

      </div>

      {/* Footer */}
      {(!readOnly || checkout) && (
        <div className="border-t px-6 py-3 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
          {(invoice) && (
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
                  LKR{" "}
                  {checkout ? discountAmount.toLocaleString() : invoiceDiscount}
                </div>
              </div>
            </div>
          )}
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap">
            <div>Total Bill</div>
            <div>:</div>
            <div>
              LKR{" "}
              {checkout ? totalBill
                : invoice
                ? invoiceFinalBill
                : switchRoom 
                ? totalPrice
                : grandTotal.toLocaleString()}
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white p-6 rounded-lg w-96 relative flex flex-col justify-center">
                <h2 className="text-lg font-bold mb-4 text-center">
                  Send QR Code
                </h2>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onCloseModal}
                  className="absolute top-2 right-2"
                >
                  <CircleX />
                </Button>
                <p className="text-center">
                  How would you like to receive the QR code?
                </p>
                <div className="flex justify-center my-4">
                  <img src={QR} alt="qr" width={100} height={100} />
                </div>
                <div className="flex gap-5 justify-center mb-6">
                  <Button variant="outline" className="w-25">
                    Email
                  </Button>
                  <Button className="w-25">WhatsApp</Button>
                </div>
              </div>
            </div>
          )}

          {!checkout && (
            <Button
              className="w-full"
              onClick={handleBookRooms}
            >
              Book
            </Button>
          )}

          {checkout && !switchRoom && (
            <Button className="w-full">Checkout</Button>
          )}
          {switchRoom && (
            <Button className="w-full" onClick={handleSwitchRoom}>
              Switch Room
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
