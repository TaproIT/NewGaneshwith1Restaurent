import type { AppDispatch, RootState } from "@/app/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { HoldOrderServiceType } from "../hold-order-model";
import { setSelectedHoldOrderId } from "@/features/beach-restaurant/holdOrderSlice";

const HoldOrderSelectionSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { holdOrders: orders, selectedHoldOrderId: selectedId } = useSelector(
    (state: RootState) => state.holdOrder
  );

    // serviceType → style mapping
    const getHoldOrderClasses = (
        serviceType: HoldOrderServiceType,
        isSelected: boolean
    ) => {
        let base = "text-[#5B5B5B]";
        let color = "";

        switch (serviceType) {
            case "Dine-In":
                color = "bg-[#2DE2C5]";
                break;
            case "Take-Away":
                color = "bg-[#F7D376]";
                break;
            case "Save-To-Room":
                color = "bg-[#F6C7B6]";
                break;
            default:
                color = "bg-white";
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
        <Legend color="bg-[#2DE2C5]" label="Dine-In" />
        <Legend color="bg-[#F7D376]" label="Take-Away" />
        <Legend color="bg-[#F6C7B6]" label="Save-To-Room" />
        <Legend color="border-2 border-[#444444] bg-white" label="Selected" />
      </div>

      {/* Hold Orders */}
      <ScrollArea className="h-[calc(100vh-190px)] w-full rounded-2xl">
        <div className="px-4 pb-4 grid grid-cols-4 gap-3">
          {orders.map((order) => {
            const isSelected = selectedId === order._id;
            const orderClass = getHoldOrderClasses(order.serviceType as HoldOrderServiceType, isSelected);

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
      </ScrollArea>
    </div>
  );
};

export default HoldOrderSelectionSection;

// Small reusable legend component
const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <p className="text-black text-[0.75rem]">{label}</p>
  </div>
);
