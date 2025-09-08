import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";

const Menu = () => {
    const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <Button className="w-48 cursor-pointer" onClick={() =>navigate('/onboarding')}>Reception</Button>
      <Button className="w-48 cursor-pointer" onClick={() =>navigate('/beverage-inventory/dashboard')}>Beverage Inventory</Button>
    </div>
  )
};

export default Menu;
