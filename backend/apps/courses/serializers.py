from rest_framework import serializers
from .models import VideoCourse, VideoLesson


class VideoLessonListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLesson
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'duration_seconds', 'thumbnail', 'is_free']


class VideoLessonDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)

    class Meta:
        model = VideoLesson
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'duration_seconds', 'thumbnail', 'video_url',
                  'is_free', 'course_title', 'course_slug']


class VideoCourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoCourse
        fields = ['id', 'title', 'slug', 'description', 'icon',
                  'thumbnail', 'order', 'lessons_count']


class VideoCourseDetailSerializer(serializers.ModelSerializer):
    lessons = VideoLessonListSerializer(many=True, read_only=True)

    class Meta:
        model = VideoCourse
        fields = ['id', 'title', 'slug', 'description', 'icon',
                  'thumbnail', 'order', 'lessons_count', 'lessons']

    def get_lessons(self, obj):
        return obj.lessons.filter(is_active=True)
