import { api } from "@/api/axios";
import MonthlyBeverageSales from "@/component/beverage-inventory/dashboard/MonthlyBeverageSales";
import OutOfStock from "@/component/beverage-inventory/dashboard/OutOfStock";
import Restock from "@/component/beverage-inventory/dashboard/Restock";
import TotalInStock from "@/component/beverage-inventory/dashboard/TotalInStock";
import type { BeverageItem } from "@/types/BeverageItem";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


const Dashboard = () => {
    const [beverageItems, setBeverageItems] = useState<BeverageItem[]>([]);

    useEffect(() => {
        const fetchAllBeverageItems = async () => {
            try {
                const response = await api.get("/beverages");
                setBeverageItems(response.data.data);
            } catch (error) {
                toast.error("Error fetching beverage items");
            }
        }

            fetchAllBeverageItems()
    }, [])

  return (
    <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-5">
            <TotalInStock items={beverageItems} />
            <OutOfStock />
            <Restock />
        </div>

        <MonthlyBeverageSales />
    </div>
  )
};

export default Dashboard;
