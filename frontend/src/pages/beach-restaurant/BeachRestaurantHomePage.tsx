import CustomerType from '@/component/beach-&-pool-restaurant/home/CustomerType'
import GetStartedButton from '@/component/beach-&-pool-restaurant/home/GetStartedButton'
import GuestDetails from '@/component/beach-&-pool-restaurant/home/GuestDetails'
import ServiceType from '@/component/beach-&-pool-restaurant/home/ServiceType'
import React from 'react'

const BeachRestaurantHomePage:React.FC = () => {
  return (
    <div className="p-18 flex flex-col gap-10 bg-mainWhite h-[calc(100vh-140px)]">
      <CustomerType />
      <ServiceType />
      <GuestDetails />
      <GetStartedButton />
    </div>
  )
}

export default BeachRestaurantHomePage
