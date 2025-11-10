import { useEffect, useState } from "react";
import UserTableSkeleton from "@/component/skeleton/UserTableSkeleton";
import { Card } from "@/components/ui/card";
import { api } from "@/api/axios";
import type { Booking } from "@/types/bookingUpdate"; // import the interface you created
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/booking/get-all-active-bookings");
        setBookings(res.data.bookings || []);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Bookings</h2>
      </div>

      {/* Table */}
      <Card className="rounded-lg border border-gray-200 shadow-sm h-full overflow-y-auto pt-0">
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left">Booking Id</th>
                <th className="py-3 px-4 text-left">Rooms</th>
                <th className="py-3 px-4 text-left">Guest Name</th>
                <th className="py-3 px-4 text-left">Guest Count</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((bk, index) => (
                  <tr
                    key={bk._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">{index + 1}</td>

                    <td className="py-3 px-4">{bk.uniqueBookingId}</td>

                    {/* Join current room numbers */}
                    <td className="py-3 px-4">
                      {bk.currentRooms?.map((r) => r.roomNo).join(", ") || "-"}
                    </td>

                    <td className="py-3 px-4">{bk.guestName}</td>

                    <td className="py-3 px-4">{bk.totalGuests}</td>

                    <td className="py-3 px-4 text-center">
                      <Button onClick={() => navigate(`/bookings/${bk._id}`)}>
                        Update
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Bookings;
