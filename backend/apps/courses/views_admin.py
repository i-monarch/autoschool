from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import VideoCourse, VideoLesson
from .serializers_admin import (
    AdminCourseSerializer,
    AdminCourseReorderSerializer,
    AdminLessonListSerializer,
    AdminLessonDetailSerializer,
    AdminLessonReorderSerializer,
)


# --- Courses ---

class AdminCourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCourseSerializer
    queryset = VideoCourse.objects.all()
    pagination_class = None

    def perform_create(self, serializer):
        max_order = VideoCourse.objects.count()
        serializer.save(order=max_order)


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminCourseSerializer
    queryset = VideoCourse.objects.all()


class AdminCourseReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminCourseReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        for i, course_id in enumerate(ser.validated_data['ordered_ids']):
            VideoCourse.objects.filter(id=course_id).update(order=i)
        return Response({'status': 'ok'})


# --- Lessons ---

class AdminLessonListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminLessonListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = VideoLesson.objects.select_related('course').all()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs


class AdminLessonCreateView(generics.CreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminLessonDetailSerializer

    def perform_create(self, serializer):
        lesson = serializer.save()
        lesson.course.update_lessons_count()


class AdminLessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminLessonDetailSerializer
    queryset = VideoLesson.objects.select_related('course')

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        course = instance.course
        instance.delete()
        course.update_lessons_count()


class AdminLessonReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminLessonReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        for i, lesson_id in enumerate(ser.validated_data['ordered_ids']):
            VideoLesson.objects.filter(id=lesson_id).update(order=i)
        return Response({'status': 'ok'})


# --- Stats ---

class AdminCoursesStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        courses = VideoCourse.objects.values('id', 'title', 'lessons_count', 'is_active')
        return Response({
            'total_courses': VideoCourse.objects.count(),
            'total_lessons': VideoLesson.objects.count(),
            'courses': list(courses),
        })
