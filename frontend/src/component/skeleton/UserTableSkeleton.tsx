import React from "react";

const SkeletonRow: React.FC = () => {
  return (
    <tr className="border-t border-gray-200 animate-pulse">
      <td className="py-3 px-4">
        <div className="h-4 w-6 bg-gray-300 rounded"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-20 bg-gray-300 rounded"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
      </td>
      <td className="py-3 px-4 text-center">
        <div className="h-4 w-6 bg-gray-300 rounded mx-auto"></div>
      </td>
    </tr>
  );
};

const UserTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <table className="w-full text-sm border-collapse">
      <thead className="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10 shadow-sm">
        <tr>
          <th className="py-3 px-4 text-left">No.</th>
          <th className="py-3 px-4 text-left">Name</th>
          <th className="py-3 px-4 text-left">User Role</th>
          <th className="py-3 px-4 text-left">Created Date</th>
          <th className="py-3 px-4 text-left">User Status</th>
          <th className="py-3 px-4 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, idx) => (
          <SkeletonRow key={idx} />
        ))}
      </tbody>
    </table>
  );
};

export default UserTableSkeleton;
