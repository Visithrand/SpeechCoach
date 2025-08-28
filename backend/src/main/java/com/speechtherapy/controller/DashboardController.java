package com.speechtherapy.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.speechtherapy.service.DashboardService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("message", "Dashboard service is running");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardData(@PathVariable Long userId) {
        try {
            Map<String, Object> dashboardData = dashboardService.getDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch dashboard data: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = dashboardService.getDashboardStats(userId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to fetch dashboard stats: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
