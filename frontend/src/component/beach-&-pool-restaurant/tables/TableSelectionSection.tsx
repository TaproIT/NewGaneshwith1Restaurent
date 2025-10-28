import type { AppDispatch, RootState } from "@/app/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTableId } from "@/features/beach-restaurant/orderSlice";
import type { TableStatus } from "../order-model";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

const TableSelectionSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    tables: availableTables,
    tableId: selectedTableId,
    fetchTablesStatus,
  } = useSelector((state: RootState) => state.order);

  const { loading, error } = fetchTablesStatus;

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // status → style mapping
  const getTableClasses = (status: TableStatus, isSelected: boolean) => {
    if (isSelected) {
      return "border-2 border-[#444444] bg-[#AEE6E6] text-[#5B5B5B]";
    }
    switch (status) {
      case "Empty":
        return "bg-[#AEE6E6] text-[#5B5B5B]";
      case "Reserved":
        return "bg-[#F5B67C] text-[#5B5B5B]";
      default:
        return "";
    }
  };

  // handle table selection
  const handleTableClick = (id: string, status: TableStatus) => {
    if (status !== "Empty") return; // only empty tables can be selected
    dispatch(setTableId(selectedTableId === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full bg-mainWhite rounded-2xl">
      {/* Legend */}
      <div className="pt-4 px-4 flex items-center justify-end gap-4 mb-4">
        <Legend color="bg-[#AEE6E6]" label="Empty" />
        <Legend color="bg-[#F5B67C]" label="Reserved" />
        <Legend color="border-2 border-[#AEE6E6] bg-white" label="Selected" />
      </div>

      {/* Tables */}
      <ScrollArea className="h-[calc(100vh-190px)] w-full rounded-2xl">
        <div className="px-4 pb-4 grid grid-cols-4 gap-3">
          {/* Skeleton while loading */}
          {loading
            ? Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={idx}
                  className="col-span-1 flex flex-col gap-1 cursor-pointer"
                >
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <Skeleton className="h-16 w-full rounded-sm" />
                  <Skeleton className="h-3 w-full rounded-sm" />
                </div>
              ))
            : availableTables.map((table) => {
                const isSelected = selectedTableId === table._id;
                const tableClass = getTableClasses(
                  table.status as TableStatus,
                  isSelected
                );

                return (
                  <div
                    key={table._id}
                    onClick={() =>
                      handleTableClick(table._id, table.status as TableStatus)
                    }
                    className="col-span-1 flex flex-col gap-1 cursor-pointer"
                  >
                    {/* Top border */}
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`col-span-1 h-3 ${tableClass} rounded-tl-sm`} />
                      <div className={`col-span-1 h-3 ${tableClass} rounded-tr-sm`} />
                    </div>

                    {/* Middle */}
                    <div
                      className={`py-6 flex items-center justify-center rounded-sm font-[500] text-[0.875rem] ${tableClass}`}
                    >
                      {table.name}
                    </div>

                    {/* Bottom border */}
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`col-span-1 h-3 ${tableClass} rounded-bl-sm`} />
                      <div className={`col-span-1 h-3 ${tableClass} rounded-br-sm`} />
                    </div>
                  </div>
                );
              })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TableSelectionSection;

// Small reusable legend component
const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-full`} />
    <p className="text-black text-[0.75rem]">{label}</p>
  </div>
);
