from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import TheorySection, TheoryChapter
from .serializers import (
    TheorySectionSerializer,
    TheoryChapterListSerializer,
    TheoryChapterDetailSerializer,
)

PAID_SECTIONS = {'regulyuvalnik'}


class SectionListView(generics.ListAPIView):
    serializer_class = TheorySectionSerializer
    queryset = TheorySection.objects.all()
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]


class ChapterListView(generics.ListAPIView):
    serializer_class = TheoryChapterListSerializer
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        section_slug = self.kwargs['section_slug']
        if section_slug in PAID_SECTIONS and not self.request.user.is_paid:
            return TheoryChapter.objects.none()
        return TheoryChapter.objects.filter(section__slug=section_slug)

    def list(self, request, *args, **kwargs):
        section_slug = self.kwargs['section_slug']
        if section_slug in PAID_SECTIONS and not request.user.is_paid:
            return Response(
                {'error': 'payment_required', 'message': 'Цей розділ доступний лише для оплачених акаунтів'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().list(request, *args, **kwargs)


class ChapterDetailView(generics.RetrieveAPIView):
    serializer_class = TheoryChapterDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        section_slug = self.kwargs['section_slug']
        if section_slug in PAID_SECTIONS and not self.request.user.is_paid:
            return None
        return TheoryChapter.objects.select_related('section').get(
            section__slug=section_slug,
            slug=self.kwargs['chapter_slug'],
        )

    def retrieve(self, request, *args, **kwargs):
        section_slug = self.kwargs['section_slug']
        if section_slug in PAID_SECTIONS and not request.user.is_paid:
            return Response(
                {'error': 'payment_required', 'message': 'Цей розділ доступний лише для оплачених акаунтів'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().retrieve(request, *args, **kwargs)
