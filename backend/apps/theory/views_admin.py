from django.db.models import Count
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import TheorySection, TheoryChapter
from .serializers_admin import (
    AdminSectionSerializer,
    AdminSectionReorderSerializer,
    AdminChapterListSerializer,
    AdminChapterDetailSerializer,
    AdminChapterReorderSerializer,
)


# --- Sections ---

class AdminSectionListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminSectionSerializer
    queryset = TheorySection.objects.all()
    pagination_class = None

    def perform_create(self, serializer):
        max_order = TheorySection.objects.count()
        serializer.save(order=max_order)


class AdminSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminSectionSerializer
    queryset = TheorySection.objects.all()


class AdminSectionReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminSectionReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        for i, section_id in enumerate(ser.validated_data['ordered_ids']):
            TheorySection.objects.filter(id=section_id).update(order=i)
        return Response({'status': 'ok'})


# --- Chapters ---

class AdminChapterListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminChapterListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = TheoryChapter.objects.select_related('section').all()
        section_id = self.request.query_params.get('section')
        if section_id:
            qs = qs.filter(section_id=section_id)
        return qs


class AdminChapterCreateView(generics.CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminChapterDetailSerializer

    def perform_create(self, serializer):
        chapter = serializer.save()
        TheorySection.objects.filter(id=chapter.section_id).update(
            chapters_count=TheoryChapter.objects.filter(section_id=chapter.section_id).count()
        )


class AdminChapterDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminChapterDetailSerializer
    queryset = TheoryChapter.objects.select_related('section')

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        section_id = instance.section_id
        instance.delete()
        TheorySection.objects.filter(id=section_id).update(
            chapters_count=TheoryChapter.objects.filter(section_id=section_id).count()
        )


class AdminChapterReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminChapterReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        for i, chapter_id in enumerate(ser.validated_data['ordered_ids']):
            TheoryChapter.objects.filter(id=chapter_id).update(order=i)
        return Response({'status': 'ok'})


# --- Stats ---

class AdminTheoryStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        sections = TheorySection.objects.annotate(
            actual_chapters_count=Count('chapters')
        ).values('id', 'title', 'actual_chapters_count')

        return Response({
            'total_sections': TheorySection.objects.count(),
            'total_chapters': TheoryChapter.objects.count(),
            'sections': list(sections),
        })
