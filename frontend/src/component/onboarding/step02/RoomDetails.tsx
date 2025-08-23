import React from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Trash2 } from "lucide-react";
import type { Room } from "@/types/roomTypes";
import QR from "@/assets/Images/qr.webp";
import { Badge } from "@/components/ui/badge";
import type { Step01FormData } from "@/types/guestDataTypes";

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
}) => {
  return (
    <div className="col-span-1 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden relative">
      <div className="flex-1 p-6 h-[calc(100vh-140px)] overflow-auto pb-40">
        {viewedRoom && readOnly ? (
          <>
            <div className="flex items-center justify-between text-gray">
              <h2 className="text-lg font-medium">{viewedRoom.number}</h2>
              <Badge
                variant="secondary"
                className={`text-sm text-gray ${
                  viewedRoom.status === "reserved"
                    ? "bg-quaternary"
                    : viewedRoom.status === "empty"
                    ? "bg-tertiary"
                    : viewedRoom.status === "maintain"
                    ? "bg-quinary"
                    : "border-2 border-black bg-tertiary"
                }`}
              >
                {viewedRoom.status.charAt(0).toUpperCase() +
                  viewedRoom.status.slice(1)}
              </Badge>
            </div>
            {/* Guest details */}
            { <div className="flex flex-col mt-4 gap-1">
            <div className="grid grid-cols-5 text-gray">
              <div className="col-span-3">Customer</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{guestDetails.guestName}</div>
            </div>
            <div className="grid grid-cols-5 text-gray">
              <div className="col-span-3">Days of Staying</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{guestDetails.lengthOfStay}</div>
            </div>
            <div className="grid grid-cols-5 text-gray">
              <div className="col-span-3">Checked-In Date</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{guestDetails.checkIn}</div>
            </div>
            <div className="grid grid-cols-5 text-gray">
              <div className="col-span-3">Check Out Date</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{guestDetails.checkOut}</div>
            </div>
            </div>}
            
            {/* Room details */}
            <div className="flex flex-col mt-4 gap-1">
            <div className="grid grid-cols-3 text-gray">
              <div className="col-span-1">Beds</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.beds}</div>
            </div>
            <div className="grid grid-cols-3 text-gray">
              <div className="col-span-1">Lockers</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.lockers}</div>
            </div>
            <div className="grid grid-cols-3 text-gray">
              <div className="col-span-1">Tables</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.tables}</div>
            </div>
            <div className="grid grid-cols-3 text-gray">
              <div className="col-span-1">AC</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.ac ? "Yes" : "No"}</div>
            </div>
            <div className="grid grid-cols-3 text-gray">
              <div className="col-span-1">TV</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.tv ? "Yes" : "No"}</div>
            </div>
            </div>

            <div className="absolute bottom-5 left-[25%] text-gray font-medium text-lg">
                <div className="flex justify-center items-center"> LKR {viewedRoom.price} <span className="px-2 font-normal text-sm"> Per Day</span></div>
            </div>
          </>
        ) : (
          selectedRooms.length <= 0 && (
            <p className="text-gray-500 mb-4">Select a room to view details</p>
          )
        )}

        {/* Selected rooms list */}
        {selectedRooms.length > 0 && (
          <div>
            <ul className="flex flex-col gap-5">
              {selectedRooms.map((room) => (
                <li
                  key={room.id}
                  className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center justify-between text-gray">
                    <h2 className="text-lg font-medium">{room.number}</h2>
                    <div className="text-lg font-medium">LKR {room.price}</div>
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
                      {guestDetails.lengthOfStay * room.price}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRoom(room.id)}
                    >
                      <Trash2 color="red" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      {!readOnly && <div className="border-t p-6 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
        <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap">
          <div>Total Bill</div>
          <div>:</div>
          <div>LKR {grandTotal.toLocaleString()}</div>
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

        <Button
          className="w-full"
          onClick={() =>
            selectedRooms.forEach((r) => onBookRoom(r.id, r.price))
          }
        >
          Book
        </Button>
      </div>}
    </div>
  );
};

export default RoomDetails;
