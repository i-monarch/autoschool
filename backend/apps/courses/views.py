from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import VideoCourse, VideoLesson, VideoProgress
from .serializers import (
    VideoCourseListSerializer,
    VideoCourseDetailSerializer,
    VideoLessonDetailSerializer,
)


class CourseListView(generics.ListAPIView):
    serializer_class = VideoCourseListSerializer
    queryset = VideoCourse.objects.filter(is_active=True)
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = VideoCourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return VideoCourse.objects.filter(is_active=True).prefetch_related(
            'lessons'
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Filter out inactive lessons, hide video_url for paid lessons if user is free
        filtered_lessons = []
        for lesson in data['lessons']:
            if not lesson.get('is_active', True):
                continue
            filtered_lessons.append(lesson)
        data['lessons'] = filtered_lessons

        # Add user progress
        if request.user.is_authenticated:
            progress = VideoProgress.objects.filter(
                user=request.user,
                lesson__course=instance,
            ).values('lesson_id', 'watched_seconds', 'completed')
            progress_map = {p['lesson_id']: p for p in progress}
            for lesson in data['lessons']:
                p = progress_map.get(lesson['id'])
                lesson['watched_seconds'] = p['watched_seconds'] if p else 0
                lesson['completed'] = p['completed'] if p else False

        return Response(data)


class LessonDetailView(generics.RetrieveAPIView):
    serializer_class = VideoLessonDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return VideoLesson.objects.select_related('course').get(
            course__slug=self.kwargs['course_slug'],
            slug=self.kwargs['lesson_slug'],
            is_active=True,
        )

    def retrieve(self, request, *args, **kwargs):
        lesson = self.get_object()

        if not lesson.is_free and not request.user.is_paid:
            return Response(
                {'error': 'payment_required', 'message': 'Цей урок доступний лише для оплачених акаунтів'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(lesson)
        data = serializer.data

        progress = VideoProgress.objects.filter(user=request.user, lesson=lesson).first()
        data['watched_seconds'] = progress.watched_seconds if progress else 0
        data['completed'] = progress.completed if progress else False

        return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_progress(request, course_slug, lesson_slug):
    try:
        lesson = VideoLesson.objects.get(
            course__slug=course_slug,
            slug=lesson_slug,
            is_active=True,
        )
    except VideoLesson.DoesNotExist:
        return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

    if not lesson.is_free and not request.user.is_paid:
        return Response({'error': 'payment_required'}, status=status.HTTP_403_FORBIDDEN)

    watched = request.data.get('watched_seconds', 0)
    completed = request.data.get('completed', False)

    progress, _ = VideoProgress.objects.update_or_create(
        user=request.user,
        lesson=lesson,
        defaults={'watched_seconds': watched, 'completed': completed},
    )

    return Response({
        'watched_seconds': progress.watched_seconds,
        'completed': progress.completed,
    })
