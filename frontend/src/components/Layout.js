import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  ChartBarIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

function Layout({ children, user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, color: 'text-blue-600' },
    { name: 'Exercises', href: '/exercises', icon: AcademicCapIcon, color: 'text-green-600' },
    { name: 'Speech Exercises', href: '/speech-exercises', icon: MicrophoneIcon, color: 'text-purple-600' },
    { name: 'Progress', href: '/progress', icon: ChartBarIcon, color: 'text-orange-600' },
    { name: 'Categories', href: '/categories', icon: Squares2X2Icon, color: 'text-indigo-600' },
    { name: 'Profile', href: '/profile', icon: UserIcon, color: 'text-gray-600' },
    { name: 'Settings', href: '/settings', icon: CogIcon, color: 'text-gray-600' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <span className="font-bold text-gray-800">Speech Therapy</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600' : item.color} group-hover:scale-110 transition-transform`} />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || 'User'}! Let's improve your speech today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">7</div>
                  <div className="text-xs text-gray-500">Days Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">85%</div>
                  <div className="text-xs text-gray-500">Weekly Goal</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
