import { Card } from '@/components/ui/card'
import UserTableSkeleton from '../skeleton/UserTableSkeleton';
import { useEffect, useState } from 'react';
import { api } from '@/api/axios';
import type { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/button';

const InvoiceList = () => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/invoice?fromDate=${fromDate}&toDate=${toDate}`);
      setInvoices(res.data.data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fromDate && toDate) fetchInvoices();
  }, [fromDate, toDate]);

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-200px)] overflow-hidden">

      {/* ✅ Date Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      <Card className="rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-200px)] overflow-y-auto pt-0">
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
  <tr>
    <th className="py-3 px-4 text-left">No.</th>
    <th className="py-3 px-4 text-left">Invoice</th>
    <th className="py-3 px-4 text-left">Customer</th>
    <th className="py-3 px-4 text-left">Members</th>
    <th className="py-3 px-4 text-left">Total</th>
    <th className="py-3 px-4 text-left">Created</th>
    <th className="py-3 px-4 text-center">Action</th> {/* 👈 Added */}
  </tr>
</thead>

            <tbody>
  {invoices.length > 0 ? invoices.map((inv, index) => (
    <tr key={inv._id} className="border-b hover:bg-gray-50">
      <td className="py-2 px-4">{index + 1}</td>
      <td className="py-2 px-4">{inv.invoiceNumber}</td>
      <td className="py-2 px-4">{inv.customerName}</td>
      <td className="py-2 px-4">{inv.numberOfMembers}</td>
      <td className="py-2 px-4">{inv.total.$numberDecimal}</td>
      <td className="py-2 px-4">
        {new Date(inv.createdAt).toLocaleDateString()}
      </td>

      {/* ✅ PRINT BUTTON */}
      <td className="py-2 px-4 text-center">
        <Button
          onClick={() => console.log("Print Invoice:", inv._id)}
          className="px-3 py-1 text-white text-xs rounded-md transition"
        >
          Print
        </Button>
      </td>
    </tr>
  )) : (
    <tr><td colSpan={7} className="py-4 text-center">No invoices found</td></tr>
  )}
</tbody>

          </table>
        )}
      </Card>
    </div>
  );
};

export default InvoiceList;
