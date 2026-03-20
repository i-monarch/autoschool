from django.db.models import Count, Q, Sum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SavedQuestion, QuestionComment, Question, AttemptAnswer
from .serializers_extra import (
    SavedQuestionSerializer,
    SavedQuestionToggleSerializer,
    QuestionCommentSerializer,
    QuestionCommentCreateSerializer,
)


class SavedQuestionToggleView(APIView):

    def post(self, request):
        ser = SavedQuestionToggleSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        question_id = ser.validated_data['question_id']

        if not Question.objects.filter(id=question_id).exists():
            return Response(
                {'error': 'not_found', 'message': 'Питання не знайдено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        saved, created = SavedQuestion.objects.get_or_create(
            user=request.user, question_id=question_id
        )
        if not created:
            saved.delete()
            return Response({'saved': False})
        return Response({'saved': True}, status=status.HTTP_201_CREATED)


class SavedQuestionListView(APIView):

    def get(self, request):
        saved = SavedQuestion.objects.filter(
            user=request.user
        ).select_related('question__category').prefetch_related('question__answers')
        data = SavedQuestionSerializer(saved, many=True).data
        return Response({'count': len(data), 'results': data})


class QuestionCommentListCreateView(APIView):

    def get(self, request, question_id):
        comments = QuestionComment.objects.filter(
            question_id=question_id
        ).select_related('user')
        data = QuestionCommentSerializer(comments, many=True).data
        return Response(data)

    def post(self, request, question_id):
        if not Question.objects.filter(id=question_id).exists():
            return Response(
                {'error': 'not_found', 'message': 'Питання не знайдено'},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = QuestionCommentCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        comment = QuestionComment.objects.create(
            user=request.user,
            question_id=question_id,
            text=ser.validated_data['text'],
        )
        return Response(
            QuestionCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED,
        )


class LeaderboardView(APIView):

    def get(self, request):
        from django.conf import settings
        from django.contrib.auth import get_user_model

        User = get_user_model()

        leaders = (
            AttemptAnswer.objects
            .filter(attempt__finished_at__isnull=False)
            .values('attempt__user')
            .annotate(
                total_correct=Count('id', filter=Q(is_correct=True)),
                total_answers=Count('id'),
            )
            .order_by('-total_correct')[:50]
        )

        user_ids = [entry['attempt__user'] for entry in leaders]
        users = {u.id: u for u in User.objects.filter(id__in=user_ids)}

        results = []
        for pos, entry in enumerate(leaders, 1):
            user = users.get(entry['attempt__user'])
            if not user:
                continue
            total = entry['total_answers']
            correct = entry['total_correct']
            results.append({
                'position': pos,
                'user_id': user.id,
                'first_name': user.first_name or user.username,
                'total_correct': correct,
                'total_answers': total,
                'accuracy_percent': round(correct / total * 100) if total > 0 else 0,
            })

        current_user_id = request.user.id
        return Response({
            'current_user_id': current_user_id,
            'results': results,
        })
