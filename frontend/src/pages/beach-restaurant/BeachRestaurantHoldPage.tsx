import { fetchHoldOrders } from '@/api/order/get-hold-orders-api';
import type { AppDispatch } from '@/app/store';
import HoldOrderDetailsSection from '@/component/beach-&-pool-restaurant/hold/HoldOrderDetailSection'
import HoldOrderSelectionSection from '@/component/beach-&-pool-restaurant/hold/HoldOrderSelectionSection'
import { useEffect, type FC } from 'react'
import { useDispatch } from 'react-redux';

const BeachRestaurantHoldPage:FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchHoldOrders())
  }, []);
  
  return (
    <div className="grid grid-cols-7 gap-5"> 
      <div className="col-span-5">
        <HoldOrderSelectionSection />
      </div>
      <div className="col-span-2">
        <HoldOrderDetailsSection />
      </div>
    </div>
  )
}

export default BeachRestaurantHoldPage
