from datetime import timedelta

from django.db.models import Count, Avg, Q, Sum, F
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsTeacher
from apps.testing.models import TestAttempt, TestCategory
from apps.chat.models import ChatRoom, Message
from apps.courses.models import VideoProgress
from .models import User
from .serializers_teacher import (
    TeacherStudentListSerializer,
    TeacherStudentDetailSerializer,
    TeacherProfileSerializer,
)


class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        week_ago = today - timedelta(days=7)

        students = User.objects.filter(role='student', is_active=True)
        total_students = students.count()
        paid_students = students.filter(is_paid=True).count()

        # Messages stats
        my_rooms = ChatRoom.objects.filter(participants__user=user)
        unread_messages = Message.objects.filter(
            room__in=my_rooms,
            created_at__date=today,
        ).exclude(sender=user).count()

        # Weekly activity
        weekly_tests = TestAttempt.objects.filter(
            finished_at__date__gte=week_ago,
        ).count()

        weekly_active = TestAttempt.objects.filter(
            finished_at__date__gte=week_ago,
        ).values('user').distinct().count()

        # Tests today
        tests_today = TestAttempt.objects.filter(finished_at__date=today).count()

        # Average score
        avg = TestAttempt.objects.filter(
            finished_at__isnull=False,
        ).aggregate(
            avg_pct=Avg(F('score') * 100.0 / F('total')),
        )
        avg_score = round(avg['avg_pct'] or 0)

        # Recent test results (last 10)
        recent = TestAttempt.objects.filter(
            finished_at__isnull=False,
        ).select_related('user', 'category').order_by('-finished_at')[:10]

        recent_data = [{
            'student_name': f'{a.user.first_name} {a.user.last_name}'.strip() or a.user.username,
            'test_type': a.test_type,
            'category_name': a.category.name if a.category else None,
            'score': a.score,
            'total': a.total,
            'is_passed': a.is_passed,
            'finished_at': a.finished_at.isoformat(),
        } for a in recent]

        # Top weak categories (overall, exclude "Без теми")
        categories = TestCategory.objects.filter(question_count__gt=0).exclude(name='Без теми')
        category_stats = []
        for cat in categories:
            cat_attempts = TestAttempt.objects.filter(
                category=cat, finished_at__isnull=False,
            )
            if cat_attempts.exists():
                total_correct = sum(a.score for a in cat_attempts)
                total_questions = sum(a.total for a in cat_attempts)
                pct = round(total_correct / total_questions * 100) if total_questions else 0
                category_stats.append({
                    'category_name': cat.name,
                    'percent': pct,
                    'attempts': cat_attempts.count(),
                })
        category_stats.sort(key=lambda x: x['percent'])

        return Response({
            'stats': {
                'total_students': total_students,
                'paid_students': paid_students,
                'new_messages_today': unread_messages,
                'tests_today': tests_today,
                'weekly_tests': weekly_tests,
                'weekly_active_students': weekly_active,
                'avg_score': avg_score,
            },
            'recent_results': recent_data,
            'weak_categories': category_stats[:5],
        })


class StudentPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class TeacherStudentListView(generics.ListAPIView):
    permission_classes = [IsTeacher]
    serializer_class = TeacherStudentListSerializer
    pagination_class = StudentPagination

    def get_queryset(self):
        qs = User.objects.filter(role='student', is_active=True).annotate(
            tests_count=Count('test_attempts', filter=Q(test_attempts__finished_at__isnull=False)),
            tests_passed=Count('test_attempts', filter=Q(test_attempts__is_passed=True)),
        )

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )

        access = self.request.query_params.get('access')
        if access in ('free', 'trial', 'paid'):
            qs = qs.filter(access_type=access)

        ordering = self.request.query_params.get('ordering', '-created_at')
        allowed = ('created_at', '-created_at', 'first_name', '-first_name',
                    'tests_count', '-tests_count', 'last_login', '-last_login')
        if ordering in allowed:
            qs = qs.order_by(ordering)

        return qs


class TeacherStudentDetailView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request, pk):
        try:
            student = User.objects.get(pk=pk, role='student')
        except User.DoesNotExist:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        attempts = TestAttempt.objects.filter(user=student, finished_at__isnull=False)
        total_attempts = attempts.count()
        passed = attempts.filter(is_passed=True).count()
        total_correct = sum(a.score for a in attempts)
        total_questions = sum(a.total for a in attempts)
        avg_pct = round(total_correct / total_questions * 100) if total_questions else 0

        recent = attempts.select_related('category').order_by('-finished_at')[:10]
        recent_data = [{
            'test_type': a.test_type,
            'category_name': a.category.name if a.category else None,
            'score': a.score,
            'total': a.total,
            'is_passed': a.is_passed,
            'finished_at': a.finished_at.isoformat(),
        } for a in recent]

        # Category stats
        categories = TestCategory.objects.filter(question_count__gt=0)
        cat_stats = []
        for cat in categories:
            ca = attempts.filter(category=cat)
            if ca.exists():
                cc = sum(a.score for a in ca)
                ct = sum(a.total for a in ca)
                cat_stats.append({
                    'category_name': cat.name,
                    'percent': round(cc / ct * 100) if ct else 0,
                    'attempts': ca.count(),
                })
        cat_stats.sort(key=lambda x: x['percent'])

        # Streak info
        streak_data = None
        try:
            from apps.gamification.models import StudyStreak, UserXP
            streak = StudyStreak.objects.filter(user=student).first()
            xp = UserXP.objects.filter(user=student).first()
            if streak:
                streak_data = {
                    'current_streak': streak.current_streak,
                    'longest_streak': streak.longest_streak,
                    'total_study_days': streak.total_study_days,
                }
            if xp:
                streak_data = streak_data or {}
                streak_data['level'] = xp.level
                streak_data['total_xp'] = xp.total_xp
        except Exception:
            pass

        return Response({
            'student': TeacherStudentDetailSerializer(student).data,
            'test_stats': {
                'total_attempts': total_attempts,
                'passed': passed,
                'avg_percent': avg_pct,
                'total_correct': total_correct,
                'total_questions': total_questions,
            },
            'recent_results': recent_data,
            'category_stats': cat_stats,
            'motivation': streak_data,
        })


class TeacherProfileView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        return Response(TeacherProfileSerializer(request.user).data)

    def patch(self, request):
        ser = TeacherProfileSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)
