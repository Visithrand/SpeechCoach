import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle, Target, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const Feedback = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackData();
  }, [userId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/feedback/${userId}`);
      setSessionData(response.data);
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
  if (!sessionData) {
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'major': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Feedback</h1>
          <p className="text-gray-600 mt-2">Detailed analysis of your latest practice session</p>
        </div>

        {/* Session Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{sessionData.exerciseType}</h2>
              <p className="text-gray-600">{sessionData.date} • {sessionData.duration}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{sessionData.overallScore}%</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-lg text-gray-800 font-medium">"{sessionData.targetPhrase}"</p>
          </div>

          {/* Audio Player */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Your Recording</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0:07</span>
                  <span>0:15</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <input type="range" min="0" max="100" defaultValue="80" className="w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'mistakes', label: 'Mistakes', icon: '❌' },
                { id: 'improvements', label: 'Improvements', icon: '✅' },
                { id: 'recommendations', label: 'AI Recommendations', icon: '🤖' }
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(sessionData.detailedScores).map(([skill, score]) => (
                    <div key={skill} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{score}%</div>
                      <div className="text-sm text-gray-600 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mistakes Tab */}
            {activeTab === 'mistakes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pronunciation Mistakes</h3>
                {sessionData.mistakes && sessionData.mistakes.length > 0 ? (
                  sessionData.mistakes.map((mistake, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-6 h-6 text-orange-500" />
                          <div>
                            <div className="font-medium text-gray-900">{mistake.word}</div>
                            <div className="text-sm text-gray-500">Minor pronunciation issue</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(mistake.severity)}`}>
                          {mistake.severity}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700">You Said:</div>
                          <div className="text-lg font-mono text-red-600">{mistake.userSaid}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Correct:</div>
                          <div className="text-lg font-mono text-green-600">{mistake.correct}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">Suggestion:</div>
                          <div className="text-sm text-gray-600">{mistake.suggestion}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Great job! No pronunciation mistakes found in this session.</p>
                  </div>
                )}
              </div>
            )}

            {/* Improvements Tab */}
            {activeTab === 'improvements' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">What You Did Well</h3>
                {sessionData.improvements && sessionData.improvements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessionData.improvements.map((improvement, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                          <p className="text-green-800">{improvement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No specific improvements recorded for this session.</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
                {sessionData.aiRecommendations && sessionData.aiRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {sessionData.aiRecommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-gray-600">{rec.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Start Exercise
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No AI recommendations available for this session.</p>
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
