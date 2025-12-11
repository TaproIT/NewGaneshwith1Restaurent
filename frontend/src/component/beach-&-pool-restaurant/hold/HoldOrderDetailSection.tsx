import React, { useEffect } from "react";
import OrderInitialDetails from "../order-details/OrderInitialDetails";
import OrderPaymentDetails from "../order-details/OrderPaymentDetails";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import OrderToken from "../order-details/OrderToken";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchOrderById } from "@/api/order/get-order-data-api";
//import { TicketX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ import shadcn skeleton
import { TicketX } from "lucide-react";

const HoldOrderDetailsSection: React.FC = () => {
  const order = useSelector((state: RootState) => state.order);
  const { selectedHoldOrderId: id, fetchHoldOrdersStatus } = useSelector(
    (state: RootState) => state.holdOrder
  );
  const dispatch = useDispatch<AppDispatch>();

  const loading = fetchHoldOrdersStatus.loading || order.fetchOrderDataStatus.loading; 

  useEffect(() => {
    if (!id) return;
    dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  // ✅ Skeleton loader while fetching order
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl p-4">
        {/* Top section skeleton (OrderInitialDetails) */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 rounded-md" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        </div>

        {/* Middle section (Order Tokens) */}
        <ScrollArea className="w-full h-[calc(100vh-490px)] mt-6">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[90px] w-full rounded-md" />
            ))}
          </div>
        </ScrollArea>

        {/* Bottom section (Payment details) */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-1/4 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

  
  // ✅ When no order selected
  if (!id || !order || !order._id) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-mainWhite rounded-2xl p-6 text-center">
        <div className="p-3 flex items-center justify-center bg-[#e6f3f5] rounded-full">
          <TicketX size={24} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-gray-700">
          No Order Selected
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Select a hold order from the left to view its details.
        </p>
      </div>
    );
  }

  // ✅ Actual loaded content
  return (
    <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl">
      <div className="flex flex-col">
        <div className="px-3">
          <OrderInitialDetails />
        </div>

        <ScrollArea className="w-full h-[calc(100vh-590px)]">
          {order.orderTokens.length > 0 ? (
            <div className="px-1.5">
              {order.orderTokens?.map((token, index) => (
                <OrderToken token={token} isHoldOrder={true} key={index} />
              ))}
              <OrderToken token={order.newOrderToken} isHoldOrder={true} />
            </div>
          ) : (
            <div className="px-1.5">
              <OrderToken token={order.newOrderToken} isHoldOrder={true} />
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="w-full flex">
        <OrderPaymentDetails isHoldOrder={true} />
      </div>
    </div>
  );
};

export default HoldOrderDetailsSection;
