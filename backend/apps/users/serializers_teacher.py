from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class TeacherStudentListSerializer(serializers.ModelSerializer):
    tests_count = serializers.IntegerField(read_only=True)
    tests_passed = serializers.IntegerField(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'avatar',
                  'access_type', 'is_paid', 'created_at', 'last_login',
                  'tests_count', 'tests_passed']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip() or obj.username


class TeacherStudentDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'avatar',
                  'access_type', 'is_paid', 'paid_until', 'created_at', 'last_login']

    def get_full_name(self, obj):
        return f'{obj.first_name} {obj.last_name}'.strip() or obj.username


class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'phone', 'avatar']
        read_only_fields = ['id', 'username']
