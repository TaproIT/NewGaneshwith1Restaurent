// "use client";
// import { useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useDispatch, useSelector } from "react-redux";
// import { type AppDispatch, type RootState } from "@/app/store";
// import {
//   closeOrderTokenModal,
//   setIsPrintedForNewOrderToken,
// } from "@/features/beach-restaurant/orderSlice";
// import { addNewOrderTokenToOrder } from "@/api/order/add-new-order-token-to-order-api";
// import { fetchOrderById } from "@/api/order/get-order-data-api";
// import { toast } from "react-toastify";

// interface OrderTokenDialogProps {
//   id: string;
// }

// declare global {
//   interface Window {
//     qz: any;
//   }
// }

// export default function OrderTokenDialog({ id }: OrderTokenDialogProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const order = useSelector((state: RootState) => state.order);

//   // 👇 Set your printer name as shown in QZ Tray or Control Panel
//   //const printerName = "POS80"; // or "POS80"

//    useEffect(() => {
//     // Dynamically load QZ Tray
//     const script = document.createElement("script");
//     script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
//     script.onload = () => console.log("✅ QZ Tray script loaded");
//     document.body.appendChild(script);
//   }, []);

//   const printReceipt = async () => {
//     if (!window.qz) {
//       alert("QZ Tray not loaded yet!");
//       return;
//     }

//     const qz = window.qz;

//     try {
//       // Connect if not connected
//       if (!qz.websocket.isActive()) {
//         await qz.websocket.connect();
//         console.log("✅ Connected to QZ Tray");
//       }

//       const printerName = "POS80";
//       const config = qz.configs.create(printerName);

//       const ESC = "\x1B";
//       const GS = "\x1D";

//       const data = [
//         {
//           type: "raw",
//           format: "plain",
//           data:
//             ESC + "@" + // Initialize printer
//             ESC + "a" + "\x01" + // Align center
//             "============================\n" +
//             " GANESH GARDEN BEACH HOTEL\n" +
//             "      POOL RESTAURANT BILL\n" +
//             "============================\n" +
//             ESC + "a" + "\x00" + // Align left
//             "Order Token: 165\n" +
//             "Date: " + new Date().toLocaleString() + "\n" +
//             "----------------------------\n" +
//             "Item                Qty  Price\n" +
//             "----------------------------\n" +
//             "Coffee               2   800\n" +
//             "Sandwich             1   450\n" +
//             "Pasta                1   950\n" +
//             "Orange Juice         3   900\n" +
//             "Cheese Burger        2  1600\n" +
//             "French Fries         1   550\n" +
//             "Grilled Chicken      1  1200\n" +
//             "Mango Juice          2   600\n" +
//             "Club Sandwich        1   750\n" +
//             "Chocolate Shake      1   700\n" +
//             "Tuna Salad           1   650\n" +
//             "Ice Cream Sundae     2   900\n" +
//             "Lemon Tea            1   400\n" +
//             "Fish Curry Rice      1  1100\n" +
//             "Egg Fried Rice       1   950\n" +
//             "Spaghetti Bolognese  1  1050\n" +
//             "Garlic Bread         1   500\n" +
//             "Spring Rolls         1   650\n" +
//             "Prawn Curry          1  1300\n" +
//             "Bottle Water (1L)    2   400\n" +
//             "----------------------------\n" +
//             "TOTAL:                   16500 LKR\n" +
//             "============================\n" +
//             ESC + "a" + "\x01" + // Align center
//             "     Thank you! Come again!    \n\n\n" +
//             "        \n\n\n" +
//             GS + "V" + "\x00", // Cut paper
//         },
//       ];

//       await qz.print(config, data);
//       console.log("✅ Print job sent successfully to POS80!");
//     } catch (err) {
//       console.error("❌ Printing error:", err);
//       alert("Print failed! Check console for details.");
//     }
//   };


//   /** Print handler for ET PT 30 **/
//   const handlePrint = async () => {
//     try {
     
//       await printReceipt();
//       // Update backend state
//       dispatch(setIsPrintedForNewOrderToken(true));
//       await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
//       await dispatch(fetchOrderById(id)).unwrap();
//       toast.success("Order updated successfully!");
//     } catch (err: any) {
//       console.error("❌ Printing error:", err);
//       toast.error("Printing failed. Check printer/QZ Tray connection.");
//     } finally {
//       //await disconnectFromQZ();
//     }
//   };

//   /** Dialog UI **/
//   return (
//     <Dialog
//       open={order.isOrderTokenOpen}
//       onOpenChange={(open) => {
//         if (!open) dispatch(closeOrderTokenModal());
//       }}
//     >
//       <DialogTrigger asChild></DialogTrigger>

//       <DialogContent className="!p-4 w-[325px] text-[#444444] printable-modal">
//         <DialogHeader>
//           <DialogTitle className="!px-2">
//             Order {order.orderNumber}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col">
//           <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
//             <span className="font-medium">
//               Token {order.orderTokens.length + 1}
//             </span>
//             <span>{order.serviceType}</span>
//           </div>

//           {order.restaurantTable?._id && (
//             <div className="my-5 px-3 flex justify-between text-[0.75rem]">
//               <span className="font-medium">
//                 Table : {order.restaurantTable.name}
//               </span>
//             </div>
//           )}

//           <Table className="mt-5 border border-gray-300">
//             <TableHeader>
//               <TableRow className="border-b border-gray-300">
//                 <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
//                   Item
//                 </TableHead>
//                 <TableHead className="text-[0.75rem] text-center border-r border-gray-300">
//                   Qty
//                 </TableHead>
//                 <TableHead className="text-[0.75rem] text-center">
//                   Price
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {order.newOrderToken.foodOrders.map((item: any) => (
//                 <TableRow key={item.foodId}>
//                   <TableCell className="text-[0.75rem] border-r border-gray-300">
//                     {item.title}
//                   </TableCell>
//                   <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
//                     {item.quantity}
//                   </TableCell>
//                   <TableCell className="text-[0.75rem] text-right">
//                     {(item.quantity * item.price).toLocaleString()} LKR
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {order.newOrderToken.beverageOrders.map((item: any) => (
//                 <TableRow key={item.beverageId}>
//                   <TableCell className="text-[0.75rem] border-r border-gray-300">
//                     {item.title}
//                   </TableCell>
//                   <TableCell className="text-[0.75rem] text-center border-r border-gray-300">
//                     {item.quantity}
//                   </TableCell>
//                   <TableCell className="text-[0.75rem] text-right">
//                     {(item.quantity * item.price).toLocaleString()} LKR
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <div className="mt-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
//             <span>Token Bill</span>
//             <span>: {order.newOrderToken.tokenTotalBill.toFixed(2)} LKR</span>
//           </div>

//           <div className="mb-5 flex justify-center gap-2 text-[0.875rem] font-[500]">
//             <span>Total Bill</span>
//             <span>: {order.totalBill.toFixed(2)} LKR</span>
//           </div>

//           <div className="my-3 px-3 flex">
//             <Button onClick={handlePrint} className="!w-full cursor-pointer">
//               Print
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


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

declare global {
  interface Window {
    qz: any;
  }
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


  function formatItemLine(name:string, qty:number, price:number) {
        const maxNameLength = 20; // fits 80mm printers well

        // Split long names into multiple lines
        const lines = [];
        while (name.length > maxNameLength) {
          lines.push(name.substring(0, maxNameLength));
          name = name.substring(maxNameLength);
        }
        lines.push(name); // remaining part

        // Format the first line with qty and price
        const firstLine =
          lines[0].padEnd(maxNameLength, " ") +
          qty.toString().padStart(3, " ") +
          price.toString().padStart(8, " ");
        // Subsequent lines only contain the name part
        const otherLines = lines.slice(1).map((l) => l);

        return [firstLine, ...otherLines].join("\n");
      }


  const printReceipt = async () => {
    if (!window.qz) {
      alert("QZ Tray not loaded yet!");
      return;
    }

    const qz = window.qz;

    try {
      // Connect if not connected
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("Connected to QZ Tray");
      }

      const printerName = "POS80";
      const config = qz.configs.create(printerName);
      const ESC = "\x1B";
      const GS = "\x1D";

      // Combine all items (food + beverage)
      const allItems = [
        ...(order.newOrderToken.foodOrders || []),
        ...(order.newOrderToken.beverageOrders || []),
      ];


      // Format each item line for print
     const formattedItems = allItems
       .map((item) => formatItemLine(item.title, item.quantity, item.price))
       .join("\n");

      // Create dynamic receipt data
      const data = [
        {
          type: "raw",
          format: "plain",
          data:
            ESC +
            "@" + // Initialize printer
            ESC +
            "a" +
            "\x01" + // Align center
            "================================\n" +
            "   GANESH GARDEN BEACH HOTEL\n" +
            "     POOL RESTAURANT BILL\n" +
            "================================\n" +
            ESC +
            "a" +
            "\x00" + // Align left
            `Order Token: ${order.orderTokens.length + 1}\n` +
            `Date: ${new Date().toLocaleString()}\n` +
            "--------------------------------\n" +
            "Item                 Qty   Price\n" +
            "--------------------------------\n" +
            formattedItems +
            "--------------------------------\n" +
            `TOTAL:             ${order.newOrderToken.tokenTotalBill.toFixed(
              2
            )} LKR\n` +
            "================================\n" +
            ESC +
            "a" +
            "\x01" + // Align center
            "      Thank you! Come again!     \n\n\n" +
            "      \n\n\n" +
            GS +
            "V" +
            "\x00", // Cut paper
        },
      ];
      console.log(data);
      await qz.print(config, data);
      console.log("Print job sent successfully to POS80!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      alert("Print failed! Check console for details.");
    }
  };

  /** Print handler **/
  const handlePrint = async () => {
    try {
      await printReceipt();
      dispatch(setIsPrintedForNewOrderToken(true));
      await dispatch(addNewOrderTokenToOrder({ orderId: id })).unwrap();
      await dispatch(fetchOrderById(id)).unwrap();
      toast.success("Order updated successfully!");
      dispatch(closeOrderTokenModal())
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
          <DialogTitle className="!px-2">
            Order {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">
              Token {order.orderTokens.length + 1}
            </span>
            <span>{order.serviceType}</span>
          </div>

          {order.restaurantTable?._id && (
            <div className="my-5 px-3 flex justify-between text-[0.75rem]">
              <span className="font-medium">
                Table : {order.restaurantTable.name}
              </span>
            </div>
          )}

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
                  <TableCell className="text-[0.75rem] border-r border-gray-300">
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
                  <TableCell className="text-[0.75rem] border-r border-gray-300">
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

