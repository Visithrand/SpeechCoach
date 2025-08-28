import streamlit as st
import json
import random
from audio_recorder_streamlit import audio_recorder
import time
import io
from datetime import datetime
import numpy as np
from utils.scoring_engine import ScoringEngine
from utils.audio_processor import AudioProcessor

def main():
    st.title("🎯 Speech Exercises")
    
    # Initialize components
    if 'scoring_engine' not in st.session_state:
        st.session_state.scoring_engine = ScoringEngine()
    
    if 'audio_processor' not in st.session_state:
        st.session_state.audio_processor = AudioProcessor()
    
    # Show personalized recommendations
    show_exercise_recommendations()
    
    # Practice timer
    show_practice_timer()
    
    # Exercise categories
    exercise_type = st.selectbox(
        "Choose Exercise Type:",
        ["Phoneme Practice", "Word Exercises", "Sentence Repetition", "Conversation Practice", "Tongue Twisters"]
    )
    
    if exercise_type == "Phoneme Practice":
        phoneme_exercises()
    elif exercise_type == "Word Exercises":
        word_exercises()
    elif exercise_type == "Sentence Repetition":
        sentence_exercises()
    elif exercise_type == "Conversation Practice":
        conversation_exercises()
    elif exercise_type == "Tongue Twisters":
        tongue_twister_exercises()

def phoneme_exercises():
    st.markdown("### 🔤 Phoneme Practice")
    st.markdown("Practice individual sounds to improve pronunciation accuracy.")
    
    # Load phoneme data
    try:
        with open('data/phonemes.json', 'r') as f:
            phonemes = json.load(f)
    except FileNotFoundError:
        st.error("Phoneme data not found. Please check the data files.")
        st.info("💡 Tip: Make sure the data/phonemes.json file exists in your project directory.")
        return
    except json.JSONDecodeError:
        st.error("Error reading phoneme data. The file may be corrupted.")
        return
    
    # Select difficulty level
    difficulty = st.radio("Select Difficulty:", ["Beginner", "Intermediate", "Advanced"])
    
    # Filter phonemes by difficulty
    available_phonemes = [p for p in phonemes if p['difficulty'] == difficulty.lower()]
    
    if not available_phonemes:
        st.warning("No phonemes available for selected difficulty.")
        return
    
    # Select or random phoneme
    col1, col2 = st.columns([2, 1])
    
    with col1:
        selected_phoneme = st.selectbox(
            "Choose a phoneme:",
            [p['symbol'] for p in available_phonemes],
            format_func=lambda x: f"{x} - {next(p['description'] for p in available_phonemes if p['symbol'] == x)}"
        )
    
    with col2:
        if st.button("🎲 Random Phoneme"):
            selected_phoneme = random.choice(available_phonemes)['symbol']
            st.rerun()
    
    # Get selected phoneme data
    phoneme_data = next(p for p in available_phonemes if p['symbol'] == selected_phoneme)
    
    # Display phoneme information
    st.markdown(f"#### Practicing: **{phoneme_data['symbol']}** - {phoneme_data['description']}")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Example Words:**")
        for word in phoneme_data['example_words']:
            st.markdown(f"• {word}")
    
    with col2:
        st.markdown("**Pronunciation Tips:**")
        for tip in phoneme_data['tips']:
            st.markdown(f"• {tip}")
    
    # Text-to-speech demonstration
    st.markdown("---")
    st.markdown("#### 🔊 Listen and Practice")
    
    if st.button("🎵 Play Demonstration"):
        st.info(f"🔊 Now playing: {phoneme_data['symbol']} sound")
        st.audio(data=generate_demo_audio(phoneme_data['symbol']), format="audio/wav")
    
    # Recording section
    st.markdown("#### 🎤 Record Your Practice")
    
    audio_bytes = audio_recorder(
        text="Click to record your pronunciation",
        recording_color="#FF6B6B",
        neutral_color="#E6E6FA",
        icon_name="microphone",
        icon_size="2x"
    )
    
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        
        # Analyze recording
        if st.button("📊 Analyze My Pronunciation"):
            with st.spinner("Analyzing your pronunciation..."):
                time.sleep(2)  # Simulate processing time
                
                # Mock scoring (replace with actual AI analysis)
                score = st.session_state.scoring_engine.analyze_phoneme(
                    audio_bytes, phoneme_data['symbol']
                )
                
                display_pronunciation_feedback(score, phoneme_data)
                
                # Update user progress
                update_exercise_progress("phoneme", score['overall_score'])

def word_exercises():
    st.markdown("### 📝 Word Exercises")
    st.markdown("Practice pronunciation of complete words.")
    
    # Load exercise data
    try:
        with open('data/exercises.json', 'r') as f:
            exercises = json.load(f)
        word_exercises_data = exercises['word_exercises']
    except FileNotFoundError:
        st.error("Exercise data not found.")
        st.info("💡 Tip: Make sure the data/exercises.json file exists in your project directory.")
        return
    except json.JSONDecodeError:
        st.error("Error reading exercise data. The file may be corrupted.")
        return
    except KeyError:
        st.error("Word exercises data not found in the exercises file.")
        return
    
    # Category selection
    category = st.selectbox(
        "Choose Category:",
        list(word_exercises_data.keys())
    )
    
    words = word_exercises_data[category]
    
    # Word selection
    col1, col2 = st.columns([3, 1])
    
    with col1:
        if 'current_word_index' not in st.session_state:
            st.session_state.current_word_index = 0
        
        current_word = words[st.session_state.current_word_index % len(words)]
        st.markdown(f"### Practice Word: **{current_word['word']}**")
        st.markdown(f"**Meaning:** {current_word['meaning']}")
        st.markdown(f"**Phonetic:** /{current_word['phonetic']}/")
    
    with col2:
        if st.button("⏭️ Next Word"):
            st.session_state.current_word_index += 1
            st.rerun()
    
    # Demonstration
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🔊 Listen to Correct Pronunciation"):
            st.info(f"🔊 Playing: {current_word['word']}")
            st.audio(data=generate_demo_audio(current_word['word']), format="audio/wav")
    
    with col2:
        if st.button("📚 Show Usage Example"):
            st.success(f"**Example:** {current_word['example_sentence']}")
    
    # Recording and analysis
    st.markdown("---")
    st.markdown("#### 🎤 Record Your Pronunciation")
    
    audio_bytes = audio_recorder(
        text=f"Say: {current_word['word']}",
        recording_color="#FF6B6B",
        neutral_color="#E6E6FA"
    )
    
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        
        if st.button("🎯 Check My Pronunciation"):
            with st.spinner("Analyzing..."):
                time.sleep(2)
                
                score = st.session_state.scoring_engine.analyze_word(
                    audio_bytes, current_word['word']
                )
                
                display_word_feedback(score, current_word)
                update_exercise_progress("word", score['overall_score'])

def sentence_exercises():
    st.markdown("### 📖 Sentence Repetition")
    st.markdown("Practice fluency with complete sentences.")
    
    # Sample sentences by difficulty
    sentences = {
        "Easy": [
            {"text": "The cat sat on the mat.", "focus": "Simple consonants and vowels"},
            {"text": "I like to eat apples.", "focus": "Clear articulation"},
            {"text": "The sun is bright today.", "focus": "Rhythm and flow"}
        ],
        "Medium": [
            {"text": "She sells seashells by the seashore.", "focus": "S and SH sounds"},
            {"text": "Peter Piper picked a peck of pickled peppers.", "focus": "P sound repetition"},
            {"text": "How much wood would a woodchuck chuck?", "focus": "W and CH sounds"}
        ],
        "Hard": [
            {"text": "The sixth sick sheik's sixth sheep's sick.", "focus": "Complex consonant clusters"},
            {"text": "Red leather, yellow leather, red leather, yellow leather.", "focus": "L and R distinction"},
            {"text": "Unique New York, unique New York, you know you need unique New York.", "focus": "Multiple challenging sounds"}
        ]
    }
    
    difficulty = st.selectbox("Choose Difficulty:", list(sentences.keys()))
    sentence_list = sentences[difficulty]
    
    # Sentence selection
    if 'sentence_index' not in st.session_state:
        st.session_state.sentence_index = 0
    
    current_sentence = sentence_list[st.session_state.sentence_index % len(sentence_list)]
    
    col1, col2 = st.columns([4, 1])
    
    with col1:
        st.markdown(f"### Practice Sentence:")
        st.markdown(f"**{current_sentence['text']}**")
        st.info(f"**Focus:** {current_sentence['focus']}")
    
    with col2:
        if st.button("🔄 New Sentence"):
            st.session_state.sentence_index += 1
            st.rerun()
    
    # Practice section
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🎵 Listen to Example"):
            st.info("🔊 Playing sentence...")
            st.audio(data=generate_demo_audio(current_sentence['text']), format="audio/wav")
    
    with col2:
        if st.button("💡 Show Tips"):
            tips = [
                "Speak slowly and clearly",
                "Pay attention to word boundaries",
                "Focus on the highlighted sounds",
                "Take breaks between words if needed"
            ]
            for tip in tips:
                st.markdown(f"• {tip}")
    
    # Recording
    st.markdown("---")
    audio_bytes = audio_recorder(
        text="Record the sentence above",
        recording_color="#FF6B6B",
        neutral_color="#E6E6FA"
    )
    
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        
        if st.button("📈 Analyze Fluency"):
            with st.spinner("Analyzing fluency and clarity..."):
                time.sleep(3)
                
                score = st.session_state.scoring_engine.analyze_sentence(
                    audio_bytes, current_sentence['text']
                )
                
                display_sentence_feedback(score, current_sentence)
                update_exercise_progress("sentence", score['overall_score'])

def conversation_exercises():
    st.markdown("### 💬 Conversation Practice")
    st.markdown("Practice real-world conversational scenarios.")
    
    scenarios = [
        {
            "name": "Ordering at a Restaurant",
            "role": "Customer",
            "prompts": [
                "Good evening! What would you like to order?",
                "Would you like anything to drink?",
                "How would you like your steak cooked?"
            ],
            "responses": [
                "I'd like the grilled salmon, please.",
                "Could I have a glass of water?",
                "Medium rare, please."
            ]
        },
        {
            "name": "Job Interview",
            "role": "Candidate",
            "prompts": [
                "Tell me about yourself.",
                "What are your strengths?",
                "Why do you want this job?"
            ],
            "responses": [
                "I'm a dedicated professional with 5 years of experience...",
                "I'm detail-oriented and work well in teams...",
                "I'm excited about this opportunity because..."
            ]
        }
    ]
    
    scenario = st.selectbox("Choose Scenario:", [s['name'] for s in scenarios])
    selected_scenario = next(s for s in scenarios if s['name'] == scenario)
    
    st.markdown(f"### Scenario: {scenario}")
    st.markdown(f"**Your Role:** {selected_scenario['role']}")
    
    # Conversation practice
    if 'conversation_step' not in st.session_state:
        st.session_state.conversation_step = 0
    
    step = st.session_state.conversation_step % len(selected_scenario['prompts'])
    
    # Display current prompt
    st.markdown("#### 🤖 AI Assistant says:")
    st.info(selected_scenario['prompts'][step])
    
    # Show suggested response
    with st.expander("💡 Suggested Response"):
        st.markdown(selected_scenario['responses'][step])
    
    # Recording
    audio_bytes = audio_recorder(
        text="Record your response",
        recording_color="#FF6B6B",
        neutral_color="#E6E6FA"
    )
    
    if audio_bytes:
        st.audio(audio_bytes, format="audio/wav")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("📊 Analyze Response"):
                with st.spinner("Analyzing conversational skills..."):
                    time.sleep(2)
                    
                    score = st.session_state.scoring_engine.analyze_conversation(
                        audio_bytes, selected_scenario['responses'][step]
                    )
                    
                    display_conversation_feedback(score)
                    update_exercise_progress("conversation", score['overall_score'])
        
        with col2:
            if st.button("⏭️ Next Question"):
                st.session_state.conversation_step += 1
                st.rerun()

def tongue_twister_exercises():
    st.markdown("### 🌪️ Tongue Twisters")
    st.markdown("Challenge yourself with fun tongue twisters!")
    
    twisters = [
        {
            "text": "She sells seashells by the seashore",
            "difficulty": "Easy",
            "focus": "S and SH sounds",
            "tip": "Start slowly, focus on the 'S' and 'SH' distinction"
        },
        {
            "text": "Red leather, yellow leather",
            "difficulty": "Medium",
            "focus": "L and R sounds",
            "tip": "Pay attention to tongue position for L and R"
        },
        {
            "text": "The sixth sick sheik's sixth sheep's sick",
            "difficulty": "Hard",
            "focus": "Complex consonants",
            "tip": "Break it down word by word first"
        }
    ]
    
    difficulty_filter = st.selectbox("Filter by Difficulty:", ["All", "Easy", "Medium", "Hard"])
    
    if difficulty_filter != "All":
        filtered_twisters = [t for t in twisters if t['difficulty'] == difficulty_filter]
    else:
        filtered_twisters = twisters
    
    for i, twister in enumerate(filtered_twisters):
        with st.expander(f"{twister['difficulty']}: {twister['text'][:30]}..."):
            st.markdown(f"**Tongue Twister:** {twister['text']}")
            st.markdown(f"**Focus:** {twister['focus']}")
            st.markdown(f"**Tip:** {twister['tip']}")
            
            col1, col2 = st.columns(2)
            
            with col1:
                if st.button(f"🔊 Listen", key=f"listen_{i}"):
                    st.info("🔊 Playing...")
                    st.audio(data=generate_demo_audio(twister['text']), format="audio/wav")
            
            with col2:
                audio_bytes = audio_recorder(
                    text="Try it!",
                    key=f"record_{i}",
                    recording_color="#FF6B6B",
                    neutral_color="#E6E6FA"
                )
                
                if audio_bytes:
                    if st.button(f"🎯 Check", key=f"check_{i}"):
                        with st.spinner("Analyzing..."):
                            time.sleep(2)
                            
                            score = st.session_state.scoring_engine.analyze_tongue_twister(
                                audio_bytes, twister['text']
                            )
                            
                            st.markdown(f"**Score:** {score['overall_score']}/100")
                            st.markdown(f"**Speed:** {score['speed_score']}/100")
                            st.markdown(f"**Clarity:** {score['clarity_score']}/100")
                            
                            if score['overall_score'] >= 80:
                                st.success("🎉 Excellent! You nailed it!")
                            elif score['overall_score'] >= 60:
                                st.info("👍 Good job! Keep practicing for perfection.")
                            else:
                                st.warning("💪 Keep practicing! Try speaking more slowly.")

def display_pronunciation_feedback(score, phoneme_data):
    """Display detailed feedback for phoneme pronunciation"""
    st.markdown("### 📊 Pronunciation Analysis")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Overall Score", f"{score['overall_score']}/100", 
                 delta=f"+{score['improvement']}" if score['improvement'] > 0 else str(score['improvement']))
    
    with col2:
        st.metric("Accuracy", f"{score['accuracy_score']}/100")
    
    with col3:
        st.metric("Clarity", f"{score['clarity_score']}/100")
    
    # Detailed feedback
    if score['overall_score'] >= 85:
        st.success("🎉 Excellent pronunciation! You've mastered this phoneme!")
        st.balloons()
    elif score['overall_score'] >= 70:
        st.info("👍 Good job! Here are some tips to improve further:")
        for tip in score['improvement_tips']:
            st.markdown(f"• {tip}")
    else:
        st.warning("💪 Keep practicing! Here's how to improve:")
        for tip in score['improvement_tips']:
            st.markdown(f"• {tip}")
        
        # Show tongue position help
        st.markdown("**Tongue Position Guide:**")
        for tip in phoneme_data['tips']:
            st.markdown(f"• {tip}")

def display_word_feedback(score, word_data):
    """Display feedback for word pronunciation"""
    st.markdown("### 📊 Word Analysis")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Overall", f"{score['overall_score']}/100")
    
    with col2:
        st.metric("Accuracy", f"{score['accuracy_score']}/100")
    
    with col3:
        st.metric("Stress Pattern", f"{score['stress_score']}/100")
    
    with col4:
        st.metric("Vowel Clarity", f"{score['vowel_score']}/100")
    
    # Feedback based on score
    if score['overall_score'] >= 85:
        st.success("🌟 Perfect! Your pronunciation is excellent!")
        st.session_state.user_data['total_points'] += 15
    elif score['overall_score'] >= 70:
        st.info("✨ Good pronunciation! Small improvements noted:")
        for tip in score['improvement_tips']:
            st.markdown(f"• {tip}")
        st.session_state.user_data['total_points'] += 10
    else:
        st.warning("🎯 Areas for improvement:")
        for tip in score['improvement_tips']:
            st.markdown(f"• {tip}")
        st.session_state.user_data['total_points'] += 5

def display_sentence_feedback(score, sentence_data):
    """Display feedback for sentence fluency"""
    st.markdown("### 📊 Fluency Analysis")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Overall Fluency", f"{score['overall_score']}/100")
    
    with col2:
        st.metric("Rhythm", f"{score['rhythm_score']}/100")
    
    with col3:
        st.metric("Pace", f"{score['pace_score']}/100")
    
    with col4:
        st.metric("Expression", f"{score['expression_score']}/100")
    
    # Detailed feedback
    st.markdown("#### Feedback:")
    for feedback in score['detailed_feedback']:
        st.markdown(f"• {feedback}")

def display_conversation_feedback(score):
    """Display feedback for conversation practice"""
    st.markdown("### 📊 Conversation Analysis")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Overall", f"{score['overall_score']}/100")
    
    with col2:
        st.metric("Confidence", f"{score['confidence_score']}/100")
    
    with col3:
        st.metric("Clarity", f"{score['clarity_score']}/100")
    
    with col4:
        st.metric("Naturalness", f"{score['naturalness_score']}/100")
    
    # Conversation-specific feedback
    st.markdown("#### Communication Assessment:")
    for aspect, rating in score['communication_aspects'].items():
        emoji = "🟢" if rating >= 80 else "🟡" if rating >= 60 else "🔴"
        st.markdown(f"{emoji} **{aspect}:** {rating}/100")

def update_exercise_progress(exercise_type, score):
    """Update user progress after completing an exercise"""
    st.session_state.user_data['exercises_completed'] += 1
    
    # Add points based on score
    points_earned = max(5, int(score / 10))
    st.session_state.user_data['total_points'] += points_earned
    
    # Update session history
    today = str(datetime.now().date())
    session_data = {
        'date': today,
        'exercise_type': exercise_type,
        'score': score,
        'points_earned': points_earned
    }
    
    st.session_state.user_data['session_history'].append(session_data)
    
    # Update streak
    update_user_streak(today)
    
    # Show earned points and streak info
    st.success(f"🎉 You earned {points_earned} points! Total: {st.session_state.user_data['total_points']}")
    
    # Show streak update if applicable
    if st.session_state.user_data['streak_days'] > 0:
        st.info(f"🔥 Current streak: {st.session_state.user_data['streak_days']} days!")
    
    # Show practice summary
    show_practice_summary(exercise_type, score, points_earned)

def update_user_streak(today_date):
    """Update user's daily streak based on exercise completion"""
    if not st.session_state.user_data['session_history']:
        return
    
    # Get unique dates from session history
    session_dates = set()
    for session in st.session_state.user_data['session_history']:
        if session.get('date'):
            session_dates.add(session['date'])
    
    # Sort dates and check for consecutive days
    sorted_dates = sorted(session_dates)
    current_streak = 0
    
    # Check if today is in the list
    if today_date in sorted_dates:
        # Count consecutive days backwards from today
        current_date = datetime.strptime(today_date, '%Y-%m-%d').date()
        for i in range(len(sorted_dates)):
            check_date = datetime.strptime(sorted_dates[-(i+1)], '%Y-%m-%d').date()
            if check_date == current_date - timedelta(days=i):
                current_streak += 1
            else:
                break
    
    st.session_state.user_data['streak_days'] = current_streak

def show_exercise_recommendations():
    """Show personalized exercise recommendations based on user performance"""
    if not st.session_state.user_data['session_history']:
        return
    
    st.markdown("### 💡 Personalized Recommendations")
    
    # Analyze recent performance
    recent_sessions = st.session_state.user_data['session_history'][-10:]
    if not recent_sessions:
        return
    
    # Calculate performance by exercise type
    exercise_performance = {}
    for session in recent_sessions:
        ex_type = session.get('exercise_type', 'unknown')
        score = session.get('score', 0)
        if ex_type not in exercise_performance:
            exercise_performance[ex_type] = []
        exercise_performance[ex_type].append(score)
    
    # Find areas for improvement
    improvement_areas = []
    for ex_type, scores in exercise_performance.items():
        if scores:
            avg_score = sum(scores) / len(scores)
            if avg_score < 75:
                improvement_areas.append((ex_type, avg_score))
    
    # Sort by lowest scores first
    improvement_areas.sort(key=lambda x: x[1])
    
    if improvement_areas:
        st.info("🎯 **Focus on improving these areas:**")
        for ex_type, avg_score in improvement_areas[:3]:  # Show top 3
            st.markdown(f"• **{ex_type.title()}**: Current average {int(avg_score)}%")
        
        # Show specific recommendations
        if improvement_areas[0][0] == 'phoneme':
            st.markdown("💡 **Tip:** Start with basic phoneme practice to build a strong foundation")
        elif improvement_areas[0][0] == 'word':
            st.markdown("💡 **Tip:** Focus on word stress patterns and clear pronunciation")
        elif improvement_areas[0][0] == 'sentence':
            st.markdown("💡 **Tip:** Practice sentence rhythm and natural flow")
        elif improvement_areas[0][0] == 'conversation':
            st.markdown("💡 **Tip:** Work on conversational confidence and clarity")
    
    # Show progress trends
    if len(recent_sessions) >= 5:
        recent_scores = [s.get('score', 0) for s in recent_sessions[-5:]]
        if recent_scores:
            trend = "improving" if recent_scores[-1] > recent_scores[0] else "declining" if recent_scores[-1] < recent_scores[0] else "stable"
            trend_emoji = "📈" if trend == "improving" else "📉" if trend == "declining" else "➡️"
            st.success(f"{trend_emoji} **Your performance is {trend}** over the last 5 exercises")
    
    st.markdown("---")

def show_practice_summary(exercise_type, score, points_earned):
    """Show a summary of the practice session and next steps"""
    st.markdown("### 📋 Practice Summary")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**Session Details:**")
        st.markdown(f"• Exercise Type: {exercise_type.title()}")
        st.markdown(f"• Score: {score}/100")
        st.markdown(f"• Points Earned: {points_earned}")
        st.markdown(f"• Total Points: {st.session_state.user_data['total_points']}")
    
    with col2:
        st.markdown("**Progress Update:**")
        st.markdown(f"• Exercises Completed: {st.session_state.user_data['exercises_completed']}")
        st.markdown(f"• Current Streak: {st.session_state.user_data['streak_days']} days")
        
        # Show next milestone
        next_milestone = 5
        if st.session_state.user_data['exercises_completed'] >= 5:
            next_milestone = 10
        if st.session_state.user_data['exercises_completed'] >= 10:
            next_milestone = 25
        if st.session_state.user_data['exercises_completed'] >= 25:
            next_milestone = 50
        
        remaining = next_milestone - st.session_state.user_data['exercises_completed']
        if remaining > 0:
            st.markdown(f"• Next Milestone: {remaining} more exercises")
    
    # Show motivational message based on performance
    if score >= 90:
        st.success("🌟 **Excellent work!** You're mastering this exercise type!")
    elif score >= 80:
        st.info("✨ **Great job!** Keep practicing to reach excellence!")
    elif score >= 70:
        st.warning("💪 **Good effort!** Focus on the areas for improvement.")
    else:
        st.info("🎯 **Keep practicing!** Every attempt makes you better.")
    
    # Suggest next exercise
    st.markdown("### 🚀 What's Next?")
    if score < 75:
        st.markdown("**Recommendation:** Practice the same exercise type to improve your score")
    else:
        st.markdown("**Recommendation:** Try a more challenging exercise or move to the next level")
    
    st.markdown("---")

def show_practice_timer():
    """Show a practice timer to help users track their session time"""
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        st.markdown("### ⏱️ Practice Timer")
    
    with col2:
        if 'timer_running' not in st.session_state:
            st.session_state.timer_running = False
            st.session_state.timer_start = None
            st.session_state.timer_elapsed = 0
    
        if st.button("▶️ Start Timer" if not st.session_state.timer_running else "⏸️ Pause Timer"):
            if not st.session_state.timer_running:
                st.session_state.timer_running = True
                st.session_state.timer_start = datetime.now()
            else:
                st.session_state.timer_running = False
                st.session_state.timer_elapsed += (datetime.now() - st.session_state.timer_start).total_seconds()
    
    with col3:
        if st.button("🔄 Reset Timer"):
            st.session_state.timer_running = False
            st.session_state.timer_start = None
            st.session_state.timer_elapsed = 0
    
    # Display timer
    if st.session_state.timer_running:
        current_elapsed = st.session_state.timer_elapsed + (datetime.now() - st.session_state.timer_start).total_seconds()
    else:
        current_elapsed = st.session_state.timer_elapsed
    
    minutes = int(current_elapsed // 60)
    seconds = int(current_elapsed % 60)
    
    st.markdown(f"**Time: {minutes:02d}:{seconds:02d}**")
    
    # Show progress towards daily goal
    if st.session_state.user_data.get('daily_goal'):
        goal_minutes = st.session_state.user_data['daily_goal']
        progress_percent = min(100, (minutes / goal_minutes) * 100)
        
        st.markdown(f"**Daily Goal Progress:** {minutes}/{goal_minutes} minutes ({progress_percent:.1f}%)")
        
        # Progress bar
        st.progress(progress_percent / 100)
    
    st.markdown("---")

def generate_demo_audio(text):
    """Generate placeholder audio data (in real implementation, use TTS)"""
    # This is a placeholder - in real implementation, use text-to-speech
    # For now, generate a more realistic audio waveform
    
    # Generate a simple sine wave as placeholder
    sample_rate = 44100
    duration = max(0.5, len(text) * 0.15)  # Minimum 0.5s, scale with text length
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create a more natural speech-like waveform with multiple frequencies
    base_frequency = 220  # A3 note (more natural speech frequency)
    audio_data = np.sin(2 * np.pi * base_frequency * t)
    
    # Add harmonics for more realistic sound
    audio_data += 0.3 * np.sin(2 * np.pi * base_frequency * 2 * t)
    audio_data += 0.1 * np.sin(2 * np.pi * base_frequency * 3 * t)
    
    # Add some variation to simulate natural speech
    envelope = np.exp(-t / duration)  # Fade out
    audio_data *= envelope
    
    # Normalize and convert to 16-bit PCM
    audio_data = np.int16(audio_data * 16384)  # Scale to 16-bit range
    
    return audio_data.tobytes()

if __name__ == "__main__":
    main()
