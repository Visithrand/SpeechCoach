package com.speechtherapy.controller;

import com.speechtherapy.model.*;
import com.speechtherapy.service.AIExerciseService;
import com.speechtherapy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class AIExerciseController {

    @Autowired
    private AIExerciseService aiExerciseService;
    
    @Autowired
    private AIExerciseRepository aiExerciseRepository;
    
    @Autowired
    private BodyExerciseRepository bodyExerciseRepository;
    
    @Autowired
    private FluencyScoreRepository fluencyScoreRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Generate a personalized exercise for a user
    @PostMapping("/generate-exercise/{userId}")
    public ResponseEntity<Map<String, Object>> generateExercise(
            @PathVariable Long userId,
            @RequestParam String exerciseType) {
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            AIExercise exercise = aiExerciseService.generatePersonalizedExercise(userOpt.get(), exerciseType);
            Map<String, Object> response = new HashMap<>();
            response.put("exercise", exercise);
            response.put("message", "Exercise generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to generate exercise: " + e.getMessage());
            error.put("message", "Failed to generate exercise. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Generate a weekly exercise plan
    @PostMapping("/generate-weekly-plan/{userId}")
    public ResponseEntity<Map<String, Object>> generateWeeklyPlan(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            List<AIExercise> weeklyPlan = aiExerciseService.generateWeeklyExercisePlan(userOpt.get());
            Map<String, Object> response = new HashMap<>();
            response.put("weeklyPlan", weeklyPlan);
            response.put("message", "Weekly plan generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to generate weekly plan: " + e.getMessage());
            error.put("message", "Failed to generate weekly plan. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get AI-generated exercises for a user
    @GetMapping("/exercises/{userId}")
    public ResponseEntity<Map<String, Object>> getUserExercises(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            List<AIExercise> exercises = aiExerciseRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
            Map<String, Object> response = new HashMap<>();
            response.put("exercises", exercises);
            response.put("count", exercises.size());
            response.put("message", "AI exercises retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch AI exercises: " + e.getMessage());
            error.put("message", "Failed to fetch AI exercises. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get active (unexpired) AI exercises
    @GetMapping("/exercises/{userId}/active")
    public ResponseEntity<Map<String, Object>> getActiveExercises(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            List<AIExercise> activeExercises = aiExerciseRepository.findActiveExercisesByUser(userOpt.get(), LocalDateTime.now());
            Map<String, Object> response = new HashMap<>();
            response.put("activeExercises", activeExercises);
            response.put("count", activeExercises.size());
            response.put("message", "Active exercises retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch active exercises: " + e.getMessage());
            error.put("message", "Failed to fetch active exercises. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Mark an AI exercise as completed
    @PostMapping("/exercises/{exerciseId}/complete")
    public ResponseEntity<Map<String, Object>> completeExercise(
            @PathVariable Long exerciseId,
            @RequestParam(required = false) Integer performanceScore) {
        
        Optional<AIExercise> exerciseOpt = aiExerciseRepository.findById(exerciseId);
        if (exerciseOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Exercise not found");
            error.put("message", "Exercise not found with ID: " + exerciseId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            AIExercise exercise = exerciseOpt.get();
            exercise.setIsCompleted(true);
            exercise.setCompletedAt(LocalDateTime.now());
            if (performanceScore != null) {
                exercise.setPerformanceScore(performanceScore);
            }
            
            aiExerciseRepository.save(exercise);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Exercise marked as completed");
            response.put("exercise", exercise);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to complete exercise: " + e.getMessage());
            error.put("message", "Failed to complete exercise. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get body exercise suggestions
    @GetMapping("/body-exercises/{userId}")
    public ResponseEntity<Map<String, Object>> getBodyExerciseSuggestions(
            @PathVariable Long userId,
            @RequestParam(required = false) String targetArea) {
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            List<BodyExercise> suggestions = aiExerciseService.suggestBodyExercises(userOpt.get(), targetArea);
            Map<String, Object> response = new HashMap<>();
            response.put("suggestions", suggestions);
            response.put("count", suggestions.size());
            response.put("message", "Body exercises retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch body exercises: " + e.getMessage());
            error.put("message", "Failed to fetch body exercises. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get all body exercises by type
    @GetMapping("/body-exercises/type/{exerciseType}")
    public ResponseEntity<Map<String, Object>> getBodyExercisesByType(@PathVariable String exerciseType) {
        try {
            List<BodyExercise> exercises = bodyExerciseRepository.findByExerciseType(exerciseType);
            Map<String, Object> response = new HashMap<>();
            response.put("exercises", exercises);
            response.put("count", exercises.size());
            response.put("message", "Body exercises by type retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch body exercises by type: " + e.getMessage());
            error.put("message", "Failed to fetch body exercises. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get body exercises by difficulty level
    @GetMapping("/body-exercises/difficulty/{difficultyLevel}")
    public ResponseEntity<Map<String, Object>> getBodyExercisesByDifficulty(@PathVariable String difficultyLevel) {
        try {
            List<BodyExercise> exercises = bodyExerciseRepository.findByDifficultyLevel(difficultyLevel);
            Map<String, Object> response = new HashMap<>();
            response.put("exercises", exercises);
            response.put("count", exercises.size());
            response.put("message", "Body exercises by difficulty retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch body exercises by difficulty: " + e.getMessage());
            error.put("message", "Failed to fetch body exercises. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get fluency analysis for a user
    @GetMapping("/fluency-analysis/{userId}")
    public ResponseEntity<Map<String, Object>> getFluencyAnalysis(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            List<FluencyScore> recentScores = fluencyScoreRepository.findByUserOrderBySessionDateDesc(userOpt.get());
            
            if (recentScores.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "No fluency data available yet");
                response.put("scores", recentScores);
                response.put("count", 0);
                return ResponseEntity.ok(response);
            }
            
            // Calculate trends and insights
            Map<String, Object> analysis = analyzeFluencyTrends(recentScores);
            analysis.put("recentScores", recentScores);
            analysis.put("totalSessions", recentScores.size());
            analysis.put("message", "Fluency analysis retrieved successfully");
            
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch fluency analysis: " + e.getMessage());
            error.put("message", "Failed to fetch fluency analysis. Please try again.");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get fluency scores for a specific date range
    @GetMapping("/fluency-analysis/{userId}/range")
    public ResponseEntity<Map<String, Object>> getFluencyAnalysisRange(
            @PathVariable Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            error.put("message", "User not found with ID: " + userId);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            
            List<FluencyScore> scores = fluencyScoreRepository.findByUserAndSessionDateBetweenOrderBySessionDateDesc(
                userOpt.get(), start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("scores", scores);
            response.put("count", scores.size());
            response.put("dateRange", Map.of("start", startDate, "end", endDate));
            response.put("message", "Fluency analysis range retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid date format. Use ISO format (yyyy-MM-ddTHH:mm:ss)");
            error.put("message", "Invalid date format. Please use ISO format (yyyy-MM-ddTHH:mm:ss)");
            return ResponseEntity.status(400).body(error);
        }
    }

    private Map<String, Object> analyzeFluencyTrends(List<FluencyScore> scores) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (scores.isEmpty()) {
            return analysis;
        }
        
        // Calculate averages
        double avgPronunciation = scores.stream()
            .mapToInt(fs -> fs.getPronunciationScore() != null ? fs.getPronunciationScore() : 0)
            .average().orElse(0.0);
        
        double avgRhythm = scores.stream()
            .mapToInt(fs -> fs.getRhythmScore() != null ? fs.getRhythmScore() : 0)
            .average().orElse(0.0);
        
        double avgPace = scores.stream()
            .mapToInt(fs -> fs.getPaceScore() != null ? fs.getPaceScore() : 0)
            .average().orElse(0.0);
        
        double avgExpression = scores.stream()
            .mapToInt(fs -> fs.getExpressionScore() != null ? fs.getExpressionScore() : 0)
            .average().orElse(0.0);
        
        double avgOverall = scores.stream()
            .mapToInt(fs -> fs.getOverallFluencyScore() != null ? fs.getOverallFluencyScore() : 0)
            .average().orElse(0.0);
        
        // Identify trends
        String pronunciationTrend = avgPronunciation > 85 ? "excellent" : avgPronunciation > 75 ? "good" : "needs improvement";
        String rhythmTrend = avgRhythm > 85 ? "excellent" : avgRhythm > 75 ? "good" : "needs improvement";
        String paceTrend = avgPace > 85 ? "excellent" : avgPace > 75 ? "good" : "needs improvement";
        String expressionTrend = avgExpression > 85 ? "excellent" : avgExpression > 75 ? "good" : "needs improvement";
        
        // Check for specific issues
        long stutterCount = scores.stream().filter(fs -> Boolean.TRUE.equals(fs.getStutterDetected())).count();
        long nervousCount = scores.stream().filter(fs -> "nervous".equals(fs.getEmotionDetected())).count();
        
        analysis.put("averages", Map.of(
            "pronunciation", Math.round(avgPronunciation * 100.0) / 100.0,
            "rhythm", Math.round(avgRhythm * 100.0) / 100.0,
            "pace", Math.round(avgPace * 100.0) / 100.0,
            "expression", Math.round(avgExpression * 100.0) / 100.0,
            "overall", Math.round(avgOverall * 100.0) / 100.0
        ));
        
        analysis.put("trends", Map.of(
            "pronunciation", pronunciationTrend,
            "rhythm", rhythmTrend,
            "pace", paceTrend,
            "expression", expressionTrend
        ));
        
        analysis.put("issues", Map.of(
            "stutterDetected", stutterCount,
            "nervousSessions", nervousCount
        ));
        
        // Recommendations
        List<String> recommendations = new ArrayList<>();
        if (avgPronunciation < 75) recommendations.add("Focus on pronunciation exercises");
        if (avgRhythm < 75) recommendations.add("Practice rhythm and intonation");
        if (avgPace < 75) recommendations.add("Work on speaking pace and flow");
        if (avgExpression < 75) recommendations.add("Improve emotional expression in speech");
        if (stutterCount > 0) recommendations.add("Consider stuttering-specific exercises");
        if (nervousCount > 2) recommendations.add("Practice confidence-building exercises");
        
        analysis.put("recommendations", recommendations);
        
        return analysis;
    }
}
