import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Calendar, ChevronRight, Search } from 'lucide-react';
import { recommendationService } from '../services/api';

/**
 * Recommendations Component
 * 
 * AI-powered therapy recommendations:
 * - Generate recommendations based on symptoms
 * - View past recommendations
 * - Find practitioners for recommended therapies
 */

function Recommendations() {
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [pastRecommendations, setPastRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadPastRecommendations();
  }, []);

  const loadPastRecommendations = async () => {
    try {
      const response = await recommendationService.getMyRecommendations();
      setPastRecommendations(response.data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleGenerateRecommendation = async () => {
    if (!symptom.trim()) {
      setMessage({ type: 'error', text: 'Please describe your symptoms' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await recommendationService.generate(symptom);
      setRecommendations([response.data] || []);
      setShowResults(true);
      loadPastRecommendations();
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to generate recommendations' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const RecommendationCard = ({ recommendation }) => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-8">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Recommended Therapy
          </h3>
          <p className="text-gray-600">
            Based on your symptoms: <span className="font-medium">{recommendation.symptom}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Suggested Therapy
        </h4>
        <p className="text-xl font-bold text-blue-600 mb-2">
          {recommendation.suggestedTherapy}
        </p>
        <p className="text-gray-600 text-sm">
          Source: {recommendation.sourceAPI || 'AI Analysis'}
        </p>
      </div>

      {recommendation.description && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Why This Therapy?</h4>
          <p className="text-gray-700 leading-relaxed">
            {recommendation.description}
          </p>
        </div>
      )}

      <button
        onClick={() => navigate('/dashboard/practitioners')}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold flex items-center justify-center space-x-2"
      >
        <Calendar className="w-5 h-5" />
        <span>Find Practitioners</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const PastRecommendationCard = ({ recommendation }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">
            {recommendation.suggestedTherapy}
          </h4>
          <p className="text-sm text-gray-600">
            For: {recommendation.symptom}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(recommendation.timestamp)}
        </span>
      </div>
      <button
        onClick={() => navigate('/dashboard/practitioners')}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
      >
        <span>Find Practitioners</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          AI-Powered Recommendations
        </h1>
        <p className="text-gray-600 text-lg">
          Get personalized therapy suggestions based on your health concerns
        </p>
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

      {!showResults ? (
        <>
          {/* Input Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Describe Your Symptoms
            </h2>
            <p className="text-gray-600 mb-6">
              Tell us what you're experiencing, and we'll suggest the best therapy options
            </p>

            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              rows="5"
              placeholder="E.g., Lower back pain for 2 weeks, stress and anxiety, difficulty sleeping..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-6"
            />

            <button
              onClick={handleGenerateRecommendation}
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold text-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Describe Symptoms</h4>
                <p className="text-sm text-gray-600">
                  Share your health concerns and symptoms
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes and suggests therapies
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Book Session</h4>
                <p className="text-sm text-gray-600">
                  Connect with verified practitioners
                </p>
              </div>
            </div>
          </div>

          {/* Past Recommendations */}
          {pastRecommendations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Past Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastRecommendations.slice(0, 4).map((rec, index) => (
                  <PastRecommendationCard key={index} recommendation={rec} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button */}
          <button
            onClick={() => setShowResults(false)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Get Another Recommendation
          </button>

          {/* Results */}
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Next Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/dashboard/practitioners')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition text-left"
              >
                <Search className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">
                  Find Practitioners
                </h4>
                <p className="text-sm text-gray-600">
                  Browse verified practitioners specializing in your recommended therapy
                </p>
              </button>
              <button
                onClick={() => navigate('/dashboard/community')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition text-left"
              >
                <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">
                  Ask Community
                </h4>
                <p className="text-sm text-gray-600">
                  Get advice from others who've tried similar therapies
                </p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Recommendations;