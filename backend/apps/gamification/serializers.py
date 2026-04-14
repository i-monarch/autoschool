from rest_framework import serializers
from .models import StudyStreak, Achievement, UserAchievement, DailyGoal, DailyProgress, UserXP


class StudyStreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyStreak
        fields = ['current_streak', 'longest_streak', 'last_activity_date', 'total_study_days']


class AchievementSerializer(serializers.ModelSerializer):
    earned = serializers.BooleanField(read_only=True)
    earned_at = serializers.DateTimeField(read_only=True, allow_null=True)

    class Meta:
        model = Achievement
        fields = ['id', 'code', 'name', 'description', 'icon', 'category', 'xp_reward', 'earned', 'earned_at']


class DailyGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyGoal
        fields = ['target_questions']


class DailyProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProgress
        fields = ['date', 'questions_answered', 'correct_answers', 'tests_completed', 'study_minutes', 'xp_earned']


class UserXPSerializer(serializers.ModelSerializer):
    xp_for_next_level = serializers.SerializerMethodField()
    xp_in_current_level = serializers.SerializerMethodField()

    class Meta:
        model = UserXP
        fields = ['total_xp', 'level', 'xp_for_next_level', 'xp_in_current_level']

    def get_xp_for_next_level(self, obj):
        return UserXP.xp_for_level(obj.level)

    def get_xp_in_current_level(self, obj):
        prev_levels_xp = sum(UserXP.xp_for_level(l) for l in range(1, obj.level))
        return obj.total_xp - prev_levels_xp
