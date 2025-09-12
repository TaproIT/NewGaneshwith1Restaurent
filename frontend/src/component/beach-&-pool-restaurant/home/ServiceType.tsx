import type { AppDispatch, RootState } from "@/app/store";
import { setServiceType } from "@/features/beach-restaurant/orderSlice";
import { CustomerTypes, ServiceTypes } from "@/lib/enums/order-related-enums";
import { UtensilsCrossed, ShoppingBag, Bed } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface ServiceTypeItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const serviceTypes: ServiceTypeItem[] = [
  {
    value: ServiceTypes.DINE_IN.value,
    label: "Dine In",
    icon: <UtensilsCrossed className="w-8 h-8" />,
  },
  {
    value: ServiceTypes.TAKE_AWAY.value,
    label: "Take Away",
    icon: <ShoppingBag className="w-8 h-8" />,
  },
  {
    value: ServiceTypes.SAVE_TO_ROOM.value,
    label: "Save to Room",
    icon: <Bed className="w-8 h-8" />,
  },
];

const ServiceType: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
  
  const customerType = order.customerType;

  const selected = order.serviceType;

  const filteredServiceTypes = serviceTypes.filter((service) => customerType === CustomerTypes.WALK_IN.value ? service.value !== ServiceTypes.SAVE_TO_ROOM.value : service );

  return (
    <div className="flex flex-col">
      <p className="text-[#444444] text-[1rem]">Service Type</p>
      <div className="mt-5 grid grid-cols-3 gap-7">
        {filteredServiceTypes.map((type) => {
          const isSelected = type.value === selected;
          return (
            <div
              key={type.value}
              onClick={() => dispatch(setServiceType(type.value))}
              className={`px-10 py-4 2xl:py-5 col-span-1 flex items-center justify-center gap-3 rounded-lg cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-[#B24E0E] text-[#FEFEFE]"
                    : "bg-transparent border border-[#CECECE] text-[#444444]"
                }`}
            >
              <div
                className={`${
                  isSelected ? "text-[#FEFEFE]" : "text-[#444444]"
                }`}
              >
                {type.icon}
              </div>
              <p className="text-[1.125rem]">{type.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceType;
