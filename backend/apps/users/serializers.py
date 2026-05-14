from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.testing.services import ALL_USER_CATS

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password', 'password_confirm',
                  'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'first_name', 'last_name',
                  'role', 'avatar', 'language', 'is_phone_verified', 'is_paid', 'paid_until',
                  'access_type', 'license_categories', 'created_at')
        read_only_fields = ('id', 'role', 'is_phone_verified', 'is_paid', 'paid_until',
                            'access_type', 'created_at')

    def validate_license_categories(self, value):
        if not value:
            raise serializers.ValidationError('Виберіть хоча б одну категорію')
        if not isinstance(value, list):
            raise serializers.ValidationError('Некоректний формат категорій')

        normalized = []
        for category in value:
            if not isinstance(category, str) or category not in ALL_USER_CATS:
                raise serializers.ValidationError('Недоступна категорія')
            if category not in normalized:
                normalized.append(category)
        return normalized


class UserDeviceSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    device_name = serializers.CharField(read_only=True)
    ip_address = serializers.IPAddressField(read_only=True)
    city = serializers.CharField(read_only=True)
    last_active = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
