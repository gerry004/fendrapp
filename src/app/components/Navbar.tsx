'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';

export default function Navbar() {
  const { logout } = useAuth();
  const { userData } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative">
      {/* Modern Navbar */}
      <nav className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 flex justify-between items-center shadow-md">
        {/* Mobile hamburger menu */}
        <button 
          className="block md:hidden focus:outline-none" 
          onClick={toggleSidebar}
        >
          <div className="space-y-1.5">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </button>

        {/* Logo */}
        <div className="text-2xl font-bold text-white md:ml-0 tracking-wider">
          FENDR
        </div>

        {/* Desktop user info and logout */}
        <div className="hidden md:flex items-center space-x-4">
          {userData && (
            <span className="text-white font-medium">{userData.username}</span>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar - conditionally rendered */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col h-full bg-gradient-to-b from-purple-600 to-purple-500 w-64 p-4 shadow-xl animate-slide-in">
            {/* Sidebar Header with Logo and Close button */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-2xl font-bold text-white tracking-wider">FENDR</div>
              <button onClick={toggleSidebar} className="text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Sidebar Content - Push user info and logout to bottom */}
            <div className="flex-grow"></div>
            
            {/* User info and logout at bottom */}
            <div className="mt-auto">
              {userData && (
                <div className="text-white font-medium mb-3">{userData.username}</div>
              )}
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-white bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 