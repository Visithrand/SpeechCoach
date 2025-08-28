package com.speechtherapy.service;

import com.speechtherapy.model.User;
import com.speechtherapy.model.Exercise;
import com.speechtherapy.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SpeechAnalysisService {
    
    private final ExerciseRepository exerciseRepository;
    private final UserService userService;
    private final WebClient webClient;
    
    @Autowired
    public SpeechAnalysisService(ExerciseRepository exerciseRepository, UserService userService) {
        this.exerciseRepository = exerciseRepository;
        this.userService = userService;
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:8080") // Python NLP service URL
            .build();
    }
    
    public Map<String, Object> analyzeAudio(MultipartFile audioFile, String exerciseType, 
                                           String targetText, User user) throws IOException {
        
        // Save audio file temporarily
        String fileName = "audio_" + System.currentTimeMillis() + ".wav";
        Path tempFile = Paths.get(System.getProperty("java.io.tmpdir"), fileName);
        Files.write(tempFile, audioFile.getBytes());
        
        try {
            // Call Python NLP service for analysis
            Map<String, Object> analysisResult = callPythonAnalysisService(tempFile.toString(), exerciseType, targetText);
            
            // Save exercise record to database
            Exercise exercise = saveExerciseRecord(user, exerciseType, targetText, analysisResult);
            
            // Update user progress
            userService.updateUserProgress(user, exercise);
            
            return analysisResult;
            
        } catch (Exception e) {
            // Fallback to mock analysis if Python service is unavailable
            return generateMockAnalysis(exerciseType, targetText);
        } finally {
            // Clean up temporary file
            Files.deleteIfExists(tempFile);
        }
    }
    
    private Map<String, Object> callPythonAnalysisService(String audioFilePath, String exerciseType, String targetText) {
        try {
            // This would call the Python NLP service
            // For now, return mock data since Python service isn't implemented yet
            return generateMockAnalysis(exerciseType, targetText);
        } catch (Exception e) {
            return generateMockAnalysis(exerciseType, targetText);
        }
    }
    
    public Map<String, Object> generateMockAnalysis(String exerciseType, String targetText) {
        Random random = new Random();
        
        // Generate realistic scores based on exercise difficulty
        int baseScore = 70 + random.nextInt(25); // 70-95 range
        
        // Adjust scores based on exercise type difficulty
        switch (exerciseType.toLowerCase()) {
            case "phoneme":
                baseScore = adjustScoreForDifficulty(baseScore, targetText, getPhonemedifficulty(targetText));
                break;
            case "conversation":
                baseScore -= 5; // Conversations are typically harder
                break;
            case "tongue_twister":
                baseScore -= 10; // Tongue twisters are challenging
                break;
        }
        
        int overallScore = Math.max(50, Math.min(100, baseScore));
        int accuracyScore = Math.max(45, Math.min(100, overallScore + random.nextInt(10) - 5));
        int clarityScore = Math.max(50, Math.min(100, overallScore + random.nextInt(10) - 5));
        int fluencyScore = Math.max(45, Math.min(100, overallScore + random.nextInt(15) - 7));
        
        List<String> feedback = generateFeedback(overallScore, exerciseType, targetText);
        
        Map<String, Object> result = new HashMap<>();
        result.put("overallScore", overallScore);
        result.put("accuracyScore", accuracyScore);
        result.put("clarityScore", clarityScore);
        result.put("fluencyScore", fluencyScore);
        result.put("feedback", feedback);
        result.put("improvement", random.nextInt(6) - 2); // -2 to +4 improvement
        result.put("exerciseType", exerciseType);
        result.put("targetText", targetText);
        result.put("timestamp", LocalDateTime.now().toString());
        
        return result;
    }
    
    private int adjustScoreForDifficulty(int baseScore, String targetText, String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "advanced":
                return baseScore - 8;
            case "intermediate":
                return baseScore - 3;
            case "beginner":
            default:
                return baseScore + 2;
        }
    }
    
    private String getPhonemedifficulty(String phoneme) {
        Map<String, String> difficulties = Map.of(
            "th", "advanced",
            "r", "advanced", 
            "l", "advanced",
            "s", "intermediate",
            "z", "intermediate",
            "p", "beginner",
            "b", "beginner",
            "m", "beginner"
        );
        return difficulties.getOrDefault(phoneme.toLowerCase(), "intermediate");
    }
    
    private List<String> generateFeedback(int score, String exerciseType, String targetText) {
        List<String> feedback = new ArrayList<>();
        
        if (score >= 85) {
            feedback.add("Excellent pronunciation! You've mastered this " + exerciseType + ".");
            feedback.add("Your articulation is very clear and accurate.");
            if (exerciseType.equals("phoneme")) {
                feedback.add("Try using this sound in more complex words.");
            }
        } else if (score >= 70) {
            feedback.add("Good progress! Your " + exerciseType + " pronunciation is improving.");
            feedback.add("Focus on maintaining consistency in your articulation.");
            if (targetText.contains("th")) {
                feedback.add("Remember to place your tongue between your teeth for the 'th' sound.");
            }
        } else {
            feedback.add("Keep practicing! " + exerciseType + " exercises require regular practice.");
            feedback.add("Try speaking more slowly and focus on mouth positioning.");
            feedback.add("Practice this " + exerciseType + " daily for better results.");
        }
        
        // Add exercise-specific feedback
        switch (exerciseType.toLowerCase()) {
            case "phoneme":
                if (score < 80) {
                    feedback.add("Use a mirror to check your mouth position while practicing.");
                }
                break;
            case "conversation":
                feedback.add("Pay attention to natural rhythm and intonation.");
                break;
            case "tongue_twister":
                feedback.add("Start slowly and gradually increase speed.");
                break;
        }
        
        return feedback;
    }
    
    private Exercise saveExerciseRecord(User user, String exerciseType, String targetText, Map<String, Object> analysisResult) {
        Exercise exercise = new Exercise(user, "Speech Practice", "Intermediate", "Speech", 5, 
            "Practice " + exerciseType + " with target text: " + targetText);
        
        exercise.setOverallScore((Integer) analysisResult.get("overallScore"));
        exercise.setAccuracyScore((Integer) analysisResult.get("accuracyScore"));
        exercise.setClarityScore((Integer) analysisResult.get("clarityScore"));
        exercise.setFluencyScore((Integer) analysisResult.get("fluencyScore"));
        
        List<String> feedbackList = (List<String>) analysisResult.get("feedback");
        exercise.setFeedback(String.join("; ", feedbackList));
        
        // Calculate points earned
        int pointsEarned = Math.max(5, (Integer) analysisResult.get("overallScore") / 10);
        exercise.setPointsEarned(pointsEarned);
        
        return exerciseRepository.save(exercise);
    }
    
    public Map<String, Object> getExerciseContentByType(String exerciseType) {
        Map<String, Object> content = new HashMap<>();
        
        switch (exerciseType.toLowerCase()) {
            case "phoneme":
                content.put("phonemes", getPhonemeData());
                break;
            case "word":
                content.put("words", getWordExercises());
                break;
            case "sentence":
                content.put("sentences", getSentenceExercises());
                break;
            case "conversation":
                content.put("scenarios", getConversationScenarios());
                break;
            case "tongue_twister":
                content.put("twisters", getTongueTwisters());
                break;
            default:
                content.put("error", "Unknown exercise type");
        }
        
        return content;
    }
    
    public Map<String, Object> getPhonemeData() {
        Map<String, Object> phonemes = new HashMap<>();
        
        List<Map<String, Object>> vowels = Arrays.asList(
            Map.of("symbol", "iː", "description", "Long EE sound as in 'see'", 
                   "examples", Arrays.asList("see", "bee", "tree"), "difficulty", "beginner"),
            Map.of("symbol", "ɪ", "description", "Short I sound as in 'bit'", 
                   "examples", Arrays.asList("bit", "sit", "win"), "difficulty", "beginner"),
            Map.of("symbol", "æ", "description", "Short A sound as in 'cat'", 
                   "examples", Arrays.asList("cat", "bat", "hand"), "difficulty", "intermediate")
        );
        
        List<Map<String, Object>> consonants = Arrays.asList(
            Map.of("symbol", "th", "description", "TH sound as in 'think'", 
                   "examples", Arrays.asList("think", "both", "three"), "difficulty", "advanced"),
            Map.of("symbol", "s", "description", "S sound as in 'sun'", 
                   "examples", Arrays.asList("sun", "house", "lesson"), "difficulty", "intermediate"),
            Map.of("symbol", "r", "description", "R sound as in 'red'", 
                   "examples", Arrays.asList("red", "car", "sorry"), "difficulty", "advanced")
        );
        
        phonemes.put("vowels", vowels);
        phonemes.put("consonants", consonants);
        
        return phonemes;
    }
    
    private Map<String, Object> getWordExercises() {
        return Map.of(
            "basic", Arrays.asList("hello", "thank", "water", "please"),
            "intermediate", Arrays.asList("communication", "pronunciation", "vocabulary"),
            "advanced", Arrays.asList("throughout", "strength", "breathe")
        );
    }
    
    private Map<String, Object> getSentenceExercises() {
        return Map.of(
            "easy", Arrays.asList("How are you today?", "What time is it?"),
            "medium", Arrays.asList("I would like to make a reservation.", "Could you please speak more slowly?"),
            "hard", Arrays.asList("The project deadline has been extended until Friday.")
        );
    }
    
    private Map<String, Object> getConversationScenarios() {
        return Map.of(
            "restaurant", Map.of("title", "Ordering at a Restaurant", "difficulty", "easy"),
            "doctor", Map.of("title", "At the Doctor's Office", "difficulty", "medium"),
            "interview", Map.of("title", "Job Interview", "difficulty", "hard")
        );
    }
    
    private Map<String, Object> getTongueTwisters() {
        return Map.of(
            "easy", Arrays.asList("She sells seashells by the seashore"),
            "medium", Arrays.asList("Peter Piper picked a peck of pickled peppers"),
            "hard", Arrays.asList("The sixth sick sheik's sixth sheep's sick")
        );
    }
}