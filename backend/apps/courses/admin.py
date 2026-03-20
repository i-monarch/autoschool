from django.contrib import admin
from .models import VideoCourse, VideoLesson, VideoProgress


class VideoLessonInline(admin.TabularInline):
    model = VideoLesson
    extra = 0
    fields = ('title', 'slug', 'order', 'duration_seconds', 'is_free', 'is_active')


@admin.register(VideoCourse)
class VideoCourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'order', 'lessons_count', 'is_active')
    list_editable = ('order', 'is_active')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [VideoLessonInline]


@admin.register(VideoLesson)
class VideoLessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'duration_seconds', 'is_free', 'is_active')
    list_filter = ('course', 'is_free', 'is_active')
    list_editable = ('order', 'is_free', 'is_active')


@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'watched_seconds', 'completed')
    list_filter = ('completed',)
    raw_id_fields = ('user', 'lesson')
