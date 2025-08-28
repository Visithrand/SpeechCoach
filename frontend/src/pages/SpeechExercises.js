import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, RotateCcw, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SpeechExercises = ({ userId }) => {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    fetchNextExercise();
  }, [userId]);

  const fetchNextExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/exercises/recommendations/${userId}`);
      if (response.data && response.data.length > 0) {
        setCurrentExercise(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching exercise:', err);
      setError(err.response?.data?.message || 'Failed to fetch exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const analyzeSpeech = async () => {
    if (!audioBlob || !currentExercise) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'speech.wav');
      formData.append('exerciseId', currentExercise.id);
      formData.append('userId', userId);

      const response = await axios.post('/api/speech/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(response.data);
    } catch (err) {
      console.error('Error analyzing speech:', err);
      setError(err.response?.data?.message || 'Failed to analyze speech. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const resetExercise = () => {
    setAudioBlob(null);
    setAnalysisResult(null);
    setError(null);
    setAudioChunks([]);
  };

  const nextExercise = () => {
    resetExercise();
    fetchNextExercise();
  };

  // Loading state
  if (loading && !currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading exercise...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentExercise) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Exercise</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchNextExercise}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Speech Practice</h1>
          <p className="text-gray-600 mt-2">Practice your speech with real-time AI feedback</p>
        </div>

        {currentExercise && (
          <>
            {/* Exercise Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentExercise.title}</h2>
                <p className="text-gray-600">{currentExercise.description}</p>
                
                {currentExercise.targetPhrase && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg font-medium text-blue-900">
                      "{currentExercise.targetPhrase}"
                    </p>
                    <p className="text-sm text-blue-700 mt-1">Practice saying this phrase clearly</p>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-600 text-white p-4 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
                  >
                    <MicOff className="w-8 h-8" />
                  </button>
                )}

                {audioBlob && (
                  <>
                    <button
                      onClick={playAudio}
                      disabled={isPlaying}
                      className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>

                    <button
                      onClick={analyzeSpeech}
                      disabled={loading}
                      className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
                    >
                      {loading ? <Loader className="w-8 h-8 animate-spin" /> : <CheckCircle className="w-8 h-8" />}
                    </button>
                  </>
                )}
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Recording...</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Analysis Results</h3>
                
                {/* Overall Score */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analysisResult.overallScore}%
                  </div>
                  <p className="text-gray-600">Overall Performance</p>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(analysisResult.detailedScores).map(([skill, score]) => (
                    <div key={skill} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{score}%</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {skill.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                {analysisResult.feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">AI Feedback</h4>
                    <p className="text-blue-800">{analysisResult.feedback}</p>
                  </div>
                )}

                {/* Improvements */}
                {analysisResult.improvements && analysisResult.improvements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">What you did well:</h4>
                    <ul className="space-y-1">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions for improvement:</h4>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-blue-700">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetExercise}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={nextExercise}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Next Exercise
              </button>
            </div>
          </>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Practice Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>• Speak clearly:</strong> Enunciate each word properly
            </div>
            <div>
              <strong>• Take your time:</strong> Don't rush through the phrases
            </div>
            <div>
              <strong>• Listen carefully:</strong> Pay attention to the target pronunciation
            </div>
            <div>
              <strong>• Practice regularly:</strong> Consistency improves results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechExercises;
