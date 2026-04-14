from django.contrib import admin
from .models import Achievement, UserAchievement, StudyStreak, DailyGoal, DailyProgress, UserXP


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'xp_reward', 'condition_type', 'condition_value', 'order']
    list_editable = ['order']
    ordering = ['order']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'earned_at']
    list_filter = ['achievement']


@admin.register(StudyStreak)
class StudyStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_streak', 'longest_streak', 'last_activity_date', 'total_study_days']


@admin.register(DailyGoal)
class DailyGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_questions']


@admin.register(DailyProgress)
class DailyProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'questions_answered', 'correct_answers', 'tests_completed', 'xp_earned']
    list_filter = ['date']


@admin.register(UserXP)
class UserXPAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_xp', 'level']
