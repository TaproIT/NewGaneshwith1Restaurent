"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDispatch, useSelector } from "react-redux"
import { type AppDispatch, type RootState } from "@/app/store"
import { closeOrderTokenModal } from "@/features/beach-restaurant/orderSlice"

export default function OrderTokenDialog() {
  const dispatch = useDispatch<AppDispatch>();
  const orderDetails = useSelector((state:RootState) => state.order);

  const order = {
    orderNumber: "ORD-12345",
    tokenNumber: "TKN-567",
    items: [
      { id: 1, name: "Chicken Fried Rice", quantity: 2, price: 1200 },
      { id: 2, name: "Orange Juice", quantity: 1, price: 600 },
      { id: 3, name: "Ice Cream", quantity: 3, price: 900 },
    ],
  }

  const total = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog
      open={orderDetails.isOrderTokenOpen}
      onOpenChange={(open) => !open && dispatch(closeOrderTokenModal())}
    >
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent className="!p-4 w-[325px] text-[#444444]">
        <DialogHeader>
          <DialogTitle className="!px-2">Order {"123456"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          <div className="px-3 flex justify-between text-[0.875rem] text-[#444444] font-[500]">
            <span className="font-medium">Token {"01"}</span>
            <span>{"Dine-In"}</span>
          </div>
          <div className="my-5 px-3 flex justify-between text-[0.75rem]">
            <span className="font-medium">Table :</span>
          </div>

          {/* Items Table */}
          <Table className="border border-gray-300">
            <TableHeader className="">
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">Item</TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center border-r border-gray-300">
                  Qty
                </TableHead>
                <TableHead className="text-[0.75rem] text-[#444444] font-[500] text-center">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id} className="border-b border-gray-300">
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal border-r border-gray-300">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-center border-r border-gray-300">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-[0.75rem] text-[#444444] font-normal text-right">
                    {(item.quantity * item.price).toLocaleString()} LKR
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Total */}
          <div className="my-5 flex items-center justify-center gap-2 text-[0.875rem] font-[500] pt-2">
            <span>Total Bill</span>
            <span>: {total.toLocaleString()} LKR</span>
          </div>

          {/* Print Button */}
          <div className="my-3 px-3 flex">
            <Button onClick={handlePrint} className="!w-full">Print</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
