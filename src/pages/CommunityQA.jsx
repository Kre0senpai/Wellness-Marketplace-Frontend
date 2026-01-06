import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, User, Clock, Plus } from 'lucide-react';
import { qaService, authService } from '../services/api';

/**
 * CommunityQA Component
 * 
 * Community forum for health and wellness questions:
 * - Browse questions
 * - Post new questions
 * - Answer questions
 * - Upvote helpful answers
 */

function CommunityQA() {
  const currentUser = authService.getCurrentUser();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await qaService.getAllQuestions();
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async (questionId) => {
    try {
      const response = await qaService.getQuestionAnswers(questionId);
      setAnswers(response.data || []);
    } catch (error) {
      console.error('Error loading answers:', error);
    }
  };

  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) {
      setMessage({ type: 'error', text: 'Please enter a question' });
      return;
    }

    try {
      await qaService.postQuestion(newQuestion);
      setMessage({ type: 'success', text: 'Question posted successfully!' });
      setNewQuestion('');
      setShowNewQuestionModal(false);
      loadQuestions();
    } catch (error) {
      console.error('Error posting question:', error);
      setMessage({ type: 'error', text: 'Failed to post question' });
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) {
      setMessage({ type: 'error', text: 'Please enter an answer' });
      return;
    }

    try {
      await qaService.postAnswer(selectedQuestion.id, newAnswer);
      setMessage({ type: 'success', text: 'Answer posted successfully!' });
      setNewAnswer('');
      loadAnswers(selectedQuestion.id);
    } catch (error) {
      console.error('Error posting answer:', error);
      setMessage({ type: 'error', text: 'Failed to post answer' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const QuestionCard = ({ question }) => (
    <div
      onClick={() => {
        setSelectedQuestion(question);
        loadAnswers(question.id);
      }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-gray-800">
              {question.userName || 'Anonymous'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(question.createdAt)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {question.content}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {question.answerCount || 0} answers
            </span>
            <span className="flex items-center">
              <ThumbsUp className="w-4 h-4 mr-1" />
              {question.upvotes || 0} helpful
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const AnswerCard = ({ answer }) => (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          {answer.isPractitioner ? '👨‍⚕️' : <User className="w-5 h-5 text-green-600" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-gray-800">
              {answer.practitionerName || answer.userName || 'User'}
            </span>
            {answer.isPractitioner && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                Practitioner
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {formatDate(answer.createdAt)}
            </span>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-3">
            {answer.content}
          </p>
          
          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition">
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful ({answer.upvotes || 0})</span>
          </button>
        </div>
      </div>
    </div>
  );

  const NewQuestionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ask a Question</h2>
        <p className="text-gray-600 mb-6">
          Get answers from our community of wellness experts and practitioners
        </p>
        
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          rows="4"
          placeholder="What would you like to know about wellness, therapy, or health?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-6"
        />
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNewQuestionModal(false)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handlePostQuestion}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Post Question
          </button>
        </div>
      </div>
    </div>
  );

  const QuestionDetailView = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setSelectedQuestion(null)}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Questions
      </button>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-800">
                {selectedQuestion.userName || 'Anonymous'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {formatDate(selectedQuestion.createdAt)}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedQuestion.content}
            </h2>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>
        
        {answers.length > 0 ? (
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <AnswerCard key={index} answer={answer} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No answers yet. Be the first to help!</p>
          </div>
        )}
      </div>

      {/* Answer Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Your Answer</h3>
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          rows="4"
          placeholder="Share your knowledge or experience..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-4"
        />
        <button
          onClick={handlePostAnswer}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Post Answer</span>
        </button>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {!selectedQuestion ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Community Q&A</h1>
              <p className="text-gray-600 mt-1">
                Ask questions and get answers from wellness experts
              </p>
            </div>
            <button
              onClick={() => setShowNewQuestionModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ask Question</span>
            </button>
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

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to ask a question!
              </p>
              <button
                onClick={() => setShowNewQuestionModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Ask a Question
              </button>
            </div>
          )}

          {/* Modal */}
          {showNewQuestionModal && <NewQuestionModal />}
        </>
      ) : (
        <QuestionDetailView />
      )}
    </div>
  );
}

export default CommunityQA;