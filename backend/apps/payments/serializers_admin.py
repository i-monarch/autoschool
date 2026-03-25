from rest_framework import serializers

from .models import Tariff


class AdminTariffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ['id', 'name', 'description', 'price', 'duration_days',
                  'features', 'is_popular', 'is_active', 'order',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AdminTariffReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(child=serializers.IntegerField())
