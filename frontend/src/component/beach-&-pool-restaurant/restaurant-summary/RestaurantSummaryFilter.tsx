import { fetchRestaurantSummary } from "@/api/order/get-restaurant-summary-api";
import type { AppDispatch, RootState } from "@/app/store";
import { DatePicker } from "@/component/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/order-util";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RestaurantSummaryList } from "./SummaryList";
import { DownloadExcelButton } from "./DownloadButton";

export const RestaurantSummaryFilterAndCount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { totalIncome, checkInIncome, walkInIncome, summaryList, fetchRestaurantSummaryStatus } = useSelector(
    (state: RootState) => state.restaurantSummary
  );

  const { role } = useSelector(
    (state: RootState) => state.user
  );

  const isAdmin = false;

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = React.useState(
    formatDateLocal(firstDayOfMonth)
  );

  const [endDate, setEndDate] = React.useState(
    formatDateLocal(today)
  );

  const { loading, error } = fetchRestaurantSummaryStatus;


  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(date.toISOString().split("T")[0]);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(date.toISOString().split("T")[0]);
  };

  useEffect(() => {
    dispatch(
      fetchRestaurantSummary({
        startDate: startDate,
        endDate: endDate,
      })
    );
  }, [startDate, endDate, dispatch]);

  useEffect(() => {
    if (error) toast.error(error || "Failed to fetch daily order summary");
  }, [error]);

  const summaryCounts = [
    { label: "Total Income", value: totalIncome },
    { label: "Check IN Income", value: checkInIncome },
    { label: "Walk IN Income", value: walkInIncome },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className={`w-full grid ${isAdmin ? "grid-cols-12" : "grid-cols-6"} gap-2`}>
        {/* Start Date */}
        <div className= {`${isAdmin ? "col-span-2" : "col-span-1"} pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md`}>
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-[#444444]">
                Start: {formatDate(new Date(startDate))}
              </p>
              <div className="bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(startDate)}
                  onDateChange={handleStartDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* End Date */}
        <div className={`${isAdmin ? "col-span-2" : "col-span-1"} pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md`}>
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-[#444444]">
                End: {formatDate(new Date(endDate))}
              </p>
              <div className="bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(endDate)}
                  onDateChange={handleEndDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Customer Type */}
        {/* <div className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-[#444444]">Customer Type</p>
              <select
                value={localCustomerType}
                onChange={handleCustomerTypeChange}
                className="py-2 px-2 w-full bg-[#F4F4F4] rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="WALK_IN">Walk In</option>
              </select>
            </>
          )}
        </div> */}

        {/* Summary Cards */}
        <div className={`${isAdmin ? "col-span-5" : "col-span-3"} grid grid-cols-3 gap-2`}>
          {summaryCounts.map((item, index) => (
          <div
            key={index}
            className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md"
          >
            {loading ? (
              <>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
              </>
            ) : (
              <>
                <p className="text-sm text-[#444444]">{item.label}</p>
                <div className="py-1 w-full flex items-center justify-center bg-[#F4F4F4] rounded-md">
                  <p className="text-sm">{item.value}</p>
                </div>
              </>
            )}
          </div>
        ))}
        </div>

       <div className={`${isAdmin ? "col-span-3" : "col-span-1"}`}>
          <DownloadExcelButton startDate={startDate} endDate={endDate} />
       </div>
      </div>
      
      <RestaurantSummaryList summaryList={summaryList}  />
    </div>
  );
};

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

