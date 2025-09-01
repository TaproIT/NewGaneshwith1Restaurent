import { fetchOrderById } from '@/api/order/order-initial-data-api'
import { type AppDispatch, type RootState } from '@/app/store'
import FoodMenuDetailsSection from '@/component/beach-&-pool-restaurant/menu/FoodMenuDetailsSection'
import OrderTokenDialog from '@/component/beach-&-pool-restaurant/menu/order-details/OrderTokenModal'
import OrderDetailsSection from '@/component/beach-&-pool-restaurant/menu/OrderDetailsSection'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

const BeachRestaurantMenuPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state:RootState) => state.order);
  const param = useParams();
  const id = param?.id as string;

  useEffect(() => {
    if (!id) return;
    dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  return (
    <div className="grid grid-cols-7 gap-3">
      <div className="col-span-5">
        <FoodMenuDetailsSection />
      </div>
      <div className="col-span-2">
        <OrderDetailsSection />
      </div>
      <OrderTokenDialog />
    </div>
  )
}

export default BeachRestaurantMenuPage
