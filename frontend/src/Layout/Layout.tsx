import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/Images/Logos/main_logo.png';
import { 
  Bell, CircleArrowRight, LogOut, Settings, 
  ShieldCheck, User, UserRoundPlus, Users, Calendar,
  RepeatIcon,
  BookText,
  House,
  Table2,
  NotepadText,
  PauseCircle,
  Newspaper,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CurrencyDropdown from '@/component/currencyDropdown';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import type { UserRole } from '@/types/roleTypes';
import { api } from '@/api/axios';
import { toast } from 'react-toastify';
import { fetchUserRole } from '@/features/user/userSlice';

interface NavItem {
  path: string;
  title: string;
  icon: React.ReactNode;
}

const navigationConfig: Record<string, NavItem[]> = {
  'Super-Admin': [
    { path: '/', title: 'Dashboard', icon: <UserRoundPlus size={22} /> },
    { path: '/users', title: 'User Management', icon: <Users size={22} /> },
    { path: '/bookings', title: 'All Bookings', icon: <Calendar size={22} /> },
    { path: '/settings', title: 'System Settings', icon: <Settings size={22} /> }
  ],
  'Admin': [
    { path: '/admin/dashboard', title: 'Dashboard', icon: <House size={22} /> },
    { path: '/admin/reception', title: 'Reception', icon: <Users size={22} /> },
    { path: '/admin/beverage-inventory', title: 'Beverage Inventory', icon: <Table2 size={22} /> },
  ],
  'Reception': [
    { path: '/onboarding', title: 'Onboarding', icon: <UserRoundPlus size={22} /> },
    { path: '/room-availability', title: 'Room Availability', icon: <ShieldCheck size={22} /> },
    { path: '/switch-rooms', title: 'Switch Rooms', icon: <RepeatIcon size={22} /> },
    { path: '/checkouts', title: 'Checkouts', icon: <CircleArrowRight size={22} /> },
    { path: '/invoice', title: 'Invoice', icon: <BookText size={22} /> },
  ],
  'Beach-Restaurant-Staff': [
    { path: '/restaurant/home', title: 'Home', icon: <House size={22} /> },
    { path: `/restaurant/tables/0`, title: 'Tables', icon: <Table2 size={22} /> },
    { path: '/restaurant/menu/0', title: 'Menu', icon: <NotepadText size={22} /> },
    { path: '/restaurant/hold', title: 'Hold', icon: <PauseCircle size={22} /> },
    { path: '/restaurant/daily-summary', title: 'Daily Summary', icon: <Newspaper size={22} /> }
  ],
  'Pool-Restaurant-Staff': [
    { path: '/restaurant/home', title: 'Home', icon: <House size={22} /> },
    { path: `/restaurant/tables/0`, title: 'Tables', icon: <Table2 size={22} /> },
    { path: '/restaurant/menu/0', title: 'Menu', icon: <NotepadText size={22} /> },
    { path: '/restaurant/hold', title: 'Hold', icon: <PauseCircle size={22} /> },
    { path: '/restaurant/daily-summary', title: 'Daily Summary', icon: <Newspaper size={22} /> }
  ],
  'Beverage-Inventory': [
    { path: '/beverage-inventory/dashboard', title: 'Dashboard', icon: <House size={22} /> },
    { path: '/beverage-inventory/manage-inventory', title: 'Manage Inventory', icon: <Table2 size={22} /> },
  ]
};

const pathTitles: Record<string, string> = {
  '/onboarding': 'Onboarding',
  '/room-availability': 'Room Availability',
  '/switch-rooms': 'Switch Rooms',
  '/settings': 'Settings | System',
  '/beverage-inventory/dashboard': 'Beverage Inventory | Dashboard',
  '/beverage-inventory/manage-inventory': 'Beverage Inventory | Manage',
  '/staff': 'Staff Management | Overview',
  '/checkouts': 'Checkouts',
  '/kitchen': 'Kitchen | Orders',
  '/rooms': 'Rooms | Status',
  '/tasks': 'Tasks | Today',
  '/invoice': 'Invoice',
  '/admin/dashboard': 'Admin Dashboard',
  '/restaurant/home': 'Home',
  '/restaurant/tables/0': 'Tables',
  '/restaurant/menu/0': 'Menu',
  '/restaurant/hold': 'Hold',
  '/restaurant/daily-summary': 'Daily Summary',
};

const Layout: React.FC = () => {
  const location = useLocation();
  const userRole = useSelector((state: RootState) => state.user.role);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState<UserRole | 'Beverage-Inventory' | 'Reception'>(userRole);

 const getLinkClassName = (path: string) => {
   const baseClasses = "flex gap-2 p-3 rounded-lg";
   const currentPath = location.pathname;

   let isActive = false;

   // Handle dynamic "tables" and "menu" paths
   if (path.startsWith("/restaurant/tables")) {
     isActive = currentPath.startsWith("/restaurant/tables");
   } else if (path.startsWith("/restaurant/menu")) {
     isActive = currentPath.startsWith("/restaurant/menu");
   } else {
     isActive = currentPath === path;
   }

   return `${baseClasses} ${
     isActive ? "bg-primary text-white" : "hover:bg-primary hover:text-white"
   }`;
 };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No user logged in");
        return;
      }
      const response = await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        localStorage.removeItem("authToken");
        toast.success("Logout successful");
        navigate('/')
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  }

  // Determine which sidebar to show
  const sidebarItems = userRole === 'Admin'
    ? navigationConfig[selectedSidebar]
    : navigationConfig[userRole];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      dispatch(fetchUserRole());
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-bg p-5 gap-5">
      {/* Sidebar */}
      <div className={`bg-mainWhite ${isCollapsed ? 'w-20' : 'w-[264px]'} flex rounded-2xl flex-col justify-between shadow-lg p-4 transition-all duration-300`}>
        <div className="w-full">
          <div className='flex justify-between items-center mt-5'>
            {!isCollapsed && <img src={Logo} alt="logo" className="w-32" />}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="mt-10 space-y-4 text-gray w-full">
            {sidebarItems.map((item) => {
              if (userRole === "Admin" && item.title === "Reception") {
                return (
                  <a
                    key={item.title}
                    onClick={() => {
                      setSelectedSidebar("Reception")
                      navigate("/onboarding");
                    }}
                    
                    className={getLinkClassName(item.path)}
                    style={{cursor: 'pointer'}}
                  >
                    {item.icon} {!isCollapsed && <p>{item.title}</p>}
                  </a>
                );
              }
              if (userRole === "Admin" && item.title === "Beverage Inventory") {
                return (
                  <a
                    key={item.title}
                    onClick={() => {
                      setSelectedSidebar("Beverage-Inventory")
                      navigate("/beverage-inventory/dashboard");
                    }}
                    className={getLinkClassName(item.path)}
                    style={{cursor: 'pointer'}}
                  >
                    {item.icon} {!isCollapsed && <p>{item.title}</p>}
                  </a>
                );
              }
              return (
                <Link key={item.path} to={item.path} className={getLinkClassName(item.path)}>
                  {item.icon} {!isCollapsed && <p>{item.title}</p>}
                </Link>
              );
            })}

            {/* Back to Admin button */}
            {userRole === "Admin" && selectedSidebar !== "Admin" && (
              <button
                onClick={() => {
                  setSelectedSidebar("Admin")
                  navigate("/admin/dashboard")
                }}
                className="flex items-center gap-2 p-3 rounded-lg w-full hover:bg-primary hover:text-white mt-4"
              >
                <House size={22}/> {!isCollapsed && <span>Back to Admin</span>}
              </button>
            )}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div>
          <nav className="space-y-2 text-gray">
            <Link to="/profile" className={getLinkClassName('/profile')}>
              <Settings size={22}/> {!isCollapsed && <p>Settings</p>}
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 p-3 rounded-lg w-full hover:bg-danger hover:text-white"
            >
              <LogOut size={22}/> {!isCollapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <header className="p-4 bg-mainWhite rounded-2xl flex justify-between items-center">
          <h1 className="text-sm text-gray">
            {pathTitles[location.pathname] || 'Page Not Found'}
          </h1>
          <div className='flex justify-center items-center gap-4'>
            <Bell size={24} className='text-gray cursor-pointer hover:text-primary'/>
            <CurrencyDropdown />
            <div className='flex justify-center items-center gap-2 text-gray p-2 rounded-lg bg-bg'>
              <div className='rounded-full bg-mainWhite p-2'>
                <User size={22} className='rounded-full' />
              </div>
              {!isCollapsed && (
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>User</span>
                  <span className='text-xs text-primary'>user@example.com</span>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="rounded-2xl mt-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
