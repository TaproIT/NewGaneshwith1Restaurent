import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "@/app/store";
import {
  closeOrderTokenModal,
  setIsPrintedForNewOrderToken,
} from "@/features/beach-restaurant/orderSlice";
import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
import { fetchOrderById } from "@/api/order/get-order-data-api";
import { toast } from "react-toastify";

interface OrderTokenDialogProps {
  id: string;
}

export default function OrderTokenDialog({ id }: OrderTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order);

  useEffect(() => {
    // Dynamically load QZ Tray
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

  /**
   * Formatter that guarantees aligned columns for a monospaced thermal printer.
   * IMPORTANT: This formatter uses fixed-width numeric strings (no thousands separators).
   */
  function formatItemLine(name: string, qty: number, price: number) {
    // configuration (use same values for header & formatting)
    const totalWidth = 42; // characters per line for 80mm (POS80)
    const qtyWidth = 3; // width reserved for quantity (e.g., up to 999)
    const priceWidth = 9; // width reserved for price like "12345.67"
    const maxNameLength = totalWidth - qtyWidth - priceWidth;

    // ensure price string is fixed-width and has no commas
    const priceStr = price.toFixed(2);

    // split long name into chunks that fit the name column
    const lines: string[] = [];
    let remaining = name;
    while (remaining.length > maxNameLength) {
      lines.push(remaining.substring(0, maxNameLength));
      remaining = remaining.substring(maxNameLength);
    }
    lines.push(remaining);

    // first line includes name, qty and price
    const firstLine =
      lines[0].padEnd(maxNameLength, " ") +
      qty.toString().padStart(qtyWidth, " ") +
      priceStr.padStart(priceWidth, " ");

    // additional lines are just the rest of the name (fill full width)
    const otherLines = lines.slice(1).map((l) => l.padEnd(totalWidth, " "));

    return [firstLine, ...otherLines].join("\n");
  }

  /** Print formatted receipt via QZ Tray **/
  const printReceipt = async () => {
    if (!window.qz) {
      alert("QZ Tray not loaded yet!");
      return;
    }

    const qz = window.qz;

    try {
      // Connect to QZ Tray if needed
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("Connected to QZ Tray");
      }

      const printerName = "POS80";
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      // formatting constants (must match formatItemLine)
      const totalWidth = 42;
      const qtyWidth = 3;
      const priceWidth = 9;
      const maxNameLength = totalWidth - qtyWidth - priceWidth;

      // Build header row using same widths so labels line up with data
      const headerLine =
        "Item".padEnd(maxNameLength, " ") +
        "Qty".padStart(qtyWidth, " ") +
        "Price".padStart(priceWidth, " ");

      // Collect items (food + beverage)
      const allItems = [
        ...(order.newOrderToken.foodOrders || []),
        ...(order.newOrderToken.beverageOrders || []),
      ];

      // Format each item: pass total price for that line (qty * unitPrice)
      const formattedItems = allItems
        .map((item: any) =>
          formatItemLine(item.title, item.quantity, item.price * item.quantity)
        )
        .join("\n");

      // Totals line (use consistent spacing; amounts without commas)
      const totalLabelWidth = totalWidth - 12; // leave 12 chars for amount
      const padKey = (label: string) => label.padEnd(totalLabelWidth, " ");
      const amountPad = (amt: number) => `${amt.toFixed(2)} LKR`.padStart(12, " ");

      const totalLine = padKey("TOTAL:") + amountPad(order.newOrderToken.tokenTotalBill);

      // Build full print string
      const printData =
        ESC +
        "@" +
        ESC +
        "a" +
        "\x01" + // center
        "==========================================\n" +
        `${order.restaurantType === "Beach"? "GANESH GARDEN BEACH CABANA" : "MARAKOLLIYA BEACH RESORT"}\n` +
        `${order.restaurantType === "Beach"? "MAHI MAHI SEA FOOD RESTAURANT" : "SUNSET POOL BAR & RESTAURANT"}      \n` +
        "Tangalle \n"+
        "==========================================\n" +
        ESC +
        "a" +
        "\x00" + // left
        `Order Token : ${order.orderTokens.length + 1}\n` +
        `Date        : ${new Date().toLocaleString()}\n` +
        `TP ${order.restaurantType === "Beach"? "+94 47 22 42 529" : "+94 47 22 44 822"}\n` +
        "-".repeat(totalWidth) +
        "\n" +
        headerLine +
        "\n" +
        "-".repeat(totalWidth) +
        "\n" +
        formattedItems +
        "\n" +
        "-".repeat(totalWidth) +
        "\n" +
        totalLine +
        "\n" +
        "=".repeat(totalWidth) +
        "\n" +
        ESC +
        "a" +
        "\x01" +
        "       Thank you! Come again!       \n\n\n" +
        "              \n\n\n" +
        GS +
        "V" +
        "\x00"; // cut
      await qz.print(config, [{ type: "raw", format: "plain", data: printData }]);
      console.log("✅ Print job sent successfully to POS80!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      alert("Print failed! Check console for details.");
    }
  };

  /** Handle Print, Save & Refresh **/
  const handlePrint = async () => {
    try {
      await printReceipt();
      dispatch(setIsPrintedForNewOrderToken(true));
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();
      toast.success("Order updated successfully!");
      dispatch(closeOrderTokenModal());
    } catch (err: any) {
      console.error("❌ Printing error:", err);
      toast.error("Printing failed. Check printer/QZ Tray connection.");
    }
  };

  return (
    <Dialog
      open={order.isOrderTokenOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeOrderTokenModal());
      }}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent className="!p-4 w-[325px] text-[#444444] printable-modal max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="!px-2">Order {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">Token {order.orderTokens.length + 1}</span>
            <span>{order.serviceType}</span>
          </div>

          {order.restaurantTable?._id && (
            <div className="my-5 px-3 flex justify-between text-[0.75rem]">
              <span className="font-medium">Table : {order.restaurantTable.name}</span>
            </div>
          )}

          {/* UI Table Preview */}
          <Table className="mt-5 border border-gray-300">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
                  Item
                </TableHead>
                <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
                  Qty
                </TableHead>
                <TableHead className="text-[0.75rem] text-center">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.newOrderToken.foodOrders.map((item: any) => (
                <TableRow key={item.foodId}>
                  <TableCell className="text-[0.75rem] whitespace-normal break-words border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
              {order.newOrderToken.beverageOrders.map((item: any) => (
                <TableRow key={item.beverageId}>
                  <TableCell className="text-[0.75rem] whitespace-normal break-words border-r border-gray-300">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
            <span>Token Bill</span>
            <span>: {order.newOrderToken.tokenTotalBill.toFixed(2)} LKR</span>
          </div>

          <div className="mb-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
            <span>Total Bill</span>
            <span>: {order.totalBill.toFixed(2)} LKR</span>
          </div>

          <div className="my-3 px-3 flex">
            <Button onClick={handlePrint} className="!w-full cursor-pointer">
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

