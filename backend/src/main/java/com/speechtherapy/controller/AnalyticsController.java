package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.model.CompletedExercise;
import com.speechtherapy.model.UserProgress;
import com.speechtherapy.repository.UserRepository;
import com.speechtherapy.repository.CompletedExerciseRepository;
import com.speechtherapy.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class AnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompletedExerciseRepository completedExerciseRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getAnalyticsData(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Map<String, Object> analyticsData = new HashMap<>();

            // Get date ranges
            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.minusDays(6);
            LocalDate monthStart = today.minusDays(29);

            // Weekly progress data
            Map<String, Object> weeklyData = getWeeklyAnalytics(user, weekStart, today);
            analyticsData.put("weeklyData", weeklyData);

            // Monthly progress data
            Map<String, Object> monthlyData = getMonthlyAnalytics(user, monthStart, today);
            analyticsData.put("monthlyData", monthlyData);

            // Exercise type distribution
            Map<String, Object> exerciseTypes = getExerciseTypeDistribution(user);
            analyticsData.put("exerciseTypes", exerciseTypes);

            // Difficulty level progress
            Map<String, Object> difficultyProgress = getDifficultyProgress(user);
            analyticsData.put("difficultyProgress", difficultyProgress);

            // Performance trends
            Map<String, Object> performanceTrends = getPerformanceTrends(user);
            analyticsData.put("performanceTrends", performanceTrends);

            return ResponseEntity.ok(analyticsData);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch analytics data: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    private Map<String, Object> getWeeklyAnalytics(User user, LocalDate weekStart, LocalDate weekEnd) {
        Map<String, Object> weeklyData = new HashMap<>();

        // Get completed exercises for the week
        List<CompletedExercise> weeklyExercises = completedExerciseRepository
            .findByUserAndPracticeDateBetweenOrderByCompletedAtDesc(user, weekStart, weekEnd);

        // Total exercises completed
        weeklyData.put("totalExercises", weeklyExercises.size());

        // Total practice time in minutes
        Long totalSeconds = weeklyExercises.stream()
            .mapToLong(ex -> ex.getDurationSeconds() != null ? ex.getDurationSeconds() : 0)
            .sum();
        weeklyData.put("totalMinutes", (int) (totalSeconds / 60));

        // Average exercises per day
        long days = weekStart.until(weekEnd).getDays() + 1;
        weeklyData.put("averagePerDay", Math.round((double) weeklyExercises.size() / days * 100.0) / 100.0);

        // Exercise type breakdown
        Map<String, Long> typeCounts = weeklyExercises.stream()
            .collect(Collectors.groupingBy(CompletedExercise::getExerciseType, Collectors.counting()));
        weeklyData.put("typeBreakdown", typeCounts);

        return weeklyData;
    }

    private Map<String, Object> getMonthlyAnalytics(User user, LocalDate monthStart, LocalDate monthEnd) {
        Map<String, Object> monthlyData = new HashMap<>();

        // Get completed exercises for the month
        List<CompletedExercise> monthlyExercises = completedExerciseRepository
            .findByUserAndPracticeDateBetweenOrderByCompletedAtDesc(user, monthStart, monthEnd);

        // Total exercises completed
        monthlyData.put("totalExercises", monthlyExercises.size());

        // Total practice time in minutes
        Long totalSeconds = monthlyExercises.stream()
            .mapToLong(ex -> ex.getDurationSeconds() != null ? ex.getDurationSeconds() : 0)
            .sum();
        monthlyData.put("totalMinutes", (int) (totalSeconds / 60));

        // Weekly averages
        long weeks = monthStart.until(monthEnd).getDays() / 7 + 1;
        monthlyData.put("averagePerWeek", Math.round((double) monthlyExercises.size() / weeks * 100.0) / 100.0);

        // Monthly trend (compare with previous month)
        LocalDate prevMonthStart = monthStart.minusDays(30);
        LocalDate prevMonthEnd = monthStart.minusDays(1);
        List<CompletedExercise> prevMonthExercises = completedExerciseRepository
            .findByUserAndPracticeDateBetweenOrderByCompletedAtDesc(user, prevMonthStart, prevMonthEnd);

        long prevMonthCount = prevMonthExercises.size();
        long currentMonthCount = monthlyExercises.size();
        
        String trend = calculateTrend(currentMonthCount, prevMonthCount);
        monthlyData.put("trend", trend);

        return monthlyData;
    }

    private Map<String, Object> getExerciseTypeDistribution(User user) {
        Map<String, Object> exerciseTypes = new HashMap<>();

        // Get all completed exercises for the user
        List<CompletedExercise> allExercises = completedExerciseRepository.findByUserOrderByCompletedAtDesc(user);

        // Group by exercise type
        Map<String, Long> typeCounts = allExercises.stream()
            .collect(Collectors.groupingBy(CompletedExercise::getExerciseType, Collectors.counting()));

        exerciseTypes.put("distribution", typeCounts);

        // Most practiced type
        String mostPracticed = typeCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");

        exerciseTypes.put("mostPracticed", mostPracticed);

        return exerciseTypes;
    }

    private Map<String, Object> getDifficultyProgress(User user) {
        Map<String, Object> difficultyProgress = new HashMap<>();

        // Get all completed exercises for the user
        List<CompletedExercise> allExercises = completedExerciseRepository.findByUserOrderByCompletedAtDesc(user);

        // Group by difficulty level
        Map<String, Long> difficultyCounts = allExercises.stream()
            .collect(Collectors.groupingBy(CompletedExercise::getDifficultyLevel, Collectors.counting()));

        difficultyProgress.put("distribution", difficultyCounts);

        // Current level (most practiced difficulty)
        String currentLevel = difficultyCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Beginner");

        difficultyProgress.put("currentLevel", currentLevel);

        return difficultyProgress;
    }

    private Map<String, Object> getPerformanceTrends(User user) {
        Map<String, Object> performanceTrends = new HashMap<>();

        // Get user progress data for the last 30 days
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<UserProgress> recentProgress = userProgressRepository.findByUserAndDateRange(user, thirtyDaysAgo, LocalDate.now());

        if (recentProgress.isEmpty()) {
            performanceTrends.put("trend", "No data available");
            performanceTrends.put("improvement", 0.0);
            return performanceTrends;
        }

        // Calculate average scores
        double avgScore = recentProgress.stream()
            .mapToDouble(UserProgress::getAverageScore)
            .average()
            .orElse(0.0);

        performanceTrends.put("averageScore", Math.round(avgScore * 100.0) / 100.0);

        // Calculate improvement trend
        if (recentProgress.size() >= 2) {
            UserProgress oldest = recentProgress.get(recentProgress.size() - 1);
            UserProgress newest = recentProgress.get(0);
            
            double improvement = newest.getAverageScore() - oldest.getAverageScore();
            performanceTrends.put("improvement", Math.round(improvement * 100.0) / 100.0);
            
            String trend = improvement > 0 ? "Improving" : improvement < 0 ? "Declining" : "Stable";
            performanceTrends.put("trend", trend);
        } else {
            performanceTrends.put("improvement", 0.0);
            performanceTrends.put("trend", "Insufficient data");
        }

        return performanceTrends;
    }

    private String calculateTrend(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? "+100%" : "0%";
        }
        
        double change = ((double) (current - previous) / previous) * 100;
        String sign = change >= 0 ? "+" : "";
        return sign + Math.round(change) + "%";
    }
}
