from django.contrib import admin
from .models import TheorySection, TheoryChapter


@admin.register(TheorySection)
class TheorySectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'order', 'chapters_count']


@admin.register(TheoryChapter)
class TheoryChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'section', 'number', 'order']
    list_filter = ['section']
