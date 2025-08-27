import FoodMenuDetailsSection from '@/component/beach-&-pool-restaurant/menu/FoodMenuDetailsSection'
import OrderDetailsSection from '@/component/beach-&-pool-restaurant/menu/OrderDetailsSection'
import React from 'react'

const BeachRestaurantMenuPage:React.FC = () => {
  return (
    <div className="grid grid-cols-7 gap-3">
      <div className="col-span-5">
         <FoodMenuDetailsSection />
      </div>
       <div className="col-span-2">
         <OrderDetailsSection />
      </div>
    </div>
  )
}

export default BeachRestaurantMenuPage
