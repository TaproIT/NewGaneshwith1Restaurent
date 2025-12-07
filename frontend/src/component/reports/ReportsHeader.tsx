import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ReportsHeaderProps = {
  date: { from: Date | null; to: Date | null };
  setDate: React.Dispatch<
    React.SetStateAction<{ from: Date | null; to: Date | null }>
  >;
  loading: boolean;
  onFetchReports: () => void;
  onSave: () => void;
  onDownloadExcel: () => void;
  loadingSave: boolean;
};

const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  date,
  setDate,
  loading,
  onFetchReports,
  onSave,
  onDownloadExcel,
  loadingSave,
}) => {
  return (
    <Card className="mb-2">
      <CardContent className="p-2 py-0">
        <div className="flex flex-col md:flex-row items-end gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                className="w-48"
                value={date.from ? format(date.from, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setDate({ from: new Date(e.target.value), to: date.to })
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                className="w-48"
                value={date.to ? format(date.to, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setDate({ from: date.from, to: new Date(e.target.value) })
                }
              />
            </div>

            <Button onClick={onFetchReports} disabled={loading}>
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Load Reports"
              )}
            </Button>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-end gap-3 mb-3 text-sm">
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                <span>Updated</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span>Not Updated</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button onClick={onSave}>
                {loadingSave ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Save"
                )}
              </Button>
              <Button onClick={onDownloadExcel} variant="outline">
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsHeader;
