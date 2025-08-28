"""
Data management utilities for speech therapy application
Handles user data persistence, progress tracking, and session management
"""
import json
import os
from datetime import datetime, date
from typing import Dict, List, Optional, Any
import streamlit as st

class DataManager:
    """
    Manages user data, progress tracking, and application state persistence
    """
    
    def __init__(self):
        self.data_dir = "user_data"
        self.ensure_data_directory()
        
        # File paths
        self.user_profile_file = os.path.join(self.data_dir, "user_profile.json")
        self.progress_file = os.path.join(self.data_dir, "progress_data.json")
        self.session_history_file = os.path.join(self.data_dir, "session_history.json")
        self.achievements_file = os.path.join(self.data_dir, "achievements.json")
        self.settings_file = os.path.join(self.data_dir, "user_settings.json")
        
    def ensure_data_directory(self):
        """Create data directory if it doesn't exist"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def save_user_profile(self, profile_data: Dict) -> bool:
        """
        Save user profile information
        
        Args:
            profile_data: Dictionary containing user profile information
            
        Returns:
            bool: True if saved successfully
        """
        try:
            profile_data['last_updated'] = datetime.now().isoformat()
            with open(self.user_profile_file, 'w') as f:
                json.dump(profile_data, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save profile: {str(e)}")
            return False
    
    def load_user_profile(self) -> Dict:
        """
        Load user profile information
        
        Returns:
            Dict: User profile data or default profile if not found
        """
        try:
            if os.path.exists(self.user_profile_file):
                with open(self.user_profile_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            st.warning(f"Could not load profile: {str(e)}")
        
        # Return default profile
        return {
            'name': 'Speech Learner',
            'age': 25,
            'native_language': 'English',
            'target_language': 'English',
            'speech_goals': ['Pronunciation', 'Fluency'],
            'difficulty_level': 'Intermediate',
            'created_date': datetime.now().isoformat()
        }
    
    def save_progress_data(self, progress_data: Dict) -> bool:
        """
        Save user progress data
        
        Args:
            progress_data: Dictionary containing progress metrics
            
        Returns:
            bool: True if saved successfully
        """
        try:
            progress_data['last_updated'] = datetime.now().isoformat()
            with open(self.progress_file, 'w') as f:
                json.dump(progress_data, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save progress: {str(e)}")
            return False
    
    def auto_save_user_data(self, user_data: Dict) -> bool:
        """
        Automatically save user data to prevent loss of progress
        
        Args:
            user_data: Complete user data dictionary
            
        Returns:
            bool: True if saved successfully
        """
        try:
            # Save to multiple files for redundancy
            timestamp = datetime.now().isoformat()
            
            # Main progress file
            progress_data = {
                'total_points': user_data.get('total_points', 0),
                'streak_days': user_data.get('streak_days', 0),
                'exercises_completed': user_data.get('exercises_completed', 0),
                'last_session': user_data.get('last_session'),
                'daily_goal': user_data.get('daily_goal', 15),
                'weekly_goal': user_data.get('weekly_goal', 105),
                'last_updated': timestamp
            }
            
            # Session history file
            session_data = {
                'sessions': user_data.get('session_history', []),
                'last_updated': timestamp
            }
            
            # Save both files
            self.save_progress_data(progress_data)
            self.save_session_history(session_data)
            
            return True
            
        except Exception as e:
            st.warning(f"Auto-save failed: {str(e)}")
            return False
    
    def save_session_history(self, session_data: Dict) -> bool:
        """
        Save session history data
        
        Args:
            session_data: Dictionary containing session information
            
        Returns:
            bool: True if saved successfully
        """
        try:
            with open(self.session_history_file, 'w') as f:
                json.dump(session_data, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save session history: {str(e)}")
            return False
    
    def load_progress_data(self) -> Dict:
        """
        Load user progress data
        
        Returns:
            Dict: Progress data or default values if not found
        """
        try:
            if os.path.exists(self.progress_file):
                with open(self.progress_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            st.warning(f"Could not load progress data: {str(e)}")
        
        # Return default progress data
        return {
            'total_points': 0,
            'streak_days': 0,
            'exercises_completed': 0,
            'last_session': None,
            'daily_goal': 15,
            'weekly_goal': 105,
            'best_scores': {
                'phoneme': 0,
                'word': 0,
                'sentence': 0,
                'conversation': 0
            },
            'total_practice_time': 0,  # in minutes
            'created_date': datetime.now().isoformat()
        }
    
    def save_session_data(self, session_data: Dict) -> bool:
        """
        Save individual session data
        
        Args:
            session_data: Dictionary containing session information
            
        Returns:
            bool: True if saved successfully
        """
        try:
            # Load existing session history
            session_history = self.load_session_history()
            
            # Add new session
            session_data['timestamp'] = datetime.now().isoformat()
            session_data['date'] = date.today().isoformat()
            session_history.append(session_data)
            
            # Keep only last 1000 sessions to manage file size
            if len(session_history) > 1000:
                session_history = session_history[-1000:]
            
            with open(self.session_history_file, 'w') as f:
                json.dump(session_history, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save session data: {str(e)}")
            return False
    
    def load_session_history(self) -> List[Dict]:
        """
        Load session history
        
        Returns:
            List[Dict]: List of session data dictionaries
        """
        try:
            if os.path.exists(self.session_history_file):
                with open(self.session_history_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            st.warning(f"Could not load session history: {str(e)}")
        
        return []
    
    def get_recent_sessions(self, days: int = 30) -> List[Dict]:
        """
        Get recent sessions within specified days
        
        Args:
            days: Number of days to look back
            
        Returns:
            List[Dict]: Recent session data
        """
        session_history = self.load_session_history()
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        
        recent_sessions = []
        for session in session_history:
            session_date = datetime.fromisoformat(session['timestamp']).date()
            if session_date >= cutoff_date:
                recent_sessions.append(session)
        
        return recent_sessions
    
    def calculate_practice_statistics(self, days: int = 30) -> Dict:
        """
        Calculate practice statistics for specified period
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Dict: Practice statistics
        """
        recent_sessions = self.get_recent_sessions(days)
        
        if not recent_sessions:
            return {
                'total_sessions': 0,
                'total_time': 0,
                'average_score': 0,
                'exercises_completed': 0,
                'practice_days': 0
            }
        
        total_sessions = len(recent_sessions)
        total_time = sum(session.get('duration_minutes', 0) for session in recent_sessions)
        scores = [session.get('score', 0) for session in recent_sessions if session.get('score', 0) > 0]
        average_score = sum(scores) / len(scores) if scores else 0
        
        # Count unique practice days
        practice_dates = set(
            datetime.fromisoformat(session['timestamp']).date() 
            for session in recent_sessions
        )
        practice_days = len(practice_dates)
        
        return {
            'total_sessions': total_sessions,
            'total_time': total_time,
            'average_score': round(average_score, 1),
            'exercises_completed': total_sessions,
            'practice_days': practice_days,
            'consistency_rate': round((practice_days / days) * 100, 1)
        }
    
    def save_achievements(self, achievements: List[Dict]) -> bool:
        """
        Save user achievements
        
        Args:
            achievements: List of achievement dictionaries
            
        Returns:
            bool: True if saved successfully
        """
        try:
            achievement_data = {
                'achievements': achievements,
                'last_updated': datetime.now().isoformat()
            }
            with open(self.achievements_file, 'w') as f:
                json.dump(achievement_data, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save achievements: {str(e)}")
            return False
    
    def load_achievements(self) -> List[Dict]:
        """
        Load user achievements
        
        Returns:
            List[Dict]: List of achievements
        """
        try:
            if os.path.exists(self.achievements_file):
                with open(self.achievements_file, 'r') as f:
                    data = json.load(f)
                    return data.get('achievements', [])
        except Exception as e:
            st.warning(f"Could not load achievements: {str(e)}")
        
        return []
    
    def check_new_achievements(self, progress_data: Dict) -> List[Dict]:
        """
        Check for newly earned achievements
        
        Args:
            progress_data: Current progress data
            
        Returns:
            List[Dict]: List of newly earned achievements
        """
        current_achievements = self.load_achievements()
        earned_achievement_names = {ach['name'] for ach in current_achievements}
        
        new_achievements = []
        
        # Define achievement criteria
        achievement_criteria = [
            {
                'name': 'First Steps',
                'description': 'Complete your first exercise',
                'condition': progress_data['exercises_completed'] >= 1,
                'points': 10
            },
            {
                'name': 'Getting Started',
                'description': 'Complete 10 exercises',
                'condition': progress_data['exercises_completed'] >= 10,
                'points': 25
            },
            {
                'name': 'Dedicated Learner',
                'description': 'Complete 50 exercises',
                'condition': progress_data['exercises_completed'] >= 50,
                'points': 100
            },
            {
                'name': 'Speech Master',
                'description': 'Complete 100 exercises',
                'condition': progress_data['exercises_completed'] >= 100,
                'points': 250
            },
            {
                'name': '3-Day Warrior',
                'description': 'Practice for 3 days straight',
                'condition': progress_data['streak_days'] >= 3,
                'points': 50
            },
            {
                'name': 'Week Champion',
                'description': 'Practice for 7 days straight',
                'condition': progress_data['streak_days'] >= 7,
                'points': 150
            },
            {
                'name': 'Point Collector',
                'description': 'Earn 500 points',
                'condition': progress_data['total_points'] >= 500,
                'points': 75
            },
            {
                'name': 'High Scorer',
                'description': 'Score 90+ on any exercise',
                'condition': max(progress_data.get('best_scores', {}).values()) >= 90,
                'points': 100
            }
        ]
        
        # Check each achievement
        for achievement in achievement_criteria:
            if achievement['name'] not in earned_achievement_names and achievement['condition']:
                new_achievement = achievement.copy()
                new_achievement['earned_date'] = datetime.now().isoformat()
                new_achievements.append(new_achievement)
        
        # Save new achievements
        if new_achievements:
            all_achievements = current_achievements + new_achievements
            self.save_achievements(all_achievements)
        
        return new_achievements
    
    def save_user_settings(self, settings: Dict) -> bool:
        """
        Save user settings/preferences
        
        Args:
            settings: Dictionary containing user settings
            
        Returns:
            bool: True if saved successfully
        """
        try:
            settings['last_updated'] = datetime.now().isoformat()
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            return True
        except Exception as e:
            st.error(f"Failed to save settings: {str(e)}")
            return False
    
    def load_user_settings(self) -> Dict:
        """
        Load user settings/preferences
        
        Returns:
            Dict: User settings or defaults if not found
        """
        try:
            if os.path.exists(self.settings_file):
                with open(self.settings_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            st.warning(f"Could not load settings: {str(e)}")
        
        # Return default settings
        return {
            'voice_speed': 'Normal',
            'audio_quality': 'High',
            'feedback_detail': 'Detailed',
            'gamification': True,
            'notifications': {
                'daily_reminder': True,
                'achievements': True,
                'progress_updates': True
            },
            'ui_preferences': {
                'show_phonetic_symbols': True,
                'auto_play_examples': True,
                'exercise_order': 'Adaptive'
            }
        }
    
    def export_user_data(self) -> Dict:
        """
        Export all user data for backup or transfer
        
        Returns:
            Dict: Complete user data export
        """
        export_data = {
            'export_date': datetime.now().isoformat(),
            'profile': self.load_user_profile(),
            'progress': self.load_progress_data(),
            'session_history': self.load_session_history(),
            'achievements': self.load_achievements(),
            'settings': self.load_user_settings()
        }
        
        return export_data
    
    def import_user_data(self, import_data: Dict) -> bool:
        """
        Import user data from backup
        
        Args:
            import_data: Dictionary containing exported user data
            
        Returns:
            bool: True if imported successfully
        """
        try:
            # Validate import data structure
            required_keys = ['profile', 'progress', 'session_history', 'achievements', 'settings']
            if not all(key in import_data for key in required_keys):
                st.error("Invalid import data format")
                return False
            
            # Import each data type
            success = True
            success &= self.save_user_profile(import_data['profile'])
            success &= self.save_progress_data(import_data['progress'])
            success &= self.save_achievements(import_data['achievements'])
            success &= self.save_user_settings(import_data['settings'])
            
            # Import session history
            try:
                with open(self.session_history_file, 'w') as f:
                    json.dump(import_data['session_history'], f, indent=2)
            except Exception as e:
                st.error(f"Failed to import session history: {str(e)}")
                success = False
            
            return success
            
        except Exception as e:
            st.error(f"Failed to import data: {str(e)}")
            return False
    
    def clear_all_data(self) -> bool:
        """
        Clear all user data (with confirmation)
        
        Returns:
            bool: True if cleared successfully
        """
        try:
            files_to_remove = [
                self.user_profile_file,
                self.progress_file,
                self.session_history_file,
                self.achievements_file,
                self.settings_file
            ]
            
            for file_path in files_to_remove:
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Clear session state
            keys_to_clear = ['user_data', 'profile', 'achievements', 'settings']
            for key in keys_to_clear:
                if key in st.session_state:
                    del st.session_state[key]
            
            return True
            
        except Exception as e:
            st.error(f"Failed to clear data: {str(e)}")
            return False
    
    def get_exercise_statistics(self) -> Dict:
        """
        Get detailed exercise statistics
        
        Returns:
            Dict: Exercise performance statistics
        """
        session_history = self.load_session_history()
        
        if not session_history:
            return {
                'total_exercises': 0,
                'exercise_types': {},
                'average_scores_by_type': {},
                'improvement_trends': {}
            }
        
        # Categorize by exercise type
        exercise_types = {}
        scores_by_type = {}
        
        for session in session_history:
            ex_type = session.get('exercise_type', 'unknown')
            score = session.get('score', 0)
            
            if ex_type not in exercise_types:
                exercise_types[ex_type] = 0
                scores_by_type[ex_type] = []
            
            exercise_types[ex_type] += 1
            if score > 0:
                scores_by_type[ex_type].append(score)
        
        # Calculate averages
        average_scores_by_type = {}
        for ex_type, scores in scores_by_type.items():
            if scores:
                average_scores_by_type[ex_type] = round(sum(scores) / len(scores), 1)
        
        # Calculate improvement trends
        improvement_trends = {}
        for ex_type, scores in scores_by_type.items():
            if len(scores) >= 5:  # Need at least 5 scores to calculate trend
                recent_avg = sum(scores[-3:]) / len(scores[-3:])
                early_avg = sum(scores[:3]) / len(scores[:3])
                improvement = recent_avg - early_avg
                improvement_trends[ex_type] = round(improvement, 1)
        
        return {
            'total_exercises': len(session_history),
            'exercise_types': exercise_types,
            'average_scores_by_type': average_scores_by_type,
            'improvement_trends': improvement_trends,
            'most_practiced': max(exercise_types.items(), key=lambda x: x[1])[0] if exercise_types else None,
            'best_performing': max(average_scores_by_type.items(), key=lambda x: x[1])[0] if average_scores_by_type else None
        }
    
    def update_streak(self) -> int:
        """
        Update and return current streak
        
        Returns:
            int: Current streak in days
        """
        session_history = self.load_session_history()
        
        if not session_history:
            return 0
        
        # Get unique practice dates (sorted)
        practice_dates = sorted(set(
            datetime.fromisoformat(session['timestamp']).date()
            for session in session_history
        ))
        
        if not practice_dates:
            return 0
        
        # Calculate current streak
        today = date.today()
        current_streak = 0
        
        # Check if practiced today or yesterday
        if today in practice_dates:
            check_date = today
        elif (today - timedelta(days=1)) in practice_dates:
            check_date = today - timedelta(days=1)
        else:
            return 0
        
        # Count consecutive days backwards
        while check_date in practice_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
        
        return current_streak

# Import required modules
from datetime import timedelta
