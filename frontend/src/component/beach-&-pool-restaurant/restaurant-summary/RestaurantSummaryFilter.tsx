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
import { RestaurantTypes } from "@/lib/enums/order-related-enums";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RestaurantSummaryFilterAndCount: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { totalIncome, checkInIncome, walkInIncome, summaryList, fetchRestaurantSummaryStatus } = useSelector(
    (state: RootState) => state.restaurantSummary
  );

  const { role } = useSelector(
    (state: RootState) => state.user
  );

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = React.useState(
    formatToYMD(firstDayOfMonth)
  );

  const [endDate, setEndDate] = React.useState(
    formatToYMD(today)
  );

  const [restaurantType, setRestaurantType] = React.useState<string>(RestaurantTypes.BEACH.value);

  const isAdmin = (role === 'Super-Admin')  || (role === 'Admin') || (role === 'Reception');

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
        restaurantType: isAdmin ? restaurantType : "",
      })
    );
  }, [startDate, endDate, dispatch, restaurantType]);

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
      <div
        className={`w-full grid ${
          isAdmin ? "grid-cols-12" : "grid-cols-6"
        } gap-2`}
      >
        {/* Start Date */}
        <div
          className={`${
            isAdmin ? "col-span-2" : "col-span-1"
          } pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md`}
        >
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
              <div className="mt-1.5 bg-bg rounded-md">
                <DatePicker
                  defaultDate={new Date(startDate)}
                  onDateChange={handleStartDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* End Date */}
        <div
          className={`${
            isAdmin ? "col-span-2" : "col-span-1"
          } pt-5 py-2 px-2 flex flex-col items-center justify-center bg-[#FEFEFE] rounded-md`}
        >
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
              <div className="mt-1.5 bg-bg rounded-md">
                <DatePicker
                  defaultDate={new Date(endDate)}
                  onDateChange={handleEndDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Restaurant Type */}
        <div
          className={`${
            isAdmin ? "col-span-2 " : "col-span-1 hidden"
          } pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md`}
        >
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </>
          ) : (
            <>
              <p className="text-[0.875rem] text-[#444444]">Restaurant Type</p>

              <Select
                value={restaurantType}
                onValueChange={(value) => setRestaurantType(value)}
              >
                <SelectTrigger className="w-full bg-bg rounded-md text-sm cursor-pointer">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={RestaurantTypes.BEACH.value}>
                    {RestaurantTypes.BEACH.label}
                  </SelectItem>
                  <SelectItem value={RestaurantTypes.POOL.value}>
                    {RestaurantTypes.POOL.value}
                  </SelectItem>
                  <SelectItem value={RestaurantTypes.NEW.value}>
                    {RestaurantTypes.NEW.label}
                  </SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div
          className={`${
            isAdmin ? "col-span-6" : "col-span-4"
          } grid grid-cols-4 gap-2`}
        >
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
                  <div className="mt-1.5  py-1 w-full flex items-center justify-center bg-bg rounded-md">
                    <p className="text-sm">LKR {formatNumber(item.value)}</p>
                  </div>
                </>
              )}
            </div>
          ))}

          <div
            className={`${
              isAdmin ? "col-span-1" : "col-span-1"
            } flex items-center justify-end`}
          >
            <DownloadExcelButton startDate={startDate} endDate={endDate} restaurantType={isAdmin ? restaurantType : ""}  />
          </div>
        </div>
      </div>

      <RestaurantSummaryList summaryList={summaryList} loading={loading}/>
    </div>
  );
};

