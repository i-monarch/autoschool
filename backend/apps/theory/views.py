from rest_framework import generics, permissions
from .models import TheorySection, TheoryChapter
from .serializers import (
    TheorySectionSerializer,
    TheoryChapterListSerializer,
    TheoryChapterDetailSerializer,
)


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
        return TheoryChapter.objects.filter(
            section__slug=self.kwargs['section_slug']
        )


class ChapterDetailView(generics.RetrieveAPIView):
    serializer_class = TheoryChapterDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return TheoryChapter.objects.select_related('section').get(
            section__slug=self.kwargs['section_slug'],
            slug=self.kwargs['chapter_slug'],
        )
