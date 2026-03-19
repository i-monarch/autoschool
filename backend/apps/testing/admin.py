from django.contrib import admin
from .models import TestCategory, Question, Answer, Test, TestAttempt


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0


@admin.register(TestCategory)
class TestCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'question_count']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['number', 'short_text', 'category', 'has_image']
    list_filter = ['category']
    search_fields = ['text', 'number']
    inlines = [AnswerInline]

    def short_text(self, obj):
        return obj.text[:80]
    short_text.short_description = 'Text'

    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'test_type', 'score', 'total', 'is_passed', 'started_at']
    list_filter = ['test_type', 'is_passed']
