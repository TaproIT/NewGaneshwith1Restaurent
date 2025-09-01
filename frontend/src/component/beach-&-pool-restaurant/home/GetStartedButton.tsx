import { createOrderWithInitialData } from '@/api/order/order-initial-data-api'
import type { AppDispatch, RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { ServiceTypes } from '@/lib/enums/order-related-enums'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const GetStartedButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const order = useSelector(
    (state:RootState) => state.order
  );

  const navigate = useNavigate();

  const handleInitialOrderDetails = async () => {
    try {
      const resultAction = await dispatch(
        createOrderWithInitialData({
          customerType: order.customerType,
          serviceType: order.serviceType,
          roomNumber: Number(order.roomNumber),
          guestName: order.guestName,
        })
      );

      if (createOrderWithInitialData.fulfilled.match(resultAction)) {
        const newOrder = resultAction.payload; // response from API (orderId, orderNumber, etc.)
        console.log(newOrder);
        if (newOrder.serviceType === ServiceTypes.DINE_IN.value) {
          navigate(`/beach-restaurant/tables/${newOrder._id}`);
        } else {
          navigate(`/beach-restaurant/menu/${newOrder._id}`);
        }
      } else {
        console.error("Failed to create order:", resultAction.payload);
      }
    } catch (error) {
      console.error("Unexpected error while creating order:", error);
    }
  };

  
  const disabled = order.guestName === "" || order.roomNumber === "";
  return (
    <div className="mt-5 flex items-center justify-end">
      <Button 
        onClick={handleInitialOrderDetails}
        className="px-20 py-6 text-[1rem] cursor-pointer"
        disabled={disabled}
      >
        Get Started
      </Button>
    </div>
  )
}

export default GetStartedButton
