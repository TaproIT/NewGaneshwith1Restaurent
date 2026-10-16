import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import { addTableToOrder } from "@/api/order/add-table-to-order-api";
import { toast } from "react-toastify";
import { Table2 } from "lucide-react";

type TableDetailsProps = {
  orderId: string;
};

const TableDetails: React.FC<TableDetailsProps> = ({ orderId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  const selectedTable = order.tables.find(
    (table) => table._id === order.tableId
  );
  const { loading, error } = order.addTableToOrderStatus;

  const tablesLoading = order.fetchTablesStatus.loading;

  const navigate = useNavigate();

  const isDisabled = !selectedTable || orderId === "0";

  const handleBook = async () => {
    try {
      await dispatch(
        addTableToOrder({
          orderId: orderId,
          tableId: selectedTable?._id as string,
        })
      ).unwrap();

      toast.success("Table reserved successfully");

      setTimeout(() => {
        navigate(`/restaurant/menu/${orderId}`);
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add table to order");
    }
  };

  // Show error toast if Redux error updates
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    
  },[selectedTable])

  // Skeleton while loading
  if (loading || tablesLoading) {
    return (
      <div className="h-full flex flex-col justify-between bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40]">
        <div className="p-4 flex flex-col gap-5">
          {/* Table name + status */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-md" /> {/* table name */}
            <Skeleton className="h-6 w-16 rounded-sm" /> {/* status badge */}
          </div>

          {/* Seats info */}
          <div className="px-1.5 flex items-center gap-6">
            <Skeleton className="h-4 w-12 rounded-md" /> {/* label (Seats) */}
            <Skeleton className="h-4 w-4 rounded-md" /> {/* colon */}
            <Skeleton className="h-4 w-10 rounded-md" /> {/* value (04) */}
          </div>
        </div>

        {/* Bottom action button */}
        <div className="p-4 flex border-[1px] shadow-[0px_-1px_4px_0px_#5C5C5C40]">
          <Skeleton className="h-10 w-full rounded-md" /> {/* Book button */}
        </div>
      </div>
    );
  }

  // Empty state (no table selected)
  if (!selectedTable) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40] p-6 text-center">
        <div className="p-3 flex items-center justify-center bg-primary-soft rounded-full">
          <Table2 size={24} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-gray-700 mt-2">
          No Table Selected
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Please select a table from the list to continue.
        </p>
      </div>
    );
  }

  // Normal table details
  return (
    <div className="h-full flex flex-col justify-between gap-5 bg-mainWhite rounded-2xl border-b-[1px] border-b-[#5C5C5C40]">
      <div className="p-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-[1rem] text-[#444444]">{selectedTable?.name}</p>
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
