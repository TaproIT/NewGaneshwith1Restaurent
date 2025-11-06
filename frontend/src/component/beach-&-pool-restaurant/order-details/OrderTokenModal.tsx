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
   * ✅ Improved formatter — perfectly aligns columns for 80mm (42-char) printer
   */
  function formatItemLine(name: string, qty: number, price: number) {
    const totalWidth = 42; // 80mm printer paper
    const qtyWidth = 5; // column for quantity
    const priceWidth = 9; // column for price
    const maxNameLength = totalWidth - qtyWidth - priceWidth;

    const lines: string[] = [];

    // Split long names into multiple lines
    while (name.length > maxNameLength) {
      lines.push(name.substring(0, maxNameLength));
      name = name.substring(maxNameLength);
    }
    lines.push(name);

    // First line with columns
    const firstLine =
      lines[0].padEnd(maxNameLength, " ") +
      qty.toString().padStart(qtyWidth, " ") +
      price.toFixed(2).padStart(priceWidth, " ");

    // Additional lines only for name overflow
    const otherLines = lines
      .slice(1)
      .map((l) => l.padEnd(totalWidth, " "));

    return [firstLine, ...otherLines].join("\n");
  }

  /** ✅ Print formatted receipt via QZ Tray **/
  const printReceipt = async () => {
    if (!window.qz) {
      alert("QZ Tray not loaded yet!");
      return;
    }

    const qz = window.qz;

    try {
      // Connect to QZ Tray
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("Connected to QZ Tray");
      }

      const printerName = "POS80";
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      // Combine all items
      const allItems = [
        ...(order.newOrderToken.foodOrders || []),
        ...(order.newOrderToken.beverageOrders || []),
      ];

      const formattedItems = allItems
        .map((item) =>
          formatItemLine(
            item.title,
            item.quantity,
            item.price * item.quantity
          )
        )
        .join("\n");

      // Format header and totals
      const totalLine =
        "TOTAL".padEnd(30, " ") +
        `${order.newOrderToken.tokenTotalBill.toFixed(2)} LKR`;

      const printData =
        ESC +
        "@"
        + ESC + "a" + "\x01" +
        "==========================================\n" +
        "        GANESH GARDEN BEACH HOTEL\n" +
        `         ${order.restaurantType.toUpperCase()} RESTAURANT BILL\n` +
        "==========================================\n" +
        ESC + "a" + "\x00" +
        `Order Token : ${order.orderTokens.length + 1}\n` +
        `Date        : ${new Date().toLocaleString()}\n` +
        "------------------------------------------\n" +
        "Item                            Qty     Price\n" +
        "------------------------------------------\n" +
        formattedItems + "\n" +
        "------------------------------------------\n" +
        totalLine + "\n" +
        "==========================================\n" +
        ESC + "a" + "\x01" +
        "       Thank you! Come again!       \n\n\n" +
        "              \n\n\n" +
        GS + "V" + "\x00"; // Paper cut

      const data = [{ type: "raw", format: "plain", data: printData }];

      await qz.print(config, data);
      console.log("✅ Print job sent successfully to POS80!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      alert("Print failed! Check console for details.");
    }
  };

  /** ✅ Handle Print, Save & Refresh **/
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
              <span className="font-medium">
                Table : {order.restaurantTable.name}
              </span>
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
                <TableHead className="text-[0.75rem] text-center">
                  Price
                </TableHead>
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
