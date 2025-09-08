import { fetchDailyOrderSummary } from '@/api/order/get-daily-order-summary'
import { type AppDispatch, type RootState } from '@/app/store'
import { DatePicker } from '@/component/DatePicker'
import { setSelectedDate } from '@/features/beach-restaurant/dailySummarySlice'
import { formatDate } from '@/lib/order-util'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DailyOrdersList } from './DailyOrdersList'

export const DailyOrderSummaryFilterAndCount:React.FC = () => {
   const { date:selectedDate, summary:summary, orders} = useSelector(
    (state: RootState) => state.dailyOrderSummary
  );
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
     dispatch(fetchDailyOrderSummary())
  },[selectedDate]);

const summaryCounts = [
  { label: "Dine-In Orders", value: summary.dineInCount },
  { label: "Take Away Orders", value: summary.takeAwayCount },
  { label: "Save To Room Orders", value: summary.saveToRoomCount },
];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full grid grid-cols-4 gap-2">
        {/* Date Picker container */}
        <div className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md">
          <p className="text-[0.875rem] text-[#444444]">
            {formatDate(new Date(selectedDate))}
          </p>
          <div className="bg-[#F4F4F4] rounded-md">
            <DatePicker
              defaultDate={new Date(selectedDate)}
              onDateChange={(date) => {
                if (date) {
                  dispatch(setSelectedDate(date.toISOString()))
                }
              }}
            />
          </div>
        </div>

        {/* Summary count containers (mapped) */}
        {summaryCounts.map((item, index) => (
          <div
            key={index}
            className="col-span-1 pt-5 py-2 px-2 flex flex-col items-center justify-center gap-2 bg-[#FEFEFE] rounded-md"
          >
            <p className="text-[0.875rem] text-[#444444]">{item.label}</p>
            <div className="py-1 w-full flex items-center justify-center bg-[#F4F4F4] rounded-md">
              <p className=" text-[0.875rem]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

       <DailyOrdersList orders={orders} />
    </div>
  );
}
