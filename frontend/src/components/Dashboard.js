import React from 'react';

function Dashboard({ userProgress, setCurrentPage }) {
  const quickActions = [
    { id: 'phoneme', name: 'Phoneme Practice', icon: '🔤', description: 'Practice individual sounds' },
    { id: 'words', name: 'Word Exercises', icon: '📝', description: 'Improve word pronunciation' },
    { id: 'sentences', name: 'Sentence Practice', icon: '📖', description: 'Work on fluency' },
    { id: 'conversation', name: 'Conversations', icon: '💬', description: 'Real-world scenarios' }
  ];

  const weeklyProgress = (userProgress.exercisesCompleted * 3 / userProgress.weeklyGoal) * 100;
  const dailyProgress = 60; // Mock daily progress

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Speech Journey!</h2>
        <p className="text-lg text-gray-600">Let's practice and improve together</p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Goal</h3>
          <div className="text-2xl font-bold text-blue-600 mb-2">{Math.floor(dailyProgress)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${dailyProgress}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">9 of 15 minutes completed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Weekly Progress</h3>
          <div className="text-2xl font-bold text-green-600 mb-2">{Math.floor(weeklyProgress)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: `${weeklyProgress}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{userProgress.exercisesCompleted * 3} of {userProgress.weeklyGoal} minutes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Points</h3>
          <div className="text-2xl font-bold text-purple-600">{userProgress.totalPoints}</div>
          <p className="text-sm text-gray-500 mt-2">🏆 Keep earning more!</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Streak</h3>
          <div className="text-2xl font-bold text-orange-600">{userProgress.streakDays} days</div>
          <p className="text-sm text-gray-500 mt-2">🔥 Great consistency!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setCurrentPage('exercises')}
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{action.name}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements 🏆</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">🎯 Completed 5 exercises in a row</span>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">🔥 Maintained 7-day streak</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">📈 Improved by 10%</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">🎪 Mastered 'TH' sound</span>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white text-center">
        <p className="text-lg font-medium">💪 "Great speech comes from great practice! Keep going!"</p>
      </div>
    </div>
  );
}

export default Dashboard;
