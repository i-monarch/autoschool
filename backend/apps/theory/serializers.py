from rest_framework import serializers
from .models import TheorySection, TheoryChapter


class TheorySectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheorySection
        fields = ['id', 'title', 'slug', 'description', 'icon', 'order', 'chapters_count']


class TheoryChapterListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheoryChapter
        fields = ['id', 'title', 'slug', 'number', 'order']


class TheoryChapterDetailSerializer(serializers.ModelSerializer):
    section_title = serializers.CharField(source='section.title', read_only=True)
    section_slug = serializers.CharField(source='section.slug', read_only=True)

    class Meta:
        model = TheoryChapter
        fields = ['id', 'title', 'slug', 'number', 'content', 'order',
                  'section_title', 'section_slug']
