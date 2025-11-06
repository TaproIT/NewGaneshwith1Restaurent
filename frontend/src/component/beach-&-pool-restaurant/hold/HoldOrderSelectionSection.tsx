import type { AppDispatch, RootState } from "@/app/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedHoldOrderId } from "@/features/beach-restaurant/holdOrderSlice";
import { TicketX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ import Shadcn skeleton

const HoldOrderSelectionSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holdOrders: orders, selectedHoldOrderId: selectedId, fetchHoldOrdersStatus } = useSelector(
    (state: RootState) => state.holdOrder
  );

  const loading = fetchHoldOrdersStatus.loading;

  // serviceType → style mapping
  const getHoldOrderClasses = (customerType: string, isSelected: boolean) => {
    let base = "text-[#5B5B5B]";
    let color = "";

    switch (customerType) {
      case "Checked-In":
        color = "bg-[#2DE2C5]";
        break;
      case "Walk-In":
        color = "bg-[#F7D376]";
        break;
    }

    if (isSelected) {
      return `${color} border-[2px] border-[#444444] ${base}`;
    }

    return `${color} ${base}`;
  };

  // handle selection
  const handleHoldOrderClick = (id: string) => {
    dispatch(setSelectedHoldOrderId(id));
  };

  // set default selection (first one)
  useEffect(() => {
    if (orders.length > 0 && !selectedId) {
      dispatch(setSelectedHoldOrderId(orders[0]._id));
    }
  }, [dispatch, orders, selectedId]);

  return (
    <div className="flex flex-col h-full bg-mainWhite rounded-2xl">
      {/* Legend */}
      <div className="pt-4 px-4 flex items-center justify-end gap-4 mb-4">
        <Legend color="bg-[#2DE2C5]" label="Checked-In" />
        <Legend color="bg-[#F7D376]" label="Walked-In" />
        <Legend color="border-2 border-[#444444] bg-white" label="Selected" />
      </div>

      {/* Hold Orders Section */}
      <ScrollArea className="h-[calc(100vh-190px)] w-full rounded-2xl">
        {loading ? (
          // ✅ Skeleton Loader Section
          <div className="px-4 pb-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="col-span-1 flex flex-col gap-1">
                <Skeleton className="h-[80px] w-full rounded-sm" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          // ✅ Empty State
          <div className="flex flex-col items-center justify-center h-full py-20 text-center text-[#5B5B5B]">
            <div className="p-3 flex items-center justify-center bg-[#e6f3f5] rounded-full">
              <TicketX size={24} className="text-primary" />
            </div>
            <p className="text-lg font-semibold">No Hold Orders</p>
            <p className="text-sm text-gray-500 mt-1">
              All orders have been cleared or completed.
            </p>
          </div>
        ) : (
          // ✅ Loaded Orders
          <div className="px-4 pb-4 grid grid-cols-4 gap-3">
            {orders.map((order) => {
              const isSelected = selectedId === order._id;
              const orderClass = getHoldOrderClasses(order.customerType, isSelected);

              return (
                <div
                  key={order._id}
                  onClick={() => handleHoldOrderClick(order._id)}
                  className="col-span-1 flex flex-col gap-1 cursor-pointer"
                >
                  <div
                    className={`py-8 flex items-center justify-center rounded-sm font-[500] text-[0.875rem] ${orderClass}`}
                  >
                    {order.orderNumber}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default HoldOrderSelectionSection;

// ✅ Reusable Legend component
const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <p className="text-black text-[0.75rem]">{label}</p>
  </div>
);
