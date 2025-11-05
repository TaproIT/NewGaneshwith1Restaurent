import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyOrder } from "../daily-summary-model";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { setSelectedOrderId } from "@/features/beach-restaurant/dailySummarySlice";
import React, { useEffect } from "react";
import { TicketX } from "lucide-react";

export const DailyOrdersList: React.FC<{ orders: DailyOrder[] }> = ({
  orders,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedOrderId, fetchDailyOrderSummaryStatus, summary, date } =
    useSelector((state: RootState) => state.dailyOrderSummary);

  const { loading } = fetchDailyOrderSummaryStatus;
  const { totalTokens } = summary;

  // Default select first order
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId && !loading) {
      dispatch(setSelectedOrderId(orders[0]._id));
      return;
    }
  }, [orders, selectedOrderId, dispatch, loading]);

  return (
    <div className="p-4 w-full bg-mainWhite">
      {/* Header with tokens + date */}
      <div className="py-3 px-4 flex items-center justify-between font-[500] text-[0.875rem]">
        {loading ? (
          <>
            <Skeleton className="h-4 w-20" /> {/* token skeleton */}
            <Skeleton className="h-4 w-24" /> {/* date skeleton */}
          </>
        ) : (
          <>
            <p>{totalTokens} Tokens</p>
            <p>{date}</p>
          </>
        )}
      </div>

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
          {loading ? (
            // Show skeletons when loading
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-7 gap-4 p-3 text-sm border rounded-lg"
              >
                <div className="col-span-1 flex items-center">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-1 flex flex-col gap-1">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="col-span-4 flex flex-col gap-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="col-span-1 flex items-center">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))
          ) : orders.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
              <div className="p-3 flex items-center justify-center bg-[#e6f3f5] rounded-full">
                <TicketX size={24} className="text-primary" />
              </div>
              <p className="text-base font-medium">No orders found</p>
              <p className="text-sm text-gray-400">
                Try selecting another date to view orders.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isSelected = selectedOrderId === order._id;
              console.log(order)
              return (
                <div
                  key={order._id}
                  onClick={() => dispatch(setSelectedOrderId(order._id))}
                  className={`grid grid-cols-7 gap-4 p-3 text-sm border rounded-lg cursor-pointer transition-colors
                    ${
                      isSelected
                        ? "bg-[#F4F4F4]"
                        : "bg-white hover:bg-[#F4F4F4]"
                    }`}
                >
                  {/* Order Number */}
                  <div className="col-span-1 flex items-center">
                    {order.orderNumber}
                  </div>

                  {/* Token Numbers */}
                  <div className="col-span-1 flex flex-col gap-1">
                    {order.orderTokens.length > 0
                      ? order.orderTokens.map((t, idx) => (
                          <span key={idx}>{t.tokenNumber}</span>
                        ))
                      : "-"}
                  </div>

                  {/* Food Items */}
                  <div className="col-span-4 flex flex-col gap-1">
                    {order.orderTokens.length > 0
                      ? order.orderTokens.map((t, idx) => (
                          <span key={idx}>
                            {t.orderItems.join(", ") || "-"}
                          </span>
                        ))
                      : "-"}
                  </div>

                  {/* Service Type */}
                  <div className="col-span-1 flex items-center">
                    {order.serviceType}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
