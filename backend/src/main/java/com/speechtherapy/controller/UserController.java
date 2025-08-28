package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("name", user.getName());
            profileData.put("email", user.getEmail());
            profileData.put("dailyGoal", user.getDailyGoal());
            profileData.put("weeklyGoal", user.getWeeklyGoal());
            profileData.put("streakDays", user.getStreakDays());
            profileData.put("weeklyStreak", user.getWeeklyStreak());
            profileData.put("totalPoints", user.getTotalPoints());
            profileData.put("level", determineUserLevel(user));
            profileData.put("joinDate", user.getCreatedAt());

            return ResponseEntity.ok(profileData);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch user profile: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{userId}/settings")
    public ResponseEntity<Map<String, Object>> getUserSettings(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Map<String, Object> settings = new HashMap<>();
            settings.put("notifications", true);
            settings.put("aiVoice", "Female");
            settings.put("speechSpeed", "Normal");
            settings.put("practiceReminders", true);
            settings.put("weeklyReports", true);
            settings.put("soundEffects", true);

            return ResponseEntity.ok(settings);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch user settings: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<Map<String, Object>> updateUserSettings(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> settings) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // In a real application, you would update the user's settings in the database
            // For now, just return success

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Settings updated successfully");
            response.put("status", "success");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to update user settings: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    private String determineUserLevel(User user) {
        Integer streak = user.getStreakDays();
        if (streak == null) streak = 0;
        
        if (streak < 7) return "Beginner";
        else if (streak < 21) return "Intermediate";
        else return "Advanced";
    }
}