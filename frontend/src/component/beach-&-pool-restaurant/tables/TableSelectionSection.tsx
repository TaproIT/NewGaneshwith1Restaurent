
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useState } from "react";

type TableStatus = "empty" | "reserved" | "selected";

interface Table {
  id: string;
  label: string;
  status: TableStatus;
}

const TableSelectionSection: React.FC = () => {
   const statuses: Table["status"][] = ["empty", "reserved"];

  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 24 }, (_, i) => ({
      id: `T${(i + 1).toString().padStart(2, "0")}`,
      label: `T${(i + 1).toString().padStart(2, "0")}`,
      status: statuses[Math.floor(Math.random() * statuses.length)], // random status
    }))
  );

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
    if (status !== "empty") return; // only empty can be selected
    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "selected" }
          : t.status === "selected"
          ? { ...t, status: "empty" } // reset previously selected
          : t
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      <div className="p-4 flex items-center justify-end gap-4 mb-4">
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
      <ScrollArea className="h-[calc(100vh-200px)] 2xl:h-[calc(100vh-150px)] w-full">
        <div className="p-4 grid grid-cols-4 gap-3">
          {tables.map((table) => {
            const tableClass = getTableClasses(table.status);

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id, table.status)}
                className="col-span-1 flex flex-col gap-1 cursor-pointer"
              >
                {/* Top chairs */}
                <div className="grid grid-cols-2 gap-1">
                  <div
                    className={`col-span-1 h-3 ${tableClass} rounded-tl-sm`}
                  ></div>
                  <div
                    className={`col-span-1 h-3 ${tableClass} rounded-tr-sm`}
                  ></div>
                </div>

                {/* Table body */}
                <div
                  className={`py-6 flex items-center justify-center rounded-sm font-[500] text-[0.875rem] ${tableClass}`}
                >
                  {table.label}
                </div>

                {/* Bottom chairs */}
                <div className="grid grid-cols-2 gap-1">
                  <div
                    className={`col-span-1 h-3 ${tableClass} rounded-bl-sm`}
                  ></div>
                  <div
                    className={`col-span-1 h-3 ${tableClass} rounded-br-sm`}
                  ></div>
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
