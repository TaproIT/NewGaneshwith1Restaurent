import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/api/axios";
import { toast } from "react-toastify";

type Booking = {
  bookingId: string;
  guestName: string;
  roomNo: string;
  checkIn: string;
  checkOut: string;
  perDayPrice: number;
  totalRoomPrice: number;
  totalGuests: number;
  grossTotal: number;
  serviceCharge: number;
  netIncome: number;
  nights: number;
  bookingCommission: number | null;
  totalBreakfastPrice: number | null;
};

const Reports: React.FC = () => {
  const [date, setDate] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date("2025-01-01"),
    to: new Date("2025-01-04"),
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedReports, setSavedReports] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch reports from API
  const fetchReports = async () => {
    if (!date.from || !date.to) return;

    const start = format(date.from, "yyyy-MM-dd");
    const end = format(date.to, "yyyy-MM-dd");

    setLoading(true);

    try {
      const res = await api.get(`/reports/?start=${start}&end=${end}`);
      const apiBookings: Booking[] = res.data.bookings || [];
      const apiSavedReports: Booking[] = res.data.savedReports || [];

      const formattedBookings = apiBookings.map((b) => ({
        ...b,
        bookingCommission: null,
        totalBreakfastPrice: null,
        grossTotal: b.totalRoomPrice,
      }));

      setBookings(formattedBookings);
      setSavedReports(apiSavedReports);
    } catch (err) {
      toast.error(`Error fetching reports: ${err}`);
      console.error(err);
    }

    setLoading(false);
  };

  // Update bookingCommission or totalBreakfastPrice
  const updateBookingField = (
    bookingId: string,
    field: "totalBreakfastPrice" | "bookingCommission",
    value: number | null
  ) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === bookingId) {
          const updated = { ...b, [field]: value };
          updated.grossTotal =
            updated.totalRoomPrice -
            (updated.bookingCommission || 0) -
            (updated.totalBreakfastPrice || 0);
          return updated;
        }
        return b;
      })
    );
  };

  // Save reports locally
  const generateReports = () => {
    setSavedReports([...savedReports, ...bookings]);
    toast.success("Saved successfully!");
  };

  // Download Excel via API
  const downloadExcel = async () => {
    if (!date.from || !date.to) {
      toast.error("Please select a date range first!");
      return;
    }

    const start = format(date.from, "yyyy-MM-dd");
    const end = format(date.to, "yyyy-MM-dd");

    try {
      const res = await api.get(`/reports/export/?start=${start}&end=${end}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Reports_${start}_to_${end}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Excel file downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel file!");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      {/* Date Range Selector + Buttons */}
      <Card className="mb-2">
        <CardContent className="p-4">
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

              <Button onClick={fetchReports} disabled={loading}>
                {loading ? "Loading..." : "Load Reports"}
              </Button>
            </div>

            <div className="flex gap-2 mt-2 md:mt-0">
              <Button onClick={generateReports}>Save</Button>
              <Button onClick={downloadExcel} variant="outline">
                Download Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <div className="h-[400px] overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-3">Room No</th>
              <th className="p-3">Person Count</th>
              <th className="p-3">Guest Name</th>
              <th className="p-3">CheckIn Date</th>
              <th className="p-3">CheckOut Date</th>
              <th className="p-3">Room Price</th>
              <th className="p-3">Total Night</th>
              <th className="p-3">Total Room Price</th>
              <th className="p-3">Booking Commission</th>
              <th className="p-3">Total Breakfast Price</th>
              <th className="p-3">Gross Income</th>
              <th className="p-3">Service Charge</th>
              <th className="p-3">Net Income</th>
            </tr>
          </thead>

          <tbody>
            {/* No data row */}
            {bookings.length === 0 && savedReports.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="p-6 text-center italic text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}

            {/* Editable bookings */}
            {bookings.map((b) => (
              <tr key={b.bookingId} className="border-b">
                <td className="p-3">{b.roomNo}</td>
                <td className="p-3">{b.totalGuests}</td>
                <td className="p-3 whitespace-nowrap">{b.guestName}</td>
                <td className="p-3 whitespace-nowrap">
                  {format(new Date(b.checkIn), "yyyy-MM-dd")}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {format(new Date(b.checkOut), "yyyy-MM-dd")}
                </td>
                <td className="p-3">{b.perDayPrice}</td>
                <td className="p-3">{b.nights}</td>
                <td className="p-3">{b.totalRoomPrice}</td>

                {/* Booking Commission */}
                <td className="p-3">
                  <Input
                    type="number"
                    value={b.bookingCommission ?? ""}
                    placeholder="Enter value here"
                    onChange={(e) => {
                      let value =
                        e.target.value === "" ? null : Number(e.target.value);
                      if (value !== null) {
                        if (value < 0) value = 0;
                        if (value > b.grossTotal) value = b.grossTotal;
                      }
                      updateBookingField(
                        b.bookingId,
                        "bookingCommission",
                        value
                      );
                    }}
                  />
                </td>

                {/* Total Breakfast Price */}
                <td className="p-3">
                  <Input
                    type="number"
                    value={b.totalBreakfastPrice ?? ""}
                    placeholder="Enter value here"
                    onChange={(e) => {
                      let value =
                        e.target.value === "" ? null : Number(e.target.value);
                      if (value !== null) {
                        if (value < 0) value = 0;
                        if (value > b.grossTotal) value = b.grossTotal;
                      }
                      updateBookingField(
                        b.bookingId,
                        "totalBreakfastPrice",
                        value
                      );
                    }}
                  />
                </td>

                <td className="p-3">{b.grossTotal}</td>
                <td className="p-3">{b.serviceCharge}</td>
                <td className="p-3">{b.netIncome}</td>
              </tr>
            ))}

            {/* Saved reports */}
            {savedReports.map((b) => (
              <tr key={`saved-${b.bookingId}`} className="border-b bg-gray-50">
                <td className="p-3">{b.roomNo}</td>
                <td className="p-3">{b.totalGuests}</td>
                <td className="p-3 whitespace-nowrap">{b.guestName}</td>
                <td className="p-3 whitespace-nowrap">
                  {format(new Date(b.checkIn), "yyyy-MM-dd")}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {format(new Date(b.checkOut), "yyyy-MM-dd")}
                </td>
                <td className="p-3">{b.perDayPrice}</td>
                <td className="p-3">{b.nights}</td>
                <td className="p-3">{b.totalRoomPrice}</td>

                <td className="p-3">
                  <Input type="number" value={b.bookingCommission ?? 0} disabled />
                </td>
                <td className="p-3">
                  <Input type="number" value={b.totalBreakfastPrice ?? 0} disabled />
                </td>

                <td className="p-3">{b.grossTotal}</td>
                <td className="p-3">{b.serviceCharge.toFixed(2)}</td>
                <td className="p-3">{b.netIncome.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
