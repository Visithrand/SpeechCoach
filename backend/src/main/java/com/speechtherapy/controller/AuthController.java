package com.speechtherapy.controller;

import com.speechtherapy.model.User;
import com.speechtherapy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5000"})
public class AuthController {
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Auth controller is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listUsers() {
        try {
            // This is for debugging - in production, you'd want proper authentication
            List<User> users = userService.getAllUsers();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Users retrieved successfully");
            response.put("count", users.size());
            response.put("users", users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to retrieve users: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");
            
            System.out.println("Login attempt - Email: " + email + ", Password: " + (password != null ? "***" : "null"));
            
            if (email == null || password == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Email and password are required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // First, try to find the user by email
            User user = userService.getUserByEmail(email);
            System.out.println("User lookup result: " + (user != null ? "Found user ID: " + user.getId() : "User not found"));
            
            if (user == null) {
                // For demo purposes, if user doesn't exist, create a default user
                // In production, you would return an error
                System.out.println("Creating default user for email: " + email);
                user = userService.createDefaultUser();
            }
            
            // For demo purposes, accept any non-empty password
            // In production, you would hash and compare passwords properly
            if (password != null && !password.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", "demo-token-" + System.currentTimeMillis());
                response.put("user", user);
                System.out.println("Login successful for user: " + user.getName() + " (ID: " + user.getId() + ")");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Password is required");
                System.out.println("Login failed: Password is empty");
                return ResponseEntity.status(400).body(error);
            }
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> signupRequest) {
        try {
            String name = signupRequest.get("name");
            String email = signupRequest.get("email");
            String password = signupRequest.get("password");
            
            System.out.println("Signup attempt - Name: " + name + ", Email: " + email + ", Password: " + (password != null ? "***" : "null"));
            
            if (name == null || email == null || password == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Name, email, and password are required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Check if user already exists
            User existingUser = userService.getUserByEmail(email);
            if (existingUser != null) {
                System.out.println("Signup failed: User already exists with email: " + email);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "User with this email already exists");
                return ResponseEntity.status(409).body(error);
            }
            
            // Create new user
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setAge(25); // Default age for demo
            newUser.setDailyGoal(15);
            newUser.setWeeklyGoal(105);
            
            User savedUser = userService.createUser(newUser);
            System.out.println("User created successfully - ID: " + savedUser.getId() + ", Name: " + savedUser.getName() + ", Email: " + savedUser.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("token", "demo-token-" + System.currentTimeMillis()); // Added token for signup
            response.put("user", savedUser);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Signup failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
