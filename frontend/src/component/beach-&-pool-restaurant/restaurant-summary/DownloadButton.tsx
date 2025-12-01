import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Sheet } from "lucide-react";
import { toast } from "react-toastify";

interface DownloadExcelButtonProps {
    startDate: string;
    endDate: string;
    restaurantType?: string;
}
export const DownloadExcelButton:React.FC <DownloadExcelButtonProps> = ({startDate, endDate, restaurantType}) => {
  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/order/restaurant/excel-report?startDate=${startDate}&endDate=${endDate}&restaurantType=${restaurantType ? restaurantType : ""}`,
        {
          responseType: "blob",
        }
      );

      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Restaurant_Reports_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel downloaded!");
    } catch {
      toast.error("Failed to download Excel!");
    }
  };

  return (
    <Button
      onClick={handleDownload}
      className="!h-auto flex flex-col cursor-pointer"
    >
      Download Excel
      <Sheet size={18} />
    </Button>
  );
};
