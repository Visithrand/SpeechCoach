package com.speechtherapy.repository;

import com.speechtherapy.model.Exercise;
import com.speechtherapy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    List<Exercise> findByUserOrderByCompletedAtDesc(User user);
    
    List<Exercise> findByUserAndExerciseType(User user, String exerciseType);
    
    @Query("SELECT e FROM Exercise e WHERE e.user = :user AND e.completedAt >= :startDate AND e.completedAt <= :endDate ORDER BY e.completedAt DESC")
    List<Exercise> findByUserAndDateRange(@Param("user") User user, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(e.overallScore) FROM Exercise e WHERE e.user = :user AND e.exerciseType = :exerciseType")
    Double getAverageScoreByUserAndType(@Param("user") User user, @Param("exerciseType") String exerciseType);
    
    @Query("SELECT COUNT(e) FROM Exercise e WHERE e.user = :user AND e.exerciseType = :exerciseType")
    Long countByUserAndExerciseType(@Param("user") User user, @Param("exerciseType") String exerciseType);
    
    @Query("SELECT e FROM Exercise e WHERE e.user = :user ORDER BY e.overallScore DESC LIMIT 10")
    List<Exercise> findTopExercisesByScore(@Param("user") User user);
    
    // New methods for progress tracking
    List<Exercise> findByUserId(Long userId);
    
    List<Exercise> findByUserAndCategoryAndType(User user, String category, String type);
    
    List<Exercise> findByUserAndType(User user, String type);
    
    List<Exercise> findByUserAndCategory(User user, String category);
    
    @Query("SELECT COUNT(e) FROM Exercise e WHERE e.user = :user AND e.completed = true")
    Long countCompletedByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(e) FROM Exercise e WHERE e.user = :user AND e.completed = false")
    Long countIncompleteByUser(@Param("user") User user);
}