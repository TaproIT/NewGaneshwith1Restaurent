import React from "react";

const RoomCard = () => {
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
                        {guestDetails.lengthOfStay ||
                          invoiceData.lengthOfStay * room.price}
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
  )
};

export default RoomCard;
