import React, { useState, useEffect } from 'react';
import { User, Trophy, Calendar, Target, Star, Award, TrendingUp, Clock, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Profile = ({ userId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile data
      const profileResponse = await axios.get(`/api/users/${userId}`);
      setUserProfile(profileResponse.data);
      
      // Fetch user achievements
      const achievementsResponse = await axios.get(`/api/users/${userId}/achievements`);
      setAchievements(achievementsResponse.data);
      
      // Fetch recent activity
      const activityResponse = await axios.get(`/api/users/${userId}/recent-activity`);
      setRecentActivity(activityResponse.data);
      
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.response?.data?.message || 'Failed to fetch profile data. Please try again.');
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
              <p className="text-gray-600">Loading profile...</p>
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
                <h3 className="text-lg font-medium text-red-800">Error Loading Profile</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchProfileData}
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
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-yellow-800">No Profile Data Available</h3>
              <p className="text-yellow-700 mt-1">Profile information could not be loaded.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={userProfile.avatar || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-blue-100"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
              <p className="text-gray-600">{userProfile.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Target className="w-4 h-4 mr-1" />
                  {userProfile.level}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {new Date(userProfile.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{userProfile.totalPoints}</div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userProfile.currentStreak}</div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile.exercisesCompleted}</div>
                  <div className="text-sm text-gray-500">Exercises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userProfile.totalPracticeTime}</div>
                  <div className="text-sm text-gray-500">Practice Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userProfile.longestStreak}</div>
                  <div className="text-sm text-gray-500">Best Streak</div>
                </div>
              </div>
            </div>

            {/* Skills Radar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Assessment</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{userProfile.accuracy}%</div>
                  <div className="text-sm text-gray-500">Pronunciation Accuracy</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${userProfile.accuracy}%` }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{userProfile.fluency}%</div>
                  <div className="text-sm text-gray-500">Speech Fluency</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${userProfile.fluency}%` }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userProfile.confidence}%</div>
                  <div className="text-sm text-gray-500">Speaking Confidence</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${userProfile.confidence}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{activity.type}</div>
                          <div className="text-sm text-gray-500">{activity.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{activity.score}%</div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity yet. Start practicing to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h2>
              {achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`p-3 rounded-lg border ${
                      achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            achievement.earned ? 'text-green-900' : 'text-gray-700'
                          }`}>
                            {achievement.name}
                          </div>
                          <div className="text-sm text-gray-500">{achievement.description}</div>
                          {achievement.earned && (
                            <div className="text-xs text-green-600 mt-1">Earned {achievement.date}</div>
                          )}
                          {!achievement.earned && achievement.progress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No achievements yet. Keep practicing to unlock them!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Practice Session
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  View Progress Report
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  Update Profile
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
