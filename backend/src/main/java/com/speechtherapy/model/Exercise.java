package com.speechtherapy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;

@Entity
@Table(name = "exercises")
public class Exercise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotBlank(message = "Exercise name is required")
    @Column(name = "name", nullable = false)
    private String name; // Exercise name
    
    @NotBlank(message = "Exercise category is required")
    @Column(name = "category", nullable = false)
    private String category; // Beginner, Intermediate, Advanced
    
    @NotBlank(message = "Exercise type is required")
    @Column(name = "type", nullable = false)
    private String type; // Body, Speech
    
    @Min(1) @Max(60)
    @Column(name = "duration", nullable = false)
    private Integer duration; // Duration in minutes
    
    @NotBlank(message = "Exercise instructions are required")
    @Column(name = "instructions", length = 2000, nullable = false)
    private String instructions; // Step-by-step guide
    
    @Column(name = "exercise_type")
    private String exerciseType; // phoneme, word, sentence, conversation, tongue_twister
    
    @Column(name = "target_text")
    private String targetText; // The text/phoneme being practiced
    
    @Column(name = "difficulty_level")
    private String difficultyLevel;
    
    @Min(0) @Max(100)
    @Column(name = "overall_score")
    private Integer overallScore;
    
    @Min(0) @Max(100)
    @Column(name = "accuracy_score")
    private Integer accuracyScore;
    
    @Min(0) @Max(100)
    @Column(name = "clarity_score")
    private Integer clarityScore;
    
    @Min(0) @Max(100)
    @Column(name = "fluency_score")
    private Integer fluencyScore;
    
    @Column(name = "feedback", length = 1000)
    private String feedback;
    
    @Column(name = "voice_feedback")
    private String voiceFeedback; // AI-generated audio feedback
    
    @Column(name = "audio_file_path")
    private String audioFilePath;
    
    @Column(name = "session_duration") // in seconds
    private Integer sessionDuration;
    
    @Column(name = "points_earned")
    private Integer pointsEarned;
    
    // Progress Tracking Fields
    @Column(name = "completed", nullable = false)
    private Boolean completed = false;
    
    @Column(name = "last_attempt_date")
    private LocalDateTime lastAttemptDate;
    
    @Column(name = "attempts_count")
    private Integer attemptsCount = 0;
    
    @Column(name = "best_score")
    private Integer bestScore = 0;
    
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public Exercise() {
        this.createdAt = LocalDateTime.now();
        this.completed = false;
        this.attemptsCount = 0;
        this.bestScore = 0;
        this.progressPercentage = 0;
    }
    
    public Exercise(User user, String name, String category, String type, Integer duration, String instructions) {
        this();
        this.user = user;
        this.name = name;
        this.category = category;
        this.type = type;
        this.duration = duration;
        this.instructions = instructions;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }
    
    public String getTargetText() { return targetText; }
    public void setTargetText(String targetText) { this.targetText = targetText; }
    
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    
    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
    
    public Integer getAccuracyScore() { return accuracyScore; }
    public void setAccuracyScore(Integer accuracyScore) { this.accuracyScore = accuracyScore; }
    
    public Integer getClarityScore() { return clarityScore; }
    public void setClarityScore(Integer clarityScore) { this.clarityScore = clarityScore; }
    
    public Integer getFluencyScore() { return fluencyScore; }
    public void setFluencyScore(Integer fluencyScore) { this.fluencyScore = fluencyScore; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    
    public String getVoiceFeedback() { return voiceFeedback; }
    public void setVoiceFeedback(String voiceFeedback) { this.voiceFeedback = voiceFeedback; }
    
    public String getAudioFilePath() { return audioFilePath; }
    public void setAudioFilePath(String audioFilePath) { this.audioFilePath = audioFilePath; }
    
    public Integer getSessionDuration() { return sessionDuration; }
    public void setSessionDuration(Integer sessionDuration) { this.sessionDuration = sessionDuration; }
    
    public Integer getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; }
    
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
    
    public LocalDateTime getLastAttemptDate() { return lastAttemptDate; }
    public void setLastAttemptDate(LocalDateTime lastAttemptDate) { this.lastAttemptDate = lastAttemptDate; }
    
    public Integer getAttemptsCount() { return attemptsCount; }
    public void setAttemptsCount(Integer attemptsCount) { this.attemptsCount = attemptsCount; }
    
    public Integer getBestScore() { return bestScore; }
    public void setBestScore(Integer bestScore) { this.bestScore = bestScore; }
    
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}