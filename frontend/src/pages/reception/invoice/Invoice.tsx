import { useState } from "react";
import { Button } from "@/components/ui/button";
import InvoiceForm from "@/component/invoice/InvoiceForm";
import InvoiceList from "@/component/invoice/InvoiceList";


const Invoice = () => {
  const [view, setView] = useState<"create" | "list">("create");

  return (
    <div className={`grid gap-5`}>
      {/* Left side */}
      <div
        className={`${
          view === "create" ? "col-span-3 overflow-auto" : "col-span-1 overflow-hidden"
        } h-[calc(100vh-140px)]`}
      >
        {/* Toggle Buttons */}
        <div className="flex items-center gap-3 mb-5 ml-2">
          <Button
            variant={view === "create" ? "default" : "outline"}
            onClick={() => setView("create")}
          >
            Create Invoice
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            Invoice List
          </Button>
        </div>

        {/* Content */}
        {view === "create" ? (
          <>
            <InvoiceForm />
            {/* {loadingRooms ? (
              <RoomGridSkeleton />
            ) : (
              isFormComplete && (
                <RoomGrid
                  rooms={rooms}
                  selectedRooms={selectedRooms}
                  onRoomClick={handleRoomClick}
                  readOnly={false}
                />
              )
            )} */}
          </>
        ) : (
          <InvoiceList />
        )}
      </div>

      {/* Right side (only show when creating invoice) */}
      {/* {view === "create" && (
        <div className="col-span-1 h-screen overflow-hidden">
          <RoomDetails
            viewedRoom={viewedRoom}
            selectedRooms={selectedRooms}
            guestDetails={guestDetails}
            grandTotal={0}
            isModalOpen={false}
            onRemoveRoom={handleRemoveRoom}
            onBookRoom={() => {}}
            onCloseModal={() => {}}
            readOnly={false}
            checkout={false}
            invoice={true}
            switchRoom={false}
            totalDays={0}
            whatsAppId=""
            onInvoiceSuccess={handleInvoiceSuccess}
          />
        </div>
      )} */}
    </div>
  );
};

export default Invoice;
