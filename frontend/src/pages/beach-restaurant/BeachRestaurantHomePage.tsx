import { type AppDispatch } from '@/app/store'
import CustomerType from '@/component/beach-&-pool-restaurant/home/CustomerType'
import GetStartedButton from '@/component/beach-&-pool-restaurant/home/GetStartedButton'
import GuestDetails from '@/component/beach-&-pool-restaurant/home/GuestDetails'
import ServiceType from '@/component/beach-&-pool-restaurant/home/ServiceType'
import { ScrollArea } from '@/components/ui/scroll-area'
import { resetOrderData } from '@/features/beach-restaurant/orderSlice'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const BeachRestaurantHomePage:React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(resetOrderData());
  },[])

  return (
    <ScrollArea className="h-[calc(100vh-150px)] 2xl:h-[calc(100vh-150px)] w-full bg-mainWhite">
      <div className="p-10 2xl:p-18 flex flex-col gap-10">
        <CustomerType />
        <ServiceType />
        <GuestDetails />
        <GetStartedButton />
      </div>
    </ScrollArea>
  );
}

export default BeachRestaurantHomePage
