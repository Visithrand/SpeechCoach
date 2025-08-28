import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle, Target, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import API_CONFIG from '../config/api';

const Feedback = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [userId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/feedback/${userId}`);
      setFeedbackData(response.data);
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      setError(err.response?.data?.message || 'Failed to fetch feedback data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading feedback...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Feedback</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchFeedbackData}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!feedbackData || !feedbackData.feedback) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-yellow-800">No Feedback Data Available</h3>
              <p className="text-yellow-700 mt-1">Complete a speech exercise to see your feedback.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'suggestion': return 'text-blue-600 bg-blue-100';
      case 'improvement': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback & Progress</h1>
          <p className="text-gray-600 mt-2">Your personalized feedback and improvement suggestions</p>
        </div>

        {/* Feedback Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Overall Progress</h2>
              <p className="text-gray-600">Based on your recent practice sessions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{feedbackData.averageScore}%</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{feedbackData.total}</div>
              <div className="text-sm text-gray-600">Total Feedback Items</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {feedbackData.feedback.filter(f => f.type === 'positive').length}
              </div>
              <div className="text-sm text-gray-600">Positive Feedback</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {feedbackData.feedback.filter(f => f.type === 'suggestion').length}
              </div>
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'feedback', label: 'All Feedback', icon: '💬' },
                { id: 'positive', label: 'Positive', icon: '✅' },
                { id: 'suggestions', label: 'Suggestions', icon: '💡' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Recent Achievements</h3>
                    <div className="space-y-3">
                      {feedbackData.feedback
                        .filter(f => f.type === 'positive')
                        .slice(0, 3)
                        .map((feedback, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-blue-800 text-sm">{feedback.message}</p>
                              <p className="text-blue-600 text-xs mt-1">Score: {feedback.score}%</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-yellow-900 mb-3">Areas for Improvement</h3>
                    <div className="space-y-3">
                      {feedbackData.feedback
                        .filter(f => f.type === 'suggestion')
                        .slice(0, 3)
                        .map((feedback, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Target className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-yellow-800 text-sm">{feedback.message}</p>
                              <p className="text-yellow-600 text-xs mt-1">Score: {feedback.score}%</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Feedback Items</h3>
                <div className="space-y-4">
                  {feedbackData.feedback.map((feedback, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {feedback.type === 'positive' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Target className="w-6 h-6 text-blue-600" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {feedback.type === 'positive' ? 'Great Job!' : 'Suggestion'}
                            </div>
                            <div className="text-sm text-gray-500">{feedback.date}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(feedback.type)}`}>
                          {feedback.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{feedback.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className="text-lg font-semibold text-blue-600">{feedback.score}%</span>
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${feedback.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Feedback Tab */}
            {activeTab === 'positive' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Positive Feedback</h3>
                {feedbackData.feedback.filter(f => f.type === 'positive').length > 0 ? (
                  <div className="space-y-4">
                    {feedbackData.feedback
                      .filter(f => f.type === 'positive')
                      .map((feedback, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-green-800 mb-2">{feedback.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600">{feedback.date}</span>
                                <span className="text-lg font-semibold text-green-700">{feedback.score}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No positive feedback available yet. Keep practicing!</p>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Improvement Suggestions</h3>
                {feedbackData.feedback.filter(f => f.type === 'suggestion').length > 0 ? (
                  <div className="space-y-4">
                    {feedbackData.feedback
                      .filter(f => f.type === 'suggestion')
                      .map((feedback, index) => (
                        <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                          <div className="flex items-start space-x-3">
                            <Target className="w-6 h-6 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <p className="text-blue-800 mb-2">{feedback.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-600">{feedback.date}</span>
                                <span className="text-lg font-semibold text-blue-700">{feedback.score}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No suggestions available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
