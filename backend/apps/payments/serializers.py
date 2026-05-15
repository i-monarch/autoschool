from rest_framework import serializers

from .models import Subscription, Tariff


class TariffListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ['id', 'name', 'description', 'price', 'duration_days', 'user_type',
                  'features', 'is_popular']


class SubscriptionSerializer(serializers.ModelSerializer):
    tariff = TariffListSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'tariff', 'started_at', 'expires_at', 'is_active',
                  'payment_status', 'created_at']


class SubscribeRequestSerializer(serializers.Serializer):
    tariff_id = serializers.IntegerField()
