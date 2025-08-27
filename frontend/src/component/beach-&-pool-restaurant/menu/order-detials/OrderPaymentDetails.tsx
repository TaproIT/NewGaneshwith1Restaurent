import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react'

const OrderPaymentDetails:React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center shadow-[0px_-1px_4px_0px_#5C5C5C40]">
      <ScrollArea className="w-full h-[calc(100vh-510px)] 2xl:h-[calc(100vh-670px)]">
        <div className="py-3 flex flex-col gap-3">
          <div className="px-6 2xl:px-8 w-full flex flex-col gap-1 text-[0.75rem] text-[#444444] font-normal">
            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Subtotal</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR 1200.00</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Tax</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR 1200.00</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Discount</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR 1200.00</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Service Charge</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR 1200.00</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <p className="col-span-2">Total Bill</p>
              <div className="col-span-3 flex items-center justify-between">
                <p>:</p>
                <p>LKR 1200.00</p>
              </div>
            </div>
          </div>

          <div className="px-3 2xl:px-5 w-full flex flex-col gap-1.5">
            <Button variant="outline" className="!w-full !h-9 border-[#0A869D]">
              Token
            </Button>
            <Button className="!w-full !h-9">Token</Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default OrderPaymentDetails
