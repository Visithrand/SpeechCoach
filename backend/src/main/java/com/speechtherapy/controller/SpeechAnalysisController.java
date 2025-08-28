package com.speechtherapy.controller;

import com.speechtherapy.service.SpeechAnalysisService;
import com.speechtherapy.service.UserService;
import com.speechtherapy.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/speech")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class SpeechAnalysisController {
    
    @Autowired
    private SpeechAnalysisService speechAnalysisService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeAudio(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "exerciseId", required = false) String exerciseId,
            @RequestParam(value = "userId", required = false) Long userId) {
        
        try {
            // Get or create default user
            User user = null;
            if (userId != null) {
                user = userService.getUserById(userId);
            }
            if (user == null) {
                user = userService.createDefaultUser();
            }
            
            // For now, generate mock analysis since we don't have real speech analysis
            Map<String, Object> analysisResult = generateMockAnalysis();
            
            return ResponseEntity.ok(analysisResult);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Analysis failed: " + e.getMessage());
            errorResponse.put("message", "Failed to analyze speech. Please try again.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @PostMapping("/quick-analyze")
    public ResponseEntity<Map<String, Object>> quickAnalyze(
            @RequestParam("exerciseType") String exerciseType,
            @RequestParam("targetText") String targetText) {
        
        try {
            // Generate mock analysis for demo purposes
            Map<String, Object> mockResult = generateMockAnalysis();
            return ResponseEntity.ok(mockResult);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Mock analysis failed: " + e.getMessage());
            errorResponse.put("message", "Failed to generate mock analysis. Please try again.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/exercises/{type}")
    public ResponseEntity<Map<String, Object>> getExercisesByType(@PathVariable String type) {
        try {
            Map<String, Object> exercises = speechAnalysisService.getExerciseContentByType(type);
            return ResponseEntity.ok(exercises);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to load exercises: " + e.getMessage());
            errorResponse.put("message", "Failed to load exercises. Please try again.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/phonemes")
    public ResponseEntity<Map<String, Object>> getPhonemes() {
        try {
            Map<String, Object> phonemes = speechAnalysisService.getPhonemeData();
            return ResponseEntity.ok(phonemes);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to load phonemes: " + e.getMessage());
            errorResponse.put("message", "Failed to load phonemes. Please try again.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Map<String, Object> generateMockAnalysis() {
        Map<String, Object> result = new HashMap<>();
        
        // Generate realistic mock scores
        int overallScore = 75 + (int)(Math.random() * 20); // 75-95
        int pronunciationScore = 70 + (int)(Math.random() * 25); // 70-95
        int clarityScore = 75 + (int)(Math.random() * 20); // 75-95
        int fluencyScore = 70 + (int)(Math.random() * 25); // 70-95
        
        result.put("overallScore", overallScore);
        result.put("score", overallScore); // Alternative key for compatibility
        
        Map<String, Integer> detailedScores = new HashMap<>();
        detailedScores.put("pronunciation", pronunciationScore);
        detailedScores.put("clarity", clarityScore);
        detailedScores.put("fluency", fluencyScore);
        detailedScores.put("pace", 80 + (int)(Math.random() * 15));
        detailedScores.put("expression", 75 + (int)(Math.random() * 20));
        
        result.put("detailedScores", detailedScores);
        
        // Generate feedback based on scores
        String feedback = "Good effort! ";
        if (overallScore >= 90) {
            feedback += "Excellent speech clarity and pronunciation. Keep up the great work!";
        } else if (overallScore >= 80) {
            feedback += "Very good speech with minor areas for improvement.";
        } else if (overallScore >= 70) {
            feedback += "Good progress! Focus on clear pronunciation and steady pace.";
        } else {
            feedback += "Keep practicing! Focus on slowing down and enunciating clearly.";
        }
        
        result.put("feedback", feedback);
        
        // Generate improvements
        String[] improvements = {
            "Clear articulation of consonants",
            "Good breathing control",
            "Consistent speaking pace"
        };
        result.put("improvements", improvements);
        
        // Generate recommendations
        String[] recommendations = {
            "Practice tongue twisters to improve articulation",
            "Record yourself and listen for clarity",
            "Take deep breaths before speaking"
        };
        result.put("recommendations", recommendations);
        
        return result;
    }
}