import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        <div className="p-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-2"
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
          
          <nav className="mt-8 space-y-4">
            <Link to="/" className="block p-2 hover:bg-gray-700 rounded">
              {isSidebarOpen ? 'Home' : '🏠'}
            </Link>
            <Link to="/menu" className="block p-2 hover:bg-gray-700 rounded">
              {isSidebarOpen ? 'Menu' : '🍽️'}
            </Link>
            <Link to="/bookings" className="block p-2 hover:bg-gray-700 rounded">
              {isSidebarOpen ? 'Bookings' : '📅'}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-md p-4">
          <h1 className="text-2xl font-semibold">Ganesh Garden Hotel</h1>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;