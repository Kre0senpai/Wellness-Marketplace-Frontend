import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, User, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import { practitionerService, bookingService } from '../services/api';

/**
 * BookingForm Component
 * 
 * Book therapy sessions:
 * - Select date and time
 * - View available slots
 * - Add notes/reason for visit
 * - Confirm booking
 */

function BookingForm() {
  const { practitionerId } = useParams();
  const navigate = useNavigate();

  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Details, 4: Confirm

  const [bookingData, setBookingData] = useState({
    practitionerId: practitionerId,
    date: '',
    time: '',
    duration: '60', // minutes
    reason: '',
    notes: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPractitionerInfo();
  }, [practitionerId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadPractitionerInfo = async () => {
    try {
      const response = await practitionerService.getVerified();
      const practitioners = response.data || [];
      const found = practitioners.find(p => p.id === parseInt(practitionerId));
      
      if (found) {
        setPractitioner(found);
      }
    } catch (error) {
      console.error('Error loading practitioner:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date) => {
    try {
      const response = await practitionerService.getAvailableSlots(practitionerId, date);
      setAvailableSlots(response.data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      // Generate default slots if API fails
      setAvailableSlots([
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
      ]);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setBookingData({ ...bookingData, date });
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setBookingData({ ...bookingData, time });
    setStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await bookingService.createBooking(bookingData);
      setStep(4); // Success step
    } catch (error) {
      console.error('Error creating booking:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create booking. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 14 days for date selection
  const getNextDays = (count = 14) => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateValue = (date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Practitioner not found</p>
        <button
          onClick={() => navigate('/dashboard/practitioners')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Practitioners
        </button>
      </div>
    );
  }

  // Success Screen
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Your session with {practitioner.name} has been scheduled for {bookingData.date} at {bookingData.time}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/dashboard/practitioners')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Browse More Practitioners
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/dashboard/practitioners/${practitionerId}`)}
        className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Profile
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {practitioner.name ? practitioner.name.charAt(0) : 'P'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Book a Session</h1>
            <p className="text-gray-600">with {practitioner.name}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Select Date' },
            { num: 2, label: 'Choose Time' },
            { num: 3, label: 'Add Details' },
          ].map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.num}
                </div>
                <span className={`ml-3 font-medium hidden sm:inline ${
                  step >= s.num ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {s.label}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-4 ${
                  step > s.num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
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

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Select Date */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Select a Date</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getNextDays().map((date) => {
                const dateValue = formatDateValue(date);
                const isSelected = selectedDate === dateValue;
                
                return (
                  <button
                    key={dateValue}
                    onClick={() => handleDateSelect(dateValue)}
                    className={`p-4 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {date.getDate()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Choose Time */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Choose a Time</h2>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Change Date
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Available slots for {formatDate(new Date(selectedDate))}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = bookingData.time === slot;
                
                return (
                  <button
                    key={slot}
                    onClick={() => handleTimeSelect(slot)}
                    className={`p-4 rounded-lg border-2 font-medium transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-blue-300 text-gray-700'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Add Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Booking Details</h2>
              <p className="text-gray-600">
                {formatDate(new Date(bookingData.date))} at {bookingData.time}
                <button
                  onClick={() => setStep(2)}
                  className="ml-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change
                </button>
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Duration
              </label>
              <select
                name="duration"
                value={bookingData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes (Recommended)</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <input
                type="text"
                name="reason"
                value={bookingData.reason}
                onChange={handleInputChange}
                placeholder="e.g., Back pain, stress relief, wellness checkup"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any specific concerns or questions you'd like to discuss..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Practitioner</span>
                  <span className="font-medium text-gray-800">{practitioner.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(new Date(bookingData.date))} at {bookingData.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-800">{bookingData.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600">Session Fee</span>
                  <span className="text-2xl font-bold text-gray-800">$80</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingForm;