import { fetchRestaurantSummary } from "@/api/order/get-restaurant-summary-api";
import type { AppDispatch, RootState } from "@/app/store";
import { DatePicker } from "@/component/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatToYMD } from "@/lib/order-util";
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

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = React.useState(
    formatToYMD(firstDayOfMonth)
  );

  const [endDate, setEndDate] = React.useState(
    formatToYMD(today)
  );

  const { loading, error } = fetchRestaurantSummaryStatus;


  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(formatToYMD(date));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(formatToYMD(date));
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
    { label: "CheckIN Income", value: checkInIncome },
    { label: "WalkIN Income", value: walkInIncome },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full grid grid-cols-6 gap-2">
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
                Start Date
              </p>
              <div className="mt-1.5 bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(startDate)}
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
                End Date
              </p>
              <div className="mt-1.5 bg-[#F4F4F4] rounded-md">
                <DatePicker
                  defaultDate={new Date(endDate)}
                  onDateChange={handleEndDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="col-span-4 grid grid-cols-4 gap-2">
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
                  <p className="text-sm text-[#444444] text-center">{item.label}</p>
                  <div className="mt-1.5  py-1 w-full flex items-center justify-center bg-[#F4F4F4] rounded-md">
                    <p className="text-sm">LKR {formatNumber(item.value)}</p>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="col-span-1 flex items-center justify-end">
            <DownloadExcelButton startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>

      <RestaurantSummaryList summaryList={summaryList} loading={loading}/>
    </div>
  );
};

