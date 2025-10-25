import DailyOrderDetailsSection from '@/component/beach-&-pool-restaurant/daily-summary/DailyOrderDetailSection'
import { DailyOrderSummaryFilterAndCount } from '@/component/beach-&-pool-restaurant/daily-summary/DailyOrderSummaryFilterAndCount'
import React from 'react'

const BeachRestaurantDailySummaryPage:React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-3">
      <div className="col-span-5">
         <DailyOrderSummaryFilterAndCount />
      </div>
      <div className="col-span-2">
         <DailyOrderDetailsSection />
      </div>
    </div>
  )
}

export default BeachRestaurantDailySummaryPage