import { api } from "@/api/axios";
import MonthlyBeverageSales from "@/component/beverage-inventory/dashboard/MonthlyBeverageSales";
// import OutOfStock from "@/component/beverage-inventory/dashboard/OutOfStock";
import Restock from "@/component/beverage-inventory/dashboard/Restock";
import TotalInStock from "@/component/beverage-inventory/dashboard/TotalInStock";
import StatGridSkeleton from "@/component/skeleton/StatGridSkeleton";
import type { CategoryData } from "@/types/beverageCategory";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [beverageCategoryItems, setBeverageCategoryItems] = useState<
    CategoryData[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    const fetchAllBeverageItems = async () => {
      try {
        const response = await api.get(
          `/beverages/categories/summary?year=${year}&month=${month}`
        );
        setBeverageCategoryItems(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching beverage items");
        setLoading(false);
      }
    };

    fetchAllBeverageItems();
  }, []);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          <TotalInStock items={beverageCategoryItems} />
          {/* <OutOfStock /> */}
          <Restock items={beverageCategoryItems} />
        </div>
      )}

      <MonthlyBeverageSales />
    </div>
  );
};

export default Dashboard;
