import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import { addTableToOrder } from "@/api/order/add-table-to-order-api";
import { toast } from "react-toastify";

type TableDetailsProps = {
  orderId: string;
};

const TableDetails: React.FC<TableDetailsProps> = ({ orderId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  const selectedTable = order.tables.find((table) => table._id === order.tableId);
  const { loading, error } = order.addTableToOrderStatus;

  const navigate = useNavigate();

  const isDisabled = !selectedTable || orderId === "0"

  const handleBook = async () => {
    try {
      await dispatch(
        addTableToOrder({ orderId: orderId, tableId: selectedTable?._id as string })
      ).unwrap(); // unwrap will throw if error
      
      toast.success("Table reserved successfully");

      setTimeout(() => {
         navigate(`/beach-restaurant/menu/${orderId}`);
      }, 1000);

    } catch (err: any) {
      toast.error(err?.message || "Failed to add table to order");
    }
  };

  // Show error toast if Redux error state updates separately
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="h-full flex flex-col justify-between gap-5 bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40] p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <Skeleton className="h-4 w-24 mt-4 rounded-md" />
        <Skeleton className="h-10 w-full mt-8 rounded-md" />
      </div>
    );
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
          disabled={isDisabled}
          onClick={handleBook}
        >
          Book
        </Button>
      </div>
    </div>
  );
};

export default TableDetails;
