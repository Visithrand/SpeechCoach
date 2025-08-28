import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Target, BarChart3, PieChart as PieChartIcon, 
  Activity, Calendar, Clock, Award, TrendingDown, AlertCircle, Loader
} from 'lucide-react';
import API_CONFIG from '../config/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const [filters, setFilters] = useState({
    exerciseType: 'all',
    difficulty: 'all',
    dateRange: '30d'
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Fetch analytics data from backend API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from localStorage or context (adjust based on your auth implementation)
      const userId = localStorage.getItem('userId') || 'current-user';
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to fetch analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, filters.exerciseType, filters.difficulty]);

  // Get metric data for charts based on selected metric
  const getMetricData = () => {
    if (!analyticsData?.dailyProgress) return [];
    
    return analyticsData.dailyProgress.map(item => ({ 
      date: item.date, 
      value: item[selectedMetric] || 0 
    }));
  };

  // Loading state
  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics data...</p>
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
                <h3 className="text-lg font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchAnalyticsData}
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
  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-yellow-800">No Analytics Data Available</h3>
              <p className="text-yellow-700 mt-1">Start practicing to see your progress analytics.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Speech Analytics</h1>
          <p className="text-gray-600 mt-2">Track your progress and analyze your speech improvement over time</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
              <select 
                value={filters.exerciseType} 
                onChange={(e) => setFilters({...filters, exerciseType: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="phonemes">Phonemes</option>
                <option value="words">Words</option>
                <option value="sentences">Sentences</option>
                <option value="conversations">Conversations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="accuracy">Accuracy</option>
                <option value="fluency">Fluency</option>
                <option value="confidence">Confidence</option>
                <option value="practiceTime">Practice Time</option>
              </select>
            </div>
            <button
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview?.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Practice Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview?.totalPracticeTime || '0h 0m'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview?.averageScore ? `${analyticsData.overview.averageScore.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analyticsData.overview?.improvementRate ? `+${analyticsData.overview.improvementRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Progress - {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</h3>
            {analyticsData.dailyProgress && analyticsData.dailyProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMetricData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No daily progress data available</p>
              </div>
            )}
          </div>

          {/* Exercise Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Type Distribution</h3>
            {analyticsData.exerciseBreakdown && analyticsData.exerciseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.exerciseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.exerciseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No exercise breakdown data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Skills Radar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Assessment</h3>
          {analyticsData.skillRadar && analyticsData.skillRadar.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={analyticsData.skillRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Current Level"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No skills assessment data available</p>
            </div>
          )}
        </div>

        {/* Weekly Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance Trends</h3>
          {analyticsData.weeklyTrends && analyticsData.weeklyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="accuracy" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="fluency" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="confidence" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No weekly trends data available</p>
            </div>
          )}
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Performance Insights</h3>
          {analyticsData.performanceInsights && analyticsData.performanceInsights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyticsData.performanceInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                  insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div>
                      <p className={`text-sm ${
                        insight.type === 'positive' ? 'text-green-800' :
                        insight.type === 'warning' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {insight.insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No performance insights available yet. Keep practicing to get personalized recommendations!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
