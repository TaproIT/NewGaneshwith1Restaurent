import { fetchOrderById } from '@/api/order/get-order-data-api';
import { type AppDispatch, type RootState } from '@/app/store';
import FoodMenuDetailsSection from '@/component/beach-&-pool-restaurant/menu/FoodMenuDetailsSection';
import OrderTokenDialog from '@/component/beach-&-pool-restaurant/order-details/OrderTokenModal';
import OrderDetailsSection from '@/component/beach-&-pool-restaurant/menu/OrderDetailsSection';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import AddFoodItemSection from '@/component/beach-&-pool-restaurant/menu/AddFoodItemSection';
import AddCategorySection from '@/component/beach-&-pool-restaurant/menu/AddCategorySection';
import OrderBillDetailsModal from '@/component/beach-&-pool-restaurant/order-details/OrderBillDetailsModal';
import { setIsClickAddNewFoodItem } from '@/features/beach-restaurant/foodSlice';

const BeachRestaurantMenuPage: React.FC = () => {
  const orderTokens = useSelector((state:RootState) => state.order.orderTokens);
  const isClickAddNewFoodItem = useSelector((state:RootState) => state.food.isClickAddNewFoodItem);
  const isClickedAddFoodCategory = useSelector((state:RootState) => state.foodCategory.isClickedAddFoodCategory);
  const dispatch = useDispatch<AppDispatch>();

  const param = useParams();
  const id = param?.id as string;

  useEffect(() => {
    if (id === "0") return;
    dispatch(fetchOrderById(id));
  }, [id, orderTokens?.length]);

  useEffect(() => {
    dispatch(setIsClickAddNewFoodItem(true));
  },[])

  return (
    <div className="grid grid-cols-7 gap-3">
      <div className="col-span-5">
        <FoodMenuDetailsSection id={id} />
      </div>
      <div className="col-span-2">
        {
          id==="0" ? (
            isClickAddNewFoodItem ? (<AddFoodItemSection/>)
             : isClickedAddFoodCategory ? (<AddCategorySection />) 
               :(<></>)
          ): (
            <OrderDetailsSection />
          )
        }
      </div>
      <OrderTokenDialog id={id} />
      <OrderBillDetailsModal id={id} />
    </div>
  )
}

export default BeachRestaurantMenuPage
