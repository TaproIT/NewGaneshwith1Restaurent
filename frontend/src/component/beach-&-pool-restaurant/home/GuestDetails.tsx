"use client";

import React, { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { setGuestName, setRoomNumber } from "@/features/beach-restaurant/orderSlice";
import { CustomerTypes } from "@/lib/enums/order-related-enums";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllAvailableRooms } from "@/api/order/get-available-rooms-with-guest-details-api";

const GuestDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, roomNumber, guestName, customerType, fetchAvailableBookedRoomsStatus } = useSelector(
    (state: RootState) => state.order
  );

  const { loading, error } = fetchAvailableBookedRoomsStatus;

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  
  useEffect(() => {
    dispatch(fetchAllAvailableRooms());
  }, []);

  // Show error toast when error is present
  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-right" });
    }
  }, [error]);

  const updateWidth = useCallback(() => {
    if (triggerRef.current) {
      const w = Math.round(triggerRef.current.getBoundingClientRect().width);
      setContentWidth(w);
    }
  }, []);

  useLayoutEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      requestAnimationFrame(updateWidth);
    }
  };

  const handleSelectRoom = (selectedRoom: string) => {
    const room = rooms.find((r) => r.number === selectedRoom);
    if (room) {
      dispatch(setRoomNumber(room.number));
      dispatch(setGuestName(room.guest));
    }
    setOpen(false);
  };

  return (
    <div className="pt-5 flex flex-col">
      <div className="w-10/12 2xl:w-11/12 grid grid-cols-2 gap-6">
        {/* Room Selection */}
        {customerType === CustomerTypes.CHECKED_IN.value && (
          <div className="col-span-1 flex items-center gap-4">
            <Label htmlFor="roomNumber" className="text-sm font-medium text-[#444444]">
              Room Number
            </Label>

            {loading ? (
              <Skeleton className="h-12 w-4/6 rounded-md" />
            ) : (
              <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    ref={triggerRef}
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-4/6 justify-between py-5.5"
                  >
                    {roomNumber ? `Room ${roomNumber}` : "Select a room"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="p-0"
                  align="start"
                  style={contentWidth ? { width: `${contentWidth}px` } : undefined}
                >
                  <Command className="w-full">
                    <CommandInput placeholder="Search room..." />
                    <CommandEmpty>No room found.</CommandEmpty>
                    <CommandGroup>
                      {rooms.map((room) => (
                        <CommandItem
                          key={room.number}
                          value={room.number}
                          onSelect={() => handleSelectRoom(room.number)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              roomNumber === room.number ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Room {room.number} — {room.guest}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {/* Guest Name */}
        <div className="col-span-1 flex items-center gap-4">
          <Label htmlFor="guestName" className="text-sm font-medium text-[#444444]">
            Guest Name
          </Label>

          {loading ? (
            <Skeleton className="h-12 w-4/5 rounded-md" />
          ) : (
            <Input
              id="guestName"
              type="text"
              value={guestName}
              readOnly={customerType === CustomerTypes.CHECKED_IN.value}
              onChange={(e) => {
                if (customerType === CustomerTypes.WALK_IN.value) {
                  dispatch(setGuestName(e.target.value));
                }
              }}
              className={cn(
                "w-4/5 py-6 flex-1",
                customerType === CustomerTypes.CHECKED_IN.value
                  ? "bg-gray-100 cursor-not-allowed"
                  : "bg-white"
              )}
              placeholder={
                customerType === CustomerTypes.WALK_IN.value
                  ? "Enter Guest Name"
                  : "Select a room first"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestDetails;
