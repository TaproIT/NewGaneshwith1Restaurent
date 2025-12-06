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
  const [loadingSave, setLoadingSave] = useState(false);

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
      const apiSavedReports: Booking[] = res.data.reports || [];

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
  value: number | null,
  roomNumber: string,
) => {
  const updateFn = (list: Booking[]) =>
    list.map((b) => {
      if (b.bookingId === bookingId && b.roomNo === roomNumber) {
        const updated = { ...b, [field]: value };

        updated.grossTotal =
          updated.totalRoomPrice -
          (updated.bookingCommission || 0) -
          (updated.totalBreakfastPrice || 0);

        updated.netIncome =
          updated.grossTotal - (updated.serviceCharge || 0);

        return updated;
      }
      return b;
    });

  // Update editable bookings
  setBookings((prev) => updateFn(prev));

  // Update saved reports too
  setSavedReports((prev) => updateFn(prev));
};


  const saveToBackend = async () => {
  // Validate only new bookings (saved already filled)
  for (const b of bookings) {
    if (b.bookingCommission === null || b.totalBreakfastPrice === null) {
      return toast.error("Please fill all values");
    }
  }

  setLoadingSave(true);

  try {
    // Create unified array (savedReports + bookings)
    const mergedData = [
      ...savedReports,
      ...bookings.map((b) => ({
        ...b,
        currencyRate: 1,
        breakfast: "Included",
      })),
    ];

    // Send to backend
    await api.post("/reports", mergedData);

    toast.success("Reports saved successfully!");

    // Merge state too
    setSavedReports(mergedData);
    setBookings([]); // clear new ones
  } catch {
    toast.error("Failed to save reports");
  } finally {
    setLoadingSave(false);
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
        loadingSave={loadingSave}
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
