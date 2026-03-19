import os
import uuid

from django.conf import settings
from django.db.models import Count
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import TestCategory, Question, Answer
from .serializers_admin import (
    AdminCategorySerializer,
    AdminQuestionListSerializer,
    AdminQuestionDetailSerializer,
    BulkMoveSerializer,
    BulkDeleteSerializer,
    QuestionImageUploadSerializer,
)


class QuestionPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200


# --- Categories ---

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCategorySerializer
    queryset = TestCategory.objects.all()
    pagination_class = None


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCategorySerializer
    queryset = TestCategory.objects.all()

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        if category.questions.exists():
            return Response(
                {'error': 'has_questions',
                 'message': f'Категорія містить {category.question_count} питань. Спочатку перемістіть їх.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class AdminCategoryReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        order_map = request.data.get('order', [])
        if not isinstance(order_map, list):
            return Response({'error': 'invalid', 'message': 'Очікується список'}, status=400)
        for item in order_map:
            TestCategory.objects.filter(id=item.get('id')).update(order=item.get('order', 0))
        return Response({'status': 'ok'})


# --- Questions ---

class AdminQuestionListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminQuestionListSerializer
    pagination_class = QuestionPagination

    def get_queryset(self):
        qs = Question.objects.select_related('category').annotate(
            answers_count=Count('answers')
        )
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)

        search = self.request.query_params.get('search')
        if search:
            if search.isdigit():
                qs = qs.filter(number=int(search))
            else:
                qs = qs.filter(text__icontains=search)

        has_image = self.request.query_params.get('has_image')
        if has_image == '1':
            qs = qs.exclude(image__isnull=True).exclude(image='')
        elif has_image == '0':
            qs = qs.filter(image__isnull=True) | qs.filter(image='')

        ordering = self.request.query_params.get('ordering', 'number')
        if ordering in ('number', '-number', 'category', '-category'):
            qs = qs.order_by(ordering)

        return qs


class AdminQuestionCreateView(generics.CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminQuestionDetailSerializer


class AdminQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminQuestionDetailSerializer
    queryset = Question.objects.prefetch_related('answers')

    def perform_destroy(self, instance):
        category = instance.category
        instance.delete()
        if category:
            category.question_count = category.questions.count()
            category.save(update_fields=['question_count'])


class AdminQuestionImageUploadView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser]

    def post(self, request, pk):
        question = Question.objects.filter(pk=pk).first()
        if not question:
            return Response({'error': 'not_found'}, status=404)

        ser = QuestionImageUploadSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        image = ser.validated_data['image']
        ext = os.path.splitext(image.name)[1].lower()
        filename = f'questions/{uuid.uuid4().hex}{ext}'
        filepath = os.path.join(settings.MEDIA_ROOT, filename)

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb+') as f:
            for chunk in image.chunks():
                f.write(chunk)

        url = f'{settings.MEDIA_URL}{filename}'
        question.image = url
        question.save(update_fields=['image'])

        return Response({'image': url})

    def delete(self, request, pk):
        question = Question.objects.filter(pk=pk).first()
        if not question:
            return Response({'error': 'not_found'}, status=404)

        question.image = None
        question.save(update_fields=['image'])
        return Response(status=204)


# --- Bulk operations ---

class AdminBulkMoveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = BulkMoveSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        question_ids = ser.validated_data['question_ids']
        category_id = ser.validated_data['category_id']

        old_categories = set(
            Question.objects.filter(id__in=question_ids)
            .values_list('category_id', flat=True)
            .distinct()
        )

        moved = Question.objects.filter(id__in=question_ids).update(category_id=category_id)

        affected = old_categories | {category_id}
        for cat in TestCategory.objects.filter(id__in=affected):
            cat.question_count = cat.questions.count()
            cat.save(update_fields=['question_count'])

        return Response({'moved': moved})


class AdminBulkDeleteView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = BulkDeleteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        question_ids = ser.validated_data['question_ids']
        affected_categories = set(
            Question.objects.filter(id__in=question_ids)
            .values_list('category_id', flat=True)
            .distinct()
        )

        deleted, _ = Question.objects.filter(id__in=question_ids).delete()

        for cat in TestCategory.objects.filter(id__in=affected_categories):
            cat.question_count = cat.questions.count()
            cat.save(update_fields=['question_count'])

        return Response({'deleted': deleted})


# --- Stats ---

class AdminTestStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        categories = TestCategory.objects.all()
        total_questions = Question.objects.count()
        total_categories = categories.count()

        return Response({
            'total_questions': total_questions,
            'total_categories': total_categories,
            'categories': AdminCategorySerializer(categories, many=True).data,
        })
