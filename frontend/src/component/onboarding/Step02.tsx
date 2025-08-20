import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { CircleX, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import QR from "../../assets/Images/qr.webp";
import { saveBookedRoom } from "@/features/onboarding/onboardingSlice";

type RoomStatus = "reserved" | "empty" | "maintain" | "selected";

interface Room {
  id: number;
  number: string;
  status: RoomStatus;
  guest?: string; // only if reserved
  price: number;
  beds: number;
  lockers: number;
  tables: number;
  ac: boolean;
  tv: boolean;
}

const Step02 = () => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 1,
      number: "R-01",
      status: "reserved",
      guest: "John Doe",
      price: 5000,
      beds: 2,
      lockers: 1,
      tables: 1,
      ac: true,
      tv: true,
    },
    {
      id: 2,
      number: "R-02",
      status: "empty",
      price: 4500,
      beds: 1,
      lockers: 1,
      tables: 1,
      ac: false,
      tv: true,
    },
    {
      id: 3,
      number: "R-03",
      status: "maintain",
      price: 4000,
      beds: 1,
      lockers: 1,
      tables: 1,
      ac: false,
      tv: false,
    },
    {
      id: 4,
      number: "R-04",
      status: "empty",
      price: 6000,
      beds: 3,
      lockers: 2,
      tables: 2,
      ac: true,
      tv: true,
    },
    {
      id: 5,
      number: "R-05",
      status: "reserved",
      guest: "Alice",
      price: 5500,
      beds: 2,
      lockers: 1,
      tables: 1,
      ac: true,
      tv: false,
    },
    {
      id: 6,
      number: "R-06",
      status: "empty",
      price: 4800,
      beds: 1,
      lockers: 1,
      tables: 1,
      ac: false,
      tv: false,
    },
    {
      id: 7,
      number: "R-07",
      status: "maintain",
      price: 5200,
      beds: 2,
      lockers: 2,
      tables: 1,
      ac: true,
      tv: false,
    },
    {
      id: 8,
      number: "R-08",
      status: "empty",
      price: 4700,
      beds: 1,
      lockers: 1,
      tables: 1,
      ac: false,
      tv: true,
    },
  ]);

  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);
  const guestDetails = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const reservedCount = rooms.filter(
    (room) => room.status === "reserved"
  ).length;
  const emptyCount = rooms.filter((room) => room.status === "empty").length;
  const maintainCount = rooms.filter(
    (room) => room.status === "maintain"
  ).length;
  const selectedCount = rooms.filter(
    (room) => room.status === "selected"
  ).length;

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "reserved":
        return "bg-quaternary text-gray";
      case "empty":
        return "bg-tertiary text-gray";
      case "maintain":
        return "bg-quinary text-gray";
      case "selected":
        return "border-2 border-black bg-tertiary text-gray";
      default:
        return "bg-gray-200";
    }
  };

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room);

    // Reserved & maintain cannot be toggled, only viewed
    if (room.status === "reserved" || room.status === "maintain") return;

    // Toggle selection for empty rooms
    setRooms((prev) =>
      prev.map((r) =>
        r.id === room.id
          ? { ...r, status: r.status === "selected" ? "empty" : "selected" }
          : r
      )
    );

    setSelectedRooms(
      (prev) =>
        prev.find((r) => r.id === room.id)
          ? prev.filter((r) => r.id !== room.id) // unselect
          : [
              ...prev,
              {
                ...room,
                status: room.status === "selected" ? "empty" : "selected",
              },
            ] // add
    );
  };

  const handleRemoveRoom = (roomId: number) => {
    // Remove from selectedRooms
    setSelectedRooms((prev) => prev.filter((room) => room.id !== roomId));

    // Reset the room status back to empty in rooms
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: "empty" } : r))
    );

    // If currently viewed room is removed, clear it
    if (viewedRoom?.id === roomId) {
      setViewedRoom(null);
    }
  };

  const dispatch = useDispatch();

const handleBook = (roomId: number, price: number) => {
  handleOpenModal();

  setRooms((prev) =>
    prev.map((r) => (r.id === roomId ? { ...r, status: "reserved" } : r))
  );

  // Save to Redux
  dispatch(saveBookedRoom({ id: roomId, price }));

  setSelectedRooms([]);
  setViewedRoom(null);
};

  const grandTotal = selectedRooms.reduce(
    (sum, room) => sum + guestDetails.lengthOfStay * room.price,
    0
  );

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Rooms Grid */}
      <div className="col-span-3 p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-auto">
        {/* Legend */}
        <div className="flex justify-end gap-3 mb-3 text-sm">
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-quaternary"></div>
            <span>
              Reserved <span>{reservedCount}</span>
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-tertiary"></div>
            <span>
              Empty <span>{emptyCount}</span>
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full bg-quinary"></div>
            <span>
              Maintenance <span>{maintainCount}</span>
            </span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full border-2 border-black"></div>
            <span>
              Selected <span>{selectedCount}</span>
            </span>
          </div>
        </div>

        {/* Rooms */}
        <div className="grid grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`p-4 rounded-xl text-center h-22 
    ${getStatusColor(room.status)} 
    ${room.status !== "empty" ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => room.status === "empty" && handleRoomClick(room)}
            >
              <p className="font-bold">{room.number}</p>
              {room.status === "reserved" && (
                <p className="text-sm">{room.guest}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Room Details */}
      <div className="col-span-1 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden">
        <div className="flex-1 p-6 h-[calc(100vh-140px)] overflow-auto pb-40">
          {viewedRoom ? (
            <>
              {/* <div className="flex items-center justify-between text-gray">
            <h2 className="text-lg font-medium">{viewedRoom.number}</h2>
              <div className="text-lg font-medium">LKR {viewedRoom.price}</div>
          </div>
            <div className="text-sm text-right text-gray">Per Day</div>
            <div className="mt-4 grid grid-cols-3 text-gray">
              <div className="col-span-1">Beds</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.beds}</div>
            </div>
            <div className="mt-2 grid grid-cols-3 text-gray">
              <div className="col-span-1">Lockers</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.lockers}</div>
            </div>
            <div className="mt-2 grid grid-cols-3 text-gray">
              <div className="col-span-1">Tables</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.tables}</div>
            </div>
            <div className="mt-2 grid grid-cols-3 text-gray">
              <div className="col-span-1">AC</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.ac ? 'Yes' : 'No'}</div>
            </div>
            <div className="mt-2 grid grid-cols-3 text-gray">
              <div className="col-span-1">TV</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{viewedRoom.tv ? 'Yes' : 'No'}</div>
            </div>

            <div className="mt-4 grid grid-cols-3 text-gray">
              <div className="col-span-1">Total</div>
              <div className="col-span-1">:</div>
              <div className="col-span-1">{guestDetails.lengthOfStay * viewedRoom.price}</div>
            </div>

            {viewedRoom.guest && (
              <p>
                <span className="font-semibold">Guest:</span>{" "}
                {viewedRoom.guest}
              </p>
            )} */}
            </>
          ) : (
            <p className="text-gray-500 mb-4">Select a room to view details</p>
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
                        {guestDetails.lengthOfStay * room.price}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRoom(room.id)}
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
        {/* Fixed footer */}
        <div className="border-t p-6 text-gray sticky bottom-0 bg-mainWhite flex flex-col gap-4">
          <div className="mt-2 grid grid-cols-3 text-gray whitespace-nowrap">
            <div className="col-span-1">Total Bill</div>
            <div className="col-span-1">:</div>
            <div className="col-span-1">LKR {grandTotal.toLocaleString()}</div>
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
                  onClick={handleCloseModal}
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
  onClick={() => selectedRooms.forEach((r) => handleBook(r.id, r.price))}
>
  Book
</Button>

        </div>
      </div>
    </div>
  );
};

export default Step02;
