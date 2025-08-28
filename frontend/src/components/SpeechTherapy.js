import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SpeechTherapy({ userId }) {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [bodyExercises, setBodyExercises] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [progressSummary, setProgressSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [selectedExerciseType, setSelectedExerciseType] = useState('all');
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [exerciseInterval, setExerciseInterval] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastCompletedExercise, setLastCompletedExercise] = useState(null);

  const API_BASE = 'http://localhost:8082/api';

  useEffect(() => {
    if (userId) {
      loadWeeklyPlan();
      loadCompletedExercises();
    }
  }, [userId]);

  // Debug: Log weeklyPlan when it changes
  useEffect(() => {
    if (weeklyPlan) {
      console.log('WeeklyPlan data:', weeklyPlan);
      console.log('WeeklyPlan type:', typeof weeklyPlan);
      console.log('WeeklyPlan methods:', Object.getOwnPropertyNames(weeklyPlan));
    }
  }, [weeklyPlan]);

  useEffect(() => {
    if (selectedDifficulty || selectedExerciseType) {
      loadBodyExercises();
    }
  }, [selectedDifficulty, selectedExerciseType]);

  const loadWeeklyPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/weekly-plan/${userId}`);
      const data = response.data;
      
      console.log('Weekly plan response:', data);
      
      if (data.weeklyPlan) {
        setWeeklyPlan(data.weeklyPlan);
      } else {
        console.warn('No weeklyPlan in response, creating default');
        // Create a default weekly plan if none exists
        const defaultPlan = {
          id: 1,
          totalMinutesGoal: 105,
          totalMinutesCompleted: 0,
          bodyExercisesGoal: 7,
          bodyExercisesCompleted: 0,
          speechExercisesGoal: 14,
          speechExercisesCompleted: 0,
          weeklyStreak: 0,
          isCompleted: false
        };
        setWeeklyPlan(defaultPlan);
      }
      
      setBodyExercises(data.bodyExercises || []);
      setDailyGoals(data.dailyGoals || []);
      setProgressSummary(data.progressSummary || {});
    } catch (error) {
      console.error('Error loading weekly plan:', error);
      // Create a default weekly plan on error
      const defaultPlan = {
        id: 1,
        totalMinutesGoal: 105,
        totalMinutesCompleted: 0,
        bodyExercisesGoal: 7,
        bodyExercisesCompleted: 0,
        speechExercisesGoal: 14,
        speechExercisesCompleted: 0,
        weeklyStreak: 0,
        isCompleted: false
      };
      setWeeklyPlan(defaultPlan);
      setBodyExercises([]);
      setDailyGoals([]);
      setProgressSummary({});
    } finally {
      setLoading(false);
    }
  };

  const loadBodyExercises = async () => {
    try {
      let url = `${API_BASE}/weekly-plan/body-exercises`;
      
      if (selectedDifficulty !== 'all') {
        url = `${API_BASE}/weekly-plan/body-exercises/difficulty/${selectedDifficulty}`;
      } else if (selectedExerciseType !== 'all') {
        url = `${API_BASE}/weekly-plan/body-exercises/type/${selectedExerciseType}`;
      } else {
        url = `${API_BASE}/weekly-plan/body-exercises/all`;
      }
      
      const response = await axios.get(url);
      setBodyExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Error loading body exercises:', error);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE}/completed-exercises/daily/${userId}?date=${today}`);
      if (response.data && response.data.exercises) {
        setCompletedExercises(response.data.exercises || []);
      }
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const startExercise = (exercise) => {
    setCurrentExercise(exercise);
    setIsExerciseActive(true);
    setExerciseTimer(exercise.durationSeconds);
    
    const interval = setInterval(() => {
      setExerciseTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          completeExercise(exercise);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setExerciseInterval(interval);
  };

  const stopExercise = () => {
    if (exerciseInterval) {
      clearInterval(exerciseInterval);
      setExerciseInterval(null);
    }
    setIsExerciseActive(false);
    setExerciseTimer(0);
    setCurrentExercise(null);
  };

  const completeExercise = async (exercise) => {
    try {
      // Mark exercise as completed
      await axios.post(`${API_BASE}/completed-exercises/complete`, {
        userId: userId,
        exerciseName: exercise.exerciseName,
        exerciseType: exercise.exerciseType,
        difficultyLevel: exercise.difficultyLevel,
        durationSeconds: exercise.durationSeconds,
        notes: `Completed ${exercise.exerciseName} exercise`
      });

      // Update weekly progress
      await axios.post(`${API_BASE}/weekly-plan/${userId}/update-progress`, null, {
        params: { date: new Date().toISOString().split('T')[0] }
      });

      // Add to completed exercises locally
      const completedExercise = {
        ...exercise,
        completedAt: new Date().toISOString(),
        duration: exercise.durationSeconds
      };
      
      setCompletedExercises(prev => [completedExercise, ...prev]);
      setLastCompletedExercise(completedExercise);
      setShowSuccessMessage(true);
      
      // Reload weekly plan and completed exercises
      await loadWeeklyPlan();
      await loadCompletedExercises();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setLastCompletedExercise(null);
      }, 5000);
      
      stopExercise();
    } catch (error) {
      console.error('Error completing exercise:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'breathing': return 'bg-blue-100 text-blue-800';
      case 'facial': return 'bg-purple-100 text-purple-800';
      case 'jaw': return 'bg-orange-100 text-orange-800';
      case 'tongue': return 'bg-pink-100 text-pink-800';
      case 'vocal': return 'bg-indigo-100 text-indigo-800';
      case 'relaxation': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Speech Therapy Weekly Plan</h2>
        <p className="text-gray-600 mb-6">
          Complete your daily body exercises and track your weekly progress for better speech clarity.
        </p>
        
        {progressSummary && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${progressSummary.totalProgress >= 80 ? 'text-green-600' : progressSummary.totalProgress >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(progressSummary.totalProgress)}%
              </div>
              <div className="text-sm text-gray-600">Weekly Progress</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${progressSummary.bodyExercisesProgress >= 80 ? 'text-green-600' : progressSummary.bodyExercisesProgress >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(progressSummary.bodyExercisesProgress)}%
              </div>
              <div className="text-sm text-gray-600">Body Exercises</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${progressSummary.speechExercisesProgress >= 80 ? 'text-green-600' : progressSummary.speechExercisesProgress >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {Math.round(progressSummary.speechExercisesProgress)}%
              </div>
              <div className="text-sm text-gray-600">Speech Exercises</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${progressSummary.isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
                {progressSummary.daysRemaining}
              </div>
              <div className="text-sm text-gray-600">Days Remaining</div>
            </div>
          </div>
        )}
        
        {progressSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center">
              <strong>Status:</strong> {progressSummary.estimatedCompletion}
            </p>
          </div>
        )}
      </div>

      {/* Daily Goals Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Daily Goals This Week</h3>
        <div className="grid md:grid-cols-7 gap-3">
          {dailyGoals.map((day, index) => (
            <div key={index} className={`text-center p-3 rounded-lg border ${
              day.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-sm font-medium text-gray-600">{day.dayName.substring(0, 3)}</div>
              <div className="text-xs text-gray-500">{day.date}</div>
              <div className="text-lg font-bold text-gray-800">{day.minutesCompleted}/{day.minutesGoal}m</div>
              <div className="text-xs text-gray-600">
                {day.bodyExercisesCompleted}/{day.bodyExerciseGoal} body
              </div>
              <div className="text-xs text-gray-600">
                {day.speechExercisesCompleted}/{day.speechExerciseGoal} speech
              </div>
              {day.isCompleted && (
                <div className="text-green-600 text-xs mt-1">✓ Complete</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && lastCompletedExercise && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 animate-pulse">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Exercise Completed!</h3>
            <p className="text-green-700 mb-3">
              Great job completing <strong>"{lastCompletedExercise.exerciseName}"</strong>!
            </p>
            <div className="text-sm text-green-600">
              Duration: {lastCompletedExercise.duration}s | 
              Type: {lastCompletedExercise.exerciseType} | 
              Difficulty: {lastCompletedExercise.difficultyLevel}
            </div>
            <div className="mt-3 text-xs text-green-500">
              Keep up the great work! Your progress has been updated.
            </div>
          </div>
        </div>
      )}

      {/* Completed Exercises Today */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Exercises Completed Today</h3>
        {completedExercises.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏃‍♂️</div>
            <p className="text-gray-500">No exercises completed yet today.</p>
            <p className="text-sm text-gray-400 mt-1">Start with a body exercise to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{exercise.exerciseName}</h4>
                    <div className="flex space-x-2 text-xs text-gray-600">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(exercise.difficultyLevel)}`}>
                        {exercise.difficultyLevel}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getExerciseTypeColor(exercise.exerciseType)}`}>
                        {exercise.exerciseType}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{exercise.duration}s</div>
                  <div className="text-xs text-gray-500">
                    {exercise.completedAt ? new Date(exercise.completedAt).toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <div className="text-sm text-green-600 font-medium">
                Total Completed: {completedExercises.length} exercises
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Exercise Filters</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Type</label>
            <select
              value={selectedExerciseType}
              onChange={(e) => setSelectedExerciseType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="breathing">Breathing</option>
              <option value="facial">Facial</option>
              <option value="jaw">Jaw</option>
              <option value="tongue">Tongue</option>
              <option value="vocal">Vocal</option>
              <option value="relaxation">Relaxation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body Exercises */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🧘 Body Exercises for Speech Therapy</h3>
        {bodyExercises.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No exercises found with the selected filters.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodyExercises.map(exercise => (
              <div key={exercise.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-800">{exercise.exerciseName}</h4>
                  <div className="flex gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficultyLevel)}`}>
                      {exercise.difficultyLevel}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getExerciseTypeColor(exercise.exerciseType)}`}>
                      {exercise.exerciseType}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">{exercise.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Duration:</span>
                    <span>{exercise.durationSeconds}s</span>
                  </div>
                  {exercise.repetitions && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Repetitions:</span>
                      <span>{exercise.repetitions}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Target:</span>
                    <span>{exercise.targetMuscles}</span>
                  </div>
                </div>
                
                <p className="text-gray-500 text-xs mb-4">{exercise.speechBenefits}</p>
                
                <button
                  onClick={() => startExercise(exercise)}
                  disabled={isExerciseActive}
                  className={`w-full px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isExerciseActive
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isExerciseActive && currentExercise?.id === exercise.id ? 'Exercise Active' : 'Start Exercise'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Exercise Practice */}
      {currentExercise && isExerciseActive && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Current Exercise</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">{currentExercise.exerciseName}</h4>
            <p className="text-blue-700 text-lg leading-relaxed mb-4">{currentExercise.instructions}</p>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatTime(exerciseTimer)}
              </div>
              <div className="text-sm text-blue-600">Time Remaining</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={stopExercise}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ⏹️ Stop Exercise
            </button>
            
            <div className="flex-1 bg-gray-100 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2">Exercise Details:</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Type:</strong> {currentExercise.exerciseType}</div>
                <div><strong>Difficulty:</strong> {currentExercise.difficultyLevel}</div>
                <div><strong>Target Muscles:</strong> {currentExercise.targetMuscles}</div>
                <div><strong>Speech Benefits:</strong> {currentExercise.speechBenefits}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Plan Summary */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading weekly plan...</span>
          </div>
        </div>
      ) : weeklyPlan && weeklyPlan.id ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Weekly Plan Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Goals & Progress</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Minutes:</span>
                  <span className="font-medium">{weeklyPlan.totalMinutesCompleted}/{weeklyPlan.totalMinutesGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Body Exercises:</span>
                  <span className="font-medium">{weeklyPlan.bodyExercisesCompleted}/{weeklyPlan.bodyExercisesGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speech Exercises:</span>
                  <span className="font-medium">{weeklyPlan.speechExercisesCompleted}/{weeklyPlan.speechExercisesGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Streak:</span>
                  <span className="font-medium">{weeklyPlan.weeklyStreak} weeks</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Progress Bars</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(weeklyPlan.totalMinutesGoal > 0 ? (weeklyPlan.totalMinutesCompleted / weeklyPlan.totalMinutesGoal) * 100 : 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${weeklyPlan.totalMinutesGoal > 0 ? Math.min(100, (weeklyPlan.totalMinutesCompleted / weeklyPlan.totalMinutesGoal) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Body Exercises</span>
                    <span>{Math.round(weeklyPlan.bodyExercisesGoal > 0 ? (weeklyPlan.bodyExercisesCompleted / weeklyPlan.bodyExercisesGoal) * 100 : 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${weeklyPlan.bodyExercisesGoal > 0 ? Math.min(100, (weeklyPlan.bodyExercisesCompleted / weeklyPlan.bodyExercisesGoal) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Speech Exercises</span>
                    <span>{Math.round(weeklyPlan.speechExercisesGoal > 0 ? (weeklyPlan.speechExercisesCompleted / weeklyPlan.speechExercisesGoal) * 100 : 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${weeklyPlan.speechExercisesGoal > 0 ? Math.min(100, (weeklyPlan.speechExercisesCompleted / weeklyPlan.speechExercisesGoal) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {weeklyPlan && weeklyPlan.isCompleted && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-green-800 font-medium text-lg">🎉 Congratulations!</div>
              <div className="text-green-700">You've completed all your weekly goals!</div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-gray-600">
            <p>No weekly plan data available.</p>
            <p className="text-sm mt-2">Try refreshing the page or contact support if the issue persists.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeechTherapy;
