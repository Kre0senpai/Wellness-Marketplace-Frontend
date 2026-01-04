import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingService } from '../services/api';

/**
 * Bookings Component
 * 
 * Displays user's therapy session bookings:
 * - Upcoming sessions (can cancel)
 * - Past sessions (can review)
 * - Session details in modal
 */

function Bookings() {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Load upcoming bookings
      const upcomingRes = await bookingService.getUserUpcomingBookings();
      setUpcomingBookings(upcomingRes.data || []);

      // Load past bookings
      const pastRes = await bookingService.getUserPastBookings();
      setPastBookings(pastRes.data || []);

    } catch (error) {
      console.error('Error loading bookings:', error);
      setMessage({ type: 'error', text: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      setSelectedBooking(null);
      loadBookings(); // Reload bookings
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to cancel booking' 
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const BookingCard = ({ booking, isPast }) => (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => setSelectedBooking(booking)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {booking.practitionerName ? booking.practitionerName.charAt(0) : 'P'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {booking.practitionerName || 'Practitioner Name'}
            </h3>
            <p className="text-sm text-gray-600">
              {booking.specialization || 'Wellness Therapy'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status || 'Pending'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">{formatTime(booking.time)}</span>
        </div>
        {booking.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{booking.location}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">{booking.notes}</p>
        </div>
      )}

      <div className="mt-4 flex space-x-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBooking(booking);
          }}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
        >
          View Details
        </button>
        {!isPast && booking.status !== 'CANCELLED' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCancelBooking(booking.id);
            }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
          >
            Cancel
          </button>
        )}
        {isPast && booking.status === 'COMPLETED' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Navigate to review page
              alert('Review feature coming soon!');
            }}
            className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition text-sm font-medium"
          >
            Write Review
          </button>
        )}
      </div>
    </div>
  );

  const BookingDetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status || 'Pending'}
              </span>
              <span className="text-sm text-gray-500">
                Booking ID: #{booking.id || 'N/A'}
              </span>
            </div>

            {/* Practitioner Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {booking.practitionerName ? booking.practitionerName.charAt(0) : 'P'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {booking.practitionerName || 'Practitioner Name'}
                  </h3>
                  <p className="text-gray-600">{booking.specialization || 'Wellness Therapy'}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 space-y-2">
                {booking.practitionerEmail && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{booking.practitionerEmail}</span>
                  </div>
                )}
                {booking.practitionerPhone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{booking.practitionerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Session Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Session Details</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-800">{formatDate(booking.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">{formatTime(booking.time)}</p>
                  </div>
                </div>

                {booking.duration && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-gray-800">{booking.duration} minutes</p>
                    </div>
                  </div>
                )}

                {booking.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">{booking.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Price */}
            {booking.price && (
              <div className="p-4 bg-green-50 rounded-lg flex items-center justify-between">
                <span className="text-gray-700">Session Price</span>
                <span className="text-2xl font-bold text-green-600">${booking.price}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 flex space-x-3">
            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <button 
                onClick={() => handleCancelBooking(booking.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Cancel Booking
              </button>
            )}
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your therapy sessions</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'past'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {/* Bookings Grid */}
      {currentBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              isPast={activeTab === 'past'} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {activeTab} bookings
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming sessions scheduled."
              : "You haven't completed any sessions yet."}
          </p>
          {activeTab === 'upcoming' && (
            <button 
              onClick={() => window.location.href = '/dashboard/practitioners'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Book a Session
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}

export default Bookings;