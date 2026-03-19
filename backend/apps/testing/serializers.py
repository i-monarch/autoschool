from rest_framework import serializers
from .models import TestCategory, Question, Answer, TestAttempt, AttemptAnswer


class TestCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCategory
        fields = ['id', 'name', 'slug', 'order', 'question_count']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'order']


class AnswerWithCorrectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'order', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'number', 'text', 'image', 'category', 'category_name', 'answers']


class QuestionWithExplanationSerializer(serializers.ModelSerializer):
    answers = AnswerWithCorrectSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'number', 'text', 'image', 'explanation', 'category', 'category_name', 'answers']


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer_id = serializers.IntegerField(allow_null=True)


class StartTestSerializer(serializers.Serializer):
    test_type = serializers.ChoiceField(choices=['topic', 'exam', 'marathon'])
    category_id = serializers.IntegerField(required=False, allow_null=True)


class AttemptAnswerSerializer(serializers.ModelSerializer):
    question = QuestionWithExplanationSerializer(read_only=True)
    selected_answer_id = serializers.IntegerField(source='selected_answer.id', read_only=True, allow_null=True)

    class Meta:
        model = AttemptAnswer
        fields = ['question', 'selected_answer_id', 'is_correct']


class TestAttemptSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    percent = serializers.SerializerMethodField()

    class Meta:
        model = TestAttempt
        fields = ['id', 'test_type', 'category', 'category_name', 'started_at',
                  'finished_at', 'score', 'total', 'is_passed', 'percent']

    def get_percent(self, obj):
        if obj.total == 0:
            return 0
        return round(obj.score / obj.total * 100)


class TestAttemptDetailSerializer(TestAttemptSerializer):
    answers = AttemptAnswerSerializer(many=True, read_only=True)

    class Meta(TestAttemptSerializer.Meta):
        fields = TestAttemptSerializer.Meta.fields + ['answers']
