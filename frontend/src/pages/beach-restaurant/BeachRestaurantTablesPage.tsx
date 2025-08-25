import TableSelectionSection from '@/component/beach-&-pool-restaurant/tables/TableSelectionSection'
import React from 'react'

const BeachRestaurantTablesPage: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-5 h-[calc(100vh-140px)]">
      <div className="p-4 col-span-3 bg-mainWhite rounded-lg">
        <TableSelectionSection />
      </div>
      <div className="col-span-1">shas</div>
    </div>
  )
}

export default BeachRestaurantTablesPage
