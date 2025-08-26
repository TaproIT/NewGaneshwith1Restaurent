import TableDetails from '@/component/beach-&-pool-restaurant/tables/TableDetails'
import TableSelectionSection from '@/component/beach-&-pool-restaurant/tables/TableSelectionSection'
import React from 'react'

const BeachRestaurantTablesPage: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-5"> 
      <div className="col-span-3">
        <TableSelectionSection />
      </div>
      <div className="col-span-1">
        <TableDetails />
      </div>
    </div>
  )
}

export default BeachRestaurantTablesPage
