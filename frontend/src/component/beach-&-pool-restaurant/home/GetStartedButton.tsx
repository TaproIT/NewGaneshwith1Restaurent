import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createOrderWithInitialData } from "@/api/order/add-order-initial-data-api";
import type { AppDispatch, RootState } from "@/app/store";
import { CustomerTypes, ServiceTypes } from "@/lib/enums/order-related-enums";
import { toast } from "react-toastify";

const GetStartedButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const order = useSelector((state: RootState) => state.order);

  const { loading, error } = order.orderInitialDataStatus;
  
  const handleInitialOrderDetails = async () => {
    try {
      const resultAction = await dispatch(
        createOrderWithInitialData({
          customerType: order.customerType,
          serviceType: order.serviceType,
          roomNumber: Number(order.roomNumber),
          guestName: order.guestName,
          guestId: order.guestId
        })
      );

      if (createOrderWithInitialData.fulfilled.match(resultAction)) {
        const newOrder = resultAction.payload; // this contains order._id from API
        toast.success("Successfully added data");

        const targetPath =
          newOrder.serviceType === ServiceTypes.DINE_IN.value
            ? `/beach-restaurant/tables/${newOrder._id}`
            : `/beach-restaurant/menu/${newOrder._id}`;
        
        // Navigate after toast shows for a short time
        setTimeout(() => {
          navigate(targetPath);
        }, 1200);

      } else {
        toast.error(error || "Failed to create order");
      }
    } catch (err) {
      toast.error("Unexpected error occurred");
      console.error(err);
    }
  };

  const isDisabled =
    order.customerType === CustomerTypes.CHECKED_IN.value
      ? !order.guestName || !order.roomNumber || loading
      : !order.guestName || loading;

  return (
    <div className="mt-5 flex items-center justify-end">
      <Button
        onClick={handleInitialOrderDetails}
        className="px-20 py-6 text-[1rem] cursor-pointer"
        disabled={isDisabled}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Processing
          </>
        ) : (
          "Get Started"
        )}
      </Button>
    </div>
  );
};

export default GetStartedButton;
