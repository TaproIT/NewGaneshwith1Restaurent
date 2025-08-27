import React from "react";
import OrderInitialDetails from "./order-detials/OrderInitialDetatils";
import OrderToken from "./order-detials/OrderToken";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrderPaymentDetails from "./order-detials/OrderPaymentDetails";

const OrderDetailsSection: React.FC = () => {
  return (
    <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl">
      <div className="flex flex-col">
        <div className="px-3">
          <OrderInitialDetails />
        </div>

        <div className="px-1.5">
          <OrderToken />
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            className="!px-1.5 !h-7 bg-[#F4F4F4] !rounded-none border-none cursor-pointer"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <div className="w-full flex">
        <OrderPaymentDetails />
      </div>
    </div>
  );
};

export default OrderDetailsSection;
