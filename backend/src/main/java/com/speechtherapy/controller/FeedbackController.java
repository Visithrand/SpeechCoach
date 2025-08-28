package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class FeedbackController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getFeedbackData(@PathVariable Long userId) {
        try {
            // Verify user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // For now, return mock feedback data
            // In a real application, this would come from a feedback database
            Map<String, Object> feedbackData = new HashMap<>();
            
            List<Map<String, Object>> feedbackList = Arrays.asList(
                Map.of(
                    "id", 1,
                    "type", "positive",
                    "message", "Great progress on pronunciation! Your 'th' sound is much clearer now.",
                    "date", "2024-01-15",
                    "score", 85
                ),
                Map.of(
                    "id", 2,
                    "type", "suggestion",
                    "message", "Try slowing down your speech slightly to improve clarity.",
                    "date", "2024-01-14",
                    "score", 72
                ),
                Map.of(
                    "id", 3,
                    "type", "positive",
                    "message", "Excellent work on the tongue twister exercise!",
                    "date", "2024-01-13",
                    "score", 90
                )
            );
            
            feedbackData.put("feedback", feedbackList);
            feedbackData.put("total", feedbackList.size());
            feedbackData.put("averageScore", 82.3);

            return ResponseEntity.ok(feedbackData);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch feedback data: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

