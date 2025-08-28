import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Clock, Flame, Trophy, Play, 
  Target, Mic, Calendar, Loader, AlertCircle 
} from 'lucide-react';
import API_CONFIG from '../config/api';

function Dashboard({ userId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.DASHBOARD.MAIN(userId)}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data. Please try again.');
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
              <p className="text-gray-600">Loading dashboard...</p>
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
                <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchDashboardData}
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
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-yellow-800">No Dashboard Data Available</h3>
              <p className="text-yellow-700 mt-1">Start practicing to see your dashboard information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Weekly Progress',
      value: `${Math.round((dashboardData.weeklyProgress?.totalMinutesCompleted / dashboardData.weeklyProgress?.totalMinutesGoal) * 100) || 0}%`,
      change: dashboardData.weeklyProgress?.change || '+0%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      name: 'Current Streak',
      value: `${dashboardData.streak?.currentStreak || 0} days`,
      change: `+${dashboardData.streak?.daysGained || 0} days`,
      changeType: 'positive',
      icon: Flame,
      color: 'bg-orange-500'
    },
    {
      name: 'Exercises Today',
      value: `${dashboardData.today?.completed || 0}/${dashboardData.today?.goal || 5}`,
      change: dashboardData.today?.status || 'On track',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      name: 'Weekly Goal',
      value: `${dashboardData.weeklyProgress?.totalMinutesCompleted || 0}/${dashboardData.weeklyProgress?.totalMinutesGoal || 105} min`,
      change: `${Math.round((dashboardData.weeklyProgress?.totalMinutesCompleted / dashboardData.weeklyProgress?.totalMinutesGoal) * 100) || 0}% complete`,
      changeType: 'neutral',
      icon: Trophy,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    {
      name: 'Start Body Exercise',
      description: 'Begin with jaw and facial exercises',
      icon: Target,
      href: '/exercises',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Practice Speech',
      description: 'Work on pronunciation and fluency',
      icon: Mic,
      href: '/speech-exercises',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'View Progress',
      description: 'Check your weekly achievements',
      icon: TrendingUp,
      href: '/analytics',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Set Goals',
      description: 'Customize your therapy targets',
      icon: Calendar,
      href: '/settings',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-blue-100 text-lg">
                {dashboardData.welcomeMessage || "You're making great progress with your speech therapy. Keep up the excellent work!"}
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-300" />
                  <span className="text-sm">{dashboardData.streak?.currentStreak || 0} day streak</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">
                    {Math.round((dashboardData.weeklyProgress?.totalMinutesCompleted / dashboardData.weeklyProgress?.totalMinutesGoal) * 100) || 0}% weekly goal
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Weekly Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Exercises */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exercises</h2>
            {dashboardData.recentExercises && dashboardData.recentExercises.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentExercises.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        exercise.type === 'Body' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {exercise.type === 'Body' ? <Target className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{exercise.name}</p>
                        <p className="text-sm text-gray-600">{exercise.type} • {exercise.duration}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{exercise.completed}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent exercises yet. Start practicing to see your activity!</p>
              </div>
            )}
            <Link to="/exercises" className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
              View all exercises
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round((dashboardData.weeklyProgress?.totalMinutesCompleted / dashboardData.weeklyProgress?.totalMinutesGoal) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dashboardData.weeklyProgress?.totalMinutesCompleted / dashboardData.weeklyProgress?.totalMinutesGoal) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Body Exercises</span>
                  <span>{Math.round((dashboardData.weeklyProgress?.bodyExercisesCompleted / dashboardData.weeklyProgress?.bodyExercisesGoal) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dashboardData.weeklyProgress?.bodyExercisesCompleted / dashboardData.weeklyProgress?.bodyExercisesGoal) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Speech Exercises</span>
                  <span>{Math.round((dashboardData.weeklyProgress?.speechExercisesCompleted / dashboardData.weeklyProgress?.speechExercisesGoal) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dashboardData.weeklyProgress?.speechExercisesCompleted / dashboardData.weeklyProgress?.speechExercisesGoal) * 100) || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {dashboardData.streak?.currentStreak || 0} day streak! Keep going strong!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">💪 You're doing amazing!</h2>
            <p className="text-gray-600 mb-4">
              {dashboardData.motivationalMessage || "Consistency is key to improving your speech. Every exercise brings you closer to your goals."}
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/exercises"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Exercise
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
