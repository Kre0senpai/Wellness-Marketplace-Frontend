import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Eye, Award, Clock, FileText, Mail, Phone } from 'lucide-react';
import { practitionerService } from '../services/api';

/**
 * AdminDashboard Component
 * 
 * Admin panel for:
 * - View pending practitioner verifications
 * - Review practitioner profiles and certificates
 * - Approve or reject practitioners
 * - View all verified practitioners
 */

function AdminDashboard() {
  const [practitioners, setPractitioners] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING, VERIFIED, ALL
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPractitioners();
  }, []);

  const loadPractitioners = async () => {
    try {
      // Load all practitioners (you might need different endpoints)
      const verifiedRes = await practitionerService.getVerified();
      const verified = (verifiedRes.data || []).map(p => ({ ...p, verified: true }));
      
      // For pending practitioners, you might need a different endpoint
      // For now, we'll simulate some pending ones
      const pending = [
        {
          id: 999,
          userId: 5,
          name: 'Dr. Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          specialization: 'Acupuncture',
          experience: '8',
          qualifications: 'Licensed Acupuncturist, Master of Traditional Chinese Medicine',
          bio: 'Specialized in pain management and stress relief through acupuncture.',
          verified: false,
          certificateUrl: 'certificate-jane.pdf',
        }
      ];
      
      setPractitioners([...pending, ...verified]);
    } catch (error) {
      console.error('Error loading practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (practitionerId) => {
    try {
      await practitionerService.verify(practitionerId);
      setMessage({ type: 'success', text: 'Practitioner verified successfully!' });
      setSelectedPractitioner(null);
      loadPractitioners();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error verifying practitioner:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to verify practitioner' 
      });
    }
  };

  const handleReject = (practitionerId) => {
    if (window.confirm('Are you sure you want to reject this practitioner application?')) {
      // API call to reject
      setPractitioners(practitioners.filter(p => p.id !== practitionerId));
      setSelectedPractitioner(null);
      setMessage({ type: 'success', text: 'Practitioner application rejected' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const filteredPractitioners = practitioners.filter(p => {
    if (filter === 'PENDING') return !p.verified;
    if (filter === 'VERIFIED') return p.verified;
    return true; // ALL
  });

  const PractitionerCard = ({ practitioner }) => (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
      onClick={() => setSelectedPractitioner(practitioner)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {practitioner.name ? practitioner.name.charAt(0) : 'P'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {practitioner.name || 'Practitioner Name'}
            </h3>
            <p className="text-sm text-gray-600">{practitioner.specialization}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          practitioner.verified
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {practitioner.verified ? (
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Verified</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Pending</span>
            </span>
          )}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          {practitioner.email || 'No email'}
        </p>
        <p className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          {practitioner.phone || 'No phone'}
        </p>
        <p>
          <span className="font-medium">Experience:</span> {practitioner.experience || '0'} years
        </p>
      </div>

      <div className="mt-4 flex space-x-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPractitioner(practitioner);
          }}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center space-x-1"
        >
          <Eye className="w-4 h-4" />
          <span>Review</span>
        </button>
        {!practitioner.verified && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleVerify(practitioner.id);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleReject(practitioner.id);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const DetailModal = ({ practitioner, onClose }) => {
    if (!practitioner) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {practitioner.name ? practitioner.name.charAt(0) : 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{practitioner.name}</h2>
                <p className="text-gray-600">{practitioner.specialization}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center text-gray-700">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  {practitioner.email}
                </p>
                {practitioner.phone && (
                  <p className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {practitioner.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Professional Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Specialization:</span>
                  <p className="font-medium text-gray-800">{practitioner.specialization}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Experience:</span>
                  <p className="font-medium text-gray-800">{practitioner.experience} years</p>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            {practitioner.qualifications && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Qualifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{practitioner.qualifications}</p>
                </div>
              </div>
            )}

            {/* Bio */}
            {practitioner.bio && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Biography</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{practitioner.bio}</p>
                </div>
              </div>
            )}

            {/* Certificate */}
            {practitioner.certificateUrl && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Certificate</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">{practitioner.certificateUrl}</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    View Certificate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!practitioner.verified && (
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => {
                  handleReject(practitioner.id);
                  onClose();
                }}
                className="flex-1 px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold flex items-center justify-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  handleVerify(practitioner.id);
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve & Verify</span>
              </button>
            </div>
          )}
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage practitioner verifications</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Pending Verifications</p>
            <p className="text-3xl font-bold text-yellow-600">
              {practitioners.filter(p => !p.verified).length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Verified Practitioners</p>
            <p className="text-3xl font-bold text-green-600">
              {practitioners.filter(p => p.verified).length}
            </p>
          </div>
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

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex">
        {['PENDING', 'VERIFIED', 'ALL'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'PENDING' ? 'Pending Review' : f === 'VERIFIED' ? 'Verified' : 'All Practitioners'}
          </button>
        ))}
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
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No practitioners to review
          </h3>
          <p className="text-gray-600">
            {filter === 'PENDING' 
              ? 'All practitioner applications have been processed'
              : 'No practitioners found in this category'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPractitioner && (
        <DetailModal 
          practitioner={selectedPractitioner} 
          onClose={() => setSelectedPractitioner(null)} 
        />
      )}
    </div>
  );
}

export default AdminDashboard;