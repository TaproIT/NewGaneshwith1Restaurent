import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/Images/Logos/main_logo.png";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  House,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/api/axios";

interface NavItem {
  path: string;
  title: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  userRole: string;
  activeSidebar: string;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  navigationConfig: Record<string, NavItem[]>;
}

const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeSidebar,
  isCollapsed,
  setIsCollapsed,
  navigationConfig,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarItems = navigationConfig[activeSidebar] ?? navigationConfig["Admin"];

  const getLinkClassName = (path: string) => {
    const baseClasses = "flex gap-2 p-3 rounded-lg";
    const currentPath = location.pathname;
    let isActive = false;

    if (path.startsWith("/restaurant/tables")) {
      isActive = currentPath.startsWith("/restaurant/tables");
    } else if (path.startsWith("/restaurant/menu")) {
      isActive = currentPath.startsWith("/restaurant/menu");
    } else {
      isActive = currentPath === path;
    }

    return `${baseClasses} ${isActive ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`;
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No user logged in");
        return;
      }
      const response = await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true
      });
      if (response.status === 200) {
        localStorage.removeItem("authToken");
        toast.success("Logout successful");
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className={`bg-mainWhite ${isCollapsed ? "w-20" : "w-[264px]"} flex rounded-2xl flex-col justify-between shadow-lg p-4 transition-all duration-300`}>
      <div>
        <div className="flex justify-between items-center mt-5">
          {!isCollapsed && <img src={Logo} alt="logo" className="w-32" />}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-100">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="mt-10 space-y-4 text-gray w-full">
          {sidebarItems.map((item) => {
            if ((userRole === "Admin" || userRole === "Super-Admin") && item.title === "Reception") {
              return (
                <a key={item.title}
                   onClick={() => { navigate("/onboarding"); }}
                   className={getLinkClassName(item.path)} style={{ cursor: "pointer" }}>
                  {item.icon} {!isCollapsed && <p>{item.title}</p>}
                </a>
              );
            }
            if ((userRole === "Admin" || userRole === "Super-Admin") && item.title === "Beverage Inventory") {
              return (
                <a key={item.title}
                   onClick={() => { navigate("/beverage-inventory/dashboard"); }}
                   className={getLinkClassName(item.path)} style={{ cursor: "pointer" }}>
                  {item.icon} {!isCollapsed && <p>{item.title}</p>}
                </a>
              );
            }
            return (
              <Link key={item.path} to={item.path} className={getLinkClassName(item.path)} title={isCollapsed ? item.title : undefined}>
                {item.icon} {!isCollapsed && <p>{item.title}</p>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {(userRole === "Admin" || userRole === "Super-Admin") && activeSidebar !== "Admin" && (
          <button onClick={() => navigate("/admin/dashboard")}
                  className="flex items-center gap-2 p-3 rounded-lg w-full hover:bg-primary hover:text-white mt-4">
            <House size={22} /> {!isCollapsed && <span>Back to Admin</span>}
          </button>
        )}
        <button onClick={handleLogout} className="flex items-center gap-2 p-3 rounded-lg w-full hover:bg-danger hover:text-white">
          <LogOut size={22} /> {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
