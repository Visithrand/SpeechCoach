import React, { useState, useEffect } from 'react';
import { Target, Mic, MessageSquare, Zap, Play, Clock, Star, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import API_CONFIG from '../config/api';
import { getAuthHeaders, buildApiUrl } from '../config/api';

const Exercises = ({ userId }) => {
  // Use a default userId for testing if none is provided
  const effectiveUserId = 1 || userId;
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    fetchExercises();
  }, [effectiveUserId, selectedCategory, selectedLevel]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url;
      if (selectedCategory === 'all' && selectedLevel === 'all') {
        url = buildApiUrl(`/api/exercises/${effectiveUserId}`);
      } else if (selectedCategory !== 'all' && selectedLevel !== 'all') {
        url = buildApiUrl(`/api/exercises/${selectedCategory}/${selectedLevel}/${effectiveUserId}`);
      } else if (selectedCategory !== 'all') {
        url = buildApiUrl(`/api/exercises/${selectedCategory}/all/${effectiveUserId}`);
      } else {
        url = buildApiUrl(`/api/exercises/all/${selectedLevel}/${effectiveUserId}`);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
      } else if (response.status === 401 || response.status === 403) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching exercises:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to fetch exercises. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: Target, color: 'bg-blue-500' },
    { id: 'words', name: 'Word Practice', icon: Target, color: 'bg-green-500' },
    { id: 'sentences', name: 'Sentence Practice', icon: MessageSquare, color: 'bg-purple-500' },
    { id: 'conversations', name: 'Conversations', icon: Mic, color: 'bg-orange-500' },
    { id: 'tongue-twisters', name: 'Tongue Twisters', icon: Zap, color: 'bg-red-500' }
  ];

  const levels = [
    { id: 'all', name: 'All Levels', color: 'bg-gray-500' },
    { id: 'beginner', name: 'Beginner', color: 'bg-green-500' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-500' },
    { id: 'advanced', name: 'Advanced', color: 'bg-red-500' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading exercises...</p>
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
                <h3 className="text-lg font-medium text-red-800">Error Loading Exercises</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchExercises}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Speech Exercises</h1>
          <p className="text-gray-600 mt-2">Choose from various categories and difficulty levels to practice your speech</p>
        </div>
          
        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercise Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isActive
                      ? `${category.color} text-white border-transparent shadow-lg transform scale-105`
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Level</h2>
          <div className="flex flex-wrap gap-3">
            {levels.map((level) => {
              const isActive = selectedLevel === level.id;
              
              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${level.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All' : categories.find(c => c.id === selectedCategory)?.name} Exercises
              {selectedLevel !== 'all' && ` - ${levels.find(l => l.id === selectedLevel)?.name}`}
            </h2>
            <span className="text-sm text-gray-500">{exercises.length} exercises available</span>
          </div>

          {exercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {exercise.targetText || exercise.exerciseType || 'Speech Exercise'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {exercise.feedback || 'Practice this exercise to improve your speech clarity'}
                      </p>
                      
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          exercise.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                          exercise.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exercise.difficultyLevel || 'Beginner'}
                        </span>
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {exercise.sessionDuration ? `${Math.round(exercise.sessionDuration / 60)}m` : '2m'}
                        </span>
                        {exercise.overallScore && (
                          <span className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 mr-1 text-yellow-400" />
                            {exercise.overallScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      Start Practice
                    </button>
                    
                    {exercise.completedAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
              <p className="text-gray-500">
                Try adjusting your category or difficulty level filters.
              </p>
            </div>
          )}
        </div>

        {/* Quick Start Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to practice?</h3>
            <p className="text-gray-600 mb-4">
              Start with a quick warm-up exercise or jump into your recommended practice session.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Quick Warm-up
              </button>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Recommended Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exercises;
