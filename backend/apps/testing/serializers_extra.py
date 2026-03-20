from rest_framework import serializers
from .models import SavedQuestion, QuestionComment
from .serializers import QuestionWithExplanationSerializer


class SavedQuestionSerializer(serializers.ModelSerializer):
    question = QuestionWithExplanationSerializer(read_only=True)

    class Meta:
        model = SavedQuestion
        fields = ['id', 'question', 'created_at']


class SavedQuestionToggleSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()


class QuestionCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = QuestionComment
        fields = ['id', 'user_name', 'text', 'created_at']

    def get_user_name(self, obj):
        name = obj.user.get_full_name()
        if name:
            return name
        return obj.user.username


class QuestionCommentCreateSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=2000)


class LeaderboardEntrySerializer(serializers.Serializer):
    position = serializers.IntegerField()
    user_id = serializers.IntegerField()
    first_name = serializers.CharField()
    total_correct = serializers.IntegerField()
    total_answers = serializers.IntegerField()
    accuracy_percent = serializers.IntegerField()
