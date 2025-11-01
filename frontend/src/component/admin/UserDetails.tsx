import React from "react";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

interface UserDetailsProps {
  user: User;
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose }) => {
  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">User Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      <div className="space-y-4 text-sm text-gray">
        <div className="grid grid-cols-6 items-center">
          <p className="col-span-2">Name</p>
          <p className="col-span-1">:</p>
          <p className="col-span-3">{user.name}</p>
        </div>
        <div className="grid grid-cols-6 items-center">
          <p className="col-span-2">Role</p>
          <p className="col-span-1">:</p>
          <p className="col-span-3">{user.userRole}</p>
        </div>
        <div className="grid grid-cols-6 items-center">
          <p className="col-span-2">Email</p>
          <p className="col-span-1">:</p>
          <p
            className="col-span-3 truncate max-w-[200px] cursor-pointer"
            title={user.email}
          >
            {user.email}
          </p>
        </div>
        <div className="grid grid-cols-6 items-center">
          <p className="col-span-2">Contact</p>
          <p className="col-span-1">:</p>
          <p className="col-span-3">{user.contact}</p>
        </div>
        <div className="grid grid-cols-6 items-center">
          <p className="col-span-2">Created Date</p>
          <p className="col-span-1">:</p>
          <p className="col-span-3">
            {new Date(user.updatedAt).toISOString().split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
