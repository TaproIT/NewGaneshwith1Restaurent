import { fetchRestaurantSummary } from "@/api/order/get-restaurant-summary-api";
import type { AppDispatch, RootState } from "@/app/store";
import { DatePicker } from "@/component/DatePicker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/order-util";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RestaurantSummaryList } from "./SummaryList";

export const RestaurantSummaryFilterAndCount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // --- LOCAL STATE (instead of Redux)
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [localStartDate, setLocalStartDate] = React.useState(
    formatDateLocal(firstDayOfMonth)
  );

  const [localEndDate, setLocalEndDate] = React.useState(
    formatDateLocal(today)
  );

  const [localCustomerType, setLocalCustomerType] = React.useState("");

  // --- REDUX DATA (only API results)
  const { totalIncome, checkInIncome, walkInIncome, summaryList, fetchRestaurantSummaryStatus } = useSelector(
    (state: RootState) => state.restaurantSummary
  );

  const { loading, error } = fetchRestaurantSummaryStatus;

  // --- Handlers --------------------------------------

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setLocalStartDate(date.toISOString().split("T")[0]);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setLocalEndDate(date.toISOString().split("T")[0]);
  };

  const handleCustomerTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLocalCustomerType(e.target.value);
  };

  // --- FETCH WHEN LOCAL FILTERS CHANGE ----------------
  
  const handleFilter = () => {

  }

  useEffect(() => {
    dispatch(
      fetchRestaurantSummary({
        startDate: localStartDate,
        endDate: localEndDate,
      })
    );
  }, [localStartDate, localEndDate, localCustomerType, dispatch]);

  // --- ERROR HANDLING --------------------------------

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
      <div className="w-full grid grid-cols-5 gap-2">
        {/* Start Date */}
        <div className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-[#444444]">
                Start: {formatDate(new Date(localStartDate))}
              </p>
              <div className="bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(localStartDate)}
                  onDateChange={handleStartDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* End Date */}
        <div className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-sm text-[#444444]">
                End: {formatDate(new Date(localEndDate))}
              </p>
              <div className="bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(localEndDate)}
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

        {/* <Button className="" onClick={handleFilter}>
            Filter
        </Button> */}
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

