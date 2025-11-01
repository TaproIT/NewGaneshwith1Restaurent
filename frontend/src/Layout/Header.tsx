import React, { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import CurrencyDropdown from "@/component/currencyDropdown";
import { api } from "@/api/axios";

interface HeaderProps {
  pathTitles: Record<string, string>;
}

interface UserDetails {
  name: string;
  email: string;
  role: string;
}

const Header: React.FC<HeaderProps> = ({ pathTitles }) => {
  const location = useLocation();
  const [user, setUser] = useState<UserDetails | null>(null);

  const getTitle = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith("/restaurant/tables")) return "Tables";
    if (currentPath.startsWith("/restaurant/menu")) return "Menu";
    return pathTitles[currentPath] || "Page Not Found";
  };

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No token found");
        return;
      }

      const response = await api.get("/user/details", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      console.error("Error fetching user:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user details");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <header className="p-4 bg-mainWhite rounded-2xl flex justify-between items-center">
      {/* Page Title */}
      <h1 className="text-sm text-gray">{getTitle()}</h1>

      {/* Right Section */}
      <div className="flex justify-center items-center gap-4">
        <Bell size={24} className="text-gray cursor-pointer hover:text-primary" />
        <CurrencyDropdown />

        {/* User Info */}
        <div className="flex justify-center items-center gap-2 text-gray p-2 rounded-lg bg-bg">
          <div className="rounded-full bg-mainWhite p-2">
            <User size={22} className="rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "User"}</span>
            <span className="text-xs text-primary">{user?.email || "Loading..."}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
