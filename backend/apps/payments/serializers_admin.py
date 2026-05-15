from rest_framework import serializers

from .models import Subscription, Tariff


class AdminTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ['id', 'name', 'description', 'price', 'duration_days', 'user_type',
                  'features', 'is_popular', 'is_active', 'order',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AdminTariffReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())


class AdminSubscriptionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    tariff_name = serializers.CharField(source='tariff.name', read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'user', 'user_id', 'user_username', 'user_email',
                  'tariff', 'tariff_name', 'started_at', 'expires_at',
                  'is_active', 'payment_status', 'created_at', 'updated_at']
        read_only_fields = ['started_at', 'created_at', 'updated_at']
