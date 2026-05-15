from rest_framework import serializers

from .models import City


class CityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('id', 'name', 'slug', 'region')


class AdminCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('id', 'name', 'slug', 'region', 'is_active', 'order', 'created_at')
        read_only_fields = ('created_at',)
