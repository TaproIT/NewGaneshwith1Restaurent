import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import UserTableSkeleton from "@/component/skeleton/UserTableSkeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { Printer, Search } from "lucide-react";
import { DatePicker } from "@/component/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchCompletedOrders } from "@/api/order/get-completed-orders";
import { setSearchText, setFromDate, setToDate } from "@/features/beach-restaurant/completedOrdersSlice";
import CompletedOrderPrintModal from "./CompletedOrderPrintModal";
import type { CompletedOrder } from "@/types/completed-order";

const CompletedOrdersList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, fromDate, toDate, searchText, limit, totalOrders, totalPages, fetchCompletedOrdersStatus } = useSelector(
    (state: RootState) => state.completedOrders
  );
  const { loading, error } = fetchCompletedOrdersStatus;

  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  // Fetch completed orders on date/page change
  useEffect(() => {
    dispatch(
      fetchCompletedOrders({
        fromDate,
        toDate,
        searchText,
        page: pageNumber,
        limit,
      })
    );
    console.log("Fetching completed orders with filters:", { fromDate, toDate, searchText, page: pageNumber, limit });
  }, [fromDate, toDate, searchText, pageNumber, limit, dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenBillDetails = (order: CompletedOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Completed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <div className="bg-[#F4F4F4] rounded-md">
                  <DatePicker
                    defaultDate={new Date(fromDate)}
                    onDateChange={(date) => {
                      if (date) {
                        dispatch(setFromDate(date.toISOString()));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <div className="bg-[#F4F4F4] rounded-md">
                  <DatePicker
                    defaultDate={new Date(toDate)}
                    onDateChange={(date) => {
                      if (date) {
                        dispatch(setToDate(date.toISOString()));
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 w-full md:w-auto">
              <Label htmlFor="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Order, room, or name..."
                value={searchText}
                onChange={(e) => dispatch(setSearchText(e.target.value))}
                className="w-full md:w-64"
              />
            </div>
          </div>

          {loading ? (
            <UserTableSkeleton />
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center p-12 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground text-lg">
                  No completed orders found for the selected criteria
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Room No</TableHead>
                      <TableHead>Customer Type</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total Bill</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.guestName || "Walk-in"}</TableCell>
                        <TableCell>
                          {order.roomNumber !== "0" ? (
                            <Badge variant="outline">{order.roomNumber}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.customerType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.serviceType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.paymentMethod === "Cash"
                                ? "default"
                                : order.paymentMethod === "Card"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {order.totalBill.toFixed(2)} LKR
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleOpenBillDetails(order)}
                            variant="outline"
                          >
                            <>
                              <Printer className="w-4 h-4" />
                              Print
                            </>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pageNumber - 1) * limit) + 1} to {Math.min(pageNumber * limit, totalOrders)} of {totalOrders} orders
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber - 1)}
                    disabled={pageNumber === 1 || loading}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => {
                        // Show first page, last page, current page, and adjacent pages
                        return (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          Math.abs(pageNum - pageNumber) <= 1
                        );
                      })
                      .map((pageNum, idx, arr) => (
                        <>
                          {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                            <span key={`ellipsis-${pageNum}`} className="px-2">...</span>
                          )}
                          <Button
                            key={pageNum}
                            variant={pageNumber === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPageNumber(pageNum)}
                            disabled={loading}
                            className="min-w-[40px]"
                          >
                            {pageNum}
                          </Button>
                        </>
                      ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(pageNumber + 1)}
                    disabled={pageNumber === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <CompletedOrderPrintModal order={selectedOrder} onClose={handleCloseModal} />
    </div>
  );
};

export default CompletedOrdersList;
