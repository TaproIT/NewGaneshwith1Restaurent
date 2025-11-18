import { Card } from "@/components/ui/card";
import UserTableSkeleton from "../skeleton/UserTableSkeleton";
import { useEffect, useState } from "react";
import { api } from "@/api/axios";
import type { Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { printInvoice } from "@/util/printInvoice";
import { toast } from "react-toastify";

const InvoiceList = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // ✅ new state to track printing row
  const [printingId, setPrintingId] = useState<string | null>(null);

  // ✅ Load QZ Tray
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("QZ Tray Loaded");
    document.body.appendChild(script);
  }, []);

  // ✅ Fetch invoices from API
  const fetchInvoices = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/invoice?fromDate=${fromDate}&toDate=${toDate}&searchText=${searchText}`
      );
      setInvoices(res.data.data.invoices || []);
      console.log(res.data.data.invoices);
    } catch (error) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  // Refetch on date change
  useEffect(() => {
    fetchInvoices();
  }, [fromDate, toDate]);

  // Debounced search
  useEffect(() => {
    if (!fromDate || !toDate) return;
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetchInvoices();
    }, 500);

    setTypingTimeout(timeout);
  }, [searchText]);

  return (
    <div className="p-6 rounded-2xl bg-mainWhite overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Search</label>
          <input
            type="text"
            className="border rounded-lg px-3 py-2"
            placeholder="Search invoices..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <div className="h-[calc(100vh-375px)] overflow-y-auto">
          {loading ? (
            <UserTableSkeleton />
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Invoice</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Agent Name</th>
                  <th className="py-3 px-4 text-left">Members</th>
                  <th className="py-3 px-4 text-left">Total</th>
                  <th className="py-3 px-4 text-left">Created</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv, index) => (
                    <tr key={inv._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{index + 1}</td>
                      <td className="py-2 px-4">{inv.invoiceNumber}</td>
                      <td className="py-2 px-4">{inv.customerName || "N/A"}</td>
                      <td className="py-2 px-4">{inv.travelAgentName || "N/A"}</td>
                      <td className="py-2 px-4">{inv.numberOfMembers}</td>
                      <td className="py-2 px-4">{inv.total.$numberDecimal}</td>
                      <td className="py-2 px-4">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-2 px-4 text-center">
                        <Button
                          disabled={printingId === inv._id}
                          onClick={async () => {
                            setPrintingId(inv._id);
                            try {
                              await printInvoice(inv);
                              toast.success("Printed successfully");
                            } catch (error) {
                              toast.error("Print failed");
                            } finally {
                              setPrintingId(null);
                            }
                          }}
                          className={`px-3 py-1 text-white text-xs rounded-md ${
                            printingId === inv._id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {printingId === inv._id ? "Printing..." : "Print"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceList;
