import math
import random

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Question, Answer, TestAttempt, AttemptAnswer
from .serializers import (
    TestCategorySerializer, QuestionSerializer,
    StartTestSerializer, SubmitAnswerSerializer,
    TestAttemptSerializer, TestAttemptDetailSerializer,
)
from .services import (
    build_test_stats,
    groups_for_user,
    license_group_filter,
    user_categories_queryset,
    user_questions_queryset,
)


class CategoryListView(generics.ListAPIView):
    serializer_class = TestCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return user_categories_queryset(self.request.user)


class StartTestView(APIView):
    def post(self, request):
        ser = StartTestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        test_type = ser.validated_data['test_type']
        category_id = ser.validated_data.get('category_id')
        category_ids = list(dict.fromkeys(ser.validated_data.get('category_ids') or []))
        attempt_category_id = category_id

        # paywall: topic and marathon require paid subscription
        if test_type in ('topic', 'marathon') and not request.user.is_paid:
            return Response(
                {'error': 'payment_required', 'message': 'Цей режим доступний лише для оплачених акаунтів'},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_groups = groups_for_user(request.user)
        allowed_question_filter = license_group_filter(user_groups, 'category__license_groups')

        question_ids: list[int]
        if test_type == 'topic':
            if not category_ids and category_id:
                category_ids = [category_id]
            if not category_ids:
                return Response(
                    {'error': 'category_required', 'message': 'Оберіть хоча б одну тему'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            allowed_category_ids = set(
                user_categories_queryset(request.user)
                .filter(id__in=category_ids)
                .values_list('id', flat=True)
            )
            if not allowed_category_ids or allowed_category_ids != set(category_ids):
                return Response(
                    {'error': 'invalid_categories'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            attempt_category_id = category_ids[0] if len(category_ids) == 1 else None
            # Take roughly even slice from each selected topic, then shuffle and trim to 20
            per_topic = math.ceil(20 / len(category_ids))
            collected: list[int] = []
            for cat_id in category_ids:
                ids = list(
                    Question.objects.filter(allowed_question_filter, category_id=cat_id)
                    .order_by('?')
                    .values_list('id', flat=True)[:per_topic]
                )
                collected.extend(ids)
            random.shuffle(collected)
            question_ids = collected[:20]
        elif test_type == 'exam':
            question_ids = list(
                user_questions_queryset(request.user).order_by('?').values_list('id', flat=True)[:20]
            )
        else:  # marathon
            question_ids = list(
                user_questions_queryset(request.user).order_by('?').values_list('id', flat=True)[:100]
            )

        attempt = TestAttempt.objects.create(
            user=request.user,
            test_type=test_type,
            category_id=attempt_category_id,
            total=len(question_ids),
        )

        # Pre-create empty attempt answers
        attempt_answers = [
            AttemptAnswer(attempt=attempt, question_id=qid)
            for qid in question_ids
        ]
        AttemptAnswer.objects.bulk_create(attempt_answers)

        # Return questions
        ordered_questions = Question.objects.filter(id__in=question_ids).prefetch_related('answers')
        questions_data = QuestionSerializer(ordered_questions, many=True).data

        time_limit = 20 if test_type == 'exam' else None

        return Response({
            'attempt_id': attempt.id,
            'test_type': test_type,
            'time_limit_minutes': time_limit,
            'questions': questions_data,
        })


class SubmitAnswerView(APIView):
    def post(self, request, attempt_id):
        attempt = TestAttempt.objects.filter(
            id=attempt_id, user=request.user, finished_at__isnull=True
        ).first()

        if not attempt:
            return Response(
                {'error': 'not_found', 'message': 'Тест не знайдено або вже завершено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        ser = SubmitAnswerSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        question_id = ser.validated_data['question_id']
        answer_id = ser.validated_data['answer_id']

        attempt_answer = AttemptAnswer.objects.filter(
            attempt=attempt, question_id=question_id
        ).first()

        if not attempt_answer:
            return Response(
                {'error': 'invalid_question', 'message': 'Питання не належить цьому тесту'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if answer_id:
            answer = Answer.objects.filter(id=answer_id, question_id=question_id).first()
            if not answer:
                return Response(
                    {'error': 'invalid_answer', 'message': 'Невірна відповідь'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            attempt_answer.selected_answer = answer
            attempt_answer.is_correct = answer.is_correct
        else:
            attempt_answer.selected_answer = None
            attempt_answer.is_correct = False

        attempt_answer.save()

        # Return correct answer for immediate feedback
        correct = Answer.objects.filter(question_id=question_id, is_correct=True).first()
        return Response({
            'is_correct': attempt_answer.is_correct,
            'correct_answer_id': correct.id if correct else None,
            'explanation': attempt_answer.question.explanation,
        })


class FinishTestView(APIView):
    def post(self, request, attempt_id):
        attempt = TestAttempt.objects.filter(
            id=attempt_id, user=request.user, finished_at__isnull=True
        ).first()

        if not attempt:
            return Response(
                {'error': 'not_found', 'message': 'Тест не знайдено або вже завершено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        score = attempt.answers.filter(is_correct=True).count()
        attempt.score = score
        attempt.finished_at = timezone.now()
        attempt.is_passed = (score / attempt.total * 100) >= 80 if attempt.total > 0 else False
        attempt.save()

        return Response(TestAttemptDetailSerializer(attempt).data)


class AttemptListView(generics.ListAPIView):
    serializer_class = TestAttemptSerializer
    pagination_class = None

    def get_queryset(self):
        return TestAttempt.objects.filter(
            user=self.request.user, finished_at__isnull=False
        ).select_related('category')[:50]


class AttemptDetailView(generics.RetrieveAPIView):
    serializer_class = TestAttemptDetailSerializer

    def get_queryset(self):
        return TestAttempt.objects.filter(user=self.request.user).prefetch_related(
            'answers__question__answers', 'answers__selected_answer'
        )


class TestStatsView(APIView):
    def get(self, request):
        return Response(build_test_stats(request.user))


class ResetStatsView(APIView):
    def post(self, request):
        attempts = TestAttempt.objects.filter(user=request.user)
        deleted = attempts.count()
        attempts.delete()
        return Response({'deleted': deleted})


class WrongAnswersView(APIView):
    def get(self, request):
        wrong = AttemptAnswer.objects.filter(
            attempt__user=request.user,
            attempt__finished_at__isnull=False,
            is_correct=False,
            selected_answer__isnull=False,
        ).select_related(
            'question__category', 'selected_answer'
        ).prefetch_related('question__answers').order_by('-attempt__finished_at')

        # Deduplicate by question — keep latest attempt
        seen = set()
        results = []
        for wa in wrong:
            if wa.question_id in seen:
                continue
            seen.add(wa.question_id)
            q = wa.question
            results.append({
                'question_id': q.id,
                'question_number': q.number,
                'question_text': q.text,
                'question_image': q.image,
                'explanation': q.explanation,
                'category_name': q.category.name if q.category else None,
                'selected_answer_id': wa.selected_answer_id,
                'answers': [
                    {'id': a.id, 'text': a.text, 'is_correct': a.is_correct}
                    for a in q.answers.all()
                ],
            })

        return Response({'count': len(results), 'results': results})
