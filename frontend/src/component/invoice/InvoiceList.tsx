import { Card } from '@/components/ui/card'
import React from 'react'
import UserTableSkeleton from '../skeleton/UserTableSkeleton';

const InvoiceList = () => {
    const loading = false;
  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-200px)] overflow-hidden">
        <Card className="rounded-lg border border-gray-200 shadow-sm h-full overflow-y-auto pt-0">
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left"></th>
                <th className="py-3 px-4 text-left"></th>
                <th className="py-3 px-4 text-left"></th>
                <th className="py-3 px-4 text-left"></th>
                <th className="py-3 px-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

export default InvoiceList