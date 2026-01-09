import React, { useState, useEffect } from 'react';
import { Award, Upload, CheckCircle, Clock, X, Save, Edit2 } from 'lucide-react';
import { practitionerService, authService } from '../services/api';

/**
 * PractitionerProfile Component
 * 
 * For users with role "PRACTITIONER" to:
 * - Create/update practitioner profile
 * - Add specializations
 * - Upload certificates
 * - View verification status
 * - Manage availability
 */

function PractitionerProfile() {
  const currentUser = authService.getCurrentUser();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    userId: currentUser.userId,
    specialization: '',
    bio: '',
    experience: '',
    qualifications: '',
    verified: false,
    rating: 0,
  });

  const [certificateFile, setCertificateFile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);

  // Specialization options
  const specializations = [
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
    loadPractitionerProfile();
  }, []);

  const loadPractitionerProfile = async () => {
    try {
      // Try to load existing practitioner profile
      // Adjust endpoint based on your backend
      const response = await practitionerService.getVerified();
      const practitioners = response.data || [];
      const myProfile = practitioners.find(p => p.userId === currentUser.userId);
      
      if (myProfile) {
        setProfileData(myProfile);
        setHasProfile(true);
      }
    } catch (error) {
      console.error('Error loading practitioner profile:', error);
      // Profile might not exist yet, that's okay
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (hasProfile) {
        // Update existing profile
        await practitionerService.update(profileData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        // Create new profile
        await practitionerService.create(profileData);
        setMessage({ type: 'success', text: 'Practitioner profile created successfully!' });
        setHasProfile(true);
      }
      
      setEditing(false);
      loadPractitionerProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!certificateFile) {
      setMessage({ type: 'error', text: 'Please select a certificate file' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await practitionerService.uploadCertificate(certificateFile);
      setMessage({ type: 'success', text: 'Certificate uploaded successfully! Awaiting verification.' });
      setCertificateFile(null);
    } catch (error) {
      console.error('Error uploading certificate:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload certificate' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Practitioner Profile</h1>
        <p className="text-gray-600 mt-1">Manage your professional profile and credentials</p>
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

      {/* Verification Status Card */}
      <div className={`rounded-xl p-6 ${
        profileData.verified 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {profileData.verified ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Clock className="w-8 h-8 text-yellow-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {profileData.verified ? 'Verified Practitioner' : 'Verification Pending'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {profileData.verified 
                  ? 'Your profile has been verified by our team'
                  : 'Complete your profile and upload certificates to get verified'}
              </p>
            </div>
          </div>
          {profileData.verified && (
            <Award className="w-12 h-12 text-green-600" />
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Professional Information</h2>
            <p className="text-sm text-gray-600 mt-1">Your credentials and specialization</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  loadPractitionerProfile();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization *
            </label>
            <select
              name="specialization"
              value={profileData.specialization}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <option value="">Select your specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              name="experience"
              value={profileData.experience}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
              placeholder="e.g., 5"
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualifications & Certifications
            </label>
            <textarea
              name="qualifications"
              value={profileData.qualifications}
              onChange={handleChange}
              disabled={!editing}
              rows="3"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
              placeholder="List your degrees, certifications, and qualifications..."
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              disabled={!editing}
              rows="4"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none ${
                editing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
              }`}
              placeholder="Tell potential clients about your practice, approach, and expertise..."
            />
          </div>

          {/* Rating (Read-only) */}
          {hasProfile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Rating
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-yellow-500">
                  {profileData.rating || '0.0'}
                </span>
                <span className="text-gray-600">/ 5.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Upload Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Certificates</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your professional certificates and credentials to get verified faster
        </p>

        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
            <input
              type="file"
              id="certificate"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <label
              htmlFor="certificate"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {certificateFile ? certificateFile.name : 'Click to upload certificate'}
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, or PNG (max 5MB)
              </p>
            </label>
          </div>

          {/* Upload Button */}
          {certificateFile && (
            <button
              onClick={handleUploadCertificate}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          )}
        </div>
      </div>

      {/* Statistics Card */}
      {hasProfile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-600 mt-1">Total Sessions</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">18</p>
              <p className="text-sm text-gray-600 mt-1">Happy Clients</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">12</p>
              <p className="text-sm text-gray-600 mt-1">Reviews</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PractitionerProfile;