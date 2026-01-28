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
import { Loader2, Printer, Search } from "lucide-react";
import { getPrinter } from "@/util/printerConfig";
import { DatePicker } from "@/component/DatePicker";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchCompletedOrders } from "@/api/order/get-completed-orders";
import { setSearchText, setFromDate, setToDate } from "@/features/beach-restaurant/completedOrdersSlice";

declare global {
  interface Window {
    qz: any;
  }
}

interface CompletedOrder {
  _id: string;
  orderNumber: string;
  roomNumber: string;
  guestName: string;
  customerType: string;
  serviceType: string;
  restaurantType: string;
  subTotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  totalBill: number;
  paymentMethod: string;
  createdAt: string;
  orderTokens: Array<{
    _id: string;
    foodOrders: Array<{
      title: string;
      quantity: number;
      price: number;
    }>;
    beverageOrders: Array<{
      title: string;
      quantity: number;
      price: number;
    }>;
  }>;
}

const CompletedOrdersList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, fromDate, toDate, searchText, limit, totalOrders, totalPages, fetchCompletedOrdersStatus } = useSelector(
    (state: RootState) => state.completedOrders
  );
  const { loading, error } = fetchCompletedOrdersStatus;

  const [printingId, setPrintingId] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState<number>(1);

  // Load QZ Tray
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("✅ QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

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

  /**
   * Format item line for thermal printer
   */
  function formatItemLine(name: string, qty: number, price: number) {
    const totalWidth = 42;
    const qtyWidth = 3;
    const priceWidth = 9;
    const maxNameLength = totalWidth - qtyWidth - priceWidth;

    const priceStr = price.toFixed(2);

    const lines: string[] = [];
    let remaining = name;
    while (remaining.length > maxNameLength) {
      lines.push(remaining.substring(0, maxNameLength));
      remaining = remaining.substring(maxNameLength);
    }
    lines.push(remaining);

    const firstLine =
      lines[0].padEnd(maxNameLength, " ") +
      qty.toString().padStart(qtyWidth, " ") +
      priceStr.padStart(priceWidth, " ");

    const otherLines = lines.slice(1).map((l) => l.padEnd(totalWidth, " "));

    return [firstLine, ...otherLines].join("\n");
  }

  /**
   * Print order receipt
   */
  const printReceipt = async (order: CompletedOrder) => {
    if (!window.qz) {
      toast.error("QZ Tray not loaded yet!");
      return;
    }

    setPrintingId(order._id);

    const qz = window.qz;
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("✅ Connected to QZ Tray");
      }

      const printerName = await getPrinter('thermal');
      console.log("🖨️ Using printer:", printerName);
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      const totalWidth = 42;
      const qtyWidth = 3;
      const priceWidth = 9;
      const maxNameLength = totalWidth - qtyWidth - priceWidth;

      const itemHeader =
        "Item".padEnd(maxNameLength, " ") +
        "Qty".padStart(qtyWidth, " ") +
        "Price".padStart(priceWidth, " ");

      const isFreeBill = order.paymentMethod === "Free Bill";

      let receiptData =
        ESC + "@" + // init
        ESC + "a" + "\x01" + // center
        "==========================================\n" +
        `${order.restaurantType === "Beach" ? "GANESH GARDEN BEACH CABANA" : "MARAKOLLIYA BEACH RESORT"}\n` +
        `${order.restaurantType === "Beach" ? "MAHI MAHI SEA FOOD RESTAURANT" : "SUNSET POOL BAR & RESTAURANT"}\n` +
        "Tangalle \n" +
        "==========================================\n" +
        ESC + "a" + "\x00" + // left align
        `Order No      : ${order.orderNumber}\n` +
        `Service Type  : ${order.serviceType}\n` +
        `Customer Type : ${order.customerType}\n` +
        `Customer      : ${order.guestName || "Walk-in"}\n` +
        `${order.roomNumber !== "0" ? `Room No       : ${order.roomNumber}\n` : ""}` +
        `Payment Method: ${order.paymentMethod}\n` +
        `Date          : ${new Date(order.createdAt).toLocaleString()}\n` +
        `TP            : ${order.restaurantType === "Beach" ? "+94 472242529 / +94 705505705" : "+94 472244822 / +94 705505705"}\n` +
        "-".repeat(totalWidth) + "\n";

      receiptData += itemHeader + "\n";
      receiptData += "-".repeat(totalWidth) + "\n";

      // Token-wise printing
      (order.orderTokens || []).forEach((token) => {
        receiptData += ` \n`;

        const allItems = [
          ...(token.foodOrders || []),
          ...(token.beverageOrders || []),
        ];

        receiptData += allItems
          .map((item: any) =>
            formatItemLine(item.title, item.quantity, item.price * item.quantity)
          )
          .join("\n") + "\n\n";
      });

      // Totals
      const padKey = (label: string) => label.padEnd(totalWidth - 12, " ");
      const amountPad = (amt: number) => `${amt.toFixed(2)} LKR`.padStart(12, " ");

      receiptData += "-".repeat(totalWidth) + "\n";
      receiptData += padKey("Subtotal:") + amountPad(isFreeBill ? 0 : order.subTotal) + "\n";
      receiptData += padKey("Service (10%):") + amountPad(isFreeBill ? 0 : order.serviceCharge) + "\n";
      receiptData += padKey(`Discount (${order.discount}%):`) + amountPad(isFreeBill ? 0 : -((order.discount / 100) * order.subTotal)) + "\n";
      receiptData += padKey("TOTAL BILL:") + amountPad(isFreeBill ? 0 : order.totalBill) + "\n";
      receiptData += "=".repeat(totalWidth) + "\n";

      receiptData +=
        ESC + "a" + "\x01" + // center
        "       Thank you! Come again!       \n\n\n" +
        "      \n\n\n" +
        GS + "V" + "\x00"; // cut

      await qz.print(config, [{ type: "raw", format: "plain", data: receiptData }]);
      console.log("✅ Bill printed successfully!");
      toast.success("Receipt printed successfully!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      toast.error("Print failed! Please check QZ Tray or printer connection.");
    } finally {
      setPrintingId(null);
    }
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
                            onClick={() => printReceipt(order)}
                            disabled={printingId === order._id}
                            variant="outline"
                          >
                            {printingId === order._id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Printing...
                              </>
                            ) : (
                              <>
                                <Printer className="w-4 h-4" />
                                Print
                              </>
                            )}
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
    </div>
  );
};

export default CompletedOrdersList;
