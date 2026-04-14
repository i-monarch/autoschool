from datetime import timedelta

from django.db.models import Subquery, OuterRef, BooleanField, Value, DateTimeField
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudyStreak, Achievement, UserAchievement, DailyGoal, DailyProgress, UserXP
from .serializers import (
    StudyStreakSerializer, AchievementSerializer, DailyGoalSerializer,
    DailyProgressSerializer, UserXPSerializer,
)


class MotivationDashboardView(APIView):
    def get(self, request):
        user = request.user
        today = timezone.localdate()

        streak, _ = StudyStreak.objects.get_or_create(user=user)
        user_xp, _ = UserXP.objects.get_or_create(user=user)
        goal, _ = DailyGoal.objects.get_or_create(user=user)
        today_progress, _ = DailyProgress.objects.get_or_create(user=user, date=today)

        # Weekly activity (last 7 days)
        week_start = today - timedelta(days=6)
        week_data = DailyProgress.objects.filter(
            user=user, date__gte=week_start, date__lte=today,
        ).order_by('date')
        week_map = {p.date: p for p in week_data}
        weekly = []
        for i in range(7):
            d = week_start + timedelta(days=i)
            p = week_map.get(d)
            weekly.append({
                'date': d.isoformat(),
                'day': d.strftime('%a'),
                'questions': p.questions_answered if p else 0,
                'correct': p.correct_answers if p else 0,
                'xp': p.xp_earned if p else 0,
                'active': p is not None and p.questions_answered > 0,
            })

        # Recent achievements (last 5)
        recent_achievements = UserAchievement.objects.filter(
            user=user,
        ).select_related('achievement').order_by('-earned_at')[:5]

        earned_count = UserAchievement.objects.filter(user=user).count()
        total_count = Achievement.objects.count()

        return Response({
            'streak': StudyStreakSerializer(streak).data,
            'xp': UserXPSerializer(user_xp).data,
            'daily_goal': {
                'target': goal.target_questions,
                'current': today_progress.questions_answered,
                'completed': today_progress.questions_answered >= goal.target_questions,
            },
            'today': DailyProgressSerializer(today_progress).data,
            'weekly': weekly,
            'achievements': {
                'earned': earned_count,
                'total': total_count,
                'recent': [
                    {
                        'code': ua.achievement.code,
                        'name': ua.achievement.name,
                        'icon': ua.achievement.icon,
                        'earned_at': ua.earned_at.isoformat(),
                    }
                    for ua in recent_achievements
                ],
            },
        })


class AchievementsView(APIView):
    def get(self, request):
        user = request.user
        earned_sub = UserAchievement.objects.filter(
            user=user, achievement=OuterRef('pk'),
        )
        achievements = Achievement.objects.annotate(
            earned=Coalesce(
                Subquery(earned_sub.values('id')[:1], output_field=BooleanField()),
                Value(False),
            ),
            earned_at=Subquery(earned_sub.values('earned_at')[:1], output_field=DateTimeField()),
        ).order_by('order')

        # Group by category
        result = {}
        for ach in achievements:
            cat = ach.category
            if cat not in result:
                result[cat] = []
            result[cat].append({
                'id': ach.id,
                'code': ach.code,
                'name': ach.name,
                'description': ach.description,
                'icon': ach.icon,
                'xp_reward': ach.xp_reward,
                'earned': bool(ach.earned),
                'earned_at': ach.earned_at.isoformat() if ach.earned_at else None,
            })

        return Response(result)


class DailyGoalView(APIView):
    def get(self, request):
        goal, _ = DailyGoal.objects.get_or_create(user=request.user)
        today = timezone.localdate()
        progress, _ = DailyProgress.objects.get_or_create(user=request.user, date=today)
        return Response({
            'target': goal.target_questions,
            'current': progress.questions_answered,
        })

    def patch(self, request):
        goal, _ = DailyGoal.objects.get_or_create(user=request.user)
        target = request.data.get('target_questions')
        if target and int(target) in dict(DailyGoal.GOAL_CHOICES):
            goal.target_questions = int(target)
            goal.save()
            return Response(DailyGoalSerializer(goal).data)
        return Response({'error': 'Invalid target'}, status=status.HTTP_400_BAD_REQUEST)


class WeeklyActivityView(APIView):
    def get(self, request):
        user = request.user
        today = timezone.localdate()
        week_start = today - timedelta(days=6)
        data = DailyProgress.objects.filter(
            user=user, date__gte=week_start,
        ).order_by('date')

        return Response(DailyProgressSerializer(data, many=True).data)
