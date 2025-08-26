import { Button } from "@/components/ui/button";
import React from "react";
import { tables } from "./tables";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

const TableDetails: React.FC = () => {
  const selectedId = useSelector((state: RootState) => state.order.tableId);

  //Directly compute table from id
  const selectedTable = tables.find((table) => table.id === selectedId);

  return (
    <div className="h-full flex flex-col justify-between gap-5 bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40]">
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-[1rem] text-[#444444]">
            {selectedTable?.label ?? "No Table Selected"}
          </p>
          <div className="px-3 py-1 text-[0.75rem] text-[#444444] flex items-center justify-center bg-[#AEE6E6] rounded-sm">
            {selectedTable?.status ?? "N/A"}
          </div>
        </div>

        <div className="px-1.5 flex items-center gap-6 text-[0.75rem] text-[#444444]">
          <p>Seats</p>
          <p>:</p>
          <p>04</p>
        </div>
      </div>

      <div className="p-4 flex border-[1px] shadow-[0px_-1px_4px_0px_#5C5C5C40]">
        <Button
          className="mt-12 w-full text-[0.75rem] text-[#FEFEFE]"
          value="primary"
          disabled={!selectedTable} // prevent booking when nothing selected
        >
          Book
        </Button>
      </div>
    </div>
  );
};

export default TableDetails;
