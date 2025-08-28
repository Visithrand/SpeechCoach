package com.speechtherapy.service;

import com.speechtherapy.model.*;
import com.speechtherapy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DataSeederService implements CommandLineRunner {
    
    @Autowired
    private BodyExerciseRepository bodyExerciseRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Autowired
    private AIExerciseRepository aiExerciseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🚀 Starting data seeding process...");
            
        if (bodyExerciseRepository.count() == 0) {
                System.out.println("📝 Seeding body exercises...");
            seedBodyExercises();
            } else {
                System.out.println("✅ Body exercises already exist: " + bodyExerciseRepository.count());
            }
            
            if (exerciseRepository.count() == 0) {
                System.out.println("📝 Seeding speech exercises...");
                seedExercises();
            } else {
                System.out.println("✅ Speech exercises already exist: " + exerciseRepository.count());
            }
            
            if (aiExerciseRepository.count() == 0) {
                System.out.println("📝 Seeding AI exercises...");
                seedAIExercises();
            } else {
                System.out.println("✅ AI exercises already exist: " + aiExerciseRepository.count());
            }
            
            System.out.println("🎉 Data seeding completed successfully!");
        } catch (Exception e) {
            System.err.println("❌ Error during data seeding: " + e.getMessage());
            e.printStackTrace();
            // Don't fail the application if seeding fails
        }
    }
    
    private void seedExercises() {
        try {
            // Create a default user if none exists
            User defaultUser = createDefaultUser();
            
            // Create just a few simple exercises to start with
            List<Exercise> exercises = Arrays.asList(
                new Exercise(defaultUser, "words", "The quick brown fox"),
                new Exercise(defaultUser, "sentences", "Practice makes perfect"),
                new Exercise(defaultUser, "conversations", "Hello, how are you today?")
            );
            
            // Set basic properties for each exercise
            for (int i = 0; i < exercises.size(); i++) {
                Exercise ex = exercises.get(i);
                ex.setDifficultyLevel("Beginner");
                ex.setOverallScore(80);
                ex.setAccuracyScore(75);
                ex.setClarityScore(80);
                ex.setFluencyScore(75);
                ex.setFeedback("Good practice! Keep working on your speech clarity.");
                ex.setSessionDuration(120);
                ex.setPointsEarned(20);
                ex.setCompletedAt(null); // Mark as not completed
            }
            
            exerciseRepository.saveAll(exercises);
            System.out.println("✅ Seeded " + exercises.size() + " speech exercises");
        } catch (Exception e) {
            System.err.println("❌ Error seeding exercises: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void seedAIExercises() {
        try {
            // Create a default user if none exists
            User defaultUser = createDefaultUser();
            
            // Create just a few simple AI exercises
            List<AIExercise> aiExercises = Arrays.asList(
                new AIExercise(
                    defaultUser,
                    "Practice saying this sentence clearly: 'The quick brown fox jumps over the lazy dog.'",
                    "sentence"
                ),
                new AIExercise(
                    defaultUser,
                    "Tell a short story about your favorite hobby. Speak for 1-2 minutes.",
                    "story"
                )
            );
            
            // Set basic properties for each AI exercise
            aiExercises.get(0).setDifficultyLevel("Beginner");
            aiExercises.get(0).setTargetPhonemes("th, qu, br, f, j, l, z, d");
            aiExercises.get(0).setTargetSkills("Pronunciation, Clarity, Pace");
            aiExercises.get(0).setAiReasoning("This exercise focuses on common English sounds and helps improve overall speech clarity.");
            
            aiExercises.get(1).setDifficultyLevel("Intermediate");
            aiExercises.get(1).setTargetPhonemes("various");
            aiExercises.get(1).setTargetSkills("Storytelling, Expression, Fluency");
            aiExercises.get(1).setAiReasoning("This exercise helps develop narrative skills and emotional expression in speech.");
            
            aiExerciseRepository.saveAll(aiExercises);
            System.out.println("✅ Seeded " + aiExercises.size() + " AI exercises");
        } catch (Exception e) {
            System.err.println("❌ Error seeding AI exercises: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private User createDefaultUser() {
        // Check if default user exists
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
    
    private void seedBodyExercises() {
        List<BodyExercise> exercises = Arrays.asList(
            // BEGINNER LEVEL EXERCISES (5 exercises)
            
            // 1. Deep Breathing
            new BodyExercise(
                "Deep Breathing for Speech",
                "breathing",
                "beginner",
                "Simple breathing exercise to improve breath control for speech",
                "1. Sit comfortably with your back straight\n2. Place one hand on your chest, one on your stomach\n3. Breathe in slowly through your nose for 4 counts\n4. Hold for 2 counts\n5. Exhale slowly through your mouth for 6 counts\n6. Repeat 5 times",
                60,
                5,
                "Diaphragm, Lungs",
                "Improves breath control, reduces speech anxiety, increases vocal power"
            ),
            
            // 2. Lip Stretches
            new BodyExercise(
                "Lip Stretches",
                "facial",
                "beginner",
                "Gentle lip exercises to improve articulation",
                "1. Pucker your lips like you're going to kiss\n2. Hold for 3 seconds\n3. Smile widely, showing your teeth\n4. Hold for 3 seconds\n5. Alternate between pucker and smile\n6. Repeat 10 times",
                45,
                10,
                "Lips, Facial muscles",
                "Improves lip mobility, enhances articulation of labial sounds (p, b, m, w)"
            ),
            
            // 3. Tongue Twists
            new BodyExercise(
                "Tongue Twists",
                "tongue",
                "beginner",
                "Basic tongue exercises for better articulation",
                "1. Stick your tongue out as far as possible\n2. Hold for 3 seconds\n3. Move tongue to the right corner of your mouth\n4. Hold for 3 seconds\n5. Move to the left corner\n6. Hold for 3 seconds\n7. Return to center\n8. Repeat 5 times",
                60,
                5,
                "Tongue, Jaw",
                "Improves tongue flexibility, enhances articulation of lingual sounds (t, d, l, n)"
            ),
            
            // 4. Jaw Relaxation
            new BodyExercise(
                "Jaw Relaxation",
                "jaw",
                "beginner",
                "Gentle jaw exercises to reduce tension",
                "1. Place your fingertips on your jaw joints\n2. Open your mouth slowly and widely\n3. Hold for 3 seconds\n4. Close slowly\n5. Repeat 5 times\n6. Then gently massage your jaw in circular motions",
                90,
                5,
                "Jaw muscles, Temporomandibular joint",
                "Reduces jaw tension, improves mouth opening, enhances speech clarity"
            ),
            
            // 5. Humming Exercise
            new BodyExercise(
                "Humming for Voice",
                "vocal",
                "beginner",
                "Simple vocal warm-up exercise",
                "1. Close your lips gently\n2. Take a deep breath\n3. Hum 'mmmm' on a comfortable pitch\n4. Feel the vibration in your lips and face\n5. Hold for 10 seconds\n6. Repeat 3 times",
                60,
                3,
                "Vocal cords, Lips, Facial muscles",
                "Warms up vocal cords, improves resonance, reduces vocal strain"
            ),
            
            // INTERMEDIATE LEVEL EXERCISES (5 exercises)
            
            // 6. Diaphragmatic Breathing
            new BodyExercise(
                "Diaphragmatic Breathing",
                "breathing",
                "intermediate",
                "Advanced breathing technique for speech projection",
                "1. Lie on your back with knees bent\n2. Place a book on your stomach\n3. Breathe in deeply - the book should rise\n4. Breathe out - the book should fall\n5. Practice for 2 minutes\n6. Then practice while sitting and standing",
                120,
                3,
                "Diaphragm, Abdominal muscles",
                "Improves breath support, increases vocal projection, reduces vocal fatigue"
            ),
            
            // 7. Facial Muscle Control
            new BodyExercise(
                "Facial Muscle Control",
                "facial",
                "intermediate",
                "Advanced facial muscle exercises for expression",
                "1. Raise your eyebrows as high as possible\n2. Hold for 3 seconds\n3. Frown deeply\n4. Hold for 3 seconds\n5. Puff out your cheeks\n6. Hold for 3 seconds\n7. Suck in your cheeks\n8. Hold for 3 seconds\n9. Repeat sequence 5 times",
                90,
                5,
                "Facial muscles, Forehead, Cheeks",
                "Improves facial expression, enhances communication, reduces muscle tension"
            ),
            
            // 8. Tongue Precision
            new BodyExercise(
                "Tongue Precision",
                "tongue",
                "intermediate",
                "Advanced tongue exercises for precise articulation",
                "1. Touch the tip of your tongue to your upper lip\n2. Hold for 2 seconds\n3. Touch the tip to your lower lip\n4. Hold for 2 seconds\n5. Touch the tip to the roof of your mouth\n6. Hold for 2 seconds\n7. Touch the tip to your teeth\n8. Repeat sequence 8 times",
                75,
                8,
                "Tongue, Mouth muscles",
                "Improves tongue precision, enhances articulation, strengthens mouth muscles"
            ),
            
            // 9. Jaw Strengthening
            new BodyExercise(
                "Jaw Strengthening",
                "jaw",
                "intermediate",
                "Strengthening exercises for jaw muscles",
                "1. Place your fist under your chin\n2. Open your mouth against the resistance\n3. Hold for 5 seconds\n4. Close your mouth\n5. Repeat 8 times\n6. Then place your fist on your forehead\n7. Try to open your mouth against it\n8. Repeat 8 times",
                120,
                8,
                "Jaw muscles, Neck muscles",
                "Strengthens jaw muscles, improves chewing, enhances speech stability"
            ),
            
            // 10. Vocal Resonance
            new BodyExercise(
                "Vocal Resonance",
                "vocal",
                "intermediate",
                "Advanced vocal exercises for better resonance",
                "1. Say 'mmmm' on different pitches (low, medium, high)\n2. Hold each pitch for 5 seconds\n3. Then say 'nnnn' on the same pitches\n4. Finally say 'ng' (like in 'sing') on the same pitches\n5. Feel the vibration in different parts of your face\n6. Repeat each sound 3 times",
                90,
                3,
                "Vocal cords, Facial bones, Sinuses",
                "Improves vocal resonance, enhances voice quality, increases vocal range"
            ),
            
            // ADVANCED LEVEL EXERCISES (5 exercises)
            
            // 11. Circular Breathing
            new BodyExercise(
                "Circular Breathing",
                "breathing",
                "advanced",
                "Advanced breathing technique for continuous speech",
                "1. Take a deep breath through your nose\n2. Start exhaling through your mouth\n3. While exhaling, quickly inhale through your nose\n4. Continue exhaling the air from your mouth\n5. Practice with a straw in water\n6. Aim for continuous bubbles",
                180,
                5,
                "Diaphragm, Lungs, Mouth",
                "Enables continuous speech, improves breath control, enhances vocal endurance"
            ),
            
            // 12. Facial Expression Mastery
            new BodyExercise(
                "Facial Expression Mastery",
                "facial",
                "advanced",
                "Complex facial muscle coordination",
                "1. Practice exaggerated expressions: surprise, anger, joy, sadness\n2. Hold each expression for 5 seconds\n3. Transition smoothly between expressions\n4. Add vocal sounds to each expression\n5. Practice in front of a mirror\n6. Repeat sequence 3 times",
                150,
                3,
                "All facial muscles, Expression muscles",
                "Improves emotional expression, enhances communication, strengthens facial muscles"
            ),
            
            // 13. Tongue Acrobatics
            new BodyExercise(
                "Tongue Acrobatics",
                "tongue",
                "advanced",
                "Complex tongue movements for advanced articulation",
                "1. Roll your tongue into a tube\n2. Hold for 3 seconds\n3. Touch your tongue to your nose\n4. Hold for 3 seconds\n5. Touch your tongue to your chin\n6. Hold for 3 seconds\n7. Move tongue in figure-8 pattern\n8. Repeat sequence 5 times",
                120,
                5,
                "Tongue, Mouth muscles, Coordination",
                "Improves tongue dexterity, enhances complex articulation, strengthens coordination"
            ),
            
            // 14. Jaw Mobility
            new BodyExercise(
                "Jaw Mobility",
                "jaw",
                "advanced",
                "Advanced jaw movement exercises",
                "1. Open your mouth as wide as possible\n2. Hold for 5 seconds\n3. Move your jaw to the right\n4. Hold for 3 seconds\n5. Move to the left\n6. Hold for 3 seconds\n7. Move forward\n8. Hold for 3 seconds\n9. Return to center\n10. Repeat sequence 5 times",
                150,
                5,
                "Jaw muscles, Temporomandibular joint, Neck",
                "Improves jaw mobility, reduces jaw tension, enhances speech articulation"
            ),
            
            // 15. Vocal Projection
            new BodyExercise(
                "Vocal Projection",
                "vocal",
                "advanced",
                "Advanced vocal projection exercises",
                "1. Stand in a large room\n2. Take a deep breath\n3. Say 'Hello' loudly and clearly\n4. Project your voice to the far wall\n5. Practice different pitches and volumes\n6. Add movement (walking, turning)\n7. Practice for 3 minutes\n8. Rest for 1 minute\n9. Repeat 2 more times",
                240,
                3,
                "Vocal cords, Diaphragm, Abdominal muscles",
                "Improves vocal projection, enhances public speaking, increases vocal power"
            )
        );
        
        bodyExerciseRepository.saveAll(exercises);
        System.out.println("✅ Seeded " + exercises.size() + " body exercises for speech therapy");
    }
}
