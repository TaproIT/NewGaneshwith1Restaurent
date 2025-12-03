import { RestaurantSummaryFilterAndCount } from '@/component/beach-&-pool-restaurant/restaurant-summary/RestaurantSummaryFilter'
import React from 'react'

const RestaurantSummaryPage:React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-3">
      <div className="col-span-7">
         <RestaurantSummaryFilterAndCount />
      </div>
    </div>
  )
}

export default RestaurantSummaryPage