import CreateUser from "@/component/admin/CreateUser";
import UserDetails from "@/component/admin/UserDetails";
import UserTable from "@/component/admin/UserTable";
import type { User } from "@/types/user";
import React, { useState } from "react";

const UserConfig: React.FC = () => {
  const [activePanel, setActivePanel] = useState<"none" | "create" | "details">("none");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleCreateClick = () => {
    setActivePanel("create");
    setSelectedUser(null);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setActivePanel("details");
  };

  const handleClosePanel = (refresh?: boolean) => {
    setActivePanel("none");
    setSelectedUser(null);
    if (refresh) setRefreshFlag((prev) => !prev);
};

  return (
    <div className="grid grid-cols-4 gap-5">
      <div className="col-span-3">
        <UserTable onCreateClick={handleCreateClick} onUserClick={handleUserClick} refreshFlag={refreshFlag}/>
      </div>

      <div className="col-span-1">
        {activePanel === "create" ? (
          <CreateUser onClose={handleClosePanel} />
        ) : activePanel === "details" && selectedUser ? (
          <UserDetails user={selectedUser} onClose={handleClosePanel} />
        ) : (
          <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] flex text-gray-400">
            Select a user or click “+ Create”
          </div>
        )}
      </div>
    </div>
  );
};

export default UserConfig;
