package com.speechtherapy.service;

import com.speechtherapy.model.User;
import com.speechtherapy.model.CompletedExercise;
import com.speechtherapy.model.UserProgress;
import com.speechtherapy.repository.UserRepository;
import com.speechtherapy.repository.CompletedExerciseRepository;
import com.speechtherapy.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CompletedExerciseRepository completedExerciseRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    /**
     * Get comprehensive dashboard data for a user
     */
    public Map<String, Object> getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Get date ranges
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);
        
        // Weekly progress from database
        Map<String, Object> weeklyProgress = getWeeklyProgress(user, weekStart, today);
        dashboardData.put("weeklyProgress", weeklyProgress);
        
        // Streak data from database
        Map<String, Object> streak = getStreakData(user);
        dashboardData.put("streak", streak);
        
        // Today's data from database
        Map<String, Object> todayData = getTodayData(user, today);
        dashboardData.put("today", todayData);
        
        // Welcome message
        dashboardData.put("welcomeMessage", "Welcome back " + user.getName() + "! You're making great progress with your speech therapy.");
        
        // Motivational message
        dashboardData.put("motivationalMessage", "Consistency is key to improving your speech. Every exercise brings you closer to your goals.");
        
        // Recent exercises from database
        List<Map<String, Object>> recentExercises = getRecentExercises(user);
        dashboardData.put("recentExercises", recentExercises);
        
        return dashboardData;
    }
    
    /**
     * Get aggregated statistics for dashboard
     */
    public Map<String, Object> getDashboardStats(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);
        
        Map<String, Object> stats = new HashMap<>();
        
        // Total exercises this week
        List<CompletedExercise> weeklyExercisesList = completedExerciseRepository.findByUserAndPracticeDateBetweenOrderByCompletedAtDesc(user, weekStart, today);
        long weeklyExercises = weeklyExercisesList.size();
        stats.put("totalExercises", weeklyExercises);
        
        // Total practice time this week (convert seconds to minutes)
        Long weeklySeconds = completedExerciseRepository.getTotalPracticeTimeInSeconds(user, weekStart, today);
        int weeklyMinutes = (weeklySeconds != null) ? (int) (weeklySeconds / 60) : 0;
        stats.put("totalMinutes", weeklyMinutes);
        
        // Average score (from UserProgress)
        double weeklyAvgScore = getWeeklyAverageScore(user, weekStart, today);
        stats.put("averageScore", Math.round(weeklyAvgScore * 100.0) / 100.0);
        
        // Current streak from user model
        stats.put("currentStreak", user.getStreakDays() != null ? user.getStreakDays() : 0);
        
        // Best streak (for now, use current streak, can be enhanced later)
        stats.put("bestStreak", user.getStreakDays() != null ? user.getStreakDays() : 0);
        
        return stats;
    }
    
    /**
     * Get weekly progress data
     */
    private Map<String, Object> getWeeklyProgress(User user, LocalDate weekStart, LocalDate weekEnd) {
        Map<String, Object> weeklyProgress = new HashMap<>();
        
        // Get total practice time for the week
        Long weeklySeconds = completedExerciseRepository.getTotalPracticeTimeInSeconds(user, weekStart, weekEnd);
        int weeklyMinutes = (weeklySeconds != null) ? (int) (weeklySeconds / 60) : 0;
        
        weeklyProgress.put("totalMinutesCompleted", weeklyMinutes);
        weeklyProgress.put("totalMinutesGoal", user.getWeeklyGoal());
        
        // Calculate percentage change from previous week
        LocalDate prevWeekStart = weekStart.minusDays(7);
        LocalDate prevWeekEnd = weekStart.minusDays(1);
        Long prevWeekSeconds = completedExerciseRepository.getTotalPracticeTimeInSeconds(user, prevWeekStart, prevWeekEnd);
        int prevWeekMinutes = (prevWeekSeconds != null) ? (int) (prevWeekSeconds / 60) : 0;
        
        String change = calculateChange(weeklyMinutes, prevWeekMinutes);
        weeklyProgress.put("change", change);
        
        // Get exercise counts by type for the week
        List<Object[]> exerciseTypeStats = completedExerciseRepository.getExerciseCountByTypeInRange(user, weekStart, weekEnd);
        
        int bodyExercises = 0;
        int speechExercises = 0;
        
        for (Object[] stat : exerciseTypeStats) {
            String type = (String) stat[0];
            Long count = (Long) stat[1];
            
            if ("Body".equalsIgnoreCase(type) || "Jaw".equalsIgnoreCase(type) || "Facial".equalsIgnoreCase(type)) {
                bodyExercises += count.intValue();
            } else {
                speechExercises += count.intValue();
            }
        }
        
        weeklyProgress.put("bodyExercisesCompleted", bodyExercises);
        weeklyProgress.put("bodyExercisesGoal", user.getWeeklyGoal() / 7); // Daily goal * 7
        
        weeklyProgress.put("speechExercisesCompleted", speechExercises);
        weeklyProgress.put("speechExercisesGoal", user.getWeeklyGoal() / 7);
        
        return weeklyProgress;
    }
    
    /**
     * Get streak data
     */
    private Map<String, Object> getStreakData(User user) {
        Map<String, Object> streak = new HashMap<>();
        
        Integer currentStreak = user.getStreakDays() != null ? user.getStreakDays() : 0;
        streak.put("currentStreak", currentStreak);
        
        // Calculate days gained (simplified - can be enhanced)
        streak.put("daysGained", Math.max(0, currentStreak - 1));
        
        return streak;
    }
    
    /**
     * Get today's data
     */
    private Map<String, Object> getTodayData(User user, LocalDate today) {
        Map<String, Object> todayData = new HashMap<>();
        
        // Get today's completed exercises count
        long todayExercises = completedExerciseRepository.countByUserAndPracticeDate(user, today);
        todayData.put("completed", (int) todayExercises);
        todayData.put("goal", user.getDailyGoal());
        
        // Check if daily goal is met
        Long todaySeconds = completedExerciseRepository.getTotalPracticeTimeInSeconds(user, today, today);
        int todayMinutes = (todaySeconds != null) ? (int) (todaySeconds / 60) : 0;
        boolean goalsMet = todayMinutes >= user.getDailyGoal();
        
        todayData.put("status", goalsMet ? "Goal Met!" : "On track");
        
        return todayData;
    }
    
    /**
     * Get recent exercises for dashboard
     */
    private List<Map<String, Object>> getRecentExercises(User user) {
        // Get last 5 completed exercises
        List<CompletedExercise> recentExercises = completedExerciseRepository
            .findRecentExercisesByUser(user, PageRequest.of(0, 5));
        
        return recentExercises.stream()
            .map(exercise -> {
                Map<String, Object> exerciseData = new HashMap<>();
                exerciseData.put("name", exercise.getExerciseName());
                exerciseData.put("type", exercise.getExerciseType());
                exerciseData.put("duration", exercise.getDurationSeconds() != null ? exercise.getDurationSeconds() / 60 : 0);
                exerciseData.put("score", 85); // Default score - can be enhanced with actual scoring system
                exerciseData.put("completed", exercise.getCompletedAt().toLocalDate().toString());
                return exerciseData;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Calculate weekly average score
     */
    private double getWeeklyAverageScore(User user, LocalDate weekStart, LocalDate weekEnd) {
        List<UserProgress> weeklyProgress = userProgressRepository.findByUserAndDateRange(user, weekStart, weekEnd);
        
        if (weeklyProgress.isEmpty()) {
            return 0.0;
        }
        
        return weeklyProgress.stream()
            .mapToDouble(UserProgress::getAverageScore)
            .average()
            .orElse(0.0);
    }
    
    /**
     * Calculate percentage change between two values
     */
    private String calculateChange(int current, int previous) {
        if (previous == 0) {
            return current > 0 ? "+100%" : "0%";
        }
        
        double change = ((double) (current - previous) / previous) * 100;
        String sign = change >= 0 ? "+" : "";
        return sign + Math.round(change) + "%";
    }
}
