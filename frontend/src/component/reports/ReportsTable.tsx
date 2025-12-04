import React from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import type { Booking } from "@/pages/admin/Reports";

type ReportsTableProps = {
  bookings: Booking[];
  savedReports: Booking[];
  updateBookingField: (
    bookingId: string,
    field: "bookingCommission" | "totalBreakfastPrice",
    value: number | null,
    roomNumber: string
  ) => void;
};

const ReportsTable: React.FC<ReportsTableProps> = ({
  bookings,
  savedReports,
  updateBookingField,
}) => {
  return (
    <div className="h-[350px] overflow-auto rounded-xl border">
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
          {bookings.length === 0 && savedReports.length === 0 && (
            <tr>
              <td colSpan={13} className="p-6 text-center italic text-gray-500">
                No data available
              </td>
            </tr>
          )}

          {/* Editable rows */}
          {bookings.map((b, index) => (
            <tr key={`${b.bookingId}-${index}`} className="border-b">
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
                      value,
                      b.roomNo
                    );
                  }}
                />
              </td>

              {/* Breakfast Price */}
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
                      value,
                      b.roomNo
                    );
                  }}
                />
              </td>

              <td className="p-3">{b.grossTotal}</td>
              <td className="p-3">
                {b.bookingCommission == null && b.totalBreakfastPrice == null
                  ? b.serviceCharge.toFixed?.(2)
                  : (b.grossTotal / 11).toFixed(2)}
              </td>
              <td className="p-3">
                {b.bookingCommission == null && b.totalBreakfastPrice == null
                  ? b.netIncome.toFixed?.(2)
                  : (b.grossTotal - b.grossTotal / 11).toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Saved reports */}
          {savedReports.map((b, index) => (
            <tr
              key={`${b.bookingId}-${index}`}
              className="border-b bg-gray-100"
            >
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
                      value,
                      b.roomNo
                    );
                  }}
                />
              </td>
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
                      value,
                      b.roomNo
                    );
                  }}
                />
              </td>

              <td className="p-3">{b.grossTotal}</td>
              <td className="p-3">
                {b.bookingCommission == null && b.totalBreakfastPrice == null
                  ? b.serviceCharge.toFixed?.(2)
                  : (b.grossTotal / 11).toFixed(2)}
              </td>
              <td className="p-3">
                {b.bookingCommission == null && b.totalBreakfastPrice == null
                  ? b.netIncome.toFixed?.(2)
                  : (b.grossTotal - b.grossTotal / 11).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;
