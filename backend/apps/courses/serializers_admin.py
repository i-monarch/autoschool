from rest_framework import serializers
from .models import VideoCourse, VideoLesson


class AdminCourseSerializer(serializers.ModelSerializer):
    lessons_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoCourse
        fields = ['id', 'title', 'slug', 'description', 'icon',
                  'thumbnail', 'order', 'is_active', 'lessons_count']
        read_only_fields = ['lessons_count']


class AdminCourseReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())


class AdminLessonListSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = VideoLesson
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'duration_seconds', 'thumbnail', 'video_url',
                  'is_free', 'is_active', 'course', 'course_title']


class AdminLessonDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = VideoLesson
        fields = ['id', 'title', 'slug', 'description', 'order',
                  'duration_seconds', 'thumbnail', 'video_url',
                  'is_free', 'is_active', 'course', 'course_title']


class AdminLessonReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())
