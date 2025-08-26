import type { AppDispatch, RootState } from "@/app/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tables as initialTables } from "./tables";
import type { Table, TableStatus } from "./tables";
import { setTableId } from "@/features/beach-restaurant/orderSlice";

const TableSelectionSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedTableId = useSelector((state: RootState) => state.order.tableId);

  const [tables, setTables] = useState<Table[]>(initialTables);

  // status → style mapping
  const getTableClasses = (status: Table["status"]) => {
    switch (status) {
      case "empty":
        return "bg-[#AEE6E6] text-[#5B5B5B]";
      case "reserved":
        return "bg-[#F5B67C] text-[#5B5B5B]";
      case "selected":
        return "border-2 border-[#444444] bg-[#AEE6E6] text-[#5B5B5B]";
      default:
        return "";
    }
  };

  // handle table selection
  const handleTableClick = (id: string, status: TableStatus) => {
    if (status !== "empty" && status !== "selected") return; // only empty/selected can be toggled

    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "selected" ? "empty" : "selected" }
          : { ...t, status: t.status === "selected" ? "empty" : t.status }
      )
    );

    // update Redux with selected id (or null if unselected)
    dispatch(setTableId(selectedTableId === id ? null : id));
  };

  return (
    <div className="flex flex-col h-full bg-mainWhite rounded-2xl">
      {/* Legend */}
      <div className="pt-4 px-4 flex items-center justify-end gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#AEE6E6] rounded-full"></div>
          <p className="text-black text-[0.75rem]">Empty</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#F5B67C] rounded-full"></div>
          <p className="text-black text-[0.75rem]">Reserved</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-[#AEE6E6] bg-white rounded-full"></div>
          <p className="text-black text-[0.75rem]">Selected</p>
        </div>
      </div>

      {/* Tables */}
      <ScrollArea className="h-[calc(100vh-190px)] w-full rounded-2xl">
        <div className="px-4 pb-4 grid grid-cols-4 gap-3">
          {tables.map((table) => {
            const tableClass = getTableClasses(table.status);

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id, table.status)}
                className="col-span-1 flex flex-col gap-1 cursor-pointer"
              >
                <div className="grid grid-cols-2 gap-1">
                  <div className={`col-span-1 h-3 ${tableClass} rounded-tl-sm`} />
                  <div className={`col-span-1 h-3 ${tableClass} rounded-tr-sm`} />
                </div>

                <div
                  className={`py-6 flex items-center justify-center rounded-sm font-[500] text-[0.875rem] ${tableClass}`}
                >
                  {table.label}
                </div>
                
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
