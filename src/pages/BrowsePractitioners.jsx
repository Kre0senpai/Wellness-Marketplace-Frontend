import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Award, Calendar, Filter, X } from 'lucide-react';
import { practitionerService } from '../services/api';

/**
 * BrowsePractitioners Component
 * 
 * Browse and search verified practitioners:
 * - Filter by specialization
 * - Search by name
 * - View ratings and details
 * - Book sessions
 */

function BrowsePractitioners() {
  const navigate = useNavigate();
  const [practitioners, setPractitioners] = useState([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const specializations = [
    'ALL',
    'Physiotherapy',
    'Acupuncture',
    'Ayurveda',
    'Chiropractic',
    'Massage Therapy',
    'Yoga Therapy',
    'Naturopathy',
    'Homeopathy',
    'Reflexology',
    'Aromatherapy',
  ];

  useEffect(() => {
    loadPractitioners();
  }, []);

  useEffect(() => {
    filterPractitioners();
  }, [searchQuery, selectedSpecialization, practitioners]);

  const loadPractitioners = async () => {
    try {
      const response = await practitionerService.getVerified();
      setPractitioners(response.data || []);
    } catch (error) {
      console.error('Error loading practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPractitioners = () => {
    let filtered = [...practitioners];

    // Filter by specialization
    if (selectedSpecialization !== 'ALL') {
      filtered = filtered.filter(
        p => p.specialization?.toLowerCase() === selectedSpecialization.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPractitioners(filtered);
  };

  const PractitionerCard = ({ practitioner }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer">
      {/* Card Header with Image */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
            {practitioner.name ? practitioner.name.charAt(0).toUpperCase() : 'P'}
          </div>
        </div>
        {practitioner.verified && (
          <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
            <Award className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="pt-16 px-6 pb-6">
        {/* Name and Specialization */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-xl font-bold text-gray-800">
              {practitioner.name || 'Practitioner Name'}
            </h3>
            {practitioner.verified && (
              <Award className="w-5 h-5 text-green-600" />
            )}
          </div>
          <p className="text-blue-600 font-medium">
            {practitioner.specialization || 'Wellness Expert'}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (practitioner.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {practitioner.rating?.toFixed(1) || '0.0'} ({practitioner.reviewCount || 0} reviews)
          </span>
        </div>

        {/* Experience */}
        {practitioner.experience && (
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">{practitioner.experience} years</span> of experience
          </p>
        )}

        {/* Bio Preview */}
        {practitioner.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {practitioner.bio}
          </p>
        )}

        {/* Location */}
        {practitioner.location && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{practitioner.location}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/dashboard/practitioners/${practitioner.id}`)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Profile
          </button>
          <button
            onClick={() => navigate(`/dashboard/book/${practitioner.id}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-1"
          >
            <Calendar className="w-4 h-4" />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Browse Practitioners</h1>
        <p className="text-gray-600 mt-1">
          Find verified wellness practitioners near you
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialization, or expertise..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {/* Specialization Filter (Desktop) */}
          <div className="hidden md:block">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === 'ALL' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <div className="grid grid-cols-2 gap-2">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedSpecialization === spec
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec === 'ALL' ? 'All' : spec}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Found <span className="font-semibold">{filteredPractitioners.length}</span> practitioners
          {selectedSpecialization !== 'ALL' && (
            <span> in <span className="font-semibold">{selectedSpecialization}</span></span>
          )}
        </p>
        {(searchQuery || selectedSpecialization !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialization('ALL');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Practitioners Grid */}
      {filteredPractitioners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractitioners.map((practitioner) => (
            <PractitionerCard key={practitioner.id} practitioner={practitioner} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No practitioners found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedSpecialization !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'No verified practitioners available at the moment'}
          </p>
          {(searchQuery || selectedSpecialization !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialization('ALL');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Call to Action for Practitioners */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Are you a wellness practitioner?</h3>
            <p className="text-blue-100">
              Join our platform and connect with clients seeking your expertise
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/practitioner-profile')}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Create Practitioner Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrowsePractitioners;