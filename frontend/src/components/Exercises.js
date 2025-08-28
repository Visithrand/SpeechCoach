import React, { useState } from 'react';
import { exerciseData } from '../data/exercises';
import AudioRecorder from './AudioRecorder';
import AnalysisResults from './AnalysisResults';

function Exercises({ isRecording, audioUrl, startRecording, stopRecording, submitAudio, setAudioUrl }) {
  const [currentExerciseType, setCurrentExerciseType] = useState('words');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);

  const exerciseTypes = [
    { id: 'words', name: 'Word Exercises', icon: '📝', description: 'Improve word pronunciation' },
    { id: 'sentences', name: 'Sentence Repetition', icon: '📖', description: 'Work on fluency' },
    { id: 'conversations', name: 'Conversation Practice', icon: '💬', description: 'Real-world scenarios' },
    { id: 'tongueTwisters', name: 'Tongue Twisters', icon: '🌪️', description: 'Challenge your articulation' }
  ];

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setAnalysisResult(null);
    setAudioUrl(null);
  };

  const handleAnalyzeAudio = async () => {
    if (!audioUrl || !selectedExercise) return;
    
    setIsAnalyzing(true);
    try {
      const result = await submitAudio(currentExerciseType, selectedExercise.title);
      setAnalysisResult(result);
      
      // Mark exercise as completed
      const exerciseKey = `${currentExerciseType}-${selectedExercise.id}`;
      if (!completedExercises.includes(exerciseKey)) {
        setCompletedExercises(prev => [...prev, exerciseKey]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAnalysisResult(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExerciseCompleted = (exerciseId) => {
    return completedExercises.includes(`${currentExerciseType}-${exerciseId}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Speech Exercises</h2>
        <p className="text-gray-600">Choose an exercise type and start practicing!</p>
      </div>

      {/* Exercise Type Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {exerciseTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setCurrentExerciseType(type.id);
                setSelectedExercise(null);
                setAnalysisResult(null);
                setAudioUrl(null);
              }}
              className={`p-4 rounded-lg text-center transition-all ${
                currentExerciseType === type.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {exerciseTypes.find(t => t.id === currentExerciseType)?.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exerciseData[currentExerciseType]?.map(exercise => (
            <div
              key={exercise.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedExercise?.id === exercise.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isExerciseCompleted(exercise.id) ? 'bg-green-50 border-green-300' : ''}`}
              onClick={() => handleExerciseSelect(exercise)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{exercise.title}</h4>
                {isExerciseCompleted(exercise.id) && (
                  <span className="text-green-600 text-sm">✅</span>
                )}
              </div>
              
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
              
              <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
              
              {currentExerciseType === 'words' && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Target sounds:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.targetSounds.map((sound, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {sound}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Exercise Content */}
      {selectedExercise && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedExercise.title}
          </h3>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              {selectedExercise.description}
            </h4>
            
            {currentExerciseType === 'words' && (
              <div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Practice these words:</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.words.map((word, index) => (
                    <span key={index} className="bg-white px-3 py-1 rounded border text-blue-900 font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {currentExerciseType === 'sentences' && (
              <div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Practice these sentences:</strong>
                </p>
                <div className="space-y-2">
                  {selectedExercise.sentences.map((sentence, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border text-blue-900">
                      {sentence}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentExerciseType === 'conversations' && (
              <div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Scenario:</strong> {selectedExercise.scenario}
                </p>
                <div className="space-y-2">
                  {selectedExercise.dialogue.map((line, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border text-blue-900">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentExerciseType === 'tongueTwisters' && (
              <div>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Practice this tongue twister:</strong>
                </p>
                <div className="bg-white px-3 py-2 rounded border text-blue-900 font-medium">
                  {selectedExercise.text}
                </div>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <AudioRecorder
            isRecording={isRecording}
            audioUrl={audioUrl}
            startRecording={startRecording}
            stopRecording={stopRecording}
            resetRecording={resetRecording}
            handleAnalyzeAudio={handleAnalyzeAudio}
            isAnalyzing={isAnalyzing}
          />

          {/* Analysis Results */}
          {analysisResult && (
            <AnalysisResults result={analysisResult} />
          )}
        </div>
      )}
    </div>
  );
}

export default Exercises;
