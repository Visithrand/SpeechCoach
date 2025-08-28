package com.speechtherapy.repository;

import com.speechtherapy.model.CompletedExercise;
import com.speechtherapy.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompletedExerciseRepository extends JpaRepository<CompletedExercise, Long> {
    
    /**
     * Find completed exercises by user and practice date
     */
    List<CompletedExercise> findByUserAndPracticeDateOrderByCompletedAtDesc(User user, LocalDate practiceDate);
    
    /**
     * Find completed exercises by user
     */
    List<CompletedExercise> findByUserOrderByCompletedAtDesc(User user);
    
    /**
     * Find completed exercises by user and date range
     */
    List<CompletedExercise> findByUserAndPracticeDateBetweenOrderByCompletedAtDesc(
        User user, LocalDate startDate, LocalDate endDate);
    
    /**
     * Count completed exercises by user and practice date
     */
    long countByUserAndPracticeDate(User user, LocalDate practiceDate);
    
    /**
     * Find completed exercises by exercise type for a user
     */
    List<CompletedExercise> findByUserAndExerciseTypeOrderByCompletedAtDesc(User user, String exerciseType);
    
    /**
     * Find completed exercises by difficulty level for a user
     */
    List<CompletedExercise> findByUserAndDifficultyLevelOrderByCompletedAtDesc(User user, String difficultyLevel);
    
    /**
     * Get exercise completion statistics for a user
     */
    @Query("SELECT ce.exerciseType, COUNT(ce) FROM CompletedExercise ce WHERE ce.user = :user GROUP BY ce.exerciseType")
    List<Object[]> getExerciseTypeStats(@Param("user") User user);
    
    /**
     * Get difficulty level statistics for a user
     */
    @Query("SELECT ce.difficultyLevel, COUNT(ce) FROM CompletedExercise ce WHERE ce.user = :user GROUP BY ce.difficultyLevel")
    List<Object[]> getDifficultyLevelStats(@Param("user") User user);
    
    /**
     * Count completed exercises by user
     */
    long countByUser(User user);
    
    /**
     * Get recent completed exercises for dashboard (last 5)
     */
    @Query("SELECT ce FROM CompletedExercise ce WHERE ce.user = :user ORDER BY ce.completedAt DESC")
    List<CompletedExercise> findRecentExercisesByUser(@Param("user") User user, Pageable pageable);
    
    /**
     * Get total practice time in minutes for a user in a date range
     */
    @Query("SELECT COALESCE(SUM(ce.durationSeconds), 0) FROM CompletedExercise ce WHERE ce.user = :user AND ce.practiceDate BETWEEN :startDate AND :endDate")
    Long getTotalPracticeTimeInSeconds(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Get exercise count by type for a user in a date range
     */
    @Query("SELECT ce.exerciseType, COUNT(ce) FROM CompletedExercise ce WHERE ce.user = :user AND ce.practiceDate BETWEEN :startDate AND :endDate GROUP BY ce.exerciseType")
    List<Object[]> getExerciseCountByTypeInRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
