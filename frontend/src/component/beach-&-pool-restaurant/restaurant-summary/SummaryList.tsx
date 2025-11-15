import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerTypes } from "@/lib/enums/order-related-enums";

type DailyCustomerSummary = {
  totalSubTotal: number;
  totalServiceCharge: number;
  totalBill: number;
  orderCount: number;
  customerType: string;
  date: string;
};

export const RestaurantSummaryList: React.FC<{
  summaryList: DailyCustomerSummary[];
  loading?: boolean;
}> = ({ summaryList, loading = false }) => {
  const [selectedRow, setSelectedRow] = useState<string>("");

  return (
    <div className="p-4 w-full bg-mainWhite">

      {/* Legend */}
      <div className="px-4 flex items-center justify-end gap-4 mb-4">
        <Legend color="bg-[#2DE2C5]" label="Checked-In" />
        <Legend color="bg-[#F7D376]" label="Walk-In" />
        <Legend color="border-2 border-[#444444] bg-white" label="Selected" />
      </div>

      {/* Header */}
      <div className="mb-2 grid grid-cols-6 gap-4 p-3 font-semibold text-[0.875rem] border rounded-lg">
        <div>Date</div>
        <div>Customer Type</div>
        <div>Sub Total</div>
        <div>Service Charge</div>
        <div>Total Bill</div>
        <div>Order Count</div>
      </div>

      <ScrollArea className="w-full h-[calc(100vh-350px)]">
        <div className="pb-2 flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 gap-4 p-3 border rounded-lg"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : summaryList.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No summary found.</p>
          ) : (
            summaryList.map((item, index) => {
              const isWalkIn = item.customerType === CustomerTypes.WALK_IN.value;
              const isSelected = selectedRow === index.toString();

              return (
                <div
                  key={index}
                  onClick={() => setSelectedRow(index.toString())}
                  className={`grid grid-cols-6 gap-4 p-3 text-sm border rounded-lg cursor-pointer transition-colors 
                    ${
                      isSelected
                        ? "bg-[#F4F4F4] border-[#444444]"
                        : isWalkIn
                        ? "border-[#F7D376] bg-white hover:bg-[#F4F4F4]"
                        : "border-[#2DE2C5] bg-white hover:bg-[#F4F4F4]"
                    }`}
                >
                  <div>{item.date}</div>
                  <div>{item.customerType}</div>
                  <div>{item.totalSubTotal.toFixed(2)}</div>
                  <div>{item.totalServiceCharge.toFixed(2)}</div>
                  <div>{item.totalBill.toFixed(2)}</div>
                  <div>{item.orderCount}</div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <p className="text-black text-[0.75rem]">{label}</p>
  </div>
);
