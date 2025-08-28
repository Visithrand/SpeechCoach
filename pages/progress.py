import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta, date
import json

def main():
    st.title("📈 Progress Tracking")
    st.markdown("Monitor your speech therapy journey and achievements!")
    
    # Overview metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "Total Practice Time", 
            "47h 23m",
            delta="2h 15m this week"
        )
    
    with col2:
        st.metric(
            "Exercises Completed", 
            st.session_state.user_data['exercises_completed'],
            delta="+12 this week"
        )
    
    with col3:
        st.metric(
            "Average Score", 
            "84.5%",
            delta="+3.2%"
        )
    
    with col4:
        st.metric(
            "Current Streak", 
            f"{st.session_state.user_data['streak_days']} days",
            delta="+1"
        )
    
    # Progress tabs
    tab1, tab2, tab3, tab4 = st.tabs(["📊 Overview", "🎯 Goals", "🏆 Achievements", "📋 Detailed Reports"])
    
    with tab1:
        show_overview_charts()
    
    with tab2:
        show_goals_tracking()
    
    with tab3:
        show_achievements()
    
    with tab4:
        show_detailed_reports()

def show_overview_charts():
    """Display overview charts and statistics"""
    st.markdown("### 📊 Progress Overview")
    
    # Weekly progress chart
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Weekly Practice Time")
        
        # Mock data for the past 8 weeks
        weeks = [f"Week {i}" for i in range(1, 9)]
        practice_hours = [12, 15, 18, 22, 19, 25, 28, 31]
        
        fig = px.bar(
            x=weeks, 
            y=practice_hours,
            title="Weekly Practice Hours",
            color=practice_hours,
            color_continuous_scale="Blues"
        )
        fig.update_layout(showlegend=False)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("#### Score Progression")
        
        # Mock score data
        dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
        scores = [70 + (i * 0.5) + (5 * np.sin(i/3)) for i in range(30)]
        
        fig = px.line(
            x=dates,
            y=scores,
            title="Daily Average Scores",
            line_shape='spline'
        )
        fig.update_layout(yaxis_range=[60, 100])
        st.plotly_chart(fig, use_container_width=True)
    
    # Practice calendar heatmap
    st.markdown("#### 📅 Practice Calendar")
    
    # Generate practice calendar data
    if st.session_state.user_data['session_history']:
        # Create calendar data for the last 3 months
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=90)
        
        # Create date range
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        
        # Count sessions per day
        calendar_data = []
        for date in date_range:
            date_str = date.strftime('%Y-%m-%d')
            session_count = len([s for s in st.session_state.user_data['session_history'] 
                               if s.get('date') == date_str])
            calendar_data.append({
                'date': date,
                'sessions': session_count,
                'intensity': 'High' if session_count >= 3 else 'Medium' if session_count >= 1 else 'Low'
            })
        
        # Create calendar heatmap
        df_calendar = pd.DataFrame(calendar_data)
        
        if not df_calendar.empty:
            fig = px.density_heatmap(
                df_calendar,
                x=df_calendar['date'].dt.day_name(),
                y=df_calendar['date'].dt.week,
                z=df_calendar['sessions'],
                title="Practice Activity Heatmap (Last 3 Months)",
                color_continuous_scale="Blues",
                labels={'x': 'Day of Week', 'y': 'Week', 'z': 'Sessions'}
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
            
            # Show calendar summary
            col1, col2, col3 = st.columns(3)
            with col1:
                total_practice_days = len([d for d in calendar_data if d['sessions'] > 0])
                st.metric("Practice Days", f"{total_practice_days}/90")
            
            with col2:
                avg_sessions_per_day = sum([d['sessions'] for d in calendar_data if d['sessions'] > 0]) / max(total_practice_days, 1)
                st.metric("Avg Sessions/Day", f"{avg_sessions_per_day:.1f}")
            
            with col3:
                best_day = max(calendar_data, key=lambda x: x['sessions'])
                st.metric("Best Day", f"{best_day['sessions']} sessions")
    
    # Exercise type breakdown
    st.markdown("#### Exercise Type Performance")
    
    exercise_data = {
        'Exercise Type': ['Phonemes', 'Words', 'Sentences', 'Conversations', 'Tongue Twisters'],
        'Completed': [45, 38, 28, 15, 22],
        'Average Score': [87, 84, 79, 82, 75],
        'Time Spent (hours)': [12, 10, 8, 6, 4]
    }
    
    df = pd.DataFrame(exercise_data)
    
    col1, col2 = st.columns(2)
    
    with col1:
        fig = px.pie(
            df, 
            values='Completed', 
            names='Exercise Type',
            title="Exercises Completed by Type"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        fig = px.bar(
            df,
            x='Exercise Type',
            y='Average Score',
            title="Average Scores by Exercise Type",
            color='Average Score',
            color_continuous_scale="RdYlGn"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Heatmap of daily activity
    st.markdown("#### Daily Activity Heatmap")
    
    # Create mock heatmap data
    import numpy as np
    
    # Last 12 weeks of data
    weeks = 12
    days = 7
    activity_data = np.random.randint(0, 60, size=(weeks, days))  # Minutes per day
    
    days_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    week_labels = [f"Week {i+1}" for i in range(weeks)]
    
    fig = go.Figure(data=go.Heatmap(
        z=activity_data,
        x=days_labels,
        y=week_labels,
        colorscale='Blues',
        colorbar=dict(title="Minutes")
    ))
    
    fig.update_layout(
        title="Daily Practice Activity (Last 12 Weeks)",
        xaxis_title="Day of Week",
        yaxis_title="Week"
    )
    
    st.plotly_chart(fig, use_container_width=True)

def show_goals_tracking():
    """Display and manage user goals"""
    st.markdown("### 🎯 Goals & Targets")
    
    # Current goals display
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Daily Goal")
        daily_progress = 9  # minutes completed today
        daily_goal = st.session_state.user_data['daily_goal']
        daily_percentage = min(100, (daily_progress / daily_goal) * 100)
        
        # Progress bar
        st.progress(daily_percentage / 100)
        st.markdown(f"{daily_progress}/{daily_goal} minutes ({daily_percentage:.1f}%)")
        
        if daily_percentage >= 100:
            st.success("🎉 Daily goal achieved!")
        elif daily_percentage >= 75:
            st.info(f"🔥 Almost there! {daily_goal - daily_progress} minutes to go!")
        else:
            st.warning(f"💪 Keep going! {daily_goal - daily_progress} minutes remaining!")
    
    with col2:
        st.markdown("#### Weekly Goal")
        weekly_progress = 47  # minutes this week
        weekly_goal = st.session_state.user_data['weekly_goal']
        weekly_percentage = min(100, (weekly_progress / weekly_goal) * 100)
        
        st.progress(weekly_percentage / 100)
        st.markdown(f"{weekly_progress}/{weekly_goal} minutes ({weekly_percentage:.1f}%)")
        
        if weekly_percentage >= 100:
            st.success("🏆 Weekly goal smashed!")
        elif weekly_percentage >= 75:
            st.info(f"📈 Great progress! {weekly_goal - weekly_progress} minutes to complete!")
        else:
            st.warning(f"⏰ {weekly_goal - weekly_progress} minutes left this week!")
    
    # Goal setting
    st.markdown("---")
    st.markdown("#### Update Your Goals")
    
    col1, col2 = st.columns(2)
    
    with col1:
        new_daily_goal = st.slider(
            "Daily Practice Goal (minutes)",
            min_value=5,
            max_value=60,
            value=st.session_state.user_data['daily_goal'],
            step=5
        )
    
    with col2:
        new_weekly_goal = st.slider(
            "Weekly Practice Goal (minutes)",
            min_value=30,
            max_value=420,
            value=st.session_state.user_data['weekly_goal'],
            step=15
        )
    
    if st.button("💾 Update Goals"):
        st.session_state.user_data['daily_goal'] = new_daily_goal
        st.session_state.user_data['weekly_goal'] = new_weekly_goal
        st.success("Goals updated successfully!")
        st.rerun()
    
    # Streak tracking
    st.markdown("---")
    st.markdown("#### 🔥 Practice Streak")
    
    streak_days = st.session_state.user_data['streak_days']
    
    if streak_days >= 30:
        streak_emoji = "🔥🔥🔥"
        streak_message = "Amazing consistency! You're on fire!"
    elif streak_days >= 14:
        streak_emoji = "🔥🔥"
        streak_message = "Great habit building! Keep it up!"
    elif streak_days >= 7:
        streak_emoji = "🔥"
        streak_message = "One week streak! You're building momentum!"
    elif streak_days >= 3:
        streak_emoji = "⭐"
        streak_message = "Good start! Keep practicing daily!"
    else:
        streak_emoji = "🌱"
        streak_message = "Start your streak today!"
    
    st.markdown(f"## {streak_emoji} {streak_days} Day Streak")
    st.markdown(f"*{streak_message}*")
    
    # Streak calendar visualization
    if streak_days > 0:
        st.markdown("#### Recent Practice Days")
        
        # Create a simple calendar view for the last 30 days
        today = date.today()
        last_30_days = [(today - timedelta(days=i)) for i in range(29, -1, -1)]
        
        # Mock practice data (in real app, load from user data)
        practice_days = set(random.sample(last_30_days, min(streak_days, 30)))
        
        calendar_cols = st.columns(7)
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        
        for i, day_name in enumerate(day_names):
            calendar_cols[i].markdown(f"**{day_name}**")
        
        for i, day in enumerate(last_30_days):
            col_idx = day.weekday()
            is_practice_day = day in practice_days
            
            with calendar_cols[col_idx]:
                if is_practice_day:
                    st.markdown(f"🟢 {day.day}")
                else:
                    st.markdown(f"⚪ {day.day}")

def show_achievements():
    """Display user achievements and badges"""
    st.markdown("### 🏆 Achievements & Badges")
    
    # Define achievement categories
    achievements = {
        "Practice Milestones": [
            {"name": "First Steps", "description": "Complete your first exercise", "earned": True, "icon": "🎯"},
            {"name": "Getting Started", "description": "Complete 10 exercises", "earned": True, "icon": "🌟"},
            {"name": "Dedicated Learner", "description": "Complete 50 exercises", "earned": True, "icon": "📚"},
            {"name": "Speech Master", "description": "Complete 100 exercises", "earned": False, "icon": "👑"}
        ],
        "Streak Achievements": [
            {"name": "3-Day Warrior", "description": "Practice for 3 days straight", "earned": True, "icon": "🔥"},
            {"name": "Week Champion", "description": "Practice for 7 days straight", "earned": True, "icon": "🏆"},
            {"name": "Monthly Hero", "description": "Practice for 30 days straight", "earned": False, "icon": "💪"},
            {"name": "Consistency King", "description": "Practice for 100 days straight", "earned": False, "icon": "👑"}
        ],
        "Score Achievements": [
            {"name": "Good Start", "description": "Score 70+ on any exercise", "earned": True, "icon": "✨"},
            {"name": "Great Progress", "description": "Score 85+ on any exercise", "earned": True, "icon": "⭐"},
            {"name": "Perfect Score", "description": "Score 95+ on any exercise", "earned": False, "icon": "💎"},
            {"name": "Perfectionist", "description": "Score 95+ on 10 exercises", "earned": False, "icon": "🎖️"}
        ],
        "Special Achievements": [
            {"name": "Phoneme Pro", "description": "Master all basic phonemes", "earned": True, "icon": "🔤"},
            {"name": "Word Wizard", "description": "Complete 100 word exercises", "earned": False, "icon": "📝"},
            {"name": "Conversation King", "description": "Complete 20 conversation exercises", "earned": False, "icon": "💬"},
            {"name": "Tongue Twister Titan", "description": "Master 10 tongue twisters", "earned": False, "icon": "🌪️"}
        ]
    }
    
    # Display achievements by category
    for category, category_achievements in achievements.items():
        st.markdown(f"#### {category}")
        
        cols = st.columns(2)
        for i, achievement in enumerate(category_achievements):
            col = cols[i % 2]
            
            with col:
                if achievement["earned"]:
                    # Earned achievement
                    st.success(f"""
                    {achievement['icon']} **{achievement['name']}**  
                    {achievement['description']}  
                    ✅ *Earned*
                    """)
                else:
                    # Not yet earned
                    st.info(f"""
                    {achievement['icon']} **{achievement['name']}**  
                    {achievement['description']}  
                    🔒 *Locked*
                    """)
    
    # Achievement progress summary
    st.markdown("---")
    st.markdown("#### Achievement Progress")
    
    total_achievements = sum(len(cat) for cat in achievements.values())
    earned_achievements = sum(sum(1 for ach in cat if ach["earned"]) for cat in achievements.values())
    
    progress_percentage = (earned_achievements / total_achievements) * 100
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Achievements Earned", f"{earned_achievements}/{total_achievements}")
    
    with col2:
        st.metric("Completion Rate", f"{progress_percentage:.1f}%")
    
    with col3:
        st.metric("Points Earned", st.session_state.user_data['total_points'])
    
    # Progress bar
    st.progress(progress_percentage / 100)
    
    # Next achievement to unlock
    next_achievement = None
    for category_achievements in achievements.values():
        for achievement in category_achievements:
            if not achievement["earned"]:
                next_achievement = achievement
                break
        if next_achievement:
            break
    
    if next_achievement:
        st.markdown("#### 🎯 Next Achievement to Unlock")
        st.info(f"{next_achievement['icon']} **{next_achievement['name']}** - {next_achievement['description']}")

def show_detailed_reports():
    """Show detailed progress reports"""
    st.markdown("### 📋 Detailed Reports")
    
    # Date range selector
    col1, col2 = st.columns(2)
    
    with col1:
        start_date = st.date_input(
            "Start Date",
            value=date.today() - timedelta(days=30),
            max_value=date.today()
        )
    
    with col2:
        end_date = st.date_input(
            "End Date",
            value=date.today(),
            max_value=date.today()
        )
    
    if start_date > end_date:
        st.error("Start date must be before end date!")
        return
    
    # Report type selector
    report_type = st.selectbox(
        "Report Type:",
        ["Summary Report", "Exercise Breakdown", "Score Analysis", "Time Analysis"]
    )
    
    if report_type == "Summary Report":
        show_summary_report(start_date, end_date)
    elif report_type == "Exercise Breakdown":
        show_exercise_breakdown(start_date, end_date)
    elif report_type == "Score Analysis":
        show_score_analysis(start_date, end_date)
    elif report_type == "Time Analysis":
        show_time_analysis(start_date, end_date)

def show_summary_report(start_date, end_date):
    """Generate and display summary report"""
    st.markdown(f"#### Summary Report ({start_date} to {end_date})")
    
    # Mock report data
    days_in_period = (end_date - start_date).days + 1
    
    report_data = {
        "Total Practice Sessions": 23,
        "Total Practice Time": "8h 45m",
        "Average Session Length": "23 minutes",
        "Exercises Completed": 45,
        "Average Score": "84.2%",
        "Best Score": "97%",
        "Practice Days": 18,
        "Consistency Rate": f"{(18/days_in_period)*100:.1f}%"
    }
    
    # Display metrics in a grid
    cols = st.columns(4)
    metrics = list(report_data.items())
    
    for i, (metric, value) in enumerate(metrics):
        col = cols[i % 4]
        with col:
            st.metric(metric, value)
    
    # Detailed breakdown
    st.markdown("##### Exercise Type Breakdown")
    
    exercise_breakdown = pd.DataFrame({
        'Exercise Type': ['Phonemes', 'Words', 'Sentences', 'Conversations', 'Tongue Twisters'],
        'Sessions': [8, 7, 5, 2, 6],
        'Avg Score': [87, 85, 82, 79, 76],
        'Time Spent': ['2h 15m', '1h 50m', '1h 30m', '1h 10m', '2h 00m']
    })
    
    st.dataframe(exercise_breakdown, use_container_width=True)
    
    # Improvement areas
    st.markdown("##### Areas for Improvement")
    
    improvements = [
        "🎯 Focus more on conversation practice (only 2 sessions this period)",
        "📈 Tongue twister scores could improve (current avg: 76%)",
        "⏰ Consider longer practice sessions for better retention",
        "🔄 Try to maintain daily practice consistency"
    ]
    
    for improvement in improvements:
        st.markdown(improvement)

def show_exercise_breakdown(start_date, end_date):
    """Show detailed exercise breakdown"""
    st.markdown(f"#### Exercise Breakdown ({start_date} to {end_date})")
    
    # Create mock detailed exercise data
    exercise_data = []
    
    # Generate sample data
    exercise_types = ['Phoneme', 'Word', 'Sentence', 'Conversation', 'Tongue Twister']
    
    for i in range(20):  # Last 20 exercises
        exercise_data.append({
            'Date': (end_date - timedelta(days=random.randint(0, (end_date - start_date).days))).strftime('%Y-%m-%d'),
            'Type': random.choice(exercise_types),
            'Exercise': f"Exercise {i+1}",
            'Score': random.randint(70, 98),
            'Duration': f"{random.randint(2, 8)} min",
            'Attempts': random.randint(1, 3)
        })
    
    df = pd.DataFrame(exercise_data)
    df = df.sort_values('Date', ascending=False)
    
    # Display data with filtering
    col1, col2 = st.columns(2)
    
    with col1:
        exercise_filter = st.multiselect(
            "Filter by Exercise Type:",
            exercise_types,
            default=exercise_types
        )
    
    with col2:
        min_score = st.slider("Minimum Score:", 0, 100, 0)
    
    # Apply filters
    filtered_df = df[
        (df['Type'].isin(exercise_filter)) & 
        (df['Score'] >= min_score)
    ]
    
    st.dataframe(filtered_df, use_container_width=True)
    
    # Export option
    if st.button("📥 Export to CSV"):
        csv = filtered_df.to_csv(index=False)
        st.download_button(
            label="Download CSV",
            data=csv,
            file_name=f"exercise_report_{start_date}_to_{end_date}.csv",
            mime="text/csv"
        )

def show_score_analysis(start_date, end_date):
    """Show detailed score analysis"""
    st.markdown(f"#### Score Analysis ({start_date} to {end_date})")
    
    # Mock score data over time
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    scores_data = []
    
    for date in dates:
        if random.random() > 0.3:  # 70% chance of practice on any given day
            scores_data.append({
                'Date': date,
                'Phoneme Score': random.randint(75, 95),
                'Word Score': random.randint(70, 92),
                'Sentence Score': random.randint(65, 88),
                'Conversation Score': random.randint(60, 85),
                'Overall Score': random.randint(70, 90)
            })
    
    if not scores_data:
        st.info("No practice data available for the selected period.")
        return
    
    scores_df = pd.DataFrame(scores_data)
    
    # Score trend chart
    fig = px.line(
        scores_df,
        x='Date',
        y=['Phoneme Score', 'Word Score', 'Sentence Score', 'Conversation Score', 'Overall Score'],
        title="Score Trends Over Time"
    )
    fig.update_layout(yaxis_range=[50, 100])
    st.plotly_chart(fig, use_container_width=True)
    
    # Score distribution
    col1, col2 = st.columns(2)
    
    with col1:
        fig = px.histogram(
            scores_df,
            x='Overall Score',
            title="Score Distribution",
            nbins=10
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Average scores by exercise type
        avg_scores = {
            'Exercise Type': ['Phonemes', 'Words', 'Sentences', 'Conversations'],
            'Average Score': [
                scores_df['Phoneme Score'].mean(),
                scores_df['Word Score'].mean(),
                scores_df['Sentence Score'].mean(),
                scores_df['Conversation Score'].mean()
            ]
        }
        
        avg_df = pd.DataFrame(avg_scores)
        fig = px.bar(
            avg_df,
            x='Exercise Type',
            y='Average Score',
            title="Average Scores by Type",
            color='Average Score',
            color_continuous_scale='RdYlGn'
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Score statistics
    st.markdown("##### Score Statistics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Average Score", f"{scores_df['Overall Score'].mean():.1f}%")
    
    with col2:
        st.metric("Best Score", f"{scores_df['Overall Score'].max()}%")
    
    with col3:
        st.metric("Most Recent", f"{scores_df['Overall Score'].iloc[-1]}%")
    
    with col4:
        improvement = scores_df['Overall Score'].iloc[-5:].mean() - scores_df['Overall Score'].iloc[:5].mean()
        st.metric("Improvement", f"{improvement:+.1f}%")

def show_time_analysis(start_date, end_date):
    """Show detailed time analysis"""
    st.markdown(f"#### Time Analysis ({start_date} to {end_date})")
    
    # Mock time data
    time_data = []
    
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    for date in dates:
        if random.random() > 0.3:  # 70% chance of practice
            practice_time = random.randint(10, 60)  # minutes
            time_data.append({
                'Date': date,
                'Practice Time': practice_time,
                'Sessions': random.randint(1, 3),
                'Day of Week': date.strftime('%A')
            })
    
    if not time_data:
        st.info("No practice data available for the selected period.")
        return
    
    time_df = pd.DataFrame(time_data)
    
    # Daily practice time chart
    fig = px.bar(
        time_df,
        x='Date',
        y='Practice Time',
        title="Daily Practice Time",
        color='Practice Time',
        color_continuous_scale='Blues'
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Practice patterns
    col1, col2 = st.columns(2)
    
    with col1:
        # Practice by day of week
        day_summary = time_df.groupby('Day of Week')['Practice Time'].agg(['mean', 'sum']).reset_index()
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_summary['Day of Week'] = pd.Categorical(day_summary['Day of Week'], categories=day_order, ordered=True)
        day_summary = day_summary.sort_values('Day of Week')
        
        fig = px.bar(
            day_summary,
            x='Day of Week',
            y='mean',
            title="Average Practice Time by Day"
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Session length distribution
        fig = px.histogram(
            time_df,
            x='Practice Time',
            title="Session Length Distribution",
            nbins=10
        )
        st.plotly_chart(fig, use_container_width=True)
    
    # Time statistics
    st.markdown("##### Time Statistics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    total_time = time_df['Practice Time'].sum()
    avg_session = time_df['Practice Time'].mean()
    total_sessions = time_df['Sessions'].sum()
    practice_days = len(time_df)
    
    with col1:
        st.metric("Total Practice Time", f"{total_time//60}h {total_time%60}m")
    
    with col2:
        st.metric("Average Session", f"{avg_session:.1f} min")
    
    with col3:
        st.metric("Total Sessions", total_sessions)
    
    with col4:
        st.metric("Practice Days", practice_days)

# Import necessary libraries for random data generation
import random
import numpy as np

if __name__ == "__main__":
    main()
