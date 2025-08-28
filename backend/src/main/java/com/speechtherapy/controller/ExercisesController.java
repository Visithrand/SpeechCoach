package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.model.Exercise;
import com.speechtherapy.repository.UserRepository;
import com.speechtherapy.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;

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

    @PostMapping("/{exerciseId}/complete")
    public ResponseEntity<Map<String, Object>> completeExercise(
            @PathVariable Long exerciseId,
            @RequestParam Long userId,
            @RequestParam(required = false) Integer score,
            @RequestParam(required = false) String feedback) {
        
        try {
            Optional<Exercise> exerciseOpt = exerciseRepository.findById(exerciseId);
            if (exerciseOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("error", true);
                response.put("message", "Exercise not found");
                return ResponseEntity.notFound().build();
            }
            
            Exercise exercise = exerciseOpt.get();
            exercise.setCompleted(true);
            exercise.setCompletedAt(LocalDateTime.now());
            exercise.setLastAttemptDate(LocalDateTime.now());
            exercise.setAttemptsCount(exercise.getAttemptsCount() + 1);
            
            if (score != null) {
                exercise.setOverallScore(score);
                if (score > exercise.getBestScore()) {
                    exercise.setBestScore(score);
                }
            }
            
            if (feedback != null) {
                exercise.setFeedback(feedback);
            }
            
            // Calculate progress percentage based on category
            List<Exercise> categoryExercises = exerciseRepository.findByUserAndCategoryAndType(
                exercise.getUser(), exercise.getCategory(), exercise.getType());
            
            long completedCount = categoryExercises.stream()
                .filter(Exercise::getCompleted)
                .count();
            
            int progressPercentage = (int) ((completedCount * 100) / categoryExercises.size());
            exercise.setProgressPercentage(progressPercentage);
            
            exerciseRepository.save(exercise);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Well done! You have completed this exercise");
            response.put("exercise", exercise);
            response.put("progressPercentage", progressPercentage);
            response.put("completedCount", completedCount);
            response.put("totalCount", categoryExercises.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", true);
            response.put("message", "Failed to complete exercise: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/{userId}/progress")
    public ResponseEntity<Map<String, Object>> getUserProgress(@PathVariable Long userId) {
        try {
            List<Exercise> userExercises = exerciseRepository.findByUserId(userId);
            
            Map<String, Object> progress = new HashMap<>();
            
            // Overall progress
            long totalExercises = userExercises.size();
            long completedExercises = userExercises.stream().filter(Exercise::getCompleted).count();
            int overallProgress = totalExercises > 0 ? (int) ((completedExercises * 100) / totalExercises) : 0;
            
            progress.put("overallProgress", overallProgress);
            progress.put("totalExercises", totalExercises);
            progress.put("completedExercises", completedExercises);
            
            // Progress by category
            Map<String, Object> categoryProgress = new HashMap<>();
            Arrays.asList("Beginner", "Intermediate", "Advanced").forEach(category -> {
                long categoryTotal = userExercises.stream()
                    .filter(e -> e.getCategory().equals(category))
                    .count();
                long categoryCompleted = userExercises.stream()
                    .filter(e -> e.getCategory().equals(category) && e.getCompleted())
                    .count();
                int categoryPercentage = categoryTotal > 0 ? (int) ((categoryCompleted * 100) / categoryTotal) : 0;
                
                Map<String, Object> catProgress = new HashMap<>();
                catProgress.put("total", categoryTotal);
                catProgress.put("completed", categoryCompleted);
                catProgress.put("percentage", categoryPercentage);
                categoryProgress.put(category, catProgress);
            });
            
            progress.put("categoryProgress", categoryProgress);
            
            // Progress by type
            Map<String, Object> typeProgress = new HashMap<>();
            Arrays.asList("Body", "Speech").forEach(type -> {
                long typeTotal = userExercises.stream()
                    .filter(e -> e.getType().equals(type))
                    .count();
                long typeCompleted = userExercises.stream()
                    .filter(e -> e.getType().equals(type) && e.getCompleted())
                    .count();
                int typePercentage = typeTotal > 0 ? (int) ((typeCompleted * 100) / typeTotal) : 0;
                
                Map<String, Object> typeProg = new HashMap<>();
                typeProg.put("total", typeTotal);
                typeProg.put("completed", typeCompleted);
                typeProg.put("percentage", typePercentage);
                typeProgress.put(type, typeProg);
            });
            
            progress.put("typeProgress", typeProgress);
            
            return ResponseEntity.ok(progress);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", true);
            response.put("message", "Failed to get user progress: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllExercisesFormatted() {
        try {
            List<Exercise> allExercises = exerciseRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalExercises", allExercises.size());
            
            // Group exercises by type
            Map<String, List<Exercise>> exercisesByType = allExercises.stream()
                .collect(Collectors.groupingBy(Exercise::getType));
            
            response.put("bodyExercises", exercisesByType.getOrDefault("Body", new ArrayList<>()));
            response.put("speechExercises", exercisesByType.getOrDefault("Speech", new ArrayList<>()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", true);
            response.put("message", "Failed to fetch exercises: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
