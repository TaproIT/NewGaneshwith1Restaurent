import { useEffect, useState } from "react";
import UserTableSkeleton from "@/component/skeleton/UserTableSkeleton";
import { Card } from "@/components/ui/card";
import { api } from "@/api/axios";
import type { Booking } from "@/types/bookingUpdate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type BookingWithSwitch = Booking & {
  roomSwitchingHappened?: boolean; 
};

type CompletedBooking = BookingWithSwitch & {
  checkIn: string;
  checkOut: string;
  totalBill: number;
};

const Bookings: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<BookingWithSwitch[]>([]);
  const [completedBookings, setCompletedBookings] = useState<
    CompletedBooking[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [showCompleted, setShowCompleted] = useState(false); // 🔥 Toggle state

  const navigate = useNavigate();

  // =============================
  // Fetch active bookings
  // =============================
  const fetchActiveBookings = async (
    term = "",
    pageNumber = 1,
    pageSize = limit
  ) => {
    setLoading(true);
    try {
      const res = await api.post("/booking/get-all-active-bookings", {
        searchTerm: term,
        page: pageNumber,
        limit: pageSize,
      });
      setActiveBookings(res.data.bookings || res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch active bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Fetch completed bookings
  // =============================
  const fetchCompletedBookings = async (
    term = "",
    pageNumber = 1,
    pageSize = limit
  ) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/booking/completed?searchTerm=${term}&page=${pageNumber}&limit=${pageSize}`
      );
      setCompletedBookings(res.data.data || []);
      console.log(res.data);
    } catch (error) {
      console.error("Failed to fetch completed bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // Load bookings based on toggle
  // =============================
  const loadBookings = () => {
    if (showCompleted) {
      fetchCompletedBookings(searchTerm.trim(), page, limit);
    } else {
      fetchActiveBookings(searchTerm.trim(), page, limit);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page, limit, showCompleted]);

  // Search handler
  const handleSearch = () => {
    setPage(1);
    loadBookings();
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Button
            onClick={() => {
              setShowCompleted(false);
              setPage(1);
            }}
            variant={showCompleted ? "outline" : "default"}
          >
            Bookings
          </Button>
          <Button
            onClick={() => {
              setShowCompleted(true);
              setPage(1);
            }}
            variant={showCompleted ? "default" : "outline"}
          >
            Completed Checkouts
          </Button>
        </h2>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Booking ID, Guest Name, or Room No"
            className="border rounded-lg px-3 py-2 w-72"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-lg border border-gray-200 shadow-sm h-full overflow-auto pt-0 pb-[180px]">
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Booking Id</th>
                  <th className="py-3 px-4 text-left">Rooms</th>
                  <th className="py-3 px-4 text-left">Is Switched</th>
                  <th className="py-3 px-4 text-left">Guest Name</th>
                  <th className="py-3 px-4 text-left">Guest Count</th>
                  {showCompleted && (
                    <th className="py-3 px-4 text-left">Check Out</th>
                  )}
                  {showCompleted && (
                    <th className="py-3 px-4 text-left">Total Bill</th>
                  )}
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {(showCompleted ? completedBookings : activeBookings).length >
                0 ? (
                  (showCompleted ? completedBookings : activeBookings).map(
                    (bk, index) => (
                      <tr
                        key={bk._id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="py-3 px-4">{bk.uniqueBookingId}</td>
                        <td className="py-3 px-4">
                          {bk.currentRooms?.map((r) => r.roomNo).join(", ") ||
                            "-"}
                        </td>
                        <td className="py-3 px-4">{bk.roomSwitchingHappened ? "Yes" : "No"}</td>
                        <td className="py-3 px-4">{bk.guestName}</td>
                        <td className="py-3 px-4">{bk.totalGuests}</td>
                        {showCompleted && (
                          <td className="py-3 px-4">
                            {new Date(bk.checkOut).toLocaleString()}
                          </td>
                        )}
                        {showCompleted && (
                          <td className="py-3 px-4">
                            {bk.totalBill?.toFixed(2)}
                          </td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <Button
                            onClick={() => {
                              if (showCompleted) {
                                navigate("/completed-checkout-details", {
                                  state: {
                                    id: bk._id,
                                    isCompleted: true,
                                  },
                                });
                              } else {
                                navigate(`/bookings/${bk._id}`);
                              }
                            }}
                          >
                            {showCompleted ? "View" : "Update"}
                          </Button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={showCompleted ? 8 : 6}
                      className="text-center py-8 text-gray-500 italic"
                    >
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border px-2 py-1 rounded-md"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  variant="outline"
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>

                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Bookings;
