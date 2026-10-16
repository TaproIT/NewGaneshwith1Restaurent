// import { fetchDailyOrderSummary } from '@/api/order/get-daily-order-summary'
// import { type AppDispatch, type RootState } from '@/app/store'
// import { DatePicker } from '@/component/DatePicker'
// import { setSelectedDate } from '@/features/beach-restaurant/dailySummarySlice'
// import { formatDate } from '@/lib/order-util'
// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { DailyOrdersList } from './DailyOrdersList'
// import { Skeleton } from "@/components/ui/skeleton"
// import { toast } from "react-toastify"

// export const DailyOrderSummaryFilterAndCount:React.FC = () => {
//   const { date: selectedDate, summary, orders, fetchDailyOrderSummaryStatus } =
//     useSelector((state: RootState) => state.dailyOrderSummary)

//   const dispatch = useDispatch<AppDispatch>()

//   const { loading, error } = fetchDailyOrderSummaryStatus;

//    const handleDateChange = (date: Date | undefined) => {
//     if (!date) return;

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     const formattedDate = `${year}-${month}-${day}`;
//     dispatch(setSelectedDate(formattedDate));
//   };

//   useEffect(() => {
//     dispatch(fetchDailyOrderSummary())
//   }, [selectedDate, dispatch])

//   // Show error toast when error is present
//   useEffect(() => {
//     if (error) {
//       toast.error(error || "Failed to fetch daily order summary")
//     }
//   }, [error])

//   const summaryCounts = [
//     { label: "Dine-In Orders", value: summary.dineInCount },
//     { label: "Take Away Orders", value: summary.takeAwayCount },
//     { label: "Save To Room Orders", value: summary.saveToRoomCount },
//   ]

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="w-full grid grid-cols-4 gap-2">
//         {/* Date Picker container */}
//         <div className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md">
//           {loading ? (
//             <>
//               <Skeleton className="h-4 w-24" />
//               <Skeleton className="h-10 w-full rounded-md" />
//             </>
//           ) : (
//             <>
//               <p className="text-[0.875rem] text-[#444444]">
//                 {formatDate(new Date(selectedDate))}
//               </p>
//               <div className="bg-bg rounded-md">
//                 <DatePicker
//                   defaultDate={new Date(selectedDate)}
//                   onDateChange={(date) => {
//                     handleDateChange(date);
//                   }}
//                 />
//               </div>
//             </>
//           )}
//         </div>

//         {/* Summary count containers */}
//         {summaryCounts.map((item, index) => (
//           <div
//             key={index}
//             className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md"
//           >
//             {loading ? (
//               <>
//                 <Skeleton className="h-4 w-24" />
//                 <Skeleton className="h-6 w-full rounded-md" />
//               </>
//             ) : (
//               <>
//                 <p className="text-[0.875rem] text-[#444444]">{item.label}</p>
//                 <div className="py-1 w-full flex items-center justify-center bg-bg rounded-md">
//                   <p className="text-[0.875rem]">{item.value}</p>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//       </div>

//       <DailyOrdersList orders={orders} />
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import { DatePicker } from "@/component/DatePicker";
import { fetchDailyOrderSummary } from "@/api/order/get-daily-order-summary";
import { DailyOrdersList } from "./DailyOrdersList";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { formatToYMD } from "@/lib/order-util";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RestaurantTypes } from "@/lib/enums/order-related-enums";

export const DailyOrderSummaryFilterAndCount: React.FC = () => {
  // Local state for date range
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // NEW: Restaurant type state
  const [restaurantType, setRestaurantType] = useState<string>(RestaurantTypes.BEACH.value);

  const dispatch = useDispatch<AppDispatch>();

  const { summary, orders, fetchDailyOrderSummaryStatus } = useSelector(
    (state: RootState) => state.dailyOrderSummary
  );

   const { role } = useSelector(
    (state: RootState) => state.user
  );

  const isAdmin = (role === 'Super-Admin')  || (role === 'Admin') || (role === 'Reception');

  const { loading, error } = fetchDailyOrderSummaryStatus;

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(formatToYMD(date));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(formatToYMD(date));
  };

  // Fetch summary when filters change
  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchDailyOrderSummary({ startDate, endDate }));
    }
  }, [startDate, endDate, restaurantType, dispatch]);

  // Error popup
  useEffect(() => {
    if (error) {
      toast.error(error || "Failed to fetch daily order summary");
    }
  }, [error]);

  const summaryCounts = [
    { label: "Dine-In Orders", value: summary.dineInCount },
    { label: "Take Away Orders", value: summary.takeAwayCount },
    { label: "Save To Room Orders", value: summary.saveToRoomCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`w-full grid ${
          isAdmin ? "grid-cols-10" : "grid-cols-5"
        } gap-2`}
      >
        {/* Start Date */}
        <div
          className={`${
            isAdmin ? "col-span-2" : "col-span-1"
          } pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md`}
        >
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </>
          ) : (
            <>
              <p className="text-[0.875rem] text-[#444444]">Start Date</p>
              <div className="bg-bg rounded-md">
                <DatePicker
                  defaultDate={startDate ? new Date(startDate) : undefined}
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
          } pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md`}
        >
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </>
          ) : (
            <>
              <p className="text-[0.875rem] text-[#444444]">End Date</p>
              <div className="bg-bg rounded-md">
                <DatePicker
                  defaultDate={endDate ? new Date(endDate) : undefined}
                  onDateChange={handleEndDateChange}
                />
              </div>
            </>
          )}
        </div>

        {/* NEW: Restaurant Type Dropdown - Only for Admin */}
        {isAdmin && (
          <div
            className={`${
              isAdmin ? "col-span-2" : "col-span-1"
            } pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md`}
          >
            <p className="text-[0.875rem] text-[#444444]">Restaurant Type</p>

            <Select
              value={restaurantType}
              onValueChange={(value) => setRestaurantType(value)}
            >
              <SelectTrigger className="w-full bg-bg rounded-md text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                  <SelectItem value={RestaurantTypes.BEACH.value}>{RestaurantTypes.BEACH.label}</SelectItem>
                <SelectItem value={RestaurantTypes.POOL.value}>{RestaurantTypes.POOL.value}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Summary Counter Boxes */}
        <div
          className={`${
            isAdmin ? "col-span-4" : "col-span-3"
          } grid grid-cols-3 gap-2`}
        >
          {summaryCounts.map((item, index) => (
            <div
              key={index}
              className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md"
            >
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full rounded-md" />
                </>
              ) : (
                <>
                  <p className="text-[0.875rem] text-[#444444] text-center">{item.label}</p>
                  <div className="py-1 w-full flex items-center justify-center bg-bg rounded-md">
                    <p className="text-[0.875rem]">{item.value}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <DailyOrdersList orders={orders} />
    </div>
  );
};


