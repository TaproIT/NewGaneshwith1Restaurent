import React, { useEffect } from "react";
import OrderInitialDetails from "../order-details/OrderInitialDetails";
import OrderPaymentDetails from "../order-details/OrderPaymentDetails";
import { useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import OrderToken from "../order-details/OrderToken";
import { useDispatch } from "react-redux";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchOrderById } from "@/api/order/get-order-data-api";


const DailyOrderDetailsSection: React.FC = () => {
  const  order = useSelector((state:RootState) => state.order);
  const {selectedOrderId: id} = useSelector((state:RootState) => state.dailyOrderSummary);
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
      if (!id) return;
      dispatch(fetchOrderById(id));
  }, [id]);

  return (
    <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl">
      <div className="flex flex-col">
        <div className="px-3">
          <OrderInitialDetails />
        </div>

        <ScrollArea className="w-full h-[calc(100vh-490px)]">
          {
            order.orderTokens.length > 0 ? (
              <div className="px-1.5">
                {
                  order.orderTokens?.map((token, index) => (
                    <OrderToken token={token} key={index}/>
                  ))
                }
                {
                  <OrderToken token={order.newOrderToken} />
                }
              </div>
            ) : (
               <div className="px-1.5">
                   <OrderToken token={order.newOrderToken} />
               </div>
            )
                              
          }

        </ScrollArea>
        
      </div>

      <div className="w-full flex">
        <OrderPaymentDetails isSummaryOrder={true} />
      </div>
    </div>
  );
};

export default DailyOrderDetailsSection;
