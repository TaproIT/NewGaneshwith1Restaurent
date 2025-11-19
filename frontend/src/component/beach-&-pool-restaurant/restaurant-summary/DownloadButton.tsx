import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Sheet } from "lucide-react";

interface DownloadExcelButtonProps {
    startDate: string;
    endDate: string;
}
export const DownloadExcelButton:React.FC <DownloadExcelButtonProps> = ({startDate, endDate}) => {
  const handleDownload = async () => {
    try {
      const response = await api.get(
        `/order/restaurant/excel-report?startDate=${startDate}&endDate=${endDate}`,
      );

      // Create blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Restaurant-Summary-${startDate}-to-${endDate}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to download Excel");
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
