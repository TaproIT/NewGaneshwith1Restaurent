import React from "react";
import OrderInitialDetails from "./order-details/OrderInitialDetatils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrderPaymentDetails from "./order-details/OrderPaymentDetails";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import OrderToken from "./order-details/OrderToken";

const OrderDetailsSection: React.FC = () => {
  const order = useSelector((state:RootState) => state.order);

  return (
    <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl">
      <div className="flex flex-col">
        <div className="px-3">
          <OrderInitialDetails />
        </div>

        {
          order.orderTokens.length > 0 ? (
            <div className="px-1.5">
              {
                order.orderTokens?.map((token) => (
                  <OrderToken token={token} />
                ))
              }
            </div>
          ):(
              <div className="px-1.5">
                <OrderToken token={order.newOrderToken} />
              </div>
          )
        }

        {
          order.orderTokens.length > 0 && (
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                className="!px-1.5 !h-7 bg-[#F4F4F4] !rounded-none border-none cursor-pointer"
              >
                <Plus size={16} />
              </Button>
            </div>
          )
        }
      </div>

      <div className="w-full flex">
        <OrderPaymentDetails />
      </div>
    </div>
  );
};

export default OrderDetailsSection;
