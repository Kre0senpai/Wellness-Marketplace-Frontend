import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  Star,
  Heart,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { authService } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(3);
  
  const currentUser = authService.getCurrentUser();

  // Add WebSocket connection with message handler
  useWebSocket((type, data) => {
    console.log('📬 Real-time message received:', type, data);
    
    // Handle different message types
    switch(type) {
      case 'notification':
        setRealtimeNotifications(prev => [data, ...prev]);
        setNotificationCount(prev => prev + 1);
        // Show browser notification if supported
        if (Notification.permission === 'granted') {
          new Notification('Wellness Marketplace', {
            body: data.message || 'You have a new notification',
            icon: '/favicon.ico'
          });
        }
        break;
        
      case 'booking':
        console.log('📅 Booking update:', data);
        setRealtimeNotifications(prev => [{
          type: 'booking',
          message: `Booking ${data.status}: ${data.practitionerName}`,
          ...data
        }, ...prev]);
        setNotificationCount(prev => prev + 1);
        break;
        
      case 'order':
        console.log('📦 Order update:', data);
        setRealtimeNotifications(prev => [{
          type: 'order',
          message: `Order ${data.status}: #${data.id}`,
          ...data
        }, ...prev]);
        setNotificationCount(prev => prev + 1);
        break;
        
      case 'qa':
        console.log('💬 New answer:', data);
        setRealtimeNotifications(prev => [{
          type: 'qa',
          message: 'Someone answered your question',
          ...data
        }, ...prev]);
        setNotificationCount(prev => prev + 1);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  });

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Navigation items for sidebar
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'My Profile', path: '/dashboard/profile', icon: User },
    
    // Show Practitioner Profile only if user is a practitioner
    ...(currentUser.role === 'PRACTITIONER' ? [
      { name: 'Practitioner Profile', path: '/dashboard/practitioner-profile', icon: Star }
    ] : []),
    
    { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
    { name: 'My Orders', path: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Browse Practitioners', path: '/dashboard/practitioners', icon: Star },
    { name: 'Browse Products', path: '/dashboard/products', icon: ShoppingBag },
    { name: 'Community Q&A', path: '/dashboard/community', icon: MessageSquare },
    { name: 'Recommendations', path: '/dashboard/recommendations', icon: Heart },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-2xl">🌿</span>
          <span className="ml-2 text-xl font-bold text-gray-800">Wellness</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
          <aside className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
              <div className="flex items-center">
                <span className="text-2xl">🌿</span>
                <span className="ml-2 text-xl font-bold text-gray-800">Wellness</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              className="relative text-gray-500 hover:text-gray-700"
            >
              <Bell className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.role === 'PRACTITIONER' ? '👨‍⚕️' : '👤'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">User ID: {currentUser.userId}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default DashboardLayout;