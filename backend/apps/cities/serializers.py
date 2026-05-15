from rest_framework import serializers

from .models import City


class CityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('id', 'name', 'slug', 'region')
