import type { AppDispatch, RootState } from "@/app/store";
import { setCustomerType } from "@/features/beach-restaurant/orderSlice";
import { CustomerTypes } from "@/lib/enums/order-related-enums";
import { School, UserLock } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface CustomerTypeItem {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const customerTypes: CustomerTypeItem[] = [
  {
    value: CustomerTypes.CHECKED_IN.value,
    label: "Checked-In Customer",
    icon: <School className="w-8 h-8" />,
  },
  {
    value: CustomerTypes.WALK_IN.value,
    label: "Walk-In Customer",
    icon: <UserLock className="w-8 h-8" />,
  },
];

const CustomerType: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selected = useSelector(
    (state: RootState) => state.order.customerType
  );

  return (
    <div className="flex flex-col">
      <p className="text-[#444444] text-[1rem]">Customer Type</p>
      <div className="mt-5 grid grid-cols-3 gap-7">
        {customerTypes.map((type, index) => {
          const isSelected = type.value === selected;
          return (
            <div
              key={index}
              onClick={() => dispatch(setCustomerType(type.value))}
              className={`py-8 2xl:py-12 col-span-1 flex flex-col items-center gap-2 2xl:gap-3 rounded-lg cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-secondary text-[#FEFEFE]"
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

export default CustomerType;
