import { type AppDispatch, type RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { openOrderTokenModal, setSubTotal, setTotalBill } from '@/features/beach-restaurant/orderSlice';
import { getAllTokenSubTotal, getTokenSubTotal } from '@/lib/order-util';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const OrderPaymentDetails:React.FC = () => {
  const order = useSelector((state:RootState) => state.order );
  const dispatch = useDispatch<AppDispatch>();

  const subTotal =
    order.orderTokens.length > 0
      ? parseFloat(getAllTokenSubTotal(order.orderTokens).toFixed(2))
      : order.newOrderToken.foodItems.length > 0 ||
        order.newOrderToken.beverageItems.length > 0
        ? parseFloat(getTokenSubTotal(order.newOrderToken).toFixed(2))
        : 0;

  dispatch(setSubTotal(subTotal));
  
  const totalBill = (order.subTotal + order.tax + order.discount + order.serviceCharge);

  dispatch(setTotalBill(totalBill))

  useEffect(() => {
  }, [order.subTotal]);

  return (
    <div className="w-full flex flex-col items-center shadow-[0px_-1px_4px_0px_#5C5C5C40]">
      <ScrollArea className="w-full h-[calc(100vh-510px)] 2xl:h-[calc(100vh-670px)]">
        <div className="py-3 flex flex-col gap-3">
          <div className="px-6 2xl:px-8 w-full flex flex-col gap-1 text-[0.75rem] text-[#444444] font-normal">
            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Subtotal</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR {order.subTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Tax</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR {order.tax.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Discount</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR {order.discount.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Service Charge</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR {order.serviceCharge.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Total Bill</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR {order.totalBill.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="px-3 2xl:px-5 w-full flex flex-col gap-1.5">
            <Button 
               variant="outline" 
               className="!w-full !h-8 border-[#0A869D]"
               onClick={() => dispatch(openOrderTokenModal())}
               >
              Token
            </Button>
            <Button className="!w-full !h-8">Hold</Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default OrderPaymentDetails;
