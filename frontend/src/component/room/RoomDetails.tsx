import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Trash2 } from "lucide-react";
import type { Room } from "@/types/roomTypes";
import QR from "@/assets/Images/qr.webp";
//import { Badge } from "@/components/ui/badge";
import type { Step01FormData } from "@/types/guestDataTypes";
import { mockRooms } from "../onboarding/step02/mockRooms";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import HeaderBadge from "./room_detaila/HeaderBadge";
import GuestDetailsCard from "./room_detaila/GuestDetailsCard";
import RoomsDetailsCard from "./room_detaila/RoomsDetailsCard";

interface RoomDetailsProps {
  viewedRoom: Room | null;
  selectedRooms: Room[];
  guestDetails: Step01FormData;
  grandTotal: number;
  isModalOpen: boolean;
  onRemoveRoom: (roomId: number) => void;
  onBookRoom: (roomId: number, price: number) => void;
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
  const [totalPrice, setTotalPrice] = useState(0);
  const [mockRoomData] = useState<Room[]>(mockRooms);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalBill, setTotalBill] = useState(0);
  const navigate = useNavigate();
  const roomsToRender = React.useMemo(() => {
    if (
      checkout &&
      viewedRoom &&
      guestDetails.bookedRooms.some((r) => r.id === viewedRoom.id)
    ) {
      return guestDetails.bookedRooms
        .map((booked) => {
          const fullRoom = mockRoomData.find((room) => room.id === booked.id);
          if (!fullRoom) return null;
          return {
            ...fullRoom,
            price: booked.price,
          };
        })
        .filter(Boolean);
    }
    return selectedRooms;
  }, [checkout, viewedRoom, guestDetails.bookedRooms, selectedRooms]);

  useEffect(() => {
    if (!checkout || !viewedRoom) {
      setTotalPrice(0);
      setDiscountAmount(0);
      setTotalBill(0);
      return;
    }

    // check if viewedRoom is in guestDetails.bookedRooms
    const roomExists = guestDetails.bookedRooms.some(
      (r) => r.id === viewedRoom.id
    );

    if (!roomExists) {
      setTotalPrice(0);
      setDiscountAmount(0);
      setTotalBill(0);
      return;
    }

    // calculate new total
    const total =
      guestDetails.bookedRooms.reduce((sum, room) => sum + room.price, 0) *
      guestDetails.lengthOfStay;

    // use the new total directly (not old state!)
    const discount = (total * discountPercent) / 100;
    const finalBill = total - discount;

    // update states
    setTotalPrice(total);
    setDiscountAmount(discount);
    setTotalBill(finalBill);
  }, [viewedRoom?.id, checkout, guestDetails, discountPercent]);

  const invoiceSubTotal = selectedRooms.reduce(
    (sum, room) => sum + invoiceData.lengthOfStay * room.price,
    0
  );
  const invoiceDiscount = (invoiceSubTotal * discountPercent) / 100;
  const invoiceFinalBill = invoiceSubTotal - invoiceDiscount;

  return (
    <div className="col-span-1 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden relative">
      <div
        className={`flex-1 p-6 h-[calc(100vh-140px)] overflow-auto ${
          checkout || invoice ? "pb-70" : "pb-40"
        }`}
      >
        {viewedRoom && readOnly ? (
          <>
            {!checkout && (
              <HeaderBadge viewedRoom = {viewedRoom}/>
            )}
            {/* Guest details */}
            {guestDetails.bookedRooms.some(
              (room) => room.id === viewedRoom.id
            ) && (
              <GuestDetailsCard guestDetails={guestDetails} />
            )}

            {/* Room details */}
            {!checkout && (
              <RoomsDetailsCard viewedRoom={viewedRoom} />
            )}

            <div className="absolute bottom-5 left-[25%] text-gray font-medium text-lg">
              <div className="flex justify-center items-center">
                {" "}
                LKR {viewedRoom.price}{" "}
                <span className="px-2 font-normal text-sm"> Per Day</span>
              </div>
            </div>
          </>
        ) : (
          selectedRooms.length <= 0 && (
            <p className="text-gray-500 mb-4">Select a room to view details</p>
          )
        )}

        {/* Selected rooms list */}
        {roomsToRender.length > 0 && (
          <div>
            <ul className="flex flex-col gap-5 mt">
              {roomsToRender.map((room) => {
                if (!room) return null; // safety check
                return (
                  <li
                    key={room.id}
                    className={`border rounded-lg p-3 bg-gray-50 shadow-sm ${
                      checkout && "mt-5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-gray">
                      <h2 className="text-lg font-medium">{room.number}</h2>
                      <div className="text-lg font-medium">
                        LKR {room.price}
                      </div>
                    </div>
                    <div className="text-sm text-right text-gray">Per Day</div>

                    <div className="mt-4 grid grid-cols-3 text-gray text-sm">
                      <div className="col-span-1">Beds</div>
                      <div className="col-span-1">:</div>
                      <div className="col-span-1">{room.beds}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-gray text-sm">
                      <div className="col-span-1">Lockers</div>
                      <div className="col-span-1">:</div>
                      <div className="col-span-1">{room.lockers}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-gray text-sm">
                      <div className="col-span-1">Tables</div>
                      <div className="col-span-1">:</div>
                      <div className="col-span-1">{room.tables}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-gray text-sm">
                      <div className="col-span-1">AC</div>
                      <div className="col-span-1">:</div>
                      <div className="col-span-1">{room.ac ? "Yes" : "No"}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 text-gray text-sm">
                      <div className="col-span-1">TV</div>
                      <div className="col-span-1">:</div>
                      <div className="col-span-1">{room.tv ? "Yes" : "No"}</div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 text-gray">
                      <span className="col-span-1">Total</span>
                      <span className="col-span-1">:</span>
                      <span className="col-span-1">
                        {(guestDetails.lengthOfStay ||
                          invoiceData.lengthOfStay) * room.price}
                      </span>
                    </div>
                    {!checkout && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveRoom(room.id)}
                        >
                          <Trash2 color="red" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      {(!readOnly || checkout) && (
        <div className="border-t px-6 py-3 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
          {(checkout || invoice) && (
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
              {checkout
                ? totalBill
                : invoice
                ? invoiceFinalBill
                : grandTotal.toLocaleString()}
            </div>
          </div>

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
              onClick={() =>
                selectedRooms.forEach((r) => onBookRoom(r.id, r.price))
              }
            >
              Book
            </Button>
          )}

          {checkout && !switchRoom && (
            <Button
              className="w-full"
              // onClick={() =>
              //   selectedRooms.forEach((r) => onBookRoom(r.id, r.price))
              // }
            >
              Checkout
            </Button>
          )}
          {switchRoom && (
            <Button className="w-full" onClick={() => navigate("/onboarding")}>
              Switch Room
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
