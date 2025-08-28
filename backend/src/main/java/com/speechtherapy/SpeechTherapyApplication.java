package com.speechtherapy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@CrossOrigin(origins = "*") // Allow React frontend access
@RestController
public class SpeechTherapyApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SpeechTherapyApplication.class, args);
    }
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("message", "Speech Therapy Backend is running");
        health.put("timestamp", System.currentTimeMillis());
        return health;
    }
}