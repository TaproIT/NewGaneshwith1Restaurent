import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import type { User } from "@/types/user";
import { api } from "@/api/axios";
import { toast } from "react-toastify";
import UserTableSkeleton from "../skeleton/UserTableSkeleton";

interface UserTableProps {
  onCreateClick: () => void;
  onUserClick: (user: User) => void;
  refreshFlag?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  onCreateClick,
  onUserClick,
  refreshFlag,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null); // track row being updated

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/get-users");
        setUsers(response.data.data.users);
      } catch (error) {
        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshFlag]);

  // Activate/Deactivate user
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setUpdatingUserId(id); // mark row as updating
  
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((user) =>
        user._id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  
    try {
      const response = await api.patch(`/admin/${isActive ? "deactivate" : "activate"}-user/${id}`);
  
      if (response.status === 200) {
        toast.success(
          `User ${!isActive ? "activated" : "deactivated"} successfully!`
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user status");
      // revert UI if API fails
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, isActive } : user
        )
      );
    } finally {
      setUpdatingUserId(null); // clear updating state
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <Button
          size="sm"
          className="bg-primary text-white"
          onClick={onCreateClick}
        >
          + Create
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-lg border border-gray-200 shadow-sm h-full overflow-y-auto pt-0">
        {loading ? (
          <UserTableSkeleton />
        ) : (
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
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    onClick={() => onUserClick(user)}
                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.userRole}</td>
                    <td className="py-3 px-4">
                      {new Date(user.updatedAt).toISOString().split("T")[0]}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`${
                          user.isActive
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        } px-3 py-1 rounded-md text-xs font-medium`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserClick(user);
                      }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100"
                            disabled={updatingUserId === user._id} // disable button while updating
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(user._id, user.isActive)
                            }
                            className={`cursor-pointer ${
                              updatingUserId === user._id ? "opacity-50 pointer-events-none" : ""
                            }`}
                          >
                            {user.isActive ? "Deactivate User" : "Activate User"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default UserTable;
