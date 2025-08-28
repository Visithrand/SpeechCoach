import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Volume2, Palette, Shield, Save, Loader, AlertCircle } from 'lucide-react';

const Settings = ({ userId }) => {
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      language: 'en',
      timezone: 'UTC'
    },
    preferences: {
      aiVoice: 'female',
      speechSpeed: 'normal',
      notifications: true,
      emailUpdates: true,
      practiceReminders: true
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      thirdParty: false,
      dataExport: true
    }
  });

  // Get user data from localStorage for profile fields
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchSettings();
    
    // Populate profile fields with user data from localStorage
    if (user.name || user.email) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.name || prev.profile.name,
          email: user.email || prev.profile.email,
        }
      }));
    }
  }, [userId, user.name, user.email]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      // Fetch user settings from backend
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userSettings = await response.json();
        setSettings(userSettings);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load user settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to fetch settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      
      // Update user settings via backend
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'accessibility', label: 'Accessibility', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your speech therapy experience</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-800 font-medium">Settings saved successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Full Name
                     </label>
                     <input
                       type="text"
                       value={user.name || settings.profile.name}
                       onChange={(e) => handleChange('profile', 'name', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Email
                     </label>
                     <input
                       type="email"
                       value={user.email || settings.profile.email}
                       onChange={(e) => handleChange('profile', 'email', e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       disabled
                     />
                     <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.profile.language}
                      onChange={(e) => handleChange('profile', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.profile.timezone}
                      onChange={(e) => handleChange('profile', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">AI & Speech Preferences</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Voice Gender
                    </label>
                    <div className="flex space-x-4">
                      {['female', 'male', 'neutral'].map((voice) => (
                        <label key={voice} className="flex items-center">
                          <input
                            type="radio"
                            name="aiVoice"
                            value={voice}
                            checked={settings.preferences.aiVoice === voice}
                            onChange={(e) => handleChange('preferences', 'aiVoice', e.target.value)}
                            className="mr-2"
                          />
                          <span className="capitalize">{voice}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speech Speed
                    </label>
                    <select
                      value={settings.preferences.speechSpeed}
                      onChange={(e) => handleChange('preferences', 'speechSpeed', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Notifications</h4>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences.notifications}
                        onChange={(e) => handleChange('preferences', 'notifications', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <span>Push notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences.emailUpdates}
                        onChange={(e) => handleChange('preferences', 'emailUpdates', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <span>Email updates</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.preferences.practiceReminders}
                        onChange={(e) => handleChange('preferences', 'practiceReminders', e.target.checked)}
                        className="mr-3 rounded"
                      />
                      <span>Practice reminders</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Accessibility Options</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.highContrast}
                      onChange={(e) => handleChange('accessibility', 'highContrast', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>High contrast mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.largeText}
                      onChange={(e) => handleChange('accessibility', 'largeText', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Large text</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.screenReader}
                      onChange={(e) => handleChange('accessibility', 'screenReader', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Screen reader support</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.accessibility.keyboardNavigation}
                      onChange={(e) => handleChange('accessibility', 'keyboardNavigation', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Keyboard navigation</span>
                  </label>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Privacy & Data</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.privacy.dataCollection}
                      onChange={(e) => handleChange('privacy', 'dataCollection', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Allow data collection for improvement</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.privacy.analytics}
                      onChange={(e) => handleChange('privacy', 'analytics', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Analytics and usage data</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.privacy.thirdParty}
                      onChange={(e) => handleChange('privacy', 'thirdParty', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Third-party integrations</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.privacy.dataExport}
                      onChange={(e) => handleChange('privacy', 'dataExport', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span>Allow data export</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Download my data
                  </button>
                  <span className="mx-2 text-gray-400">•</span>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete my account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
