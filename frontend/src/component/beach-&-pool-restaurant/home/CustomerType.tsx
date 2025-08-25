import type { AppDispatch, RootState } from "@/app/store";
import { setCustomerType } from "@/features/beach-restaurant/orderSlice";
import { School, UserLock } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

interface CustomerTypeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const customerTypes: CustomerTypeItem[] = [
  {
    id: "checkedIn",
    label: "Checked-In Customer",
    icon: <School className="w-8 h-8" />,
  },
  {
    id: "walkIn",
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
        {customerTypes.map((type) => {
          const isSelected = type.id === selected;
          return (
            <div
              key={type.id}
              onClick={() => dispatch(setCustomerType(type.id))}
              className={`py-12 col-span-1 flex flex-col items-center gap-3 rounded-lg cursor-pointer transition-all
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
              <p className="text-[18px]">{type.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerType;
