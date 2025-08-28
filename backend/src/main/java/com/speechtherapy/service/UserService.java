package com.speechtherapy.service;

import com.speechtherapy.model.User;
import com.speechtherapy.model.Exercise;
import com.speechtherapy.model.UserProgress;
import com.speechtherapy.repository.UserRepository;
import com.speechtherapy.repository.ExerciseRepository;
import com.speechtherapy.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        return userRepository.save(user);
    }
    
    public User createDefaultUser() {
        User defaultUser = new User("Demo User", "demo@speechtherapy.com", 25);
        defaultUser.setNativeLanguage("English");
        defaultUser.setTargetLanguage("English");
        defaultUser.setDifficultyLevel("Intermediate");
        defaultUser.setTotalPoints(150);
        defaultUser.setStreakDays(7);
        defaultUser.setExercisesCompleted(25);
        defaultUser.setDailyGoal(15);
        defaultUser.setWeeklyGoal(105);
        
        return userRepository.save(defaultUser);
    }
    
    public User getOrCreateDefaultUser() {
        Optional<User> existingUser = userRepository.findByEmail("demo@speechtherapy.com");
        return existingUser.orElseGet(this::createDefaultUser);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        if (user == null) {
            return null;
        }
        
        user.setName(userDetails.getName());
        user.setAge(userDetails.getAge());
        user.setNativeLanguage(userDetails.getNativeLanguage());
        user.setTargetLanguage(userDetails.getTargetLanguage());
        user.setDifficultyLevel(userDetails.getDifficultyLevel());
        user.setDailyGoal(userDetails.getDailyGoal());
        user.setWeeklyGoal(userDetails.getWeeklyGoal());
        
        return userRepository.save(user);
    }
    
    public void updateUserProgress(User user, Exercise exercise) {
        // Update user totals
        user.setTotalPoints(user.getTotalPoints() + exercise.getPointsEarned());
        user.setExercisesCompleted(user.getExercisesCompleted() + 1);
        
        // Update streak (simplified logic)
        updateUserStreak(user);
        
        userRepository.save(user);
        
        // Update daily progress
        updateDailyProgress(user, exercise);
    }
    
    private void updateUserStreak(User user) {
        LocalDate today = LocalDate.now();
        Optional<UserProgress> todayProgress = userProgressRepository.findByUserAndPracticeDate(user, today);
        
        if (todayProgress.isEmpty()) {
            // First exercise today, potentially continuing streak
            LocalDate yesterday = today.minusDays(1);
            Optional<UserProgress> yesterdayProgress = userProgressRepository.findByUserAndPracticeDate(user, yesterday);
            
            if (yesterdayProgress.isPresent()) {
                user.setStreakDays(user.getStreakDays() + 1);
            } else {
                user.setStreakDays(1); // New streak
            }
        }
        // If already practiced today, streak remains the same
    }
    
    private void updateDailyProgress(User user, Exercise exercise) {
        LocalDate today = LocalDate.now();
        Optional<UserProgress> todayProgressOpt = userProgressRepository.findByUserAndPracticeDate(user, today);
        
        UserProgress todayProgress;
        if (todayProgressOpt.isPresent()) {
            todayProgress = todayProgressOpt.get();
        } else {
            todayProgress = new UserProgress(user, today);
        }
        
        // Update progress metrics
        todayProgress.setExercisesCompleted(todayProgress.getExercisesCompleted() + 1);
        todayProgress.setTotalPracticeTime(todayProgress.getTotalPracticeTime() + 3); // Assume 3 minutes per exercise
        todayProgress.setPointsEarned(todayProgress.getPointsEarned() + exercise.getPointsEarned());
        
        // Update exercise type counters
        switch (exercise.getExerciseType().toLowerCase()) {
            case "phoneme":
                todayProgress.setPhonemeExercises(todayProgress.getPhonemeExercises() + 1);
                break;
            case "word":
                todayProgress.setWordExercises(todayProgress.getWordExercises() + 1);
                break;
            case "sentence":
                todayProgress.setSentenceExercises(todayProgress.getSentenceExercises() + 1);
                break;
            case "conversation":
                todayProgress.setConversationExercises(todayProgress.getConversationExercises() + 1);
                break;
        }
        
        // Calculate average score
        double currentAvg = todayProgress.getAverageScore();
        int exerciseCount = todayProgress.getExercisesCompleted();
        double newAvg = ((currentAvg * (exerciseCount - 1)) + exercise.getOverallScore()) / exerciseCount;
        todayProgress.setAverageScore(newAvg);
        
        // Check if goals are met
        todayProgress.setGoalsMet(todayProgress.getTotalPracticeTime() >= user.getDailyGoal());
        
        userProgressRepository.save(todayProgress);
    }
    
    public Map<String, Object> getUserStatistics(User user) {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic user stats
        stats.put("totalPoints", user.getTotalPoints());
        stats.put("streakDays", user.getStreakDays());
        stats.put("exercisesCompleted", user.getExercisesCompleted());
        stats.put("dailyGoal", user.getDailyGoal());
        stats.put("weeklyGoal", user.getWeeklyGoal());
        
        // Exercise type statistics
        stats.put("phonemeCount", exerciseRepository.countByUserAndExerciseType(user, "phoneme"));
        stats.put("wordCount", exerciseRepository.countByUserAndExerciseType(user, "word"));
        stats.put("sentenceCount", exerciseRepository.countByUserAndExerciseType(user, "sentence"));
        stats.put("conversationCount", exerciseRepository.countByUserAndExerciseType(user, "conversation"));
        
        // Average scores by type
        stats.put("phonemeAvgScore", exerciseRepository.getAverageScoreByUserAndType(user, "phoneme"));
        stats.put("wordAvgScore", exerciseRepository.getAverageScoreByUserAndType(user, "word"));
        stats.put("sentenceAvgScore", exerciseRepository.getAverageScoreByUserAndType(user, "sentence"));
        stats.put("conversationAvgScore", exerciseRepository.getAverageScoreByUserAndType(user, "conversation"));
        
        // Time-based statistics
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        stats.put("weeklyPracticeTime", userProgressRepository.getTotalPracticeTimeFromDate(user, weekAgo));
        stats.put("weeklyGoalsMet", userProgressRepository.getGoalsMetCount(user, weekAgo));
        stats.put("weeklyAvgScore", userProgressRepository.getAverageScoreFromDate(user, weekAgo));
        
        return stats;
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}