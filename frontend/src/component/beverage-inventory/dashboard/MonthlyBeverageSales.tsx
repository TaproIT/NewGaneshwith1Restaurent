import React, { useEffect, useState } from "react";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import BeverageSummarySkeleton from "@/component/skeleton/BeverageSummarySkeleton";

type LiquorItem = {
  liquorId: string;
  liquorName: string;
  totalAmount: number;
};

type SummaryGroup = {
  summary: LiquorItem[];
  totalLiquorAmount: number;
};

type BeverageSummary = {
  [key: string]: SummaryGroup;
};

const MonthlyBeverageSales: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [location, setLocation] = useState<"Pool" | "Beach" | "New">("Pool"); // toggle
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BeverageSummary | null>(null);

  const fetchData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);

    try {
      const res = await api.get(
        `/order/beverage/sold/liquor-summary?startDate=${startDate}&endDate=${endDate}`
      );

      // Filter by location if the API returns all data
      const allData: BeverageSummary = res.data.data.summaryByRestaurantType;
      const filteredData: BeverageSummary = {};
      Object.entries(allData).forEach(([restaurant, group]) => {
        if (restaurant.includes(location)) {
          filteredData[restaurant] = group;
        }
      });

      setSummary(filteredData);
    } catch (error) {
      console.error("Error fetching liquor summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location]); // refetch when location changes

  return (
    <div className="p-4 bg-mainWhite rounded-2xl w-full h-full">
      {/* ---------- Date Range & Location Toggle ---------- */}
      <div className="flex items-center gap-4 mb-4  justify-between">
        <div className="flex gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={fetchData}>Search</Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={location === "Pool" ? "default" : "outline"}
            onClick={() => setLocation("Pool")}
          >
            Pool
          </Button>
          <Button
            variant={location === "Beach" ? "default" : "outline"}
            onClick={() => setLocation("Beach")}
          >
            Beach
          </Button>
          <Button
            variant={location === "New" ? "default" : "outline"}
            onClick={() => setLocation("New")}
          >
            New Restaurant
          </Button>
        </div>

      </div>

      {/* ---------- Loading ---------- */}
      {loading && <BeverageSummarySkeleton />}

      {/* ---------- No Data ---------- */}
      {!loading && !summary && (
        <p className="text-center py-4">No data available...</p>
      )}

      {/* ---------- Table Rendering ---------- */}
      {!loading && summary && (
        <div className="space-y-6">
          {Object.entries(summary).map(([restaurant, group]) => (
            <div
              key={restaurant}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <h2 className="font-semibold text-lg mb-3">{restaurant}</h2>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Liquor Name</th>
                    <th className="py-2">Amount (ml)</th>
                  </tr>
                </thead>
                <tbody>
                  {group.summary.map((item) => (
                    <tr key={item.liquorId} className="border-b">
                      <td className="py-2">{item.liquorName}</td>
                      <td className="py-2">{item.totalAmount}</td>
                    </tr>
                  ))}

                  {/* Total row */}
                  <tr className="font-bold">
                    <td className="py-2">Total</td>
                    <td className="py-2">{group.totalLiquorAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyBeverageSales;
