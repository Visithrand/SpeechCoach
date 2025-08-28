package com.speechtherapy.service;

import com.speechtherapy.model.*;
import com.speechtherapy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private AIExerciseRepository aiExerciseRepository;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🚀 Starting comprehensive data seeding process...");
            
            // Create default user if not exists
            User defaultUser = createDefaultUser();
            
            // Seed exercises
            if (exerciseRepository.count() == 0) {
                System.out.println("📝 Seeding comprehensive exercises...");
                seedExercises(defaultUser);
            } else {
                System.out.println("✅ Exercises already exist: " + exerciseRepository.count());
            }
            
            if (aiExerciseRepository.count() == 0) {
                System.out.println("📝 Seeding AI exercises...");
                seedAIExercises(defaultUser);
            } else {
                System.out.println("✅ AI exercises already exist: " + aiExerciseRepository.count());
            }
            
            System.out.println("🎉 Comprehensive data seeding completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error during data seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private User createDefaultUser() {
        return userRepository.findByEmail("demo@speechtherapy.com")
            .orElseGet(() -> {
                User user = new User("Demo User", "demo@speechtherapy.com", 25);
                user.setStreakDays(5);
                user.setDifficultyLevel("Intermediate");
                user.setTotalPoints(150);
                user.setExercisesCompleted(12);
                return userRepository.save(user);
            });
    }

    private void seedExercises(User user) {
        List<Exercise> exercises = Arrays.asList(
            // ===============================
            // BODY EXERCISES - BEGINNER (Breathing Focus)
            // ===============================
            new Exercise(user, "Deep Breathing Exercise", "Beginner", "Body", 5,
                "1. Sit comfortably with your back straight\n" +
                "2. Place one hand on your chest and one on your stomach\n" +
                "3. Breathe in slowly through your nose for 4 counts\n" +
                "4. Hold for 2 counts\n" +
                "5. Exhale slowly through your mouth for 6 counts\n" +
                "6. Repeat 10 times"),
            
            new Exercise(user, "4-7-8 Breathing", "Beginner", "Body", 4,
                "1. Sit in a comfortable position\n" +
                "2. Inhale through nose for 4 counts\n" +
                "3. Hold breath for 7 counts\n" +
                "4. Exhale through mouth for 8 counts\n" +
                "5. Repeat 5 times"),
            
            new Exercise(user, "Box Breathing", "Beginner", "Body", 6,
                "1. Inhale for 4 counts\n" +
                "2. Hold for 4 counts\n" +
                "3. Exhale for 4 counts\n" +
                "4. Hold empty for 4 counts\n" +
                "5. Repeat 8 times"),
            
            new Exercise(user, "Diaphragmatic Breathing", "Beginner", "Body", 5,
                "1. Lie on your back with knees bent\n" +
                "2. Place hands on stomach\n" +
                "3. Breathe in so stomach rises\n" +
                "4. Breathe out so stomach falls\n" +
                "5. Practice for 5 minutes"),
            
            new Exercise(user, "Equal Breathing", "Beginner", "Body", 4,
                "1. Inhale for 4 counts\n" +
                "2. Exhale for 4 counts\n" +
                "3. Keep breaths equal length\n" +
                "4. Practice for 4 minutes"),
            
            new Exercise(user, "Progressive Relaxation Breathing", "Beginner", "Body", 6,
                "1. Start with deep breath\n" +
                "2. Tense shoulders for 5 seconds\n" +
                "3. Release tension with exhale\n" +
                "4. Move to arms, then legs\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Alternate Nostril Breathing", "Beginner", "Body", 5,
                "1. Close right nostril with thumb\n" +
                "2. Inhale through left nostril\n" +
                "3. Close left nostril, open right\n" +
                "4. Exhale through right nostril\n" +
                "5. Repeat 10 times"),
            
            new Exercise(user, "Humming Bee Breath", "Beginner", "Body", 4,
                "1. Close your eyes\n" +
                "2. Inhale deeply through nose\n" +
                "3. Exhale while humming 'mmmm'\n" +
                "4. Feel the vibration in your chest\n" +
                "5. Practice for 4 minutes"),
            
            new Exercise(user, "Ocean Breath", "Beginner", "Body", 5,
                "1. Inhale through nose\n" +
                "2. Exhale through nose with 'haaa' sound\n" +
                "3. Create ocean wave sound\n" +
                "4. Focus on the sound\n" +
                "5. Practice for 5 minutes"),
            
            new Exercise(user, "Cooling Breath", "Beginner", "Body", 3,
                "1. Curl tongue like a tube\n" +
                "2. Inhale through curled tongue\n" +
                "3. Close mouth and exhale through nose\n" +
                "4. Repeat 8 times"),
            
            new Exercise(user, "Victorious Breath", "Beginner", "Body", 4,
                "1. Inhale through nose\n" +
                "2. Exhale through mouth with 'haaa'\n" +
                "3. Feel the power in your breath\n" +
                "4. Practice for 4 minutes"),
            
            new Exercise(user, "Gentle Breathing", "Beginner", "Body", 5,
                "1. Breathe naturally\n" +
                "2. Focus on gentle inhale\n" +
                "3. Notice gentle exhale\n" +
                "4. Don't force the breath\n" +
                "5. Practice for 5 minutes"),

            // ===============================
            // BODY EXERCISES - INTERMEDIATE (Advanced Breathing)
            // ===============================
            new Exercise(user, "Extended Exhale Breathing", "Intermediate", "Body", 7,
                "1. Inhale for 4 counts\n" +
                "2. Exhale for 8 counts\n" +
                "3. Gradually increase exhale to 10 counts\n" +
                "4. Practice for 7 minutes"),
            
            new Exercise(user, "Breath Retention Practice", "Intermediate", "Body", 8,
                "1. Inhale for 4 counts\n" +
                "2. Hold for 8 counts\n" +
                "3. Exhale for 8 counts\n" +
                "4. Hold empty for 4 counts\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Rhythmic Breathing", "Intermediate", "Body", 6,
                "1. Inhale for 6 counts\n" +
                "2. Hold for 3 counts\n" +
                "3. Exhale for 6 counts\n" +
                "4. Hold empty for 3 counts\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Three-Part Breath", "Intermediate", "Body", 7,
                "1. Fill lower lungs (belly expands)\n" +
                "2. Fill middle lungs (ribs expand)\n" +
                "3. Fill upper lungs (chest expands)\n" +
                "4. Exhale in reverse order\n" +
                "5. Practice for 7 minutes"),
            
            new Exercise(user, "Breath Counting", "Intermediate", "Body", 8,
                "1. Count each breath cycle\n" +
                "2. Count to 10, then start over\n" +
                "3. If mind wanders, start over\n" +
                "4. Focus on the counting\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Breath Awareness", "Intermediate", "Body", 7,
                "1. Focus on natural breath\n" +
                "2. Notice breath quality\n" +
                "3. Observe breath rhythm\n" +
                "4. Don't change the breath\n" +
                "5. Practice for 7 minutes"),
            
            new Exercise(user, "Breath Visualization", "Intermediate", "Body", 6,
                "1. Imagine breath as light\n" +
                "2. Light enters with inhale\n" +
                "3. Fills your entire body\n" +
                "4. Exits with exhale\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Breath with Movement", "Intermediate", "Body", 8,
                "1. Inhale while raising arms\n" +
                "2. Hold while arms are up\n" +
                "3. Exhale while lowering arms\n" +
                "4. Coordinate breath with movement\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Breath Pacing", "Intermediate", "Body", 7,
                "1. Set a timer for 5 seconds\n" +
                "2. Inhale for 5 seconds\n" +
                "3. Exhale for 5 seconds\n" +
                "4. Gradually increase to 6-7 seconds\n" +
                "5. Practice for 7 minutes"),
            
            new Exercise(user, "Breath Quality Focus", "Intermediate", "Body", 6,
                "1. Focus on smooth inhale\n" +
                "2. Notice any hitches or pauses\n" +
                "3. Smooth out the breath\n" +
                "4. Practice for 6 minutes"),
            
            new Exercise(user, "Breath Rhythm Variation", "Intermediate", "Body", 8,
                "1. Inhale for 4, hold for 2, exhale for 6\n" +
                "2. Inhale for 6, hold for 3, exhale for 8\n" +
                "3. Alternate between patterns\n" +
                "4. Practice for 8 minutes"),
            
            new Exercise(user, "Breath Depth Control", "Intermediate", "Body", 7,
                "1. Take shallow breaths\n" +
                "2. Gradually deepen each breath\n" +
                "3. Notice the difference\n" +
                "4. Practice for 7 minutes"),

            // ===============================
            // BODY EXERCISES - ADVANCED (Master Breathing)
            // ===============================
            new Exercise(user, "Advanced Breath Retention", "Advanced", "Body", 10,
                "1. Inhale for 4 counts\n" +
                "2. Hold for 16 counts\n" +
                "3. Exhale for 8 counts\n" +
                "4. Hold empty for 8 counts\n" +
                "5. Practice for 10 minutes"),
            
            new Exercise(user, "Breath Ratio Practice", "Advanced", "Body", 12,
                "1. Practice 1:4:2:1 ratio\n" +
                "2. Inhale:Hold:Exhale:Hold\n" +
                "3. Gradually increase hold times\n" +
                "4. Practice for 12 minutes"),
            
            new Exercise(user, "Breath Bandha Practice", "Advanced", "Body", 15,
                "1. Engage mula bandha (pelvic floor)\n" +
                "2. Inhale and hold breath\n" +
                "3. Maintain bandha during retention\n" +
                "4. Release with exhale\n" +
                "5. Practice for 15 minutes"),
            
            new Exercise(user, "Breath Meditation", "Advanced", "Body", 20,
                "1. Sit in meditation posture\n" +
                "2. Focus solely on breath\n" +
                "3. Count breaths to 100\n" +
                "4. If mind wanders, start over\n" +
                "5. Practice for 20 minutes"),
            
            new Exercise(user, "Breath Pranayama", "Advanced", "Body", 15,
                "1. Practice kapalabhati (skull shining)\n" +
                "2. Rapid exhales through nose\n" +
                "3. Passive inhales\n" +
                "4. Start with 30 rounds\n" +
                "5. Practice for 15 minutes"),
            
            new Exercise(user, "Breath Energy Flow", "Advanced", "Body", 18,
                "1. Imagine energy flowing with breath\n" +
                "2. Energy enters through crown\n" +
                "3. Flows down spine with inhale\n" +
                "4. Flows up with exhale\n" +
                "5. Practice for 18 minutes"),
            
            new Exercise(user, "Breath Sound Practice", "Advanced", "Body", 12,
                "1. Practice ujjayi breath\n" +
                "2. Create ocean sound in throat\n" +
                "3. Maintain throughout practice\n" +
                "4. Practice for 12 minutes"),
            
            new Exercise(user, "Breath Visualization Advanced", "Advanced", "Body", 15,
                "1. Visualize breath as energy\n" +
                "2. Energy fills specific body parts\n" +
                "3. Move energy with breath\n" +
                "4. Practice for 15 minutes"),
            
            new Exercise(user, "Breath Control Mastery", "Advanced", "Body", 20,
                "1. Control breath in any situation\n" +
                "2. Practice under stress\n" +
                "3. Maintain calm breathing\n" +
                "4. Practice for 20 minutes"),
            
            new Exercise(user, "Breath Integration", "Advanced", "Body", 25,
                "1. Integrate breath with daily activities\n" +
                "2. Walking, talking, working\n" +
                "3. Maintain awareness\n" +
                "4. Practice throughout the day"),
            
            new Exercise(user, "Breath Mastery", "Advanced", "Body", 30,
                "1. Combine all breathing techniques\n" +
                "2. Create personal practice\n" +
                "3. Master breath control\n" +
                "4. Practice for 30 minutes"),
            
            new Exercise(user, "Breath Enlightenment", "Advanced", "Body", 45,
                "1. Advanced meditation with breath\n" +
                "2. Deep spiritual practice\n" +
                "3. Breath as gateway to consciousness\n" +
                "4. Practice for 45 minutes"),

            // ===============================
            // SPEECH EXERCISES - BEGINNER
            // ===============================
            new Exercise(user, "Single Word Practice", "Beginner", "Speech", 5,
                "1. Choose simple words: 'cat', 'dog', 'sun', 'moon'\n" +
                "2. Say each word clearly and slowly\n" +
                "3. Focus on clear pronunciation\n" +
                "4. Repeat each word 5 times\n" +
                "5. Practice for 5 minutes"),
            
            new Exercise(user, "Basic Statements", "Beginner", "Speech", 6,
                "1. Practice: 'I am happy today'\n" +
                "2. Say it slowly and clearly\n" +
                "3. Focus on each word\n" +
                "4. Repeat 10 times\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Simple Sentences", "Beginner", "Speech", 7,
                "1. Practice: 'The sun is bright'\n" +
                "2. Say it with proper pauses\n" +
                "3. Focus on clarity\n" +
                "4. Repeat 8 times\n" +
                "5. Practice for 7 minutes"),
            
            new Exercise(user, "Easy Tongue Twisters", "Beginner", "Speech", 5,
                "1. 'Peter Piper picked a peck of pickled peppers'\n" +
                "2. Start slowly and clearly\n" +
                "3. Gradually increase speed\n" +
                "4. Focus on accuracy over speed\n" +
                "5. Practice for 5 minutes"),
            
            new Exercise(user, "Vowel Sounds", "Beginner", "Speech", 4,
                "1. Practice: A, E, I, O, U\n" +
                "2. Hold each sound for 3 seconds\n" +
                "3. Focus on clear pronunciation\n" +
                "4. Repeat each vowel 5 times\n" +
                "5. Practice for 4 minutes"),

            // ===============================
            // SPEECH EXERCISES - INTERMEDIATE
            // ===============================
            new Exercise(user, "Complex Word Practice", "Intermediate", "Speech", 6,
                "1. Practice: 'beautiful', 'wonderful', 'excellent'\n" +
                "2. Break down syllables\n" +
                "3. Focus on stress patterns\n" +
                "4. Repeat each word 8 times\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Detailed Statements", "Intermediate", "Speech", 7,
                "1. Practice: 'I am excited to learn new things'\n" +
                "2. Focus on smooth transitions\n" +
                "3. Add natural pauses\n" +
                "4. Repeat 10 times\n" +
                "5. Practice for 7 minutes"),
            
            new Exercise(user, "Complex Sentences", "Intermediate", "Speech", 8,
                "1. Practice: 'The beautiful sunset painted the sky with vibrant colors'\n" +
                "2. Focus on rhythm and flow\n" +
                "3. Add appropriate emphasis\n" +
                "4. Repeat 6 times\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Intermediate Tongue Twisters", "Intermediate", "Speech", 6,
                "1. 'She sells seashells by the seashore'\n" +
                "2. Practice with clear articulation\n" +
                "3. Focus on speed and accuracy\n" +
                "4. Repeat 12 times\n" +
                "5. Practice for 6 minutes"),
            
            new Exercise(user, "Consonant Clusters", "Intermediate", "Speech", 7,
                "1. Practice: 'str', 'spl', 'thr', 'spr'\n" +
                "2. Add vowels to make words\n" +
                "3. Focus on clear consonant sounds\n" +
                "4. Practice for 7 minutes"),

            // ===============================
            // SPEECH EXERCISES - ADVANCED
            // ===============================
            new Exercise(user, "Advanced Vocabulary", "Advanced", "Speech", 8,
                "1. Practice: 'extraordinary', 'phenomenal', 'magnificent'\n" +
                "2. Focus on syllable stress\n" +
                "3. Practice in context\n" +
                "4. Repeat each word 10 times\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Complex Statements", "Advanced", "Speech", 9,
                "1. Practice: 'I am absolutely thrilled to be participating in this remarkable opportunity'\n" +
                "2. Focus on natural flow\n" +
                "3. Add emotional expression\n" +
                "4. Repeat 8 times\n" +
                "5. Practice for 9 minutes"),
            
            new Exercise(user, "Advanced Sentences", "Advanced", "Speech", 10,
                "1. Practice: 'The magnificent waterfall cascaded down the ancient granite cliffs'\n" +
                "2. Focus on dramatic delivery\n" +
                "3. Add appropriate pauses and emphasis\n" +
                "4. Repeat 6 times\n" +
                "5. Practice for 10 minutes"),
            
            new Exercise(user, "Advanced Tongue Twisters", "Advanced", "Speech", 8,
                "1. 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?'\n" +
                "2. Practice with perfect articulation\n" +
                "3. Focus on speed and clarity\n" +
                "4. Repeat 15 times\n" +
                "5. Practice for 8 minutes"),
            
            new Exercise(user, "Emotional Expression", "Advanced", "Speech", 9,
                "1. Practice the same sentence with different emotions\n" +
                "2. Happy, sad, angry, excited, calm\n" +
                "3. Focus on voice modulation\n" +
                "4. Practice for 9 minutes")
        );

        // Set additional properties for each exercise
        exercises.forEach(exercise -> {
            exercise.setExerciseType(exercise.getType().equals("Body") ? "body_exercise" : "speech_exercise");
            exercise.setTargetText(exercise.getName());
            exercise.setDifficultyLevel(exercise.getCategory());
            exercise.setSessionDuration(exercise.getDuration() * 60); // Convert minutes to seconds
            exercise.setCompleted(false);
            exercise.setProgressPercentage(0);
            exercise.setAttemptsCount(0);
            exercise.setBestScore(0);
        });

        exerciseRepository.saveAll(exercises);
        System.out.println("✅ Seeded " + exercises.size() + " comprehensive exercises (including 30+ breathing exercises)");
    }

    private void seedAIExercises(User user) {
        // Create AI-specific exercises for advanced speech practice
        List<AIExercise> aiExercises = Arrays.asList(
            new AIExercise(user, "Practice difficult words with AI feedback", "pronunciation"),
            new AIExercise(user, "Build speaking confidence with AI guidance", "fluency"),
            new AIExercise(user, "Learn emotional expression in speech", "expression"),
            new AIExercise(user, "Improve speech clarity with AI analysis", "clarity"),
            new AIExercise(user, "Build speaking confidence through AI practice", "confidence")
        );

        // Set additional properties for each AI exercise
        aiExercises.forEach(exercise -> {
            exercise.setDifficultyLevel("Advanced");
            exercise.setTargetPhonemes("th, sh, ch");
            exercise.setTargetSkills("clarity, fluency, expression");
            exercise.setContext("AI-powered practice");
            exercise.setAiReasoning("Personalized exercise based on user needs");
        });

        aiExerciseRepository.saveAll(aiExercises);
        System.out.println("✅ Seeded " + aiExercises.size() + " AI exercises");
    }
}
