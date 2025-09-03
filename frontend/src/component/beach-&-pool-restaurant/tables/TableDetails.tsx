import { Button } from "@/components/ui/button";
import React from "react";
import { useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addTableToOrder } from "@/api/order/add-table-to-order-api";

type TableDetailsProps = {
  orderId: string;
};

const TableDetails: React.FC<TableDetailsProps> = ({orderId}) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);
 
  //Directly compute table from id
  const selectedTable = order.tables.find((table) => table._id === order.tableId);

  const navigate = useNavigate();

  const handleBook = async () => {
    await dispatch(addTableToOrder({ orderId: orderId, tableId: selectedTable?._id as string }));
    navigate(`/beach-restaurant/menu/${orderId}`)
  }

  return (
    <div className="h-full flex flex-col justify-between gap-5 bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40]">
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-[1rem] text-[#444444]">
            {selectedTable?.name ?? "No Table Selected"}
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
          className="mt-12 w-full text-[0.75rem] text-[#FEFEFE] cursor-pointer"
          value="primary"
          disabled={!selectedTable} // prevent booking when nothing selected
          onClick={handleBook}
        >
          Book
        </Button>
      </div>
    </div>
  );
};

export default TableDetails;
