import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Calendar, ShoppingBag, MessageSquare, Star, Trash2, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/api';

/**
 * Notifications Component
 * 
 * Notification center for:
 * - Booking confirmations
 * - Order updates
 * - New answers to questions
 * - System notifications
 * - Mark as read/unread
 * - Delete notifications
 */

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [filter, notifications]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (filter === 'UNREAD') {
      filtered = filtered.filter(n => n.status !== 'READ');
    } else if (filter === 'READ') {
      filtered = filtered.filter(n => n.status === 'READ');
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, status: 'READ' } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'READ' })));
    setMessage({ type: 'success', text: 'All notifications marked as read' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
      setMessage({ type: 'success', text: 'All notifications cleared' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'BOOKING':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'ORDER':
        return <ShoppingBag className="w-5 h-5 text-green-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'REVIEW':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'BOOKING':
        return 'bg-blue-100';
      case 'ORDER':
        return 'bg-green-100';
      case 'MESSAGE':
        return 'bg-purple-100';
      case 'REVIEW':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const NotificationCard = ({ notification }) => {
    const isUnread = notification.status !== 'READ';

    return (
      <div 
        className={`rounded-xl border p-6 transition hover:shadow-md ${
          isUnread 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title || 'Notification'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-2"></div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500">
                {formatDate(notification.createdAt)}
              </span>

              <div className="flex items-center space-x-2">
                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark Read</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => n.status !== 'READ').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {getUnreadCount() > 0 
              ? `You have ${getUnreadCount()} unread notification${getUnreadCount() > 1 ? 's' : ''}`
              : 'You\'re all caught up!'}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex space-x-2">
            {getUnreadCount() > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex">
        {['ALL', 'UNREAD', 'READ'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'UNREAD' ? 'Unread' : 'Read'}
            {f === 'UNREAD' && getUnreadCount() > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                {getUnreadCount()}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {filter === 'UNREAD' 
              ? 'No unread notifications'
              : filter === 'READ'
              ? 'No read notifications'
              : 'No notifications'}
          </h3>
          <p className="text-gray-600">
            {filter === 'UNREAD' 
              ? "You're all caught up! Check back later for updates."
              : filter === 'READ'
              ? "You haven't read any notifications yet."
              : "You'll see important updates and alerts here."}
          </p>
        </div>
      )}

      {/* Sample Notifications Info */}
      {notifications.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What notifications will I receive?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Booking Updates</p>
                <p className="text-sm text-gray-600">Confirmations, reminders, and cancellations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Order Status</p>
                <p className="text-sm text-gray-600">Shipping updates and delivery notifications</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Community Activity</p>
                <p className="text-sm text-gray-600">New answers to your questions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Reviews & Ratings</p>
                <p className="text-sm text-gray-600">Reminders to review completed sessions</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;