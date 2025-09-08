import { ScrollArea } from "@/components/ui/scroll-area";
import type { DailyOrder } from "../daily-summary-model";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { setSelectedOrderId } from "@/features/beach-restaurant/dailySummarySlice";
import React, { useEffect } from "react";

export const DailyOrdersList: React.FC<{ orders: DailyOrder[] }> = ({ orders }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedOrderId = useSelector(
    (state: RootState) => state.dailyOrderSummary.selectedOrderId
  );

  // Default select first order
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      dispatch(setSelectedOrderId(orders[0]._id));
    }
  }, [orders, selectedOrderId, dispatch]);

  return (
    <div className="p-4 w-full bg-mainWhite">
      {/* Header Row */}
      <div className="mb-2 grid grid-cols-7 gap-4 p-3 font-semibold text-[0.875rem] border rounded-lg">
        <div className="col-span-1">Order Number</div>
        <div className="col-span-1">Token Numbers</div>
        <div className="col-span-4">Food Items</div>
        <div className="col-span-1">Service Type</div>
      </div>

      {/* Orders */}
      <ScrollArea className="w-full h-[calc(100vh-270px)]">
        <div className="pb-2 flex flex-col gap-2">
          {orders.map((order) => {
            const isSelected = selectedOrderId === order._id;
            return (
              <div
                key={order._id}
                onClick={() => dispatch(setSelectedOrderId(order._id))}
                className={`grid grid-cols-7 gap-4 p-3 text-sm border rounded-lg cursor-pointer transition-colors
                  ${isSelected ? "bg-[#F4F4F4]" : "bg-white hover:bg-[#F4F4F4]"}`}
              >
                {/* Order Number */}
                <div className="col-span-1 flex items-center">{order.orderNumber}</div>

                {/* Token Numbers */}
                <div className="col-span-1 flex flex-col gap-1">
                  {order.orderTokens.length > 0
                    ? order.orderTokens.map((t, idx) => <span key={idx}>{t.tokenNumber}</span>)
                    : "-"}
                </div>

                {/* Food Items */}
                <div className="col-span-4 flex flex-col gap-1">
                  {order.orderTokens.length > 0
                    ? order.orderTokens.map((t, idx) => (
                        <span key={idx}>{t.orderItems.join(", ") || "-"}</span>
                      ))
                    : "-"}
                </div>

                {/* Service Type */}
                <div className="col-span-1 flex items-center">{order.serviceType}</div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
