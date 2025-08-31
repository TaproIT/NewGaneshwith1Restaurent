import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../assets/Images/Logos/main_logo.png';
import { 
  Bell, CircleArrowRight, LogOut, Repeat, Settings, 
  ShieldCheck, User, UserRoundPlus, Users, Calendar,
  ChefHat, Coffee,
  RepeatIcon,
  BookText,
  House,
  Table2,
  NotepadText,
  PauseCircle,
  Newspaper
} from 'lucide-react';
import CurrencyDropdown from '@/component/currencyDropdown';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { UserRole } from '@/types/roleTypes';
import { api } from '@/api/axios';
import { toast } from 'react-toastify';

interface NavItem {
  path: string;
  title: string;
  icon: React.ReactNode;
}

const navigationConfig: Record<UserRole, NavItem[]> = {
  'Super-Admin': [
    { path: '/', title: 'Dashboard', icon: <UserRoundPlus size={22} /> },
    { path: '/users', title: 'User Management', icon: <Users size={22} /> },
    { path: '/bookings', title: 'All Bookings', icon: <Calendar size={22} /> },
    { path: '/settings', title: 'System Settings', icon: <Settings size={22} /> }
  ],
  'Admin': [
    { path: '/menu', title: 'Room Availability', icon: <ShieldCheck size={22} /> },
    { path: '/bookings', title: 'Alterations', icon: <Repeat size={22} /> },
    { path: '/staff', title: 'Staff Management', icon: <Users size={22} /> }
  ],
  'Reception': [
    { path: '/onboarding', title: 'Onboarding', icon: <UserRoundPlus size={22} /> },
    { path: '/room-availability', title: 'Room Availability', icon: <ShieldCheck size={22} /> },
    { path: '/switch-rooms', title: 'Switch Rooms', icon: <RepeatIcon size={22} /> },
    { path: '/checkouts', title: 'Checkouts', icon: <CircleArrowRight size={22} /> },
    { path: '/invoice', title: 'Invoice', icon: <BookText size={22} /> },
  ],
  'Beach-Restaurant-Staff': [
    { path: '/beach-restaurant/home', title: 'Home', icon: <House size={22} /> },
    { path: '/beach-restaurant/tables', title: 'Tables', icon: <Table2 size={22} /> },
    { path: '/beach-restaurant/menu', title: 'Menu', icon: <NotepadText size={22} /> },
    { path: '/beach-restaurant/hold', title: 'Hold', icon: <PauseCircle size={22} /> },
    { path: '/beach-restaurant/daily-summary', title: 'Daily Summary', icon: <Newspaper size={22} /> }
  ],
  'Pool-Restaurant-Staff': [
    { path: '/kitchen', title: 'Pool Orders', icon: <ChefHat size={22} /> },
    { path: '/menu', title: 'Pool Menu', icon: <Coffee size={22} /> }
  ]
};

const pathTitles: Record<string, string> = {
  '/onboarding': 'Onboarding',
  '/room-availability': 'Room Availability',
  '/switch-rooms': 'Switch Rooms',
  '/settings': 'Settings | System',
  '/menu': 'Room Availability | Status',
  '/staff': 'Staff Management | Overview',
  '/checkouts': 'Checkouts',
  '/kitchen': 'Kitchen | Orders',
  '/rooms': 'Rooms | Status',
  '/tasks': 'Tasks | Today',
  '/invoice': 'Invoice',
};

const Layout: React.FC = () => {
  const location = useLocation();
  const userRole =useSelector((state: RootState) => state.user.role)
  const navigate = useNavigate()

  const getLinkClassName = (path: string) => {
    const baseClasses = "flex gap-2 p-3 rounded-lg";
    const isActive = location.pathname === path;
    return `${baseClasses} ${isActive ? 'bg-primary text-white' : 'hover:bg-primary hover:text-white'}`;
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

  return (
    <div className="flex h-screen bg-bg p-5 gap-5">
      {/* Sidebar */}
      <div className='bg-mainWhite w-[264px] flex rounded-2xl flex-col justify-between shadow-lg p-4'>
        <div className="w-full">
          <div className='flex justify-center items-center mt-5'>
            <img src={Logo} alt="logo" className="w-32" />
          </div>
          
          <nav className="mt-10 space-y-4 text-gray">
            {navigationConfig[userRole].map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={getLinkClassName(item.path)}
              >
                {item.icon} <p>{item.title}</p>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Navigation */}
        <div>
          <nav className="space-y-2 text-gray">
            <Link to="/profile" className={getLinkClassName('/profile')}>
              <Settings size={22}/> <p>Settings</p>
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex gap-2 p-3 rounded-lg w-full hover:bg-danger hover:text-white"
            >
              <LogOut size={22}/> <span>Logout</span>
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
              <div className='flex flex-col'>
                {/* <span className='text-sm font-medium'>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span> */}
                <span className='text-sm font-medium'>User</span>
                <span className='text-xs text-primary'>user@example.com</span>
              </div>
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