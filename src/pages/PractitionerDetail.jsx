import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Award, MapPin, Calendar, Clock, Mail, Phone, ArrowLeft, MessageSquare } from 'lucide-react';
import { practitionerService, reviewService } from '../services/api';

/**
 * PractitionerDetail Component
 * 
 * Displays detailed practitioner information:
 * - Full profile and bio
 * - Reviews and ratings
 * - Available time slots
 * - Book session button
 */

function PractitionerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [practitioner, setPractitioner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'reviews'

  useEffect(() => {
    loadPractitionerDetails();
    loadReviews();
  }, [id]);

  const loadPractitionerDetails = async () => {
    try {
      // Get all verified practitioners and find the one we need
      const response = await practitionerService.getVerified();
      const practitioners = response.data || [];
      const found = practitioners.find(p => p.id === parseInt(id));
      
      if (found) {
        setPractitioner(found);
      }
    } catch (error) {
      console.error('Error loading practitioner:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewService.getPractitionerReviews(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/practitioners')}
        className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Practitioners
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white flex items-center justify-center text-5xl font-bold text-blue-600 shadow-xl">
              {practitioner.name ? practitioner.name.charAt(0).toUpperCase() : 'P'}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            {/* Left Side */}
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {practitioner.name || 'Practitioner Name'}
                </h1>
                {practitioner.verified && (
                  <Award className="w-7 h-7 text-green-600" />
                )}
              </div>
              
              <p className="text-xl text-blue-600 font-medium mb-4">
                {practitioner.specialization || 'Wellness Expert'}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (practitioner.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">
                  {practitioner.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-500">
                  ({reviews.length} reviews)
                </span>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-gray-600">
                {practitioner.experience && (
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {practitioner.experience} years of experience
                  </p>
                )}
                {practitioner.location && (
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {practitioner.location}
                  </p>
                )}
                {practitioner.email && (
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {practitioner.email}
                  </p>
                )}
                {practitioner.phone && (
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {practitioner.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex flex-col space-y-3 w-full md:w-auto">
              <button
                onClick={() => navigate(`/dashboard/book/${practitioner.id}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Session</span>
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 font-medium border-b-2 transition ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 font-medium border-b-2 transition ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About Me</h3>
                <p className="text-gray-700 leading-relaxed">
                  {practitioner.bio || 'No bio available.'}
                </p>
              </div>

              {/* Qualifications */}
              {practitioner.qualifications && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Qualifications & Certifications
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {practitioner.qualifications}
                  </p>
                </div>
              )}

              {/* Specialization Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Specialization</h3>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {practitioner.specialization}
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Services Offered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Initial Consultation', 'Follow-up Session', 'Emergency Support', 'Online Session'].map((service) => (
                    <div key={service} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.userName || 'Anonymous'}
                        </p>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (review.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {review.comment || 'No comment provided.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No reviews yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Be the first to review this practitioner
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to start your wellness journey?</h3>
          <p className="text-blue-100 mb-6">
            Book a session with {practitioner.name} and take the first step towards better health
          </p>
          <button
            onClick={() => navigate(`/dashboard/book/${practitioner.id}`)}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Book a Session Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PractitionerDetail;