import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ShoppingBag, 
  Star, 
  TrendingUp,
  Clock,
  CheckCircle 
} from 'lucide-react';
import { bookingService, orderService, recommendationService } from '../services/api';

/**
 * DashboardHome Component
 * 
 * This is the main dashboard overview page that shows:
 * - Quick stats (upcoming bookings, recent orders)
 * - Recent activity
 * - Quick actions
 * - Personalized recommendations
 */

function DashboardHome() {
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    pastBookings: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load upcoming bookings
      const upcomingRes = await bookingService.getUserUpcomingBookings();
      const upcomingBookings = upcomingRes.data || [];
      
      // Load past bookings
      const pastRes = await bookingService.getUserPastBookings();
      const pastBookings = pastRes.data || [];
      
      // Load orders
      const ordersRes = await orderService.getMyOrders();
      const orders = ordersRes.data || [];
      
      // Load recommendations
      const recsRes = await recommendationService.getMyRecommendations();
      const recs = recsRes.data || [];

      // Update stats
      setStats({
        upcomingBookings: upcomingBookings.length,
        pastBookings: pastBookings.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      });

      // Set recent data (top 3)
      setRecentBookings(upcomingBookings.slice(0, 3));
      setRecentOrders(orders.slice(0, 3));
      setRecommendations(recs.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back! 🌿</h1>
        <p className="text-blue-100">
          Here's what's happening with your wellness journey today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{stats.upcomingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link to="/dashboard/bookings" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Past Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pastBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <Link to="/dashboard/orders" className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-block">
            View orders →
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {booking.practitionerName || 'Practitioner'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.date || 'Date TBD'} at {booking.time || 'Time TBD'}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No upcoming sessions</p>
                <Link 
                  to="/dashboard/practitioners"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Book a session →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Order #{order.id || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${order.totalAmount || '0.00'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === 'DELIVERED' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link 
                  to="/dashboard/products"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Browse products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recommended for You</h2>
            <Link to="/dashboard/recommendations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800 mb-1">
                      {rec.suggestedTherapy || 'Therapy Recommendation'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rec.symptom || 'Based on your profile'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/dashboard/practitioners"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Book Session</p>
          </Link>
          <Link 
            to="/dashboard/products"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Shop Products</p>
          </Link>
          <Link 
            to="/dashboard/community"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Ask Question</p>
          </Link>
          <Link 
            to="/dashboard/recommendations"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Get Recommendations</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;