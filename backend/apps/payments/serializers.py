from rest_framework import serializers

from .models import Tariff


class TariffListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tariff
        fields = ['id', 'name', 'description', 'price', 'duration_days',
                  'features', 'is_popular']
