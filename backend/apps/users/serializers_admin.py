from rest_framework import serializers
from .models import User


class AdminStudentListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    tests_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'is_paid', 'paid_until', 'is_active', 'created_at',
            'tests_count',
        ]

    def get_full_name(self, obj):
        name = f'{obj.first_name} {obj.last_name}'.strip()
        return name or obj.username


class AdminStudentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'is_paid', 'paid_until', 'is_active',
        ]
        read_only_fields = ['id', 'username', 'email']


class AdminStudentPaymentSerializer(serializers.Serializer):
    is_paid = serializers.BooleanField()
    paid_until = serializers.DateTimeField(required=False, allow_null=True)
