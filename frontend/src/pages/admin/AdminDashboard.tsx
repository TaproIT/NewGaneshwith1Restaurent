import React from "react";
import Dashboard from "./beverage_inventory/Dashboard";
import ReceptionDashboard from "@/component/reception/ReceptionDashboard";
import PoolResturantDashboard from "@/component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/PoolResturantDashboard";
import BeachResturantDashboard from "@/component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/BeachResturantDashboard";

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)] overflow-auto">
      <div className="text-sm font-medium text-gray ml-2">Reception</div>
      <ReceptionDashboard />
      <div className="text-sm font-medium text-gray ml-2">Pool Restaurant</div>
      <PoolResturantDashboard />
      <div className="text-sm font-medium text-gray ml-2">Beach Restaurant</div>
      <BeachResturantDashboard />
      <div className="text-sm font-medium text-gray ml-2">Beverage Inventory</div>
      <Dashboard />
    </div>
  )
};

export default AdminDashboard;
