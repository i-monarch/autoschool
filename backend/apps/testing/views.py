from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TestCategory, Question, Answer, TestAttempt, AttemptAnswer
from .serializers import (
    TestCategorySerializer, QuestionSerializer, QuestionWithExplanationSerializer,
    StartTestSerializer, SubmitAnswerSerializer,
    TestAttemptSerializer, TestAttemptDetailSerializer,
)


class CategoryListView(generics.ListAPIView):
    serializer_class = TestCategorySerializer
    queryset = TestCategory.objects.filter(question_count__gt=0)
    pagination_class = None


class StartTestView(APIView):
    def post(self, request):
        ser = StartTestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        test_type = ser.validated_data['test_type']
        category_id = ser.validated_data.get('category_id')

        if test_type == 'topic':
            if not category_id:
                return Response(
                    {'error': 'category_required', 'message': 'Оберіть тему'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            questions = Question.objects.filter(category_id=category_id)
            count = min(questions.count(), 20)
        elif test_type == 'exam':
            questions = Question.objects.all()
            count = 20
        else:  # marathon
            questions = Question.objects.all()
            count = min(questions.count(), 100)

        question_ids = list(questions.order_by('?').values_list('id', flat=True)[:count])

        attempt = TestAttempt.objects.create(
            user=request.user,
            test_type=test_type,
            category_id=category_id,
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
        attempts = TestAttempt.objects.filter(user=request.user, finished_at__isnull=False)

        total_attempts = attempts.count()
        if total_attempts == 0:
            return Response({
                'total_attempts': 0,
                'total_correct': 0,
                'total_wrong': 0,
                'total_questions': 0,
                'avg_percent': 0,
                'passed_count': 0,
                'failed_count': 0,
                'by_category': [],
            })

        total_correct = sum(a.score for a in attempts)
        total_questions = sum(a.total for a in attempts)
        total_wrong = total_questions - total_correct
        avg_percent = round(total_correct / total_questions * 100) if total_questions else 0
        passed_count = attempts.filter(is_passed=True).count()
        failed_count = total_attempts - passed_count

        # Stats by category — sorted weakest first
        category_stats = []
        categories = TestCategory.objects.filter(question_count__gt=0)
        for cat in categories:
            cat_attempts = attempts.filter(category=cat)
            if cat_attempts.exists():
                cat_correct = sum(a.score for a in cat_attempts)
                cat_total = sum(a.total for a in cat_attempts)
                cat_wrong = cat_total - cat_correct
                pct = round(cat_correct / cat_total * 100) if cat_total else 0
                category_stats.append({
                    'category_id': cat.id,
                    'category_name': cat.name,
                    'attempts': cat_attempts.count(),
                    'correct': cat_correct,
                    'wrong': cat_wrong,
                    'total': cat_total,
                    'percent': pct,
                })

        category_stats.sort(key=lambda x: x['percent'])

        return Response({
            'total_attempts': total_attempts,
            'total_correct': total_correct,
            'total_wrong': total_wrong,
            'total_questions': total_questions,
            'avg_percent': avg_percent,
            'passed_count': passed_count,
            'failed_count': failed_count,
            'by_category': category_stats,
        })


class WrongAnswersView(APIView):
    """All wrong answers across user's attempts, grouped by question."""

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
