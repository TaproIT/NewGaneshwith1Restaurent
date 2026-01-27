import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchUserRole } from "@/features/user/userSlice";
import SidebarSkeleton from "@/component/skeleton/SidebarSkeleton";
import Sidebar from "./Sidebar";
import Header from "./Header";

import {
  CircleArrowRight,
  ShieldCheck, User, UserRoundPlus, Users,
  RepeatIcon, BookText, House, Table2, NotepadText,
  PauseCircle, Newspaper, Banknote,
  Warehouse,
  BookOpen,
  NotebookText,
  ClipboardMinus,
  FileCheck
} from "lucide-react";

const navigationConfig = {
  "Super-Admin": [
    { path: "/admin/dashboard", title: "Dashboard", icon: <House size={22} /> },
    { path: "/admin/reception", title: "Reception", icon: <Users size={22} /> },
    { path: "/admin/beverage-inventory", title: "Beverage Inventory", icon: <Table2 size={22} /> },
    { path: "/admin/currency-config", title: "Currency Config", icon: <Banknote size={22} /> },
    { path: "/admin/user-config", title: "User Config", icon: <User size={22} /> },
    { path: "/admin/room-config", title: "Room Config", icon: <User size={22} /> },
    { path: "/admin/reports", title: "Reports", icon: <NotebookText size={22} /> },
    { path: "/admin/restaurant/reports", title: "Restaurant Reports", icon: <Newspaper size={22} /> },
  ],
  "Admin": [
    { path: "/admin/dashboard", title: "Dashboard", icon: <House size={22} /> },
    { path: "/admin/reception", title: "Reception", icon: <Users size={22} /> },
    { path: "/admin/beverage-inventory", title: "Beverage Inventory", icon: <Table2 size={22} /> },
    { path: "/admin/currency-config", title: "Currency Config", icon: <Banknote size={22} /> },
    { path: "/admin/user-config", title: "User Config", icon: <User size={22} /> },
    { path: "/admin/room-config", title: "Room Config", icon: <Warehouse size={22} /> },
    { path: "/admin/reports", title: "Reports", icon: <NotebookText size={22} /> },
    { path: "/admin/restaurant/reports", title: "Restaurant Reports", icon: <Newspaper size={22} /> },
  ],
  "Reception": [
    { path: "/onboarding", title: "Onboarding", icon: <UserRoundPlus size={22} /> },
    { path: "/room-availability", title: "Room Availability", icon: <ShieldCheck size={22} /> },
    { path: "/bookings", title: "Bookings", icon: <BookOpen size={22} /> },
    { path: "/switch-rooms", title: "Switch Rooms", icon: <RepeatIcon size={22} /> },
    { path: "/checkouts", title: "Checkouts", icon: <CircleArrowRight size={22} /> },
    { path: "/invoice", title: "Invoice", icon: <BookText size={22} /> },
    // { path: "/room-config", title: "Room Config", icon: <Warehouse size={22} /> },
    { path: "/reports", title: "Room Reports", icon: <NotebookText size={22} /> },
  ],
  "Beach-Restaurant-Staff": [
    { path: "/restaurant/home", title: "Home", icon: <House size={22} /> },
    { path: "/restaurant/tables/0", title: "Tables", icon: <Table2 size={22} /> },
    { path: "/restaurant/menu/0", title: "Menu", icon: <NotepadText size={22} /> },
    { path: "/restaurant/hold", title: "Hold", icon: <PauseCircle size={22} /> },
    { path: "/restaurant/daily-summary", title: "Daily Summary", icon: <Newspaper size={22} /> },
    { path: "/restaurant/completed-orders", title: "Completed Orders", icon: <FileCheck size={22} /> },
  ],
  "Pool-Restaurant-Staff": [
    { path: "/restaurant/home", title: "Home", icon: <House size={22} /> },
    { path: "/restaurant/tables/0", title: "Tables", icon: <Table2 size={22} /> },
    { path: "/restaurant/menu/0", title: "Menu", icon: <NotepadText size={22} /> },
    { path: "/restaurant/hold", title: "Hold", icon: <PauseCircle size={22} /> },
    { path: "/restaurant/daily-summary", title: "Daily Summary", icon: <Newspaper size={22} /> },
    { path: "/restaurant/completed-orders", title: "Completed Orders", icon: <FileCheck size={22} /> },
  ],
  "Beach-Restaurant-Admin": [
    { path: "/restaurant/home", title: "Home", icon: <House size={22} /> },
    { path: "/restaurant/tables/0", title: "Tables", icon: <Table2 size={22} /> },
    { path: "/restaurant/menu/0", title: "Menu", icon: <NotepadText size={22} /> },
    { path: "/restaurant/hold", title: "Hold", icon: <PauseCircle size={22} /> },
    { path: "/restaurant/daily-summary", title: "Daily Summary", icon: <Newspaper size={22} /> },
    { path: "/restaurant/completed-orders", title: "Completed Orders", icon: <FileCheck size={22} /> },
    { path: "/restaurant/report", title: "Restaurant Report", icon: <ClipboardMinus size={22} /> },
  ],
  "Pool-Restaurant-Admin": [
    { path: "/restaurant/home", title: "Home", icon: <House size={22} /> },
    { path: "/restaurant/tables/0", title: "Tables", icon: <Table2 size={22} /> },
    { path: "/restaurant/menu/0", title: "Menu", icon: <NotepadText size={22} /> },
    { path: "/restaurant/hold", title: "Hold", icon: <PauseCircle size={22} /> },
    { path: "/restaurant/daily-summary", title: "Daily Summary", icon: <Newspaper size={22} /> },
    { path: "/restaurant/completed-orders", title: "Completed Orders", icon: <FileCheck size={22} /> },
    { path: "/restaurant/report", title: "Restaurant Report", icon: <ClipboardMinus size={22} /> },
  ],
  "Beverage-Inventory": [
    { path: "/beverage-inventory/dashboard", title: "Dashboard", icon: <House size={22} /> },
    { path: "/beverage-inventory/manage-inventory", title: "Manage Inventory", icon: <Table2 size={22} /> },
  ],
};

const pathTitles = {
  "/onboarding": "Onboarding",
  "/room-availability": "Room Availability",
  "/switch-rooms": "Switch Rooms",
  "/settings": "Settings | System",
  "/beverage-inventory/dashboard": "Beverage Inventory | Dashboard",
  "/beverage-inventory/manage-inventory": "Beverage Inventory | Manage",
  "/staff": "Staff Management | Overview",
  "/checkouts": "Checkouts",
  "/kitchen": "Kitchen | Orders",
  "/rooms": "Rooms | Status",
  "/tasks": "Tasks | Today",
  "/invoice": "Invoice",
  "/admin/dashboard": "Admin Dashboard",
  "/restaurant/home": "Home",
  "/restaurant/tables/0": "Tables",
  "/restaurant/menu/0": "Menu",
  "/restaurant/hold": "Hold",
  "/restaurant/daily-summary": "Daily Summary",
  "/restaurant/completed-orders": "Completed Orders",
  "/restaurant/report": "Restaurant Report",
  "/admin/currency-config": "Currency Config",
  "/admin/user-config": "User Config",
  "/admin/room-config": "Room Config",
  "/checkout-details": "Checkout Details",
  "/bookings": "Bookings",
  "/admin/reports": "Reports",
  "/reports": "Room Reports",
  "/admin/restaurant/report": "Restaurant Reports"
};

const getSidebarFromPath = (path: string): string => {
  if (path.startsWith("/onboarding") ||
      path.startsWith("/room-availability") ||
      path.startsWith("/bookings") ||
      path.startsWith("/bookings/:id") ||
      path.startsWith("/switch-rooms") ||
      path.startsWith("/checkouts") ||
      path.startsWith("/checkout-details") ||
      path.startsWith("/invoice") ||
      path.startsWith("/completed-checkout-details") ||
      path.startsWith("/reports"))
    return "Reception";
  if (path.startsWith("/beverage-inventory"))
    return "Beverage-Inventory";
  return "Admin";
};

const Layout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const userRole = useSelector((state: RootState) => state.user.role);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) dispatch(fetchUserRole());
  }, [dispatch]);

  const activeSidebar = useMemo(() => {
    if (!userRole) return "Admin";
    if (userRole === "Admin" || userRole === "Super-Admin")
      return getSidebarFromPath(location.pathname);
    return userRole;
  }, [userRole, location.pathname]);

  if (!userRole) {
    return (
      <div className="flex h-screen bg-bg p-5 gap-5">
        <SidebarSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg p-5 gap-5">
      <Sidebar
        userRole={userRole}
        activeSidebar={activeSidebar}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        navigationConfig={navigationConfig}
      />
      <div className="flex-1 overflow-hidden">
        <Header pathTitles={pathTitles} />
        <main className="rounded-2xl mt-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
