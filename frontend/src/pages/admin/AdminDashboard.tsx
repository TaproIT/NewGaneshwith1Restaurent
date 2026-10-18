import React from "react";
import ReceptionDashboard from "@/component/reception/ReceptionDashboard";
import RestaurantDashboard from "@/component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/RestaurantDashboard";

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] overflow-auto">
      <div className="text-sm font-medium text-gray ml-2">Reception</div>
      <ReceptionDashboard />
      <div className="text-sm font-medium text-gray ml-2">Restaurant</div>
      <RestaurantDashboard />
      {/* <div className="text-sm font-medium text-gray ml-2">Beverage Inventory</div>
      <Dashboard /> */}
    </div>
  )
};

export default AdminDashboard;
