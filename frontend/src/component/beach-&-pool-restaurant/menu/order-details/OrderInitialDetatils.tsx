import type { RootState } from '@/app/store';
import { OrderStatuses, ServiceTypes } from '@/lib/enums/order-related-enums';
import React from 'react';
import { useSelector } from 'react-redux';

 // Define service types as array
  const serviceTypes = [
    { id: ServiceTypes.DINE_IN.value, label: "Dine-In", col: "col-span-3" },
    { id: ServiceTypes.TAKE_AWAY.value, label: "Take-Away", col: "col-span-4" },
    { id: ServiceTypes.SAVE_TO_ROOM.value, label: "Save-To-Room", col: "col-span-5" }
];

const OrderInitialDetails: React.FC = () => {
  const order = useSelector((state: RootState) => state.order);
  const orderStatus = Object.values(OrderStatuses).find((status) => status.value === order.orderStatus);

  return (
    <div className="py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[1rem] text-[#444444] font-[500]">Order {order.orderNumber}</p>
        <p className="text-[0.75rem] text-[#0A869D] font-[500]">{orderStatus?.label}</p>
      </div>

      <div className="grid grid-cols-12 gap-0.5">
        {serviceTypes.map((service) => (
          <div
            key={service.id}
            className={`${service.col} flex items-center justify-center text-[0.75rem] rounded-sm py-1
              ${order.serviceType === service.id || service.id === order.serviceType
                ? "bg-bg-highlight text-[#FEFEFE]" 
                : "bg-transparent border border-[#CECECE] text-[#444444]"}`}
          >
            {service.label}
          </div>
        ))}
      </div>

      <div className="px-3 flex flex-col gap-1 text-[0.75rem] text-[#444444] font-normal">
         <div className="grid grid-cols-2">
            <p className="col-span-1">Customer Name</p>
            <p className="col-span-1">: <span className="px-2">{order.guestName || "John Doe"}</span></p>
         </div>

         <div className="grid grid-cols-2">
            <p className="col-span-1">Room</p>
            <p className="col-span-1">: <span className="px-2">{order.roomNumber || "R-02"}</span></p>
         </div>

         {
          order.tableId && (
            <div className="grid grid-cols-2">
              <p className="col-span-1">Table</p>
              <p className="col-span-1">: <span className="px-2">{order.tableId}</span></p>
            </div>
          )
         }
      </div>
    </div>
  );
};

export default OrderInitialDetails;
