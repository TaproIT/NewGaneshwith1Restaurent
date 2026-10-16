import React from "react";
import OrderInitialDetails from "../order-details/OrderInitialDetails";
import { Button } from "@/components/ui/button";
import { Plus, TicketX } from "lucide-react";
import OrderPaymentDetails from "../order-details/OrderPaymentDetails";
import { useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import OrderToken from "../order-details/OrderToken";
import { useDispatch } from "react-redux";
import { setIsAddNewOrderToken } from "@/features/beach-restaurant/orderSlice";
import { ScrollArea } from "@/components/ui/scroll-area";


const OrderDetailsSection: React.FC = () => {
  const order = useSelector((state:RootState) => state.order);
  const dispatch = useDispatch<AppDispatch>();

  const handleAddNewOrderToken = () => {
    dispatch(setIsAddNewOrderToken(true));
  }

  if (!order || !order._id) {
     return (
       <div className="h-full flex flex-col items-center justify-center bg-mainWhite rounded-2xl p-6 text-center">
         <div className="p-3 flex items-center justify-center bg-primary-soft rounded-full">
           <TicketX size={24} className="text-primary" />
         </div>
         <h3 className="text-base font-semibold text-gray-700">
           Order not found
         </h3>
         <p className="text-sm text-gray-500 mt-1">
           Select a order from the left to view its details.
         </p>
       </div>
     );
   }

  return (
    <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl">
      <div className="flex flex-col">
        <div className="px-3">
          <OrderInitialDetails />
        </div>

        <ScrollArea className="w-full h-[calc(100vh-530px)]">
          {
            order.orderTokens.length > 0 ? (
              <div className="px-1.5">
                {
                  order.orderTokens?.map((token, index) => (
                    <OrderToken token={token} key={index}/>
                  ))
                }
                {
                  (order.isAddNewOrderToken || order.holdOrderToken) && <OrderToken token={order.newOrderToken} />
                }
              </div>
            ) : (
              <div className="px-1.5">
                <OrderToken token={order.newOrderToken} />
              </div>
            )
          }
        </ScrollArea>
         {
            (order.orderTokens.length > 0 && !order.isAddNewOrderToken && !order.holdOrderToken) && (
              <div className="pb-1 flex items-center justify-center">
                <Button
                  variant="outline"
                  className="!px-1.5 !h-7 bg-bg !rounded-none border-none cursor-pointer"
                  onClick={handleAddNewOrderToken}
                >
                  <Plus size={16} />
                </Button>
              </div>
            )
          }
        
      </div>

      <div className="w-full flex">
        <OrderPaymentDetails isHoldOrder={false} />
      </div>
    </div>
  );
};

export default OrderDetailsSection;
