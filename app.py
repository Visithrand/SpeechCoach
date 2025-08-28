import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json
import os
from utils.data_manager import DataManager
from utils.scoring_engine import ScoringEngine

# Initialize session state
if 'user_data' not in st.session_state:
    st.session_state.user_data = {
        'total_points': 0,
        'streak_days': 0,
        'exercises_completed': 0,
        'last_session': None,
        'daily_goal': 15,  # minutes
        'weekly_goal': 105,  # minutes
        'session_history': [],
        'achievements': []
    }

if 'data_manager' not in st.session_state:
    st.session_state.data_manager = DataManager()

if 'scoring_engine' not in st.session_state:
    st.session_state.scoring_engine = ScoringEngine()

# Auto-save user data periodically
if 'last_save_time' not in st.session_state:
    st.session_state.last_save_time = datetime.now()

# Load existing user data if available
if 'data_loaded' not in st.session_state:
    try:
        saved_progress = st.session_state.data_manager.load_progress_data()
        saved_sessions = st.session_state.data_manager.load_session_history()
        
        # Update session state with saved data
        if saved_progress:
            st.session_state.user_data.update({
                'total_points': saved_progress.get('total_points', 0),
                'streak_days': saved_progress.get('streak_days', 0),
                'exercises_completed': saved_progress.get('exercises_completed', 0),
                'daily_goal': saved_progress.get('daily_goal', 15),
                'weekly_goal': saved_progress.get('weekly_goal', 105)
            })
        
        if saved_sessions and 'sessions' in saved_sessions:
            st.session_state.user_data['session_history'] = saved_sessions['sessions']
        
        st.session_state.data_loaded = True
    except Exception as e:
        st.warning(f"Could not load saved data: {str(e)}")
        st.session_state.data_loaded = True

# Save every 5 minutes or when significant changes occur
if (datetime.now() - st.session_state.last_save_time).seconds > 300:  # 5 minutes
    st.session_state.data_manager.auto_save_user_data(st.session_state.user_data)
    st.session_state.last_save_time = datetime.now()

def main():
    st.set_page_config(
        page_title="AI Speech Therapy Assistant",
        page_icon="🗣️",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Custom CSS for better styling
    st.markdown("""
    <style>
    .main-header {
        text-align: center;
        color: #FF6B6B;
        margin-bottom: 2rem;
    }
    .metric-container {
        background-color: #F0F8FF;
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem;
    }
    .achievement-badge {
        display: inline-block;
        background-color: #FFD700;
        color: #333;
        padding: 0.25rem 0.5rem;
        border-radius: 15px;
        margin: 0.25rem;
        font-size: 0.8rem;
    }
    .exercise-card {
        border: 2px solid #E6E6FA;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
        background-color: #FAFAFA;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Sidebar navigation
    with st.sidebar:
        st.title("🗣️ Speech Therapy")
        
        # User stats sidebar
        st.markdown("### Your Progress")
        st.metric("Total Points", st.session_state.user_data['total_points'])
        st.metric("Current Streak", f"{st.session_state.user_data['streak_days']} days")
        st.metric("Exercises Completed", st.session_state.user_data['exercises_completed'])
        
        # Show today's progress
        today = datetime.now().date()
        today_sessions = [s for s in st.session_state.user_data['session_history'] 
                         if s.get('date') == str(today)]
        today_minutes = len(today_sessions) * 5
        
        st.markdown("---")
        st.markdown("### Today's Activity")
        st.metric("Minutes Practiced", today_minutes, f"{today_minutes}/{st.session_state.user_data['daily_goal']}")
        
        # Show recent achievements
        if st.session_state.user_data['session_history']:
            recent_scores = [s.get('score', 0) for s in st.session_state.user_data['session_history'][-3:]]
            if recent_scores:
                avg_score = sum(recent_scores) / len(recent_scores)
                st.metric("Recent Avg Score", f"{int(avg_score)}%")
        
        # Navigation
        st.markdown("---")
        page = st.selectbox(
            "Navigate to:",
            ["Dashboard", "Speech Exercises", "Progress Tracking", "Settings"]
        )
    
    # Main content based on navigation
    if page == "Dashboard":
        show_dashboard()
    elif page == "Speech Exercises":
        show_exercises()
    elif page == "Progress Tracking":
        show_progress()
    elif page == "Settings":
        show_settings()

def show_dashboard():
    st.markdown("<h1 class='main-header'>Welcome to Your Speech Therapy Journey! 🎯</h1>", unsafe_allow_html=True)
    
    # Daily progress section
    col1, col2, col3, col4 = st.columns(4)
    
    # Calculate actual progress from session history
    today = datetime.now().date()
    today_sessions = [s for s in st.session_state.user_data['session_history'] 
                     if s.get('date') == str(today)]
    
    today_minutes = len(today_sessions) * 5  # Assume 5 minutes per exercise
    today_accuracy = max([s.get('score', 0) for s in today_sessions], default=0)
    
    # Calculate weekly progress
    week_start = today - timedelta(days=today.weekday())
    week_sessions = [s for s in st.session_state.user_data['session_history'] 
                    if s.get('date') and datetime.strptime(s['date'], '%Y-%m-%d').date() >= week_start]
    week_minutes = len(week_sessions) * 5
    
    # Calculate accuracy improvement
    last_week_start = week_start - timedelta(days=7)
    last_week_sessions = [s for s in st.session_state.user_data['session_history'] 
                         if s.get('date') and datetime.strptime(s['date'], '%Y-%m-%d').date() >= last_week_start 
                         and datetime.strptime(s['date'], '%Y-%m-%d').date() < week_start]
    
    current_avg = sum([s.get('score', 0) for s in week_sessions]) / max(len(week_sessions), 1)
    last_avg = sum([s.get('score', 0) for s in last_week_sessions]) / max(len(last_week_sessions), 1)
    accuracy_change = current_avg - last_avg
    
    with col1:
        progress_percent = min(100, (today_minutes / st.session_state.user_data['daily_goal']) * 100)
        st.markdown(f"""
        <div class='metric-container'>
        <h3>Today's Goal</h3>
        <p>{st.session_state.user_data['daily_goal']} minutes practice</p>
        <div style='background-color: #FF6B6B; height: 10px; border-radius: 5px; width: {progress_percent}%;'></div>
        <small>{today_minutes} minutes completed</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        week_progress_percent = min(100, (week_minutes / st.session_state.user_data['weekly_goal']) * 100)
        st.markdown(f"""
        <div class='metric-container'>
        <h3>Weekly Progress</h3>
        <p>{st.session_state.user_data['weekly_goal']} minutes goal</p>
        <div style='background-color: #4CAF50; height: 10px; border-radius: 5px; width: {week_progress_percent}%;'></div>
        <small>{week_minutes} minutes this week</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        change_symbol = "↑" if accuracy_change > 0 else "↓" if accuracy_change < 0 else "→"
        change_color = "#4CAF50" if accuracy_change > 0 else "#FF6B6B" if accuracy_change < 0 else "#666"
        st.markdown(f"""
        <div class='metric-container'>
        <h3>Accuracy Score</h3>
        <p style='font-size: 2rem; color: #FF6B6B; margin: 0;'>{int(current_avg)}%</p>
        <small style='color: {change_color};'>{change_symbol} {abs(int(accuracy_change))}% from last week</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        confidence_level = "Excellent" if current_avg >= 90 else "Good" if current_avg >= 75 else "Fair" if current_avg >= 60 else "Needs Practice"
        confidence_color = "#4CAF50" if current_avg >= 75 else "#FF9800" if current_avg >= 60 else "#FF6B6B"
        st.markdown(f"""
        <div class='metric-container'>
        <h3>Confidence Level</h3>
        <p style='font-size: 2rem; color: {confidence_color}; margin: 0;'>{confidence_level}</p>
        <small>Keep practicing!</small>
        </div>
        """, unsafe_allow_html=True)
    
    # Daily practice reminder
    show_daily_reminder()
    
    # Quick actions
    st.markdown("### Quick Start 🚀")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("🔤 Phoneme Practice", use_container_width=True):
            st.session_state.selected_exercise = "phoneme"
            st.switch_page("pages/exercises.py")
    
    with col2:
        if st.button("📝 Word Exercises", use_container_width=True):
            st.session_state.selected_exercise = "word"
            st.switch_page("pages/exercises.py")
    
    with col3:
        if st.button("💬 Conversation Practice", use_container_width=True):
            st.session_state.selected_exercise = "conversation"
            st.switch_page("pages/exercises.py")
    
    # Recent achievements
    st.markdown("### Recent Achievements 🏆")
    
    # Generate achievements based on actual user data
    achievements = []
    
    # Check for exercise completion achievements
    if st.session_state.user_data['exercises_completed'] >= 5:
        achievements.append("🎯 Completed 5 exercises")
    if st.session_state.user_data['exercises_completed'] >= 10:
        achievements.append("🎯 Completed 10 exercises")
    if st.session_state.user_data['exercises_completed'] >= 25:
        achievements.append("🎯 Completed 25 exercises")
    
    # Check for streak achievements
    if st.session_state.user_data['streak_days'] >= 3:
        achievements.append("🔥 3-day streak")
    if st.session_state.user_data['streak_days'] >= 7:
        achievements.append("🔥 7-day streak")
    if st.session_state.user_data['streak_days'] >= 14:
        achievements.append("🔥 14-day streak")
    
    # Check for score improvement achievements
    if st.session_state.user_data['session_history']:
        recent_scores = [s.get('score', 0) for s in st.session_state.user_data['session_history'][-5:]]
        if len(recent_scores) >= 3 and all(score >= 80 for score in recent_scores[-3:]):
            achievements.append("📈 High accuracy streak")
    
    # Check for points achievements
    if st.session_state.user_data['total_points'] >= 100:
        achievements.append("⭐ 100 points milestone")
    if st.session_state.user_data['total_points'] >= 500:
        achievements.append("⭐ 500 points milestone")
    
    # If no achievements yet, show motivational messages
    if not achievements:
        achievements = [
            "🎯 Complete your first exercise",
            "🔥 Start your practice streak",
            "📈 Improve your pronunciation",
            "💪 Keep practicing daily"
        ]
    
    # Display achievements with animations
    for i, achievement in enumerate(achievements[:6]):  # Show max 6 achievements
        st.markdown(f"<span class='achievement-badge'>{achievement}</span>", unsafe_allow_html=True)
    
    # Progress visualization
    st.markdown("### Weekly Progress Chart 📊")
    
    # Get actual user data if available, otherwise use mock data
    if st.session_state.user_data['session_history']:
        # Calculate weekly progress from actual data
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        practice_time = [0] * 7
        accuracy_scores = [0] * 7
        
        for session in st.session_state.user_data['session_history']:
            if session['date']:
                try:
                    session_date = datetime.strptime(session['date'], '%Y-%m-%d').date()
                    if week_start <= session_date <= today:
                        day_index = session_date.weekday()
                        practice_time[day_index] += 5  # Assume 5 minutes per exercise
                        accuracy_scores[day_index] = max(accuracy_scores[day_index], session['score'])
                except:
                    pass
    else:
        # Mock data for demonstration
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        practice_time = [12, 18, 15, 20, 16, 0, 8]
        accuracy_scores = [82, 85, 83, 88, 87, 0, 84]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=days, y=practice_time, mode='lines+markers', name='Practice Time (min)', line=dict(color='#FF6B6B')))
    fig.add_trace(go.Scatter(x=days, y=accuracy_scores, mode='lines+markers', name='Accuracy Score (%)', yaxis='y2', line=dict(color='#4CAF50')))
    
    fig.update_layout(
        title='Weekly Practice Overview',
        xaxis_title='Day',
        yaxis_title='Practice Time (minutes)',
        yaxis2=dict(title='Accuracy Score (%)', overlaying='y', side='right'),
        height=400
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Exercise recommendations based on performance
    st.markdown("### 💡 Recommended Exercises")
    
    if st.session_state.user_data['session_history']:
        # Analyze recent performance to suggest exercises
        recent_sessions = st.session_state.user_data['session_history'][-5:]
        exercise_types = [s.get('exercise_type', '') for s in recent_sessions]
        recent_scores = [s.get('score', 0) for s in recent_sessions]
        
        if recent_scores:
            avg_score = sum(recent_scores) / len(recent_scores)
            
            if avg_score < 70:
                st.info("🎯 **Focus on:** Basic phoneme practice to build a strong foundation")
                st.markdown("• Start with simple sounds like 'ah', 'ee', 'oo'")
                st.markdown("• Practice slowly and focus on accuracy over speed")
            elif avg_score < 85:
                st.info("📈 **Next level:** Word exercises to improve pronunciation clarity")
                st.markdown("• Practice common words with challenging sounds")
                st.markdown("• Focus on stress patterns and intonation")
            else:
                st.info("🚀 **Advanced:** Sentence fluency and conversation practice")
                st.markdown("• Work on natural speech rhythm and flow")
                st.markdown("• Practice real-world conversational scenarios")
    
    # Motivational section
    st.markdown("### Today's Motivation 💪")
    motivational_quotes = [
        "Great speech comes from great practice! Keep going! 🌟",
        "Every word you practice makes you stronger! 💪",
        "Your voice matters - practice makes it perfect! 🎤",
        "Small steps lead to big improvements! 🚀"
    ]
    
    import random
    daily_quote = random.choice(motivational_quotes)
    st.info(daily_quote)

def show_daily_reminder():
    """Show daily practice reminder and motivation"""
    today = datetime.now().date()
    
    # Check if user has practiced today
    today_sessions = [s for s in st.session_state.user_data['session_history'] 
                     if s.get('date') == str(today)]
    
    if not today_sessions:
        # No practice today - show reminder
        st.warning("📢 **Daily Practice Reminder**")
        st.markdown("You haven't practiced today yet. Remember:")
        st.markdown("• 🎯 **Goal:** {st.session_state.user_data['daily_goal']} minutes of practice")
        st.markdown("• ⏰ **Best time:** Morning or early afternoon")
        st.markdown("• 💪 **Consistency:** Even 5 minutes daily makes a difference!")
        
        # Show streak motivation
        if st.session_state.user_data['streak_days'] > 0:
            st.info(f"🔥 **Don't break your {st.session_state.user_data['streak_days']}-day streak!** Start practicing now.")
        else:
            st.info("🚀 **Start building your practice habit today!**")
    
    else:
        # Has practiced today - show encouragement
        today_minutes = len(today_sessions) * 5
        goal = st.session_state.user_data['daily_goal']
        
        if today_minutes >= goal:
            st.success("🎉 **Daily Goal Achieved!** Great job practicing today!")
        else:
            remaining = goal - today_minutes
            st.info(f"💪 **Keep going!** You're {today_minutes}/{goal} minutes toward your daily goal.")
            st.markdown(f"Just {remaining} more minutes to reach your target!")
    
    st.markdown("---")

def show_exercises():
    """Import and display exercises page"""
    exec(open('pages/exercises.py').read())

def show_progress():
    """Import and display progress page"""
    exec(open('pages/progress.py').read())

def show_settings():
    """Import and display settings page"""
    exec(open('pages/settings.py').read())

if __name__ == "__main__":
    main()
