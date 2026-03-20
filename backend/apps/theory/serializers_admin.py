from rest_framework import serializers
from .models import TheorySection, TheoryChapter


class AdminSectionSerializer(serializers.ModelSerializer):
    chapters_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TheorySection
        fields = ['id', 'title', 'slug', 'description', 'icon', 'order', 'chapters_count']
        read_only_fields = ['chapters_count']


class AdminSectionReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())


class AdminChapterListSerializer(serializers.ModelSerializer):
    section_title = serializers.CharField(source='section.title', read_only=True)

    class Meta:
        model = TheoryChapter
        fields = ['id', 'title', 'slug', 'number', 'order', 'section', 'section_title']


class AdminChapterDetailSerializer(serializers.ModelSerializer):
    section_title = serializers.CharField(source='section.title', read_only=True)

    class Meta:
        model = TheoryChapter
        fields = ['id', 'title', 'slug', 'number', 'content', 'order',
                  'section', 'section_title']


class AdminChapterReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())
