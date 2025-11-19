import React from "react";

const BeverageSummarySkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {[1].map((_, idx) => (
        <div
          key={idx}
          className="border rounded-xl p-4 bg-white shadow-sm animate-pulse"
        >
          {/* Skeleton title */}
          <div className="h-6 w-32 bg-gray-300 rounded mb-3"></div>

          {/* Skeleton table */}
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-2">
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </th>
                <th className="py-2">
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((row) => (
                <tr key={row} className="border-b">
                  <td className="py-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td className="py-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="font-bold">
                <td className="py-2">
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </td>
                <td className="py-2">
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default BeverageSummarySkeleton;
