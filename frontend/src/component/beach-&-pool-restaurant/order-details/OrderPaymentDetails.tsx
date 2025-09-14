import { addNewOrderTokenToOrder } from '@/api/order/add-new-order-token-to-order-api';
import { fetchOrderById } from '@/api/order/get-order-data-api';
import { type AppDispatch, type RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  openOrderTokenModal,
  setIsPrintedForNewOrderToken,
  setSubTotal,
  setTokenSubTotal,
  setTokenTotalBill,
  setTotalBill,
} from '@/features/beach-restaurant/orderSlice';
import { getAllTokenSubTotal, getTokenSubTotal } from '@/lib/order-util';
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface OrderPaymentDetailsProps {
   isHoldOrder?:boolean;
   isSummaryOrder?: boolean
}

const OrderPaymentDetails: React.FC<OrderPaymentDetailsProps> = ({isHoldOrder, isSummaryOrder}) => {
  const order = useSelector((state: RootState) => state.order);
  const {selectedHoldOrderId:id} = useSelector((state: RootState) => state.holdOrder);
  const dispatch = useDispatch<AppDispatch>();

  const newOrderToken = order.newOrderToken;

  const { loading } = order.fetchOrderDataStatus;

  const navigate = useNavigate();

  // Disable Token button only if BOTH foodOrders and beverageOrders are empty
  const isDisabled =
    newOrderToken.foodOrders.length === 0 &&
    newOrderToken.beverageOrders.length === 0;

  // Handler functions
  const handleTokenClick = useCallback(() => {
    dispatch(openOrderTokenModal());
  }, [dispatch]);

 const handleHoldClick = async () => {
   try {
     dispatch(setIsPrintedForNewOrderToken(false));

     await dispatch(addNewOrderTokenToOrder({ orderId: order._id })).unwrap();
     await dispatch(fetchOrderById(order._id)).unwrap();

     toast.success("Order token held successfully");
   } catch (err: any) {
     toast.error(
       err?.message || "Error holding order token. Please try again."
     );
   }
 };

  const handleProceedPaymentClick = () => {
    navigate(`/beach-restaurant/menu/${id}`);
  };

  // Recalculate token subtotal and total bill when order tokens or charges change
  useEffect(() => {
    const tokenSubTotal =
      newOrderToken.foodOrders.length > 0 ||
      newOrderToken.beverageOrders.length > 0
        ? parseFloat(getTokenSubTotal(newOrderToken).toFixed(2))
        : 0;

    dispatch(setTokenSubTotal(tokenSubTotal));

    const tokenTotalBill =
      tokenSubTotal +
      newOrderToken.tokenTax +
      newOrderToken.tokenDiscount +
      newOrderToken.tokenServiceCharge;

    dispatch(setTokenTotalBill(tokenTotalBill));

    const subTotal =
      order.orderTokens.length > 0
        ? parseFloat(
            (getAllTokenSubTotal(order.orderTokens) + tokenSubTotal).toFixed(2)
          )
        : tokenSubTotal;

    dispatch(setSubTotal(subTotal));

    const totalBill =
      order.subTotal + order.tax + order.discount + order.serviceCharge;

    dispatch(setTotalBill(totalBill));
  }, [
    dispatch,
    newOrderToken,
    order.holdOrderToken,
    order.orderTokens,
    order.subTotal,
    order.tax,
    order.discount,
    order.serviceCharge,
  ]);

 return (
   <div className="w-full flex flex-col items-center shadow-[0px_-1px_4px_0px_#5C5C5C40]">
     <ScrollArea
       className={`w-full ${
         !isHoldOrder
           ? "h-[calc(100vh-470px)] 2xl:h-[calc(100vh-670px)]"
           : "h-[calc(100vh-510px)] 2xl:h-[calc(100vh-670px)]"
       }`}
     >
       <div className="flex flex-col gap-3">
         {loading ? (
           // Skeletons while loading
           <div className="px-6 2xl:px-8 w-full flex flex-col gap-3">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="my-0 h-4 grid grid-cols-5 gap-1 items-center">
                 <Skeleton className="h-4 w-20 col-span-2" />
                 <div className="col-span-3 flex items-center justify-between">
                   <p>:</p>
                   <Skeleton className="h-4 w-24" />
                 </div>
               </div>
             ))}

             <div className="px-3 2xl:px-5 w-full flex flex-col gap-2 mt-4">
               <Skeleton className="h-8 w-full rounded-md" />
               <Skeleton className="h-8 w-full rounded-md" />
             </div>
           </div>
         ) : (
           // Actual Payment Details
           <div className="py-3 flex flex-col gap-3">
             {/* Payment Details */}
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

             {/* Action Buttons */}
             {isSummaryOrder ? (
               <p className="text-[0.875rem] text-[#444444] text-center">
                 LKR {order.totalBill.toFixed(2)}
               </p>
             ) : (
               <div className="px-3 2xl:px-5 w-full flex flex-col gap-1.5">
                 {isHoldOrder ? (
                   <Button
                     className="mt-5 !w-full !h-8 border-[#0A869D] cursor-pointer"
                     onClick={handleProceedPaymentClick}
                   >
                     Proceed to payment
                   </Button>
                 ) : (
                   <>
                     <Button
                       variant="outline"
                       className="!w-full !h-8 border-[#0A869D] cursor-pointer"
                       disabled={isDisabled}
                       onClick={handleTokenClick}
                     >
                       Token
                     </Button>
                     <Button
                       className="!w-full !h-8 cursor-pointer"
                       disabled={isDisabled}
                       onClick={handleHoldClick}
                     >
                       Hold
                     </Button>
                   </>
                 )}
               </div>
             )}
           </div>
         )}
       </div>
     </ScrollArea>
   </div>
 );
};

export default OrderPaymentDetails;
