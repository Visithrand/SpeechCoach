package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.model.Exercise;
import com.speechtherapy.repository.UserRepository;
import com.speechtherapy.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class ExercisesController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    // Get all exercises for a user
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getAllExercises(@PathVariable Long userId) {
        try {
            // Verify user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // Get all exercises for the user
            List<Exercise> exercises = exerciseRepository.findByUserOrderByCompletedAtDesc(user);

            Map<String, Object> response = new HashMap<>();
            response.put("exercises", exercises);
            response.put("count", exercises.size());
            response.put("message", "Exercises retrieved successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("error", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch exercises: " + e.getMessage());
            error.put("error", "INTERNAL_ERROR");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{category}/{level}/{userId}")
    public ResponseEntity<Map<String, Object>> getExercisesByCategoryAndLevel(
            @PathVariable String category,
            @PathVariable String level,
            @PathVariable Long userId) {
        try {
            // Verify user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // Get exercises by category and level
            List<Exercise> exercises = exerciseRepository.findByUserOrderByCompletedAtDesc(user);

            // Filter by category and level
            List<Exercise> filteredExercises = exercises.stream()
                .filter(ex -> matchesCategory(ex, category))
                .filter(ex -> matchesLevel(ex, level))
                .collect(java.util.stream.Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("exercises", filteredExercises);
            response.put("category", category);
            response.put("level", level);
            response.put("count", filteredExercises.size());
            response.put("message", "Exercises retrieved successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("error", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch exercises: " + e.getMessage());
            error.put("error", "INTERNAL_ERROR");
            return ResponseEntity.status(500).body(error);
        }
    }

    // Get exercise recommendations for a user
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<Map<String, Object>> getExerciseRecommendations(@PathVariable Long userId) {
        try {
            // Verify user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // Get exercises for the user, prioritizing by difficulty and completion status
            List<Exercise> allExercises = exerciseRepository.findByUserOrderByCompletedAtDesc(user);
            
            // Filter for incomplete exercises and sort by difficulty
            List<Exercise> recommendations = allExercises.stream()
                .filter(ex -> ex.getCompletedAt() == null)
                .sorted((e1, e2) -> {
                    // Sort by difficulty level (beginner first)
                    String level1 = e1.getDifficultyLevel() != null ? e1.getDifficultyLevel().toLowerCase() : "beginner";
                    String level2 = e2.getDifficultyLevel() != null ? e2.getDifficultyLevel().toLowerCase() : "beginner";
                    
                    if (level1.equals("beginner") && !level2.equals("beginner")) return -1;
                    if (level2.equals("beginner") && !level1.equals("beginner")) return 1;
                    if (level1.equals("intermediate") && level2.equals("advanced")) return -1;
                    if (level2.equals("intermediate") && level1.equals("advanced")) return 1;
                    
                    return 0;
                })
                .limit(5) // Limit to 5 recommendations
                .collect(Collectors.toList());
            
            // If no incomplete exercises, return some completed ones as examples
            if (recommendations.isEmpty()) {
                recommendations = allExercises.stream()
                    .limit(3)
                    .collect(Collectors.toList());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            response.put("message", "Exercise recommendations retrieved successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("error", "USER_NOT_FOUND");
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch exercise recommendations: " + e.getMessage());
            error.put("error", "INTERNAL_ERROR");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitExercise(@RequestBody Map<String, Object> request) {
        try {
            // This would typically save exercise completion data
            // For now, return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Exercise submitted successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to submit exercise: " + e.getMessage());
            error.put("error", "SUBMISSION_ERROR");
            return ResponseEntity.status(500).body(error);
        }
    }

    private boolean matchesCategory(Exercise exercise, String category) {
        if (category == null || category.isEmpty() || "all".equalsIgnoreCase(category)) return true;
        
        String exerciseType = exercise.getExerciseType();
        if (exerciseType == null) return false;
        
        return exerciseType.equalsIgnoreCase(category) || 
               exerciseType.toLowerCase().contains(category.toLowerCase());
    }

    private boolean matchesLevel(Exercise exercise, String level) {
        if (level == null || level.isEmpty() || "all".equalsIgnoreCase(level)) return true;
        
        String exerciseLevel = exercise.getDifficultyLevel();
        if (exerciseLevel == null) return false;
        
        return exerciseLevel.equalsIgnoreCase(level) || 
               exerciseLevel.toLowerCase().contains(level.toLowerCase());
    }

    private List<Exercise> getRecommendedExercises(User user) {
        // Get user's current level and recommend appropriate exercises
        String userLevel = determineUserLevel(user);
        
        // Get exercises suitable for user's level
        List<Exercise> allExercises = exerciseRepository.findByUserOrderByCompletedAtDesc(user);
        
        return allExercises.stream()
            .filter(ex -> isAppropriateForLevel(ex, userLevel))
            .limit(5) // Limit to 5 recommendations
            .collect(java.util.stream.Collectors.toList());
    }

    private String determineUserLevel(User user) {
        // Simple level determination based on streak and goals
        Integer streak = user.getStreakDays();
        if (streak == null) streak = 0;
        
        if (streak < 7) return "Beginner";
        else if (streak < 21) return "Intermediate";
        else return "Advanced";
    }

    private boolean isAppropriateForLevel(Exercise exercise, String userLevel) {
        String exerciseLevel = exercise.getDifficultyLevel();
        if (exerciseLevel == null) return false;
        
        switch (userLevel.toLowerCase()) {
            case "beginner":
                return exerciseLevel.equalsIgnoreCase("Beginner");
            case "intermediate":
                return exerciseLevel.equalsIgnoreCase("Beginner") || 
                       exerciseLevel.equalsIgnoreCase("Intermediate");
            case "advanced":
                return true; // Advanced users can do all levels
            default:
                return exerciseLevel.equalsIgnoreCase("Beginner");
        }
    }
}
