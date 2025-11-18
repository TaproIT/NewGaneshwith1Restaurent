import React, { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { api } from "@/api/axios";
import ReportsHeader from "@/component/reports/ReportsHeader";
import ReportsTable from "@/component/reports/ReportsTable";

export type Booking = {
  bookingId: string;
  guestName: string;
  hotel: string;
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
    from: null,
    to: null,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedReports, setSavedReports] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (!date.from || !date.to) {
      toast.error("Please select both start and end dates.");
      return;
    }

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
      toast.error("Error fetching reports");
      console.error(err);
    }
    setLoading(false);
  };

  const updateBookingField = (
    bookingId: string,
    field: "bookingCommission" | "totalBreakfastPrice",
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

  const saveToBackend = async () => {
    if (bookings.length === 0) return toast.error("No data available!");

    for (const b of bookings) {
      if (b.bookingCommission === null || b.totalBreakfastPrice === null)
        return toast.error("Please fill all values");
    }

    try {
      const payload = bookings.map((b) => ({ ...b, currencyRate: 1, breakfast: "Included" }));
      await api.post("/reports", payload);
      toast.success("Reports saved successfully!");
      setSavedReports((prev) => [...prev, ...bookings]);
      setBookings([]);
    } catch {
      toast.error("Failed to save reports");
    }
  };

  const downloadExcel = async () => {
    if (!date.from || !date.to) return toast.error("Select date range!");

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
      toast.success("Excel downloaded!");
    } catch {
      toast.error("Failed to download Excel!");
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      <ReportsHeader
        date={date}
        setDate={setDate}
        loading={loading}
        onFetchReports={fetchReports}
        onSave={saveToBackend}
        onDownloadExcel={downloadExcel}
      />
      <ReportsTable
        bookings={bookings}
        savedReports={savedReports}
        updateBookingField={updateBookingField}
      />
    </div>
  );
};

export default Reports;
