import { fetchAllTables } from '@/api/order/get-tables-api';
import { type AppDispatch } from '@/app/store';
import TableDetails from '@/component/beach-&-pool-restaurant/tables/TableDetails';
//import TableDetails from '@/component/beach-&-pool-restaurant/tables/TableDetails';
import TableSelectionSection from '@/component/beach-&-pool-restaurant/tables/TableSelectionSection';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

const BeachRestaurantTablesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const param = useParams();

  const id = param?.id as string;

  useEffect(() => {
    dispatch(fetchAllTables())
  }, []);

  if (!id) return;
  
  return (
    <div className="grid grid-cols-4 gap-5"> 
      <div className="col-span-3">
        <TableSelectionSection />
      </div>
      <div className="col-span-1">
        <TableDetails orderId={id} />
      </div>
    </div>
  )
}

export default BeachRestaurantTablesPage
