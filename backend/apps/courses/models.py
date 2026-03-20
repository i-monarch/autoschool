from django.conf import settings
from django.db import models


class VideoCourse(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Lucide icon name')
    thumbnail = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    lessons_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

    def update_lessons_count(self):
        self.lessons_count = self.lessons.count()
        self.save(update_fields=['lessons_count'])


class VideoLesson(models.Model):
    course = models.ForeignKey(VideoCourse, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_seconds = models.PositiveIntegerField(default=0, help_text='Duration in seconds')
    thumbnail = models.URLField(blank=True)
    video_url = models.URLField(blank=True, help_text='HLS or direct video URL')
    is_free = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ['course', 'slug']

    def __str__(self):
        return f'{self.course.title} — {self.title}'


class VideoProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    lesson = models.ForeignKey(VideoLesson, on_delete=models.CASCADE, related_name='progress')
    watched_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'lesson']

    def __str__(self):
        return f'{self.user} — {self.lesson.title}'
